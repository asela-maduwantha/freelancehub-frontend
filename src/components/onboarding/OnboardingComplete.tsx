"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, CheckCircle2, ArrowRight, Star, Users, Briefcase, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { freelancerApi } from '@/api/services/freelancer';

interface OnboardingCompleteProps {
  userName: string;
  onContinue: () => void;
}

interface ProfileStats {
  profileCompletion: number;
  activeProposals: number;
  completedProjects: number;
  totalEarnings: number;
}

const OnboardingComplete = ({ userName, onContinue }: OnboardingCompleteProps) => {
  const [stats, setStats] = useState<ProfileStats>({
    profileCompletion: 85,
    activeProposals: 0,
    completedProjects: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Load dashboard stats
    const loadStats = async () => {
      try {
        const response = await freelancerApi.getDashboard();
        if (response.success && response.data) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Show confetti effect
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Complete onboarding
  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        await freelancerApi.completeOnboarding();
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    };

    completeOnboarding();
  }, []);

  const nextSteps = [
    {
      icon: Briefcase,
      title: 'Browse Available Projects',
      description: 'Find projects that match your skills and start submitting proposals',
      action: 'Browse Projects',
      color: 'blue'
    },
    {
      icon: Star,
      title: 'Complete Your Profile',
      description: 'Add more portfolio items, experience, and certifications',
      action: 'Complete Profile',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Connect with other freelancers and potential clients',
      action: 'Explore Community',
      color: 'green'
    }
  ];

  const achievements = [
    { title: 'Account Created', completed: true },
    { title: 'Email Verified', completed: true },
    { title: 'Profile Completed', completed: true },
    { title: 'Portfolio Added', completed: stats.profileCompletion > 80 },
    { title: 'Security Setup', completed: stats.profileCompletion > 75 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center relative overflow-hidden"
    >
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -10, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                scale: 0
              }}
              animate={{ 
                y: window.innerHeight + 10,
                rotate: 360,
                scale: 1
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
              className={`absolute w-3 h-3 ${
                ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500'][i % 5]
              } rounded`}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 space-y-8">
        {/* Celebration Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-6 opacity-20 animate-pulse">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-xl"></div>
            </div>
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎉 Congratulations, {userName}!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            Your freelancer profile is now live and ready to attract amazing clients!
          </p>
          
          <p className="text-lg text-blue-600 font-medium">
            You're now part of the FreelanceHub community
          </p>
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mx-auto max-w-2xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Profile Status
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : `${stats.profileCompletion}%`}
              </div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.activeProposals}
              </div>
              <div className="text-sm text-gray-600">Active Proposals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '...' : stats.completedProjects}
              </div>
              <div className="text-sm text-gray-600">Completed Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : `$${stats.totalEarnings.toLocaleString()}`}
              </div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Onboarding Achievements
          </h3>
          
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white border"
              >
                <CheckCircle2 
                  className={`w-5 h-5 ${
                    achievement.completed ? 'text-green-500' : 'text-gray-300'
                  }`} 
                />
                <span className={`font-medium ${
                  achievement.completed ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            What's Next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.3 }}
                className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  step.color === 'blue' ? 'bg-blue-100' :
                  step.color === 'purple' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <step.icon className={`w-6 h-6 ${
                    step.color === 'blue' ? 'text-blue-600' :
                    step.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                  }`} />
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h4>
                
                <p className="text-gray-600 text-sm mb-4">
                  {step.description}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {step.action}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto"
        >
          <h4 className="font-semibold text-yellow-900 mb-3">
            💡 Pro Tips for Success
          </h4>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• Keep your profile updated with your latest skills and projects</li>
            <li>• Respond to client messages quickly to build trust</li>
            <li>• Start with smaller projects to build your reputation</li>
            <li>• Always deliver quality work on time</li>
          </ul>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="pt-8"
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="px-8 py-4 text-lg font-medium"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Ready to start your freelancing journey!
          </p>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="border-t border-gray-200 pt-8 mt-8"
        >
          <p className="text-sm text-gray-500 mb-4">
            Need help getting started?
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="/help" className="text-blue-600 hover:text-blue-700">
              Help Center
            </a>
            <a href="/community" className="text-blue-600 hover:text-blue-700">
              Community Forum
            </a>
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OnboardingComplete;
