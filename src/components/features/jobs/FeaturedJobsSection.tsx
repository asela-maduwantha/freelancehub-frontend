import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Award, DollarSign, Clock, MapPin, Users, Bookmark } from 'lucide-react';
import Button from '../../ui/Button/Button';
import { JobResponse } from '../../../lib/api/jobs';
import { useSavedJobs } from '../../../lib/hooks/useSavedJobs';

interface FeaturedJobsSectionProps {
  jobs: JobResponse[];
  isLoading?: boolean;
}

const FeaturedJobCard: React.FC<{ job: JobResponse; index: number }> = ({ job, index }) => {
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
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300"
    >
      {/* Featured Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          <Star className="h-3 w-3 fill-current" />
          Featured
        </div>
      </div>

      {/* Gold accent border */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {getTimeAgo(job.postedAt)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2 text-sm leading-relaxed">
          {job.description}
        </p>

        {/* Budget - Highlighted */}
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3 border border-green-100">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <span className="text-sm text-gray-600 font-medium">Budget</span>
              <p className="text-xl font-bold text-green-700">{formatBudget(job.budget)}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map((skill, skillIndex) => (
              <span
                key={skillIndex}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">
                {job.client.fullName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{job.client.fullName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                {job.proposalCount} proposals
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveJob({ id: job.id, title: job.title });
              }}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isJobSaved(job.id)
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isJobSaved(job.id) ? 'Remove from saved jobs' : 'Save job'}
            >
              <Bookmark
                className={`h-4 w-4 ${isJobSaved(job.id) ? 'fill-current' : ''}`}
              />
            </button>

            <Link href={`/freelancer/jobs/${job.id}`}>
              <Button
                variant="primary"
                size="sm"
                className="shadow-md hover:shadow-lg transition-all duration-200"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedJobsSection: React.FC<FeaturedJobsSectionProps> = ({ jobs, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, jobs.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="animate-pulse space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex gap-2">
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
          <Award className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
        </div>
        <Link href="/freelancer/jobs?filter=featured">
          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
            View All Featured
          </Button>
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden rounded-2xl">
          <motion.div
            className="flex gap-6"
            animate={{ x: -currentIndex * (100 / itemsPerView) + '%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {jobs.map((job, index) => (
              <div key={job.id} className="flex-none w-full md:w-1/2 lg:w-1/3">
                <FeaturedJobCard job={job} index={index} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        {jobs.length > itemsPerView && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {jobs.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedJobsSection;