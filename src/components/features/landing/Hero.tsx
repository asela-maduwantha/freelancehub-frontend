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
    <section className="min-h-screen relative overflow-hidden bg-hero-gradient">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-hero-particle animate-float-particle"
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

              <p className="text-lg lg:text-xl text-white max-w-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Connect with top-tier freelance professionals for your next big idea.
              </p>
              
              <p className="text-base text-white font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
                  className="border-2 border-white text-white hover:bg-white hover:text-[#2A4A5B] px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Find Work
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="relative animate-float">
            <div className="absolute -inset-4 bg-hero-glow rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;