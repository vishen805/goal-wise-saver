import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.vishen.goalsaver',
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
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1e293b',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    handleApplicationURL: false,
    webViewPreferences: {
      allowsInlineMediaPlayback: true,
      suppressesIncrementalRendering: false
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#1e293b',
    webContentsDebuggingEnabled: true
  }
};

export default config;
