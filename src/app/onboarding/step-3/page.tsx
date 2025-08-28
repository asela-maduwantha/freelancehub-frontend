'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Folder, Plus, X, ExternalLink, Upload } from 'lucide-react';
import Link from 'next/link';

interface PortfolioItem {
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  imageUrl: string;
  category: string;
  completionDate: string;
}

interface PortfolioData {
  items: PortfolioItem[];
}

interface FormErrors {
  [key: string]: string;
}

export default function OnboardingStep3() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<PortfolioData>({
    items: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    technologies: [],
    projectUrl: '',
    imageUrl: '',
    category: 'web-development',
    completionDate: ''
  });
  const [newTech, setNewTech] = useState('');

  const categories = [
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'ui-ux-design', label: 'UI/UX Design' },
    { value: 'graphic-design', label: 'Graphic Design' },
    { value: 'content-writing', label: 'Content Writing' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'other', label: 'Other' }
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
    if (onboardingData.portfolio) {
      setFormData(onboardingData.portfolio);
    }
  }, [router]);

  const validateCurrentItem = (): boolean => {
    const newErrors: FormErrors = {};

    if (!currentItem.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!currentItem.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (currentItem.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }

    if (currentItem.technologies.length === 0) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTechnology = () => {
    if (newTech.trim() && !currentItem.technologies.includes(newTech.trim())) {
      setCurrentItem(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTechnology = (index: number) => {
    setCurrentItem(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addPortfolioItem = () => {
    if (!validateCurrentItem()) return;

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, currentItem]
    }));

    // Reset form
    setCurrentItem({
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      imageUrl: '',
      category: 'web-development',
      completionDate: ''
    });
    setShowAddForm(false);
    setErrors({});
  };

  const removePortfolioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Store step 3 data in localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.portfolio = formData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Navigate to step 4
      router.push('/onboarding/step-4');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="FreelanceHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 font-poppins">FreelanceHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Step 3 of 4</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
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
            href="/onboarding/step-2"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6">
              <Folder className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              Showcase your work
            </h1>
            <p className="text-xl text-gray-600 font-inter">
              Add portfolio items to demonstrate your expertise
            </p>
          </div>

          {/* Portfolio Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                Portfolio Items ({formData.items.length})
              </h3>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="font-inter"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Existing Portfolio Items */}
            {formData.items.length > 0 ? (
              <div className="grid gap-6 mb-6">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 font-poppins">{item.title}</h4>
                        <p className="text-sm text-gray-500">
                          {categories.find(c => c.value === item.category)?.label}
                        </p>
                      </div>
                      <button
                        onClick={() => removePortfolioItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 font-inter">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm inline-flex items-center"
                      >
                        View Project <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2 font-poppins">No portfolio items yet</h3>
                <p className="text-gray-500 mb-4 font-inter">
                  Add your best work to showcase your skills to potential clients
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="premium"
                  className="font-poppins"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              </div>
            )}

            {/* Add Portfolio Form */}
            {showAddForm && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 font-poppins">Add Portfolio Item</h4>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={currentItem.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } font-inter`}
                      placeholder="e.g., E-commerce Dashboard"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={currentItem.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      value={currentItem.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } font-inter`}
                      placeholder="Describe what you built and the problem it solved..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technologies Used *
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                        placeholder="e.g., React, Node.js, MongoDB"
                      />
                      <Button
                        type="button"
                        onClick={addTechnology}
                        variant="outline"
                        className="px-3"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentItem.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {tech}
                          <button
                            onClick={() => removeTechnology(index)}
                            className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-green-200"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                    {errors.technologies && <p className="mt-1 text-sm text-red-500">{errors.technologies}</p>}
                  </div>

                  {/* Project URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={currentItem.projectUrl}
                      onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Completion Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={currentItem.completionDate}
                      onChange={(e) => handleInputChange('completionDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={addPortfolioItem}
                      variant="premium"
                      className="font-poppins"
                    >
                      Add Project
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setErrors({});
                        setCurrentItem({
                          title: '',
                          description: '',
                          technologies: [],
                          projectUrl: '',
                          imageUrl: '',
                          category: 'web-development',
                          completionDate: ''
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
              Portfolio items help clients understand your work quality, but you can add them later.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/onboarding/step-2">
              <Button variant="outline" className="font-inter">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>

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
        </motion.div>
      </div>
    </div>
  );
}
