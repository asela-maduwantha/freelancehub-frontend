"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, Search, HelpCircle, MessageCircle, ExternalLink } from "lucide-react";

const faqs = [
  {
    question: "How do I sign up as a freelancer?",
    answer:
      "You can sign up as a freelancer by clicking the 'Get Started' button, choosing the freelancer option, and completing your profile with your skills, experience, and portfolio. Our verification process typically takes 24-48 hours.",
    category: "Getting Started",
    popular: true,
  },
  {
    question: "What types of payment methods are supported?",
    answer:
      "We support secure payments through PayHere, which offers various options including credit/debit cards, bank transfers, and mobile payment methods popular in Sri Lanka. All transactions are encrypted and secure.",
    category: "Payments",
    popular: true,
  },
  {
    question: "How much does it cost to hire a freelancer?",
    answer:
      "Freelancer rates vary depending on their skills, experience, and the complexity of your project. You can view freelancers' hourly rates or project-based fees on their profiles. Rates typically range from ₨500-₨5000 per hour.",
    category: "Pricing",
    popular: true,
  },
  {
    question: "Is there a fee for using the platform?",
    answer:
      "Yes, we charge a small service fee to maintain the platform. Clients pay a 5% fee on payments, while freelancers pay a 10% fee on earnings. These fees help us provide secure payments, customer support, and continuous platform improvements.",
    category: "Pricing",
    popular: false,
  },
  {
    question: "How do you verify freelancers?",
    answer:
      "We verify freelancers through a comprehensive process that includes ID verification, skill assessment, and portfolio review. We also maintain a rating system based on client feedback and conduct random quality checks.",
    category: "Security",
    popular: true,
  },
  {
    question: "What happens if I'm not satisfied with the work?",
    answer:
      "We offer dispute resolution services. If you're not satisfied with the work, you can raise a dispute within our platform. Our team will review the case and help reach a fair resolution within 3-5 business days.",
    category: "Support",
    popular: false,
  },
  {
    question: "How quickly can I find a freelancer?",
    answer:
      "Most projects receive proposals within 24 hours. Our smart matching system helps connect you with relevant freelancers quickly. You can typically hire someone within 48-72 hours of posting your project.",
    category: "Getting Started",
    popular: true,
  },
  {
    question: "Can I work with international clients?",
    answer:
      "Yes! While our platform focuses on Sri Lankan talent, we welcome international clients. All payments are processed securely, and we support multiple currencies through our payment partners.",
    category: "International",
    popular: false,
  },
];

const categories = ["All", "Getting Started", "Payments", "Pricing", "Security", "Support", "International"];

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our platform. Can&apos;t find what you&apos;re looking for?
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4 }}
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Popular Questions */}
        {searchTerm === "" && selectedCategory === "All" && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔥
              </motion.div>
              Popular Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularFaqs.slice(0, 4).map((faq, index) => (
                <motion.div
                  key={`popular-${index}`}
                  className="bg-gradient-to-r from-green-50 to-green-50 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    const originalIndex = faqs.findIndex(f => f.question === faq.question);
                    toggleFAQ(originalIndex);
                  }}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <p className="font-medium text-gray-800 text-sm">{faq.question}</p>
                  <span className="text-xs text-green-600 font-medium">Click to expand</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ List */}
        <div ref={ref} className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
              <motion.button
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                whileHover={{ scale: 1.05 }}
              >
                Clear filters
              </motion.button>
            </motion.div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <button
                  className="flex justify-between items-center w-full p-6 text-left"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {faq.category}
                      </span>
                      {faq.popular && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-lg text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-600 border-t border-gray-100 bg-gray-50">
                        <p className="leading-relaxed">{faq.answer}</p>
                        
                        {/* Helpful Actions */}
                        <div className="mt-4 flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Was this helpful?</span>
                          <div className="flex gap-2">
                            <motion.button
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              👍 Yes
                            </motion.button>
                            <motion.button
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              👎 No
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <motion.div
          className="mt-16 text-center bg-gradient-to-r from-green-50 to-green-50 p-8 rounded-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Please chat with our friendly team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </motion.button>
            <motion.button
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-5 h-5" />
              Documentation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
