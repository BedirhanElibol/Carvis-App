import { supabase } from '../config/supabaseClient.js';
import { z } from 'zod';

// Zod schema for lead validation
export const LeadSchema = z.object({
    company_name: z.string().min(2),
    phone_number: z.string().min(10),
    category: z.string().optional(),
    status: z.enum(['pending', 'contacted', 'failed']).default('pending'),
});

export class LeadRepository {
    /**
     * Gets the currently active campaign.
     * @returns {Promise<Object|null>}
     */
    static async getActiveCampaign() {
        const { data, error } = await supabase
            .from('whatsapp_campaigns')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No active campaign found
            throw new Error(`Database error fetching campaign: ${error.message}`);
        }

        return data;
    }

    /**
     * Gets a single pending lead.
     * @returns {Promise<Object|null>}
     */
    static async getNextPendingLead() {
        const { data, error } = await supabase
            .from('whatsapp_leads')
            .select('*')
            .eq('status', 'pending')
            .limit(1);

        if (error) throw new Error(`Database error fetching leads: ${error.message}`);
        return data && data.length > 0 ? data[0] : null;
    }

    /**
     * Updates the status of a lead.
     * @param {number|string} id 
     * @param {string} status 
     */
    static async updateLeadStatus(id, status) {
        const { error } = await supabase
            .from('whatsapp_leads')
            .update({
                status,
                last_contacted_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw new Error(`Database error updating lead ${id}: ${error.message}`);
    }

    /**
     * Inserts a batch of leads, validating them first.
     * @param {Array<Object>} leads 
     * @returns {Promise<void>}
     */
    static async insertLeads(leads) {
        await Promise.all(leads.map(async (lead) => {
            try {
                // Validate at boundary
                const validLead = LeadSchema.parse(lead);
                
                const { error } = await supabase
                    .from('whatsapp_leads')
                    .insert([validLead]);
                
                if (error) {
                    if (error.code !== '23505') { // Ignore unique constraint errors
                        console.error(`Error inserting lead ${validLead.company_name}:`, error.message);
                    } else {
                        console.log(`Skipped existing lead: ${validLead.company_name}`);
                    }
                } else {
                    console.log(`Inserted: ${validLead.company_name}`);
                }
            } catch (validationError) {
                console.error(`Validation failed for lead:`, validationError.errors || validationError.message);
            }
        }));
    }
}
