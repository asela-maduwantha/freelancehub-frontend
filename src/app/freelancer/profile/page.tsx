'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Edit,
  Camera,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Award,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Upload,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { usersService } from '@/lib/api';

interface FreelancerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  experience: 'entry' | 'intermediate' | 'expert';
  portfolioUrl?: string;
  location?: string;
  timezone?: string;
  languages: string[];
  availability: 'available' | 'busy' | 'unavailable';
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  stats: {
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: string;
    successRate: number;
  };
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    url?: string;
    tags: string[];
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [editForm, setEditForm] = useState<{
    title: string;
    bio: string;
    skills: string[];
    hourlyRate: number;
    experience: 'entry' | 'intermediate' | 'expert';
    portfolioUrl: string;
    location: string;
    availability: 'available' | 'busy' | 'unavailable';
    socialLinks: {
      github: string;
      linkedin: string;
      twitter: string;
      website: string;
    };
  }>({
    title: '',
    bio: '',
    skills: [],
    hourlyRate: 0,
    experience: 'intermediate',
    portfolioUrl: '',
    location: '',
    availability: 'available',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [showToast, setShowToast] = useState<((toast: any) => void) | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    // Safely get the toast function after mounting
    try {
      const { showToast: toastFn } = useToast();
      setShowToast(() => toastFn);
    } catch (error) {
      // Toast context not available during SSR
      console.warn('Toast context not available');
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get profile from API
      const userProfile = await usersService.getProfile();
      
      // Map API response to frontend interface
      const mappedProfile: FreelancerProfile = {
        id: userProfile._id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        avatar: userProfile.profilePicture,
        title: userProfile.freelancerProfile?.title || '',
        bio: userProfile.freelancerProfile?.bio || '',
        skills: userProfile.freelancerProfile?.skills || [],
        hourlyRate: userProfile.freelancerProfile?.hourlyRate || 0,
        experience: (userProfile.freelancerProfile?.experience as 'entry' | 'intermediate' | 'expert') || 'intermediate',
        portfolioUrl: userProfile.freelancerProfile?.portfolio?.[0]?.url || '',
        location: userProfile.location ? `${userProfile.location.city}, ${userProfile.location.country}` : '',
        timezone: userProfile.location?.timezone || '',
        languages: userProfile.languages?.map(lang => `${lang.language} (${lang.proficiency})`) || [],
        availability: (userProfile.freelancerProfile?.availability as 'available' | 'busy' | 'unavailable') || 'available',
        socialLinks: {
          github: '',
          linkedin: '',
          twitter: '',
          website: userProfile.freelancerProfile?.portfolio?.[0]?.url || ''
        },
        stats: {
          completedProjects: userProfile.stats?.projectsCompleted || 0,
          totalEarnings: userProfile.stats?.totalEarnings || 0,
          averageRating: userProfile.stats?.avgRating || 0,
          responseTime: `${userProfile.stats?.responseTime || 0}h`,
          successRate: userProfile.stats?.completionRate || 0
        },
        certifications: userProfile.freelancerProfile?.certifications?.map(cert => ({
          id: cert.name, // Using name as ID for now
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url
        })) || [],
        portfolio: userProfile.freelancerProfile?.portfolio?.map(item => ({
          id: item.title, // Using title as ID for now
          title: item.title,
          description: item.description,
          image: item.images?.[0] || '',
          url: item.url,
          tags: item.tags || []
        })) || []
      };
      
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      
      // Fallback to mock data if API fails
      const mockProfile: FreelancerProfile = {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        title: 'Full Stack Developer & UI/UX Designer',
        bio: 'Passionate full-stack developer with 5+ years of experience creating beautiful, functional web applications. I specialize in React, Node.js, and modern design principles. I love turning complex problems into simple, beautiful solutions.',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Figma', 'UI/UX Design'],
        hourlyRate: 75,
        experience: 'expert',
        portfolioUrl: 'https://sarahjohnson.dev',
        location: 'San Francisco, CA',
        timezone: 'PST (UTC-8)',
        languages: ['English (Native)', 'Spanish (Conversational)'],
        availability: 'available',
        socialLinks: {
          github: 'https://github.com/sarahjohnson',
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: 'https://twitter.com/sarahjohnson',
          website: 'https://sarahjohnson.dev'
        },
        stats: {
          completedProjects: 47,
          totalEarnings: 125000,
          averageRating: 4.9,
          responseTime: '2h',
          successRate: 98
        },
        certifications: [
          {
            id: '1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2023-06-15',
            url: 'https://aws.amazon.com/certification/'
          },
          {
            id: '2',
            name: 'Google Cloud Professional Developer',
            issuer: 'Google Cloud',
            date: '2023-03-20',
            url: 'https://cloud.google.com/certification/'
          }
        ],
        portfolio: [
          {
            id: '1',
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce solution built with React, Node.js, and PostgreSQL. Features include payment processing, inventory management, and admin dashboard.',
            image: '/api/placeholder/400/300',
            url: 'https://ecommerce-demo.com',
            tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe']
          },
          {
            id: '2',
            title: 'Task Management App',
            description: 'Collaborative task management application with real-time updates, team management, and progress tracking.',
            image: '/api/placeholder/400/300',
            url: 'https://taskmanager-demo.com',
            tags: ['React', 'Socket.io', 'MongoDB', 'Express']
          }
        ]
      };
      setProfile(mockProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // API call to update profile
      const response = await fetch('/api/users/freelancer-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        showToast?.({ title: 'Success', message: 'Profile updated successfully', type: 'success' });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      showToast?.({ title: 'Error', message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current profile values
    if (profile) {
      setEditForm({
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills,
        hourlyRate: profile.hourlyRate,
        experience: profile.experience,
        portfolioUrl: profile.portfolioUrl || '',
        location: profile.location || '',
        availability: profile.availability,
        socialLinks: {
          github: profile.socialLinks.github || '',
          linkedin: profile.socialLinks.linkedin || '',
          twitter: profile.socialLinks.twitter || '',
          website: profile.socialLinks.website || ''
        }
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Initialize edit form with current profile values
    if (profile) {
      setEditForm({
        title: profile.title,
        bio: profile.bio,
        skills: profile.skills,
        hourlyRate: profile.hourlyRate,
        experience: profile.experience,
        portfolioUrl: profile.portfolioUrl || '',
        location: profile.location || '',
        availability: profile.availability,
        socialLinks: {
          github: profile.socialLinks.github || '',
          linkedin: profile.socialLinks.linkedin || '',
          twitter: profile.socialLinks.twitter || '',
          website: profile.socialLinks.website || ''
        }
      });
    }
  };

  const handleAddSkill = (newSkill: string) => {

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // API call to update profile
      const response = await fetch('/api/users/freelancer-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      showToast?.({ title: 'Success', message: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      loadProfile(); // Reload profile data

    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast?.({ title: 'Error', message: 'Failed to save profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !editForm.skills.includes(newSkill)) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
        <p className="text-gray-600 mb-6">We couldn't load your profile information.</p>
        <Button onClick={loadProfile}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 font-inter">
              Manage your freelancer profile and showcase your skills
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/freelancer/profile/preview`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </Button>
            </Link>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="premium"
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="premium"
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 shadow-sm hover:bg-gray-50">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {profile.firstName} {profile.lastName}
                </h2>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-center text-gray-600 border border-gray-300 rounded-lg px-3 py-2 mb-4"
                    placeholder="Professional title"
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{profile.title}</p>
                )}

                <div className="flex items-center justify-center mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{profile.stats.averageRating}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({profile.stats.completedProjects} projects)
                  </span>
                </div>

                <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1 text-center"
                      placeholder="Location"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>

                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{profile.timezone}</span>
                </div>

                <div className="flex items-center justify-center text-lg font-bold text-green-600 mb-4">
                  <DollarSign className="h-5 w-5" />
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.hourlyRate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <span>{profile.hourlyRate}</span>
                  )}
                  <span className="text-sm text-gray-600 ml-1">/hour</span>
                </div>

                {/* Availability Status */}
                <div className="mb-4">
                  {isEditing ? (
                    <select
                      value={editForm.availability}
                      onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value as any }))}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      profile.availability === 'available' ? 'bg-green-100 text-green-800' :
                      profile.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        profile.availability === 'available' ? 'bg-green-500' :
                        profile.availability === 'busy' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      {profile.availability === 'available' ? 'Available for work' :
                       profile.availability === 'busy' ? 'Busy' : 'Unavailable'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-semibold">{formatCurrency(profile.stats.totalEarnings)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold">{profile.stats.successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{profile.stats.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <Github className="h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={editForm.socialLinks.github}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, github: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                        placeholder="GitHub URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={editForm.socialLinks.linkedin}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={editForm.socialLinks.website}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, website: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                        placeholder="Website URL"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                         className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {profile.socialLinks.website && (
                      <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer"
                         className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                        <Globe className="h-4 w-4" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Tell clients about yourself..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editForm.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Add a skill"
                    />
                    <Button onClick={addSkill} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Level */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Level</h3>
              {isEditing ? (
                <select
                  value={editForm.experience}
                  onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value as any }))}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  profile.experience === 'expert' ? 'bg-purple-100 text-purple-800' :
                  profile.experience === 'intermediate' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <Award className="h-4 w-4 mr-2" />
                  {profile.experience === 'expert' ? 'Expert Level' :
                   profile.experience === 'intermediate' ? 'Intermediate Level' :
                   'Entry Level'}
                </span>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                {isEditing && (
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Certification</span>
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(cert.date).toLocaleDateString()}
                      </p>
                    </div>
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-700">
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
                {isEditing && (
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Project</span>
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.portfolio.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.map((tag) => (
                          <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer"
                           className="text-green-600 hover:text-green-700 text-sm">
                          View Project →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
}