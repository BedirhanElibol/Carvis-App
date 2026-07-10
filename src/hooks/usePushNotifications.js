/**
 * usePushNotifications — Capacitor Push Notification integration hook
 * Registers device token, handles foreground/background notifications,
 * and stores FCM token in Supabase user_metadata for server-side delivery.
 */
import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Capacitor } from '@capacitor/core';

// Capacitor plugin — lazy-loaded only on native platforms to avoid web crashes
const getPushPlugin = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    return PushNotifications;
  } catch {
    // Not in Capacitor environment
    return null;
  }
};

const usePushNotifications = () => {
  const { currentUser } = useAuth();

  const registerToken = useCallback(async () => {
    if (!currentUser || currentUser.isAnonymous) return;

    const PushNotifications = await getPushPlugin();
    if (!PushNotifications) return; // Web mode — skip

    try {
      // Request permission
      const result = await PushNotifications.requestPermissions();
      if (result.receive !== 'granted') {
        console.warn('[Push] Permission denied by user');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for token registration
      PushNotifications.addListener('registration', async (token) => {
        console.log('[Push] FCM Token:', token.value);

        // Save FCM token to Supabase profile
        const { error } = await supabase.auth.updateUser({
          data: { fcm_token: token.value }
        });

        if (!error) {
          // Also save to profiles table for server-side access
          await supabase
            .from('profiles')
            .update({ fcm_token: token.value, notification_enabled: true })
            .eq('id', currentUser.id);
        }
      });

      // Handle foreground notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Push] Foreground notification:', notification);
        // Trigger in-app notification via custom event
        window.dispatchEvent(new CustomEvent('carvis:push', {
          detail: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          }
        }));
      });

      // Handle notification tap (app was in background)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[Push] Action performed:', action);
        const data = action.notification.data;
        // Route user based on notification type
        if (data?.type === 'order') {
          window.location.href = '/orders';
        } else if (data?.type === 'quote') {
          window.location.href = '/quotes';
        } else if (data?.type === 'appointment') {
          window.location.href = '/appointments';
        } else if (data?.type === 'message') {
          window.location.href = '/messages';
        }
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('[Push] Registration error:', err);
      });

    } catch (err) {
      console.error('[Push] Init error:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    registerToken();
    // Cleanup on unmount
    return () => {
      getPushPlugin().then(plugin => {
        if (plugin) plugin.removeAllListeners?.();
      });
    };
  }, [registerToken]);
};

export default usePushNotifications;
