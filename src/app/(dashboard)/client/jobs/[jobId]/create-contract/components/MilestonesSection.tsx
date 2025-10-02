import React from 'react';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';
import { MilestoneCard } from './MilestoneCard';
import { AddMilestoneForm } from './AddMilestoneForm';
import { MilestoneFormData, MilestoneInput } from '../types';
import { ProposalResponse } from '../../../../../../../lib/api/proposals';

interface MilestonesSectionProps {
  milestones: MilestoneFormData[];
  proposal: ProposalResponse | null;
  isSubmitting: boolean;
  onAddMilestone: (milestone: MilestoneInput) => void;
  onUpdateMilestone: (index: number, milestone: MilestoneFormData) => void;
  onRemoveMilestone: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleProposalMilestone: (milestoneIndex: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  proposedRate: number;
  remainingAmount: number;
}

export function MilestonesSection({
  milestones,
  proposal,
  isSubmitting,
  onAddMilestone,
  onUpdateMilestone,
  onRemoveMilestone,
  onMoveUp,
  onMoveDown,
  onToggleProposalMilestone,
  formatCurrency,
  proposedRate,
  remainingAmount
}: MilestonesSectionProps) {
  const getTotalAmount = () => {
    return milestones.reduce((sum, m) => sum + m.amount, 0);
  };

  const getTotalDays = () => {
    return milestones.reduce((sum, m) => sum + m.durationDays, 0);
  };

  return (
    <div className="space-y-6">
      {/* Proposal Milestones Section */}
      {proposal?.proposedMilestones && proposal.proposedMilestones.length > 0 && (
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary">Proposal Milestones</h3>
                <p className="text-sm text-secondary mt-1">
                  Click "Add" to include proposal milestones in your contract
                </p>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                {proposal.proposedMilestones.length} Available
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {proposal.proposedMilestones.map((proposalMilestone: any, index: number) => {
                const isAdded = milestones.some(
                  m => m.isFromProposal && m.title === proposalMilestone.title
                );
                
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                      isAdded 
                        ? 'border-success bg-success bg-opacity-5' 
                        : 'border-light hover:border-primary hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-primary">{proposalMilestone.title}</h4>
                          {isAdded && (
                            <span className="inline-flex items-center gap-1 text-xs text-success bg-success bg-opacity-10 px-2 py-1 rounded-full font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Added to Contract
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary mb-3">
                          {proposalMilestone.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-6 text-sm flex-wrap">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-lg" style={{color: 'var(--color-success)'}}>
                              {formatCurrency(proposalMilestone.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-secondary font-medium">
                              {proposalMilestone.durationDays} {proposalMilestone.durationDays === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleProposalMilestone(index)}
                          disabled={isSubmitting}
                          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm ${
                            isAdded
                              ? 'bg-error text-btn-accents hover:bg-opacity-90 hover:shadow-md'
                              : 'bg-primary text-btn-accents hover:bg-opacity-90 hover:shadow-md'
                          }`}
                        >
                          {isAdded ? (
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Remove
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add Custom Milestone Form - MOVED HERE (before Contract Milestones) */}
      <AddMilestoneForm
        onAdd={onAddMilestone}
        isSubmitting={isSubmitting}
        remainingAmount={remainingAmount}
        formatCurrency={formatCurrency}
      />

      {/* Contract Milestones Section */}
      <Card variant="default">
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary">Contract Milestones</h3>
                <p className="text-sm text-secondary mt-1">
                  These milestones will be included in the contract
                </p>
              </div>
              {milestones.length > 0 && (
                <div className="text-right">
                  <div className="text-xs text-secondary">Total Duration</div>
                  <div className="text-lg font-bold text-primary">
                    {getTotalDays()} {getTotalDays() === 1 ? 'day' : 'days'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Budget Summary Bar */}
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary">Budget Allocation</span>
                <span className="text-xs text-secondary">
                  {getTotalAmount() > 0 ? `${((getTotalAmount() / proposedRate) * 100).toFixed(1)}%` : '0%'} allocated
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-light rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    Math.abs(remainingAmount) < 0.01
                      ? 'bg-success'
                      : remainingAmount < 0
                      ? 'bg-error'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((getTotalAmount() / proposedRate) * 100, 100)}%` }}
                ></div>
              </div>
              
              {/* Amount Details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-secondary mb-1">Proposed Rate</div>
                  <div className="text-sm font-bold text-primary">
                    {formatCurrency(proposedRate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">Total Milestones</div>
                  <div className={`text-sm font-bold ${
                    Math.abs(remainingAmount) < 0.01
                      ? 'text-success'
                      : remainingAmount < 0
                      ? 'text-error'
                      : 'text-primary'
                  }`}>
                    {formatCurrency(getTotalAmount())}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-secondary mb-1">
                    {remainingAmount >= 0 ? 'Remaining' : 'Over Budget'}
                  </div>
                  <div className={`text-sm font-bold ${
                    Math.abs(remainingAmount) < 0.01
                      ? 'text-success'
                      : remainingAmount < 0
                      ? 'text-error'
                      : 'text-warning'
                  }`}>
                    {formatCurrency(Math.abs(remainingAmount))}
                  </div>
                </div>
              </div>
              
              {/* Validation Message */}
              {Math.abs(remainingAmount) < 0.01 ? (
                <div className="mt-3 flex items-center gap-2 text-success bg-success bg-opacity-10 rounded px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium">Perfect! Milestones total matches the proposed rate.</span>
                </div>
              ) : remainingAmount > 0 ? (
                <div className="mt-3 flex items-center gap-2 text-warning bg-warning bg-opacity-10 rounded px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs font-medium">Add {formatCurrency(remainingAmount)} more to match the proposed rate.</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-error bg-error bg-opacity-10 rounded px-3 py-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium">Reduce milestones by {formatCurrency(Math.abs(remainingAmount))} to match the proposed rate.</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {milestones.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-primary mb-2">No Milestones Added Yet</h4>
              <p className="text-secondary text-sm">
                {proposal?.proposedMilestones && proposal.proposedMilestones.length > 0
                  ? 'Select milestones from the proposal above or create custom milestones'
                  : 'Create custom milestones using the form above to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  isEditable={!milestone.isFromProposal}
                  isSubmitting={isSubmitting}
                  onUpdate={(updated) => onUpdateMilestone(index, updated)}
                  onRemove={() => onRemoveMilestone(index)}
                  onMoveUp={() => onMoveUp(index)}
                  onMoveDown={() => onMoveDown(index)}
                  canMoveUp={index > 0}
                  canMoveDown={index < milestones.length - 1}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
