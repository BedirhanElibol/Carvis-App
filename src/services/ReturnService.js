import { supabase } from "../supabaseClient";

/**
 * Service for İade & İptal Yönetimi (Return & Cancellation Management)
 */
export const ReturnService = {
  /**
   * Customer requests a return for a completed order
   */
  async requestReturn({ orderId, customerId, sellerId, reason, description, evidenceUrls }) {
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .insert([{
          order_id: orderId,
          customer_id: customerId,
          seller_id: sellerId,
          reason,
          description: description || "",
          evidence_urls: evidenceUrls || [],
          status: "pending"
        }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Bu sipariş için zaten bir iade talebi oluşturulmuş.");
        }
        throw error;
      }
      return { data, error: null };
    } catch (error) {
      console.error("Error requesting return:", error);
      return { data: null, error };
    }
  },

  /**
   * Seller approves a return request and triggers escrow refund
   */
  async approveReturn(returnId, orderId, refundAmount) {
    try {
      // 1. Update return request status
      const { data, error } = await supabase
        .from("return_requests")
        .update({
          status: "approved",
          refund_amount: refundAmount,
          resolved_at: new Date().toISOString()
        })
        .eq("id", returnId)
        .select()
        .single();

      if (error) throw error;

      // 2. Update order status to refunded
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      return { data, error: null };
    } catch (error) {
      console.error("Error approving return:", error);
      return { data: null, error };
    }
  },

  /**
   * Seller rejects a return request with reason
   */
  async rejectReturn(returnId, rejectionReason) {
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          resolved_at: new Date().toISOString()
        })
        .eq("id", returnId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error rejecting return:", error);
      return { data: null, error };
    }
  },

  /**
   * Fetch return requests for a seller
   */
  async getReturnRequests(sellerId) {
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*, customer:customer_id(full_name, phone_number, email, avatar_url), order:order_id(id, total_amount, created_at, quote)")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching return requests:", error);
      return { data: [], error };
    }
  },

  /**
   * Fetch return requests made by a customer
   */
  async getCustomerReturns(customerId) {
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*, seller:seller_id(full_name, company_name), order:order_id(id, total_amount, created_at)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching customer returns:", error);
      return { data: [], error };
    }
  }
};
