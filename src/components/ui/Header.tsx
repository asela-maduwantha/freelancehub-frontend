'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  showNavigation?: boolean;
  backLink?: string;
  backText?: string;
  currentPage?: string;
  user?: any;
  stats?: any;
  onLogout?: () => void;
}

export default function Header({
  showNavigation = false,
  backLink,
  backText,
  currentPage,
  user,
  stats,
  onLogout
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/client/dashboard' },
    { name: 'Projects', href: '/client/projects' },
    { name: 'Find Talent', href: '/client/freelancers' },
    { name: 'Contracts', href: '/client/contracts' },
    { name: 'Payments', href: '/client/payments' },
    { name: 'Reviews', href: '/client/reviews' },
    { name: 'Disputes', href: '/client/disputes' },
    { name: 'Files', href: '/client/files' },
    { name: 'Profile', href: '/client/profile' },
    { name: 'Messages', href: '/client/messages' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
            </Link>
            {showNavigation && (
              <div className="hidden md:flex items-center space-x-6 ml-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      currentPage === item.name.toLowerCase()
                        ? 'text-green-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {backLink && backText && (
            <Link
              href={backLink}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {backText}
            </Link>
          )}

          {showNavigation && user && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {stats && stats.pendingProposals > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingProposals}
                  </span>
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <img src="/user.jpg" alt={user.firstName} className="h-8 w-8 rounded-full" />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500">Client</div>
                </div>
              </div>
              {onLogout && (
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
