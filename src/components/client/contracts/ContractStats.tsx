"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileText, CheckCircle, Clock, DollarSign } from "lucide-react";

interface Contract {
  id: string;
  status: string;
  amount: number;
  milestones: Array<{
    status: string;
    amount: number;
  }>;
}

interface ContractStatsProps {
  contracts: Contract[];
}

export function ContractStats({ contracts }: ContractStatsProps) {
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "ACTIVE").length,
    completed: contracts.filter(c => c.status === "COMPLETED").length,
    totalValue: contracts.reduce((sum, c) => sum + c.amount, 0),
    completedMilestones: contracts.reduce((sum, c) => 
      sum + c.milestones.filter(m => m.status === "COMPLETED").length, 0
    ),
    totalMilestones: contracts.reduce((sum, c) => sum + c.milestones.length, 0)
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        title="Total Contracts"
        value={stats.total}
        icon={FileText}
        color="text-blue-600"
      />
      <StatCard
        title="Active"
        value={stats.active}
        icon={Clock}
        color="text-green-600"
      />
      <StatCard
        title="Completed"
        value={stats.completed}
        icon={CheckCircle}
        color="text-blue-600"
      />
      <StatCard
        title="Total Value"
        value={`$${stats.totalValue.toLocaleString()}`}
        icon={DollarSign}
        color="text-purple-600"
      />
      <StatCard
        title="Milestones"
        value={`${stats.completedMilestones}/${stats.totalMilestones}`}
        icon={CheckCircle}
        color="text-orange-600"
      />
    </div>
  );
}
