'use client';

import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { JobCard } from '../../components/features/jobs/';
import SearchBar from '../../components/common/SearchBar';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  skills: string[];
  description: string;
  postedDate: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    remote: false,
  });

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Remote',
        salary: '$80k - $100k',
        type: 'full-time',
        skills: ['React', 'TypeScript', 'Node.js'],
        description: 'We are looking for a Senior React Developer to join our team and help build amazing user experiences.',
        postedDate: '2 days ago',
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: '$70k - $90k',
        type: 'full-time',
        skills: ['React', 'Python', 'PostgreSQL'],
        description: 'Join our fast-growing startup as a Full Stack Developer and work on cutting-edge technologies.',
        postedDate: '1 day ago',
      },
      {
        id: '3',
        title: 'UI/UX Designer',
        company: 'DesignStudio',
        location: 'San Francisco, CA',
        salary: '$60k - $80k',
        type: 'contract',
        skills: ['Figma', 'Sketch', 'Adobe XD'],
        description: 'Creative UI/UX Designer needed for exciting design projects with innovative companies.',
        postedDate: '3 days ago',
      },
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Search:', query);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesRemote = !filters.remote || job.location === 'Remote';

    return matchesSearch && matchesLocation && matchesRemote;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h1>
          <p className="text-gray-600 mt-2">Discover amazing freelance opportunities that match your skills</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search jobs, skills, or companies..."
                onSearch={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filters</Button>
              <Button variant="outline">Sort by</Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Loading jobs...' : `Found ${filteredJobs.length} jobs`}
          </p>
          <Button variant="primary">Post a Job</Button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button variant="outline">Clear Filters</Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}