"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  Star, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  User,
  Check,
  X,
  Eye,
  Calendar
} from "lucide-react";
import Link from "next/link";

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

interface ProposalListProps {
  proposals: Proposal[];
  isLoading: boolean;
  onProposalUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "SUBMITTED": return "bg-blue-100 text-blue-800";
    case "ACCEPTED": return "bg-green-100 text-green-800";
    case "REJECTED": return "bg-red-100 text-red-800";
    case "WITHDRAWN": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const ProposalCard = ({ proposal, onUpdate }: { proposal: Proposal; onUpdate: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAccept = async () => {
    setActionLoading("accept");
    try {
      // API call to accept proposal
      // await fetch(`/proposals/${proposal.id}/accept`, { method: 'PATCH' });
      onUpdate();
    } catch (error) {
      console.error("Failed to accept proposal:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (confirm("Are you sure you want to reject this proposal?")) {
      setActionLoading("reject");
      try {
        // API call to reject proposal
        // await fetch(`/proposals/${proposal.id}/reject`, { method: 'PATCH' });
        onUpdate();
      } catch (error) {
        console.error("Failed to reject proposal:", error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                  {proposal.freelancerName}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{proposal.freelancerRating}</span>
                </div>
                <Badge className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {proposal.freelancerCompletedProjects} projects completed
              </p>
              <p className="text-sm text-gray-700 font-medium">
                For: {proposal.projectTitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${proposal.proposedBudget.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Timeline: {proposal.timeline}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Cover Letter Preview */}
            <div>
              <p className="text-gray-700 text-sm">
                {isExpanded 
                  ? proposal.coverLetter 
                  : `${proposal.coverLetter.substring(0, 150)}${proposal.coverLetter.length > 150 ? '...' : ''}`
                }
              </p>
              {proposal.coverLetter.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 text-sm hover:underline mt-1"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* Milestones */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Proposed Milestones</h4>
              <div className="space-y-2">
                {proposal.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">{milestone.title}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">{milestone.duration}</span>
                      <span className="font-medium text-green-600">
                        ${milestone.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted {formatDate(proposal.createdAt)}</span>
                </div>
              </div>
              
              {proposal.status === "SUBMITTED" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReject}
                    disabled={actionLoading === "reject"}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {actionLoading === "reject" ? (
                      "Rejecting..."
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    disabled={actionLoading === "accept"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === "accept" ? (
                      "Accepting..."
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/client/freelancers/${proposal.freelancerId}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link href={`/client/proposals/${proposal.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
              <Link href={`/client/messages?freelancer=${proposal.freelancerId}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProposalSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
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
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export function ProposalList({ proposals, isLoading, onProposalUpdate }: ProposalListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <ProposalSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <MessageSquare className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
        <p className="text-gray-500 mb-6">
          Once freelancers start submitting proposals to your projects, they'll appear here
        </p>
        <Link href="/client/projects">
          <Button>View Your Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onUpdate={onProposalUpdate}
        />
      ))}
    </div>
  );
}
