'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { usePagination } from '../../../../lib/hooks/api';
import { API_ENDPOINTS } from '../../../../lib/api/endpoints';
import ContractListItem from '../../../../components/features/contracts/ContractListItem';
import { ContractResponse } from '../../../../lib/api/contracts';
import { ComponentLoader } from '../../../../components/common/Loading';

export default function FreelancerContractsPage() {
  const router = useRouter();

  const {
    data: contracts,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination<ContractResponse>(API_ENDPOINTS.CONTRACTS.LIST, 10);

  const handleViewDetails = (contract: ContractResponse) => {
    router.push(`/freelancer/contracts/${contract._id}`);
  };

  if (loading && contracts.length === 0) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Contracts</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <div className="text-sm text-gray-600">
            {contracts.length > 0 ? `${contracts.length} contract${contracts.length !== 1 ? 's' : ''}` : 'No contracts'}
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active contracts</h3>
                <p className="mt-1 text-sm text-gray-500">Your accepted projects will appear here.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {contracts.map((contract, index) => {
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
                    userRole="freelancer"
                    onViewDetails={handleViewDetails}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === page
                          ? 'text-blue-600 bg-blue-50 border border-blue-500'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}