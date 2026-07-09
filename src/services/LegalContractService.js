import { supabase } from "../supabaseClient";

/**
 * Service for managing dynamic legal contracts (MSS, ÖBF, KVKK)
 */
export const LegalContractService = {
  /**
   * Fetches the active legal templates for a specific service category
   * @param {string} category - e.g., 'carwash', 'mechanic', 'parts'
   */
  async getTemplatesForCategory(category) {
    try {
      const { data, error } = await supabase
        .from("legal_templates")
        .select("*")
        .eq("service_category", category)
        .eq("is_active", true);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching legal templates:", error);
      return { data: null, error };
    }
  },

  /**
   * Compiles the raw template content with the dynamic order variables
   * @param {string} templateContent - HTML/Markdown template with {{VAR}} syntax
   * @param {object} variables - Variables to inject { SELLER_COMPANY, CUSTOMER_NAME, TOTAL_PRICE, ... }
   */
  compileTemplate(templateContent, variables) {
    if (!templateContent) return "";
    
    let compiled = templateContent;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      compiled = compiled.replace(regex, value);
    }
    return compiled;
  },

  /**
   * Logs the explicit acceptance of legal terms for an order
   */
  async logLegalAcceptance(logData) {
    try {
      const { data, error } = await supabase
        .from("order_legal_logs")
        .insert([
          {
            order_id: logData.orderId,
            customer_id: logData.customerId,
            seller_id: logData.sellerId,
            mss_version: logData.mssVersion,
            obf_version: logData.obfVersion,
            kvkk_version: logData.kvkkVersion,
            ip_address: "127.0.0.1", // Ideally fetched from edge function
            user_agent: navigator.userAgent
          }
        ]);
        
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error logging legal acceptance:", error);
      return { data: null, error };
    }
  }
};
