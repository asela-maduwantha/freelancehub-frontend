// Public API services (no authentication required)
import apiClient from '../axios-instance';
import { 
  ApiResponse, 
  PaginatedResponse,
  PlatformStats,
  FeaturedTestimonial,
  FeaturedFreelancer,
  PublicProjectBrief,
  PopularCategory,
  SkillTrend,
  SuccessStory,
  PlatformNews,
  FAQItem,
  HelpArticle,
  ProjectSearchFilters,
  FreelancerSearchFilters,
  Country,
  Skill
} from '../../types';

export const publicApi = {
  // Get platform statistics
  getPlatformStats: async (): Promise<ApiResponse<PlatformStats>> => {
    const response = await apiClient.get('/api/v1/public/stats');
    return response.data as ApiResponse<PlatformStats>;
  },

  // Get popular categories
  getPopularCategories: async (): Promise<ApiResponse<PopularCategory[]>> => {
    const response = await apiClient.get('/api/v1/public/categories');
    return response.data as ApiResponse<PopularCategory[]>;
  },

  // Get featured testimonials
  getFeaturedTestimonials: async (): Promise<ApiResponse<FeaturedTestimonial[]>> => {
    const response = await apiClient.get('/api/v1/public/testimonials');
    return response.data as ApiResponse<FeaturedTestimonial[]>;
  },

  // Browse public projects
  browseProjects: async (filters: ProjectSearchFilters): Promise<PaginatedResponse<{ projects: PublicProjectBrief[] }>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/api/v1/projects/public?${params.toString()}`);
    return response.data as PaginatedResponse<{ projects: PublicProjectBrief[] }>;
  },

  // Browse featured freelancers
  browseFeaturedFreelancers: async (filters: FreelancerSearchFilters): Promise<PaginatedResponse<{ freelancers: FeaturedFreelancer[] }>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get(`/api/v1/public/featured-freelancers?${params.toString()}`);
    return response.data as PaginatedResponse<{ freelancers: FeaturedFreelancer[] }>;
  },

  // Get skills list
  getSkills: async (): Promise<ApiResponse<Skill[]>> => {
    const response = await apiClient.get('/api/v1/public/skills');
    return response.data as ApiResponse<Skill[]>;
  },

  // Get trending skills
  getTrendingSkills: async (): Promise<ApiResponse<SkillTrend[]>> => {
    const response = await apiClient.get('/api/v1/public/skills/trending');
    return response.data as ApiResponse<SkillTrend[]>;
  },

  // Get success stories
  getSuccessStories: async (featured?: boolean): Promise<ApiResponse<SuccessStory[]>> => {
    const params = featured ? '?featured=true' : '';
    const response = await apiClient.get(`/api/v1/public/success-stories${params}`);
    return response.data as ApiResponse<SuccessStory[]>;
  },

  // Get platform news
  getPlatformNews: async (category?: string, featured?: boolean): Promise<ApiResponse<PlatformNews[]>> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured) params.append('featured', 'true');
    
    const queryString = params.toString();
    const response = await apiClient.get(`/api/v1/public/news${queryString ? `?${queryString}` : ''}`);
    return response.data as ApiResponse<PlatformNews[]>;
  },

  // Get FAQ items
  getFAQs: async (category?: string): Promise<ApiResponse<FAQItem[]>> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`/api/v1/public/faqs${params}`);
    return response.data as ApiResponse<FAQItem[]>;
  },

  // Get help articles
  getHelpArticles: async (category?: string): Promise<ApiResponse<HelpArticle[]>> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`/api/v1/public/help${params}`);
    return response.data as ApiResponse<HelpArticle[]>;
  },

  // Get help article by ID
  getHelpArticle: async (articleId: string): Promise<ApiResponse<HelpArticle>> => {
    const response = await apiClient.get(`/api/v1/public/help/${articleId}`);
    return response.data as ApiResponse<HelpArticle>;
  },

  // Search help articles
  searchHelpArticles: async (query: string): Promise<ApiResponse<HelpArticle[]>> => {
    const response = await apiClient.get(`/api/v1/public/help/search?q=${encodeURIComponent(query)}`);
    return response.data as ApiResponse<HelpArticle[]>;
  },

  // Get countries and locations
  getCountries: async (): Promise<ApiResponse<Country[]>> => {
    const response = await apiClient.get('/api/v1/public/locations/countries');
    return response.data as ApiResponse<Country[]>;
  },

  // Get cities by country
  getCitiesByCountry: async (countryCode: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/api/v1/public/locations/countries/${countryCode}/cities`);
    return response.data as ApiResponse<any[]>;
  },

  // Get market insights
  getMarketInsights: async (category?: string): Promise<ApiResponse<any>> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`/api/v1/public/market-insights${params}`);
    return response.data as ApiResponse<any>;
  },

  // Get project recommendations (for guests)
  getProjectRecommendations: async (skills?: string[]): Promise<ApiResponse<PublicProjectBrief[]>> => {
    const params = skills && skills.length > 0 ? `?skills=${skills.join(',')}` : '';
    const response = await apiClient.get(`/api/v1/public/recommendations/projects${params}`);
    return response.data as ApiResponse<PublicProjectBrief[]>;
  },

  // Get freelancer recommendations (for guests)
  getFreelancerRecommendations: async (category?: string): Promise<ApiResponse<FeaturedFreelancer[]>> => {
    const params = category ? `?category=${category}` : '';
    const response = await apiClient.get(`/api/v1/public/recommendations/freelancers${params}`);
    return response.data as ApiResponse<FeaturedFreelancer[]>;
  },

  // Submit contact form
  submitContactForm: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    type?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/public/contact', data);
    return response.data as ApiResponse<any>;
  },

  // Newsletter subscription
  subscribeNewsletter: async (email: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/public/newsletter/subscribe', { email });
    return response.data as ApiResponse<any>;
  },

  // Get freelancer public profile
  getFreelancerProfile: async (username: string): Promise<ApiResponse<FeaturedFreelancer>> => {
    const response = await apiClient.get(`/api/v1/public/freelancers/${username}`);
    return response.data as ApiResponse<FeaturedFreelancer>;
  },

  // Get project public details
  getProjectDetails: async (projectId: string): Promise<ApiResponse<PublicProjectBrief>> => {
    const response = await apiClient.get(`/api/v1/public/projects/${projectId}`);
    return response.data as ApiResponse<PublicProjectBrief>;
  },

  // Search suggestions
  getSearchSuggestions: async (query: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/api/v1/public/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data as ApiResponse<any[]>;
  },

  // Get platform terms
  getTermsOfService: async (): Promise<ApiResponse<{ content: string; version: string }>> => {
    const response = await apiClient.get('/api/v1/public/legal/terms');
    return response.data as ApiResponse<{ content: string; version: string }>;
  },

  // Get privacy policy
  getPrivacyPolicy: async (): Promise<ApiResponse<{ content: string; version: string }>> => {
    const response = await apiClient.get('/api/v1/public/legal/privacy');
    return response.data as ApiResponse<{ content: string; version: string }>;
  },

  // Get community guidelines
  getCommunityGuidelines: async (): Promise<ApiResponse<{ content: string; version: string }>> => {
    const response = await apiClient.get('/api/v1/public/legal/community-guidelines');
    return response.data as ApiResponse<{ content: string; version: string }>;
  }
};

export default publicApi;
