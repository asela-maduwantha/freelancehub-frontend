"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { FreelancerAnalytics } from "@/components/freelancer/analytics/FreelancerAnalytics";

export default function FreelancerAnalyticsPage() {
  const { user } = useAuth({ required: true });
  const router = useRouter();

  // Redirect if not freelancer
  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-gray-600">Track your performance and optimize your freelance business</p>
      </div>
      <FreelancerAnalytics />
    </div>
  );
}
