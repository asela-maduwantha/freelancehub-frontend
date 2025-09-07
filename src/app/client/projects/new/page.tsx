'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { clientsService } from '@/lib/api';
import { CreateProjectRequest } from '@/lib/types/api/requests.types';

interface ProjectData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  requiredSkills: string[];
  type: 'fixed' | 'hourly';
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly';
  };
  timeline: {
    deadline: string;
    duration: number;
    isUrgent: boolean;
    isFlexible: boolean;
  };
  requirements: {
    experienceLevel: 'entry' | 'intermediate' | 'expert';
    minimumRating: number;
    minimumCompletedProjects: number;
    preferredLanguages: string[];
    preferredCountries: string[];
  };
  visibility: 'public' | 'private';
  tags: string[];
}

interface FormErrors {
  [key: string]: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<ProjectData>({
    title: '',
    description: '',
    category: 'technology',
    subcategory: 'web-development',
    requiredSkills: [],
    type: 'fixed',
    budget: {
      amount: 500,
      currency: 'USD',
      type: 'fixed'
    },
    timeline: {
      deadline: '',
      duration: 30,
      isUrgent: false,
      isFlexible: true
    },
    requirements: {
      experienceLevel: 'intermediate',
      minimumRating: 4.5,
      minimumCompletedProjects: 5,
      preferredLanguages: ['English'],
      preferredCountries: []
    },
    visibility: 'public',
    tags: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'technology', label: 'Technology', subcategories: ['web-development', 'mobile-development', 'software-development', 'data-science', 'ai-ml', 'devops'] },
    { value: 'design', label: 'Design', subcategories: ['ui-ux', 'graphic-design', 'branding', 'web-design', 'mobile-design'] },
    { value: 'writing', label: 'Writing', subcategories: ['content-writing', 'copywriting', 'technical-writing', 'blog-writing', 'creative-writing'] },
    { value: 'marketing', label: 'Marketing', subcategories: ['digital-marketing', 'seo', 'social-media', 'content-marketing', 'email-marketing'] },
    { value: 'business', label: 'Business', subcategories: ['consulting', 'project-management', 'business-analysis', 'strategy'] },
    { value: 'other', label: 'Other', subcategories: ['other'] }
  ];

  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'HTML/CSS',
    'UI/UX Design', 'Figma', 'Adobe Photoshop', 'Content Writing',
    'SEO', 'Digital Marketing', 'WordPress', 'Shopify'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  // Update subcategory when category changes
  useEffect(() => {
    const categoryData = categories.find(cat => cat.value === formData.category);
    if (categoryData && categoryData.subcategories.length > 0) {
      setFormData(prev => ({
        ...prev,
        subcategory: prev.subcategory || categoryData.subcategories[0]
      }));
    }
  }, [formData.category]);

  // Auto-calculate deadline when duration changes
  useEffect(() => {
    if (formData.timeline.duration > 0) {
      const today = new Date();
      const deadline = new Date(today);
      deadline.setDate(today.getDate() + formData.timeline.duration);
      const deadlineString = deadline.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      setFormData(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          deadline: deadlineString
        }
      }));
    }
  }, [formData.timeline.duration]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }

    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = 'At least one skill is required';
    }

    if (formData.budget.amount < 50) {
      newErrors.budget = 'Budget should be at least $50';
    }

    if (formData.timeline.duration <= 0) {
      newErrors.duration = 'Project duration should be at least 1 day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProjectData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }));
  };

  const addPopularSkill = (skill: string) => {
    if (!formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const apiProjectData: CreateProjectRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        requiredSkills: formData.requiredSkills,
        type: formData.type,
        budget: {
          amount: formData.budget.amount,
          currency: formData.budget.currency,
          type: formData.budget.type
        },
        timeline: {
          deadline: formData.timeline.deadline,
          duration: formData.timeline.duration,
          isUrgent: formData.timeline.isUrgent,
          isFlexible: formData.timeline.isFlexible
        },
        requirements: {
          experienceLevel: formData.requirements.experienceLevel,
          minimumRating: formData.requirements.minimumRating,
          minimumCompletedProjects: formData.requirements.minimumCompletedProjects,
          preferredLanguages: formData.requirements.preferredLanguages,
          preferredCountries: formData.requirements.preferredCountries
        },
        visibility: formData.visibility,
        tags: formData.tags
      };

      await clientsService.createProject(apiProjectData);
      router.push('/client/dashboard?created=true');
      
    } catch (error: any) {
      console.error('Project creation failed:', error);
      setErrors({ submit: error.message || 'Failed to create project. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              Post a New Project
            </h1>
            <p className="text-xl text-gray-600 font-inter">
              Describe your project and start receiving proposals from talented freelancers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Basic Information</h3>
                
                {/* Title */}
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } font-inter`}
                    placeholder="e.g., Build a Modern E-commerce Website"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="mb-6">
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                  >
                    {categories.find(cat => cat.value === formData.category)?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    id="description"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    } font-inter`}
                    placeholder="Describe your project in detail. What do you need? What are the requirements? What should the final deliverable look like?"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/1000 characters
                  </p>
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Skills Required</h3>
                
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {errors.requiredSkills && (
                  <p className="text-sm text-red-500 mb-4">{errors.requiredSkills}</p>
                )}

                {/* Popular Skills */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills
                      .filter(skill => !formData.requiredSkills.includes(skill))
                      .slice(0, 8)
                      .map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addPopularSkill(skill)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-green-500 hover:text-green-600 transition-colors font-inter"
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Tags</h3>
                
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    placeholder="Type a tag and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Popular Tags */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {['ecommerce', 'react', 'nodejs', 'mongodb', 'responsive', 'seo', 'api', 'database', 'frontend', 'backend']
                      .filter(tag => !formData.tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (!formData.tags.includes(tag)) {
                              setFormData(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag]
                              }));
                            }
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors font-inter"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Budget & Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Budget & Timeline</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Project Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Project Type *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="fixed"
                          checked={formData.type === 'fixed'}
                          onChange={(e) => {
                            handleInputChange('type', e.target.value);
                            handleInputChange('budget.type', e.target.value);
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">Fixed Price</div>
                          <div className="text-sm text-gray-500">One-time payment for the entire project</div>
                        </div>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="hourly"
                          checked={formData.type === 'hourly'}
                          onChange={(e) => {
                            handleInputChange('type', e.target.value);
                            handleInputChange('budget.type', e.target.value);
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">Hourly Rate</div>
                          <div className="text-sm text-gray-500">Pay by the hour</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        id="budget"
                        min="50"
                        value={formData.budget.amount}
                        onChange={(e) => handleInputChange('budget.amount', parseInt(e.target.value) || 0)}
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.budget ? 'border-red-500' : 'border-gray-300'
                        } font-inter`}
                      />
                    </div>
                    {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (days) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      value={formData.timeline.duration}
                      onChange={(e) => handleInputChange('timeline.duration', parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    />
                  </div>

                  {/* Is Urgent */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is Urgent?
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isUrgent"
                        checked={formData.timeline.isUrgent}
                        onChange={(e) => handleInputChange('timeline.isUrgent', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isUrgent" className="ml-2 text-sm text-gray-700">
                        Yes, this is urgent
                      </label>
                    </div>
                  </div>

                  {/* Is Flexible */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is Flexible?
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFlexible"
                        checked={formData.timeline.isFlexible}
                        onChange={(e) => handleInputChange('timeline.isFlexible', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isFlexible" className="ml-2 text-sm text-gray-700">
                        Flexible deadline
                      </label>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mt-6">
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Project Deadline (Auto-calculated from duration)
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={formData.timeline.deadline}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-inter"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Deadline is automatically calculated when you set the duration above
                  </p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Requirements</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Experience Level */}
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      id="experienceLevel"
                      value={formData.requirements.experienceLevel}
                      onChange={(e) => handleInputChange('requirements.experienceLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label htmlFor="minimumRating" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating *
                    </label>
                    <input
                      type="number"
                      id="minimumRating"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.requirements.minimumRating}
                      onChange={(e) => handleInputChange('requirements.minimumRating', parseFloat(e.target.value) || 4.0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    />
                  </div>

                  {/* Minimum Completed Projects */}
                  <div>
                    <label htmlFor="minimumCompletedProjects" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Completed Projects *
                    </label>
                    <input
                      type="number"
                      id="minimumCompletedProjects"
                      min="0"
                      value={formData.requirements.minimumCompletedProjects}
                      onChange={(e) => handleInputChange('requirements.minimumCompletedProjects', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility *
                    </label>
                    <select
                      id="visibility"
                      value={formData.visibility}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-inter"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Languages */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Hindi']
                      .map((language) => (
                        <label key={language} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.requirements.preferredLanguages.includes(language)}
                            onChange={(e) => {
                              const current = formData.requirements.preferredLanguages;
                              if (e.target.checked) {
                                handleInputChange('requirements.preferredLanguages', [...current, language]);
                              } else {
                                handleInputChange('requirements.preferredLanguages', current.filter(l => l !== language));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{language}</span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Preferred Countries */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Countries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'India', 'Brazil']
                      .map((country) => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.requirements.preferredCountries.includes(country)}
                            onChange={(e) => {
                              const current = formData.requirements.preferredCountries;
                              if (e.target.checked) {
                                handleInputChange('requirements.preferredCountries', [...current, country]);
                              } else {
                                handleInputChange('requirements.preferredCountries', current.filter(c => c !== country));
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{country}</span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="text-center text-red-500 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/client/dashboard">
                  <Button variant="outline" className="font-inter">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="premium"
                  size="lg"
                  className="font-poppins"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Project...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Post Project</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
