'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Find Talent', href: '#find-talent' },
    { label: 'Find Work', href: '#find-work' },
    { label: 'How it Works', href: '#how-it-works' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'nav-light'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="nav-content" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="logo">
          Frevo
        </div>

        {/* Desktop Navigation */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="nav-link"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="btn-outline">
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button className="btn-accent">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-secondary hover:text-accent transition-colors p-3 rounded-xl hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-accent/50 backdrop-blur-sm"
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
            className="absolute top-full left-0 right-0 bg-white lg:hidden shadow-lg border-t border-primary/10"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-6 py-6 space-y-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-secondary hover:text-accent transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-primary-lighter border border-transparent hover:border-primary/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile CTA */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-primary/10">
                <Link href="/login" className="w-full">
                  <button className="w-full btn-outline">
                    Sign In
                  </button>
                </Link>
                <Link href="/register" className="w-full">
                  <button className="w-full btn-accent">
                    Get Started
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

export default Header;