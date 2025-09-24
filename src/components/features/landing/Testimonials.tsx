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
    <section className="py-20 bg-dark-gradient-1">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Don't just take our word for it. Here's what clients and freelancers have to say about their experience on Frevo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="animate-fade-in-up light-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span
                    key={i}
                    className="text-lg transform group-hover:scale-110 transition-transform duration-300 text-accent"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-secondary mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center transform group-hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold mr-4 bg-primary text-white shadow-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-primary">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-secondary">
                    {testimonial.role} at {testimonial.company}
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

export default Testimonials;