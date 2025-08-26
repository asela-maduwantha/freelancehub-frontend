"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MessageSquare, Check, X, Clock } from "lucide-react";

interface Proposal {
  id: string;
  status: string;
  proposedBudget: number;
}

interface ProposalStatsProps {
  proposals: Proposal[];
}

export function ProposalStats({ proposals }: ProposalStatsProps) {
  const stats = {
    total: proposals.length,
    submitted: proposals.filter(p => p.status === "SUBMITTED").length,
    accepted: proposals.filter(p => p.status === "ACCEPTED").length,
    rejected: proposals.filter(p => p.status === "REJECTED").length,
    averageBudget: proposals.length > 0 
      ? Math.round(proposals.reduce((sum, p) => sum + p.proposedBudget, 0) / proposals.length)
      : 0
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
        title="Total Proposals"
        value={stats.total}
        icon={MessageSquare}
        color="text-blue-600"
      />
      <StatCard
        title="Submitted"
        value={stats.submitted}
        icon={Clock}
        color="text-yellow-600"
      />
      <StatCard
        title="Accepted"
        value={stats.accepted}
        icon={Check}
        color="text-green-600"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        icon={X}
        color="text-red-600"
      />
      <StatCard
        title="Avg. Budget"
        value={`$${stats.averageBudget.toLocaleString()}`}
        icon={MessageSquare}
        color="text-purple-600"
      />
    </div>
  );
}
