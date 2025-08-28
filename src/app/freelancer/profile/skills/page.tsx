'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Award, 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Search
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

export default function SkillsManagement() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'PHP',
    'HTML', 'CSS', 'Vue.js', 'Angular', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS',
    'Docker', 'Kubernetes', 'Git', 'Figma', 'Photoshop', 'Illustrator'
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setSkills(userData.profile?.skills || []);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        profile: {
          ...user?.profile,
          skills: skills
        }
      };

      await freelancerAPI.updateProfile(updateData);
      setSuccess('Skills updated successfully!');
      
      if (user) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...updateData.profile
          }
        });
      }
    } catch (err: any) {
      console.error('Failed to update skills:', err);
      setError(err.message || 'Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-6">
            <Link 
              href="/freelancer/profile"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Skills & Expertise</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {/* Main Skills Management */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Your Skills</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-3 mb-6">
                {filteredSkills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}

                {filteredSkills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No skills found. Add some skills to showcase your expertise!</p>
                  </div>
                )}
              </div>

              {/* Add New Skill */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Skill</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter skill name..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Skills'}</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Popular Skills Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Popular Skills */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        if (!skills.includes(skill)) {
                          setSkills(prev => [...prev, skill]);
                        }
                      }}
                      disabled={skills.includes(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        skills.includes(skill)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Tips */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Skills Tips</h3>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li>• Focus on skills that match your target projects</li>
                  <li>• Be honest about your skill levels</li>
                  <li>• Update skills regularly as you learn new technologies</li>
                  <li>• Highlight your most in-demand skills first</li>
                </ul>
              </div>

              {/* Skills Statistics */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">Your Skills Summary</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Total Skills:</span>
                    <span className="font-medium">{skills.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Popular Skills:</span>
                    <span className="font-medium">
                      {skills.filter(skill => popularSkills.includes(skill)).length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
