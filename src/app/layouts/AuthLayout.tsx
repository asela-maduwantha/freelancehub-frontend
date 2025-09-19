'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title = "Welcome to Frevo",
  subtitle = "Connect with freelancers and find your next opportunity"
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-primary-active))' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-primary-light)' }}>
            {subtitle}
          </p>
        </div>
        <div className="bg-primary py-8 px-6 shadow-lg rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}