'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Download,
  Upload,
  Play,
  Pause,
  Eye,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { contractApi } from '@/lib/api/contracts';

interface Contract {
  _id: string;
  title: string;
  client: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
  totalValue: number;
  currency: string;
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  progress: number;
  lastActivity: string;
  paymentStatus: 'pending' | 'partial' | 'completed';
}

interface Milestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'overdue';
  deliverables?: string[];
  feedback?: string;
}

interface TimeEntry {
  _id: string;
  contractId: string;
  date: string;
  hours: number;
  description: string;
  isRunning: boolean;
}

const ContractDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);

  useEffect(() => {
    fetchContracts();
    fetchTimeEntries();
  }, [activeTab]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await contractApi.getMyContracts({
        status: activeTab === 'all' ? undefined : activeTab
      });
      
      // The API now handles all error cases and always returns a valid ContractListResponse
      setContracts(response.contracts as any);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      // This would be implemented when the API is available
      // const response = await contractsApi.getTimeEntries();
      // setTimeEntries(response.data);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const handleMilestoneComplete = async (contractId: string, milestoneId: string) => {
    try {
      // await contractApi.completeMilestone(contractId, milestoneId);
      // This API method doesn't exist yet, so we'll comment it out
      console.log('Complete milestone:', contractId, milestoneId);
      await fetchContracts();
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  };

  const handleStartTimer = async (contractId: string) => {
    try {
      setIsTimerRunning(true);
      // API call to start timer would go here
      // const response = await contractsApi.startTimer(contractId);
      // setCurrentTimeEntry(response.data);
    } catch (error) {
      console.error('Error starting timer:', error);
      setIsTimerRunning(false);
    }
  };

  const handleStopTimer = async () => {
    try {
      if (currentTimeEntry) {
        // API call to stop timer would go here
        // await contractsApi.stopTimer(currentTimeEntry._id);
        setIsTimerRunning(false);
        setCurrentTimeEntry(null);
        await fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Timer Widget */}
        {isTimerRunning && currentTimeEntry && (
          <Card className="mt-4 lg:mt-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Timer Running</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStopTimer}
                  className="ml-auto"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Contracts</p>
                  <p className="text-2xl font-bold">
                    {contracts.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${contracts.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Logged</p>
                  <p className="text-2xl font-bold">
                    {timeEntries.reduce((sum, t) => sum + t.hours, 0)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {contracts.filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex space-x-1">
          {(['active', 'completed', 'all'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Contracts List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any contracts yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <motion.div key={contract._id} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contract.title}
                        </h3>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                        <Badge variant="secondary">
                          {contract.milestones.filter(m => m.status === 'completed').length}/{contract.milestones.length} milestones
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Client</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {contract.client.avatar && (
                              <img 
                                src={contract.client.avatar} 
                                alt={contract.client.name}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="font-medium">{contract.client.name}</span>
                            <span className="text-yellow-500">
                              ★ {contract.client.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="font-semibold text-lg">
                            {contract.currency}{contract.totalValue.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${contract.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{contract.progress}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-2 mb-4">
                        <h4 className="font-medium text-gray-900">Upcoming Milestones</h4>
                        {contract.milestones
                          .filter(m => m.status !== 'completed')
                          .slice(0, 2)
                          .map((milestone) => (
                            <div key={milestone._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h5 className="font-medium">{milestone.title}</h5>
                                  <Badge className={getMilestoneStatusColor(milestone.status)}>
                                    {milestone.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">
                                  {contract.currency}{milestone.amount.toLocaleString()}
                                </span>
                                {milestone.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMilestoneComplete(contract._id, milestone._id)}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>

                      {contract.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartTimer(contract._id)}
                          disabled={isTimerRunning}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start Timer
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download PDF
                      </Button>

                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedContract.title}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContract(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contract Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedContract.client.name}</p>
                    <p><span className="text-gray-600">Rating:</span> ★ {selectedContract.client.rating.toFixed(1)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Contract Details</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Status:</span> 
                      <Badge className={`ml-2 ${getStatusColor(selectedContract.status)}`}>
                        {selectedContract.status}
                      </Badge>
                    </p>
                    <p><span className="text-gray-600">Total Value:</span> {selectedContract.currency}{selectedContract.totalValue.toLocaleString()}</p>
                    <p><span className="text-gray-600">Start Date:</span> {new Date(selectedContract.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${selectedContract.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{selectedContract.progress}%</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedContract.milestones.filter(m => m.status === 'completed').length} of {selectedContract.milestones.length} milestones completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="font-semibold mb-4">Milestones</h3>
                <div className="space-y-4">
                  {selectedContract.milestones.map((milestone) => (
                    <Card key={milestone._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <Badge className={getMilestoneStatusColor(milestone.status)}>
                                {milestone.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{milestone.description}</p>
                            <p className="text-sm text-gray-500">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                            {milestone.deliverables && milestone.deliverables.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Deliverables:</p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {milestone.deliverables.map((deliverable, index) => (
                                    <li key={index}>{deliverable}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {milestone.feedback && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-sm"><span className="font-medium">Feedback:</span> {milestone.feedback}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className="font-semibold">
                              {selectedContract.currency}{milestone.amount.toLocaleString()}
                            </span>
                            {milestone.status === 'in_progress' && (
                              <div className="flex space-x-2">
                                <Button size="sm">
                                  <Upload className="w-4 h-4 mr-1" />
                                  Upload
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleMilestoneComplete(selectedContract._id, milestone._id)}
                                >
                                  Complete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDashboard;
