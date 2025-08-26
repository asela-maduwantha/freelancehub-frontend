"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { ProfileForm } from "@/components/client/profile/ProfileForm";
import { ProfileStats } from "@/components/client/profile/ProfileStats";
import { ProfileSkeleton } from "@/components/client/profile/ProfileSkeleton";

interface ClientProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  website: string;
  description: string;
  averageRating: number;
  completedProjects: number;
  totalSpent: number;
  memberSince: string;
  profilePictureUrl?: string;
}

export default function ClientProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // API call to fetch client profile
      // const response = await fetch('/clients/me');
      // const data = await response.json();
      
      // Simulated data
      const data: ClientProfile = {
        id: "c1",
        userId: user?.id || "",
        companyName: "Tech Solutions Inc",
        industry: "Technology",
        website: "https://techsolutions.com",
        description: "Leading technology solutions provider specializing in web development and mobile applications. We help businesses transform their digital presence.",
        averageRating: 4.8,
        completedProjects: 12,
        totalSpent: 25000,
        memberSince: "2023-01-15T00:00:00Z",
        profilePictureUrl: "/public/user.jpg"
      };
      
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: ClientProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information and settings</p>
        </div>
      </div>

      {/* Profile Stats */}
      <ProfileStats profile={profile} />

      {/* Profile Form */}
      <ProfileForm
        profile={profile}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onUpdate={handleProfileUpdate}
      />
    </motion.div>
  );
}
