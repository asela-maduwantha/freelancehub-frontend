'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyEmailOTP({
        email,
        otp: otpString
      });

      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on role
      if (role === 'freelancer') {
        router.push('/register/almost-there');
      } else {
        router.push('/client/welcome');
      }
      
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return;
    
    setIsResending(true);
    setResendMessage('');
    setError('');

    try {
      await authAPI.sendEmailOTP({
        email,
        type: 'verification'
      });

      setResendMessage('New OTP sent successfully!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']); // Clear current OTP
      inputRefs.current[0]?.focus(); // Focus first input
      
    } catch (error: any) {
      console.error('Resend OTP failed:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
            <Link href="/register" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Registration</span>
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
            Verify Your Email
          </h1>
          <p className="text-gray-600 mb-2 font-inter">
            We've sent a 6-digit code to:
          </p>
          <p className="text-lg font-semibold text-gray-900 mb-8 font-inter">
            {email}
          </p>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center space-x-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 font-inter"
                  placeholder="•"
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm mb-4"
              >
                {error}
              </motion.p>
            )}

            {resendMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 text-sm mb-4"
              >
                {resendMessage}
              </motion.p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOTP}
            disabled={!isOtpComplete || isLoading}
            variant={isOtpComplete ? "premium" : "secondary"}
            size="lg"
            className="w-full mb-6 font-poppins"
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

          {/* Resend OTP */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm mb-3">
              Didn't receive the code?
            </p>
            <Button
              onClick={handleResendOTP}
              disabled={countdown > 0 || isResending}
              variant="ghost"
              className="font-inter"
            >
              {isResending ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Resend Code</span>
                </div>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-green-50 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-green-800 mb-2 font-poppins">Tips:</h4>
            <ul className="text-sm text-green-700 space-y-1 font-inter">
              <li>• Check your email inbox and spam folder</li>
              <li>• The code expires in 10 minutes</li>
              <li>• You can paste the code from your clipboard</li>
            </ul>
          </div>

          {/* Help */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-gray-600 text-sm">
              Still having trouble?{' '}
              <Link href="/support" className="text-green-600 hover:text-green-700 font-semibold">
                Contact Support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
