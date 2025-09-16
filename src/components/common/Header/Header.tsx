import React from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Button from '../../ui/Button';

interface NavItem {
  label: string;
  href: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems: NavItem[] = [
    { label: 'Find Talent', href: '#find-talent' },
    { label: 'Find Work', href: '#find-work' },
    { label: 'How it Works', href: '#how-it-works' }
  ];

  return (
    <header className="relative z-50" role="banner">
      <nav className="flex items-center justify-between p-6 lg:px-8" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-emerald-700 rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-2xl font-bold text-white">Frevo</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white hover:text-orange-200 transition-colors duration-200 font-medium"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="md">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white hover:text-orange-200 transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            className="absolute top-full left-0 right-0 bg-emerald-800 lg:hidden shadow-xl"
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-white hover:text-orange-200 transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
        {/* Mobile CTA */}
        <div className="lg:hidden flex flex-col space-y-3 pt-4">
          <Link href="/login" className="w-full">
            <Button variant="outline" size="md" className="w-full">
              Login
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button variant="primary" size="md" className="w-full">
              Get Started
            </Button>
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