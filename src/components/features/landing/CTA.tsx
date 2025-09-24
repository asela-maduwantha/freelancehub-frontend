import React from 'react';
import Button from '../../ui/Button';

const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-dark-gradient-2">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-primary/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-secondary">
            Join thousands of professionals and businesses who trust Frevo to connect them with top freelance talent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="btn-primary px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
              Start as a Client
            </button>
            <button className="btn-outline px-8 py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
              Join as a Freelancer
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm animate-fade-in-up text-secondary" style={{ animationDelay: '0.3s' }}>
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
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-secondary">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">50K+</div>
              <div className="text-sm text-secondary">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">4.9★</div>
              <div className="text-sm text-secondary">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;