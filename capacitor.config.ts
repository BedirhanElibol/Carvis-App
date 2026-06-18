import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rapidsy.app',
  appName: 'Rapidsy',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f172a',
    preferredContentMode: 'mobile',
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      requestAlwaysAuthorization: false,
    },
  },
};

export default config;
