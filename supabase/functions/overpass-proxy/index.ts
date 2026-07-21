// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
        const { lat, lng, radius } = await req.json();

        if (!lat || !lng || !radius) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const query = `
          [out:json][timeout:15];
          (
            node["amenity"="car_wash"](around:${radius},${lat},${lng});
            way["amenity"="car_wash"](around:${radius},${lat},${lng});
            relation["amenity"="car_wash"](around:${radius},${lat},${lng});
            node["shop"="car_repair"](around:${radius},${lat},${lng});
            way["shop"="car_repair"](around:${radius},${lat},${lng});
            relation["shop"="car_repair"](around:${radius},${lat},${lng});
            node["amenity"="fuel"](around:${radius},${lat},${lng});
            way["amenity"="fuel"](around:${radius},${lat},${lng});
            relation["amenity"="fuel"](around:${radius},${lat},${lng});
          );
          out center;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: 'data=' + encodeURIComponent(query),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            console.error(`Overpass API Error: ${response.status}`);
            return new Response(JSON.stringify({ success: false, error: `Overpass API returned status ${response.status}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 // Return 200 to prevent browser console errors
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Proxy Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 // Return 200 to prevent browser console errors
        });
    }
})