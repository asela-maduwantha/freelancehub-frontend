'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Clock, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { clientsService } from '@/lib/api/clients.service';
import { ProjectSubmittedMilestones, SubmittedMilestone } from '@/lib/types/api/responses.types';

export const SubmittedMilestones = () => {
  const router = useRouter();
  const [data, setData] = useState<ProjectSubmittedMilestones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingMilestone, setApprovingMilestone] = useState<string | null>(null);
  const [rejectingMilestone, setRejectingMilestone] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSubmittedMilestones();
  }, []);

  const loadSubmittedMilestones = async () => {
    try {
      setLoading(true);
      setError(null);
      const milestones = await clientsService.getSubmittedMilestones();
      
      let safeData: ProjectSubmittedMilestones[] = [];
      
      if (Array.isArray(milestones)) {
        safeData = milestones;
      } else if (milestones && typeof milestones === 'object') {
        const responseObj = milestones as any;
        if (Array.isArray(responseObj.data)) {
          safeData = responseObj.data;
        } else if (!Array.isArray(responseObj)) {
          safeData = [responseObj as ProjectSubmittedMilestones];
        }
      }
      
      setData(safeData);
    } catch (error: any) {
      console.error('Error loading submitted milestones:', error);
      
      let errorMessage = 'Failed to load submitted milestones.';
      if (error?.response?.status === 404) {
        errorMessage = 'The submitted milestones endpoint is not available yet.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'You are not authorized to view submitted milestones.';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      setApprovingMilestone(milestoneId);
      await clientsService.approveMilestone(milestoneId);
      await loadSubmittedMilestones();
    } catch (error) {
      console.error('Error approving milestone:', error);
      setError('Failed to approve milestone. Please try again.');
    } finally {
      setApprovingMilestone(null);
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    setShowRejectConfirm(milestoneId);
  };

  const confirmRejectMilestone = async (milestoneId: string) => {
    try {
      setRejectingMilestone(milestoneId);
      setShowRejectConfirm(null);
      await clientsService.rejectMilestone(milestoneId);
      // Reload the data after rejection
      await loadSubmittedMilestones();
    } catch (error) {
      console.error('Error rejecting milestone:', error);
      setError('Failed to reject milestone. Please try again.');
    } finally {
      setRejectingMilestone(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSubmittedMilestones}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const totalSubmittedMilestones = data && Array.isArray(data) 
    ? data.reduce((total, project) => total + (project?.submittedMilestones?.length || 0), 0)
    : 0;

  if (!loading && totalSubmittedMilestones === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Submitted Milestones"
        description="There are no milestones waiting for your approval at the moment."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Submitted Milestones</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and approve freelancer work to release payments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSubmittedMilestones}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {data && Array.isArray(data) && data.length > 0 && data.map((project) => (
          <motion.div
            key={project?.projectId || Math.random()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{project?.projectTitle || 'Unknown Project'}</h3>
              <p className="text-sm text-gray-600">
                {project?.submittedMilestones?.length || 0} milestone{(project?.submittedMilestones?.length || 0) !== 1 ? 's' : ''} submitted
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {project?.submittedMilestones && Array.isArray(project.submittedMilestones) && project.submittedMilestones.map((milestone) => (
                <div key={milestone._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-base font-medium text-gray-900">{milestone.title}</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Submitted
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${milestone.amount}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {new Date(milestone.deadline).toLocaleDateString()}
                        </div>
                        <div>
                          Contract: {milestone.contractTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => milestone.contractId && router.push(`/client/contracts/${milestone.contractId}`)}
                        disabled={!milestone.contractId}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Contract
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectMilestone(milestone._id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveMilestone(milestone._id)}
                        disabled={approvingMilestone === milestone._id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approvingMilestone === milestone._id ? (
                          <LoadingSpinner className="w-4 h-4 mr-1" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve & Pay
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Milestone</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject this milestone? The freelancer will need to make revisions before resubmitting.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmRejectMilestone(showRejectConfirm)}
                disabled={rejectingMilestone === showRejectConfirm}
                className="flex-1"
              >
                {rejectingMilestone === showRejectConfirm ? (
                  <LoadingSpinner className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
