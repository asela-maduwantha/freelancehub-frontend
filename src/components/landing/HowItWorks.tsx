"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Users, 
  CheckCircle,
  Star,
  MessageCircle,
  CreditCard
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Post Your Project",
    description:
      "Describe your project needs, set your budget, and specify requirements. Our smart matching system will find the perfect candidates.",
    image: "/post-job.jpg",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    stats: "2 min setup",
    features: ["Smart matching", "Budget guidance", "Skill suggestions"]
  },
  {
    number: "02", 
    title: "Get Proposals",
    description:
      "Receive detailed proposals from qualified Sri Lankan freelancers within hours. Compare portfolios and rates easily.",
    image: "/get-proposal.jpg",
    icon: <Users className="w-6 h-6" />,
    color: "from-green-500 to-green-600",
    stats: "24hr response",
    features: ["Verified profiles", "Portfolio reviews", "Rate comparison"]
  },
  {
    number: "03",
    title: "Hire the Best Talent", 
    description:
      "Review profiles, portfolios and select the perfect match for your project. Interview candidates through our platform.",
    image: "/hire-talent.jpg",
    icon: <Star className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600",
    stats: "Top 5% talent",
    features: ["Video interviews", "Skill tests", "Reference checks"]
  },
  {
    number: "04",
    title: "Work Together",
    description:
      "Collaborate efficiently with messaging, file sharing, milestone tracking and real-time progress updates.",
    image: "/work-together.jpg",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "from-orange-500 to-orange-600", 
    stats: "Real-time sync",
    features: ["Live collaboration", "File sharing", "Progress tracking"]
  },
  {
    number: "05",
    title: "Pay Securely",
    description:
      "Release payments through our secure escrow system when work meets your satisfaction. Rate and review for future projects.",
    image: "/pay-secure.jpg",
    icon: <CreditCard className="w-6 h-6" />,
    color: "from-teal-500 to-teal-600",
    stats: "100% secure",
    features: ["Escrow protection", "PayHere integration", "Rating system"]
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
            <Play className="w-4 h-4" />
            Step by Step Process
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our simple process makes it easy to find, hire and work with the
            best freelancers in Sri Lanka
          </p>
        </motion.div>

        {/* Interactive Steps */}
        <div ref={ref} className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-16 relative`}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              onHoverStart={() => setActiveStep(index)}
              onHoverEnd={() => setActiveStep(null)}
            >
              {/* Step Number with Progress Line */}
              {index < steps.length - 1 && (
                <motion.div
                  className={`absolute ${index % 2 === 0 ? 'left-1/2' : 'right-1/2'} top-20 w-px h-24 bg-gradient-to-b from-gray-300 to-transparent hidden md:block`}
                  initial={{ height: 0 }}
                  animate={isInView ? { height: 96 } : { height: 0 }}
                  transition={{ delay: (index + 1) * 0.3, duration: 0.5 }}
                />
              )}

              {/* Content Side */}
              <motion.div 
                className="w-full md:w-1/2 space-y-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step Header */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} text-white flex items-center justify-center font-bold text-xl shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    animate={activeStep === index ? { scale: 1.05 } : { scale: 1 }}
                  >
                    {step.number}
                    
                    {/* Animated Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-white opacity-0"
                      animate={activeStep === index ? { 
                        opacity: [0, 1, 0],
                        scale: [1, 1.2, 1.4]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold text-gray-900"
                      animate={activeStep === index ? { color: "#059669" } : { color: "#111827" }}
                    >
                      {step.title}
                    </motion.h3>
                    
                    {/* Stats Badge */}
                    <motion.div
                      className="flex items-center gap-2 mt-2"
                      initial={{ opacity: 0.7 }}
                      animate={activeStep === index ? { opacity: 1 } : { opacity: 0.7 }}
                    >
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{step.stats}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Description */}
                <motion.p 
                  className="text-lg text-gray-600 leading-relaxed"
                  animate={activeStep === index ? { color: "#4B5563" } : { color: "#6B7280" }}
                >
                  {step.description}
                </motion.p>

                {/* Feature List */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={activeStep === index ? { opacity: 1 } : { opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-gray-600"
                      initial={{ x: -10, opacity: 0 }}
                      animate={activeStep === index ? { x: 0, opacity: 1 } : { x: -10, opacity: 0.7 }}
                      transition={{ delay: featureIndex * 0.1 }}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`} />
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Interactive CTA */}
                <motion.button
                  className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
                  whileHover={{ x: 5 }}
                  animate={activeStep === index ? { scale: 1.05 } : { scale: 1 }}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              {/* Image Side */}
              <motion.div 
                className="w-full md:w-1/2 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-xl"
                  animate={activeStep === index ? { 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  } : {}}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  
                  {/* Overlay with Icon */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 flex items-center justify-center transition-opacity duration-300`}
                    animate={activeStep === index ? { opacity: 0.1 } : { opacity: 0 }}
                  >
                    <motion.div
                      className="text-white"
                      animate={activeStep === index ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div
                    className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg"
                    initial={{ y: -10, opacity: 0 }}
                    animate={activeStep === index ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      {step.icon}
                      <span className="text-sm font-medium">Step {step.number}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Decorative Elements */}
                {activeStep === index && (
                  <>
                    {[...Array(4)].map((_, i) => {
                      // Static positions to prevent hydration mismatch
                      const positions = [
                        { x: 150, y: 100 },
                        { x: 250, y: 120 },
                        { x: 180, y: 160 },
                        { x: 220, y: 80 }
                      ];
                      
                      return (
                        <motion.div
                          key={i}
                          className={`absolute w-3 h-3 rounded-full bg-gradient-to-r ${step.color} opacity-60`}
                          initial={{ 
                            x: positions[i].x,
                            y: positions[i].y,
                            scale: 0 
                          }}
                          animate={{ 
                            y: positions[i].y - 50,
                            scale: [0, 1, 0],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity 
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Progress Indicator */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStep === index ? 'w-8 bg-green-500' : 'w-2 bg-gray-300'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
