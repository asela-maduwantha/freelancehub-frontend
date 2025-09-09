'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo.png" alt="FreelanceHub" className="h-12 w-auto mx-auto" />
        </div>

        {/* Error Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">⚠️</div>
          <div className="w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-red-400">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-8 font-inter">
          We encountered an unexpected error. Our team has been notified and is working to fix this issue.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={reset}
            variant="premium"
            size="lg"
            className="w-full"
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Still having issues? <Link href="/contact" className="text-red-600 hover:text-red-700 underline">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}
