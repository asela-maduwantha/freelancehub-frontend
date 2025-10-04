import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, DollarSign, MapPin, Users, Zap, ChevronRight, Bookmark } from 'lucide-react';
import Button from '../../ui/Button/Button';
import { JobResponse } from '../../../lib/api/jobs';
import { useSavedJobs } from '../../../lib/hooks/useSavedJobs';

interface RecentJobsSectionProps {
  jobs: JobResponse[];
  isLoading?: boolean;
}

const RecentJobCard: React.FC<{ job: JobResponse; index: number }> = ({ job, index }) => {
  const { isJobSaved, toggleSaveJob, isLoading } = useSavedJobs();
  const formatBudget = (budget: JobResponse['budget']) => {
    const { type, min, max, currency = 'USD' } = budget;

    if (type === 'range' && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return `$${min.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 p-4 w-80 flex-shrink-0 transition-all duration-200"
    >
      {/* New indicator */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="relative">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>

      {/* Urgent badge */}
      {job.isUrgent && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            <Zap className="h-3 w-3" />
            Urgent
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">
              {job.client.fullName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <Clock className="h-3 w-3" />
              {getTimeAgo(job.postedAt)}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-bold text-green-700 text-lg">{formatBudget(job.budget)}</span>
        </div>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 2).map((skill, skillIndex) => (
            <span
              key={skillIndex}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{job.skills.length - 2}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="h-3 w-3" />
            {job.proposalCount} proposals
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveJob({ id: job.id, title: job.title });
              }}
              disabled={isLoading}
              className={`p-1 rounded transition-all duration-200 ${
                isJobSaved(job.id)
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isJobSaved(job.id) ? 'Remove from saved jobs' : 'Save job'}
            >
              <Bookmark
                className={`h-3 w-3 ${isJobSaved(job.id) ? 'fill-current' : ''}`}
              />
            </button>
            <Link href={`/freelancer/jobs/${job.id}`}>
              <Button variant="outline" size="sm" className="text-xs px-3 py-1">
                View
              </Button>
            </Link>
            <Link href={`/freelancer/proposals/create/${job.id}`}>
              <Button variant="primary" size="sm" className="text-xs px-3 py-1">
                Apply
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecentJobsSection: React.FC<RecentJobsSectionProps> = ({ jobs, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 w-80 flex-shrink-0 animate-pulse">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-5 bg-gray-200 rounded"></div>
                <div className="flex gap-1">
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">Recently Posted</h2>
        </div>
        <Link href="/freelancer/jobs?sort=recent">
          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {jobs.map((job, index) => (
            <RecentJobCard key={job.id} job={job} index={index} />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 border border-gray-200"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 border border-gray-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default RecentJobsSection;