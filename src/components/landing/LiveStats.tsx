"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Users, 
  Briefcase, 
  Star, 
  TrendingUp, 
  MapPin, 
  DollarSign,
  Zap
} from "lucide-react";

// Dummy stats with realistic values
const defaultStats = [
  {
    icon: <Users className="w-8 h-8" />,
    label: "Active Freelancers",
    value: 1250,
    suffix: "+",
    color: "from-green-500 to-green-600",
    description: "Verified professionals ready to work",
    increment: 2,
    key: 'totalFreelancers'
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    label: "Projects Completed",
    value: 3540,
    suffix: "+",
    color: "from-green-500 to-green-600", 
    description: "Successfully delivered projects",
    increment: 1,
    key: 'projectsCompleted'
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    label: "Total Earnings",
    value: 12.5,
    suffix: "M+",
    color: "from-purple-500 to-purple-600",
    description: "Rupees earned by freelancers",
    prefix: "₨",
    increment: 0.1,
    key: 'totalEarnings',
    formatValue: (val: number) => (val / 1000000).toFixed(1) // Convert to millions
  },
  {
    icon: <Star className="w-8 h-8" />,
    label: "Average Rating",
    value: 4.8,
    suffix: "/5",
    color: "from-yellow-500 to-yellow-600",
    description: "Client satisfaction rating",
    increment: 0.01,
    key: 'averageRating'
  },
  {
    icon: <Users className="w-8 h-8" />,
    label: "Total Clients",
    value: 890,
    suffix: "+",
    color: "from-teal-500 to-teal-600",
    description: "Satisfied clients worldwide",
    increment: 1,
    key: 'totalClients'
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    label: "Total Projects",
    value: 4200,
    suffix: "+",
    color: "from-indigo-500 to-indigo-600",
    description: "Projects posted on platform",
    increment: 1,
    key: 'totalProjects'
  }
];

const recentActivities = [
  { type: "hire", text: "Kasun M. was hired for React Development", time: "2m ago", amount: "₨125k" },
  { type: "complete", text: "Project delivered by Nimali S.", time: "5m ago", amount: "₨45k" },
  { type: "join", text: "Tharindu P. joined as WordPress Developer", time: "8m ago", amount: "New" },
  { type: "post", text: "New mobile app project posted", time: "12m ago", amount: "₨200k" },
  { type: "hire", text: "Rashmi F. hired for UI/UX Design", time: "15m ago", amount: "₨80k" },
];

const provinces = [
  "Western", "Central", "Southern", "Northern", "Eastern", 
  "North Western", "North Central", "Uva", "Sabaragamuwa"
];

export default function LiveStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  // Use dummy stats data
  const stats = defaultStats;
  
  const [currentStats, setCurrentStats] = useState(stats.map(stat => ({ ...stat, currentValue: 0 })));
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [onlineCount, setOnlineCount] = useState(342);

  // Animate counters
  useEffect(() => {
    if (!isInView) return;

    const timers = stats.map((stat, index) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepValue = stat.value / steps;
      let currentStep = 0;

      return setInterval(() => {
        if (currentStep < steps) {
          setCurrentStats(prev => 
            prev.map((s, i) => 
              i === index 
                ? { ...s, currentValue: Math.min(stepValue * currentStep, stat.value) }
                : s
            )
          );
          currentStep++;
        }
      }, duration / steps);
    });

    return () => timers.forEach(clearInterval);
  }, [isInView]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update online count
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
      
      // Rotate activities
      setCurrentActivityIndex(prev => (prev + 1) % recentActivities.length);
      
      // Increment stats slowly
      setCurrentStats(prev => 
        prev.map(stat => ({
          ...stat,
          currentValue: Math.min(stat.currentValue + (stat.increment || 1), stat.value + 50)
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-green-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-300 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 0.8, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-10 blur-3xl"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 shadow-lg"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          >
            <Zap className="w-4 h-4" />
            Live Platform Statistics
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
            Platform in Real-Time
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Watch our freelancing ecosystem grow with live updates and real-time statistics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Stats Grid */}
          <div className="lg:col-span-3">
            <div
              ref={ref}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {currentStats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-green-200 hover:bg-white transition-all duration-500 group shadow-lg hover:shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  {/* Icon */}
                  <motion.div
                    className={`w-18 h-18 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    whileHover={{ rotate: 10 }}
                  >
                    {stat.icon}
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3"
                    key={stat.currentValue}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.prefix || ""}
                    {stat.currentValue.toLocaleString(undefined, { 
                      minimumFractionDigits: stat.value % 1 !== 0 ? 1 : 0,
                      maximumFractionDigits: stat.value % 1 !== 0 ? 1 : 0
                    })}
                    {stat.suffix}
                  </motion.div>

                  {/* Label */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stat.description}
                  </p>

                  {/* Pulse indicator for live updates */}
                  <motion.div
                    className="absolute top-6 right-6 w-3 h-3 bg-green-500 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-green-200 shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ delay: 0.8 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                className="w-4 h-4 bg-green-500 rounded-full shadow-lg"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h3 className="text-xl font-semibold text-gray-800">Live Activity</h3>
            </div>

            {/* Online Users */}
            <motion.div
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-5 rounded-2xl mb-8 border border-green-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-gray-800 font-semibold text-lg">
                  {onlineCount} users online
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">Across all 9 provinces</p>
            </motion.div>

            {/* Recent Activities */}
            <div className="space-y-4">
              {recentActivities.slice(0, 4).map((activity, index) => (
                <motion.div
                  key={`${activity.text}-${index}`}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    index === currentActivityIndex % 4 
                      ? 'bg-green-50 border-green-300 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === 'hire' ? 'bg-green-500' :
                      activity.type === 'complete' ? 'bg-green-500' :
                      activity.type === 'join' ? 'bg-purple-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm font-medium">{activity.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-500 text-xs">{activity.time}</span>
                        <span className="text-green-600 text-xs font-semibold">
                          {activity.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Geographic Distribution */}
            <motion.div
              className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border border-green-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-gray-800 text-sm font-semibold">Active Provinces</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {provinces.slice(0, 9).map((province, index) => (
                  <motion.div
                    key={province}
                    className="text-xs text-gray-700 text-center p-2 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ backgroundColor: "rgb(240 253 244)" }}
                  >
                    {province}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Growth Indicator */}
            <motion.div
              className="mt-6 flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl border border-green-200"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-semibold">+12% growth this month</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
