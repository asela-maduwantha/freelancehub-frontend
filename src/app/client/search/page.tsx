"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/context/toast-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  User,
  Briefcase,
  Award,
  Heart,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Verified,
  Globe,
  Calendar
} from "lucide-react";
import Link from "next/link";
import api from "@/api/axios-instance";

interface Freelancer {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  title: string;
  description: string;
  hourlyRate: number;
  location: string;
  skills: string[];
  rating: number;
  totalReviews: number;
  completedProjects: number;
  totalEarnings: number;
  responseTime: number;
  languages: string[];
  availability: string;
  experienceLevel: string;
  portfolioItems: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
  }[];
  verificationStatus: string;
  lastActive: string;
  joinedAt: string;
}

interface SearchFilters {
  query: string;
  skills: string[];
  minHourlyRate: number;
  maxHourlyRate: number;
  minRating: number;
  experienceLevel: string[];
  availability: string[];
  location: string;
  languages: string[];
  verifiedOnly: boolean;
  sortBy: string;
}

export default function SearchPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    skills: [],
    minHourlyRate: 0,
    maxHourlyRate: 200,
    minRating: 0,
    experienceLevel: [],
    availability: [],
    location: "",
    languages: [],
    verifiedOnly: false,
    sortBy: "relevance",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    searchFreelancers();
  }, [filters, currentPage]);

  useEffect(() => {
    loadSavedFreelancers();
  }, []);

  const searchFreelancers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/freelancers/search", {
        params: {
          q: filters.query || undefined,
          skills: filters.skills.length > 0 ? filters.skills.join(",") : undefined,
          min_hourly_rate: filters.minHourlyRate || undefined,
          max_hourly_rate: filters.maxHourlyRate || undefined,
          min_rating: filters.minRating || undefined,
          experience_level: filters.experienceLevel.length > 0 ? filters.experienceLevel.join(",") : undefined,
          availability: filters.availability.length > 0 ? filters.availability.join(",") : undefined,
          location: filters.location || undefined,
          languages: filters.languages.length > 0 ? filters.languages.join(",") : undefined,
          verified_only: filters.verifiedOnly || undefined,
          sort_by: filters.sortBy || undefined,
          page: currentPage,
          limit: 12,
        },
      });
      
      const data = response.data as any;
      setFreelancers(data?.freelancers || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Failed to search freelancers:", error);
      toast.error("Failed to search freelancers");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedFreelancers = async () => {
    try {
      const response = await api.get("/clients/saved-freelancers");
      setSavedFreelancers((response.data as any)?.savedFreelancers || []);
    } catch (error) {
      console.error("Failed to load saved freelancers:", error);
    }
  };

  const saveFreelancer = async (freelancerId: string) => {
    try {
      await api.post(`/clients/saved-freelancers/${freelancerId}`);
      setSavedFreelancers(prev => [...prev, freelancerId]);
      toast.success("Freelancer saved");
    } catch (error) {
      console.error("Failed to save freelancer:", error);
      toast.error("Failed to save freelancer");
    }
  };

  const removeSavedFreelancer = async (freelancerId: string) => {
    try {
      await api.delete(`/clients/saved-freelancers/${freelancerId}`);
      setSavedFreelancers(prev => prev.filter(id => id !== freelancerId));
      toast.success("Freelancer removed from saved");
    } catch (error) {
      console.error("Failed to remove saved freelancer:", error);
      toast.error("Failed to remove saved freelancer");
    }
  };

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      skills: [],
      minHourlyRate: 0,
      maxHourlyRate: 200,
      minRating: 0,
      experienceLevel: [],
      availability: [],
      location: "",
      languages: [],
      verifiedOnly: false,
      sortBy: "relevance",
    });
    setCurrentPage(1);
  };

  const FreelancerCard = ({ freelancer }: { freelancer: Freelancer }) => {
    const isSaved = savedFreelancers.includes(freelancer.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {freelancer.firstName.charAt(0)}{freelancer.lastName.charAt(0)}
                </div>
                {freelancer.verificationStatus === "VERIFIED" && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Verified className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {freelancer.firstName} {freelancer.lastName}
                    </h3>
                    <p className="text-blue-600 font-medium">{freelancer.title}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isSaved ? removeSavedFreelancer(freelancer.id) : saveFreelancer(freelancer.id);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isSaved ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{freelancer.rating.toFixed(1)}</span>
                    <span>({freelancer.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${freelancer.hourlyRate}/hr</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {freelancer.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {freelancer.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} className="bg-blue-100 text-blue-800 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <Badge className="bg-gray-100 text-gray-600 text-xs">
                      +{freelancer.skills.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{freelancer.completedProjects} projects</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Responds in {freelancer.responseTime}h</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFreelancer(freelancer);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Link href={`/client/messages?freelancer=${freelancer.id}`}>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const FreelancerProfile = ({ freelancer }: { freelancer: Freelancer }) => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Freelancer Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFreelancer(null)}
          >
            ×
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {freelancer.firstName.charAt(0)}{freelancer.lastName.charAt(0)}
              </div>
              {freelancer.verificationStatus === "VERIFIED" && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Verified className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {freelancer.firstName} {freelancer.lastName}
              </h3>
              <p className="text-lg text-blue-600 font-medium mb-2">{freelancer.title}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{freelancer.rating.toFixed(1)}</span>
                  <span>({freelancer.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{freelancer.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate and Availability */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${freelancer.hourlyRate}/hr
                </div>
                <div className="text-sm text-gray-500">Hourly Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {freelancer.responseTime}h
                </div>
                <div className="text-sm text-gray-500">Response Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-gray-600">{freelancer.description}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-semibold mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <Badge key={skill} className="bg-blue-100 text-blue-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-semibold mb-3">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {freelancer.languages.map((language) => (
                <Badge key={language} className="bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold">{freelancer.completedProjects}</div>
              <div className="text-sm text-gray-500">Projects Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold">${freelancer.totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Earned</div>
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <h4 className="font-semibold mb-3">Portfolio</h4>
            <div className="grid grid-cols-2 gap-4">
              {freelancer.portfolioItems.slice(0, 4).map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    {item.imageUrl && (
                      <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                    )}
                    <h5 className="font-medium text-sm mb-1">{item.title}</h5>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Link href={`/client/messages?freelancer=${freelancer.id}`} className="flex-1">
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </Link>
            <Link href={`/client/projects/create?freelancer=${freelancer.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Briefcase className="h-4 w-4 mr-2" />
                Hire Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Freelancers</h1>
          <p className="text-gray-600">Discover talented professionals for your projects</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by skills, title, or keywords..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="hourly_rate_asc">Lowest Rate</option>
              <option value="hourly_rate_desc">Highest Rate</option>
              <option value="recent">Recently Active</option>
            </select>
            <Button onClick={searchFreelancers}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : freelancers.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          freelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Freelancer Profile Sidebar */}
      {selectedFreelancer && <FreelancerProfile freelancer={selectedFreelancer} />}
    </div>
  );
}
