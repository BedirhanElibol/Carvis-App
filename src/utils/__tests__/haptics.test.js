import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic } from '../haptics.js';

// Mock the Capacitor Haptics module
vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: {
    Light: 'LIGHT',
    Medium: 'MEDIUM',
    Heavy: 'HEAVY',
  },
}));

describe('haptics.js triggerHaptic', () => {
  let originalWindow;
  let originalNavigator;
  let Haptics;

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();

    const capHaptics = await import('@capacitor/haptics');
    Haptics = capHaptics.Haptics;

    // Save original window and navigator
    originalWindow = global.window;
    originalNavigator = global.navigator;

    // Default mock setup for non-native with vibrate support
    global.window = {
      Capacitor: {
        isNativePlatform: () => false,
      },
    };

    global.navigator = {
      vibrate: vi.fn(),
    };
  });

  afterEach(() => {
    // Restore globals
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  it('should use navigator.vibrate with correct duration for light style on web', async () => {
    await triggerHaptic('light');
    expect(global.navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('should use navigator.vibrate with correct duration for medium style on web', async () => {
    await triggerHaptic('medium');
    expect(global.navigator.vibrate).toHaveBeenCalledWith(25);
  });

  it('should use navigator.vibrate with correct array for success style on web', async () => {
    await triggerHaptic('success');
    expect(global.navigator.vibrate).toHaveBeenCalledWith([10, 50, 20]);
  });

  it('should fallback to 10ms vibrate for unknown style on web', async () => {
    await triggerHaptic('unknown_style');
    expect(global.navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('should fail silently if vibrate is not supported on web', async () => {
    global.navigator.vibrate = undefined;
    await expect(triggerHaptic('light')).resolves.toBeUndefined();
  });

  it('should use Haptics.impact with LIGHT style for "light" on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('light');

    expect(Haptics.impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    expect(global.navigator.vibrate).not.toHaveBeenCalled();
  });

  it('should use Haptics.impact with MEDIUM style for "medium" on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('medium');

    expect(Haptics.impact).toHaveBeenCalledWith({ style: 'MEDIUM' });
  });

  it('should use Haptics.impact with HEAVY style for "heavy" on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('heavy');

    expect(Haptics.impact).toHaveBeenCalledWith({ style: 'HEAVY' });
  });

  it('should fallback to LIGHT style for unknown impact style on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('unknown_style');

    expect(Haptics.impact).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  it('should use Haptics.notification with SUCCESS for "success" on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('success');

    expect(Haptics.notification).toHaveBeenCalledWith({ type: 'SUCCESS' });
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it('should use Haptics.notification with ERROR for "error" on native', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    await triggerHaptic('error');

    expect(Haptics.notification).toHaveBeenCalledWith({ type: 'ERROR' });
  });

  it('should fail silently if Capacitor import fails', async () => {
    global.window.Capacitor.isNativePlatform = () => true;

    // Make Haptics.impact throw to simulate failure
    Haptics.impact.mockRejectedValueOnce(new Error('Capacitor error'));

    await expect(triggerHaptic('light')).resolves.toBeUndefined();
  });

  it('should fail silently if window.Capacitor.isNativePlatform throws', async () => {
    global.window = {
      get Capacitor() {
        throw new Error('Access error');
      }
    };

    await expect(triggerHaptic('light')).resolves.toBeUndefined();
  });
});
