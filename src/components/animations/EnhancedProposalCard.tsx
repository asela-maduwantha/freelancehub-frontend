import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../ui/Card';
import StatusBadge from '../ui/Display/StatusBadge';
import ProposalProgress from './ProposalProgress';
import {
  Eye,
  DollarSign,
  Clock,
  FileText,
  Edit,
  X,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import Button from '../ui/Button';

interface EnhancedProposalCardProps {
  proposal: any; // Using any for now, should be typed properly
  index: number;
  onViewJob: (jobId: string) => void;
  onEdit?: (proposalId: string) => void;
  onWithdraw?: (proposalId: string) => void;
  onMessageClient?: (proposalId: string) => void;
}

const EnhancedProposalCard: React.FC<EnhancedProposalCardProps> = ({
  proposal,
  index,
  onViewJob,
  onEdit,
  onWithdraw,
  onMessageClient
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut'
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <Card
        variant="elevated"
        className="overflow-hidden border border-gray-200/50 hover:border-blue-200/50 transition-all duration-300 hover:shadow-xl"
      >
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    Proposal for Job #{proposal.job ? proposal.job.id.slice(-8) : 'Unknown'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <StatusBadge status={proposal.status} />
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Submitted {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="hidden lg:block"
                >
                  <ProposalProgress status={proposal.status} className="w-48" />
                </motion.div>
              </div>

              {/* Progress for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="lg:hidden"
              >
                <ProposalProgress status={proposal.status} />
              </motion.div>

              {/* Cover Letter Preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-100"
              >
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Cover Letter
                </h4>
                <p className="text-gray-700 line-clamp-3 leading-relaxed">
                  {proposal.coverLetter.length > 200
                    ? `${proposal.coverLetter.substring(0, 200)}...`
                    : proposal.coverLetter
                  }
                </p>
              </motion.div>

              {/* Proposal Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100/50">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Proposed Rate</span>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(proposal.proposedRate.amount)} {proposal.proposedRate.type}
                    </p>
                  </div>
                </div>

                {proposal.estimatedDuration && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 font-medium">Estimated Duration</span>
                      <p className="font-semibold text-gray-900">
                        {proposal.estimatedDuration.value} {proposal.estimatedDuration.unit}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Milestones */}
              {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                  className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg p-4 border border-purple-100/50"
                >
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    Milestones ({proposal.proposedMilestones.length})
                  </h4>
                  <div className="space-y-2">
                    {proposal.proposedMilestones.slice(0, 2).map((milestone: any, milestoneIndex: number) => (
                      <motion.div
                        key={milestoneIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.8 + milestoneIndex * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-white/50 hover:bg-white/80 transition-colors duration-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{milestone.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(milestone.amount)} • {milestone.durationDays} days
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {proposal.proposedMilestones.length > 2 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{proposal.proposedMilestones.length - 2} more milestones
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.9 }}
              className="flex flex-col gap-3 lg:min-w-[200px]"
            >
              <Button
                variant="primary"
                onClick={() => proposal.job && onViewJob(proposal.job.id)}
                disabled={!proposal.job}
                className="w-full group/btn hover:scale-105 transition-transform duration-200"
              >
                <Eye className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                View Job
              </Button>

              {onEdit && proposal.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(proposal._id)}
                  className="w-full hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}

              {onMessageClient && (
                <Button
                  variant="outline"
                  onClick={() => onMessageClient(proposal._id)}
                  className="w-full hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
              )}

              {proposal.status === 'pending' && onWithdraw && (
                <Button
                  variant="outline"
                  onClick={() => onWithdraw(proposal._id)}
                  className="w-full hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <X className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              )}
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default EnhancedProposalCard;