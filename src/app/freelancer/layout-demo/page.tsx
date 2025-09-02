'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import StatsCard from '@/components/ui/StatsCard';
import { useFreelancerLayout } from '@/components/layout/FreelancerLayout';
import {
  User,
  Briefcase,
  DollarSign,
  Star,
  Settings,
  Bell,
  Search,
  LayoutDashboard
} from 'lucide-react';

export default function LayoutDemoPage() {
  const { user, notifications, sidebarCollapsed, toggleSidebar } = useFreelancerLayout();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
          Layout Demo Page
        </h1>
        <p className="text-gray-600 font-inter">
          This page demonstrates the FreelancerLayout components and features.
        </p>
      </div>

      {/* Layout Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="User"
          value={user?.firstName || 'Demo User'}
          icon={User}
          color="blue"
        />
        <StatsCard
          title="Notifications"
          value={notifications}
          icon={Bell}
          color="red"
        />
        <StatsCard
          title="Sidebar"
          value={sidebarCollapsed ? 'Collapsed' : 'Expanded'}
          icon={Settings}
          color="green"
        />
        <StatsCard
          title="Layout"
          value="Freelancer"
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Navigation Features */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
            Navigation Features
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Fixed Sidebar</span>
              <span className="text-xs text-green-600">Desktop</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Mobile Drawer</span>
              <span className="text-xs text-blue-600">Mobile</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Active Highlighting</span>
              <span className="text-xs text-purple-600">Auto</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Notification Badges</span>
              <span className="text-xs text-yellow-600">Dynamic</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
            Interactive Demo
          </h2>
          <div className="space-y-4">
            <Button
              onClick={toggleSidebar}
              className="w-full"
              variant="outline"
            >
              Toggle Sidebar ({sidebarCollapsed ? 'Expand' : 'Collapse'})
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'details' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('details')}
              >
                Details
              </Button>
            </div>

            {activeTab === 'overview' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Layout Overview</h3>
                <p className="text-sm text-gray-600">
                  The FreelancerLayout provides a comprehensive dashboard experience
                  with responsive navigation, user profile integration, and mobile support.
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Technical Details</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Next.js 13+ App Router</li>
                  <li>• Tailwind CSS styling</li>
                  <li>• Framer Motion animations</li>
                  <li>• Mobile-first responsive design</li>
                  <li>• Authentication integration</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layout Structure Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 font-poppins">
          Layout Structure
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Sidebar Navigation
            </h3>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Earnings</span>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Header Bar
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search Bar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile Dropdown</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              Main Content
            </h3>
            <div className="space-y-2 text-sm text-purple-700">
              <div>• Dynamic page content</div>
              <div>• Animated transitions</div>
              <div>• Responsive layout</div>
              <div>• Consistent spacing</div>
              <div>• Auto-scrolling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">
            Ready to build amazing freelancer experiences?
          </h3>
          <p className="text-green-100 mb-4">
            Use this layout as the foundation for all your freelancer dashboard pages.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="bg-white text-green-600 border-white hover:bg-green-50">
              View Documentation
            </Button>
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-green-600">
              Explore Components
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
