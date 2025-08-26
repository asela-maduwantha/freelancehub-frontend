"use client";
import React from "react";
import Link from "next/link";
import { Star, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useFeaturedFreelancers } from "@/hooks/useFreelancers";

export const FeaturedFreelancers: React.FC = () => {
  const { freelancers, loading, error } = useFeaturedFreelancers(8);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || freelancers.length === 0) {
    return null; // Don't show the section if there's an error or no featured freelancers
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Freelancers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover top-rated professionals who deliver exceptional results. 
            These verified freelancers have proven track records of success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {freelancers.map((freelancer) => (
            <Link
              key={freelancer.id}
              href={`/freelancers/${freelancer.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 h-full">
                <div className="text-center">
                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <img
                      src={freelancer.profilePicture || "/api/placeholder/64/64"}
                      alt={`${freelancer.firstName} ${freelancer.lastName}`}
                      className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/64/64";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1">
                      <CheckCircle className="text-blue-500 bg-white rounded-full" size={16} />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                    {freelancer.firstName} {freelancer.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                    {freelancer.bio || "Professional Freelancer"}
                  </p>

                  {/* Location and Rating */}
                  <div className="flex items-center justify-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      <span className="truncate">
                        {freelancer.address?.split(',')[0] || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{(freelancer.rating || 4.5).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {(freelancer.skills || []).slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(freelancer.skills || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(freelancer.skills || []).length - 3}
                      </span>
                    )}
                  </div>

                  {/* Rate and Projects */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-sm text-gray-600 mb-1">
                      {freelancer.completedProjects || 0} projects completed
                    </div>
                    <div className="font-semibold text-lg">
                      Rs. {freelancer.hourlyRate?.toLocaleString() || "N/A"}
                      <span className="text-sm font-normal text-gray-600">/hour</span>
                    </div>
                  </div>

                  {/* Availability Indicator */}
                  <div className={`mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    freelancer.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      freelancer.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {freelancer.isAvailable ? 'Available' : 'Busy'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/freelancers">
            <Button icon={<ArrowRight size={16} />} className="inline-flex items-center">
              View All Freelancers
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {freelancers.length}+
              </div>
              <div className="text-gray-600">Featured Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {freelancers.reduce((acc, f) => acc + (f.completedProjects || 0), 0)}+
              </div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {(freelancers.reduce((acc, f) => acc + (f.rating || 4.5), 0) / freelancers.length).toFixed(1)}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {freelancers.filter(f => f.isAvailable).length}
              </div>
              <div className="text-gray-600">Available Now</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
