import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-accent/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse delay-500"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-white/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;