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
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 font-medium transition-all"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Create Contract</h1>
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
    </div>
  );
}