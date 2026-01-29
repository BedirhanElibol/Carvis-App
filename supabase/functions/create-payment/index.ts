import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { orderId } = await req.json()

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock successful payment
        // In production, integrate Iyzico/Stripe here
        const paymentResult = {
            success: true,
            transactionId: "tr_" + Math.random().toString(36).substr(2, 9),
            amount: 1500.00,
            currency: "TRY"
        };

        return new Response(
            JSON.stringify(paymentResult),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
