// Auth State Checker - Add this to your browser console for debugging
window.checkAuthState = () => {
  const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
  
  console.log('=== AUTH STATE CHECKER ===');
  console.log('Full localStorage auth-storage:', authData);
  
  if (authData.state) {
    console.log('User:', authData.state.user);
    console.log('Is Authenticated:', authData.state.isAuthenticated);
    console.log('Access Token:', authData.state.tokens?.accessToken ? 'Present' : 'Missing');
    console.log('Refresh Token:', authData.state.tokens?.refreshToken ? 'Present' : 'Missing');
    
    if (authData.state.tokens?.accessToken) {
      try {
        const payload = JSON.parse(atob(authData.state.tokens.accessToken.split('.')[1]));
        console.log('Access Token Payload:', payload);
        console.log('Access Token Expires:', new Date(payload.exp * 1000).toISOString());
        console.log('Access Token Expired?', payload.exp < Date.now() / 1000);
      } catch (e) {
        console.log('Could not parse access token');
      }
    }
    
    if (authData.state.tokens?.refreshToken) {
      try {
        const payload = JSON.parse(atob(authData.state.tokens.refreshToken.split('.')[1]));
        console.log('Refresh Token Payload:', payload);
        console.log('Refresh Token Expires:', new Date(payload.exp * 1000).toISOString());
        console.log('Refresh Token Expired?', payload.exp < Date.now() / 1000);
      } catch (e) {
        console.log('Could not parse refresh token');
      }
    }
  } else {
    console.log('No auth state found');
  }
  console.log('========================');
  
  return authData;
};

console.log('Auth state checker loaded. Run window.checkAuthState() to check current state.');
