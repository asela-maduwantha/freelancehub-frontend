'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import { usePagination } from '../../../../lib/hooks/api';
import { API_ENDPOINTS } from '../../../../lib/api/endpoints';
import ContractListItem from '../../../../components/features/contracts/ContractListItem';
import { ContractResponse } from '../../../../lib/api/contracts';
import { ComponentLoader } from '../../../../components/common/Loading';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import Dropdown from '../../../../components/ui/Dropdown';

interface ContractStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  totalEarnings: number;
  pendingPayments: number;
}

export default function FreelancerContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contractTypeFilter, setContractTypeFilter] = useState<string>('all');
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>('all');

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

  // Calculate contract statistics
  const stats: ContractStats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const draft = contracts.filter(c => c.status === 'draft').length;
    const totalEarnings = contracts
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + c.freelancerAmount, 0);
    const pendingPayments = contracts
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.remainingAmount, 0);

    return { total, active, completed, draft, totalEarnings, pendingPayments };
  }, [contracts]);

  // Filter contracts based on search and filters
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.jobId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.clientId?.fullName.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

      // Contract type filter
      const matchesType = contractTypeFilter === 'all' || contract.contractType === contractTypeFilter;

      // Amount range filter
      let matchesAmount = true;
      if (amountRangeFilter !== 'all') {
        const amount = contract.totalAmount;
        switch (amountRangeFilter) {
          case 'under-100':
            matchesAmount = amount < 100;
            break;
          case '100-500':
            matchesAmount = amount >= 100 && amount <= 500;
            break;
          case '500-1000':
            matchesAmount = amount >= 500 && amount <= 1000;
            break;
          case 'over-1000':
            matchesAmount = amount > 1000;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesAmount;
    });
  }, [contracts, searchTerm, statusFilter, contractTypeFilter, amountRangeFilter]);

  const handleViewDetails = (contract: ContractResponse) => {
    router.push(`/freelancer/contracts/${contract._id}`);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const contractTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'fixed-price', label: 'Fixed Price' }
  ];

  const amountRangeOptions = [
    { value: 'all', label: 'All Amounts' },
    { value: 'under-100', label: 'Under $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: 'over-1000', label: 'Over $1,000' },
  ];

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
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer/dashboard' },
            { label: 'Contracts', icon: <FileText size={16} /> }
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <div className="text-sm text-gray-600">
            {filteredContracts.length} of {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search contracts by title, job, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                className="w-40"
              />
              <Dropdown
                options={contractTypeOptions}
                value={contractTypeFilter}
                onChange={setContractTypeFilter}
                placeholder="Type"
                className="w-40"
              />
              <Dropdown
                options={amountRangeOptions}
                value={amountRangeFilter}
                onChange={setAmountRangeFilter}
                placeholder="Amount"
                className="w-40"
              />
            </div>
          </div>
        </Card>

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {contracts.length === 0 ? 'No contracts found' : 'No contracts match your filters'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {contracts.length === 0
                  ? 'Your accepted projects will appear here.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || contractTypeFilter !== 'all' || amountRangeFilter !== 'all') && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setContractTypeFilter('all');
                    setAmountRangeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {filteredContracts.map((contract, index) => {
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
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'primary' : 'outline'}
                      onClick={() => goToPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}