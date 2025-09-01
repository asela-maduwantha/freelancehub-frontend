'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Code, X, Plus, Award } from 'lucide-react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';

interface SkillsData {
  primarySkills: string[];
  secondarySkills: string[];
  certifications: string[];
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<SkillsData>({
    primarySkills: [],
    secondarySkills: [],
    certifications: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSecondarySkill, setNewSecondarySkill] = useState('');
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

    if (formData.primarySkills.length < 3) {
      newErrors.primarySkills = 'Please add at least 3 primary skills';
    } else if (formData.primarySkills.length > 10) {
      newErrors.primarySkills = 'Maximum 10 primary skills allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSkill = (type: 'primary' | 'secondary' | 'certification') => {
    const skillInput = type === 'primary' ? newSkill : 
                      type === 'secondary' ? newSecondarySkill : newCertification;
    
    if (!skillInput.trim()) return;

    const currentSkills = formData[type === 'primary' ? 'primarySkills' : 
                               type === 'secondary' ? 'secondarySkills' : 'certifications'];
    
    if (!currentSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        [type === 'primary' ? 'primarySkills' : 
         type === 'secondary' ? 'secondarySkills' : 'certifications']: 
          [...currentSkills, skillInput.trim()]
      }));
    }

    if (type === 'primary') setNewSkill('');
    else if (type === 'secondary') setNewSecondarySkill('');
    else setNewCertification('');
  };

  const removeSkill = (type: 'primary' | 'secondary' | 'certification', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type === 'primary' ? 'primarySkills' : 
       type === 'secondary' ? 'secondarySkills' : 'certifications']: 
        prev[type === 'primary' ? 'primarySkills' : 
            type === 'secondary' ? 'secondarySkills' : 'certifications'].filter((_, i) => i !== index)
    }));
  };

  const addPopularSkill = (skill: string) => {
    if (!formData.primarySkills.includes(skill) && formData.primarySkills.length < 10) {
      setFormData(prev => ({
        ...prev,
        primarySkills: [...prev.primarySkills, skill]
      }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Update freelancer profile with skills data
      const freelancerProfileData = {
        skills: [...formData.primarySkills, ...formData.secondarySkills],
        certifications: formData.certifications.map(cert => ({
          name: cert,
          issuer: 'Self-certified', // Default value
          date: new Date().toISOString()
        }))
      };

      await userAPI.updateFreelancerProfile(freelancerProfileData);

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
              <div className="text-sm text-gray-600">Step 2 of 4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
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
            <p className="text-xl text-gray-600 font-inter">
              Showcase your expertise to attract the right clients
            </p>
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
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('primary')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill('primary')}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.primarySkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('primary', index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {errors.primarySkills && (
                  <p className="text-sm text-red-500 mb-4">{errors.primarySkills}</p>
                )}

                {/* Popular Skills */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 font-inter">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills
                      .filter(skill => !formData.primarySkills.includes(skill))
                      .slice(0, 12)
                      .map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addPopularSkill(skill)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-green-500 hover:text-green-600 transition-colors font-inter"
                          disabled={formData.primarySkills.length >= 10}
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.primarySkills.length}/10 skills selected
                </p>
              </div>

              {/* Secondary Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 font-poppins">
                  Secondary Skills (Optional)
                </label>
                
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newSecondarySkill}
                    onChange={(e) => setNewSecondarySkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill('secondary')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="Additional skills you have"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill('secondary')}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.secondarySkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill('secondary', index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
                      {cert}
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

              <Button
                onClick={handleContinue}
                disabled={isLoading || formData.primarySkills.length < 3}
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
        </motion.div>
      </div>
    </div>
  );
}
