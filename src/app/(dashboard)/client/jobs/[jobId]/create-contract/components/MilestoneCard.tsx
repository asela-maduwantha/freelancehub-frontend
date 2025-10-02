import React from 'react';
import Button from '../../../../../../../components/ui/Button';
import { MilestoneFormData } from '../types';

interface MilestoneCardProps {
  milestone: MilestoneFormData;
  index: number;
  isEditable: boolean;
  isSubmitting: boolean;
  onUpdate: (milestone: MilestoneFormData) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
}

export function MilestoneCard({
  milestone,
  index,
  isEditable,
  isSubmitting,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  formatCurrency
}: MilestoneCardProps) {
  const handleFieldChange = (field: keyof MilestoneFormData, value: any) => {
    onUpdate({ ...milestone, [field]: value });
  };

  return (
    <div className="card-default p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-primary text-btn-accent rounded-lg w-10 h-10 flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                Milestone {index + 1}
              </span>
              {milestone.isFromProposal && (
                <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary bg-opacity-10 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  From Proposal
                </span>
              )}
            </div>
            {isEditable ? (
              <input
                type="text"
                value={milestone.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="input-default text-base font-medium w-full"
                placeholder="Enter milestone title"
                disabled={isSubmitting}
              />
            ) : (
              <h4 className="text-base font-semibold text-primary">
                {milestone.title || 'Untitled Milestone'}
              </h4>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp || isSubmitting}
              className="p-1 text-secondary hover:text-primary hover:bg-secondary rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown || isSubmitting}
              className="p-1 text-secondary hover:text-primary hover:bg-secondary rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            disabled={isSubmitting}
            className="text-error hover:text-error hover:bg-error-light p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remove milestone"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-3">
        {isEditable ? (
          <textarea
            value={milestone.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="input-default w-full resize-none"
            rows={3}
            placeholder="Enter milestone description"
            disabled={isSubmitting}
          />
        ) : (
          <p className="text-sm text-secondary">
            {milestone.description || 'No description provided'}
          </p>
        )}
      </div>

      {/* Amount and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-secondary mb-1">
            Amount <span className="text-error">*</span>
          </label>
          {isEditable ? (
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">$</span>
              <input
                type="number"
                value={milestone.amount}
                onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                className="input-default pl-7"
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="text-base font-semibold" style={{color: 'var(--color-success)'}}>
              {formatCurrency(milestone.amount)}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary mb-1">
            Duration (Days) <span className="text-error">*</span>
          </label>
          {isEditable ? (
            <input
              type="number"
              value={milestone.durationDays}
              onChange={(e) => handleFieldChange('durationDays', parseInt(e.target.value) || 1)}
              className="input-default"
              placeholder="0"
              min="1"
              disabled={isSubmitting}
            />
          ) : (
            <div className="text-base font-semibold text-primary">
              {milestone.durationDays} {milestone.durationDays === 1 ? 'day' : 'days'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
