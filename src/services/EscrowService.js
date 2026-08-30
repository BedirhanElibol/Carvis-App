import { supabase } from "../supabaseClient";

/**
 * CARVIS DIRECT MATCHMAKER SERVICE
 * Manages direct appointment confirmations and proof-of-service documentation.
 * Carvis holds NO funds and takes 0% commission.
 */
export const EscrowService = {
  /**
   * Confirm appointment (Direct payment between customer & partner)
   */
  async blockFunds(orderId, amount) {
    // Carvis does not hold or block funds. Payments are direct.
    return { 
      success: true, 
      data: { order_id: orderId, amount, status: "direct_payment_confirmed" }, 
      error: null 
    };
  },

  /**
   * Submit Proof of Work / Service Details (Partner action)
   */
  async submitProof(orderId, photoUrls, description) {
    const { data, error } = await supabase
      .from("service_proofs")
      .upsert([{ order_id: orderId, photo_urls: photoUrls, description }])
      .select()
      .single();

    return { success: !error, data, error };
  },

  /**
   * Confirm completion (Customer action)
   */
  async releaseFunds(orderId, currentUserId) {
    if (!currentUserId) return { success: false, error: "Güvenlik İhlali: Oturum bilgisi bulunamadı." };

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (orderError) return { success: false, error: "Randevu tamamlanamadı." };

    return { success: true, message: "Hizmet tamamlama onaylandı." };
  }
};

