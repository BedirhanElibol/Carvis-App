import { serve } from "std/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || Deno.env.get('VITE_GOOGLE_MAPS_API_KEY');
        if (!apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        // Just fixed coordinates and zoom for now, as in the frontend
        const googleUrl = `https://maps.googleapis.com/maps/api/staticmap?center=39.93,32.85&zoom=10&size=600x600&sensor=false&key=${apiKey}`;

        const response = await fetch(googleUrl);

        if (!response.ok) {
            throw new Error(`Google Maps API error: ${response.statusText}`);
        }

        const imageBuffer = await response.arrayBuffer();

        return new Response(imageBuffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, max-age=86400'
            },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})