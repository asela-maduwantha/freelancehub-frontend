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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 w-[350px] flex-shrink-0 transition-all duration-300 overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-pink-50/30 transition-all duration-500 pointer-events-none"></div>

      {/* New indicator */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="relative">
          <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
          <div className="absolute inset-0 w-5 h-5 bg-green-400 rounded-full animate-ping opacity-60"></div>
        </div>
      </div>

      {/* Urgent badge */}
      {job.isUrgent && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
            <Zap className="h-3.5 w-3.5 fill-current" />
            Urgent
          </div>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <span className="text-white font-bold text-base">
              {job.client.fullName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors duration-200">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{getTimeAgo(job.postedAt)}</span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-100">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <span className="font-bold text-green-700 text-xl">{formatBudget(job.budget)}</span>
        </div>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill, skillIndex) => (
            <span
              key={skillIndex}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100 hover:border-blue-200 transition-colors duration-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">{job.proposalCount}</span>
            <span className="text-xs text-gray-500">proposals</span>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveJob({ id: job.id, title: job.title });
              }}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isJobSaved(job.id)
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isJobSaved(job.id) ? 'Remove from saved jobs' : 'Save job'}
            >
              <Bookmark
                className={`h-4 w-4 ${isJobSaved(job.id) ? 'fill-current' : ''}`}
              />
            </button>
            <Link href={`/freelancer/jobs/${job.id}`}>
              <Button variant="outline" size="sm" className="text-xs px-4 py-2 font-semibold hover:bg-gray-50">
                View
              </Button>
            </Link>
            <Link href={`/freelancer/proposals/create/${job.id}`}>
              <Button variant="primary" size="sm" className="text-xs px-4 py-2 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg">
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
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="w-40 h-7 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-28 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md w-[350px] flex-shrink-0 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-32 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex gap-2">
                  <div className="w-20 h-7 bg-gray-200 rounded-lg"></div>
                  <div className="w-20 h-7 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-7 bg-gray-200 rounded-lg"></div>
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
    <div className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recently Posted</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fresh opportunities just for you</p>
          </div>
        </div>
        <Link href="/freelancer/jobs?sort=recent">
          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 hover:bg-blue-50 transition-colors duration-200">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative group/container">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {jobs.map((job, index) => (
            <RecentJobCard key={job.id} job={job} index={index} />
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 border-2 border-gray-100 hover:border-blue-200 opacity-0 group-hover/container:opacity-100 z-20"
        >
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <button
          onClick={scrollRight}
          className="absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 border-2 border-gray-100 hover:border-blue-200 opacity-0 group-hover/container:opacity-100 z-20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default RecentJobsSection;