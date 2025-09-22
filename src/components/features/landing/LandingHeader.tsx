'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

const LandingHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { label: 'Find Talent', href: '#find-talent' },
    { label: 'Find Work', href: '#find-work' },
    { label: 'How it Works', href: '#how-it-works' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent" role="banner">
      <nav className="flex items-center justify-between w-3/5 mx-auto my-2 p-3 lg:px-4 bg-hero-gradient border border-white shadow-lg rounded-[20px]" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 bg-white rounded-md transform rotate-45"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Frevo</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-white/90 hover:text-white transition-all duration-300 font-medium group py-2"
            >
              {item.label}
              <span className="absolute right-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-white/50 scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login">
            <button className="text-white border-2 border-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#2A4A5B] transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-white/50">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              Register
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white hover:text-accent transition-colors p-3 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-bg-secondary/95 backdrop-blur-lg lg:hidden shadow-2xl border-t border-white/10"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-6 py-6 space-y-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-white/90 hover:text-white transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile CTA */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-white/10">
                <Link href="/login" className="w-full">
                  <button className="w-full text-white border-2 border-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#2A4A5B] transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-white/50">
                    Login
                  </button>
                </Link>
                <Link href="/register" className="w-full">
                  <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    Register
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default LandingHeader;