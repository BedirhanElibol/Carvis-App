import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from './haptics.js';

const mockNotification = vi.fn();
const mockImpact = vi.fn();

vi.mock('@capacitor/haptics', () => {
  return {
    Haptics: {
      notification: (...args) => mockNotification(...args),
      impact: (...args) => mockImpact(...args),
    },
    ImpactStyle: {
      Light: 'LIGHT',
      Medium: 'MEDIUM',
      Heavy: 'HEAVY'
    }
  };
});

describe('triggerHaptic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Native Platform', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => true
        }
      });
    });

    it('should call Haptics.impact with default style (light)', async () => {
      await triggerHaptic();
      expect(mockImpact).toHaveBeenCalledWith({ style: 'LIGHT' });
    });

    it('should call Haptics.impact with medium style', async () => {
      await triggerHaptic('medium');
      expect(mockImpact).toHaveBeenCalledWith({ style: 'MEDIUM' });
    });

    it('should call Haptics.impact with heavy style', async () => {
      await triggerHaptic('heavy');
      expect(mockImpact).toHaveBeenCalledWith({ style: 'HEAVY' });
    });

    it('should fallback to light impact for unknown style', async () => {
      await triggerHaptic('unknown_style');
      expect(mockImpact).toHaveBeenCalledWith({ style: 'LIGHT' });
    });

    it('should call Haptics.notification with SUCCESS for success style', async () => {
      await triggerHaptic('success');
      expect(mockNotification).toHaveBeenCalledWith({ type: 'SUCCESS' });
    });

    it('should call Haptics.notification with ERROR for error style', async () => {
      await triggerHaptic('error');
      expect(mockNotification).toHaveBeenCalledWith({ type: 'ERROR' });
    });

    it('should silently fail if Capacitor Haptics throws an error', async () => {
      mockImpact.mockRejectedValueOnce(new Error('Capacitor Error'));
      await expect(triggerHaptic()).resolves.not.toThrow();
    });
  });

  describe('Web Platform (Fallback)', () => {
    let mockVibrate;

    beforeEach(() => {
      mockVibrate = vi.fn();
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => false
        }
      });
      vi.stubGlobal('navigator', {
        vibrate: mockVibrate
      });
    });

    it('should use navigator.vibrate with default duration (light) if style not specified', async () => {
      await triggerHaptic();
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('should use navigator.vibrate with medium duration', async () => {
      await triggerHaptic('medium');
      expect(mockVibrate).toHaveBeenCalledWith(25);
    });

    it('should use navigator.vibrate with heavy duration', async () => {
      await triggerHaptic('heavy');
      expect(mockVibrate).toHaveBeenCalledWith(50);
    });

    it('should use navigator.vibrate with success duration array', async () => {
      await triggerHaptic('success');
      expect(mockVibrate).toHaveBeenCalledWith([10, 50, 20]);
    });

    it('should use navigator.vibrate with error duration array', async () => {
      await triggerHaptic('error');
      expect(mockVibrate).toHaveBeenCalledWith([50, 30, 50, 30, 50]);
    });

    it('should use navigator.vibrate with fallback duration for unknown style', async () => {
      await triggerHaptic('unknown_style');
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('should silently fail if navigator.vibrate throws an error', async () => {
      mockVibrate.mockImplementationOnce(() => {
        throw new Error('Vibrate Error');
      });
      await expect(triggerHaptic()).resolves.not.toThrow();
    });
  });

  describe('No API available', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        Capacitor: {
          isNativePlatform: () => false
        }
      });
      vi.stubGlobal('navigator', {});
    });

    it('should not throw if no haptics API is available', async () => {
      await expect(triggerHaptic()).resolves.not.toThrow();
    });
  });
});
