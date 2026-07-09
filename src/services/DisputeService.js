import { supabase } from "../supabaseClient";

/**
 * Service for Anlaşmazlık Çözüm Merkezi (Dispute Resolution)
 */
export const DisputeService = {
  /**
   * Opens an escrow dispute and blocks payment release
   */
  async openDispute(disputeData) {
    try {
      // 1. Lock the order's escrow status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ is_escrow_blocked: true })
        .eq("id", disputeData.orderId);

      if (orderError) throw orderError;

      // 2. Insert dispute record
      const { data, error } = await supabase
        .from("order_disputes")
        .insert([
          {
            order_id: disputeData.orderId,
            customer_id: disputeData.customerId,
            seller_id: disputeData.sellerId,
            reason_category: disputeData.reasonCategory,
            description: disputeData.description,
            evidence_url: disputeData.evidenceUrl || null,
            status: "under_review"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error opening dispute:", error);
      return { data: null, error };
    }
  },

  /**
   * Resolves a dispute (Admin only)
   */
  async resolveDispute(disputeId, orderId, resolution) {
    try {
      const { data, error } = await supabase
        .from("order_disputes")
        .update({
          status: resolution === "refund" ? "refunded" : "released_to_seller",
          updated_at: new Date().toISOString()
        })
        .eq("id", disputeId)
        .select()
        .single();

      if (error) throw error;

      // Unblock order and update status based on resolution
      const targetStatus = resolution === "refund" ? "cancelled" : "completed";
      const { error: orderError } = await supabase
        .from("orders")
        .update({ 
          is_escrow_blocked: false,
          status: targetStatus
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      return { data, error: null };
    } catch (error) {
      console.error("Error resolving dispute:", error);
      return { data: null, error };
    }
  }
};

/**
 * Service for GPS and Operational Proof Tracking
 */
export const TrackingService = {
  /**
   * Records a GPS check-in, check-out or photo proof event
   */
  async recordTrackingEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from("order_tracking_events")
        .insert([
          {
            order_id: eventData.orderId,
            partner_id: eventData.partnerId,
            event_type: eventData.eventType,
            lat: eventData.lat,
            lng: eventData.lng,
            accuracy_meters: eventData.accuracyMeters || null,
            photo_url: eventData.photoUrl || null
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error recording tracking event:", error);
      return { data: null, error };
    }
  },

  /**
   * Mocks calculating distance between two coordinates in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  }
};
