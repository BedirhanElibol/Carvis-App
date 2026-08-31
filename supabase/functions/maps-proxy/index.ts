// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

// @ts-ignore
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Authenticate the user calling the function
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Unauthorized')
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
        if (!apiKey) {
            throw new Error('Server configuration error (API Key missing)')
        }

        // Construct Google Maps URL
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=39.93,32.85&zoom=10&size=600x600&sensor=false&key=${apiKey}`

        // Fetch the image from Google Maps
        const response = await fetch(mapUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch from Google Maps: ${response.status} ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const base64 = encode(arrayBuffer)
        const dataUrl = `data:image/png;base64,${base64}`

        return new Response(JSON.stringify({ mapUrl: dataUrl }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=86400'
            },
            status: 200
        })

    } catch (error: any) {
        console.error('Maps Proxy Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
