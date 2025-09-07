'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, GraduationCap, Plus, X } from 'lucide-react';
import Link from 'next/link';

interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationData {
  items: EducationItem[];
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<EducationData>({
    items: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<EducationItem>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/register');
    }

    // Load existing data if any
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (onboardingData.education) {
      setFormData(onboardingData.education);
    }
  }, [router]);

  const validateCurrentItem = (): boolean => {
    const newErrors: FormErrors = {};

    if (!currentItem.institution.trim()) {
      newErrors.institution = 'Institution is required';
    }

    if (!currentItem.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!currentItem.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }

    if (!currentItem.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!currentItem.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (currentItem.startDate && currentItem.endDate && currentItem.startDate > currentItem.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addEducationItem = () => {
    if (!validateCurrentItem()) return;

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, currentItem]
    }));

    // Reset form
    setCurrentItem({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removeEducationItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Save to localStorage for multi-step process
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.education = formData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Navigate to step 5
      router.push('/onboarding/step-5');
    } catch (error) {
      console.error('Error saving data:', error);
      setErrors({ submit: 'Failed to save education data. Please try again.' });
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
                currentStep={4}
                totalSteps={5}
                steps={['Profile', 'Skills', 'Portfolio', 'Education', 'Complete']}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link
            href="/onboarding/step-3"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              Tell us about your education
            </h1>
            <p className="text-xl text-gray-600 font-inter mb-8">
              Add your educational background to build credibility
            </p>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 font-poppins">💡 Pro Tips</h3>
              <ul className="text-sm text-blue-700 space-y-1 font-inter">
                <li>• Include relevant degrees and certifications</li>
                <li>• Add your most recent education first</li>
                <li>• Mention honors, GPA, or notable achievements</li>
                <li>• You can skip this step and add education later</li>
              </ul>
            </div>
          </div>

          {/* Education Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                Education ({formData.items.length})
              </h3>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="font-inter"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>

            {/* Existing Education Items */}
            {formData.items.length > 0 ? (
              <div className="grid gap-6 mb-6">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 font-poppins">{item.degree}</h4>
                        <p className="text-sm text-gray-500">{item.institution}</p>
                        <p className="text-sm text-gray-500">{item.fieldOfStudy}</p>
                        <p className="text-sm text-gray-500">
                          {item.startDate} - {item.endDate}
                        </p>
                      </div>
                      <button
                        onClick={() => removeEducationItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 text-sm font-inter">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-poppins">No education added yet</h3>
                <p className="text-gray-500 mb-4 font-inter">
                  Add your educational background to showcase your qualifications
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="premium"
                  className="font-poppins"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your Education
                </Button>
              </div>
            )}

            {/* Add Education Form */}
            {showAddForm && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 font-poppins">Add Education</h4>
                <div className="space-y-4">
                  {/* Institution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution *
                    </label>
                    <input
                      type="text"
                      value={currentItem.institution}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.institution ? 'border-red-500' : 'border-gray-300'
                      } font-inter`}
                      placeholder="e.g., University of Colombo"
                    />
                    {errors.institution && <p className="mt-1 text-sm text-red-500">{errors.institution}</p>}
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={currentItem.degree}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.degree ? 'border-red-500' : 'border-gray-300'
                      } font-inter`}
                      placeholder="e.g., Bachelor of Science"
                    />
                    {errors.degree && <p className="mt-1 text-sm text-red-500">{errors.degree}</p>}
                  </div>

                  {/* Field of Study */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      value={currentItem.fieldOfStudy}
                      onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.fieldOfStudy ? 'border-red-500' : 'border-gray-300'
                      } font-inter`}
                      placeholder="e.g., Computer Science"
                    />
                    {errors.fieldOfStudy && <p className="mt-1 text-sm text-red-500">{errors.fieldOfStudy}</p>}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={currentItem.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        } font-inter`}
                      />
                      {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={currentItem.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        } font-inter`}
                      />
                      {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={currentItem.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-inter"
                      placeholder="Describe your studies, achievements, or relevant coursework..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={addEducationItem}
                      variant="premium"
                      className="font-poppins"
                    >
                      Add Education
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setErrors({});
                        setCurrentItem({
                          institution: '',
                          degree: '',
                          fieldOfStudy: '',
                          startDate: '',
                          endDate: '',
                          description: ''
                        });
                      }}
                      variant="outline"
                      className="font-inter"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm font-inter">
              Education helps build credibility, but you can add it later.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/onboarding/step-3">
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
        </motion.div>
      </div>
    </div>
  );
}
