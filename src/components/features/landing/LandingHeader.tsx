'use client';

import React from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

const LandingHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroSection = document.querySelector('section');
      const heroHeight = heroSection ? heroSection.offsetHeight : 600;
      setIsScrolled(scrollY > heroHeight - 100);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Enhanced mobile menu handlers
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.mobile-menu-panel')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems: NavItem[] = [
    { label: 'Find Talent', href: '#find-talent' },
    { label: 'Find Work', href: '#find-work' },
    { label: 'How it Works', href: '#how-it-works' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40 lg:hidden" 
             onClick={() => setIsMenuOpen(false)} />
      )}

      <header
        className={`site-header fixed top-0 left-0 right-0 z-[100] py-4 transition-all duration-700 ease-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
            : 'bg-white/80 backdrop-blur-md'
        }`}
        role="banner"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-20"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                transform: `translate(${mousePosition.x * 0.01 * (i + 1)}px, ${mousePosition.y * 0.01 * (i + 1)}px)`,
                transition: 'transform 0.5s ease-out',
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        <nav className="nav-content relative max-w-6xl mx-auto px-4 lg:px-6 flex justify-center" role="navigation" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            
            {/* Simple Logo */}
            <Link
              href="/"
              className="logo group flex items-center space-x-2"
              aria-label="Frevo homepage"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                Frevo
              </span>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="nav-link group relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-lg hover:bg-orange-50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/login">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300 rounded-lg hover:bg-gray-50">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="group px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu-container lg:hidden">
              <button
                className="relative p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute block w-5 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
                  }`} />
                  <span className={`absolute block w-5 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'translate-y-2'
                  }`} />
                  <span className={`absolute block w-5 h-0.5 bg-gray-700 transform transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Enhanced Mobile Navigation */}
        <div
          className={`mobile-menu-panel fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-all duration-500 ease-out border-l border-gray-100 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Enhanced Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <Link
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Frevo
                </Link>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                aria-label="Close menu"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Enhanced Mobile Navigation Links */}
            <div className="flex-1 px-6 py-8">
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <li key={item.label}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="group w-full text-left py-4 px-4 text-lg font-medium text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 transform hover:translate-x-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Mobile CTA */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <Link href="/login" className="block">
                <button
                  className="w-full btn-ghost py-3 text-base font-medium text-gray-700 hover:text-gray-900 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </button>
              </Link>
              <Link href="/register" className="block">
                <button
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default LandingHeader;