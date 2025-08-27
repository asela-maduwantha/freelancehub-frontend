'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  User, 
  Star,
  Eye,
  Calendar,
  FileText,
  Send
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getProjectById } from '@/api/services/projects';
import { submitProposal } from '@/api/services/proposals';
import { Project } from '@/types/project';
import { useToast } from '@/context/toast-context';

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({
    coverLetter: '',
    proposedAmount: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProjectById(projectId);
        setProject(response.data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        showToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, showToast]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitProposal(projectId, {
        coverLetter: proposal.coverLetter,
        proposedAmount: parseFloat(proposal.proposedAmount),
        estimatedDuration: parseInt(proposal.estimatedDuration),
      });
      
      showToast('Proposal submitted successfully!', 'success');
      setShowProposalForm(false);
      setProposal({ coverLetter: '', proposedAmount: '', estimatedDuration: '' });
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      showToast('Failed to submit proposal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatBudget = (budget: any) => {
    if (budget.type === 'fixed') {
      return `$${budget.amount.toLocaleString()}`;
    }
    return `$${budget.amount}/hr`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600">The project you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isClient = user?.roles?.includes('client');
  const isFreelancer = user?.roles?.includes('freelancer');
  const canSubmitProposal = isFreelancer && project.status === 'open';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  Posted {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600">{project.category}</p>
            </div>
            {canSubmitProposal && (
              <Button 
                onClick={() => setShowProposalForm(!showProposalForm)}
                className="ml-4"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Proposal
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Project Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Requirements */}
            {project.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.requirements.experienceLevel && (
                      <div>
                        <h4 className="font-medium text-gray-900">Experience Level</h4>
                        <p className="text-gray-600 capitalize">{project.requirements.experienceLevel}</p>
                      </div>
                    )}
                    {project.requirements.minimumRating && (
                      <div>
                        <h4 className="font-medium text-gray-900">Minimum Rating</h4>
                        <p className="text-gray-600">{project.requirements.minimumRating} ⭐</p>
                      </div>
                    )}
                    {project.requirements.mustHaveSkills && project.requirements.mustHaveSkills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900">Must Have Skills</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.requirements.mustHaveSkills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proposal Form */}
            {showProposalForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProposal} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter
                      </label>
                      <Textarea
                        value={proposal.coverLetter}
                        onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })}
                        placeholder="Describe why you're the best fit for this project..."
                        rows={6}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proposed Amount ({project.budget.currency})
                        </label>
                        <Input
                          type="number"
                          value={proposal.proposedAmount}
                          onChange={(e) => setProposal({ ...proposal, proposedAmount: e.target.value })}
                          placeholder={project.budget.type === 'fixed' ? '500' : '25'}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Duration (days)
                        </label>
                        <Input
                          type="number"
                          value={proposal.estimatedDuration}
                          onChange={(e) => setProposal({ ...proposal, estimatedDuration: e.target.value })}
                          placeholder="7"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Proposal'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowProposalForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Budget</span>
                  <span className="font-medium">{formatBudget(project.budget)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Project Type</span>
                  <span className="capitalize">{project.budget.type}</span>
                </div>
                
                {project.timeline?.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span>{project.timeline.duration} days</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Views</span>
                  <span>{project.views || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Proposals</span>
                  <span>{project.proposals?.count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Client Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Client Name</p>
                      <p className="text-sm text-gray-500">Member since 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>4.8 (12 reviews)</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>$2,500+ total spent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
