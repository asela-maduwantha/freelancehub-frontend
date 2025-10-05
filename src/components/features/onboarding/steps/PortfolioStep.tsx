'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NavigationButtons from '../NavigationButtons';
import { RootState } from '@/types/store';
import { onboardingActions } from '@/store/slices/onboarding';
import { PortfolioItem } from '@/types/onboarding';
import { freelancerApi } from '@/lib/api/freelancer';

const PortfolioStep: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { progress, isLoading } = useSelector((state: RootState) => state.onboarding);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(
    progress?.formData?.portfolio || []
  );

  const [currentItem, setCurrentItem] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    technologies: [],
    projectUrl: '',
    images: [],
    featured: false,
  });

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = () => {
    setCurrentItem({
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      images: [],
      featured: false,
    });
    setIsAddingItem(true);
    setEditingIndex(null);
    setErrors({});
  };

  const handleEditItem = (index: number) => {
    const item = portfolioItems[index];
    setCurrentItem({ ...item });
    setIsAddingItem(true);
    setEditingIndex(index);
    setErrors({});
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(updatedItems);
  };

  const handleSaveItem = () => {
    const newErrors: Record<string, string> = {};

    if (!currentItem.title?.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!currentItem.description?.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (currentItem.technologies?.length === 0) {
      newErrors.technologies = 'At least one technology is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const itemToSave: PortfolioItem = {
      id: currentItem.id || `portfolio-${Date.now()}`,
      title: currentItem.title!,
      description: currentItem.description!,
      technologies: currentItem.technologies!,
      projectUrl: currentItem.projectUrl || '',
      images: currentItem.images || [],
      featured: currentItem.featured || false,
    };

    let updatedItems;
    if (editingIndex !== null) {
      updatedItems = [...portfolioItems];
      updatedItems[editingIndex] = itemToSave;
    } else {
      updatedItems = [...portfolioItems, itemToSave];
    }

    setPortfolioItems(updatedItems);
    setIsAddingItem(false);
    setEditingIndex(null);
    setCurrentItem({
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      images: [],
      featured: false,
    });
  };

  const handleCancelEdit = () => {
    setIsAddingItem(false);
    setEditingIndex(null);
    setCurrentItem({
      title: '',
      description: '',
      technologies: [],
      projectUrl: '',
      images: [],
      featured: false,
    });
    setErrors({});
  };

  const handleTechnologyChange = (tech: string, checked: boolean) => {
    setCurrentItem(prev => ({
      ...prev,
      technologies: checked
        ? [...(prev.technologies || []), tech]
        : (prev.technologies || []).filter(t => t !== tech),
    }));
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // Save each portfolio item to backend
      for (const item of portfolioItems) {
        await freelancerApi.addPortfolio({
          title: item.title,
          description: item.description,
          images: [], // For now, empty array - can be enhanced later
          url: item.projectUrl,
          technologies: item.technologies,
        });
      }

      // Update Redux state
      dispatch(onboardingActions.updateStep(4, { portfolio: portfolioItems }));

      // Mark step as completed
      dispatch(onboardingActions.completeStep(3));

      // Navigate to next step (payment)
      router.push('/freelancer/onboarding?step=4');
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      setErrors({ submit: 'Failed to save portfolio. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/freelancer/onboarding?step=2');
  };

  const technologyOptions = [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Python', 'JavaScript',
    'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Figma', 'Adobe XD', 'Photoshop',
    'React Native', 'Flutter', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'GraphQL'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Showcase Your Work</h2>
        <p className="text-gray-600">
          Add your best projects to help clients understand your expertise and style.
        </p>
      </div>

      {/* Portfolio Items List */}
      {portfolioItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Portfolio</h3>
          {portfolioItems.map((item, index) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    {item.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.technologies.map(tech => (
                      <span key={tech} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Project →
                    </a>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditItem(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteItem(index)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAddingItem ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit Project' : 'Add New Project'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., E-commerce Website"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what you built, the challenges you faced, and the results..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies Used *
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {technologyOptions.map(tech => (
                  <label key={tech} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(currentItem.technologies || []).includes(tech)}
                      onChange={(e) => handleTechnologyChange(tech, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tech}</span>
                  </label>
                ))}
              </div>
              {errors.technologies && <p className="mt-1 text-sm text-red-600">{errors.technologies}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL (optional)
              </label>
              <input
                type="url"
                value={currentItem.projectUrl || ''}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, projectUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={currentItem.featured || false}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, featured: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Feature this project on my profile
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSaveItem}>
                {editingIndex !== null ? 'Update Project' : 'Add Project'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center py-8">
          <Button onClick={handleAddItem} className="mb-4">
            Add Your First Project
          </Button>
          <p className="text-gray-600 text-sm">
            Show clients examples of your work to build trust and attract opportunities.
          </p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Navigation */}
      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={portfolioItems.length > 0 ? "Continue to Payment Setup" : "Skip for Now"}
        loading={isSaving}
      />
    </div>
  );
};

export default PortfolioStep;