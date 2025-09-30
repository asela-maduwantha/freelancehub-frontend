import React from 'react';
import { Card, CardHeader, CardBody } from '../../../../../../../components/ui/Card';
import { Badge } from '../../../../../../../components/ui/Display';
import { ProposalResponse } from '../../../../../../../lib/api/proposals';

interface ProposalSummaryProps {
  proposal: ProposalResponse | null;
  formatCurrency: (amount: number, currency?: string) => string;
}

export function ProposalSummary({ proposal, formatCurrency }: ProposalSummaryProps) {
  if (!proposal) return null;

  return (
    <Card variant="default">
      <CardHeader>
        <h2 className="text-lg font-semibold text-primary">Proposal Summary</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-secondary">Proposal ID</div>
            <div className="font-medium text-primary">#{proposal._id.slice(-6)}</div>
          </div>
          <div>
            <div className="text-sm text-secondary">Proposed Rate</div>
            <div className="font-medium" style={{color: 'var(--color-success)'}}>
              {formatCurrency(proposal.proposedRate.amount, proposal.proposedRate.currency)}
            </div>
          </div>
          <div>
            <div className="text-sm text-secondary">Status</div>
            <Badge variant="success">Accepted</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}