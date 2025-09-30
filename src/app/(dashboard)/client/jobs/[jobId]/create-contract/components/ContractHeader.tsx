import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../../../../../components/ui/Button';
import { JobResponse } from './../../../../../../../lib/api/jobs';

interface ContractHeaderProps {
  job: JobResponse | null;
  formatCurrency: (amount: number, currency?: string) => string;
}

export function ContractHeader({ job, formatCurrency }: ContractHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">Create Contract</h1>
        </div>
        {job && (
          <div>
            <p className="text-lg text-primary font-medium">{job.title}</p>
            <p className="text-secondary text-sm mt-1">
              {job.category} • {formatCurrency(job.budget.min)} {job.budget.max ? `- ${formatCurrency(job.budget.max)}` : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}