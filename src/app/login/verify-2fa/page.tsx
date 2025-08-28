'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Key, Smartphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function Verify2FAPage() {
  const router = useRouter();
  const [pendingAuth, setPendingAuth] = useState<any>(null);
  const [verificationMethod, setVerificationMethod] = useState<'totp' | 'passkey'>('totp');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get pending authentication data
    const pendingData = localStorage.getItem('pendingAuth');
    if (pendingData) {
      setPendingAuth(JSON.parse(pendingData));
    } else {
      // Redirect to login if no pending auth
      router.push('/login');
    }

    // Check if passkeys are supported
    setIsPasskeySupported(
      typeof window !== 'undefined' && 
      'credentials' in navigator && 
      'create' in navigator.credentials
    );
  }, [router]);

  const handleTotpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newCode = [...totpCode];
    newCode[index] = value;
    setTotpCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...totpCode];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setTotpCode(newCode);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleTotpVerification = async () => {
    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call 2FA verification API
      const response = await authAPI.verify2FA(code);
      
      // Complete authentication
      completeAuthentication();
      
    } catch (error: any) {
      console.error('2FA verification failed:', error);
      setError(error.message || 'Invalid code. Please try again.');
      setTotpCode(['', '', '', '', '', '']); // Clear code
      inputRefs.current[0]?.focus(); // Focus first input
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyVerification = async () => {
    if (!isPasskeySupported) {
      setError('Passkeys are not supported on this device');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use WebAuthn API for passkey verification
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode('login-challenge'),
          timeout: 60000,
          userVerification: 'required'
        }
      });

      if (credential) {
        // Complete authentication
        completeAuthentication();
      } else {
        setError('Passkey verification failed');
      }
      
    } catch (error: any) {
      console.error('Passkey verification failed:', error);
      setError('Passkey verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeAuthentication = () => {
    if (!pendingAuth) return;

    // Store user data and tokens
    localStorage.setItem('user', JSON.stringify(pendingAuth.user));
    localStorage.setItem('accessToken', pendingAuth.accessToken);
    localStorage.setItem('refreshToken', pendingAuth.refreshToken);
    
    // Clear pending auth
    localStorage.removeItem('pendingAuth');

    // Redirect based on user role
    if (pendingAuth.user.role === 'client') {
      router.push('/client/dashboard');
    } else if (pendingAuth.user.role === 'freelancer') {
      router.push('/freelancer/dashboard');
    } else if (pendingAuth.user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const isTotpComplete = totpCode.every(digit => digit !== '');

  if (!pendingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-8">
            <Shield className="h-10 w-10" />
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 mb-8 font-inter">
            Welcome back, {pendingAuth.user.firstName}! Please verify your identity to continue.
          </p>

          {/* Verification Method Selector */}
          <div className="mb-8">
            <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setVerificationMethod('totp')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  verificationMethod === 'totp'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Authenticator App</span>
              </button>
              {isPasskeySupported && (
                <button
                  onClick={() => setVerificationMethod('passkey')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    verificationMethod === 'passkey'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Key className="h-4 w-4" />
                  <span>Passkey</span>
                </button>
              )}
            </div>
          </div>

          {/* TOTP Verification */}
          {verificationMethod === 'totp' && (
            <div className="mb-8">
              <p className="text-gray-600 mb-6 font-inter">
                Enter the 6-digit code from your authenticator app
              </p>

              {/* TOTP Input */}
              <div className="flex justify-center space-x-3 mb-6">
                {totpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 font-inter"
                    placeholder="•"
                  />
                ))}
              </div>

              <Button
                onClick={handleTotpVerification}
                disabled={!isTotpComplete || isLoading}
                variant={isTotpComplete ? "premium" : "secondary"}
                size="lg"
                className="w-full font-poppins"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Verify & Continue</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Passkey Verification */}
          {verificationMethod === 'passkey' && (
            <div className="mb-8">
              <p className="text-gray-600 mb-6 font-inter">
                Use your passkey to authenticate securely
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <Key className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-blue-800 text-sm font-inter">
                  Click the button below to authenticate with your passkey. You may need to use your fingerprint, face ID, or security key.
                </p>
              </div>

              <Button
                onClick={handlePasskeyVerification}
                disabled={isLoading}
                variant="premium"
                size="lg"
                className="w-full font-poppins"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>Authenticate with Passkey</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Help Section */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-gray-800 mb-2 font-poppins">Having trouble?</h4>
            <ul className="text-sm text-gray-600 space-y-1 font-inter">
              <li>• Make sure your device's time is correct</li>
              <li>• Try refreshing your authenticator app</li>
              <li>• Use backup codes if available</li>
              <li>• Contact support if you're still having issues</li>
            </ul>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <Link href="/support" className="text-green-600 hover:text-green-700 text-sm font-semibold">
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
