import React, { useState } from 'react';
import Button from '../../../../../../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';
import { MilestoneInput } from '../types';

interface AddMilestoneFormProps {
  onAdd: (milestone: MilestoneInput) => void;
  isSubmitting: boolean;
  remainingAmount?: number;
  formatCurrency?: (amount: number) => string;
  remainingDays?: number;
  maxAllowedDays?: number;
}

export function AddMilestoneForm({ onAdd, isSubmitting, remainingAmount = 0, formatCurrency, remainingDays = 0, maxAllowedDays = 0 }: AddMilestoneFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    durationDays: 1,
  });
  const [durationError, setDurationError] = useState<string | null>(null);
  
  // Helper to suggest remaining amount
  const suggestRemainingAmount = () => {
    if (remainingAmount > 0) {
      setFormData({ ...formData, amount: remainingAmount });
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || formData.amount <= 0 || formData.durationDays < 1) {
      return;
    }

    // Validate duration doesn't exceed remaining days
    if (maxAllowedDays > 0 && formData.durationDays > remainingDays) {
      setDurationError(`This exceeds the remaining ${remainingDays} days.`);
      return;
    }

    onAdd({
      ...formData,
      durationDays: formData.durationDays < 1 ? 1 : formData.durationDays,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      amount: 0,
      durationDays: 1,
    });
    setDurationError(null);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      amount: 0,
      durationDays: 1,
    });
    setDurationError(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Card variant="default">
        <CardBody>
          <div className="text-center py-6">
            <div className="bg-primary bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-primary mb-2">Create Custom Milestone</h4>
            <p className="text-sm text-secondary mb-4">
              Define your own milestone with custom amount and timeline
              {remainingAmount > 0 && formatCurrency && (
                <span className="block mt-1 font-medium text-warning">
                  Remaining budget: {formatCurrency(remainingAmount)}
                </span>
              )}
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsExpanded(true)}
              disabled={isSubmitting}
              className="mx-auto"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Custom Milestone
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-primary">New Milestone</h4>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              Milestone Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-default"
              placeholder="e.g., Design Phase, Development Sprint 1"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-default resize-none"
              rows={3}
              placeholder="Describe what will be delivered in this milestone"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Amount ($) <span className="text-error">*</span>
                {remainingAmount > 0 && formatCurrency && (
                  <button
                    type="button"
                    onClick={suggestRemainingAmount}
                    className="ml-2 text-xs text-primary hover:underline"
                  >
                    Use remaining ({formatCurrency(remainingAmount)})
                  </button>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">$</span>
                <input
                  type="number"
                  value={formData.amount === 0 ? '' : formData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData({ ...formData, amount: 0 });
                      return;
                    }
                    const numValue = parseFloat(value);
                    setFormData({ ...formData, amount: isNaN(numValue) ? 0 : numValue });
                  }}
                  className="input-default pl-7"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  required
                />
              </div>
              {remainingAmount > 0 && formatCurrency && (
                <div className="form-help text-warning">
                  Remaining budget: {formatCurrency(remainingAmount)}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Duration (Days) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={formData.durationDays === 0 ? '' : formData.durationDays}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, durationDays: 0 });
                    setDurationError(null);
                    return;
                  }
                  const numValue = parseInt(value);
                  if (isNaN(numValue) || numValue < 1) {
                    setFormData({ ...formData, durationDays: 1 });
                    setDurationError(null);
                    return;
                  }
                  setFormData({ ...formData, durationDays: numValue });
                  
                  // Check if adding this milestone would exceed the max allowed days
                  if (maxAllowedDays > 0 && numValue > remainingDays) {
                    setDurationError(`This exceeds the remaining ${remainingDays} days. Maximum allowed is ${maxAllowedDays} days total.`);
                  } else {
                    setDurationError(null);
                  }
                }}
                onBlur={() => {
                  // Ensure at least 1 day when user leaves the field
                  if (formData.durationDays < 1) {
                    setFormData({ ...formData, durationDays: 1 });
                  }
                }}
                className={`input-default ${durationError ? 'border-error' : ''}`}
                placeholder="7"
                min="1"
                disabled={isSubmitting}
                required
              />
              {remainingDays >= 0 && maxAllowedDays > 0 && (
                <div className={`form-help ${durationError ? 'text-error' : 'text-secondary'}`}>
                  {durationError || `${remainingDays} days remaining in contract timeline`}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title.trim() || formData.amount <= 0}
            >
              Add Milestone
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
