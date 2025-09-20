'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import { ComponentLoader } from '../../../../../../components/common/Loading';
import Button from '../../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../../components/ui/Card';
import { Badge } from '../../../../../../components/ui/Display';
import { milestoneApi, MilestoneResponse } from '../../../../../../lib/api/milestones';
import { SubmitWorkModal } from '../../../../../../components/features/milestones';

export default function ContractMilestonesPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneResponse | null>(null);

  useEffect(() => {
    fetchMilestones();
  }, [contractId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await milestoneApi.getByContract(contractId);
      setMilestones(response.milestones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (milestoneId: string) => {
    try {
      setActionLoading(milestoneId);
      await milestoneApi.startWork(milestoneId);
      await fetchMilestones(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start work');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitWork = async (milestone: MilestoneResponse) => {
    setSelectedMilestone(milestone);
    setSubmitModalOpen(true);
  };

  const handleSubmitComplete = async () => {
    await fetchMilestones(); // Refresh the list
    setSubmitModalOpen(false);
    setSelectedMilestone(null);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const canStartWork = (milestone: MilestoneResponse) => {
    return milestone.status === 'pending' || milestone.status === 'rejected';
  };

  const canSubmitWork = (milestone: MilestoneResponse) => {
    return milestone.status === 'in-progress';
  };

  if (loading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Contract Milestones</h1>
            <Button variant="secondary" onClick={() => router.back()}>
              Back to Contracts
            </Button>
          </div>
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Contract Milestones</h1>
            <Button variant="secondary" onClick={() => router.back()}>
              Back to Contracts
            </Button>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Milestones</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Contract Milestones</h1>
          <Button variant="secondary" onClick={() => router.back()}>
            Back to Contracts
          </Button>
        </div>

        {milestones.length === 0 ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones found</h3>
                <p className="mt-1 text-sm text-gray-500">This contract doesn't have any milestones yet.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {milestones.map((milestone) => (
              <Card key={milestone._id} variant="default" className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {milestone.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-secondary">Milestone #{milestone.order}</span>
                        <Badge variant={getStatusBadgeVariant(milestone.status)}>
                          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald">
                        {formatCurrency(milestone.amount, milestone.currency)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-secondary">{milestone.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary">Due Date:</span>
                        <div className="text-secondary">{formatDate(milestone.dueDate)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-primary">Created:</span>
                        <div className="text-secondary">{formatDate(milestone.createdAt)}</div>
                      </div>
                    </div>

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="border-t border-light pt-4">
                        <h5 className="font-medium text-primary mb-2">Deliverables</h5>
                        <div className="space-y-2">
                          {milestone.deliverables.map((deliverable: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {deliverable.url ? (
                                <a
                                  href={deliverable.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                                >
                                  {deliverable.filename}
                                </a>
                              ) : (
                                <span className="text-primary">{deliverable.filename}</span>
                              )}
                              <span className="text-secondary">({(deliverable.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>

                <CardFooter>
                  <div className="flex gap-3">
                    {canStartWork(milestone) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartWork(milestone._id)}
                        disabled={actionLoading === milestone._id}
                      >
                        {actionLoading === milestone._id ? 'Starting...' : 'Start Work'}
                      </Button>
                    )}
                    {canSubmitWork(milestone) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitWork(milestone)}
                        disabled={actionLoading === milestone._id}
                      >
                        {actionLoading === milestone._id ? 'Submitting...' : 'Submit Work'}
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" disabled>
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Submit Work Modal */}
      {selectedMilestone && (
        <SubmitWorkModal
          milestoneId={selectedMilestone._id}
          milestoneTitle={selectedMilestone.title}
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          onSubmit={handleSubmitComplete}
        />
      )}
    </DashboardLayout>
  );
}