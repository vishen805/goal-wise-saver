// Device and platform detection utilities

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

export const isMobile = () => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isStandalone = () => {
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};

export const getViewportHeight = () => {
  if (isIOS()) {
    return window.innerHeight;
  }
  return window.screen.height;
};

export const addToHomeScreenPrompt = () => {
  if ('serviceWorker' in navigator) {
    // Register service worker for PWA functionality
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
  
  // Handle iOS add to home screen
  if (isIOS() && !isStandalone()) {
    const lastPrompt = localStorage.getItem('ios-prompt-dismissed');
    const daysSinceLastPrompt = lastPrompt 
      ? (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24)
      : 30;
      
    if (daysSinceLastPrompt >= 7) {
      return {
        shouldShow: true,
        message: 'Add SmartSaver to your home screen for the best experience! Tap the share button and select "Add to Home Screen".'
      };
    }
  }
  
  return { shouldShow: false };
};

export const dismissHomeScreenPrompt = () => {
  localStorage.setItem('ios-prompt-dismissed', Date.now().toString());
};