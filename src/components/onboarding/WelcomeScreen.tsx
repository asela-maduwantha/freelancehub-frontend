"use client";
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Users, Star, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';

interface WelcomeScreenProps {
  userName: string;
  onContinue: () => void;
}

const WelcomeScreen = ({ userName, onContinue }: WelcomeScreenProps) => {
  const features = [
    {
      icon: Target,
      title: 'Find Perfect Projects',
      description: 'Get matched with projects that fit your skills and expertise.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Users,
      title: 'Connect with Clients',
      description: 'Build lasting relationships with quality clients worldwide.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Star,
      title: 'Build Your Reputation',
      description: 'Showcase your work and earn stellar reviews and ratings.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Scale your freelance career with powerful tools and insights.',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const steps = [
    { number: 1, title: 'Complete Your Profile', description: 'Tell us about your skills and experience' },
    { number: 2, title: 'Build Your Portfolio', description: 'Showcase your best work and projects' },
    { number: 3, title: 'Secure Your Account', description: 'Set up security features for protection' },
    { number: 4, title: 'Start Freelancing', description: 'Begin finding and applying for projects' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Celebration Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <div className="absolute -inset-4 opacity-30 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-lg"></div>
          </div>
          <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to FreelanceHub, {userName}! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          You're now part of a thriving community of talented freelancers. 
          Let's set up your profile to start landing amazing projects!
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Onboarding Progress
        </h3>
        
        <div className="flex items-center justify-center mb-4">
          <div className="w-32 h-32 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(2/7) * 251.2} 251.2`}
                className="text-blue-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">29%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          2 of 7 steps completed • About 10 minutes remaining
        </p>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          What's Next?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                step.number <= 2 
                  ? 'border-green-200 bg-green-50' 
                  : step.number === 3
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.number <= 2
                    ? 'bg-green-500 text-white'
                    : step.number === 3
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.number <= 2 ? '✓' : step.number}
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          What You'll Get Access To
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="space-y-4"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="px-8 py-4 text-lg font-medium"
        >
          Continue Setup
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <p className="text-sm text-gray-500">
          This will only take a few more minutes
        </p>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
      >
        <blockquote className="text-lg italic text-gray-700 mb-2">
          "Every expert was once a beginner. Every pro was once an amateur."
        </blockquote>
        <cite className="text-sm text-gray-500">- Robin Sharma</cite>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
