import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const { lat, lng, radius = 5000 } = body;

    const query = `
      [out:json][timeout:15];
      (
        node["shop"="car_repair"](around:${radius},${lat},${lng});
        way["shop"="car_repair"](around:${radius},${lat},${lng});
        node["amenity"="car_wash"](around:${radius},${lat},${lng});
        way["amenity"="car_wash"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Overpass API error: ${response.status}` }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
});
