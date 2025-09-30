import React from 'react';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';

interface ContractTermsProps {
  terms: string;
  setTerms: (terms: string) => void;
  isSubmitting: boolean;
}

export function ContractTerms({ terms, setTerms, isSubmitting }: ContractTermsProps) {
  return (
    <Card variant="default">
      <CardHeader>
        <h3 className="text-lg font-semibold text-primary">Contract Terms</h3>
      </CardHeader>
      <CardBody>
        <div className="form-group">
          <label className="form-label">Additional Terms & Conditions (Optional)</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            disabled={isSubmitting}
            className="input-default resize-none"
            rows={4}
            placeholder="Enter any specific terms, conditions, or requirements for this contract..."
          />
          <div className="form-help">
            These terms will be added to the standard contract template.
          </div>
        </div>
      </CardBody>
    </Card>
  );
}