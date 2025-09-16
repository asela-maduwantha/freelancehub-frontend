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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started is simple. Follow these four easy steps to find and hire top freelance talent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-emerald-200 transform -translate-x-8"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;