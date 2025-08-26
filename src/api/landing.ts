import apiClient from './axios-instance';

// Type definitions for API responses
export interface PlatformStats {
  totalProjects: number;
  totalFreelancers: number;
  totalClients: number;
  totalEarnings: number;
  projectsCompleted: number;
  averageRating: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  clientName?: string;
  freelancerName?: string;
  clientCompany?: string;
  rating: number;
  comment: string;
  projectType: string;
  featured: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Landing page API functions
export const landingApi = {
  // Get platform statistics
  async getStats(): Promise<PlatformStats> {
    try {
      const response = await apiClient.get<ApiResponse<PlatformStats>>('/v1/public/stats');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch stats');
    } catch (error) {
      console.warn('Failed to fetch platform stats, using fallback data:', error);
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
      const response = await apiClient.get<ApiResponse<Category[]>>('/v1/public/categories');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch categories');
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
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await apiClient.get<ApiResponse<Testimonial[]>>('/v1/public/testimonials');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch testimonials');
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
