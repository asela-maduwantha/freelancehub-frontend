"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Star, MapPin, Clock } from "lucide-react";

// Dummy categories data
const dummyCategories = [
  { id: "1", name: "Web Development" },
  { id: "2", name: "UI/UX Design" },
  { id: "3", name: "Content Writing" },
  { id: "4", name: "Digital Marketing" },
  { id: "5", name: "Mobile Apps" },
  { id: "6", name: "Logo Design" },
  { id: "7", name: "SEO" },
  { id: "8", name: "Social Media" },
  { id: "9", name: "Data Analysis" },
  { id: "10", name: "Graphic Design" },
];

interface Freelancer {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  };
  professionalTitle: string;
  description: string;
  skills: string[];
  categories: string[];
  experienceLevel: string;
  hourlyRate: number;
  availability: {
    status: string;
    hoursPerWeek: number;
    workingHours: {
      timezone: string;
      schedule: Record<string, string>;
    };
  };
  portfolio: Array<{
    title: string;
    description: string;
    imageUrl: string;
    projectUrl?: string;
    tags: string[];
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    year: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  location?: {
    country: string;
    city: string;
    province: string;
  };
  profileCompleteness: number;
  publicProfileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use dummy categories
  const categories = dummyCategories;

  const skillTags = [
    "Web Development", "UI/UX Design", "Content Writing", "Digital Marketing",
    "Mobile Apps", "Logo Design", "SEO", "Social Media", "Data Analysis",
    "Graphic Design", "WordPress", "React", "Python", "Photography"
  ];

  // Fetch freelancers on component mount
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        //const response = await freelancerAPI.getFreelancers({ limit: 8 });
        setFreelancers( [] );
      } catch (err) {
        console.error('Error fetching freelancers:', err);
        setError('Failed to load freelancers');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  // Handle search
  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters: any = { limit: 8 };
      if (searchQuery) {
        filters.skills = searchQuery;
      }
      //const response = await freelancerAPI.getFreelancers(filters);
      setFreelancers( [] );
    } catch (err) {
      console.error('Error searching freelancers:', err);
      setError('Failed to search freelancers');
    } finally {
      setLoading(false);
    }
  };

  // Get profile image URL
  const getProfileImage = (freelancer: Freelancer) => {
    if (!freelancer || !freelancer.userId?.name) {
      return `https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=150`;
    }

    if (freelancer.portfolio?.[0]?.imageUrl) {
      return freelancer.portfolio[0].imageUrl;
    }
    return `https://ui-avatars.com/api/?name=${freelancer.userId.name}&background=10b981&color=fff&size=150`;
  };

  return (
    <section className="py-16 bg-gradient-to-r from-green-50 to-green-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find the Perfect Freelancer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search through thousands of skilled professionals ready to bring your projects to life
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="w-full max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 outline-none"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 text-lg rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 outline-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                onClick={handleSearch}
              >
                <SearchIcon className="w-6 h-6" />
                Search Freelancers
              </motion.button>
            </div>
            
            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="text-sm font-medium text-gray-500">Popular searches:</span>
              {skillTags.slice(0, 8).map((tag, index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-sm bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 px-4 py-2 rounded-full transition-all duration-300 font-medium"
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearch();
                  }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Freelancers Section */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Featured Freelancers
          </h3>
          
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading freelancers...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {!loading && !error && freelancers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {freelancers.filter(freelancer => freelancer && freelancer._id).map((freelancer, index) => (
                <motion.div
                  key={freelancer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
                >
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={'/user.jpg'}
                          alt={`${freelancer.userId?.name || 'User'}`}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-400 rounded-full p-1">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-lg text-white leading-tight">
                          {freelancer.userId?.name || 'Unknown User'}
                        </h4>
                        <p className="text-green-100 text-sm font-medium">
                          {freelancer.professionalTitle || 'Freelancer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {freelancer.description || 'No description available'}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {freelancer.skills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                        <span
                          key={skillIndex}
                          className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills && freelancer.skills.length > 3 && (
                        <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          +{freelancer.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-900">4.8</span>
                        </div>
                        <p className="text-xs text-gray-600">Rating</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-900 text-sm capitalize">
                            {freelancer.experienceLevel || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Experience</p>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            ${freelancer.hourlyRate || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-600">/hr</span>
                        </div>
                        <p className="text-xs text-gray-500">Starting rate</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <span>View Profile</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && !error && freelancers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No freelancers found.</p>
            </div>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Verified Freelancers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Money Back Guarantee</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
