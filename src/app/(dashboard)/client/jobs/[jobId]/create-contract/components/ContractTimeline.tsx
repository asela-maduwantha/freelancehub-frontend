import React from 'react';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';

interface ContractTimelineProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  isSubmitting: boolean;
}

export function ContractTimeline({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isSubmitting
}: ContractTimelineProps) {
  return (
    <Card variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold text-primary">Contract Timeline</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">
              Start Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="input-default"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="form-help">When work should begin</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              End Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="input-default"
              min={startDate || new Date().toISOString().split('T')[0]}
            />
            <div className="form-help">When the project should be completed</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}