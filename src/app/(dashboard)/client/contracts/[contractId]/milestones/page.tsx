'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contractService, ContractMilestonesResponse, MilestoneResponse } from '@/lib/api/contracts';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';
import { MilestoneCard } from '@/components/features/contracts';

const ContractMilestonesPage = () => {
  const router = useRouter();
  const params = useParams();
  const contractId = params.contractId as string;

  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState<string>('');

  useEffect(() => {
    if (contractId) {
      fetchMilestones();
    }
  }, [contractId]);

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: ContractMilestonesResponse = await contractService.getContractMilestones(contractId);
      
      setMilestones(response.milestones);
      
      // Get contract title from the first milestone if available
      if (response.milestones.length > 0) {
        const firstMilestone = response.milestones[0];
        if (typeof firstMilestone.contractId === 'object') {
          setContractTitle(firstMilestone.contractId.title);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch milestones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/client/contracts');
  };

  const getMilestoneStats = () => {
    const total = milestones.length;
    const pending = milestones.filter(m => m.isPending).length;
    const inProgress = milestones.filter(m => m.isInProgress).length;
    const completed = milestones.filter(m => m.isApproved).length;
    const overdue = milestones.filter(m => m.isOverdue && !m.isApproved).length;

    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const paidAmount = milestones.filter(m => m.isPaid).reduce((sum, m) => sum + m.amount, 0);

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      totalAmount,
      paidAmount,
      currency: milestones[0]?.currency || 'USD'
    };
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (milestone: MilestoneResponse) => {
    if (milestone.isPaid) return { text: 'Paid', class: 'bg-emerald text-white' };
    if (milestone.isApproved) return { text: 'Approved', class: 'bg-emerald-light text-emerald' };
    if (milestone.isSubmitted) return { text: 'Submitted', class: 'bg-blue-light text-blue' };
    if (milestone.isInProgress) return { text: 'In Progress', class: 'bg-accent-light text-accent' };
    if (milestone.isOverdue) return { text: 'Overdue', class: 'bg-red-light text-red' };
    return { text: 'Pending', class: 'bg-muted-light text-muted' };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="alert-warning p-6 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold mb-2">Error Loading Milestones</h3>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-x-3">
              <Button variant="secondary" size="sm" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button variant="primary" size="sm" onClick={fetchMilestones}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getMilestoneStats();

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="secondary" size="sm" onClick={handleGoBack}>
              ← Back to Contracts
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-primary">Contract Milestones</h1>
          {contractTitle && (
            <p className="text-secondary mt-1">{contractTitle}</p>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {milestones.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="card p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-secondary">Total</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-muted">{stats.pending}</div>
            <div className="text-sm text-secondary">Pending</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-accent">{stats.inProgress}</div>
            <div className="text-sm text-secondary">In Progress</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-emerald">{stats.completed}</div>
            <div className="text-sm text-secondary">Completed</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-red">{stats.overdue}</div>
            <div className="text-sm text-secondary">Overdue</div>
          </div>
          <div className="card p-4">
            <div className="text-lg font-bold text-emerald">
              {formatCurrency(stats.totalAmount, stats.currency)}
            </div>
            <div className="text-sm text-secondary">Total Value</div>
          </div>
          <div className="card p-4">
            <div className="text-lg font-bold text-emerald">
              {formatCurrency(stats.paidAmount, stats.currency)}
            </div>
            <div className="text-sm text-secondary">Amount Paid</div>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted text-lg mb-4">No milestones found</div>
          <p className="text-secondary mb-6">
            This contract doesn't have any milestones yet.
          </p>
          <Button variant="secondary" onClick={handleGoBack}>
            Back to Contracts
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone) => (
              <MilestoneCard
                key={milestone._id}
                milestone={milestone}
                onUpdate={fetchMilestones}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ContractMilestonesPage;