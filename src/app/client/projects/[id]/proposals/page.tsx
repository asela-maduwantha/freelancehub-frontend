'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  X,
  User,
  Calendar,
  FileText,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { clientAPI } from '@/lib/api';

interface Proposal {
  id: string;
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    title: string;
    rating: number;
    totalReviews: number;
    completedProjects: number;
    skills: string[];
    location: {
      country: string;
      city: string;
    };
  };
  pricing: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  duration: number;
  coverLetter: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  status: string;
}

export default function ProjectProposalsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadProjectAndProposals();
    } else {
      router.push('/login');
    }
  }, [router, projectId]);

  const loadProjectAndProposals = async () => {
    try {
      // Load project details
      const projectData = await clientAPI.getProject(projectId);
      setProject(projectData);

      // Load proposals
      const proposalsData = await clientAPI.getProjectProposals(projectId);
      setProposals(proposalsData.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Mock data for demonstration
      setProject({
        id: projectId,
        title: 'Build E-commerce Website',
        description: 'Need a full-stack developer for an online store with payment integration',
        budget: { amount: 2500, currency: 'USD', type: 'fixed' },
        status: 'open'
      });

      const mockProposals: Proposal[] = [
        {
          id: '1',
          freelancer: {
            id: '1',
            firstName: 'John',
            lastName: 'Developer',
            title: 'Full Stack Developer',
            rating: 4.9,
            totalReviews: 127,
            completedProjects: 89,
            skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
            location: { country: 'USA', city: 'San Francisco' }
          },
          pricing: {
            amount: 2200,
            currency: 'USD',
            type: 'fixed'
          },
          duration: 21,
          coverLetter: 'I have extensive experience building e-commerce websites using React and Node.js. I can deliver a high-quality solution within your timeline and budget.',
          submittedAt: '2024-01-16T10:00:00Z',
          status: 'pending'
        },
        {
          id: '2',
          freelancer: {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Tech',
            title: 'Senior Web Developer',
            rating: 4.8,
            totalReviews: 95,
            completedProjects: 67,
            skills: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL'],
            location: { country: 'Canada', city: 'Toronto' }
          },
          pricing: {
            amount: 2400,
            currency: 'USD',
            type: 'fixed'
          },
          duration: 25,
          coverLetter: 'With 5+ years of experience in web development, I can create a robust e-commerce platform that meets all your requirements.',
          submittedAt: '2024-01-15T14:30:00Z',
          status: 'pending'
        }
      ];
      setProposals(mockProposals);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setIsAccepting(true);
    try {
      await clientAPI.acceptProposal(projectId, proposalId);
      // Update local state
      setProposals(prev => prev.map(p =>
        p.id === proposalId ? { ...p, status: 'accepted' } : p
      ));
      setSelectedProposal(null);
      // Redirect to contract creation or dashboard
      router.push(`/client/dashboard?accepted=true`);
    } catch (error: any) {
      console.error('Failed to accept proposal:', error);
      alert('Failed to accept proposal. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    setIsRejecting(true);
    try {
      await clientAPI.rejectProposal(projectId, proposalId, 'Not selected for this project');
      // Update local state
      setProposals(prev => prev.map(p =>
        p.id === proposalId ? { ...p, status: 'rejected' } : p
      ));
      setSelectedProposal(null);
    } catch (error: any) {
      console.error('Failed to reject proposal:', error);
      alert('Failed to reject proposal. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <Link href="/client/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <Link
              href={`/client/projects/${projectId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                {project.title}
              </h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-medium text-gray-900">
                    ${project.budget.amount} {project.budget.type === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{proposals.length} proposals</span>
                </div>
              </div>
            </div>
            <Link href={`/client/projects/${projectId}`}>
              <Button variant="outline">View Project</Button>
            </Link>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Freelancer Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-500" />
                      </div>
                    </div>

                    {/* Proposal Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                              {proposal.freelancer.firstName} {proposal.freelancer.lastName}
                            </h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                {proposal.freelancer.rating}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                ({proposal.freelancer.totalReviews} reviews)
                              </span>
                            </div>
                          </div>

                          <p className="text-green-600 font-medium mb-2">
                            {proposal.freelancer.title}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium text-gray-900">
                                ${proposal.pricing.amount} {proposal.pricing.type === 'hourly' ? '/hr' : ''}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{proposal.duration} days</span>
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              <span>{proposal.freelancer.completedProjects} projects</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>{formatDate(proposal.submittedAt)}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {proposal.freelancer.skills.slice(0, 6).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {proposal.coverLetter}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      {proposal.status === 'pending' ? (
                        <>
                          <Button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            disabled={isAccepting}
                            variant="premium"
                            size="sm"
                            className="font-inter"
                          >
                            {isAccepting ? 'Accepting...' : 'Accept Proposal'}
                          </Button>
                          <Button
                            onClick={() => handleRejectProposal(proposal.id)}
                            disabled={isRejecting}
                            variant="outline"
                            size="sm"
                            className="font-inter"
                          >
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      ) : (
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          proposal.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {proposal.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
              <p className="text-gray-500 mb-6">
                Proposals will appear here once freelancers submit their bids
              </p>
              <Link href={`/client/projects/${projectId}`}>
                <Button variant="outline">Back to Project</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
