import React, { memo } from "react";
import FeatureEscrow from "./FeatureEscrow";
import FeatureMechanics from "./FeatureMechanics";
import FeatureReviews from "./FeatureReviews";
import FeatureEnterprise from "./FeatureEnterprise";

const LandingPremiumFeatures = memo(({t, language}) => {
  return (
    <>
        {/* PREMIUM FEATURE SHOWCASE (Ürün Tanıtım Bölümleri) */}
        <section id="premium-features" className="w-full max-w-7xl mx-auto px-6 mb-28 space-y-32 z-10 relative">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-blue-500">
              {language === "tr" ? "GÜVENLİ LİMANINIZ" : "YOUR SECURE HARBOR"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "SÜRPRİZLERE YER YOK, %100 KONTROL SİZDE" : "NO SURPRISES, 100% IN YOUR CONTROL"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Sanayi stresi bitti. Doğrulanmış ustalar, havuz ödeme güvencesi ve onaylı işlemler ile en temel ihtiyacınız olan 'güven' problemini kökünden çözüyoruz."
                : "Mechanic stress is over. We solve your fundamental need for 'trust' from the ground up with verified mechanics, escrow payments, and approved repairs."}
            </p>
          </div>

          <FeatureEscrow language={language} />
          <FeatureMechanics language={language} />
          <FeatureReviews language={language} />
          <FeatureEnterprise language={language} />

        </section>

    </>
  );
});

LandingPremiumFeatures.displayName = 'LandingPremiumFeatures';
export default LandingPremiumFeatures;
