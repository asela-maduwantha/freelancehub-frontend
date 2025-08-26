"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Download
} from "lucide-react";
import Link from "next/link";

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

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
  milestones: Milestone[];
}

interface ContractListProps {
  contracts: Contract[];
  isLoading: boolean;
  onContractUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE": return "bg-green-100 text-green-800";
    case "COMPLETED": return "bg-blue-100 text-blue-800";
    case "CANCELLED": return "bg-red-100 text-red-800";
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED": return "bg-green-100 text-green-800";
    case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
    case "PENDING": return "bg-gray-100 text-gray-800";
    case "OVERDUE": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getMilestoneIcon = (status: string) => {
  switch (status) {
    case "COMPLETED": return CheckCircle;
    case "IN_PROGRESS": return Clock;
    case "PENDING": return AlertCircle;
    case "OVERDUE": return AlertCircle;
    default: return Clock;
  }
};

const ContractCard = ({ contract, onUpdate }: { contract: Contract; onUpdate: () => void }) => {
  const [showMilestones, setShowMilestones] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProgress = () => {
    const completedMilestones = contract.milestones.filter(m => m.status === "COMPLETED").length;
    return Math.round((completedMilestones / contract.milestones.length) * 100);
  };

  const handleMilestoneApproval = async (milestoneId: string) => {
    try {
      // API call to approve milestone
      // await fetch(`/contracts/${contract.id}/milestones/${milestoneId}/approve`, { method: 'PATCH' });
      onUpdate();
    } catch (error) {
      console.error("Failed to approve milestone:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contract.projectTitle}
                </h3>
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{contract.freelancerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${contract.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                {getProgress()}% Complete
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Project Progress</span>
                <span className="font-medium">{getProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Milestones Toggle */}
            <div>
              <button
                onClick={() => setShowMilestones(!showMilestones)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Milestones ({contract.milestones.length})
                </span>
                <span className="text-gray-500">
                  {showMilestones ? "Hide" : "Show"}
                </span>
              </button>

              {showMilestones && (
                <div className="mt-3 space-y-3">
                  {contract.milestones.map((milestone) => {
                    const Icon = getMilestoneIcon(milestone.status);
                    return (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                            <Badge className={getMilestoneStatusColor(milestone.status)}>
                              {milestone.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              ${milestone.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            Due: {formatDate(milestone.dueDate)}
                          </span>
                          {milestone.status === "IN_PROGRESS" && (
                            <Button
                              size="sm"
                              onClick={() => handleMilestoneApproval(milestone.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Link href={`/client/contracts/${contract.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Link href={`/client/messages?freelancer=${contract.freelancerId}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ContractSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function ContractList({ contracts, isLoading, onContractUpdate }: ContractListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <ContractSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <FileText className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
        <p className="text-gray-500 mb-6">
          Your active contracts will appear here once you start working with freelancers
        </p>
        <Link href="/client/projects">
          <Button>View Your Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onUpdate={onContractUpdate}
        />
      ))}
    </div>
  );
}
