import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7ae78f935dd9453baeed9e6165169c1d',
  appName: 'VAULT™ OS',
  webDir: 'dist',
  // PRODUCTION: Remove or comment out the server block below before building for App Store.
  // When the server block is present, the app loads from the remote URL (good for development).
  // When removed, the app uses the local bundle in /dist (required for App Store submission).
  //
  // server: {
  //   url: 'https://7ae78f93-5dd9-453b-aeed-9e6165169c1d.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    NativeBiometric: {
      useFallback: true,
    },
  },
  ios: {
    scheme: "VAULT OS",
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
