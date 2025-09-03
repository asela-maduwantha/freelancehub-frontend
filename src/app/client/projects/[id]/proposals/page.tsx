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
  Award,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';

interface Proposal {
  _id: string;
  freelancerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    freelancerProfile?: {
      hourlyRate: number;
    };
    stats?: {
      avgRating: number;
    };
  };
  proposedBudget: number;
  proposedDuration: {
    value: number;
    unit: string;
  };
  coverLetter: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deliveryDate: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  portfolioLinks?: string[];
  additionalInfo?: string;
  clientViewed: boolean;
  clientViewedAt?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  deadline: string;
  category?: string;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

const ProposalCard: React.FC<{
  proposal: Proposal;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  formatDate: (date: string) => string;
}> = ({ proposal, onAccept, onReject, isAccepting, isRejecting, formatDate }) => {
  const [expandedSections, setExpandedSections] = useState({
    coverLetter: true,
    milestones: false,
    attachments: false,
    additionalInfo: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Freelancer Avatar */}
            <div className="flex-shrink-0">
              {proposal.freelancerId.profilePicture ? (
                <img
                  src={proposal.freelancerId.profilePicture}
                  alt={`${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}`}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-gray-100">
                  <User className="h-8 w-8 text-white" />
                </div>
              )}
            </div>

            {/* Freelancer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 font-poppins">
                  {proposal.freelancerId.firstName} {proposal.freelancerId.lastName}
                </h3>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {proposal.freelancerId.stats?.avgRating || 0}
                  </span>
                </div>
                {proposal.clientViewed && (
                  <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Viewed</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Proposed Budget</p>
                    <p className="font-semibold text-gray-900">${proposal.proposedBudget}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{proposal.proposedDuration.value} {proposal.proposedDuration.unit}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-semibold text-gray-900">{formatDate(proposal.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 ml-6">
            {proposal.status === 'pending' ? (
              <>
                <Button
                  onClick={onAccept}
                  disabled={isAccepting}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
                >
                  {isAccepting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Accepting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept Proposal</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={onReject}
                  disabled={isRejecting}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-2"
                >
                  {isRejecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Rejecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <div className={`px-4 py-3 rounded-lg text-sm font-semibold text-center ${
                proposal.status === 'accepted'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center justify-center space-x-2">
                  {proposal.status === 'accepted' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span>{proposal.status === 'accepted' ? 'Accepted' : 'Rejected'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className="divide-y divide-gray-100">
        {/* Cover Letter */}
        <div className="p-6">
          <button
            onClick={() => toggleSection('coverLetter')}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="text-lg font-semibold text-gray-900">Cover Letter</h4>
            {expandedSections.coverLetter ? (
              <ArrowLeft className="h-5 w-5 text-gray-500 transform rotate-90" />
            ) : (
              <ArrowLeft className="h-5 w-5 text-gray-500 transform -rotate-90" />
            )}
          </button>
          {expandedSections.coverLetter && (
            <div className="mt-4">
              <p className="text-gray-700 leading-relaxed">{proposal.coverLetter}</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        {proposal.milestones && proposal.milestones.length > 0 && (
          <div className="p-6">
            <button
              onClick={() => toggleSection('milestones')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-lg font-semibold text-gray-900">
                Milestones ({proposal.milestones.length})
              </h4>
              {expandedSections.milestones ? (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform rotate-90" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform -rotate-90" />
              )}
            </button>
            {expandedSections.milestones && (
              <div className="mt-4 space-y-3">
                {proposal.milestones.map((milestone, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">{milestone.title}</h5>
                        <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-medium">${milestone.amount}</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {new Date(milestone.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <div className="p-6">
            <button
              onClick={() => toggleSection('attachments')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-lg font-semibold text-gray-900">
                Attachments ({proposal.attachments.length})
              </h4>
              {expandedSections.attachments ? (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform rotate-90" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform -rotate-90" />
              )}
            </button>
            {expandedSections.attachments && (
              <div className="mt-4 space-y-2">
                {proposal.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">{attachment.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        {proposal.additionalInfo && (
          <div className="p-6">
            <button
              onClick={() => toggleSection('additionalInfo')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-lg font-semibold text-gray-900">Additional Information</h4>
              {expandedSections.additionalInfo ? (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform rotate-90" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-gray-500 transform -rotate-90" />
              )}
            </button>
            {expandedSections.additionalInfo && (
              <div className="mt-4">
                <p className="text-gray-700 leading-relaxed">{proposal.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

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
      const projectData = await clientsService.getProjectById(projectId);
      setProject(projectData);

      // Load proposals
      const proposalsData = await clientsService.getProjectProposals(projectId);
      setProposals(proposalsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Mock data for demonstration
      setProject({
        _id: projectId,
        title: 'Build E-commerce Website',
        description: 'Need a full-stack developer for an online store with payment integration',
        budget: 2500,
        status: 'open',
        deadline: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const mockProposals: Proposal[] = [
        {
          _id: '1',
          freelancerId: {
            _id: '1',
            firstName: 'John',
            lastName: 'Developer',
            email: 'john@example.com',
            profilePicture: 'https://example.com/avatar1.jpg',
            freelancerProfile: { hourlyRate: 50 },
            stats: { avgRating: 4.9 }
          },
          proposedBudget: 2200,
          proposedDuration: { value: 21, unit: 'days' },
          coverLetter: 'I have extensive experience building e-commerce websites using React and Node.js. I can deliver a high-quality solution within your timeline and budget.',
          createdAt: '2024-01-16T10:00:00Z',
          status: 'pending',
          milestones: [
            {
              title: 'Initial Setup & Planning',
              description: 'Set up project structure and planning',
              amount: 500,
              deliveryDate: '2024-01-20T00:00:00Z'
            },
            {
              title: 'Frontend Development',
              description: 'Build the user interface',
              amount: 1000,
              deliveryDate: '2024-02-05T00:00:00Z'
            },
            {
              title: 'Backend Development',
              description: 'Implement server-side logic',
              amount: 700,
              deliveryDate: '2024-02-15T00:00:00Z'
            }
          ],
          attachments: [
            {
              name: 'Portfolio.pdf',
              url: 'https://example.com/portfolio.pdf',
              type: 'application/pdf'
            }
          ],
          portfolioLinks: ['https://github.com/johndoe/portfolio'],
          additionalInfo: 'Available to start immediately',
          clientViewed: false
        },
        {
          _id: '2',
          freelancerId: {
            _id: '2',
            firstName: 'Sarah',
            lastName: 'Tech',
            email: 'sarah@example.com',
            profilePicture: 'https://example.com/avatar2.jpg',
            freelancerProfile: { hourlyRate: 45 },
            stats: { avgRating: 4.8 }
          },
          proposedBudget: 2400,
          proposedDuration: { value: 25, unit: 'days' },
          coverLetter: 'With 5+ years of experience in web development, I can create a robust e-commerce platform that meets all your requirements.',
          createdAt: '2024-01-15T14:30:00Z',
          status: 'pending',
          milestones: [
            {
              title: 'Complete Development',
              description: 'Full project delivery',
              amount: 2400,
              deliveryDate: '2024-02-10T00:00:00Z'
            }
          ],
          attachments: [],
          portfolioLinks: ['https://github.com/sarahtech/web-apps'],
          additionalInfo: 'Can start next week',
          clientViewed: true,
          clientViewedAt: '2024-01-16T09:00:00Z'
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
      await clientsService.acceptProposal(projectId, proposalId, 'Proposal accepted');
      // Update local state
      setProposals(prev => prev.map(p =>
        p._id === proposalId ? { ...p, status: 'accepted' } : p
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
      await clientsService.rejectProposal(projectId, proposalId, 'Not selected for this project');
      // Update local state
      setProposals(prev => prev.map(p =>
        p._id === proposalId ? { ...p, status: 'rejected' } : p
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
                {project.title}
              </h1>
              <p className="text-gray-600 mb-4 text-lg">{project.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-gray-900">${project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Proposals</p>
                    <p className="font-semibold text-gray-900">{proposals.length}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold text-gray-900">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <Link href={`/client/projects/${projectId}`}>
              <Button variant="outline" className="ml-4">
                <Eye className="h-4 w-4 mr-2" />
                View Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                onAccept={() => handleAcceptProposal(proposal._id)}
                onReject={() => handleRejectProposal(proposal._id)}
                isAccepting={isAccepting}
                isRejecting={isRejecting}
                formatDate={formatDate}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No proposals yet</h3>
              <p className="text-gray-500 mb-8 text-lg">
                Proposals will appear here once freelancers submit their bids
              </p>
              <Link href={`/client/projects/${projectId}`}>
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
