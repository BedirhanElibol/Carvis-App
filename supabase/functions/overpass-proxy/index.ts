import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      // Returning 200 with error payload to prevent browser network console red errors
      return new Response(JSON.stringify({ success: false, error: "Missing query" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "User-Agent": "RapidsyApp/1.0 (Contact: admin@rapidsy.com)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "data=" + encodeURIComponent(query),
    });

    if (!response.ok) {
      // Returning 200 with error payload to prevent browser network console red errors
      return new Response(JSON.stringify({ success: false, error: \`Overpass API returned \${response.status}: \${response.statusText}\` }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Returning 200 with error payload to prevent browser network console red errors
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
