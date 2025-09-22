import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7ad25731c88e48038eaef7bcc8f36510',
  appName: 'goal-wise-saver',
  webDir: 'dist',
  server: {
    url: 'https://7ad25731-c88e-4803-8eae-f7bcc8f36510.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  }
};

export default config;