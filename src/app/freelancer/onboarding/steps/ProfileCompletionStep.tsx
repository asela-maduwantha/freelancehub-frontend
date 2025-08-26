"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, User, Award, Link, Code, ExternalLink, MapPin, Mail, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { freelancerApi } from "../../../../lib/api/freelancerApi";
import { toast } from "@/context/toast-context";
import { useAuth } from "@/hooks/useAuth";

interface ProfileCompletionStepProps {
  data: {
    // Basic Info
    profilePicture?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    location: string;
    bio: string;
    
    // Professional Skills
    skills: string[];
    hourlyRate: number;
    experience: string;
    title: string;
    
    // Education & Certifications
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      description?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
      credentialUrl?: string;
    }>;
    
    // Portfolio & Links
    portfolioLinks: Array<{
      title: string;
      description: string;
      url: string;
      type: string;
    }>;
    githubUrl?: string;
    portfolioWebsite?: string;
    linkedinUrl?: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

const EXPERIENCE_LABELS = {
  entry: "Entry Level (0-1 years)",
  intermediate: "Intermediate (2-5 years)",
  experienced: "Experienced (5-10 years)",
  expert: "Expert (10+ years)",
};

export function ProfileCompletionStep({ data, onComplete, onBack }: ProfileCompletionStepProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const calculateCompleteness = () => {
    let score = 0;
    const maxScore = 100;

    // Basic info (40 points)
    if (data.firstName && data.lastName) score += 10;
    if (data.phoneNumber) score += 5;
    if (data.location) score += 5;
    if (data.bio && data.bio.length >= 50) score += 15;
    if (data.profilePicture) score += 5;

    // Professional skills (35 points)
    if (data.title) score += 10;
    if (data.skills.length >= 3) score += 15;
    if (data.hourlyRate > 0) score += 5;
    if (data.experience) score += 5;

    // Education & Certifications (15 points)
    if (data.education.length > 0) score += 8;
    if (data.certifications.length > 0) score += 7;

    // Portfolio & Links (10 points)
    if (data.portfolioLinks.length > 0) score += 5;
    if (data.githubUrl || data.portfolioWebsite || data.linkedinUrl) score += 5;

    return Math.min(score, maxScore);
  };

  const completenessScore = calculateCompleteness();

  const handleSubmitProfile = async () => {
    if (!user?.id) {
      toast.error("User not found. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the freelancer profile data
      const freelancerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture,
        phoneNumber: data.phoneNumber,
        location: data.location,
        title: data.title,
        bio: data.bio,
        skills: data.skills,
        hourlyRate: data.hourlyRate,
        experience: data.experience,
        education: data.education,
        certifications: data.certifications,
        portfolioLinks: data.portfolioLinks as Array<{
          title: string;
          description: string;
          url: string;
          type: "website" | "github" | "design" | "document" | "other";
        }>,
        githubUrl: data.githubUrl,
        portfolioWebsite: data.portfolioWebsite,
        linkedinUrl: data.linkedinUrl,
      };

      // Create or update freelancer profile
      await freelancerApi.createProfile(freelancerData);
      
      setIsComplete(true);
      toast.success("Your freelancer profile has been created successfully!");
      
      // Auto-advance after showing success
      setTimeout(() => {
        onComplete();
      }, 3000);

    } catch (error: any) {
      console.error("Profile creation error:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Welcome to FreelanceHub!
          </h2>
          <p className="text-gray-600 text-lg">
            Your freelancer profile has been created successfully. You're ready to start finding amazing projects!
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            <strong>Profile Completeness:</strong> {completenessScore}%
          </p>
          <p className="text-green-700 text-sm mt-1">
            You can always update your profile later to improve your visibility to clients.
          </p>
        </div>
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Profile
        </h2>
        <p className="text-gray-600">
          Double-check your information before completing your freelancer profile
        </p>
      </div>

      {/* Profile Completeness */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completeness</h3>
          <span className="text-2xl font-bold text-green-600">{completenessScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completenessScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completenessScore >= 80 
            ? "Excellent! Your profile is very complete and will attract more clients." 
            : completenessScore >= 60 
            ? "Good start! Consider adding more details to improve your profile." 
            : "Your profile needs more information to be competitive."
          }
        </p>
      </div>

      {/* Profile Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {data.profilePicture ? (
                <img
                  src={data.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">
                {data.firstName} {data.lastName}
              </h3>
              <p className="text-green-100">{data.title}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-green-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {data.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ${data.hourlyRate}/hour
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About</h4>
            <p className="text-gray-600">{data.bio || "No bio provided"}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
            {data.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added</p>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Experience Level</h4>
            <p className="text-gray-600">
              {data.experience ? EXPERIENCE_LABELS[data.experience as keyof typeof EXPERIENCE_LABELS] : "Not specified"}
            </p>
          </div>

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-500 pl-3">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-gray-600">{edu.institution} • {edu.year}</p>
                    {edu.description && (
                      <p className="text-sm text-gray-500">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
              <div className="space-y-2">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-gray-600">{cert.issuer} • {cert.year}</p>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                        >
                          View Credential <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Links */}
          {data.portfolioLinks.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Portfolio</h4>
              <div className="space-y-3">
                {data.portfolioLinks.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.title}</h5>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Links */}
          {(data.githubUrl || data.portfolioWebsite || data.linkedinUrl) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Professional Links</h4>
              <div className="space-y-2">
                {data.githubUrl && (
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <Code className="w-4 h-4" />
                    GitHub Profile
                  </a>
                )}
                {data.portfolioWebsite && (
                  <a
                    href={data.portfolioWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Portfolio Website
                  </a>
                )}
                {data.linkedinUrl && (
                  <a
                    href={data.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <Link className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-2"
        >
          Back to Edit
        </Button>
        
        <Button
          onClick={handleSubmitProfile}
          disabled={isSubmitting}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Profile...
            </div>
          ) : (
            "Complete Profile & Get Started"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
