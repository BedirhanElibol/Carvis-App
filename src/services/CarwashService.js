import { supabase } from "../supabaseClient";
import { EscrowService } from "./EscrowService";

export const CarwashService = {
  // 1. Customer: Create Carwash Request
  createRequest: async (vehicleId, lat, lng, address, washType, price) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Giriş yapmanız gerekiyor.");

      // First create the main order for escrow
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.user.id,
          service_type: "carwash",
          total_price: price,
          status: "pending_payment", // Waiting for Escrow
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Lock money in Escrow
      const escrowResult = await EscrowService.createEscrowTransaction(order.id, price);
      if (!escrowResult.success) throw new Error(escrowResult.message);

      // Create specific carwash request
      const { data: req, error: reqErr } = await supabase
        .from("carwash_requests")
        .insert({
          customer_id: user.user.id,
          vehicle_id: vehicleId,
          escrow_order_id: order.id,
          location_lat: lat,
          location_lng: lng,
          address_text: address,
          wash_type: washType,
          price: price,
          status: "pending",
        })
        .select()
        .single();

      if (reqErr) throw reqErr;
      return { success: true, data: req };
    } catch (error) {
      console.error("Carwash request error:", error);
      return { success: false, message: error.message };
    }
  },

  // 2. Partner: Fetch active requests in area
  getPendingRequests: async (providerId = null) => {
    let query = supabase
      .from("carwash_requests")
      .select("*, profiles!customer_id(full_name, phone), vehicles(*)");
    
    if (providerId) {
      query = query.or(`status.eq.pending,and(status.eq.accepted,provider_id.eq.${providerId})`);
    } else {
      query = query.eq("status", "pending");
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  },

  // 3. Partner: Accept Request
  acceptRequest: async (requestId) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("carwash_requests")
        .update({ status: "accepted", provider_id: user.user.id })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // 4. Partner: Complete Request and Release Funds
  completeRequest: async (requestId, escrowOrderId) => {
    try {
      // Release Escrow
      await EscrowService.releasePayment(escrowOrderId);

      // Update Order Status
      await supabase.from("orders").update({ status: "completed" }).eq("id", escrowOrderId);

      // Update Carwash Request
      const { data, error } = await supabase
        .from("carwash_requests")
        .update({ status: "completed" })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default CarwashService;
