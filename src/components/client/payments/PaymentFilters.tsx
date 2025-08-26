"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  ArrowRightLeft
} from "lucide-react";

interface PaymentFilters {
  search: string;
  status: string[];
  type: string[];
  paymentMethod: string[];
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
}

interface PaymentFiltersProps {
  filters: PaymentFilters;
  onFiltersChange: (filters: PaymentFilters) => void;
  isLoading?: boolean;
  className?: string;
}

const paymentStatuses = [
  { value: "PENDING", label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "PROCESSED", label: "Processed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { value: "FAILED", label: "Failed", icon: XCircle, color: "bg-red-100 text-red-800" },
  { value: "REFUNDED", label: "Refunded", icon: ArrowRightLeft, color: "bg-gray-100 text-gray-800" },
  { value: "ESCROW", label: "In Escrow", icon: Shield, color: "bg-blue-100 text-blue-800" },
];

const paymentTypes = [
  { value: "project_payment", label: "Project Payment" },
  { value: "milestone_payment", label: "Milestone Payment" },
  { value: "bonus_payment", label: "Bonus Payment" },
  { value: "refund", label: "Refund" },
];

const paymentMethods = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "paypal", label: "PayPal", icon: DollarSign },
  { value: "bank_transfer", label: "Bank Transfer", icon: ArrowRightLeft },
];

export function PaymentFilters({ 
  filters, 
  onFiltersChange, 
  isLoading = false,
  className = ""
}: PaymentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<PaymentFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      type: [],
      paymentMethod: [],
      dateRange: { from: "", to: "" },
      amountRange: { min: 0, max: 10000 },
    });
  };

  const toggleFilter = (filterType: keyof PaymentFilters, value: string) => {
    const currentFilter = filters[filterType] as string[];
    const updatedFilter = currentFilter.includes(value)
      ? currentFilter.filter(item => item !== value)
      : [...currentFilter, value];
    
    updateFilters({ [filterType]: updatedFilter });
  };

  const activeFiltersCount = 
    filters.status.length + 
    filters.type.length + 
    filters.paymentMethod.length +
    (filters.search ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.amountRange.min > 0 || filters.amountRange.max < 10000 ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardContent className="p-6">
          {/* Search and Toggle */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by project, freelancer, or payment ID..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-4 border-t"
            >
              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {paymentStatuses.map((status) => {
                    const Icon = status.icon;
                    const isSelected = filters.status.includes(status.value);
                    return (
                      <button
                        key={status.value}
                        onClick={() => toggleFilter("status", status.value)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? status.color
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        <Icon className="h-4 w-4" />
                        {status.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Type</h3>
                <div className="flex flex-wrap gap-2">
                  {paymentTypes.map((type) => {
                    const isSelected = filters.type.includes(type.value);
                    return (
                      <button
                        key={type.value}
                        onClick={() => toggleFilter("type", type.value)}
                        disabled={isLoading}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = filters.paymentMethod.includes(method.value);
                    return (
                      <button
                        key={method.value}
                        onClick={() => toggleFilter("paymentMethod", method.value)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range and Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input
                        type="date"
                        value={filters.dateRange.from}
                        onChange={(e) => updateFilters({
                          dateRange: { ...filters.dateRange, from: e.target.value }
                        })}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.dateRange.to}
                        onChange={(e) => updateFilters({
                          dateRange: { ...filters.dateRange, to: e.target.value }
                        })}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Amount Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={filters.amountRange.min}
                        onChange={(e) => updateFilters({
                          amountRange: { ...filters.amountRange, min: Number(e.target.value) }
                        })}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={filters.amountRange.max}
                        onChange={(e) => updateFilters({
                          amountRange: { ...filters.amountRange, max: Number(e.target.value) }
                        })}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
