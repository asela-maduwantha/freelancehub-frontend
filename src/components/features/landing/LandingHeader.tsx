'use client';

import React from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';

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
    { label: 'For Clients', href: '#find-talent' },
    { label: 'For Freelancers', href: '#find-talent' },
    { label: 'How It Works', href: '#how-it-works' }
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
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header
        className={`site-header fixed top-0 left-0 right-0 z-[100] py-2 transition-all duration-700 ease-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-md lg:bg-white/80'
        }`}
        role="banner"
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full opacity-20"
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

        <nav className="nav-content relative max-w-7xl mx-auto px-4 lg:px-8 flex justify-between items-center" role="navigation" aria-label="Main navigation">
          <div className="flex items-center justify-between w-full h-16">
            
            {/* Enhanced Logo */}
            <a
              href="/"
              className="logo group flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
              aria-label="Frevo homepage"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles className="w-6 h-6 text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                Frevo
              </span>
            </a>

            {/* Enhanced Desktop Navigation */}
            <ul className="hidden lg:flex items-center space-x-2">
              {navItems.map((item, index) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="nav-link group relative px-5 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="relative z-10 font-medium">{item.label}</span>
                    <div className="absolute bottom-2 left-5 right-5 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>
                </li>
              ))}
            </ul>

            {/* Enhanced Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <a href="/login">
                <button className="group relative px-6 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-blue-50 hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2">
                  <span className="relative z-10">Sign In</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </a>
              <a href="/register">
                <button className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 overflow-hidden">
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </button>
              </a>
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="mobile-menu-container lg:hidden">
              <button
                className={`relative p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-blue-500/50 group ${
                  isMenuOpen 
                    ? 'bg-blue-600 border-blue-600' 
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute block w-6 h-0.5 transform transition-all duration-300 rounded-full ${
                    isMenuOpen 
                      ? 'rotate-45 translate-y-2.5 bg-white' 
                      : 'translate-y-1 bg-gray-700'
                  }`} />
                  <span className={`absolute block w-6 h-0.5 bg-gray-700 transform transition-all duration-300 rounded-full ${
                    isMenuOpen ? 'opacity-0' : 'translate-y-2.5'
                  }`} />
                  <span className={`absolute block w-6 h-0.5 transform transition-all duration-300 rounded-full ${
                    isMenuOpen 
                      ? '-rotate-45 translate-y-2.5 bg-white' 
                      : 'translate-y-4 bg-gray-700'
                  }`} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </nav>

        {/* Enhanced Mobile Navigation */}
        <div
          className={`mobile-menu-panel fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out border-l border-white/20 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col h-full">
            {/* Enhanced Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <a
                  href="/"
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Frevo
                </a>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Close menu"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Enhanced Mobile Navigation Links */}
            <div className="flex-1 px-6 py-8">
              <ul className="space-y-3">
                {navItems.map((item, index) => (
                  <li key={item.label}>
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className="group w-full text-left py-4 px-5 text-lg font-semibold text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span>{item.label}</span>
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <div className="absolute bottom-2 left-5 right-5 h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Mobile CTA */}
            <div className="p-6 border-t border-white/20 bg-gradient-to-br from-blue-50/50 to-blue-100/50 space-y-4">
              <a href="/login" className="block">
                <button
                  className="w-full py-4 px-6 text-base font-semibold text-gray-700 bg-white rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </button>
              </a>
              <a href="/register" className="block">
                <button
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default LandingHeader;