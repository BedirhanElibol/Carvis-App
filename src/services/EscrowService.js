import { supabase } from "../supabaseClient";

export const calculateEscrowFee = (amount) => {
  // %1.5 komisyon, minimum 50 TL, maksimum 1000 TL
  const fee = amount * 0.015;
  if (fee < 50) return 50;
  if (fee > 1000) return 1000;
  return fee;
};

/**
 * RAPIDSY CORPORATE ESCROW SERVICE
 * Manages blocked payments and proof-of-service verification.
 */
export const EscrowService = {
  /**
   * Block funds for an order (Vault deposit)
   */
  async blockFunds(orderId, amount) {
    const { data, error } = await supabase
      .from("escrow_vault")
      .insert([{ order_id: orderId, amount, status: "blocked" }])
      .select()
      .single();

    return { success: !error, data, error };
  },

  /**
   * Submit Proof of Work (Partner action)
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
   * Release funds from vault (Customer action or Auto-completion)
   */
  async releaseFunds(orderId, currentUserId) {
    if (!currentUserId) return { success: false, error: "Güvenlik İhlali: Oturum bilgisi bulunamadı." };

    // Fetch order to verify ownership securely on server-side logic wrapper
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order || order.customer_id !== currentUserId) {
      return { success: false, error: "Güvenlik İhlali: Bu işleme yetkiniz yok." };
    }

    const { data: vault, error: vaultError } = await supabase
      .from("escrow_vault")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "blocked")
      .single();

    if (vaultError || !vault) return { success: false, error: "Bloke ödeme bulunamadı." };

    // 1. Mark vault as released
    const { error: releaseError } = await supabase
      .from("escrow_vault")
      .update({ status: "released", updated_at: new Date().toISOString() })
      .eq("id", vault.id);

    if (releaseError) return { success: false, error: "Bloke çözülemedi." };

    // 2. Mark proof as approved
    await supabase
      .from("service_proofs")
      .update({ is_approved: true })
      .eq("order_id", orderId);

    // 3. Complete order
    const { error: rpcError } = await supabase.rpc('rpc_release_escrow', { 
      p_order_id: orderId, 
      p_user_id: currentUserId 
    });

    return { success: !rpcError, error: rpcError?.message };
  }
};
