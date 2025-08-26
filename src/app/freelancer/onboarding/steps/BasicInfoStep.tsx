"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Phone, FileText, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/context/toast-context";

interface BasicInfoStepProps {
  data: {
    profilePicture?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: string;
    bio: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

export function BasicInfoStep({ data, onUpdate, onNext, onBack }: BasicInfoStepProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileImagePreview, setProfileImagePreview] = useState<string>(data.profilePicture || "");

  useEffect(() => {
    // Pre-populate from user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.name?.split(' ')[0] || "",
        lastName: prev.lastName || user.name?.split(' ').slice(1).join(' ') || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdate({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImagePreview(result);
        handleInputChange("profilePicture", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "A brief bio is required";
    } else if (formData.bio.length < 50) {
      newErrors.bio = "Bio should be at least 50 characters";
    } else if (formData.bio.length > 500) {
      newErrors.bio = "Bio should not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's start with your basic information
        </h2>
        <p className="text-gray-600">
          This information will be visible to potential clients on your profile
        </p>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <label
            htmlFor="profile-upload"
            className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500">Upload your profile picture (optional)</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
              placeholder="Enter your first name"
            />
          </div>
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
              placeholder="Enter your last name"
            />
          </div>
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
            placeholder="City, Country"
          />
        </div>
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Bio *
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-32 ${
              errors.bio ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Tell clients about yourself, your experience, and what makes you unique..."
            maxLength={500}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          {errors.bio ? (
            <p className="text-red-500 text-sm">{errors.bio}</p>
          ) : (
            <p className="text-gray-500 text-sm">
              Write a compelling bio that showcases your expertise
            </p>
          )}
          <span className="text-sm text-gray-400">
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        {onBack ? (
          <Button
            onClick={onBack}
            variant="outline"
            className="px-6 py-2"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button
          onClick={handleNext}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
