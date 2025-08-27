import { useState, useEffect } from 'react';
import { freelancerApi, userApi } from '../api/services/users';
import { FreelancerProfile, FreelancerFilters } from '../types';

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
      const response = await freelancerApi.searchFreelancers(currentFilters);
      
      if (response.success && response.data) {
        setFreelancers(response.data.freelancers || []);
        setPagination({
          total: response.pagination?.total || 0,
          page: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 0
        });
      }
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
        const response = await freelancerApi.searchFreelancers(newFilters);
        if (response.success && response.data) {
          setFreelancers(prev => [...prev, ...(response.data.freelancers || [])]);
          setPagination({
            total: response.pagination?.total || 0,
            page: response.pagination?.page || 1,
            totalPages: response.pagination?.totalPages || 0
          });
          setFilters(newFilters);
        }
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
        const response = await userApi.getUserProfile(id);
        if (response.success && response.data) {
          setFreelancer(response.data as FreelancerProfile);
        }
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
      const response = await freelancerApi.searchFreelancers({ skills: [query] });
      if (response.success && response.data) {
        setResults(response.data.freelancers || []);
      }
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
        const response = await freelancerApi.searchFreelancers({ limit });
        if (response.success && response.data && response.data.freelancers.length > 0) {
          setFreelancers(response.data.freelancers);
        } else {
          // Fallback to mock data for development
          const mockFreelancers: FreelancerProfile[] = [
            {
              id: '1',
              email: 'john.doe@example.com',
              username: 'johndoe',
              firstName: 'John',
              lastName: 'Doe',
              primaryRole: 'freelancer',
              title: 'Full Stack Developer',
              bio: 'Experienced developer with 5+ years in React and Node.js',
              location: { country: 'USA', city: 'New York' },
              hourlyRate: { amount: 75, currency: 'USD' },
              availability: 'available',
              rating: 4.8,
              reviewsCount: 23,
              completedProjects: 23,
              verified: true,
              status: 'active',
              memberSince: '2020-01-01',
              skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
              experience: [],
              education: [],
              certifications: [],
              portfolio: [],
              languages: [],
              createdAt: '2020-01-01T00:00:00.000Z',
              updatedAt: '2024-08-27T00:00:00.000Z'
            },
            {
              id: '2',
              email: 'jane.smith@example.com',
              username: 'janesmith',
              firstName: 'Jane',
              lastName: 'Smith',
              primaryRole: 'freelancer',
              title: 'UI/UX Designer',
              bio: 'Creative designer specializing in user experience and interface design',
              location: { country: 'USA', city: 'San Francisco' },
              hourlyRate: { amount: 65, currency: 'USD' },
              availability: 'available',
              rating: 4.9,
              reviewsCount: 18,
              completedProjects: 18,
              verified: true,
              status: 'active',
              memberSince: '2020-06-01',
              skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
              experience: [],
              education: [],
              certifications: [],
              portfolio: [],
              languages: [],
              createdAt: '2020-06-01T00:00:00.000Z',
              updatedAt: '2024-08-27T00:00:00.000Z'
            },
            {
              id: '3',
              email: 'mike.johnson@example.com',
              username: 'mikejohnson',
              firstName: 'Mike',
              lastName: 'Johnson',
              primaryRole: 'freelancer',
              title: 'Mobile App Developer',
              bio: 'iOS and Android developer with expertise in React Native',
              location: { country: 'USA', city: 'Austin' },
              hourlyRate: { amount: 80, currency: 'USD' },
              availability: 'busy',
              rating: 4.7,
              reviewsCount: 31,
              completedProjects: 31,
              verified: true,
              status: 'active',
              memberSince: '2019-03-15',
              skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
              experience: [],
              education: [],
              certifications: [],
              portfolio: [],
              languages: [],
              createdAt: '2019-03-15T00:00:00.000Z',
              updatedAt: '2024-08-27T00:00:00.000Z'
            },
            {
              id: '4',
              email: 'sarah.wilson@example.com',
              username: 'sarahwilson',
              firstName: 'Sarah',
              lastName: 'Wilson',
              primaryRole: 'freelancer',
              title: 'Data Scientist',
              bio: 'Machine learning expert with experience in Python and R',
              location: { country: 'USA', city: 'Boston' },
              hourlyRate: { amount: 90, currency: 'USD' },
              availability: 'available',
              rating: 4.9,
              reviewsCount: 42,
              completedProjects: 42,
              verified: true,
              status: 'active',
              memberSince: '2018-11-20',
              skills: ['Python', 'R', 'TensorFlow', 'Pandas'],
              experience: [],
              education: [],
              certifications: [],
              portfolio: [],
              languages: [],
              createdAt: '2018-11-20T00:00:00.000Z',
              updatedAt: '2024-08-27T00:00:00.000Z'
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
            email: 'john.doe@example.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
            primaryRole: 'freelancer',
            title: 'Full Stack Developer',
            bio: 'Experienced developer with 5+ years in React and Node.js',
            location: { country: 'USA', city: 'New York' },
            hourlyRate: { amount: 75, currency: 'USD' },
            availability: 'available',
            rating: 4.8,
            reviewsCount: 23,
            completedProjects: 23,
            verified: true,
            status: 'active',
            memberSince: '2020-01-01',
            skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
            experience: [],
            education: [],
            certifications: [],
            portfolio: [],
            languages: [],
            createdAt: '2020-01-01T00:00:00.000Z',
            updatedAt: '2024-08-27T00:00:00.000Z'
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
