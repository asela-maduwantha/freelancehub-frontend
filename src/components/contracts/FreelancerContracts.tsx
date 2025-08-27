'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Upload
} from 'lucide-react';
import Link from 'next/link';

interface Contract {
  _id: string;
  projectId: string;
  clientId: string;
  project: {
    title: string;
    budget: {
      amount: number;
      type: string;
    };
  };
  client: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  status: string;
  totalAmount: number;
  earnedAmount: number;
  milestones: Array<{
    title: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
  startDate: string;
  endDate: string;
}

export default function FreelancerContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchContracts = async () => {
      try {
        // Mock data for now
        const mockContracts: Contract[] = [
          {
            _id: '1',
            projectId: '1',
            clientId: '1',
            project: {
              title: 'Website Redesign',
              budget: {
                amount: 5000,
                type: 'fixed'
              }
            },
            client: {
              profile: {
                firstName: 'Jane',
                lastName: 'Smith'
              }
            },
            status: 'active',
            totalAmount: 5000,
            earnedAmount: 2000,
            milestones: [
              {
                title: 'Design Phase',
                amount: 2000,
                status: 'completed',
                dueDate: '2024-01-15'
              },
              {
                title: 'Development Phase',
                amount: 2000,
                status: 'in_progress',
                dueDate: '2024-02-15'
              },
              {
                title: 'Testing & Launch',
                amount: 1000,
                status: 'pending',
                dueDate: '2024-03-15'
              }
            ],
            startDate: '2024-01-01',
            endDate: '2024-03-15'
          }
        ];
        setContracts(mockContracts);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Contracts
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your active contracts and track earnings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any active contracts yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contracts.map((contract) => (
              <Card key={contract._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{contract.project.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {contract.client.profile.firstName} {contract.client.profile.lastName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contract Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-medium">${contract.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Earned Amount</p>
                        <p className="font-medium text-green-600">${contract.earnedAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((contract.earnedAmount / contract.totalAmount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(contract.earnedAmount / contract.totalAmount) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
                      <div className="space-y-2">
                        {contract.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{milestone.title}</p>
                              <p className="text-xs text-gray-500">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">${milestone.amount}</span>
                              <Badge className={getMilestoneStatusColor(milestone.status)}>
                                {milestone.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link href={`/contracts/${contract._id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/contracts/${contract._id}/submit-work`} className="flex-1">
                        <Button className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Work
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
