"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Play, Star, Users, CheckCircle } from "lucide-react";

export default function Hero() {
  const [activeStats, setActiveStats] = useState<number[]>([]);
  const controls = useAnimation();
  
  // Dummy stats for display
  const displayStats = [
    { number: 1250, suffix: "+", label: "Active Freelancers" },
    { number: 850, suffix: "+", label: "Projects Completed" },
    { number: 4.9, suffix: "/5", label: "Average Rating" },
    { number: 24, suffix: "hrs", label: "Avg. Response Time" },
  ];

  const skillTags = [
    "Web Development", "UI/UX Design", "Content Writing", "Digital Marketing",
    "Mobile Apps", "Logo Design", "SEO", "Social Media", "Data Analysis",
    "Graphic Design", "WordPress", "React", "Python", "Photography"
  ];

  useEffect(() => {
    // Animate stats counter
    displayStats.forEach((stat, index) => {
      setTimeout(() => {
        let current = 0;
        const increment = stat.number / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.number) {
            current = stat.number;
            clearInterval(timer);
          }
          setActiveStats(prev => {
            const newStats = [...prev];
            newStats[index] = Math.floor(current);
            return newStats;
          });
        }, 40);
      }, index * 200);
    });

    // Floating animation for skill tags
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls, displayStats]);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-purple-200 rounded-full opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="w-4 h-4" />
                #1 Freelancing Platform in Sri Lanka
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connect with Sri Lanka&apos;s Top{" "}
                <span className="text-green-600 block relative">
                  <Typewriter
                    words={[
                      "Developers",
                      "Designers", 
                      "Writers",
                      "Marketers",
                      "Freelancers",
                    ]}
                    loop={true}
                    cursor
                    cursorStyle="_"
                    typeSpeed={100}
                    deleteSpeed={50}
                    delaySpeed={2000}
                  />
                  <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-green-600"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
              </h1>
            </motion.div>

            <motion.p
              className="text-xl text-gray-600 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Sri Lanka&apos;s first dedicated platform connecting businesses
              with skilled local freelancers. Find the perfect talent for your
              project in minutes, not days.
            </motion.p>

            {/* Interactive Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/role-selection"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 text-center flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#how-it-works"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 text-center flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Link>
              </motion.div>
            </motion.div>

            {/* Animated Stats
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {displayStats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <motion.div 
                    className="text-2xl font-bold text-gray-900"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {activeStats[index] || 0}{stat.suffix}
                  </motion.div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div> */}
          </div>

          {/* Right side with image and floating elements */}
          <motion.div
            className="w-full md:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Main Image */}
            <div className="relative h-80 md:h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/landing-img.png"
                alt="Sri Lankan freelancers working"
                fill
                priority
                className="object-cover"
              />
              
              {/* Floating Success Card */}
              <motion.div
                className="absolute top-6 right-6 bg-white p-4 rounded-lg shadow-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Project completed!</p>
              </motion.div>

              {/* Floating User Count */}
              <motion.div
                className="absolute bottom-6 left-6 bg-green-600 text-white p-3 rounded-lg shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">1,250+ Freelancers</span>
                </div>
              </motion.div>
            </div>

            {/* Floating Skill Tags */}
            <motion.div 
              className="absolute -right-10 top-1/2 transform -translate-y-1/2 space-y-2"
              animate={controls}
            >
              {skillTags.slice(0, 5).map((skill, index) => (
                <motion.div
                  key={skill}
                  className="bg-white px-3 py-1 rounded-full text-sm shadow-md whitespace-nowrap"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.1, backgroundColor: "#f0fdf4" }}
                >
                  {skill}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
