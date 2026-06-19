// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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

        // Get the request body
        const body = await req.json()
        const { systemPrompt, message, history = [], isVision = false, imageParams = null } = body

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            throw new Error('Server configuration error (API Key missing)')
        }

        // Construct Gemini request payload
        let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
        let contents = []

        if (isVision && imageParams) {
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`
            contents = [
                {
                    role: "user",
                    parts: [
                        { text: systemPrompt ? `${systemPrompt}\n\n${message}` : message },
                        { inline_data: { mime_type: imageParams.mimeType, data: imageParams.data } }
                    ]
                }
            ]
        } else {
            // Text only chat
            if (systemPrompt) {
                contents.push({ role: "user", parts: [{ text: systemPrompt }] })
                contents.push({ role: "model", parts: [{ text: "Anladım. Size nasıl yardımcı olabilirim?" }] })
            }
            
            // Map history
            history.forEach((msg: any) => {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })
            })

            // Add latest message
            contents.push({ role: "user", parts: [{ text: message }] })
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Gemini API Error:', data.error?.message || 'Unknown API Error')
            throw new Error('Failed to call Gemini API')
        }

        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Üzgünüm, cevap üretemedim."

        return new Response(
            JSON.stringify({ response: textResponse }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
