// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
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

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(userId);

    if (!record) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (now > record.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + WINDOW_MS });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

function sanitizeInput(str: string): string {
    if (!str) return str;
    return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}

const chatSchema = z.object({
    systemPrompt: z.string().optional(),
    message: z.string(),
    history: z.array(z.object({
        role: z.string(),
        text: z.string()
    })).optional(),
    isVision: z.boolean().optional(),
    imageParams: z.object({
        mimeType: z.string(),
        data: z.string()
    }).nullable().optional()
});

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

        if (!checkRateLimit(user.id)) {
            return new Response(JSON.stringify({ error: "Too many requests" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        // Get the request body
        const body = await req.json()

        // Validate input
        const validationResult = chatSchema.safeParse(body);
        if (!validationResult.success) {
            return new Response(JSON.stringify({ error: "Invalid input" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        let { systemPrompt, message, history = [], isVision = false, imageParams = null } = validationResult.data;

        // Sanitize string inputs
        message = sanitizeInput(message);
        if (systemPrompt) systemPrompt = sanitizeInput(systemPrompt);
        history = history?.map(msg => ({ role: msg.role, text: sanitizeInput(msg.text) })) || [];

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
            body: JSON.stringify({
                contents,
                generationConfig: {
                    maxOutputTokens: 500
                }
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Gemini API Error:', data.error);
            throw new Error('Failed to process AI request');
        }

        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Üzgünüm, cevap üretemedim."

        return new Response(
            JSON.stringify({ response: textResponse }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        // Do not leak stack traces or internal errors
        const errorMsg = error.message === 'Unauthorized' ? 'Unauthorized' : 'An error occurred processing your request.';
        const status = error.message === 'Unauthorized' ? 401 : 400;
        return new Response(
            JSON.stringify({ error: errorMsg }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
        )
    }
})
