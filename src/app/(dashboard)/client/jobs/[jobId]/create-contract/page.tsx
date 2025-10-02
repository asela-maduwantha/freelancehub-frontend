'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { ProposalResponse, proposalService } from '../../../../../../lib/api/proposals';
import { JobResponse, jobService } from '../../../../../../lib/api/jobs';
import { CreateContractMilestoneRequest } from '../../../../../../lib/api/contracts';
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout';
import { Card, CardBody } from '../../../../../../components/ui/Card';
import { Spinner } from '../../../../../../components/ui/Feedback';
import { ContractHeader } from './components/ContractHeader';
import { ProposalSummary } from './components/ProposalSummary';
import { ContractTimeline } from './components/ContractTimeline';
import { MilestonesSection } from './components/MilestonesSection';
import { ContractTerms } from './components/ContractTerms';
import { MilestoneFormData, MilestoneInput } from './types';
import { formatCurrency } from '../../../../../../lib/utils/formatting';
import { setContractCreationFlow } from '../../../../../../store/slices/payments';
import { AppDispatch } from '../../../../../../store';
import Button from '../../../../../../components/ui/Button';

function CreateContractPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const searchParams = useSearchParams();

  const jobId = params.jobId as string;
  const proposalId = searchParams.get('proposalId');

  // State variables
  const [job, setJob] = useState<JobResponse | null>(null);
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState('');
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);

  // Helper to format currency
  const formatCurrencyHelper = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Fetch job and proposal data
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !proposalId) {
        setError('Missing job ID or proposal ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch job details
        const jobData = await jobService.getJob(jobId);
        setJob(jobData);

        // Fetch proposal details
        const proposalData = await proposalService.getProposal(proposalId);
        setProposal(proposalData);

        // Set default dates (start tomorrow, end in 3 months)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split('T')[0]);

        const threeMonthsLater = new Date(tomorrow);
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        setEndDate(threeMonthsLater.toISOString().split('T')[0]);

      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId, proposalId]);

  // Add milestone from custom form
  const handleAddMilestone = (milestone: MilestoneInput) => {
    const newMilestone: MilestoneFormData = {
      id: `milestone-${Date.now()}`,
      ...milestone,
      isFromProposal: false,
    };
    setMilestones([...milestones, newMilestone]);
  };

  // Toggle proposal milestone
  const handleToggleProposalMilestone = (milestoneIndex: number) => {
    if (!proposal?.proposedMilestones) return;

    const proposalMilestone = proposal.proposedMilestones[milestoneIndex];
    
    // Check if already added
    const existingIndex = milestones.findIndex(
      m => m.isFromProposal && m.title === proposalMilestone.title
    );

    if (existingIndex >= 0) {
      // Remove it
      setMilestones(milestones.filter((_, i) => i !== existingIndex));
    } else {
      // Add it
      const newMilestone: MilestoneFormData = {
        id: `milestone-${Date.now()}-${milestoneIndex}`,
        title: proposalMilestone.title || '',
        description: proposalMilestone.description || '',
        amount: proposalMilestone.amount || 0,
        durationDays: proposalMilestone.durationDays || 1,
        isFromProposal: true,
      };
      setMilestones([...milestones, newMilestone]);
    }
  };

  // Update milestone
  const handleUpdateMilestone = (index: number, milestone: MilestoneFormData) => {
    const updated = [...milestones];
    updated[index] = milestone;
    setMilestones(updated);
  };

  // Remove milestone
  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Move milestone up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...milestones];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setMilestones(updated);
  };

  // Move milestone down
  const handleMoveDown = (index: number) => {
    if (index === milestones.length - 1) return;
    const updated = [...milestones];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setMilestones(updated);
  };

  // Get total milestone amount
  const getTotalMilestoneAmount = () => {
    return milestones.reduce((sum, m) => sum + m.amount, 0);
  };

  // Get proposed rate from proposal
  const getProposedRate = () => {
    return proposal?.proposedRate?.amount || 0;
  };

  // Calculate remaining amount
  const getRemainingAmount = () => {
    return getProposedRate() - getTotalMilestoneAmount();
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!startDate) return 'Please select a start date';
    if (!endDate) return 'Please select an end date';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 'End date must be after start date';

    if (milestones.length === 0) return 'Please add at least one milestone';

    // Validate each milestone
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (!milestone.title.trim()) return `Milestone ${i + 1}: Title is required`;
      if (milestone.amount <= 0) return `Milestone ${i + 1}: Amount must be greater than 0`;
      if (milestone.durationDays < 1) return `Milestone ${i + 1}: Duration must be at least 1 day`;
    }

    // Validate total amount equals proposed rate
    const totalAmount = getTotalMilestoneAmount();
    const proposedRate = getProposedRate();
    if (Math.abs(totalAmount - proposedRate) > 0.01) {
      const diff = totalAmount - proposedRate;
      if (diff > 0) {
        return `Total milestone amount ($${totalAmount.toFixed(2)}) exceeds the proposed rate ($${proposedRate.toFixed(2)}) by $${diff.toFixed(2)}`;
      } else {
        return `Total milestone amount ($${totalAmount.toFixed(2)}) is less than the proposed rate ($${proposedRate.toFixed(2)}). You need to add $${Math.abs(diff).toFixed(2)} more`;
      }
    }

    return null;
  };

  // Submit form - now just validates and navigates to payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Prepare contract data
    const contractMilestones: CreateContractMilestoneRequest[] = milestones.map((m, index) => ({
      title: m.title,
      description: m.description,
      amount: m.amount,
      durationDays: m.durationDays,
      order: index + 1,
    }));

    const contractData = {
      proposalId: proposalId!,
      startDate,
      endDate,
      milestones: contractMilestones,
      terms: terms || undefined,
    };

    // Store contract data in Redux and navigate to payment selection
    dispatch(setContractCreationFlow({
      jobId,
      proposalId: proposalId!,
      contractData,
      selectedPaymentMethodId: null,
      returnUrl: `/client/jobs/${jobId}/create-contract?proposalId=${proposalId}`,
    }));

    // Navigate to payment method selection
    router.push('/client/payment-methods/select');
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state (no data)
  if (error && !job && !proposal) {
    return (
      <DashboardLayout userRole="client">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="alert-error p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <ContractHeader job={job} formatCurrency={formatCurrencyHelper} />

          {/* Proposal Summary */}
          <ProposalSummary proposal={proposal} formatCurrency={formatCurrencyHelper} />

          {/* Contract Timeline */}
          <ContractTimeline
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            isSubmitting={false}
          />

          {/* Milestones Section */}
          <MilestonesSection
            milestones={milestones}
            proposal={proposal}
            isSubmitting={false}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onRemoveMilestone={handleRemoveMilestone}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onToggleProposalMilestone={handleToggleProposalMilestone}
            formatCurrency={formatCurrencyHelper}
            proposedRate={getProposedRate()}
            remainingAmount={getRemainingAmount()}
          />

          {/* Contract Terms */}
          <ContractTerms
            terms={terms}
            setTerms={setTerms}
            isSubmitting={false}
          />

          {/* Payment Info Banner */}
          <Card variant="default">
            <CardBody>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Secure Payment Required
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                      You will be charged <span className="font-bold text-primary">{formatCurrencyHelper(getProposedRate())}</span> upfront. 
                      Funds will be securely held in escrow and released as milestones are completed and approved.
                    </p>
                    <ul className="space-y-2 text-sm text-secondary">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Secure payment processing via Stripe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Your payment information is encrypted and secure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Funds released only when you approve completed milestones</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Submit Actions */}
          <Card variant="default">
            <CardBody>
              {error && (
                <div className="mb-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-error">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!startDate || !endDate || milestones.length === 0}
                  className="flex-1"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardBody>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateContractPage;