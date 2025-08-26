"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ContractList } from "@/components/client/contracts/ContractList";
import { ContractFilters } from "@/components/client/contracts/ContractFilters";
import { ContractStats } from "@/components/client/contracts/ContractStats";

interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

export default function ClientContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  useEffect(() => {
    fetchContracts();
  }, [filters]);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      // API call to fetch contracts
      // const response = await fetch(`/contracts?${new URLSearchParams(filters)}`);
      // const data = await response.json();
      
      // Simulated data
      const data: Contract[] = [
        {
          id: "contract1",
          projectId: "p1",
          projectTitle: "E-commerce Website Development",
          freelancerId: "f1",
          freelancerName: "John Doe",
          amount: 5000,
          status: "ACTIVE",
          startDate: "2025-08-01T00:00:00Z",
          endDate: "2025-12-01T00:00:00Z",
          createdAt: "2025-07-25T10:00:00Z",
          milestones: [
            {
              id: "m1",
              title: "Design Phase",
              description: "Complete UI/UX design",
              amount: 1500,
              dueDate: "2025-09-15T00:00:00Z",
              status: "COMPLETED"
            },
            {
              id: "m2",
              title: "Development Phase",
              description: "Frontend and backend development",
              amount: 2500,
              dueDate: "2025-11-15T00:00:00Z",
              status: "IN_PROGRESS"
            },
            {
              id: "m3",
              title: "Testing & Launch",
              description: "QA testing and deployment",
              amount: 1000,
              dueDate: "2025-12-01T00:00:00Z",
              status: "PENDING"
            }
          ]
        },
        {
          id: "contract2",
          projectId: "p2",
          projectTitle: "Mobile App Development",
          freelancerId: "f2",
          freelancerName: "Sarah Smith",
          amount: 8500,
          status: "COMPLETED",
          startDate: "2025-06-01T00:00:00Z",
          endDate: "2025-08-15T00:00:00Z",
          createdAt: "2025-05-20T14:30:00Z",
          milestones: [
            {
              id: "m4",
              title: "App Design",
              description: "Mobile app UI/UX design",
              amount: 2000,
              dueDate: "2025-06-15T00:00:00Z",
              status: "COMPLETED"
            },
            {
              id: "m5",
              title: "iOS Development",
              description: "iOS app development",
              amount: 3250,
              dueDate: "2025-07-15T00:00:00Z",
              status: "COMPLETED"
            },
            {
              id: "m6",
              title: "Android Development",
              description: "Android app development",
              amount: 3250,
              dueDate: "2025-08-15T00:00:00Z",
              status: "COMPLETED"
            }
          ]
        }
      ];
      
      setContracts(data);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
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
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="text-gray-600 mt-1">Manage your active contracts and milestones</p>
      </div>

      {/* Stats */}
      <ContractStats contracts={contracts} />

      {/* Filters */}
      <ContractFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Contracts List */}
      <ContractList 
        contracts={contracts}
        isLoading={isLoading}
        onContractUpdate={fetchContracts}
      />
    </motion.div>
  );
}
