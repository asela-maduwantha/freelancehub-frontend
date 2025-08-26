"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Link, ExternalLink, Upload, FileText, Image, Code } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/context/toast-context";

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'github' | 'design' | 'document' | 'other';
  thumbnail?: string;
}

interface PortfolioLinksStepProps {
  data: {
    portfolioLinks: PortfolioItem[];
    githubUrl?: string;
    portfolioWebsite?: string;
    linkedinUrl?: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  allowSkip?: boolean;
}

const PORTFOLIO_TYPES = [
  { value: 'website', label: 'Website/App', icon: ExternalLink },
  { value: 'github', label: 'GitHub Repository', icon: Code },
  { value: 'design', label: 'Design/Mockup', icon: Image },
  { value: 'document', label: 'Document/PDF', icon: FileText },
  { value: 'other', label: 'Other', icon: Link },
];

export function PortfolioLinksStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack, 
  allowSkip = true 
}: PortfolioLinksStepProps) {
  const [formData, setFormData] = useState(data);
  const [newPortfolioItem, setNewPortfolioItem] = useState<PortfolioItem>({
    title: "",
    description: "",
    url: "",
    type: 'website'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addPortfolioItem = () => {
    if (!newPortfolioItem.title.trim()) {
      toast.error("Please enter a title for your portfolio item");
      return;
    }

    if (!newPortfolioItem.url.trim()) {
      toast.error("Please enter a URL for your portfolio item");
      return;
    }

    if (!isValidUrl(newPortfolioItem.url)) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (!newPortfolioItem.description.trim()) {
      toast.error("Please enter a description for your portfolio item");
      return;
    }

    const updatedPortfolioLinks = [...formData.portfolioLinks, { ...newPortfolioItem }];
    handleInputChange("portfolioLinks", updatedPortfolioLinks);
    setNewPortfolioItem({
      title: "",
      description: "",
      url: "",
      type: 'website'
    });
    toast.success("Portfolio item added successfully");
  };

  const removePortfolioItem = (index: number) => {
    const updatedPortfolioLinks = formData.portfolioLinks.filter((_, i) => i !== index);
    handleInputChange("portfolioLinks", updatedPortfolioLinks);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate social/professional links if provided
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "Please enter a valid GitHub URL";
    }

    if (formData.portfolioWebsite && !isValidUrl(formData.portfolioWebsite)) {
      newErrors.portfolioWebsite = "Please enter a valid portfolio website URL";
    }

    if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleSkip = () => {
    setNewPortfolioItem({
      title: "",
      description: "",
      url: "",
      type: 'website'
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Portfolio & Professional Links
        </h2>
        <p className="text-gray-600">
          Showcase your work and connect your professional profiles (optional)
        </p>
      </div>

      {/* Professional Links */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Professional Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Profile
            </label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="url"
                value={formData.githubUrl || ""}
                onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                className={`pl-10 ${errors.githubUrl ? "border-red-500" : ""}`}
                placeholder="https://github.com/yourusername"
              />
            </div>
            {errors.githubUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.githubUrl}</p>
            )}
          </div>

          {/* Portfolio Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Website
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="url"
                value={formData.portfolioWebsite || ""}
                onChange={(e) => handleInputChange("portfolioWebsite", e.target.value)}
                className={`pl-10 ${errors.portfolioWebsite ? "border-red-500" : ""}`}
                placeholder="https://yourportfolio.com"
              />
            </div>
            {errors.portfolioWebsite && (
              <p className="text-red-500 text-sm mt-1">{errors.portfolioWebsite}</p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="url"
                value={formData.linkedinUrl || ""}
                onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                className={`pl-10 ${errors.linkedinUrl ? "border-red-500" : ""}`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            {errors.linkedinUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Items */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio Items</h3>

        {/* Existing Portfolio Items */}
        {formData.portfolioLinks.length > 0 && (
          <div className="space-y-4">
            {formData.portfolioLinks.map((item, index) => {
              const TypeIcon = PORTFOLIO_TYPES.find(type => type.value === item.type)?.icon || Link;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1"
                      >
                        View Project <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button
                      onClick={() => removePortfolioItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add New Portfolio Item */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="space-y-4">
            {/* Title and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title *
                </label>
                <Input
                  type="text"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., E-commerce Website, Mobile App"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={newPortfolioItem.type}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {PORTFOLIO_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project URL *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="url"
                  value={newPortfolioItem.url}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, url: e.target.value }))}
                  className="pl-10"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={newPortfolioItem.description}
                onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-20"
                placeholder="Describe the project, technologies used, your role, and achievements..."
                maxLength={300}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {newPortfolioItem.description.length}/300
              </div>
            </div>

            <Button
              onClick={addPortfolioItem}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Portfolio Item
            </Button>
          </div>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Portfolio Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include your best 3-5 projects that showcase different skills</li>
          <li>• Make sure all links are working and accessible</li>
          <li>• Provide clear descriptions of your role and contributions</li>
          <li>• Include live demos when possible, not just code repositories</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-2"
        >
          Back
        </Button>
        
        <div className="flex gap-3">
          {allowSkip && (
            <Button
              onClick={handleSkip}
              variant="outline"
              className="px-6 py-2"
            >
              Skip for Now
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
