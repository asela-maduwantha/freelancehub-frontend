"use client";

import { useState } from "react";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProjectFiltersProps {
  filters: {
    status: string;
    category: string;
    search: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (filters: any) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" }
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design" },
  { value: "writing", label: "Writing & Content" },
  { value: "marketing", label: "Marketing" },
  { value: "data-science", label: "Data Science" }
];

const sortOptions = [
  { value: "createdAt", label: "Date Created" },
  { value: "deadline", label: "Deadline" },
  { value: "budget", label: "Budget" },
  { value: "proposalsCount", label: "Proposals" }
];

export function ProjectFilters({ filters, onFilterChange }: ProjectFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ [key]: value });
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";
    onFilterChange({ sortBy, sortOrder: newSortOrder });
  };

  const clearFilters = () => {
    onFilterChange({
      status: "",
      category: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={filters.search}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
                filters.sortBy === option.value
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
              {filters.sortBy === option.value && (
                filters.sortOrder === "asc" ? (
                  <SortAsc className="h-3 w-3" />
                ) : (
                  <SortDesc className="h-3 w-3" />
                )
              )}
            </button>
          ))}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
        </button>

        {/* Clear Filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="text-gray-600"
        >
          Clear All
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Max"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                className="flex-1"
              />
              <Input
                type="date"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposals Count
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Any number</option>
              <option value="0">No proposals</option>
              <option value="1-5">1-5 proposals</option>
              <option value="6-10">6-10 proposals</option>
              <option value="10+">10+ proposals</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
