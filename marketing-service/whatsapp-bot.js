import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY are required in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('==================================================================');
    console.log('📲 SCAN THIS QR CODE WITH YOUR WHATSAPP (Use a secondary number):');
    console.log('==================================================================');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bot is READY and Connected!');
    startCampaignLoop();
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Bot was disconnected', reason);
});

// Sends messages periodically
async function startCampaignLoop() {
    console.log("🔄 Starting background campaign loop (checking every 2.5 minutes)...");
    
    setInterval(async () => {
        try {
            // Check if there is an active campaign
            const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('is_active', true).single();
            if (!campaign) {
                return; // Silently skip if no active campaign
            }

            // Fetch 1 pending lead
            const { data: leads } = await supabase.from('whatsapp_leads').select('*').eq('status', 'pending').limit(1);
            
            if (leads && leads.length > 0) {
                const lead = leads[0];
                const msgText = campaign.template_text.replace('{{company}}', lead.company_name);
                
                console.log(`📤 Sending message to ${lead.company_name} (${lead.phone_number})...`);
                
                // whatsapp-web.js requires phone number with @c.us suffix
                const chatId = `${lead.phone_number}@c.us`;
                
                await client.sendMessage(chatId, msgText);
                
                // Update status
                await supabase.from('whatsapp_leads').update({
                    status: 'contacted',
                    last_contacted_at: new Date().toISOString()
                }).eq('id', lead.id);

                console.log(`✅ Message sent to ${lead.company_name}.`);
            } else {
                 console.log("📭 No pending leads found in the database. Add more to continue.");
            }
            
        } catch (error) {
            console.error("⚠️ Error in campaign loop:", error.message);
        }
    }, 150000); // 2.5 minutes interval check (150000 ms)
}

client.initialize();
