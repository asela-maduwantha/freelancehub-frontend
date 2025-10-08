'use client';

import React, { useEffect, useState } from 'react';
import { User, Camera, Loader, Star, DollarSign, Briefcase } from 'lucide-react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import SkillsSection from '../../../../components/features/profile/SkillsSection';
import PortfolioSection from '../../../../components/features/profile/PortfolioSection';
import EducationSection from '../../../../components/features/profile/EducationSection';
import CertificationSection from '../../../../components/features/profile/CertificationSection';
import { profileApi } from '../../../../lib/api/profile';
import {
  CompleteUserProfile,
  UpdateGeneralProfileRequest,
  UpdateFreelancerProfileRequest,
  AddSkillsRequest,
  AddPortfolioItemRequest,
  UpdatePortfolioItemRequest,
  AddEducationRequest,
  UpdateEducationRequest,
  AddCertificationRequest,
  UpdateCertificationRequest,
} from '../../../../types/profile';

export default function FreelancerProfilePage() {
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'education' | 'certifications'>('overview');
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [showEditFreelancerInfo, setShowEditFreelancerInfo] = useState(false);
  
  const [basicInfoForm, setBasicInfoForm] = useState<UpdateGeneralProfileRequest>({});
  const [freelancerInfoForm, setFreelancerInfoForm] = useState<UpdateFreelancerProfileRequest>({});

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getCurrentProfile();
      setProfile(data);
      
      // Initialize forms with current data
      setBasicInfoForm({
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName,
        phone: data.profile?.phone,
        bio: data.profile?.bio,
        location: data.profile?.location,
        website: data.profile?.website,
        socialLinks: data.profile?.socialLinks,
      });
      
      setFreelancerInfoForm({
        title: data.freelancerData?.title,
        overview: data.freelancerData?.overview,
        availability: data.freelancerData?.availability,
        experience: data.freelancerData?.experience,
        languages: data.freelancerData?.languages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Update basic info
  const handleUpdateBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const updated = await profileApi.updateGeneralProfile(basicInfoForm);
      setProfile(updated);
      setShowEditBasicInfo(false);
      showSuccess('Basic information updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update basic information');
    } finally {
      setUpdating(false);
    }
  };

  // Update freelancer info
  const handleUpdateFreelancerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const updated = await profileApi.updateFreelancerProfile(freelancerInfoForm);
      setProfile(updated);
      setShowEditFreelancerInfo(false);
      showSuccess('Freelancer information updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update freelancer information');
    } finally {
      setUpdating(false);
    }
  };

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUpdating(true);
      const response = await profileApi.uploadAvatar(file);
      // Refresh profile to get updated avatar
      await fetchProfile();
      showSuccess('Avatar updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to upload avatar');
    } finally {
      setUpdating(false);
    }
  };

  // Skills handlers
  const handleAddSkills = async (skills: string[]) => {
    try {
      setUpdating(true);
      await profileApi.addSkills({ skills });
      await fetchProfile();
      showSuccess('Skills added successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to add skills');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      setUpdating(true);
      await profileApi.removeSkill(skill);
      await fetchProfile();
      showSuccess('Skill removed successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to remove skill');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Portfolio handlers
  const handleAddPortfolio = async (data: AddPortfolioItemRequest) => {
    try {
      setUpdating(true);
      await profileApi.addPortfolioItem(data);
      await fetchProfile();
      showSuccess('Portfolio item added successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to add portfolio item');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePortfolio = async (id: string, data: UpdatePortfolioItemRequest) => {
    try {
      setUpdating(true);
      await profileApi.updatePortfolioItem(id, data);
      await fetchProfile();
      showSuccess('Portfolio item updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update portfolio item');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;
    
    try {
      setUpdating(true);
      await profileApi.deletePortfolioItem(id);
      await fetchProfile();
      showSuccess('Portfolio item deleted successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to delete portfolio item');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Education handlers
  const handleAddEducation = async (data: AddEducationRequest) => {
    try {
      setUpdating(true);
      await profileApi.addEducation(data);
      await fetchProfile();
      showSuccess('Education record added successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to add education');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateEducation = async (id: string, data: UpdateEducationRequest) => {
    try {
      setUpdating(true);
      await profileApi.updateEducation(id, data);
      await fetchProfile();
      showSuccess('Education record updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update education');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;
    
    try {
      setUpdating(true);
      await profileApi.deleteEducation(id);
      await fetchProfile();
      showSuccess('Education record deleted successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to delete education');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Certification handlers
  const handleAddCertification = async (data: AddCertificationRequest) => {
    try {
      setUpdating(true);
      await profileApi.addCertification(data);
      await fetchProfile();
      showSuccess('Certification added successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to add certification');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCertification = async (id: string, data: UpdateCertificationRequest) => {
    try {
      setUpdating(true);
      await profileApi.updateCertification(id, data);
      await fetchProfile();
      showSuccess('Certification updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update certification');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    
    try {
      setUpdating(true);
      await profileApi.deleteCertification(id);
      await fetchProfile();
      showSuccess('Certification deleted successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to delete certification');
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="flex items-center justify-center h-96">
          <Loader className="animate-spin text-indigo-600" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout userRole="freelancer">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/freelancer/dashboard' },
            { label: 'Profile', icon: <User size={16} /> }
          ]}
        />

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
                  {profile.profile?.avatar ? (
                    <img src={profile.profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={updating}
                  />
                </label>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {profile.profile?.firstName} {profile.profile?.lastName}
                </h2>
                {profile.freelancerData?.title && (
                  <p className="text-gray-600 mt-1">{profile.freelancerData.title}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(profile.freelancerData?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {profile.freelancerData?.reviewCount || 0} reviews
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase size={16} />
                    <span className="text-sm">{profile.freelancerData?.completedJobs || 0} jobs completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={16} />
                    <span className="text-sm">${profile.freelancerData?.totalEarned || 0} earned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'education', label: 'Education' },
              { id: 'certifications', label: 'Certifications' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <button
                  onClick={() => setShowEditBasicInfo(!showEditBasicInfo)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  {showEditBasicInfo ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showEditBasicInfo ? (
                <form onSubmit={handleUpdateBasicInfo} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={basicInfoForm.firstName || ''}
                        onChange={(e) => setBasicInfoForm({ ...basicInfoForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={basicInfoForm.lastName || ''}
                        onChange={(e) => setBasicInfoForm({ ...basicInfoForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={basicInfoForm.phone || ''}
                      onChange={(e) => setBasicInfoForm({ ...basicInfoForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={basicInfoForm.bio || ''}
                      onChange={(e) => setBasicInfoForm({ ...basicInfoForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="text-gray-900">{profile.profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bio:</span>
                    <p className="text-gray-900">{profile.profile?.bio || 'No bio yet'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Freelancer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                <button
                  onClick={() => setShowEditFreelancerInfo(!showEditFreelancerInfo)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  {showEditFreelancerInfo ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {showEditFreelancerInfo ? (
                <form onSubmit={handleUpdateFreelancerInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={freelancerInfoForm.title || ''}
                      onChange={(e) => setFreelancerInfoForm({ ...freelancerInfoForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Full Stack Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                    <textarea
                      value={freelancerInfoForm.overview || ''}
                      onChange={(e) => setFreelancerInfoForm({ ...freelancerInfoForm, overview: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe your expertise..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <select
                      value={freelancerInfoForm.availability || ''}
                      onChange={(e) => setFreelancerInfoForm({ ...freelancerInfoForm, availability: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select availability</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <select
                      value={freelancerInfoForm.experience || ''}
                      onChange={(e) => setFreelancerInfoForm({ ...freelancerInfoForm, experience: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select experience</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Availability:</span>
                    <p className="text-gray-900 capitalize">{profile.freelancerData?.availability || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Experience:</span>
                    <p className="text-gray-900 capitalize">{profile.freelancerData?.experience || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Overview:</span>
                    <p className="text-gray-900">{profile.freelancerData?.overview || 'No overview yet'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills Section */}
            <div className="lg:col-span-2">
              <SkillsSection
                skills={profile.freelancerData?.skills || []}
                onAdd={handleAddSkills}
                onRemove={handleRemoveSkill}
                isLoading={updating}
              />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioSection
            portfolio={profile.freelancerData?.portfolio || []}
            onAdd={handleAddPortfolio}
            onUpdate={handleUpdatePortfolio}
            onDelete={handleDeletePortfolio}
            isLoading={updating}
          />
        )}

        {activeTab === 'education' && (
          <EducationSection
            education={profile.freelancerData?.education || []}
            onAdd={handleAddEducation}
            onUpdate={handleUpdateEducation}
            onDelete={handleDeleteEducation}
            isLoading={updating}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationSection
            certifications={profile.freelancerData?.certifications || []}
            onAdd={handleAddCertification}
            onUpdate={handleUpdateCertification}
            onDelete={handleDeleteCertification}
            isLoading={updating}
          />
        )}
      </div>
    </DashboardLayout>
  );
}