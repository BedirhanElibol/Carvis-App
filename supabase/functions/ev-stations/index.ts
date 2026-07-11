import { serve } from "std/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lng, distance } = await req.json()

    if (!lat || !lng) {
      throw new Error('lat and lng are required')
    }

    const OPEN_CHARGE_MAP_KEY = Deno.env.get('OPEN_CHARGE_MAP_KEY')

    if (!OPEN_CHARGE_MAP_KEY) {
      throw new Error('Missing OpenChargeMap API key in environment variables')
    }

    const response = await fetch(
      `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${distance || 10}&maxresults=10&key=${OPEN_CHARGE_MAP_KEY}`,
      {
        headers: {
          "User-Agent": "RapidsyApp/1.0",
        },
      }
    )

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
