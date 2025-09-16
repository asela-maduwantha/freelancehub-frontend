import React from 'react';
import Link from 'next/link';
import Header from '../../common/Header';
import Button from '../../ui/Button';
import SearchBar from '../../ui/Input/SearchInput';
import HeroIllustration from '../../ui/Media/Image';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-2 border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-1000"></div>
      </div>

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-120px)]">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight animate-slide-in-left">
                Your Vision,
                <br />
                <span className="text-orange-400 animate-pulse">Our Network</span>
              </h1>

              <p className="text-lg lg:text-xl text-emerald-100 max-w-lg mx-auto lg:mx-0 animate-fade-in-up delay-300">
                Connect with top-tier freelance professionals for your next big idea.
                <span className="block mt-2 text-orange-300 font-semibold animate-pulse">Trusted by 10,000+ businesses worldwide • 4.9★ average rating</span>
              </p>
            </div>

            <div className="space-y-6 animate-fade-in-up delay-500">
              <SearchBar />

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Find Talent
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="transform hover:scale-105 transition-all duration-300 hover:bg-white hover:text-emerald-800"
                  >
                    Find Work
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-right delay-700">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-emerald-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;