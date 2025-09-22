import React from 'react';
import { Card } from '../../ui/Card';

const Features: React.FC = () => {
  const features = [
    {
      icon: '🔍',
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm connects you with the perfect freelancer based on skills, experience, and project requirements.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Hiring',
      description: 'Post a job and start receiving proposals within hours. Streamlined process with built-in escrow protection.'
    },
    {
      icon: '💬',
      title: 'Seamless Communication',
      description: 'Built-in messaging, video calls, and file sharing for effortless collaboration between clients and freelancers.'
    },
    {
      icon: '⭐',
      title: 'Verified Quality',
      description: 'All freelancers are vetted with skill assessments, background checks, and portfolio verification.'
    },
    {
      icon: '📊',
      title: 'Smart Project Management',
      description: 'Advanced dashboards, milestone tracking, time logging, and automated invoicing for complete project control.'
    },
    {
      icon: '🌐',
      title: 'Global Talent Pool',
      description: 'Access over 50,000+ skilled professionals from 180+ countries, available 24/7 for your projects.'
    }
  ];

  return (
    <section className="py-20 bg-dark-gradient-2">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Why Choose Frevo?
          </h2>
          <p className="text-lg text-white-80 max-w-2xl mx-auto">
            Experience the difference with our comprehensive freelancing platform designed for success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white-10 backdrop-blur-sm border border-white-20 text-center p-6 relative overflow-hidden group rounded-xl hover:bg-white-15 transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white-70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;