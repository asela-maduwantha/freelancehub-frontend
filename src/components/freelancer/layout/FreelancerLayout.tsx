"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Briefcase, 
  MessageCircle, 
  Settings,
  FileText,
  Star,
  CreditCard,
  Bell,
  Menu,
  X,
  User,
  Search,
  BarChart3,
  Award,
  DollarSign,
  Calendar,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

interface FreelancerLayoutProps {
  children: ReactNode;
}

const navigation = [
  { 
    name: "Dashboard", 
    href: "/freelancer", 
    icon: Home, 
    description: "Overview & analytics" 
  },
  { 
    name: "Browse Projects", 
    href: "/freelancer/projects", 
    icon: Search, 
    description: "Find new opportunities",
    badge: "New"
  },
  { 
    name: "My Proposals", 
    href: "/freelancer/proposals", 
    icon: FileText, 
    description: "Track submissions" 
  },
  { 
    name: "Active Contracts", 
    href: "/freelancer/contracts", 
    icon: Briefcase, 
    description: "Manage ongoing work" 
  },
  { 
    name: "Messages", 
    href: "/freelancer/messages", 
    icon: MessageCircle, 
    description: "Client communications" 
  },
  { 
    name: "Reviews & Ratings", 
    href: "/freelancer/reviews", 
    icon: Star, 
    description: "Client feedback" 
  },
  { 
    name: "Earnings", 
    href: "/freelancer/payments", 
    icon: DollarSign, 
    description: "Payment history" 
  },
  { 
    name: "Analytics", 
    href: "/freelancer/analytics", 
    icon: BarChart3, 
    description: "Performance insights" 
  },
  { 
    name: "Notifications", 
    href: "/freelancer/notifications", 
    icon: Bell, 
    description: "Updates & alerts" 
  },
  { 
    name: "Profile & Settings", 
    href: "/freelancer/settings", 
    icon: Settings, 
    description: "Account management" 
  },
];

export function FreelancerLayout({ children }: FreelancerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <Sidebar />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="text-xl font-bold text-green-600">
              FreelanceHub
            </Link>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
      {/* Header */}
      <div className="flex flex-col pt-6 pb-4 px-6 border-b border-gray-200">
        <Link href="/" className="text-2xl font-bold text-green-600 mb-4">
          FreelanceHub
        </Link>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full border-2 border-green-200"
              src={(user as any)?.profilePicture || (user as any)?.image || '/api/placeholder/40/40'}
              alt={user?.name || 'User'}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {(user as any)?.firstName || user?.name || 'Freelancer'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-lg font-semibold text-green-600">4.8</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-lg font-semibold text-blue-600">23</p>
            <p className="text-xs text-gray-600">Projects</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/freelancer" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      isActive ? "bg-white/20 text-white" : "bg-green-100 text-green-800"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs mt-0.5 truncate",
                  isActive ? "text-green-100" : "text-gray-500"
                )}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Pro Member</p>
              <p className="text-xs text-gray-600">Upgrade available</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
