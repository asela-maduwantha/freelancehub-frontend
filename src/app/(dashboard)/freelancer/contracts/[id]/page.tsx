'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { ContractResponse, contractService } from '../../../../../lib/api/contracts';
import { ComponentLoader } from '../../../../../components/common/Loading';
import { Badge } from '../../../../../components/ui/Display';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../components/ui/Card';

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const contractData = await contractService.getContract(contractId);
        setContract(contractData);
      } catch (err: any) {
        setError(err.message || 'Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchContract();
    }
  }, [contractId]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getProgressPercentage = () => {
    if (!contract || contract.milestoneCount === 0) return 0;
    return Math.round(((contract.completedMilestones || 0) / contract.milestoneCount) * 100);
  };

  const handleViewMilestones = () => {
    router.push(`/freelancer/contracts/${contractId}/milestones`);
  };

  const handleBackToContracts = () => {
    router.push('/freelancer/contracts');
  };

  if (loading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="secondary" onClick={handleBackToContracts}>
              ← Back to Contracts
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Contract Details</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Contract</h3>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleBackToContracts}>
              ← Back to Contracts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">Contract #{typeof contract._id === 'string' ? contract._id.slice(-6) : 'N/A'}</span>
                <Badge variant={getStatusBadgeVariant(contract.status)}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
                {contract.contractType && (
                  <Badge variant="secondary">
                    {contract.contractType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleViewMilestones}>
              View Milestones
            </Button>
          </div>
        </div>

        {/* Contract Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Details Card */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Contract Information</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Description */}
                  {contract.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{contract.description}</p>
                    </div>
                  )}

                  {/* Contract Terms */}
                  {contract.terms && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Terms & Conditions</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{contract.terms}</p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Start Date</h3>
                      <p className="text-gray-600">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">End Date</h3>
                      <p className="text-gray-600">{formatDate(contract.endDate)}</p>
                    </div>
                  </div>

                  {/* Estimated Hours */}
                  {contract.estimatedHours && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Estimated Hours</h3>
                      <p className="text-gray-600">{contract.estimatedHours} hours</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Progress Card */}
            {contract.milestoneCount > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Milestone Progress</span>
                      <span className="text-gray-600">
                        {contract.completedMilestones || 0} / {contract.milestoneCount} completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-lg font-semibold text-emerald-600">
                      {getProgressPercentage()}% Complete
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Signature Status */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Signature Status</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${contract.isClientSigned ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Client</p>
                      <p className={`text-sm ${contract.isClientSigned ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {contract.isClientSigned ? 'Signed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${contract.isFreelancerSigned ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Freelancer</p>
                      <p className={`text-sm ${contract.isFreelancerSigned ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {contract.isFreelancerSigned ? 'Signed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Contract Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(contract.totalAmount, contract.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-xl font-semibold text-emerald-600">
                      {formatCurrency(contract.totalPaid, contract.currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-xl font-semibold text-orange-600">
                      {formatCurrency(contract.totalAmount - contract.totalPaid, contract.currency)}
                    </p>
                  </div>

                  {contract.hourlyRate && contract.hourlyRate > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(contract.hourlyRate, contract.currency)}/hour
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Platform Fee</p>
                    <p className="text-lg font-medium text-gray-900">
                      {contract.platformFeePercentage}%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contract Metadata */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Contract Details</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Contract ID</p>
                    <p className="text-sm font-mono text-gray-900">
                      {typeof contract._id === 'string' 
                        ? contract._id 
                        : contract._id && typeof contract._id === 'object' && 'toString' in contract._id
                          ? (contract._id as any).toString()
                          : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job ID</p>
                    <p className="text-sm font-mono text-gray-900">
                      {typeof contract.jobId === 'object' ? contract.jobId._id : contract.jobId}
                    </p>
                    {typeof contract.jobId === 'object' && (
                      <p className="text-xs text-gray-500 mt-1">{contract.jobId.title}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Proposal ID</p>
                    <p className="text-sm font-mono text-gray-900">
                      {typeof contract.proposalId === 'object' ? contract.proposalId._id : contract.proposalId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="text-sm text-gray-900">
                      {typeof contract.clientId === 'object' ? contract.clientId.fullName : 'N/A'}
                    </p>
                    {typeof contract.clientId === 'object' && (
                      <p className="text-xs text-gray-500 mt-1">{contract.clientId.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(contract.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-900">{formatDate(contract.updatedAt)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}