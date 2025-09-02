'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || !email) return;
    
    setIsResending(true);
    setResendMessage('');

    try {
      // Make API call to resend verification email
      await authService.sendEmailOTP({
        email,
        type: 'verification'
      });

      setResendMessage('Verification email sent successfully!');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Resend email failed:', error);
      setResendMessage(error.message || 'Failed to send email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckEmail = () => {
    // Simulate checking email and redirect to dashboard
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
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
            <Mail className="h-10 w-10" />
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-lg font-semibold text-gray-900 mb-8">
            {email}
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-800 mb-3">Next Steps:</h3>
            <ol className="text-blue-700 space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <span className="font-semibold">1.</span>
                <span>Check your email inbox (and spam/junk folder)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-semibold">3.</span>
                <span>Complete your profile setup</span>
              </li>
            </ol>
          </div>

          {/* Resend Email */}
          <div className="space-y-4 mb-8">
            <p className="text-gray-600 text-sm">
              Didn't receive the email?
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={countdown > 0 || isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </div>
              )}
            </Button>

            {resendMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm ${
                  resendMessage.includes('successfully') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}
              >
                {resendMessage}
              </motion.p>
            )}
          </div>

          {/* Mock verification button for demo */}
          <div className="border-t pt-8">
            <p className="text-sm text-gray-500 mb-4">
              For demo purposes:
            </p>
            <Button
              onClick={handleCheckEmail}
              disabled={isLoading}
              variant="premium"
              size="lg"
              className="w-full font-poppins"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>I've Verified My Email</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Help */}
          <div className="mt-8 pt-6 border-t">
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
