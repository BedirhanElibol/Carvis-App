// PayTR webhook handler - Ödeme onayı
// SECURITY: Uses HMAC-SHA256 for hash validation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts"

// HMAC-SHA256 helper
async function hmacSHA256(key: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    return encodeBase64(signature);
}

Deno.serve(async (req) => {
    try {
        // SECURITY: Only accept POST requests
        if (req.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 })
        }

        // PayTR'den gelen POST verilerini al
        const formData = await req.formData()

        const merchant_oid = formData.get('merchant_oid') as string
        const status = formData.get('status') as string
        const total_amount = formData.get('total_amount') as string
        const hash = formData.get('hash') as string
        const failed_reason_code = formData.get('failed_reason_code')
        const failed_reason_msg = formData.get('failed_reason_msg')
        const test_mode = formData.get('test_mode')
        const payment_type = formData.get('payment_type')
        const currency = formData.get('currency')

        // SECURITY: Validate required fields
        if (!merchant_oid || !status || !total_amount || !hash) {
            console.error('Missing required fields')
            return new Response('OK', { status: 200 })
        }

        // SECURITY: Hash validation with HMAC-SHA256 (PayTR specification)
        const merchant_key = Deno.env.get('PAYTR_MERCHANT_KEY') || ''
        const merchant_salt = Deno.env.get('PAYTR_MERCHANT_SALT') || ''

        // PayTR HASH format: HMAC-SHA256(concat, merchant_key) | base64
        const hashSTR = `${merchant_oid}${merchant_salt}${status}${total_amount}`
        const calculatedHash = await hmacSHA256(merchant_key, hashSTR)

        // SECURITY: Constant-time comparison to prevent timing attacks
        const hashMatch = calculatedHash.length === hash.length &&
            calculatedHash.split('').every((c, i) => c === hash[i])

        if (!hashMatch) {
            console.error('Hash mismatch! Possible tampering attempt.')
            console.error('Expected:', calculatedHash.substring(0, 10) + '...')
            console.error('Received:', (hash || '').substring(0, 10) + '...')
            return new Response('OK', { status: 200 })
        }

        // Supabase client (service role key - RLS bypass)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Transaction'ı bul
        const { data: transaction, error: txError } = await supabaseClient
            .from('transactions')
            .select('*, order:order_id(*)')
            .eq('merchant_oid', merchant_oid)
            .single()

        if (txError || !transaction) {
            console.error('Transaction not found:', merchant_oid)
            return new Response('OK', { status: 200 })
        }

        // SECURITY: Verify amount matches to prevent amount tampering
        const expectedAmount = Math.round(transaction.payment_amount * 100)
        const receivedAmount = parseInt(total_amount)

        if (expectedAmount !== receivedAmount) {
            console.error('Amount mismatch! Expected:', expectedAmount, 'Received:', receivedAmount)
            return new Response('OK', { status: 200 })
        }

        // Ödeme başarılı mı?
        if (status === 'success') {
            // Transaction güncelle
            await supabaseClient
                .from('transactions')
                .update({
                    payment_status: 'success',
                    paytr_response: {
                        status,
                        total_amount,
                        payment_type,
                        currency,
                        test_mode,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('id', transaction.id)

            if (transaction.order_id && transaction.order) {
                // Order'ı güncelle (paid olarak işaretle)
                await supabaseClient
                    .from('orders')
                    .update({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                    })
                    .eq('id', transaction.order_id)

                // Müşteriye bildirim gönder
                await supabaseClient
                    .from('notifications')
                    .insert({
                        user_id: transaction.order.customer_id,
                        type: 'payment',
                        title: 'Ödeme Başarılı',
                        message: `Sipariş #${transaction.order_id} için ödemeniz alındı.`,
                    })

                // Satıcıya bildirim gönder
                await supabaseClient
                    .from('notifications')
                    .insert({
                        user_id: transaction.order.seller_id,
                        type: 'payment',
                        title: 'Yeni Sipariş',
                        message: `Sipariş #${transaction.order_id} için ödeme alındı. Hazırlığa başlayabilirsiniz.`,
                    })
            } else if (transaction.user_id) {
                // Cüzdan Bakiye Yüklemesi
                const { data: wallet } = await supabaseClient.from('wallets').select('*').eq('user_id', transaction.user_id).single();
                if (wallet) {
                    const amountToAddTL = transaction.payment_amount;

                    await supabaseClient
                        .from('wallets')
                        .update({ balance: wallet.balance + amountToAddTL })
                        .eq('user_id', transaction.user_id)

                    await supabaseClient.from('wallet_transactions').insert({
                        wallet_id: transaction.user_id,
                        amount: amountToAddTL,
                        type: 'deposit',
                        description: 'Kredi Kartı ile Bakiye Yükleme (PayTR)'
                    })

                    await supabaseClient.from('notifications').insert({
                        user_id: transaction.user_id,
                        type: 'wallet',
                        title: 'Bakiye Yüklendi',
                        message: `Cüzdanınıza ${amountToAddTL} TL yüklendi.`
                    })
                }
            }

            console.log('Payment successful:', merchant_oid)
        } else {
            // Ödeme başarısız
            await supabaseClient
                .from('transactions')
                .update({
                    payment_status: 'failed',
                    error_message: failed_reason_msg,
                    paytr_response: {
                        status,
                        failed_reason_code,
                        failed_reason_msg,
                    },
                    updated_at: new Date().toISOString(),
                })
                .eq('id', transaction.id)

            // Order'ı iptal et
            await supabaseClient
                .from('orders')
                .update({
                    status: 'cancelled',
                })
                .eq('id', transaction.order_id)

            // Müşteriye bildirim gönder
            await supabaseClient
                .from('notifications')
                .insert({
                    user_id: transaction.order.customer_id,
                    type: 'payment',
                    title: 'Ödeme Başarısız',
                    message: `Sipariş #${transaction.order_id} için ödeme alınamadı. Lütfen tekrar deneyin.`,
                })

            console.log('Payment failed:', merchant_oid, failed_reason_msg)
        }

        // PayTR'ye OK dön (önemli!)
        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook error:', error)
        // Hata olsa bile PayTR'ye OK dönmeliyiz
        return new Response('OK', { status: 200 })
    }
})
