import { supabase } from "../supabaseClient";
import { EscrowService } from "./EscrowService";

export const ValetService = {
  // 1. Customer: Create Valet Booking
  createBooking: async (pickupPoint, dropoffPoint, vehicleId, price, note = "") => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Giriş yapmanız gerekiyor.");

      // First create the main order for escrow
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: user.user.id,
          total_amount: price,
          status: "pending_payment", // Waiting for Escrow
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Lock money in Escrow
      const escrowResult = await EscrowService.createEscrowTransaction(order.id, price);
      if (!escrowResult.success) throw new Error(escrowResult.message);

      // Create specific valet booking
      const { data: booking, error: bookingErr } = await supabase
        .from("valet_bookings")
        .insert({
          customer_id: user.user.id,
          vehicle_id: vehicleId,
          escrow_order_id: order.id,
          pickup_point: pickupPoint,
          dropoff_point: dropoffPoint,
          price: price,
          note: note,
          status: "pending",
        })
        .select()
        .single();

      if (bookingErr) throw bookingErr;
      return { success: true, data: booking };
    } catch (error) {
      console.error("Valet booking error:", error);
      return { success: false, message: error.message };
    }
  },

  // 2. Partner: Fetch active bookings
  getPendingBookings: async () => {
    try {
      const { data, error } = await supabase
        .from("valet_bookings")
        .select("*, profiles!customer_id(full_name, phone), vehicles(brand, model, license_plate)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // 3. Partner: Accept Booking
  acceptBooking: async (bookingId) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("valet_bookings")
        .update({ status: "accepted", valet_id: user.user.id, assigned_provider_id: user.user.id })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // 4. Partner: Complete Booking and Release Funds
  completeBooking: async (bookingId, escrowOrderId) => {
    try {
      // Release Escrow
      await EscrowService.releasePayment(escrowOrderId);

      // Update Order Status
      await supabase.from("orders").update({ status: "completed" }).eq("id", escrowOrderId);

      // Update Booking Status
      const { data, error } = await supabase
        .from("valet_bookings")
        .update({ status: "completed" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default ValetService;
