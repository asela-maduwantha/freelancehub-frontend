'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Folder, Plus, X, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/lib/api';
import { uploadAPI } from '@/lib/api';

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
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

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

    // Debug: Check if file input ref is working
    console.log('File input ref initialized:', fileInputRef.current);
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
    setUploadedImages([]);
    setShowAddForm(false);
    setErrors({});
  };

  const removePortfolioItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('File input changed, files selected:', files);
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    console.log(`Uploading ${files.length} files`);
    setUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      console.log('File array:', fileArray.map(f => ({ name: f.name, size: f.size, type: f.type })));
      const response = await uploadAPI.uploadFiles(fileArray, 'portfolio');
      console.log('Upload response:', response);

      if (response.success && response.data) {
        const urls = response.data.map(item => item.url);
        console.log('Uploaded URLs:', urls);
        setUploadedImages(prev => [...prev, ...urls]);

        // Set the first uploaded image as the main image for the current item
        if (urls.length > 0 && !currentItem.imageUrl) {
          setCurrentItem(prev => ({
            ...prev,
            imageUrl: urls[0]
          }));
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors({ upload: 'Failed to upload images. Please try again.' });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const selectImageForProject = (url: string) => {
    setCurrentItem(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked, triggering file input');
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Save to localStorage for multi-step process
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.portfolio = formData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Navigate to step 4
      router.push('/onboarding/step-4');
    } catch (error) {
      console.error('Error saving data:', error);
      setErrors({ submit: 'Failed to save portfolio data. Please try again.' });
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
                currentStep={3}
                totalSteps={4}
                steps={['Profile', 'Skills', 'Portfolio', 'Complete']}
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
            <p className="text-xl text-gray-600 font-inter mb-8">
              Add portfolio items to demonstrate your expertise
            </p>

            {/* Tips */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
              <h3 className="text-sm font-semibold text-purple-800 mb-2 font-poppins">💡 Pro Tips</h3>
              <ul className="text-sm text-purple-700 space-y-1 font-inter">
                <li>• Include 2-3 of your best projects that showcase different skills</li>
                <li>• Upload screenshots or images to make your portfolio visually appealing</li>
                <li>• Click the upload button to add multiple images for each project</li>
                <li>• Select one image as the main project thumbnail</li>
                <li>• Write clear descriptions that explain the project's impact</li>
                <li>• Include links to live projects when possible</li>
                <li>• You can skip this step and add portfolio items later</li>
              </ul>
            </div>
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

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Images (Optional)
                    </label>
                    <div className="space-y-3">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />

                      {/* File Upload Button */}
                      <Button
                        type="button"
                        onClick={handleUploadClick}
                        variant="outline"
                        className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors"
                        disabled={uploadingImages}
                      >
                        {uploadingImages ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Upload className="h-4 w-4" />
                            <span>Upload Images</span>
                          </div>
                        )}
                      </Button>

                      {/* Test Button for Debugging */}
                      <Button
                        type="button"
                        onClick={() => {
                          console.log('Test button clicked');
                          if (fileInputRef.current) {
                            console.log('File input element found, clicking...');
                            fileInputRef.current.click();
                          } else {
                            console.log('File input ref is null');
                          }
                        }}
                        variant="outline"
                        className="w-full mt-2 text-xs"
                        size="sm"
                      >
                        Test File Input
                      </Button>

                      {/* Upload Error */}
                      {errors.upload && <p className="text-sm text-red-500">{errors.upload}</p>}

                      {/* Uploaded Images Preview */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Uploaded Images:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {uploadedImages.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Uploaded ${index + 1}`}
                                  className={`w-full h-20 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                    currentItem.imageUrl === url
                                      ? 'border-green-500 ring-2 ring-green-200'
                                      : 'border-gray-200 hover:border-green-400'
                                  }`}
                                  onClick={() => selectImageForProject(url)}
                                />
                                <button
                                  onClick={() => removeUploadedImage(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                {currentItem.imageUrl === url && (
                                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-green-600" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Click on an image to select it as the main project image
                          </p>
                        </div>
                      )}

                      {/* Selected Image Display */}
                      {currentItem.imageUrl && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Selected Main Image:</p>
                          <img
                            src={currentItem.imageUrl}
                            alt="Selected project image"
                            className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
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
                        setUploadedImages([]);
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
