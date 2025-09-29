'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ContractResponse, contractService } from '@/lib/api/contracts';
import { JobResponse, jobService } from '@/lib/api/jobs';
import { ProposalResponse, proposalService } from '@/lib/api/proposals';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ContractListItem from '@/components/features/contracts/ContractListItem';
import CreateMilestoneModal from '@/components/features/contracts/CreateMilestoneModal';
import { Spinner } from '@/components/ui/Feedback';
import Button from '@/components/ui/Button';

interface ContractWithDetails extends ContractResponse {
  job?: JobResponse;
  proposal?: ProposalResponse;
}

export default function ClientContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractResponse | null>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await contractService.getContracts(page, 10);
      console.log('Contracts API response:', response);
      
      // Handle different response structures
      let contractsData: ContractResponse[];
      let paginationData: any;
      
      if (response && response.contracts) {
        // If response has the expected structure
        contractsData = response.contracts;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        // If response is directly an array of contracts
        contractsData = response;
        paginationData = { total: response.length, pages: 1, page: 1, limit: 10 };
      } else {
        // If response has a different structure, try to extract contracts
        const anyResponse = response as any;
        contractsData = anyResponse?.data?.contracts || anyResponse?.contracts || [];
        paginationData = anyResponse?.data?.pagination || anyResponse?.pagination || { total: 0, pages: 1, page: 1, limit: 10 };
      }
      
      setTotal(paginationData.total);
      setTotalPages(paginationData.pages);

      // Fetch related job and proposal data for each contract
      const contractsWithDetails = await Promise.all(
        contractsData.map(async (contract: ContractResponse) => {
          try {
            // Ensure contract has proper structure before processing
            if (!contract || typeof contract !== 'object') {
              console.warn('Invalid contract data:', contract);
              return null;
            }

            const [job, proposal] = await Promise.all([
              jobService.getJob(typeof contract.jobId === 'object' ? contract.jobId._id : contract.jobId).catch(() => null),
              proposalService.getProposal(typeof contract.proposalId === 'object' ? contract.proposalId._id : contract.proposalId).catch(() => null)
            ]);
            
            return {
              ...contract,
              job,
              proposal
            } as ContractWithDetails;
          } catch (err) {
            console.warn('Error processing contract:', contract, err);
            // Return contract without additional details if fetching fails
            return contract as ContractWithDetails;
          }
        })
      );

      // Filter out any null contracts
      const validContracts = contractsWithDetails.filter(contract => contract !== null);
      setContracts(validContracts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page]);

  const handleRefresh = () => {
    setPage(1);
    fetchContracts();
  };

  const handleViewDetails = (contract: ContractResponse) => {
    router.push(`/client/contracts/${contract._id}`);
  };

  const handleCreateMilestone = (contract: ContractResponse) => {
    setSelectedContract(contract);
    setIsMilestoneModalOpen(true);
  };

  const handleMilestoneCreated = () => {
    fetchContracts(); // Refresh the contracts list
  };

  const getContractStats = () => {
    const active = contracts.filter(c => c.status === 'active').length;
    const pending = contracts.filter(c => c.status === 'pending').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const cancelled = contracts.filter(c => c.status === 'cancelled').length;
    
    return { active, pending, completed, cancelled };
  };

  const stats = getContractStats();

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Contracts</h1>
            <p className="text-secondary mt-1">
              Manage and track all your active contracts
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-emerald">{stats.active}</div>
              <div className="text-sm text-secondary">Active</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-accent">{stats.pending}</div>
              <div className="text-sm text-secondary">Pending</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-emerald">{stats.completed}</div>
              <div className="text-sm text-secondary">Completed</div>
            </div>
            <div className="card-default p-4">
              <div className="text-2xl font-bold text-muted">{stats.cancelled}</div>
              <div className="text-sm text-secondary">Cancelled</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert-warning p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
              <Button variant="secondary" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && contracts.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && contracts.length === 0 && !error && (
          <div className="card-default">
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-muted mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No contracts yet</h3>
              <p className="text-secondary mb-6">Contracts will appear here once you accept proposals and create contracts with freelancers.</p>
            </div>
          </div>
        )}

        {/* Contracts List */}
        {!isLoading && contracts.length > 0 && (
          <>
            <div className="space-y-4">
              {contracts.map((contract, index) => {
                // Debug log to see contract structure
                console.log('Rendering contract:', contract);
                
                // Safety check before rendering
                if (!contract || !contract._id) {
                  console.warn('Skipping invalid contract:', contract);
                  return null;
                }

                // Generate a safe key
                const contractKey = contract._id && typeof contract._id === 'string' 
                  ? contract._id 
                  : contract._id && typeof contract._id === 'object' && 'toString' in contract._id
                    ? (contract._id as any).toString()
                    : `contract-${index}`;

                return (
                  <ContractListItem
                    key={contractKey}
                    contract={contract}
                    userRole="client"
                    onViewDetails={handleViewDetails}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <span className="text-sm text-muted">
                    ({total} total contracts)
                  </span>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Create Milestone Modal */}
        {selectedContract && (
          <CreateMilestoneModal
            isOpen={isMilestoneModalOpen}
            onClose={() => {
              setIsMilestoneModalOpen(false);
              setSelectedContract(null);
            }}
            contract={selectedContract}
            onMilestoneCreated={handleMilestoneCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}