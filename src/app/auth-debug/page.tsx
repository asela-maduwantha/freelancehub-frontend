'use client';

import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const [authData, setAuthData] = useState<any>({});

  useEffect(() => {
    // Check what's in localStorage
    const userData = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const oldAccessToken = localStorage.getItem('access_token'); // Check old format
    const oldRefreshToken = localStorage.getItem('refresh_token'); // Check old format

    setAuthData({
      userData: userData ? JSON.parse(userData) : null,
      accessToken,
      refreshToken,
      oldAccessToken,
      oldRefreshToken,
      allKeys: Object.keys(localStorage),
    });
  }, []);

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">LocalStorage Contents</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(authData, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <button
            onClick={clearStorage}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Storage & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
