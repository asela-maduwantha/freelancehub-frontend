"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Star, 
  FileText, 
  Search, 
  User
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function FreelancerDashboard() {
  const { user } = useAuth({ required: true });
  const router = useRouter();

  // Redirect if not freelancer
  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const stats = [
    {
      title: "Active Proposals",
      value: "0",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
      change: "+0%"
    },
    {
      title: "Total Earnings",
      value: "LKR 0",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: "+0%"
    },
    {
      title: "Profile Views",
      value: "0",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      change: "+0%"
    },
    {
      title: "Average Rating",
      value: "0.0",
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
      change: "+0%"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Freelancer'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your freelance activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Proposals
          </h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No proposals yet</p>
              <p className="text-sm text-gray-400">
                Your submitted proposals will appear here once you start applying to projects.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No activity yet</p>
              <p className="text-sm text-gray-400">
                Your recent project activities will appear here once you start applying to projects.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Your Freelance Journey?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Explore thousands of projects posted by clients looking for talented freelancers like you. 
          Apply to projects that match your skills and start building your reputation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/freelancer/projects">
            <Button className="bg-green-600 hover:bg-green-700 px-8 py-3">
              <Search className="w-5 h-5 mr-2" />
              Browse Projects
            </Button>
          </Link>
          <Link href="/freelancer/settings">
            <Button variant="outline" className="px-8 py-3">
              <User className="w-5 h-5 mr-2" />
              Complete Profile
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
