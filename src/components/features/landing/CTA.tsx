import React from 'react';
import Button from '../../ui/Button';

const CTA: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-orange-50/50 via-red-50/40 to-orange-50/50">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-orange-300/12 to-red-300/12 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-red-400/8 to-orange-400/8 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-18 h-18 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
            Ready to Get <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Started</span>?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Join thousands of professionals and businesses who trust Frevo to connect them with top freelance talent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Start as a Client</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="group bg-white/90 backdrop-blur-sm border-2 border-orange-200 text-gray-800 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/10 hover:border-orange-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Join as a Freelancer</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm animate-fade-in-up text-gray-600" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="group-hover:text-gray-800 transition-colors duration-300">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="group-hover:text-gray-800 transition-colors duration-300">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="group-hover:text-gray-800 transition-colors duration-300">Cancel anytime</span>
            </div>
          </div>

          {/* Social proof numbers */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
              <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors duration-300">10K+</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Active Users</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
            <div className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
              <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors duration-300">50K+</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Projects Completed</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
            <div className="group text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
              <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors duration-300">4.9★</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Average Rating</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;