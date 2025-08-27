import apiClient from './axios-instance';
import { publicApi } from './services/public';
import { PlatformStats, PopularCategory, ApiResponse } from '../types';
import { 
  validatePlatformStats, 
  validateCategory, 
  validateTestimonial,
  isBackendPlatformStats,
  isBackendCategory,
  isBackendTestimonial,
  handleApiError,
  transformBackendResponse
} from '../lib/integration-validator';

// Local types for landing page
export interface Category extends PopularCategory {
  featured: boolean;
}

export interface LandingTestimonial {
  id: string;
  clientName?: string;
  freelancerName?: string;
  clientCompany?: string;
  rating: number;
  comment: string;
  projectType: string;
  featured: boolean;
}

// Landing page API functions
export const landingApi = {
  // Get platform statistics
  async getStats(): Promise<PlatformStats> {
    try {
      const response = await publicApi.getPlatformStats();
      const validatedData = transformBackendResponse(
        response,
        validatePlatformStats,
        isBackendPlatformStats
      );
      
      if (validatedData) {
        return validatedData;
      }
      
      throw new Error('Failed to validate platform stats data');
    } catch (error) {
      console.warn('Failed to fetch platform stats, using fallback data:', handleApiError(error));
      // Fallback dummy data if backend is not available
      return {
        totalProjects: 12450,
        totalFreelancers: 8320,
        totalClients: 4130,
        totalEarnings: 2450000,
        projectsCompleted: 9876,
        averageRating: 4.8
      };
    }
  },

  // Get popular categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await publicApi.getPopularCategories();
      if (response.success && response.data && Array.isArray(response.data)) {
        // Validate and transform each category
        const validatedCategories = response.data
          .map((category: any) => {
            if (isBackendCategory(category)) {
              return validateCategory(category);
            }
            return null;
          })
          .filter(Boolean) as Category[];
        
        if (validatedCategories.length > 0) {
          return validatedCategories;
        }
      }
      throw new Error('Failed to fetch categories');
    } catch (error) {
      console.warn('Failed to fetch categories, using fallback data:', error);
      // Fallback dummy data if backend is not available
      return [
        {
          id: "web-development",
          name: "Web Development",
          description: "Frontend and backend web development",
          icon: "code",
          projectCount: 3450,
          featured: true
        },
        {
          id: "mobile-development",
          name: "Mobile Development", 
          description: "iOS and Android app development",
          icon: "mobile",
          projectCount: 1280,
          featured: true
        },
        {
          id: "ui-ux-design",
          name: "UI/UX Design",
          description: "User interface and experience design",
          icon: "palette",
          projectCount: 2150,
          featured: true
        },
        {
          id: "content-writing",
          name: "Content Writing",
          description: "Blog posts, articles, and copywriting",
          icon: "pen-tool",
          projectCount: 1890,
          featured: true
        },
        {
          id: "digital-marketing",
          name: "Digital Marketing",
          description: "SEO, social media, and online advertising",
          icon: "megaphone",
          projectCount: 1560,
          featured: true
        },
        {
          id: "data-science",
          name: "Data Science",
          description: "Data analysis, machine learning, and AI",
          icon: "bar-chart",
          projectCount: 890,
          featured: true
        }
      ];
    }
  },

  // Get featured testimonials
  async getTestimonials(): Promise<LandingTestimonial[]> {
    try {
      const response = await publicApi.getFeaturedTestimonials();
      if (response.success && response.data && Array.isArray(response.data)) {
        // Validate and transform each testimonial
        const validatedTestimonials = response.data
          .map((testimonial: any) => {
            if (isBackendTestimonial(testimonial)) {
              return validateTestimonial(testimonial);
            }
            return null;
          })
          .filter(Boolean) as LandingTestimonial[];
        
        if (validatedTestimonials.length > 0) {
          return validatedTestimonials;
        }
      }
      throw new Error('Failed to fetch testimonials');
    } catch (error) {
      console.warn('Failed to fetch testimonials, using fallback data:', error);
      // Fallback dummy data if backend is not available
      return [
        {
          id: "test-1",
          clientName: "Sarah Johnson",
          clientCompany: "TechCorp Inc.",
          rating: 5,
          comment: "Exceptional work quality and communication. Delivered ahead of schedule!",
          projectType: "Web Development",
          featured: true
        },
        {
          id: "test-2",
          freelancerName: "Mike Chen",
          rating: 5,
          comment: "Great platform to find quality projects. Professional client interactions.",
          projectType: "Mobile Development",
          featured: true
        },
        {
          id: "test-3",
          clientName: "Rajesh Patel",
          clientCompany: "StartupHub",
          rating: 5,
          comment: "Found the perfect designer for our brand identity. Amazing results!",
          projectType: "UI/UX Design",
          featured: true
        },
        {
          id: "test-4",
          freelancerName: "Emily Rodriguez",
          rating: 5,
          comment: "Consistent high-quality projects and timely payments. Highly recommend!",
          projectType: "Content Writing",
          featured: true
        },
        {
          id: "test-5",
          clientName: "David Kim",
          clientCompany: "DigitalCorp",
          rating: 5,
          comment: "Outstanding marketing expertise that boosted our online presence significantly.",
          projectType: "Digital Marketing",
          featured: true
        }
      ];
    }
  }
};
