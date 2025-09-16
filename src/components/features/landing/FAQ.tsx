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
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers. If you don't see what you're looking for, feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <span className="text-2xl text-gray-500">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;