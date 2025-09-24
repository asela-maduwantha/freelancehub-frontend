import React from 'react';
import { Card } from '../../ui/Card';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'Frevo helped us find an amazing designer who completely transformed our brand identity. The quality of work and communication was outstanding.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      company: 'InnovateLab',
      content: 'As a startup, we needed reliable developers quickly. Frevo delivered exactly what we needed - skilled professionals who understood our vision.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      company: 'DataFlow Inc',
      content: 'The platform made it so easy to manage our freelance projects. The escrow system gave us peace of mind, and the results exceeded our expectations.',
      rating: 5,
      avatar: 'ER'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50/40 via-red-50/30 to-orange-50/40 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 w-28 h-28 bg-gradient-to-br from-orange-400/12 to-red-400/12 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-36 h-36 bg-gradient-to-br from-red-400/12 to-orange-400/12 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-orange-300/8 to-red-300/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-red-300/8 to-orange-300/8 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            What Our <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Users Say</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what clients and freelancers have to say about their experience on Frevo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-white/85 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/95 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/4 to-red-500/4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Star rating with enhanced styling */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span
                    key={i}
                    className="text-lg transform group-hover:scale-110 transition-all duration-300 text-orange-500 group-hover:text-orange-600"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ★
                  </span>
                ))}
                {/* Floating accent elements */}
                <div className="ml-2 flex space-x-1">
                  <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300"></div>
                  <div className="w-2 h-2 bg-gradient-to-br from-red-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300" style={{ animationDelay: '0.1s' }}></div>
                </div>
              </div>

              {/* Quote icon */}
              <div className="mb-4">
                <svg className="w-8 h-8 text-orange-500/60 group-hover:text-orange-600/80 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z" />
                </svg>
              </div>

              <p className="text-gray-600 mb-8 italic leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-lg">
                "{testimonial.content}"
              </p>

              {/* User info with enhanced styling */}
              <div className="flex items-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="relative mr-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300">
                    {testimonial.avatar}
                  </div>
                  {/* Avatar glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {testimonial.role} at <span className="font-medium text-orange-600">{testimonial.company}</span>
                  </p>
                </div>
              </div>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">★</span>
              </div>
              <span className="text-gray-600 font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👥</span>
              </div>
              <span className="text-gray-600 font-medium">10,000+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="text-gray-600 font-medium">Verified Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;