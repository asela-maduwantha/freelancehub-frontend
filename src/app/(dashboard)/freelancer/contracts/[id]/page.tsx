'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import { ContractResponse, contractService } from '../../../../../lib/api/contracts';
import CancelContractModal from '../../../../../components/features/contracts/CancelContractModal';
import { ComponentLoader } from '../../../../../components/common/Loading';
import { Badge } from '../../../../../components/ui/Display';
import Button from '../../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../../components/ui/Card';
import { Modal } from '../../../../../components/ui/Modal';
import { 
  ArrowLeft, Loader2, XCircle, CheckCircle2, Clock, DollarSign, 
  TrendingUp, FileText, Calendar, User, Award, Target, AlertCircle,
  CreditCard, Percent
} from 'lucide-react';
import { useToast } from '../../../../../components/common/Toast';
import Breadcrumb from '../../../../../components/common/Breadcrumb';

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  
  // Cancel contract modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const toast = useToast();



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

  // Check if user can cancel this contract
  const canCancelContract = contract && (
    contract.status === 'draft' || 
    contract.status === 'pending_payment_method' || 
    contract.status === 'active'
  );

  // Handle contract cancellation
  const handleCancelContract = async () => {
    if (!contract) return;

    try {
      await contractService.cancelContract(contract._id);
      toast.success('Contract cancelled successfully');
      
      // Refresh contract data to show updated status
      const updatedContract = await contractService.getContract(contractId);
      setContract(updatedContract);
      
      // Close the modal
      setShowCancelModal(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel contract. Please try again.';
      toast.error(errorMessage);
      throw err; // Re-throw to let modal handle it
    }
  };

  const handleViewMilestones = () => {
    router.push(`/freelancer/contracts/${contractId}/milestones`);
  };

  const handleBackToContracts = () => {
    router.push('/freelancer/contracts');
  };

  const handleSignContract = async () => {
    if (!contract) return;

    try {
      setSigningContract(true);
      await contractService.signContract(contract._id);
      // Refresh contract data
      const updatedContract = await contractService.getContract(contractId);
      setContract(updatedContract);
      setShowSignModal(false);
      alert('Contract signed successfully!');
    } catch (err: any) {
      alert('Failed to sign contract: ' + (err.message || 'Unknown error'));
    } finally {
      setSigningContract(false);
    }
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
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/freelancer' },
              { label: 'Contracts', href: '/freelancer/contracts' },
              { label: 'Contract Details' }
            ]}
          />

          <div>
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
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer' },
            { label: 'Contracts', href: '/freelancer/contracts' },
            { label: 'Contract Details' }
          ]}
        />

        {/* Enhanced Header with Gradient Background */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-sm text-gray-600 font-medium">Contract #{typeof contract._id === 'string' ? contract._id.slice(-6).toUpperCase() : 'N/A'}</span>
                <Badge variant={getStatusBadgeVariant(contract.status)} className="px-3 py-1">
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
                {contract.contractType && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {contract.contractType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {!contract.isFreelancerSigned && contract.status !== 'cancelled' && (
                <Button variant="primary" size="sm" onClick={() => setShowSignModal(true)} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Sign Contract
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleViewMilestones} className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                View Milestones
              </Button>
              {canCancelContract && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contract Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Contract Details Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Contract Information</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Description */}
                  {contract.description && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <h3 className="font-semibold text-blue-900">Description</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed ml-7">{contract.description}</p>
                    </div>
                  )}

                  {/* Contract Terms */}
                  {contract.terms && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <h3 className="font-semibold text-amber-900">Terms & Conditions</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed ml-7">{contract.terms}</p>
                    </div>
                  )}

                  {/* Dates with Icons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-1">Start Date</h3>
                        <p className="text-gray-700">{formatDate(contract.startDate)}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-1">End Date</h3>
                        <p className="text-gray-700">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Hours */}
                  {contract.estimatedHours && (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-indigo-900 mb-1">Estimated Hours</h3>
                        <p className="text-gray-700 text-lg">{contract.estimatedHours} hours</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Enhanced Progress Card with Gradient */}
            {contract.milestoneCount > 0 && (
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Milestone Progress</span>
                      <span className="text-emerald-700 font-semibold">
                        {contract.completedMilestones || 0} / {contract.milestoneCount} completed
                      </span>
                    </div>
                    <div className="relative w-full bg-emerald-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-500 ease-out shadow-sm" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <span className="text-2xl font-bold text-emerald-700">
                        {getProgressPercentage()}% Complete
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Enhanced Signature Status Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Signature Status</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    contract.isClientSigned 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {contract.isClientSigned ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Client
                        </p>
                        <p className={`text-sm font-medium ${contract.isClientSigned ? 'text-emerald-700' : 'text-gray-500'}`}>
                          {contract.isClientSigned ? '✓ Signed' : '○ Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    contract.isFreelancerSigned 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-amber-50 border-amber-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      {contract.isFreelancerSigned ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Freelancer (You)
                        </p>
                        <p className={`text-sm font-medium ${contract.isFreelancerSigned ? 'text-emerald-700' : 'text-amber-600'}`}>
                          {contract.isFreelancerSigned ? '✓ Signed' : '○ Action Required'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Financial Summary with Gradient Cards */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold">Financial Summary</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {/* Total Contract Value */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Total Contract Value</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 mt-2">
                      {formatCurrency(contract.totalAmount, contract.currency)}
                    </p>
                  </div>
                  
                  {/* Total Paid by Client */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-900">Total Paid by Client</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-emerald-700 mt-2">
                      {formatCurrency(contract.totalPaid, contract.currency)}
                    </p>
                  </div>

                  {/* Released to Me */}
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                        <p className="text-sm font-medium text-teal-900">Released to Me</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-teal-700 mt-2">
                      {formatCurrency(contract.releasedAmount, contract.currency)}
                    </p>
                  </div>

                  {/* Available for Release */}
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <p className="text-sm font-medium text-orange-900">Available for Release</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-orange-700 mt-2">
                      {formatCurrency(contract.remainingAmount, contract.currency)}
                    </p>
                  </div>

                  {/* Hourly Rate */}
                  {contract.hourlyRate && contract.hourlyRate > 0 && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <p className="text-sm font-medium text-purple-900">Hourly Rate</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-purple-700 mt-2">
                        {formatCurrency(contract.hourlyRate, contract.currency)}/hour
                      </p>
                    </div>
                  )}

                  {/* Platform Fee */}
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="w-5 h-5 text-gray-600" />
                        <p className="text-sm font-medium text-gray-900">Platform Fee</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-700 mt-2">
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

        {/* Sign Contract Modal */}
        <Modal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          title="Sign Contract"
        >
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-blue-500 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign Contract Agreement</h3>
              <p className="text-gray-600 mb-4">
                By signing this contract, you agree to the terms and conditions outlined in the agreement.
                This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-700">
                  <p><strong>Contract:</strong> {contract.title}</p>
                  <p><strong>Client:</strong> {typeof contract.clientId === 'object' ? contract.clientId.fullName : 'N/A'}</p>
                  <p><strong>Amount:</strong> {formatCurrency(contract.totalAmount, contract.currency)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSignModal(false)}
                disabled={signingContract}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSignContract}
                disabled={signingContract}
              >
                {signingContract ? 'Signing...' : 'Sign Contract'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Contract Modal */}
        {contract && (
          <CancelContractModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelContract}
            contract={contract}
            userRole="freelancer"
          />
        )}
      </div>
    </DashboardLayout>
  );
}