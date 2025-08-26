"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { skillsApi, Skill } from "@/lib/api/skills";
import { toast } from "@/context/toast-context";

interface ProfessionalSkillsStepProps {
  data: {
    skills: string[];
    hourlyRate: number;
    experience: string;
    title: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const EXPERIENCE_OPTIONS = [
  { value: "entry", label: "Entry Level (0-1 years)" },
  { value: "intermediate", label: "Intermediate (2-5 years)" },
  { value: "experienced", label: "Experienced (5-10 years)" },
  { value: "expert", label: "Expert (10+ years)" },
];

const POPULAR_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
  "Django", "Flask", "PHP", "Laravel", "Java", "Spring Boot", "C#",
  ".NET", "Ruby", "Rails", "Go", "Rust", "Vue.js", "Angular",
  "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap", "Figma",
  "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "AWS", "Azure",
  "Docker", "Kubernetes", "Git", "GraphQL", "REST API"
];

export function ProfessionalSkillsStep({ data, onUpdate, onNext, onBack }: ProfessionalSkillsStepProps) {
  const [formData, setFormData] = useState(data);
  const [skillSearch, setSkillSearch] = useState("");
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load initial skills
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setIsLoadingSkills(true);
      const skills = await skillsApi.getAll();
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Failed to load skills:", error);
      // Use popular skills as fallback
      setAvailableSkills(POPULAR_SKILLS.map(skill => ({ 
        _id: skill.toLowerCase().replace(/\s+/g, '-'),
        name: skill,
        category: 'programming',
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })));
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    
    const normalizedSkill = skillName.trim();
    if (formData.skills.includes(normalizedSkill)) {
      toast.error("Skill already added");
      return;
    }

    if (formData.skills.length >= 15) {
      toast.error("Maximum 15 skills allowed");
      return;
    }

    const newSkills = [...formData.skills, normalizedSkill];
    handleInputChange("skills", newSkills);
    setSkillSearch("");
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = formData.skills.filter(skill => skill !== skillToRemove);
    handleInputChange("skills", newSkills);
  };

  const handleSkillSearch = async (query: string) => {
    setSkillSearch(query);
    
    if (query.length > 2) {
      try {
        const searchResults = await skillsApi.searchSkills(query);
        setAvailableSkills(searchResults);
      } catch (error) {
        console.error("Skill search failed:", error);
      }
    } else if (query.length === 0) {
      loadSkills();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Professional title is required";
    }

    if (formData.skills.length === 0) {
      newErrors.skills = "Please add at least one skill";
    } else if (formData.skills.length < 3) {
      newErrors.skills = "Please add at least 3 skills to better showcase your expertise";
    }

    if (!formData.experience) {
      newErrors.experience = "Please select your experience level";
    }

    if (!formData.hourlyRate || formData.hourlyRate < 5) {
      newErrors.hourlyRate = "Please set a realistic hourly rate (minimum $5/hour)";
    } else if (formData.hourlyRate > 500) {
      newErrors.hourlyRate = "Hourly rate seems too high (maximum $500/hour)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    !formData.skills.includes(skill.name) &&
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What's your professional expertise?
        </h2>
        <p className="text-gray-600">
          Help clients understand your skills and experience level
        </p>
      </div>

      {/* Professional Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Title *
        </label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={errors.title ? "border-red-500" : ""}
          placeholder="e.g., Full Stack Developer, UI/UX Designer, Data Scientist"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          This will be displayed as your main headline
        </p>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience Level *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPERIENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.experience === option.value
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={formData.experience === option.value}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{option.label}</span>
                {formData.experience === option.value && (
                  <Star className="w-5 h-5 text-green-500 fill-current" />
                )}
              </div>
            </label>
          ))}
        </div>
        {errors.experience && (
          <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
        )}
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hourly Rate (USD) *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
          <Input
            type="number"
            value={formData.hourlyRate || ""}
            onChange={(e) => handleInputChange("hourlyRate", parseFloat(e.target.value) || 0)}
            className={`pl-8 ${errors.hourlyRate ? "border-red-500" : ""}`}
            placeholder="25"
            min="5"
            max="500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">/hour</div>
        </div>
        {errors.hourlyRate && (
          <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          You can always adjust this later
        </p>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills & Technologies *
        </label>
        
        {/* Skill Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            value={skillSearch}
            onChange={(e) => handleSkillSearch(e.target.value)}
            className="pl-10"
            placeholder="Search skills (e.g., React, Python, Design)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(skillSearch);
              }
            }}
          />
        </div>

        {/* Selected Skills */}
        {formData.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Skills ({formData.skills.length}/15)
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Available Skills */}
        {(skillSearch || formData.skills.length === 0) && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {skillSearch ? "Search Results" : "Popular Skills"}
            </p>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {isLoadingSkills ? (
                <div className="text-center text-gray-500">Loading skills...</div>
              ) : filteredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.slice(0, 20).map((skill) => (
                    <button
                      key={skill._id}
                      onClick={() => addSkill(skill.name)}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{skill.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  {skillSearch ? (
                    <div>
                      No skills found for "{skillSearch}".{" "}
                      <button
                        onClick={() => addSkill(skillSearch)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Add it as a custom skill
                      </button>
                    </div>
                  ) : (
                    "No skills available"
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {errors.skills && (
          <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
        )}
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
