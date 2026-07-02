import { LeadRepository } from '../repositories/lead.repository.js';
import { config } from '../config/config.js';

export class CampaignService {
    /**
     * Starts a non-overlapping loop to check and send messages.
     * Uses recursive setTimeout instead of setInterval to prevent blocking.
     * @param {Object} whatsappClient 
     */
    static startCampaignLoop(whatsappClient) {
        console.log(`🔄 Starting background campaign loop (checking every ${config.CAMPAIGN_INTERVAL_MS / 1000} seconds)...`);
        
        const loop = async () => {
            try {
                await CampaignService.processNextLead(whatsappClient);
            } catch (error) {
                console.error("⚠️ Error in campaign loop:", error.message || error);
            } finally {
                // Safely schedule the next execution regardless of success or failure
                setTimeout(loop, config.CAMPAIGN_INTERVAL_MS);
            }
        };

        // Initial trigger
        loop();
    }

    /**
     * Core business logic: Fetch active campaign, get lead, format message, send, update status.
     * @param {Object} whatsappClient 
     */
    static async processNextLead(whatsappClient) {
        // 1. Check if there is an active campaign
        const campaign = await LeadRepository.getActiveCampaign();
        if (!campaign) {
            return; // Silently skip
        }

        // 2. Fetch exactly 1 pending lead
        const lead = await LeadRepository.getNextPendingLead();
        if (!lead) {
            console.log("📭 No pending leads found in the database. Add more to continue.");
            return;
        }

        // 3. Format message safely
        // Fallbacks in case the template is missing placeholders
        const msgText = campaign.template_text.replace('{{company}}', lead.company_name);
        
        console.log(`📤 Sending message to ${lead.company_name} (${lead.phone_number})...`);
        
        // 4. Send message via WhatsApp
        // whatsapp-web.js requires phone number with @c.us suffix
        const chatId = `${lead.phone_number}@c.us`;
        
        try {
            await whatsappClient.sendMessage(chatId, msgText);
            
            // 5. Update Status on Success
            await LeadRepository.updateLeadStatus(lead.id, 'contacted');
            console.log(`✅ Message sent to ${lead.company_name}.`);
        } catch (sendError) {
            console.error(`❌ Failed to send message to ${lead.company_name}:`, sendError.message);
            // Optionally, mark as failed so it doesn't block the queue forever
            await LeadRepository.updateLeadStatus(lead.id, 'failed');
        }
    }
}
