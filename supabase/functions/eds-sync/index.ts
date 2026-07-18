import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase Client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Add CORS headers for browser requests (though this is meant to be a cron job)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Fetching live EDS map from EGM...");
    
    // Scrape the HTML directly from EGM
    const response = await fetch("https://onlineislemler.egm.gov.tr/trafik/Sayfalar/EDSHarita.aspx", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from EGM: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Received HTML size: ${html.length} bytes`);

    // Parse the embedded markers
    const regexFull = /["']Aciklama["']\s*:\s*['"]([^'"]+)['"].*?["']lat["']\s*:\s*['"]([^'"]+)['"]\s*,\s*["']lng["']\s*:\s*['"]([^'"]+)['"]/gs;
    let match;
    const points = [];
    
    while ((match = regexFull.exec(html)) !== null) {
      const aciklama = match[1];
      const lat = parseFloat(match[2]);
      const lng = parseFloat(match[3]);
      
      // Attempt to clean the Aciklama
      const titleParts = aciklama.split("/");
      const title = titleParts.length > 1 ? titleParts[1].trim() : aciklama;

      points.push({
        title: title.substring(0, 100),
        type: 'eds',
        lat: lat,
        lng: lng,
        city: 'istanbul', // The real EGM map currently only provides Istanbul data
        message: 'EGM Resmi EDS Noktası',
        user_id: null, // system generated
      });
    }

    console.log(`Successfully parsed ${points.length} EDS points from EGM.`);

    if (points.length === 0) {
      return new Response(
        JSON.stringify({ message: "No points parsed, HTML layout might have changed." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Step 1: Remove old EDS points for Istanbul to avoid massive duplication
    const { error: deleteError } = await supabase
      .from('road_alerts')
      .delete()
      .eq('type', 'eds')
      .eq('city', 'istanbul');

    if (deleteError) {
      console.error("Error clearing old EDS data:", deleteError);
      throw deleteError;
    }

    // Step 2: Insert the new live points in chunks to avoid payload limits
    const CHUNK_SIZE = 500;
    const insertPromises = [];
    for (let i = 0; i < points.length; i += CHUNK_SIZE) {
      const chunk = points.slice(i, i + CHUNK_SIZE);
      insertPromises.push(
        supabase
          .from('road_alerts')
          .insert(chunk)
          .then(({ error: insertError }) => {
            if (insertError) {
              console.error(`Error inserting chunk ${i}:`, insertError);
              throw insertError;
            }
          })
      );
    }

    // Wait for all chunks to be inserted concurrently
    await Promise.all(insertPromises);

    return new Response(
      JSON.stringify({ 
        message: "Successfully synchronized EDS data from EGM.", 
        count: points.length,
        source: "https://onlineislemler.egm.gov.tr/trafik/Sayfalar/EDSHarita.aspx"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("EDS Sync Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
