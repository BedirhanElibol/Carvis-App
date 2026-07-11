import { supabase } from "../supabaseClient";

/**
 * KYC (Know Your Partner) and Liability Protection Service
 */
export const KYCService = {
  /**
   * Submits the KYC documents and updates seller status to pending_review.
   * In a real implementation, this would upload the files to Supabase Storage first.
   */
  async submitKYCData(sellerId, kycData) {
    try {
      // 1. Update the seller record with KYC data
      const { data, error } = await supabase
        .from("sellers")
        .update({
          criminal_record_url: kycData.criminalRecordUrl || null,
          competence_cert_url: kycData.competenceCertUrl || null,
          tax_plate_url: kycData.taxPlateUrl || null,
          insurance_policy_number: kycData.insurancePolicyNumber || null,
          insurance_expiry_date: kycData.insuranceExpiryDate || null,
          kyc_status: "pending_review",
          legal_terms_accepted_at: new Date().toISOString(),
          legal_terms_ip_address: "127.0.0.1", // In production, grab from request headers via Edge Function
        })
        .eq("id", sellerId)
        .select()
        .single();

      if (error) throw error;

      // 2. Log the legally binding agreement audit trail
      const { error: auditError } = await supabase
        .from("partner_legal_agreements")
        .insert([
          {
            seller_id: sellerId,
            agreement_type: "platform_liability_waiver",
            document_version: "v1.0.0",
            ip_address: "127.0.0.1", // Mocked for client-side
            user_agent: navigator.userAgent
          }
        ]);
        
      if (auditError) console.error("Audit log error:", auditError);

      return { data, error: null };
    } catch (error) {
      console.error("KYC Submission Error:", error);
      return { data: null, error };
    }
  },

  /**
   * Uploads a document to the secure bucket
   */
  async uploadSecureDocument(file, path) {
    try {
      const { error } = await supabase.storage
        .from('service-proofs')
        .upload(`kyc/${path}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('service-proofs')
        .getPublicUrl(`kyc/${path}`);
        
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("KYC File upload error:", error);
      // fallback to object URL for preview if upload fails or is not configured
      return URL.createObjectURL(file);
    }
  }
};
