"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { ClientDashboard } from "@/components/client/dashboard/ClientDashboard";
import { DashboardSkeleton } from "@/components/client/dashboard/DashboardSkeleton";
import { motion } from "framer-motion";

interface DashboardData {
  stats: {
    activeProjects: number;
    totalProjects: number;
    averageRating: number;
    totalSpent: number;
  };
  recentActivity: any[];
  activeProjects: any[];
  recentProposals: any[];
}

export default function ClientDashboardPage() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingData(true);
        // Fetch dashboard data from API
        // This would typically make calls to:
        // - /analytics/my-analytics
        // - /projects (filtered by client)
        // - /proposals (recent ones)
        // - /contracts (active ones)
        
        // Simulated data for now - replace with actual API calls
        const data: DashboardData = {
          stats: {
            activeProjects: 3,
            totalProjects: 12,
            averageRating: 4.8,
            totalSpent: 25000
          },
          recentActivity: [],
          activeProjects: [],
          recentProposals: []
        };
        
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading || isLoadingData) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null; // This will be handled by the auth redirect
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      <ClientDashboard data={dashboardData} />
    </motion.div>
  );
}
