import { supabase } from "../supabaseClient";
import { EscrowService } from "./EscrowService";

export const ParkingService = {
  // 1. Customer: Create Parking Reservation
  createReservation: async (parkingId, vehicleId, startTime, endTime, price) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Giriş yapmanız gerekiyor.");

      // First create the main order for escrow
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: user.user.id,
          total_amount: price,
          status: "pending", // Waiting for Escrow
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Lock money in Escrow
      const escrowResult = await EscrowService.createEscrowTransaction(order.id, price);
      if (!escrowResult.success) throw new Error(escrowResult.message);

      // Create specific parking reservation
      const { data: res, error: resErr } = await supabase
        .from("parking_reservations")
        .insert({
          customer_id: user.user.id,
          parking_id: parkingId,
          vehicle_id: vehicleId,
          escrow_order_id: order.id,
          start_time: startTime,
          end_time: endTime,
          price: price,
          status: "pending",
        })
        .select()
        .single();

      if (resErr) throw resErr;
      return { success: true, data: res };
    } catch (error) {
      console.error("Parking reservation error:", error);
      return { success: false, message: error.message };
    }
  },

  // 2. Partner: Fetch active reservations
  getActiveReservations: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("parking_reservations")
        .select("*, profiles!customer_id(full_name, phone), vehicles(brand, model, license_plate)")
        .eq("parking_id", user.user.id)
        .in("status", ["pending", "active"])
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // 3. Partner: Complete Reservation
  completeReservation: async (reservationId, escrowOrderId) => {
    try {
      // Release Escrow
      await EscrowService.releasePayment(escrowOrderId);

      // Update Order Status
      await supabase.from("orders").update({ status: "completed" }).eq("id", escrowOrderId);

      // Update Reservation Status
      const { data, error } = await supabase
        .from("parking_reservations")
        .update({ status: "completed" })
        .eq("id", reservationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default ParkingService;
