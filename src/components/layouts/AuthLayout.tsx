'use client';

import React, { useState, useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51, 65, 85) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      {/* Professional geometric accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-slate-100/50 to-gray-100/50 blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-blue-50/60 to-slate-50/60 blur-lg"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-900/5 p-8 relative overflow-hidden">
          {/* Subtle inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-blue-50/30 rounded-2xl"></div>
          
          {/* Professional accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-600 rounded-t-2xl"></div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;