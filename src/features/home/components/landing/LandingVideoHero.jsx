import React from "react";
import ScrollLockedVideoHero from "../../../components/ui/scroll-locked-video-hero";

/**
 * FEATURE TOGGLE / SWITCHABLE LANDING VIDEO HERO
 * Set enabled to true to render the scroll-locked video hero on landing,
 * or false to bypass and return null (100% reversible anytime).
 */
export const SHOW_VIDEO_HERO_BY_DEFAULT = false;

export default function LandingVideoHero({ enabled = SHOW_VIDEO_HERO_BY_DEFAULT }) {
  if (!enabled) return null;

  return (
    <div className="w-full mb-12">
      <ScrollLockedVideoHero
        title="CARVIS OTO EKOSİSTEMİ"
        tagline="Şehrin en iyi ustaları, gezici oto yıkama ve yedek parçacıları tek platformda."
        scrollHint="AŞAĞI KAYDIRIN"
      />
    </div>
  );
}
