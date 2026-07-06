import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUI } from "../../../context/UIContext";
import { AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabaseClient";
import ProfessionSelectionStep from "./onboarding/ProfessionSelectionStep";
import BusinessDetailsStep from "./onboarding/BusinessDetailsStep";
import PlansAndTrustStep from "./onboarding/PlansAndTrustStep";

const PartnerOnboarding = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState(null); // 'valet', 'parking', 'mechanic', 'parts'
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 3 states
  const [selectedPlanTab, setSelectedPlanTab] = useState("free");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedTrust, setAcceptedTrust] = useState(false);
  const [acceptedBank, setAcceptedBank] = useState(false);

  const handleNext = () => {
    if (step === 1 && !profession) {
      showAlert("Hata", "Lütfen bir meslek seçimi yapınız.", "error");
      return;
    }
    if (step === 2 && (!businessName || !phone)) {
      showAlert("Hata", "Lütfen gerekli alanları doldurunuz.", "error");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!acceptedTerms || !acceptedTrust || !acceptedBank) {
      showAlert("Hata", "Lütfen tüm katılım ve güvenlik koşullarını onaylayınız.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      showAlert("Bilgi", "Başvurunuz kaydediliyor ve profiliniz güncelleniyor...", "info");

      // 1. First, attempt to use the secure SECURITY DEFINER RPC to bypass client-side triggers and prevent role escalation issues
      const { data: rpcData, error: rpcError } = await supabase.rpc("complete_partner_onboarding_v2", {
        p_user_id: currentUser.id,
        p_profession: profession,
        p_business_name: businessName,
        p_phone: phone
      });

      if (rpcError) {
        // Fallback: If RPC does not exist in the database (code 42883), use the client-side queries
        // ensuring we omit the non-existent 'is_active_now' columns from parking_profiles, mechanic_shops, and parts_profiles
        if (rpcError.code === "42883") {
          console.warn("complete_partner_onboarding_v2 RPC not found. Falling back to client-side updates.");

          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              role: "partner",
              subscription_tier: "free"
            })
            .eq("id", currentUser.id);

          if (profileError) throw profileError;

          let tableName = "";
          let payload = {};
          
          switch (profession) {
            case "valet":
              tableName = "valet_profiles";
              payload = {
                id: currentUser.id,
                is_active_now: true,
                service_radius_km: 15,
                experience_years: 3
              };
              break;
            case "parking":
              tableName = "parking_profiles";
              payload = {
                id: currentUser.id,
                parking_name: businessName,
                total_capacity: 50,
                occupied_count: 0,
                price_per_hour: 30.00,
                is_indoor: true,
                has_security: true,
                has_valet: false
              };
              break;
            case "mechanic":
              tableName = "mechanic_shops";
              payload = {
                id: crypto.randomUUID(),
                seller_id: currentUser.id,
                shop_name: businessName,
                is_active: true,
                specialties: ["Periyodik Bakım", "Fren Sistemleri"],
                brands: ["BMW", "Audi", "Volkswagen", "Mercedes"]
              };
              break;
            case "parts":
              tableName = "parts_profiles";
              payload = {
                id: currentUser.id,
                business_name: businessName,
                delivery_radius_km: 50,
                store_type: "retail"
              };
              break;
            case "carwash":
              tableName = "carwash_profiles";
              payload = {
                id: currentUser.id,
                seller_id: currentUser.id,
                company_name: businessName,
                service_radius_km: 10,
                has_own_water_tank: true,
                has_generator: true,
                is_eco_friendly: true
              };
              break;
            default:
              break;
          }

          if (tableName) {
            const { error: specError } = await supabase
              .from(tableName)
              .insert(payload);

            if (specError) throw specError;
          }

          // Insert into partner_monetization client-side fallback
          const targetPlanName = `${profession}_free`;
          const { data: targetPlan } = await supabase
            .from("monetization_plans")
            .select("id")
            .eq("name", targetPlanName)
            .maybeSingle();

          if (targetPlan) {
            await supabase
              .from("partner_monetization")
              .insert({
                partner_id: currentUser.id,
                plan_id: targetPlan.id,
                subscription_status: "active"
              });
          }
        } else {
          throw rpcError;
        }
      } else if (rpcData && !rpcData.success) {
        throw new Error(rpcData.message);
      }

      showAlert("Başarılı", "Tebrikler! Carvis B2B Ortağı oldunuz. Dijital garaj ve kokpitiniz hazırlandı.", "success");
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      showAlert("Hata", err.message || "Kayıt sırasında bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  return (
    <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
      {/* Background decorations */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Stepper Indicators */}
      <div className="flex items-center justify-between mb-10 max-w-md mx-auto relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
              step >= s ? 'bg-primary-600 text-slate-900 dark:text-white shadow-lg shadow-primary-600/20' : 'bg-black/5 dark:bg-white/5 text-slate-500 border border-black/5 dark:border-white/5'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 rounded-full transition-all ${step > s ? 'bg-primary-600' : 'bg-black/5 dark:bg-white/5'}`}></div>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <ProfessionSelectionStep
            profession={profession}
            setProfession={setProfession}
            handleNext={handleNext}
          />
        )}

        {step === 2 && (
          <BusinessDetailsStep
            businessName={businessName}
            setBusinessName={setBusinessName}
            phone={phone}
            setPhone={setPhone}
            details={details}
            setDetails={setDetails}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        )}

        {step === 3 && (
          <PlansAndTrustStep
            profession={profession}
            selectedPlanTab={selectedPlanTab}
            setSelectedPlanTab={setSelectedPlanTab}
            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}
            acceptedTrust={acceptedTrust}
            setAcceptedTrust={setAcceptedTrust}
            acceptedBank={acceptedBank}
            setAcceptedBank={setAcceptedBank}
            isSubmitting={isSubmitting}
            handleBack={handleBack}
            handleSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerOnboarding;
