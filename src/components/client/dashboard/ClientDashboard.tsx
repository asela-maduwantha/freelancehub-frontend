"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Briefcase,
  Star,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface DashboardStats {
  activeProjects: number;
  totalProjects: number;
  averageRating: number;
  totalSpent: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: any[];
  activeProjects: any[];
  recentProposals: any[];
}

interface ClientDashboardProps {
  data: DashboardData | null;
}

const StatCard = ({ title, value, icon: Icon, change, trend }: {
  title: string;
  value: string | number;
  icon: any;
  change?: number;
  trend?: 'up' | 'down';
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change && (
        <p className={`text-xs flex items-center ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          <ArrowUpRight className={`h-4 w-4 ${trend === 'down' ? 'rotate-90' : ''}`} />
          {change}% from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const QuickAction = ({ title, description, href, icon: Icon }: {
  title: string;
  description: string;
  href: string;
  icon: any;
}) => (
  <Link href={href}>
    <Card className="transition-all hover:shadow-md hover:scale-105 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export function ClientDashboard({ data }: ClientDashboardProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const { stats } = data;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold mb-2">{greeting}! 👋</h1>
        <p className="text-blue-100 text-lg">
          Ready to find amazing freelancers for your next project?
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/client/projects/create">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
          </Link>
          <Link href="/client/freelancers">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Eye className="h-4 w-4 mr-2" />
              Browse Freelancers
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Briefcase}
          change={12}
          trend="up"
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Calendar}
          change={8}
          trend="up"
        />
        <StatCard
          title="Average Rating"
          value={`${stats.averageRating}/5.0`}
          icon={Star}
          change={0.2}
          trend="up"
        />
        <StatCard
          title="Total Spent"
          value={`$${stats.totalSpent.toLocaleString()}`}
          icon={DollarSign}
          change={15}
          trend="up"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction
            title="Post a Project"
            description="Get started with your next project"
            href="/client/projects/create"
            icon={Plus}
          />
          <QuickAction
            title="View Proposals"
            description="Review proposals from freelancers"
            href="/client/proposals"
            icon={MessageSquare}
          />
          <QuickAction
            title="Manage Contracts"
            description="Track your active contracts"
            href="/client/contracts"
            icon={Clock}
          />
        </div>
      </motion.div>

      {/* Recent Activity & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample activity items */}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New proposal received</p>
                    <p className="text-xs text-gray-500">E-commerce Website Project</p>
                  </div>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Milestone approved</p>
                    <p className="text-xs text-gray-500">Mobile App Development</p>
                  </div>
                  <span className="text-xs text-gray-500">5h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment processed</p>
                    <p className="text-xs text-gray-500">$2,500 released</p>
                  </div>
                  <span className="text-xs text-gray-500">1d ago</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/client/activity">
                  <Button variant="outline" size="sm">View All Activity</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample project items */}
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm">E-commerce Website</h4>
                  <p className="text-xs text-gray-500 mt-1">In Progress • 3 proposals</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-green-600">$5,000</span>
                    <Button variant="outline" size="sm">
                      <Link href="/client/projects/1">View</Link>
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm">Mobile App Development</h4>
                  <p className="text-xs text-gray-500 mt-1">In Progress • 7 proposals</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-green-600">$8,500</span>
                    <Button variant="outline" size="sm">
                      <Link href="/client/projects/2">View</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/client/projects">
                  <Button variant="outline" size="sm">View All Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
