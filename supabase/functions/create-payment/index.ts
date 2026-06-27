// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
// @ts-ignore
import { encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts"
// @ts-ignore
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

// @ts-ignore
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Security-Policy': "default-src 'none'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
}

const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

const paymentRequestSchema = z.object({
    orderId: z.string().nullable().optional(),
    amount: z.number().or(z.string().transform(Number)).optional()
});

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

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
        if (!checkRateLimit(ip)) {
            return new Response(JSON.stringify({ error: "Too many requests" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        const body = await req.json()

        const validationResult = paymentRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const orderId = validationResult.data.orderId ?? null
        const requestedAmount = validationResult.data.amount ?? 0

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

        let resolvedAmount = requestedAmount
        let customerEmail = "customer@carvis.com"
        let customerName = "Carvis User"
        let customerPhone = "05555555555"

        // If orderId is provided, fetch order details from database
        if (orderId) {
            const { data: order, error: orderError } = await supabaseClient
                .from('orders')
                .select('*, customer:customer_id(*)')
                .eq('id', orderId)
                .single()

            if (orderError || !order) {
                throw new Error('Sipariş bulunamadı: ' + (orderError?.message ?? ''))
            }

            resolvedAmount = Number(order.total_amount)
            if (order.customer) {
                customerEmail = order.customer.email || customerEmail
                customerName = order.customer.full_name || customerName
                customerPhone = order.customer.phone_number || customerPhone
            }
        } else {
            // Get user from auth header if no orderId
            const authHeader = req.headers.get('Authorization')
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
                if (!authError && user) {
                    customerEmail = user.email || customerEmail
                    const { data: profile } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()
                    if (profile) {
                        customerName = profile.full_name || customerName
                        customerPhone = profile.phone_number || customerPhone
                    }
                }
            }
        }

        if (resolvedAmount <= 0) {
            throw new Error('Geçersiz ödeme tutarı')
        }

        // PayTR Credentials
        const merchantId = Deno.env.get('PAYTR_MERCHANT_ID') || ''
        const merchantKey = Deno.env.get('PAYTR_MERCHANT_KEY') || ''
        const merchantSalt = Deno.env.get('PAYTR_MERCHANT_SALT') || ''
        const testMode = Deno.env.get('PAYTR_TEST_MODE') === '0' ? '0' : '1'
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

        // PayTR variables
        const merchant_oid = orderId ? `${orderId}_${crypto.randomUUID().split('-')[0]}` : `topup_${crypto.randomUUID()}`
        const user_ip = req.headers.get('x-real-ip') || '127.0.0.1'
        const payment_amount = Math.round(resolvedAmount * 100) // kurus format
        const user_basket = encodeBase64(JSON.stringify([
            [orderId ? "Sipariş Ödemesi" : "Cüzdan Yükleme", resolvedAmount.toString(), "1"]
        ]))
        const no_installment = '0' // 0 = taksit yapılabilir, 1 = tek çekim
        const max_installment = '12'
        const currency = 'TL'
        
        // Generate PayTR Token Signature
        // concat: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt
        const hashStr = `${merchantId}${user_ip}${merchant_oid}${customerEmail}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${testMode}${merchantSalt}`
        const paytr_token = await hmacSHA256(merchantKey, hashStr)

        // Insert pending transaction record
        const { data: { user }, error: userFetchError } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', '') || '');
        const actualUserId = user?.id || null;

        await supabaseClient
            .from('transactions')
            .insert({
                order_id: orderId || null,
                user_id: actualUserId,
                merchant_oid,
                payment_amount: resolvedAmount,
                payment_status: 'pending'
            })


        // Fallback for simulation if keys are missing
        if (!merchantId || !merchantKey || !merchantSalt) {
            console.warn('PayTR credentials are missing! Falling back to simulated iframe mode.')
            return new Response(
                JSON.stringify({
                    success: true,
                    simulated: true,
                    token: "simulated_token_" + crypto.randomUUID().split('-')[0],
                    iframeUrl: "about:blank"
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        }

        // Call PayTR API to get iframe token
        const paytrParams = new URLSearchParams()
        paytrParams.append('merchant_id', merchantId)
        paytrParams.append('user_ip', user_ip)
        paytrParams.append('merchant_oid', merchant_oid)
        paytrParams.append('email', customerEmail)
        paytrParams.append('payment_amount', payment_amount.toString())
        paytrParams.append('paytr_token', paytr_token)
        paytrParams.append('user_basket', user_basket)
        paytrParams.append('user_name', customerName)
        paytrParams.append('user_address', 'Turkey')
        paytrParams.append('user_phone', customerPhone || '05555555555')
        paytrParams.append('merchant_ok_url', `${appUrl}/app/wallet?status=success&oid=${merchant_oid}`)
        paytrParams.append('merchant_fail_url', `${appUrl}/app/wallet?status=failed&oid=${merchant_oid}`)
        paytrParams.append('no_installment', no_installment)
        paytrParams.append('max_installment', max_installment)
        paytrParams.append('currency', currency)
        paytrParams.append('test_mode', testMode)
        paytrParams.append('debug_on', '1')

        const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
            method: 'POST',
            body: paytrParams,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        const paytrData = await paytrResponse.json()

        if (paytrData.status === 'success') {
            return new Response(
                JSON.stringify({
                    success: true,
                    token: paytrData.token,
                    iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytrData.token}`
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                }
            )
        } else {
            throw new Error(`PayTR Token Error: ${paytrData.reason ?? 'Unknown'}`)
        }

    } catch (error: any) {
        console.error('Payment Error:', error)
        return new Response(
            JSON.stringify({ success: false, error: 'An error occurred during payment initialization.' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
