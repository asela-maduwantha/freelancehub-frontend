import React from 'react';
import Button from '../../ui/Button';

const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-dark-gradient-1">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-white-5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white-90">
            Join thousands of professionals and businesses who trust Frevo to connect them with top freelance talent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg">
              Start as a Client
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#2A4A5B] transform hover:scale-105 transition-all duration-300 px-8 py-3 text-lg rounded-lg font-semibold">
              Join as a Freelancer
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm animate-fade-in-up text-white-80" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Social proof numbers */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-white-70">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-sm text-white-70">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">4.9★</div>
              <div className="text-sm text-white-70">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;