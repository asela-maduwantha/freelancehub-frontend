import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does the escrow payment system work?',
      answer: 'Our escrow system protects both clients and freelancers. When you hire a freelancer, funds are held securely until milestones are completed and approved. This ensures freelancers get paid for quality work and clients receive what they expect.'
    },
    {
      question: 'What are the fees for using Frevo?',
      answer: 'Frevo offers a free tier for basic use. Our Professional plan starts at $29/month with unlimited projects. Enterprise plans are customized based on your needs. There are no hidden fees or commissions on project payments.'
    },
    {
      question: 'How do you verify freelancers?',
      answer: 'We verify freelancers through multiple checks including identity verification, skill assessments, portfolio reviews, and background checks. All freelancers must complete our verification process before they can bid on projects.'
    },
    {
      question: 'What if I\'m not satisfied with the work?',
      answer: 'We have a dispute resolution process to handle any issues. If you\'re not satisfied, you can request revisions or initiate a dispute. Our team will mediate and ensure a fair resolution. Funds are only released when both parties are satisfied.'
    },
    {
      question: 'Can I hire freelancers for long-term projects?',
      answer: 'Absolutely! Many clients hire freelancers for ongoing work, monthly retainers, or long-term partnerships. You can set up recurring contracts and manage ongoing relationships through our platform.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures. We partner with trusted payment processors and never store your full payment information on our servers. All transactions are PCI compliant.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-red-50/30 via-orange-50/40 to-red-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 right-12 w-32 h-32 bg-gradient-to-br from-orange-400/8 to-red-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-12 left-12 w-40 h-40 bg-gradient-to-br from-red-400/8 to-orange-400/8 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-300/6 to-red-300/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-gradient-to-br from-red-300/6 to-orange-300/6 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Frequently Asked <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers. If you don't see what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 to-red-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-2xl transition-all duration-300 relative z-10"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-orange-500/30 transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-bold text-sm">
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </div>
                </div>
              </button>

              {openIndex === index && (
                <div className="px-8 pb-6 relative z-10">
                  <div className="border-t border-orange-200/50 pt-4 mt-2">
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Subtle bottom accent */}
              <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 ${
                openIndex === index ? 'scale-x-100' : 'scale-x-0'
              } origin-left`}></div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300">
            <span>Contact Support</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;