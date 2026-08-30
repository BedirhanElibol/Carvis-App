import { supabase } from "../supabaseClient";

/**
 * Service for Rapidsy Assurance (Güvence) and Recourse operations
 */
export const AssuranceService = {
  /**
   * Calculates assurance fee - Always 0 TL in Carvis SaaS model (%0 Komisyon)
   */
  calculateAssuranceFee() {
    return 0;
  },

  /**
   * Files a direct partner notification report for quality feedback
   */
  async submitClaim(claimData) {
    try {
      const { data, error } = await supabase
        .from("assurance_claims")
        .insert([
          {
            order_id: claimData.orderId,
            customer_id: claimData.customerId,
            seller_id: claimData.sellerId,
            reported_damage_desc: claimData.description,
            damage_images: claimData.images || [],
            claim_status: "notified_to_partner"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error logging partner feedback:", error);
      return { data: null, error };
    }
  },

  async approveClaimAndTriggerRecourse(claimId) {
    return { data: { id: claimId, claim_status: "closed" }, error: null };
  }
};
