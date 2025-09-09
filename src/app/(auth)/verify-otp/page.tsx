'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AuthService } from '@/lib/services/auth';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Create refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Get email from Zustand store
  const { registrationEmail, selectedRole, login, setRegistrationEmail } = useAuthStore();

  useEffect(() => {
    // Redirect to registration if no email is found
    if (!registrationEmail) {
      router.push('/register');
      return;
    }
  }, [registrationEmail, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      setOtp(digits.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    if (!registrationEmail) {
      setError('Email is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const authResponse = await AuthService.verifyOtp({ email: registrationEmail, otp: otpString });
      
      console.log('Auth Response received:', authResponse);
      console.log('Access Token:', authResponse.accessToken);
      console.log('Refresh Token:', authResponse.refreshToken);
      
      // Store authentication data with actual tokens
      login(authResponse.user, {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken
      });
      
      console.log('User logged in, navigating to transition...');
      
      router.push('/onboarding/transition');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!registrationEmail) {
      setError('Email is required');
      return;
    }
    
    setResendLoading(true);
    setError('');
    
    try {
      await AuthService.forgotPassword({ email: registrationEmail });
      setCountdown(60);
      setCanResend(false);
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  if (!registrationEmail) {
    return null; // Will redirect to register
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-emerald-200 rounded-full opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                ✉️ Email Verification
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
                Check Your Email
              </h1>
              <p className="text-gray-600">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-green-600 font-medium mt-1">
                {registrationEmail}
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-3 mb-4">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        error ? 'border-red-500' : digit ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      maxLength={1}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    />
                  ))}
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || otp.join('').length !== 6}
                size="lg"
                className="w-full font-semibold"
                variant="premium"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              {/* Resend Section */}
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={!canResend || resendLoading}
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Sending...
                    </>
                  ) : canResend ? (
                    'Resend Code'
                  ) : (
                    `Resend in ${countdown}s`
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-lg">💡</div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Tips for verification
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Check your spam/junk folder if you don't see the email</li>
                      <li>• The code expires in 10 minutes</li>
                      <li>• You can paste the entire 6-digit code</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
