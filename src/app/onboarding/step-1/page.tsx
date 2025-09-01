"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { userAPI } from "@/lib/api";

interface ProfessionalData {
  title: string;
  bio: string;
  experience: "entry" | "intermediate" | "expert";
  hourlyRate: number;
  availability: "AVAILABLE" | "PART_TIME" | "BUSY" | "UNAVAILABLE";
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<ProfessionalData>({
    title: "",
    bio: "",
    experience: "intermediate",
    hourlyRate: 25,
    availability: "AVAILABLE",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/register");
    }
  }, [router]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Update freelancer profile with step 1 data
      const freelancerProfileData = {
        title: formData.title,
        bio: formData.bio,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability,
      };

      await userAPI.updateFreelancerProfile(freelancerProfileData);

      // Show congrats and navigate to dashboard
      setShowCongrats(true);
      setTimeout(() => {
        router.push("/freelancer/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving data:", error);
      setErrors({ submit: "Failed to save profile data. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const experienceOptions = [
    {
      value: "entry",
      label: "Entry Level (0-2 years)",
      description: "New to freelancing or the industry",
    },
    {
      value: "intermediate",
      label: "Intermediate (2-5 years)",
      description: "Some experience and proven skills",
    },
    {
      value: "expert",
      label: "Expert (5+ years)",
      description: "Extensive experience and expertise",
    },
  ];

  const availabilityOptions = [
    {
      value: "AVAILABLE",
      label: "Available",
      description: "Ready to take on new projects",
    },
    {
      value: "PART_TIME",
      label: "Part-time",
      description: "Limited availability for new projects",
    },
    { value: "BUSY", label: "Busy", description: "Limited availability" },
    {
      value: "UNAVAILABLE",
      label: "Unavailable",
      description: "Not taking new projects",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">
                FreelanceHub
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Step 1 of 4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/register/almost-there"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
            Tell us about yourself
          </h1>
          <p className="text-xl text-gray-600 font-inter">
            Help clients understand your expertise and professional background
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Form */}
          {showCongrats ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
                Congratulations!
              </h2>
              <p className="text-lg text-gray-600 font-inter mb-6">
                Your profile has been set up successfully. Welcome to
                FreelanceHub!
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                {/* Professional Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2 font-poppins"
                  >
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="e.g., Full-Stack Developer, UI/UX Designer, Content Writer"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be the headline of your profile
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-2 font-poppins"
                  >
                    Professional Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-inter"
                    placeholder="Describe your experience, skills, and what makes you unique. Include your background, expertise, and the value you bring to clients..."
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">
                      Tell clients about your background and expertise
                    </p>
                    <span className="text-sm text-gray-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                    Experience Level
                  </label>
                  <div className="space-y-3">
                    {experienceOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="experience"
                          value={option.value}
                          checked={formData.experience === option.value}
                          onChange={(e) =>
                            handleInputChange("experience", e.target.value)
                          }
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div>
                          <div className="font-medium text-gray-900 font-inter">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label
                    htmlFor="hourlyRate"
                    className="block text-sm font-medium text-gray-700 mb-2 font-poppins"
                  >
                    Hourly Rate (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      id="hourlyRate"
                      min="5"
                      max="500"
                      value={formData.hourlyRate}
                      onChange={(e) =>
                        handleInputChange(
                          "hourlyRate",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    You can always adjust this later
                  </p>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                      Current Availability
                    </label>
                    <div className="space-y-3">
                      {availabilityOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-start space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="availability"
                            value={option.value}
                            checked={formData.availability === option.value}
                            onChange={(e) =>
                              handleInputChange("availability", e.target.value)
                            }
                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div>
                            <div className="font-medium text-gray-900 font-inter">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleContinue}
                    disabled={isLoading}
                    variant="premium"
                    size="lg"
                    className="font-poppins"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Continue</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
