'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Tag,
  X
} from 'lucide-react';
import Link from 'next/link';
import { authAPI, freelancerAPI } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profile?: {
    bio?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: string;
    title?: string;
    experience?: string;
    languages?: string[];
    timezone?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  phone?: string;
}

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  imageUrl?: string;
  category: string;
  completionDate: string;
}

export default function PortfolioManagement() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [newItem, setNewItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    technologies: [],
    projectUrl: '',
    imageUrl: '',
    category: '',
    completionDate: ''
  });

  const categories = [
    'web-development',
    'mobile-development',
    'design',
    'writing',
    'marketing',
    'data-analysis',
    'other'
  ];

  const categoryLabels = {
    'web-development': 'Web Development',
    'mobile-development': 'Mobile Development',
    'design': 'Design & Creative',
    'writing': 'Writing & Content',
    'marketing': 'Marketing',
    'data-analysis': 'Data Analysis',
    'other': 'Other'
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        // In a real app, you'd fetch portfolio items from the API
        setPortfolioItems([]);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleAddItem = () => {
    if (newItem.title && newItem.description && newItem.category) {
      const itemToAdd = {
        ...newItem,
        id: Date.now().toString() // In real app, this would come from the API
      };
      setPortfolioItems(prev => [...prev, itemToAdd]);
      setNewItem({
        title: '',
        description: '',
        technologies: [],
        projectUrl: '',
        imageUrl: '',
        category: '',
        completionDate: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setNewItem(item);
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.title && newItem.description && newItem.category) {
      setPortfolioItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...newItem, id: item.id } : item
      ));
      setNewItem({
        title: '',
        description: '',
        technologies: [],
        projectUrl: '',
        imageUrl: '',
        category: '',
        completionDate: ''
      });
      setEditingItem(null);
      setShowAddForm(false);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleTechnologyChange = (tech: string) => {
    const currentTechs = newItem.technologies;
    if (currentTechs.includes(tech)) {
      setNewItem(prev => ({
        ...prev,
        technologies: currentTechs.filter(t => t !== tech)
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        technologies: [...currentTechs, tech]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, you'd save portfolio items to the API
      // await freelancerAPI.updatePortfolio(portfolioItems);
      setSuccess('Portfolio updated successfully!');
    } catch (err: any) {
      console.error('Failed to update portfolio:', err);
      setError(err.message || 'Failed to update portfolio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please log in to edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/freelancer/profile"
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Profile</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Items */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {portfolioItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
                  <p className="text-gray-600 mb-4">
                    Start building your portfolio by adding your best projects and work samples.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                  >
                    Add Your First Project
                  </button>
                </div>
              ) : (
                portfolioItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Tag className="w-4 h-4" />
                            <span>{categoryLabels[item.category as keyof typeof categoryLabels]}</span>
                          </span>
                          {item.completionDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(item.completionDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id!)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{item.description}</p>

                    {item.technologies.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {item.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.projectUrl && (
                      <a
                        href={item.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Project</span>
                      </a>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6 sticky top-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingItem ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      setNewItem({
                        title: '',
                        description: '',
                        technologies: [],
                        projectUrl: '',
                        imageUrl: '',
                        category: '',
                        completionDate: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe your project..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'AWS'].map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => handleTechnologyChange(tech)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            newItem.technologies.includes(tech)
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project URL (optional)
                    </label>
                    <input
                      type="url"
                      value={newItem.projectUrl}
                      onChange={(e) => setNewItem(prev => ({ ...prev, projectUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={newItem.completionDate}
                      onChange={(e) => setNewItem(prev => ({ ...prev, completionDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    disabled={!newItem.title || !newItem.description || !newItem.category}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'Update Project' : 'Add Project'}</span>
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {/* Tips Sidebar */}
          {!showAddForm && (
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-orange-900 mb-4">Portfolio Tips</h3>
                  <ul className="space-y-3 text-sm text-orange-800">
                    <li>• Showcase your best and most recent work</li>
                    <li>• Include detailed descriptions of your role and contributions</li>
                    <li>• Highlight the technologies and tools you used</li>
                    <li>• Add live links when possible</li>
                    <li>• Keep your portfolio updated with new projects</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Portfolio Statistics</h3>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Total Projects:</span>
                      <span className="font-medium">{portfolioItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">
                        {new Set(portfolioItems.map(item => item.category)).size}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
