"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: "FIXED" | "HOURLY";
  deadline: string;
  requiredSkills: string[];
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  complexity: "SIMPLE" | "INTERMEDIATE" | "COMPLEX";
  attachments: File[];
}

const categories = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-development", label: "Mobile Development" },
  { value: "design", label: "Design & Creative" },
  { value: "writing", label: "Writing & Content" },
  { value: "marketing", label: "Marketing & Sales" },
  { value: "data-science", label: "Data Science & Analytics" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "legal", label: "Legal Services" }
];

const skillSuggestions = [
  "React", "Node.js", "Python", "JavaScript", "TypeScript", "PHP", "Laravel",
  "Vue.js", "Angular", "Express.js", "MongoDB", "MySQL", "PostgreSQL",
  "AWS", "Docker", "Kubernetes", "GraphQL", "REST API", "HTML", "CSS",
  "Tailwind CSS", "Bootstrap", "Figma", "Adobe Photoshop", "UI/UX Design"
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    category: "",
    budget: 0,
    budgetType: "FIXED",
    deadline: "",
    requiredSkills: [],
    experienceLevel: "INTERMEDIATE",
    complexity: "INTERMEDIATE",
    attachments: []
  });

  const [skillInput, setSkillInput] = useState("");
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.budget <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = "At least one skill is required";
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
      // API call to create project
      const projectData = new FormData();
      
      // Append project data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "attachments") {
          formData.attachments.forEach((file) => {
            projectData.append("files", file);
          });
        } else if (key === "requiredSkills") {
          projectData.append(key, JSON.stringify(value));
        } else {
          projectData.append(key, value.toString());
        }
      });

      // const response = await fetch("/api/projects", {
      //   method: "POST",
      //   body: projectData
      // });

      // if (response.ok) {
      //   router.push("/client/projects");
      // }

      // Simulate API call
      setTimeout(() => {
        router.push("/client/projects");
      }, 1500);
      
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.requiredSkills.includes(skill)) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skill]
      });
    }
    setSkillInput("");
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
  };

  const removeFile = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const filteredSkillSuggestions = skillSuggestions.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !formData.requiredSkills.includes(skill)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/client/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post New Project</h1>
          <p className="text-gray-600 mt-1">Create a detailed project listing to attract the best freelancers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Build a modern e-commerce website"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your project in detail..."
                rows={6}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? "border-red-500" : ""
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Budget & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Type *
                </label>
                <select
                  value={formData.budgetType}
                  onChange={(e) => handleInputChange("budgetType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FIXED">Fixed Price</option>
                  <option value="HOURLY">Hourly Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount (USD) *
                </label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", parseInt(e.target.value) || 0)}
                  placeholder="5000"
                  min="1"
                  className={errors.budget ? "border-red-500" : ""}
                />
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Deadline *
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={errors.deadline ? "border-red-500" : ""}
              />
              {errors.deadline && (
                <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills *
              </label>
              <div className="relative">
                <Input
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillSuggestions(true);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className={errors.requiredSkills ? "border-red-500" : ""}
                />
                
                {showSkillSuggestions && filteredSkillSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredSkillSuggestions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.requiredSkills && (
                <p className="text-red-500 text-sm mt-1">{errors.requiredSkills}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Complexity
                </label>
                <select
                  value={formData.complexity}
                  onChange={(e) => handleInputChange("complexity", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SIMPLE">Simple</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="COMPLEX">Complex</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Project Files (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, ZIP, images (MAX. 10MB each)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href="/client/projects">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Creating Project..." : "Post Project"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
