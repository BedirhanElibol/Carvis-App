import { supabase } from "../supabaseClient";

/**
 * Service for Rapidsy Assurance (Güvence) and Recourse operations
 */
export const AssuranceService = {
  /**
   * Calculates the assurance fee based on the order total
   * @param {number} totalAmount - Total cost of the services
   */
  calculateAssuranceFee(totalAmount) {
    if (!totalAmount || totalAmount <= 0) return 0;
    // Premium is 2% of the order value, capped at a minimum of 20 TL and maximum of 250 TL
    const fee = totalAmount * 0.02;
    return Math.max(20, Math.min(250, Math.round(fee)));
  },

  /**
   * Files a new damage claim under the assurance fund
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
            claim_status: "pending"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error submitting assurance claim:", error);
      return { data: null, error };
    }
  },

  /**
   * Approves a claim, pays out the customer immediately, and triggers recourse to the partner
   */
  async approveClaimAndTriggerRecourse(claimId, payoutAmount) {
    try {
      // 1. Update the claim to approved and set recourse amount
      const { data: claim, error: claimError } = await supabase
        .from("assurance_claims")
        .update({
          claim_status: "recoursed_to_partner",
          payout_amount: payoutAmount,
          recourse_amount: payoutAmount, // Direct 100% recourse to the partner
          recourse_status: "pending_collection",
          updated_at: new Date().toISOString()
        })
        .eq("id", claimId)
        .select()
        .single();

      if (claimError) throw claimError;

      // 2. Perform mahsuplaşma (deduct from seller/partner pending balance)
      // In production, this would trigger an ERP/accounting ledger entry.
      // E.g., subtracting from their pending payout queue.

      return { data: claim, error: null };
    } catch (error) {
      console.error("Error approving claim and triggering recourse:", error);
      return { data: null, error };
    }
  }
};
