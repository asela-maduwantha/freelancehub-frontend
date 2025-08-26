"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProjectList } from "@/components/client/projects/ProjectList";
import { ProjectFilters } from "@/components/client/projects/ProjectFilters";
import { Button } from "@/components/ui/Button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  budgetType: string;
  proposalsCount: number;
  createdAt: string;
  deadline: string;
  category: string;
}

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      // API call to fetch projects with filters
      // const response = await fetch(`/projects?${new URLSearchParams(filters)}`);
      // const data = await response.json();
      
      // Simulated data for now
      const data: Project[] = [
        {
          id: "1",
          title: "E-commerce Website Development",
          description: "Need a modern e-commerce website with React and Node.js",
          status: "OPEN",
          budget: 5000,
          budgetType: "FIXED",
          proposalsCount: 8,
          createdAt: "2025-08-20T10:00:00Z",
          deadline: "2025-12-31T23:59:59Z",
          category: "Web Development"
        },
        {
          id: "2",
          title: "Mobile App Development",
          description: "iOS and Android app for food delivery service",
          status: "IN_PROGRESS",
          budget: 8500,
          budgetType: "FIXED",
          proposalsCount: 12,
          createdAt: "2025-08-15T14:30:00Z",
          deadline: "2025-11-30T23:59:59Z",
          category: "Mobile Development"
        }
      ];
      
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your project listings</p>
        </div>
        <Link href="/client/projects/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ProjectFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Projects List */}
      <ProjectList 
        projects={projects}
        isLoading={isLoading}
        onProjectUpdate={fetchProjects}
      />
    </motion.div>
  );
}
