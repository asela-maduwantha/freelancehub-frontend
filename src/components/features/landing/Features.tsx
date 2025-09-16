import React from 'react';
import { Card } from '../../ui/Card';

const Features: React.FC = () => {
  const features = [
    {
      icon: '🔍',
      title: 'AI-Powered Matching',
      description: 'Our intelligent algorithm connects you with the perfect freelancer based on skills, experience, and project requirements.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Hiring',
      description: 'Post a job and start receiving proposals within hours. Streamlined process with built-in escrow protection.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '💬',
      title: 'Seamless Communication',
      description: 'Built-in messaging, video calls, and file sharing for effortless collaboration between clients and freelancers.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '⭐',
      title: 'Verified Quality',
      description: 'All freelancers are vetted with skill assessments, background checks, and portfolio verification.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📊',
      title: 'Smart Project Management',
      description: 'Advanced dashboards, milestone tracking, time logging, and automated invoicing for complete project control.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: '🌐',
      title: 'Global Talent Pool',
      description: 'Access over 50,000+ skilled professionals from 180+ countries, available 24/7 for your projects.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-geist-sans">
            Why Choose Frevo?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-geist-sans">
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
              <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 relative overflow-hidden group">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`}></div>

                <div className="relative z-10">
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors font-geist-sans">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;