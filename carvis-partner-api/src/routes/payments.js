import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * MOCK IYZICO/STRIPE INTEGRATION
 * In production, you would use the official iyzico Node.js SDK here:
 * import Iyzipay from 'iyzipay';
 */

// 1. Initialize Payment (Hold funds in Escrow)
router.post('/checkout', requireAuth, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { requestId, providerId, amount } = req.body;

        if (!requestId || !providerId || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Calculate fees (15% platform fee)
        const platformFee = amount * 0.15;
        const providerEarning = amount - platformFee;

        // MOCK: Call Iyzico API to hold funds (3D secure)
        // const iyzicoResponse = await Iyzipay.checkoutFormInitialize.create({...});
        
        // Save pending payment to Database
        const { data: payment, error } = await supabase
            .from('payments')
            .insert([{
                request_id: requestId,
                customer_id: customerId,
                provider_id: providerId,
                amount: amount,
                platform_fee: platformFee,
                provider_earning: providerEarning,
                status: 'escrow', // Funds held safely
                provider_type: 'iyzico_mock',
                transaction_id: `TRX-${Date.now()}`
            }])
            .select()
            .single();

        if (error) throw error;

        // Update service request status to 'paid'
        await supabase
            .from('service_requests')
            .update({ status: 'in_progress', payment_status: 'escrow' })
            .eq('id', requestId);

        res.status(200).json({
            success: true,
            message: 'Payment securely held in escrow',
            payment
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Checkout failed', details: error.message });
    }
});

// 2. Release Funds (Payout to Provider)
router.post('/:paymentId/release', requireAuth, async (req, res) => {
    try {
        // In a real app, verify that req.user has admin privileges or the customer confirms completion
        const { paymentId } = req.params;

        // Get payment details
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (fetchError || !payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        if (payment.status !== 'escrow') {
            return res.status(400).json({ error: `Payment is not in escrow status (current: ${payment.status})` });
        }

        // MOCK: Call Iyzico API to approve marketplace item (transfer funds to sub-merchant)
        // await Iyzipay.approval.create({ paymentTransactionId: ... });

        // Update Payment Status
        const { error: updateError } = await supabase
            .from('payments')
            .update({ status: 'released', updated_at: new Date() })
            .eq('id', paymentId);

        if (updateError) throw updateError;

        // Add funds to Provider's Wallet
        // First check if wallet exists
        let { data: wallet } = await supabase
            .from('wallets')
            .select('id, balance')
            .eq('profile_id', payment.provider_id)
            .single();

        // Create wallet if it doesn't exist
        if (!wallet) {
            const { data: newWallet } = await supabase
                .from('wallets')
                .insert([{ profile_id: payment.provider_id, balance: 0 }])
                .select()
                .single();
            wallet = newWallet;
        }

        // Update Wallet Balance
        const newBalance = parseFloat(wallet.balance) + parseFloat(payment.provider_earning);
        await supabase
            .from('wallets')
            .update({ balance: newBalance, updated_at: new Date() })
            .eq('id', wallet.id);

        // Record Transaction
        await supabase
            .from('wallet_transactions')
            .insert([{
                wallet_id: wallet.id,
                amount: payment.provider_earning,
                type: 'credit',
                description: `Hakediş: İşlem ${payment.transaction_id}`,
                reference_id: payment.id
            }]);

        res.status(200).json({
            success: true,
            message: 'Funds released to provider successfully',
            amount: payment.provider_earning
        });
    } catch (error) {
        console.error('Release error:', error);
        res.status(500).json({ error: 'Fund release failed', details: error.message });
    }
});

export default router;
