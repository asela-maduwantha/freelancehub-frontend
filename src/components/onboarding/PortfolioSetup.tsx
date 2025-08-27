"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, ArrowLeft, Briefcase, ExternalLink, Github, Eye, Edit2, Trash2 } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import SkillSelector from '@/components/ui/SkillSelector';
import ImageUploader from '@/components/ui/ImageUploader';
import Button from '@/components/ui/Button';
import { PortfolioItemData, PortfolioItem } from '@/types';
import { freelancerApi } from '@/api/services/freelancer';

interface PortfolioSetupProps {
  onSuccess: (portfolioItems: PortfolioItem[]) => void;
  onError: (error: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
  error?: string;
}

const PortfolioSetup = ({ onSuccess, onError, onBack, onSkip }: PortfolioSetupProps) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state for new/edit portfolio item
  const [formData, setFormData] = useState<Partial<PortfolioItemData>>({
    technologies: [],
    links: {},
    images: []
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Graphic Design',
    'Data Science',
    'Content Writing',
    'Digital Marketing',
    'Other'
  ];

  const resetForm = () => {
    setFormData({
      technologies: [],
      links: {},
      images: []
    });
    setImages([]);
    setErrors({});
    setEditingItem(null);
  };

  const handleInputChange = (field: keyof PortfolioItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    if (!formData.description?.trim() || formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (!formData.technologies || formData.technologies.length === 0) {
      newErrors.technologies = 'Please add at least one technology';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.completionDate) {
      newErrors.completionDate = 'Completion date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (img) => {
      if (img.uploaded || img.url) return img.url!;
      
      try {
        const response = await freelancerApi.uploadPortfolioImage(img.file);
        return response.data?.url || '';
      } catch (error) {
        console.error('Failed to upload image:', error);
        return '';
      }
    });
    
    const urls = await Promise.all(uploadPromises);
    return urls.filter(url => url !== '');
  };

  const handleSaveItem = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      const portfolioData: PortfolioItemData = {
        ...formData as PortfolioItemData,
        images: imageUrls.map(url => ({
          id: '',
          filename: '',
          originalName: '',
          mimeType: '',
          size: 0,
          url,
          uploadedAt: new Date().toISOString()
        }))
      };
      
      let response;
      if (editingItem) {
        response = await freelancerApi.updatePortfolioItem(editingItem.id, portfolioData);
      } else {
        response = await freelancerApi.createPortfolioItem(portfolioData);
      }
      
      if (response.success && response.data) {
        if (editingItem) {
          setPortfolioItems(prev => 
            prev.map(item => item.id === editingItem.id ? response.data! : item)
          );
        } else {
          setPortfolioItems(prev => [...prev, response.data!]);
        }
        
        setShowAddForm(false);
        resetForm();
      } else {
        onError(response.error?.message || 'Failed to save portfolio item');
      }
    } catch (error) {
      onError('Failed to save portfolio item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      technologies: item.technologies || [],
      category: item.category,
      completionDate: item.completionDate,
      links: item.links || {}
    });
    
    // Convert existing images to ImageFile format
    const existingImages: ImageFile[] = (item.images || []).map(img => ({
      id: img.id,
      file: new File([], img.filename),
      preview: img.url,
      url: img.url,
      uploaded: true
    }));
    setImages(existingImages);
    
    setShowAddForm(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    
    try {
      await freelancerApi.deletePortfolioItem(itemId);
      setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      onError('Failed to delete portfolio item');
    }
  };

  const handleContinue = () => {
    onSuccess(portfolioItems);
  };

  const renderPortfolioList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Build Your Portfolio
        </h2>
        <p className="text-gray-600">
          Showcase your best work to attract clients. You can always add more projects later.
        </p>
      </div>

      {/* Portfolio Items */}
      {portfolioItems.length > 0 && (
        <div className="space-y-4">
          {portfolioItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.technologies.slice(0, 5).map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                      {item.technologies.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{item.technologies.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {item.links && (
                    <div className="flex space-x-4">
                      {item.links.demo && (
                        <a
                          href={item.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {item.links.github && (
                        <a
                          href={item.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-700 text-sm flex items-center space-x-1"
                        >
                          <Github className="w-3 h-3" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Images preview */}
              {item.images && item.images.length > 0 && (
                <div className="mt-4 flex space-x-2">
                  {item.images.slice(0, 3).map((img, index) => (
                    <img
                      key={index}
                      src={img.thumbnailUrl || img.url}
                      alt={`${item.title} screenshot`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                  {item.images.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                      +{item.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Project Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Skip or Continue */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-x-3">
          {portfolioItems.length === 0 && onSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
            >
              Skip for Now
            </Button>
          )}
          
          <Button
            onClick={handleContinue}
            disabled={portfolioItems.length === 0}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderAddForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {editingItem ? 'Edit Project' : 'Add Portfolio Project'}
        </h3>
        <p className="text-gray-600">
          Showcase your work with detailed project information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Project Title"
          type="text"
          placeholder="My Awesome Project"
          value={formData.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          error={errors.title}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your project, the problem it solved, your approach, and the results..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            {formData.description?.length || 0}/1000 characters
          </span>
          <span className="text-sm text-gray-500">
            Minimum 50 characters
          </span>
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Technologies Used <span className="text-red-500">*</span>
        </label>
        <SkillSelector
          value={formData.technologies || []}
          onChange={(technologies) => handleInputChange('technologies', technologies)}
          error={errors.technologies}
          placeholder="Add technologies, frameworks, tools..."
          maxSkills={20}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          label="Live Demo URL"
          type="url"
          placeholder="https://example.com"
          value={formData.links?.demo || ''}
          onChange={(e) => handleInputChange('links', {
            ...formData.links,
            demo: e.target.value
          })}
          leftIcon={<ExternalLink className="w-4 h-4" />}
        />

        <FormField
          label="GitHub URL"
          type="url"
          placeholder="https://github.com/username/repo"
          value={formData.links?.github || ''}
          onChange={(e) => handleInputChange('links', {
            ...formData.links,
            github: e.target.value
          })}
          leftIcon={<Github className="w-4 h-4" />}
        />

        <FormField
          label="Completion Date"
          type="date"
          value={formData.completionDate || ''}
          onChange={(e) => handleInputChange('completionDate', e.target.value)}
          error={errors.completionDate}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Project Images
        </label>
        <ImageUploader
          value={images}
          onChange={setImages}
          maxImages={5}
          maxSizeKB={3000}
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => {
            setShowAddForm(false);
            resetForm();
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSaveItem}
          disabled={loading}
        >
          {loading ? 'Saving...' : editingItem ? 'Update Project' : 'Add Project'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {showAddForm ? renderAddForm() : renderPortfolioList()}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioSetup;
