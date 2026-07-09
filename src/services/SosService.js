import { supabase } from "../supabaseClient";
import { EscrowService } from "./EscrowService";

/**
 * RAPIDSY SOS (TOW TRUCK) SERVICE
 * Handles the logic for requesting a tow truck, calculating dynamic prices,
 * and securing funds in Escrow before dispatching.
 */
export const SosService = {
  // Tow pricing strategy
  BASE_PRICE: 1500,
  PRICE_PER_KM: 50,
  COMMISSION_RATE: 0.15,

  /**
   * Calculate the price of towing based on distance
   */
  calculatePrice(distanceKm) {
    if (!distanceKm) return this.BASE_PRICE;
    return this.BASE_PRICE + (distanceKm * this.PRICE_PER_KM);
  },

  /**
   * Request a tow truck (Step 1: Estimate & Create Request)
   */
  async requestTowTruck(customerId, lat, lng, distanceKm, description) {
    try {
      const price = this.calculatePrice(distanceKm);
      
      // 1. Create a dummy order to link with the Escrow system
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_id: customerId,
          seller_id: customerId, // Self placeholder until a tow truck accepts
          total_amount: price,
          status: 'pending_payment' // requires escrow block
        }])
        .select()
        .single();

      if (orderError) throw new Error("Order creation failed: " + orderError.message);

      // 2. Create the emergency request
      const { data: emergencyReq, error: reqError } = await supabase
        .from("emergency_requests")
        .insert([{
          customer_id: customerId,
          lat,
          lng,
          emergency_type: 'tow_truck',
          description,
          status: 'searching',
          price,
          escrow_order_id: order.id
        }])
        .select()
        .single();

      if (reqError) throw new Error("Emergency request failed: " + reqError.message);

      // 3. Return the order details to the frontend for payment processing
      return { success: true, price, orderId: order.id, requestId: emergencyReq.id };

    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Confirm Payment (Step 2: Block Funds via Escrow)
   * The user pays via Credit Card, and funds go to Rapidsy Vault.
   */
  async confirmPayment(orderId) {
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Order not found");

      // Block funds in Escrow
      const escrowRes = await EscrowService.blockFunds(orderId, order.total_amount);
      
      if (escrowRes.success) {
        // Mark order as paid
        await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
        
        // Mark emergency request as active and visible to tow trucks
        await supabase
          .from("emergency_requests")
          .update({ status: "paid_searching" })
          .eq("escrow_order_id", orderId);
      } else {
        throw new Error(escrowRes.error);
      }
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
