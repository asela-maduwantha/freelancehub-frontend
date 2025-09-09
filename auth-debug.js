// Debug Authentication Issues
// Add this to your browser console to monitor auth issues during file uploads

window.authDebug = {
  // Monitor localStorage changes
  monitorStorage: () => {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
      if (key === 'auth-storage') {
        console.log('🔐 Auth storage updated:', JSON.parse(value));
      }
      return originalSetItem.apply(this, arguments);
    };
    
    localStorage.removeItem = function(key) {
      if (key === 'auth-storage') {
        console.log('🗑️ Auth storage cleared!');
        console.trace('Storage cleared from:');
      }
      return originalRemoveItem.apply(this, arguments);
    };
    
    console.log('👁️ Storage monitoring enabled');
  },

  // Monitor API calls
  monitorAPI: () => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      if (typeof url === 'string' && url.includes('/files/upload')) {
        console.log('📁 File upload started:', url);
        console.log('🔐 Auth state before upload:', JSON.parse(localStorage.getItem('auth-storage') || '{}'));
      }
      
      try {
        const response = await originalFetch.apply(this, args);
        
        if (typeof url === 'string' && url.includes('/files/upload')) {
          console.log('📁 File upload response:', response.status);
          console.log('🔐 Auth state after upload:', JSON.parse(localStorage.getItem('auth-storage') || '{}'));
        }
        
        return response;
      } catch (error) {
        if (typeof url === 'string' && url.includes('/files/upload')) {
          console.error('📁 File upload failed:', error);
          console.log('🔐 Auth state after error:', JSON.parse(localStorage.getItem('auth-storage') || '{}'));
        }
        throw error;
      }
    };
    
    console.log('🌐 API monitoring enabled');
  },

  // Check current auth state
  checkAuth: () => {
    const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    console.log('🔐 Current auth state:', authData);
    
    if (authData.state?.tokens?.accessToken) {
      try {
        const payload = JSON.parse(atob(authData.state.tokens.accessToken.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        console.log('⏰ Token expires:', exp.toISOString());
        console.log('⏰ Current time:', now.toISOString());
        console.log('⏰ Time until expiry:', Math.floor((exp.getTime() - now.getTime()) / 1000), 'seconds');
      } catch (e) {
        console.log('❌ Could not parse token');
      }
    }
    
    return authData;
  },

  // Start all monitoring
  startMonitoring: () => {
    window.authDebug.monitorStorage();
    window.authDebug.monitorAPI();
    console.log('🚀 Auth debugging started');
  },

  // Stop monitoring
  stopMonitoring: () => {
    location.reload();
  }
};

console.log('🔍 Auth Debug Tools loaded');
console.log('Run window.authDebug.startMonitoring() to begin monitoring');
console.log('Available methods:', Object.keys(window.authDebug));
