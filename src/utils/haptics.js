/**
 * Haptic feedback utility — Capacitor-safe with web fallback
 * Uses navigator.vibrate as fallback when Capacitor is unavailable
 */

const isNative = () => {
  try {
    return window?.Capacitor?.isNativePlatform?.() || false;
  } catch {
    return false;
  }
};

const vibrationDurations = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 20],
  error: [50, 30, 50, 30, 50],
};

export const triggerHaptic = async (style = "light") => {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };

      if (style === "success" || style === "error") {
        await Haptics.notification({
          type: style === "success" ? "SUCCESS" : "ERROR",
        });
      } else {
        await Haptics.impact({ style: styleMap[style] || ImpactStyle.Light });
      }
    } else if (navigator?.vibrate) {
      navigator.vibrate(vibrationDurations[style] || 10);
    }
  } catch {
    // Silently fail — haptic is a nice-to-have
  }
};
