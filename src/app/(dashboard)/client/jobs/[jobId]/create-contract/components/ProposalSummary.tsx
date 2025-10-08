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

  const contractAmount = proposal.proposedRate.amount;
  const platformFee = contractAmount * 0.1; // 10% platform fee
  const totalCharge = contractAmount + platformFee;

  return (
    <Card variant="default">
      <CardHeader>
        <h2 className="text-lg font-semibold text-primary">Proposal Summary</h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-secondary">Proposal ID</div>
              <div className="font-medium text-primary">#{proposal._id.slice(-6)}</div>
            </div>
            <div>
              <div className="text-sm text-secondary">Contract Amount</div>
              <div className="font-medium" style={{color: 'var(--color-success)'}}>
                {formatCurrency(contractAmount, proposal.proposedRate.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary">Status</div>
              <Badge variant="success">Accepted</Badge>
            </div>
          </div>

          {/* Platform Fee Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Contract Amount:</span>
                    <span className="font-semibold">{formatCurrency(contractAmount, proposal.proposedRate.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (10%):</span>
                    <span className="font-semibold">+{formatCurrency(platformFee, proposal.proposedRate.currency)}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-1 mt-1 flex justify-between">
                    <span className="font-semibold">You will be charged:</span>
                    <span className="font-bold text-base">{formatCurrency(totalCharge, proposal.proposedRate.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}