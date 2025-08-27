"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import OTPInput from '@/components/ui/OTPInput';
import Button from '@/components/ui/Button';
import { authApi } from '@/api/services/auth';

interface EmailVerificationProps {
  email: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onResendSuccess?: () => void;
}

const EmailVerification = ({ 
  email, 
  onSuccess, 
  onError, 
  onResendSuccess 
}: EmailVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);
    setVerificationError('');
    
    try {
      const response = await authApi.verifyEmailOtp({
        email,
        otp
      });
      
      if (response.success) {
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        setVerificationError(response.error?.message || 'Invalid verification code');
        setOtp(''); // Clear the OTP input
      }
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      if (error.response?.status === 400) {
        setVerificationError('Invalid or expired verification code');
      } else if (error.response?.status === 429) {
        setVerificationError('Too many attempts. Please try again later.');
      } else {
        setVerificationError('Verification failed. Please try again.');
      }
      setOtp(''); // Clear the OTP input
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setVerificationError('');
    
    try {
      const response = await authApi.sendEmailOtp(email, 'verification');
      
      if (response.success) {
        setResendCooldown(300); // 5 minutes cooldown
        setAttempts(0); // Reset attempts
        setOtp(''); // Clear current OTP
        onResendSuccess?.();
      } else {
        onError(response.error?.message || 'Failed to resend verification code');
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        onError('Please wait before requesting another verification code');
      } else {
        onError('Failed to resend verification code. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAttemptsWarning = () => {
    if (attempts >= 3) {
      return (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">
            Multiple incorrect attempts. Please check your email or request a new code.
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Check Your Email
        </h2>
        
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        
        <p className="text-lg font-medium text-blue-600 mt-1">
          {email}
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-6">
        <OTPInput
          value={otp}
          onChange={setOtp}
          error={verificationError}
          disabled={loading}
          autoFocus
        />
      </div>

      {/* Attempts Warning */}
      {getAttemptsWarning()}

      {/* Loading State */}
      {loading && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Verifying...</span>
          </div>
        </div>
      )}

      {/* Verify Button (for manual verification) */}
      {otp.length === 6 && !loading && (
        <div className="mb-6">
          <Button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verify Email
          </Button>
        </div>
      )}

      {/* Resend Section */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Didn't receive the code?
        </p>
        
        {resendCooldown > 0 ? (
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Resend available in {formatTime(resendCooldown)}
            </span>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="w-full sm:w-auto"
          >
            {resendLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </>
            )}
          </Button>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Having trouble?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Check your spam/junk folder</li>
          <li>• Make sure {email} is correct</li>
          <li>• Wait a few minutes for the email to arrive</li>
          <li>• Contact support if you continue having issues</li>
        </ul>
      </div>

      {/* Change Email */}
      <div className="text-center mt-6">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Need to change your email address?
        </button>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
