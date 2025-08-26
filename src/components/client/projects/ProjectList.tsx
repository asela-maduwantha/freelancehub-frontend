"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Calendar,
  DollarSign,
  Users,
  Plus
} from "lucide-react";
import Link from "next/link";

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

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onProjectUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN": return "bg-green-100 text-green-800";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
    case "COMPLETED": return "bg-gray-100 text-gray-800";
    case "CANCELLED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const ProjectCard = ({ project, onUpdate }: { project: Project; onUpdate: () => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        // API call to delete project
        // await fetch(`/projects/${project.id}`, { method: 'DELETE' });
        onUpdate();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {project.title}
              </CardTitle>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <Link href={`/client/projects/${project.id}`}>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </Link>
                    <Link href={`/client/projects/${project.id}/edit`}>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </button>
                    </Link>
                    <Link href={`/client/projects/${project.id}/proposals`}>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Proposals
                      </button>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {project.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="font-medium text-gray-900">
                  ${project.budget.toLocaleString()}
                </span>
                <span className="ml-1">({project.budgetType})</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{project.proposalsCount} proposals</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Due: {formatDate(project.deadline)}</span>
              </div>
              <span>Posted: {formatDate(project.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Link href={`/client/projects/${project.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
            <Link href={`/client/projects/${project.id}/proposals`} className="flex-1">
              <Button size="sm" className="w-full">
                View Proposals ({project.proposalsCount})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProjectSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function ProjectList({ projects, isLoading, onProjectUpdate }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500 mb-6">Get started by posting your first project</p>
        <Link href="/client/projects/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post Your First Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onUpdate={onProjectUpdate}
        />
      ))}
    </div>
  );
}
