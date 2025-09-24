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
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            Why Choose Frevo?
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Experience the difference with our comprehensive freelancing platform designed for success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animate-fade-in-up light-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="icon-wrapper">
                <span className="card-icon">{feature.icon}</span>
              </div>
              <h3 className="card-title">{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;