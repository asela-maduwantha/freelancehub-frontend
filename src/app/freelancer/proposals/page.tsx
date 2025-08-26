"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ProposalManagement } from "@/components/freelancer/proposals/ProposalManagement";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function FreelancerProposalsPage() {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Proposals</h1>
          <p className="text-gray-600">Track and manage your project proposals</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => router.push('/freelancer/projects')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Browse Projects
        </Button>
      </div>
      <ProposalManagement />
    </div>
  );
}
