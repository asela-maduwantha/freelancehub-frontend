import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Post Your Project',
      description: 'Create a detailed project brief with your requirements, budget, and timeline. Our smart matching system will find the perfect freelancers for your needs.'
    },
    {
      step: '02',
      title: 'Review Proposals',
      description: 'Receive proposals from qualified freelancers. Review their portfolios, ratings, and proposals to find the best match for your project.'
    },
    {
      step: '03',
      title: 'Hire & Collaborate',
      description: 'Choose your freelancer and start working together. Use our built-in tools for communication, file sharing, and project management.'
    },
    {
      step: '04',
      title: 'Pay Securely',
      description: 'Milestone-based payments ensure your money is protected. Release payments only when you\'re satisfied with the work delivered.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/8 to-red-400/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-20 w-36 h-36 bg-gradient-to-br from-red-400/8 to-orange-400/8 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-orange-300/6 to-red-300/6 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            How It <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Follow these four easy steps to find and hire top freelance talent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group text-center relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/90 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 to-red-500/3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Step number with enhanced styling */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300 mx-auto">
                  {step.step}
                </div>
                {/* Connecting line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                )}
                {/* Floating accent dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300"></div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {step.description}
              </p>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 cursor-pointer">
            <span className="font-semibold">Ready to Get Started?</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;