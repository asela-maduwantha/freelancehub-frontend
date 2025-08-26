"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  Shield,
  CreditCard,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";

interface PaymentStats {
  totalSpent: number;
  pendingPayments: number;
  escrowBalance: number;
  monthlySpending: number;
  paymentMethodStats: {
    credit_card: number;
    paypal: number;
    bank_transfer: number;
  };
  statusStats: {
    processed: number;
    pending: number;
    failed: number;
    refunded: number;
    escrow: number;
  };
  monthlyTrend: {
    current: number;
    previous: number;
    percentage: number;
  };
}

interface PaymentStatsProps {
  stats: PaymentStats;
  isLoading: boolean;
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = "text-blue-600",
  bgColor = "bg-blue-50"
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  color?: string;
  bgColor?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {value}
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const PaymentMethodChart = ({ stats }: { stats: PaymentStats['paymentMethodStats'] }) => {
  const total = stats.credit_card + stats.paypal + stats.bank_transfer;
  
  const methods = [
    { name: "Credit Card", value: stats.credit_card, color: "bg-blue-500" },
    { name: "PayPal", value: stats.paypal, color: "bg-green-500" },
    { name: "Bank Transfer", value: stats.bank_transfer, color: "bg-purple-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {methods.map((method) => {
            const percentage = total > 0 ? (method.value / total) * 100 : 0;
            return (
              <div key={method.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                  <span className="text-sm text-gray-500">
                    ${method.value.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-2 rounded-full ${method.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBreakdown = ({ stats }: { stats: PaymentStats['statusStats'] }) => {
  const statusItems = [
    { label: "Processed", value: stats.processed, color: "text-green-600", bgColor: "bg-green-100" },
    { label: "Pending", value: stats.pending, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { label: "In Escrow", value: stats.escrow, color: "text-blue-600", bgColor: "bg-blue-100" },
    { label: "Failed", value: stats.failed, color: "text-red-600", bgColor: "bg-red-100" },
    { label: "Refunded", value: stats.refunded, color: "text-gray-600", bgColor: "bg-gray-100" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <span className={`text-sm font-semibold ${item.color}`}>
                ${item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export function PaymentStats({ stats, isLoading, className = "" }: PaymentStatsProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <StatsSkeleton />
      </div>
    );
  }

  const trendIsPositive = stats.monthlyTrend.percentage >= 0;

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            icon={DollarSign}
            description="All-time payments"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          
          <StatCard
            title="Pending Payments"
            value={`$${stats.pendingPayments.toLocaleString()}`}
            icon={Clock}
            description="Awaiting processing"
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          
          <StatCard
            title="Escrow Balance"
            value={`$${stats.escrowBalance.toLocaleString()}`}
            icon={Shield}
            description="Funds in escrow"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          
          <StatCard
            title="Monthly Spending"
            value={`$${stats.monthlySpending.toLocaleString()}`}
            icon={Calendar}
            trend={{
              value: stats.monthlyTrend.percentage,
              isPositive: trendIsPositive
            }}
            description="This month"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentMethodChart stats={stats.paymentMethodStats} />
          <StatusBreakdown stats={stats.statusStats} />
        </div>

        {/* Additional Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${stats.monthlyTrend.current.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Current Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${stats.monthlyTrend.previous.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Previous Month</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  trendIsPositive ? "text-green-600" : "text-red-600"
                }`}>
                  {trendIsPositive ? "+" : ""}{stats.monthlyTrend.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Change</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
