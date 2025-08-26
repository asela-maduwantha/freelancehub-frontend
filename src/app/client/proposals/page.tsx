"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProposalList } from "@/components/client/proposals/ProposalList";
import { ProposalFilters } from "@/components/client/proposals/ProposalFilters";
import { ProposalStats } from "@/components/client/proposals/ProposalStats";

interface Milestone {
  title: string;
  amount: number;
  duration: string;
}

interface Proposal {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRating: number;
  freelancerCompletedProjects: number;
  projectId: string;
  projectTitle: string;
  coverLetter: string;
  proposedBudget: number;
  timeline: string;
  status: string;
  createdAt: string;
  milestones: Milestone[];
}

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    project: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  useEffect(() => {
    fetchProposals();
  }, [filters]);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      // API call to fetch proposals
      // const response = await fetch(`/proposals?${new URLSearchParams(filters)}`);
      // const data = await response.json();
      
      // Simulated data
      const data: Proposal[] = [
        {
          id: "1",
          freelancerId: "f1",
          freelancerName: "John Doe",
          freelancerRating: 4.8,
          freelancerCompletedProjects: 25,
          projectId: "p1",
          projectTitle: "E-commerce Website Development",
          coverLetter: "I have extensive experience in e-commerce development...",
          proposedBudget: 4800,
          timeline: "6 weeks",
          status: "SUBMITTED",
          createdAt: "2025-08-25T10:00:00Z",
          milestones: [
            { title: "Setup & Planning", amount: 1200, duration: "1 week" },
            { title: "Frontend Development", amount: 2400, duration: "3 weeks" },
            { title: "Backend & Testing", amount: 1200, duration: "2 weeks" }
          ]
        },
        {
          id: "2",
          freelancerId: "f2",
          freelancerName: "Sarah Smith",
          freelancerRating: 4.9,
          freelancerCompletedProjects: 40,
          projectId: "p1",
          projectTitle: "E-commerce Website Development",
          coverLetter: "I specialize in modern e-commerce solutions...",
          proposedBudget: 5200,
          timeline: "5 weeks",
          status: "SUBMITTED",
          createdAt: "2025-08-24T14:30:00Z",
          milestones: [
            { title: "Analysis & Design", amount: 1500, duration: "1 week" },
            { title: "Development", amount: 3000, duration: "3 weeks" },
            { title: "Testing & Launch", amount: 700, duration: "1 week" }
          ]
        }
      ];
      
      setProposals(data);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-600 mt-1">Review and manage proposals from freelancers</p>
      </div>

      {/* Stats */}
      <ProposalStats proposals={proposals} />

      {/* Filters */}
      <ProposalFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Proposals List */}
      <ProposalList 
        proposals={proposals}
        isLoading={isLoading}
        onProposalUpdate={fetchProposals}
      />
    </motion.div>
  );
}
