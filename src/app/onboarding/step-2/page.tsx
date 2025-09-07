'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Code, X, Plus, Award } from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/lib/api';

interface SkillsData {
  skills: string[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }[];
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<SkillsData>({
    skills: [],
    certifications: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Popular skills suggestions
  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'HTML/CSS',
    'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Content Writing',
    'SEO', 'Digital Marketing', 'WordPress', 'Shopify', 'SQL',
    'AWS', 'Docker', 'Vue.js', 'Angular', 'PHP', 'Laravel',
    'Graphic Design', 'Video Editing', 'Data Analysis', 'Machine Learning'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/register');
    }

    // Load existing data if any
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (onboardingData.skills) {
      setFormData(onboardingData.skills);
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.skills.length < 3) {
      newErrors.skills = 'Please add at least 3 skills';
    } else if (formData.skills.length > 15) {
      newErrors.skills = 'Maximum 15 skills allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSkill = (type: 'skill' | 'certification') => {
    const skillInput = type === 'skill' ? newSkill : newCertification;
    
    if (!skillInput.trim()) return;

    if (type === 'skill') {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()]
        }));
      }
      setNewSkill('');
    } else {
      // For certifications, we'll handle this differently
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, {
          name: skillInput.trim(),
          issuer: '',
          issueDate: new Date().toISOString().split('T')[0]
        }]
      }));
      setNewCertification('');
    }
  };

  const removeSkill = (type: 'skill' | 'certification', index: number) => {
    if (type === 'skill') {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    }
  };

  const addPopularSkill = (skill: string) => {
    if (!formData.skills.includes(skill) && formData.skills.length < 15) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Save to localStorage for multi-step process
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.skills = formData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Navigate to step 3
      router.push('/onboarding/step-3');
    } catch (error) {
      console.error('Error saving data:', error);
      setErrors({ submit: 'Failed to save skills data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ProgressIndicator
                currentStep={2}
                totalSteps={5}
                steps={['Profile', 'Skills', 'Portfolio', 'Education', 'Complete']}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link
            href="/onboarding/step-1"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
              <Code className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              What are your skills?
            </h1>
            <p className="text-xl text-gray-600 font-inter mb-8">
              Showcase your expertise to attract the right clients
            </p>

            {/* Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-semibold text-green-800 mb-2 font-poppins">💡 Pro Tips</h3>
              <ul className="text-sm text-green-700 space-y-1 font-inter">
                <li>• Add at least 3 primary skills that you're most confident in</li>
                <li>• Include both technical skills and soft skills</li>
                <li>• Certifications help build credibility with clients</li>
                <li>• You can always add more skills to your profile later</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              {/* Primary Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                  Primary Skills *
                </label>
                
                {/* Skill Input */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('skill')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill('skill')}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('skill', index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {errors.skills && (
                  <p className="text-sm text-red-500 mb-4">{errors.skills}</p>
                )}

                {/* Popular Skills */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 font-inter">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills
                      .filter(skill => !formData.skills.includes(skill))
                      .slice(0, 12)
                      .map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addPopularSkill(skill)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-green-500 hover:text-green-600 transition-colors font-inter"
                          disabled={formData.skills.length >= 15}
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.skills.length}/15 skills selected
                </p>
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                  Certifications (Optional)
                </label>
                
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('certification')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="e.g., AWS Certified Developer, Google Analytics Certified"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill('certification')}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {cert.name}
                      <button
                        onClick={() => removeSkill('certification', index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Link href="/onboarding/step-1">
                <Button variant="outline" className="font-inter">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              </Link>

              <div className="flex items-center space-x-4">
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}
                <Button
                  onClick={handleContinue}
                  disabled={isLoading || formData.skills.length < 3}
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
        </motion.div>
      </div>
    </div>
  );
}
