"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, GraduationCap, Award, Calendar, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/context/toast-context";

interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

interface EducationCertificationStepProps {
  data: {
    education: Education[];
    certifications: Certification[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  allowSkip?: boolean;
}

export function EducationCertificationStep({ 
  data, 
  onUpdate, 
  onNext, 
  onBack, 
  allowSkip = true 
}: EducationCertificationStepProps) {
  const [formData, setFormData] = useState(data);
  const [newEducation, setNewEducation] = useState<Education>({
    degree: "",
    institution: "",
    year: "",
    description: ""
  });
  const [newCertification, setNewCertification] = useState<Certification>({
    name: "",
    issuer: "",
    year: "",
    credentialUrl: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const addEducation = () => {
    if (!newEducation.degree.trim() || !newEducation.institution.trim() || !newEducation.year.trim()) {
      toast.error("Please fill in all required education fields");
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(newEducation.year);
    if (yearNum < 1950 || yearNum > currentYear + 10) {
      toast.error("Please enter a valid year");
      return;
    }

    const updatedEducation = [...formData.education, { ...newEducation }];
    handleInputChange("education", updatedEducation);
    setNewEducation({ degree: "", institution: "", year: "", description: "" });
    toast.success("Education added successfully");
  };

  const removeEducation = (index: number) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    handleInputChange("education", updatedEducation);
  };

  const addCertification = () => {
    if (!newCertification.name.trim() || !newCertification.issuer.trim() || !newCertification.year.trim()) {
      toast.error("Please fill in all required certification fields");
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(newCertification.year);
    if (yearNum < 1950 || yearNum > currentYear + 10) {
      toast.error("Please enter a valid year");
      return;
    }

    // Validate URL if provided
    if (newCertification.credentialUrl && newCertification.credentialUrl.trim()) {
      try {
        new URL(newCertification.credentialUrl);
      } catch {
        toast.error("Please enter a valid credential URL");
        return;
      }
    }

    const updatedCertifications = [...formData.certifications, { ...newCertification }];
    handleInputChange("certifications", updatedCertifications);
    setNewCertification({ name: "", issuer: "", year: "", credentialUrl: "" });
    toast.success("Certification added successfully");
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = formData.certifications.filter((_, i) => i !== index);
    handleInputChange("certifications", updatedCertifications);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // For this step, we don't require any minimum entries since education/certs can be optional
    // But if they start adding one, they should complete it
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleSkip = () => {
    // Clear any partial entries and proceed
    setNewEducation({ degree: "", institution: "", year: "", description: "" });
    setNewCertification({ name: "", issuer: "", year: "", credentialUrl: "" });
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
          Education & Certifications
        </h2>
        <p className="text-gray-600">
          Share your educational background and professional certifications (optional)
        </p>
      </div>

      {/* Education Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Education</h3>
        </div>

        {/* Existing Education */}
        {formData.education.length > 0 && (
          <div className="space-y-3">
            {formData.education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                    {edu.description && (
                      <p className="text-sm text-gray-600 mt-1">{edu.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add New Education */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Course *
              </label>
              <Input
                type="text"
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g., Bachelor of Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                  className="pl-10"
                  placeholder="e.g., MIT, Stanford University"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                  className="pl-10"
                  placeholder="2023"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <Input
                type="text"
                value={newEducation.description}
                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Magna Cum Laude, 3.8 GPA"
              />
            </div>
          </div>
          <Button
            onClick={addEducation}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
        </div>

        {/* Existing Certifications */}
        {formData.certifications.length > 0 && (
          <div className="space-y-3">
            {formData.certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">{cert.year}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700 underline"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add New Certification */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name *
              </label>
              <Input
                type="text"
                value={newCertification.name}
                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., AWS Certified Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Organization *
              </label>
              <Input
                type="text"
                value={newCertification.issuer}
                onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="e.g., Amazon Web Services"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Obtained *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={newCertification.year}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, year: e.target.value }))}
                  className="pl-10"
                  placeholder="2023"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential URL (Optional)
              </label>
              <Input
                type="url"
                value={newCertification.credentialUrl}
                onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <Button
            onClick={addCertification}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </Button>
        </div>
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
