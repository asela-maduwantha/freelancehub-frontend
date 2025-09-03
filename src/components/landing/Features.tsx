"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Shield,
  DollarSign,
  MessageCircle,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

const features = [
  {
    icon: <Search className="w-6 h-6" />,
    title: "Find Local Talent Fast",
    description:
      "Search and filter among thousands of verified Sri Lankan freelancers with the exact skills you need.",
    stats: "1,250+ Freelancers",
    color: "bg-green-500",
    hoverColor: "group-hover:bg-green-600",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Professionals",
    description:
      "Every freelancer is verified with ID and skill verification to ensure quality and trust.",
    stats: "100% Verified",
    color: "bg-green-500",
    hoverColor: "group-hover:bg-green-600",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Secure Payments",
    description:
      "Integrated with PayHere for secure, escrow-based payments in Sri Lankan Rupees.",
    stats: "₨50M+ Secured",
    color: "bg-purple-500",
    hoverColor: "group-hover:bg-purple-600",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Direct Communication",
    description:
      "Chat directly with freelancers to discuss your project requirements and expectations.",
    stats: "24/7 Support",
    color: "bg-orange-500",
    hoverColor: "group-hover:bg-orange-600",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Local Expertise",
    description:
      "Access professionals who understand Sri Lankan business contexts and requirements.",
    stats: "All 9 Provinces",
    color: "bg-teal-500",
    hoverColor: "group-hover:bg-teal-600",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Quick Turnaround",
    description:
      "Get your projects completed faster with dedicated local talent in your timezone.",
    stats: "48hr Avg. Delivery",
    color: "bg-red-500",
    hoverColor: "group-hover:bg-red-600",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
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
            <Star className="w-4 h-4" />
            Premium Features
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;ve built the most reliable platform for connecting Sri
            Lankan businesses with top local freelance talent.
          </p>
        </motion.div>

        {/* Interactive Features Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              {/* Background Gradient Effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${feature.color.replace('bg-', '#')}40, transparent)`
                }}
              />

              {/* Icon Container */}
              <motion.div
                className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 relative overflow-hidden`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={hoveredCard === index ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Stats Badge */}
                <motion.div
                  className="flex items-center gap-2 pt-2"
                  initial={{ opacity: 0 }}
                  animate={hoveredCard === index ? { opacity: 1 } : { opacity: 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {feature.stats}
                  </span>
                </motion.div>
              </div>

              {/* Interactive Border */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-500"
                initial={{ width: 0 }}
                animate={hoveredCard === index ? { width: '100%' } : { width: 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Floating Particles Effect */}
              {hoveredCard === index && (
                <>
                  {[...Array(3)].map((_, i) => {
                    // Static positions to prevent hydration mismatch
                    const positions = [
                      { x: '20%', y: '30%' },
                      { x: '70%', y: '60%' },
                      { x: '50%', y: '20%' }
                    ];
                    
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60"
                        initial={{ 
                          x: positions[i].x,
                          y: positions[i].y,
                          scale: 0 
                        }}
                        animate={{ 
                          y: '-20px',
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 1.5,
                          delay: i * 0.2,
                          repeat: Infinity 
                        }}
                      />
                    );
                  })}
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Features
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
