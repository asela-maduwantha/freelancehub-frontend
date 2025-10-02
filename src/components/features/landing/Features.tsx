import React from 'react';
import { Search, Zap, MessageCircle, Star, BarChart3, Globe } from 'lucide-react';
import { Card } from '../../ui/Card';

const Features: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm connects you with the perfect freelancer based on skills, experience, and project requirements.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Hiring',
      description: 'Post a job and start receiving proposals within hours. Streamlined process with built-in escrow protection.'
    },
    {
      icon: MessageCircle,
      title: 'Seamless Communication',
      description: 'Built-in messaging, video calls, and file sharing for effortless collaboration between clients and freelancers.'
    },
    {
      icon: Star,
      title: 'Verified Quality',
      description: 'All freelancers are vetted with skill assessments, background checks, and portfolio verification.'
    },
    {
      icon: BarChart3,
      title: 'Smart Project Management',
      description: 'Advanced dashboards, milestone tracking, time logging, and automated invoicing for complete project control.'
    },
    {
      icon: Globe,
      title: 'Global Talent Pool',
      description: 'Access over 50,000+ skilled professionals from 180+ countries, available 24/7 for your projects.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-blue-100/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-300/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Why Choose <span className="bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">Frevo</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our comprehensive freelancing platform designed for success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/90 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon with enhanced styling */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transform group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                {/* Floating accent dot */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 animate-bounce transition-opacity duration-300"></div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;