'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LandingHeader from './LandingHeader';
import Button from '../../ui/Button';
import SearchBar from '../../ui/Input/SearchInput';
import HeroIllustration from '../../ui/Media/Image';

const HeroSection: React.FC = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles for background animation
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      left: Math.random() * 100, // 0-100%
      top: Math.random() * 100, // 0-100%
      animationDelay: Math.random() * 20, // 0-20s
      duration: Math.random() * 10 + 15, // 15-25s
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="min-h-screen mt-10 relative overflow-hidden bg-hero-gradient">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/10 animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <LandingHeader />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-160px)]">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight animate-slide-in-left">
                Your Vision,
                <br />
                <span className="text-accent">Our Network</span>
              </h1>

              <p className="text-lg lg:text-xl text-white/80 max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Connect with top-tier freelance professionals for your next big idea.
              </p>

              <p className="text-base text-white/60 font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Trusted by 10,000+ businesses worldwide • <span className="text-accent">4.9★</span> average rating
              </p>
            </div>

            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <SearchBar />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="btn-accent px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Find Talent
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="btn-outline px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Find Work
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Illustration Display */}
          <div className="relative animate-float">
            {/* Multiple layered background effects */}
            <div className="absolute -inset-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
            <div className="absolute -inset-6 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-2xl blur-xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-600/10 to-red-600/10 rounded-xl blur-lg opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Main image container with enhanced styling */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-700 hover:shadow-orange-500/20">
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl"></div>
              
              {/* Image with improved presentation */}
              <div className="relative overflow-hidden rounded-xl bg-white shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-30"></div>
                <div className="relative transform transition-transform duration-500 hover:scale-110">
                  <HeroIllustration />
                </div>
              </div>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/3 -right-6 w-4 h-4 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Additional floating decorative elements */}
            <div className="absolute top-10 -left-6 w-16 h-16 border-2 border-orange-400/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute bottom-10 -right-8 w-12 h-12 border-2 border-red-400/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
            
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;