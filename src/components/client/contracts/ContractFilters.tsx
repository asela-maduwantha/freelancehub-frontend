"use client";

import { Search, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ContractFiltersProps {
  filters: {
    status: string;
    search: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (filters: any) => void;
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PENDING", label: "Pending" }
];

const sortOptions = [
  { value: "createdAt", label: "Date Created" },
  { value: "startDate", label: "Start Date" },
  { value: "endDate", label: "End Date" },
  { value: "amount", label: "Amount" }
];

export function ContractFilters({ filters, onFilterChange }: ContractFiltersProps) {
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
          placeholder="Search contracts..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
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
