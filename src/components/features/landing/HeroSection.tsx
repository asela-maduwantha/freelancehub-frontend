import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, DollarSign, Briefcase, X, Clock } from 'lucide-react';
import Button from '../../ui/Button/Button';

interface HeroSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  stats?: {
    totalProjects: number;
    projectsToday: number;
    avgBudget: number;
  };
  recentSearches?: string[];
  suggestions?: string[];
  isLoading?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  stats,
  recentSearches = [],
  suggestions = [],
  isLoading = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    onSearch();
  };

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-12">
          {/* Main Heading */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Next
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Perfect Project
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your next opportunity is just a click away. Discover exciting projects that match your skills and passion.
          </p>

          {/* Stats Row */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stats.totalProjects.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.projectsToday}
                </div>
                <div className="text-sm text-gray-600">Posted Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  ${stats.avgBudget.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Avg Budget</div>
              </div>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search
                  className={`h-6 w-6 text-gray-400 transition-all duration-200 ${
                    isSearchFocused ? 'text-blue-500 scale-110' : ''
                  }`}
                />
              </div>

              <input
                type="text"
                placeholder="Search projects by title, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  setIsSearchFocused(false);
                  // Delay hiding suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onKeyPress={handleKeyPress}
                className="w-full pl-16 pr-12 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
              />

              {/* Clear Button */}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Button */}
            <div className="mt-4 text-center">
              <Button
                onClick={onSearch}
                variant="primary"
                size="lg"
                className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Projects
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                {/* Popular Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Popular Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 8).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Recent Searches
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💡 Try searching for skills like "React", "Python", "UI/UX", or project types like "web development"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;