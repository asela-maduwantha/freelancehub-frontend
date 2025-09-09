'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import FileUpload from '@/components/ui/FileUpload';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

interface PortfolioFormData {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

export default function PortfolioStep() {
  const { formData, updateFormData } = useOnboardingStore();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formDataLocal, setFormDataLocal] = useState<PortfolioFormData>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const resetForm = () => {
    setFormDataLocal({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      tags: [],
    });
    setTagInput('');
  };

  const handleAddPortfolioItem = () => {
    if (!formDataLocal.title.trim() || !formDataLocal.description.trim()) {
      return; // Don't add if required fields are empty
    }

    const newItem = {
      ...formDataLocal,
      tags: [...formDataLocal.tags],
    };

    const currentPortfolio = formData.portfolio || [];
    const updatedPortfolio = [...currentPortfolio, newItem];

    updateFormData({ portfolio: updatedPortfolio });
    resetForm();
    setIsAddingItem(false);
  };

  const handleEditPortfolioItem = (index: number) => {
    const item = (formData.portfolio || [])[index];
    setFormDataLocal({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl || '',
      projectUrl: item.projectUrl || '',
      tags: [...(item.tags || [])],
    });
    setEditingIndex(index);
    setIsAddingItem(true);
  };

  const handleUpdatePortfolioItem = () => {
    if (!formDataLocal.title.trim() || !formDataLocal.description.trim()) {
      return;
    }

    if (editingIndex === null) return;

    const currentPortfolio = formData.portfolio || [];
    const updatedPortfolio = [...currentPortfolio];
    updatedPortfolio[editingIndex] = {
      ...formDataLocal,
      tags: [...formDataLocal.tags],
    };

    updateFormData({ portfolio: updatedPortfolio });
    resetForm();
    setIsAddingItem(false);
    setEditingIndex(null);
  };

  const handleDeletePortfolioItem = (index: number) => {
    const currentPortfolio = formData.portfolio || [];
    const updatedPortfolio = currentPortfolio.filter((_, i) => i !== index);
    updateFormData({ portfolio: updatedPortfolio });
  };

  const handleFileUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormDataLocal(prev => ({
        ...prev,
        imageUrl: urls[0], // Use the first uploaded file as the main image
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formDataLocal.tags.includes(tagInput.trim())) {
      setFormDataLocal(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormDataLocal(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingItem(false);
    setEditingIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Showcase Your Work
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add your portfolio items with detailed information to help clients understand your work better.
        </p>
      </div>

      {/* Add New Portfolio Item Button */}
      {!isAddingItem && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsAddingItem(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Portfolio Item
        </motion.button>
      )}

      {/* Portfolio Item Form */}
      {isAddingItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            {editingIndex !== null ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
          </h4>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formDataLocal.title}
                onChange={(e) => setFormDataLocal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., E-commerce Website"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={formDataLocal.description}
                onChange={(e) => setFormDataLocal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project, your role, and the technologies used..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Project URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project URL (optional)
              </label>
              <input
                type="url"
                value={formDataLocal.projectUrl}
                onChange={(e) => setFormDataLocal(prev => ({ ...prev, projectUrl: e.target.value }))}
                placeholder="https://example.com/project"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
              {formDataLocal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formDataLocal.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Image (optional)
              </label>
              <FileUpload
                onUpload={handleFileUpload}
                multiple={false}
                accept="image/*"
                folder="portfolio"
                maxFiles={1}
                className="h-32"
              />
              {formDataLocal.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formDataLocal.imageUrl}
                    alt="Portfolio preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={editingIndex !== null ? handleUpdatePortfolioItem : handleAddPortfolioItem}
              disabled={!formDataLocal.title.trim() || !formDataLocal.description.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Update Item' : 'Add Item'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Portfolio Items List */}
      {formData.portfolio && formData.portfolio.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Portfolio Items ({formData.portfolio.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.portfolio.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditPortfolioItem(index)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePortfolioItem(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {item.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {item.projectUrl && (
                  <div className="mt-2">
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                    >
                      View Project →
                    </a>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💼 Portfolio tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Add 3-5 of your best projects to showcase your skills</li>
          <li>• Include detailed descriptions of your role and technologies used</li>
          <li>• Add relevant tags to help with searchability</li>
          <li>• Upload high-quality images or screenshots of your work</li>
          <li>• Include live project URLs when available</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
