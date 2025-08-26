"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Star, Briefcase, DollarSign, Calendar } from "lucide-react";

interface ClientProfile {
  averageRating: number;
  completedProjects: number;
  totalSpent: number;
  memberSince: string;
}

interface ProfileStatsProps {
  profile: ClientProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Average Rating"
        value={`${profile.averageRating}/5.0`}
        icon={Star}
        color="text-yellow-600"
      />
      <StatCard
        title="Projects Completed"
        value={profile.completedProjects}
        icon={Briefcase}
        color="text-blue-600"
      />
      <StatCard
        title="Total Spent"
        value={`$${profile.totalSpent.toLocaleString()}`}
        icon={DollarSign}
        color="text-green-600"
      />
      <StatCard
        title="Member Since"
        value={formatDate(profile.memberSince)}
        icon={Calendar}
        color="text-purple-600"
      />
    </div>
  );
}
