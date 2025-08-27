"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Star, MapPin } from "lucide-react";
import { useFreelancerSearch } from "@/hooks/useFreelancers";
import { FreelancerProfile } from "@/types";
import Link from "next/link";

interface FreelancerSearchProps {
  placeholder?: string;
  onSelect?: (freelancer: FreelancerProfile) => void;
  showFullResults?: boolean;
  className?: string;
}

export const FreelancerSearch: React.FC<FreelancerSearchProps> = ({
  placeholder = "Search freelancers by name, skills, or location...",
  onSelect,
  showFullResults = false,
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading, search, clearResults } = useFreelancerSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        search(query);
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearResults();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [query, search, clearResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (freelancer: FreelancerProfile) => {
    setQuery(`${freelancer.firstName} ${freelancer.lastName}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(freelancer);
  };

  const handleClear = () => {
    setQuery("");
    clearResults();
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-gray-600">Searching freelancers...</span>
            </div>
          )}

          {!loading && results.length === 0 && query.trim() && (
            <div className="py-4 px-4 text-center text-gray-600">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No freelancers found for "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="py-2 px-4 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-medium text-gray-600">
                  {results.length} freelancer{results.length !== 1 ? 's' : ''} found
                </span>
              </div>

              <div className="py-1">
                {results.slice(0, showFullResults ? results.length : 8).map((freelancer, index) => (
                  <div
                    key={freelancer.id}
                    onClick={() => handleSelect(freelancer)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-blue-50 border-l-2 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={freelancer.profilePicture || "/api/placeholder/40/40"}
                        alt={`${freelancer.firstName} ${freelancer.lastName}`}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/40/40";
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {highlightMatch(
                              `${freelancer.firstName} ${freelancer.lastName}`, 
                              query
                            )}
                          </p>
                          <div className="flex items-center ml-2">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-600 ml-1">
                              {(freelancer.rating || 4.5).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 truncate">
                          {highlightMatch(freelancer.bio || "Professional Freelancer", query)}
                        </p>
                        
                        <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">
                              {freelancer.address?.split(',')[0] || "Remote"}
                            </span>
                          </div>
                          <span>•</span>
                          <span>Rs. {freelancer.hourlyRate?.toLocaleString() || "N/A"}/hr</span>
                          {(freelancer.skills || []).length > 0 && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {(freelancer.skills || []).slice(0, 2).join(', ')}
                                {(freelancer.skills || []).length > 2 && ` +${(freelancer.skills || []).length - 2}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!showFullResults && results.length > 8 && (
                  <Link
                    href={`/freelancers?search=${encodeURIComponent(query)}`}
                    className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                  >
                    View all {results.length} results →
                  </Link>
                )}
              </div>
            </>
          )}

          {/* Popular Searches */}
          {!loading && !query.trim() && (
            <div className="py-3 px-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-1">
                {[
                  "React Developer",
                  "UI/UX Designer", 
                  "Content Writer",
                  "Digital Marketer",
                  "Data Analyst"
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
