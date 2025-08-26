import { useState, useEffect } from 'react';
import { freelancerApi, FreelancerProfile, FreelancerFilters } from '../lib/api/freelancerApi';

// Hook for fetching freelancers with pagination and filtering
export const useFreelancers = (initialFilters: FreelancerFilters = {}) => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FreelancerFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  const fetchFreelancers = async (newFilters?: FreelancerFilters) => {
    try {
      setLoading(true);
      setError(null);
      const currentFilters = newFilters || filters;
      const response = await freelancerApi.getAllFreelancers(currentFilters);
      
      setFreelancers(response.freelancers);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: Math.ceil(response.total / (response.limit || 10))
      });
    } catch (err) {
      setError('Failed to fetch freelancers');
      console.error('Error fetching freelancers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const updateFilters = async (newFilters: FreelancerFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    await fetchFreelancers(updatedFilters);
  };

  const loadMore = async () => {
    if (pagination.page < pagination.totalPages) {
      const newFilters = { ...filters, page: pagination.page + 1 };
      try {
        setLoading(true);
        const response = await freelancerApi.getAllFreelancers(newFilters);
        setFreelancers(prev => [...prev, ...response.freelancers]);
        setPagination({
          total: response.total,
          page: response.page,
          totalPages: Math.ceil(response.total / (response.limit || 10))
        });
        setFilters(newFilters);
      } catch (err) {
        setError('Failed to load more freelancers');
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    freelancers,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    loadMore,
    refetch: fetchFreelancers
  };
};

// Hook for fetching a single freelancer by ID
export const useFreelancer = (id: string) => {
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await freelancerApi.getProfile(id);
        setFreelancer(data);
      } catch (err) {
        setError('Failed to fetch freelancer');
        console.error('Error fetching freelancer:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFreelancer();
    }
  }, [id]);

  return { freelancer, loading, error };
};

// Hook for searching freelancers
export const useFreelancerSearch = () => {
  const [results, setResults] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await freelancerApi.searchFreelancers(query);
      setResults(response);
    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearResults
  };
};

// Hook for featured freelancers with mock data for development
export const useFeaturedFreelancers = (limit: number = 8) => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedFreelancers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get real data first
        const response = await freelancerApi.getAllFreelancers({ limit });
        if (response.freelancers.length > 0) {
          setFreelancers(response.freelancers);
        } else {
          // Fallback to mock data for development
          const mockFreelancers: FreelancerProfile[] = [
            {
              id: '1',
              userId: '1',
              firstName: 'John',
              lastName: 'Doe',
              title: 'Full Stack Developer',
              bio: 'Experienced developer with 5+ years in React and Node.js',
              location: 'New York, NY',
              address: 'New York, NY, USA',
              hourlyRate: 75,
              experience: '5+ years',
              rating: 4.8,
              completedProjects: 23,
              isAvailable: true,
              skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
              education: [],
              certifications: [],
              portfolioLinks: [],
              isProfileComplete: true,
              profileCompleteness: 90,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              userId: '2',
              firstName: 'Jane',
              lastName: 'Smith',
              title: 'UI/UX Designer',
              bio: 'Creative designer specializing in user experience and interface design',
              location: 'San Francisco, CA',
              address: 'San Francisco, CA, USA',
              hourlyRate: 65,
              experience: '3+ years',
              rating: 4.9,
              completedProjects: 18,
              isAvailable: true,
              skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
              education: [],
              certifications: [],
              portfolioLinks: [],
              isProfileComplete: true,
              profileCompleteness: 85,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '3',
              userId: '3',
              firstName: 'Mike',
              lastName: 'Johnson',
              title: 'Mobile App Developer',
              bio: 'iOS and Android developer with expertise in React Native',
              location: 'Austin, TX',
              address: 'Austin, TX, USA',
              hourlyRate: 80,
              experience: '4+ years',
              rating: 4.7,
              completedProjects: 31,
              isAvailable: false,
              skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
              education: [],
              certifications: [],
              portfolioLinks: [],
              isProfileComplete: true,
              profileCompleteness: 92,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '4',
              userId: '4',
              firstName: 'Sarah',
              lastName: 'Wilson',
              title: 'Data Scientist',
              bio: 'Machine learning expert with experience in Python and R',
              location: 'Boston, MA',
              address: 'Boston, MA, USA',
              hourlyRate: 90,
              experience: '6+ years',
              rating: 4.9,
              completedProjects: 42,
              isAvailable: true,
              skills: ['Python', 'R', 'TensorFlow', 'Pandas'],
              education: [],
              certifications: [],
              portfolioLinks: [],
              isProfileComplete: true,
              profileCompleteness: 95,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          
          setFreelancers(mockFreelancers.slice(0, limit));
        }
      } catch (err) {
        setError('Failed to fetch featured freelancers');
        console.error('Error fetching featured freelancers:', err);
        
        // Set mock data on error too
        const mockFreelancers: FreelancerProfile[] = [
          {
            id: '1',
            userId: '1',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Full Stack Developer',
            bio: 'Experienced developer with 5+ years in React and Node.js',
            location: 'New York, NY',
            address: 'New York, NY, USA',
            hourlyRate: 75,
            experience: '5+ years',
            rating: 4.8,
            completedProjects: 23,
            isAvailable: true,
            skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
            education: [],
            certifications: [],
            portfolioLinks: [],
            isProfileComplete: true,
            profileCompleteness: 90,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        setFreelancers(mockFreelancers.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFreelancers();
  }, [limit]);

  return { freelancers, loading, error };
};
