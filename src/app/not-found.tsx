'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo.png" alt="FreelanceHub" className="h-12 w-auto mx-auto" />
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <div className="w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-gray-400">
              <path
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.978-5.5-2.5M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
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
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 font-inter">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="premium" size="lg" className="w-full">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/browse/jobs">
            <Button variant="outline" size="lg" className="w-full">
              Browse Jobs
            </Button>
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link href="/contact" className="text-green-600 hover:text-green-700 underline">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}
