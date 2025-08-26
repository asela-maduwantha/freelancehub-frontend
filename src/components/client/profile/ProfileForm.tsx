"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Edit, Save, X, Upload, Building, Globe, FileText } from "lucide-react";

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

interface ProfileFormProps {
  profile: ClientProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (profile: ClientProfile) => void;
}

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Real Estate",
  "Marketing",
  "Consulting",
  "Non-profit",
  "Other"
];

export function ProfileForm({ profile, isEditing, onEdit, onCancel, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.industry) {
      newErrors.industry = "Please select an industry";
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = "Please enter a valid URL (starting with http:// or https://)";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Company description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // API call to update profile
      // const response = await fetch('/clients/me', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call
      setTimeout(() => {
        onUpdate(formData);
      }, 1000);
      
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClientProfile, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setErrors({});
    onCancel();
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="Company Logo"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <Building className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.companyName}</h3>
              <p className="text-gray-600">{profile.industry}</p>
            </div>
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="text-gray-900">{profile.companyName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <div className="text-gray-900">{profile.industry}</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="text-gray-900">
                {profile.website ? (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    {profile.website}
                  </a>
                ) : (
                  <span className="text-gray-500">No website provided</span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <div className="text-gray-900 whitespace-pre-wrap">{profile.description}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit className="h-5 w-5 mr-2" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt="Company Logo"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <Building className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Your Company Name"
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.industry ? "border-red-500" : ""
                }`}
              >
                <option value="">Select an industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourcompany.com"
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your company, services, and what makes you unique..."
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
