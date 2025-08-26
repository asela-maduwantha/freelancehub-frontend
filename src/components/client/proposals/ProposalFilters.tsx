"use client";

import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProposalFiltersProps {
  filters: {
    status: string;
    project: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (filters: any) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" }
];

const sortOptions = [
  { value: "createdAt", label: "Date Submitted" },
  { value: "proposedBudget", label: "Budget" },
  { value: "freelancerRating", label: "Rating" },
  { value: "timeline", label: "Timeline" }
];

export function ProposalFilters({ filters, onFilterChange }: ProposalFiltersProps) {
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
      project: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
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
        </div>

        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Project:</span>
          <select
            value={filters.project}
            onChange={(e) => handleFilterChange("project", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            <option value="p1">E-commerce Website Development</option>
            <option value="p2">Mobile App Development</option>
            {/* These would be dynamically loaded from API */}
          </select>
        </div>

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
    </div>
  );
}
