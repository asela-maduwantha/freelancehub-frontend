'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { ComponentLoader } from '../../../../components/common/Loading';
import Button from '../../../../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Display';
import Input from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/common/Toast';
import { authService } from '../../../../lib/api/auth';
import { clientApi } from '../../../../lib/api/clientApi';
import { apiClient } from '../../../../lib/api/client';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import {
  User,
  Building,
  Settings,
  Camera,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  Bell,
  Eye,
  EyeOff,
  Save,
  Upload
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    bio?: string;
    location?: {
      country?: string;
      state?: string;
      city?: string;
      timezone?: string;
    };
    website?: string;
    socialLinks?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };
  clientData?: {
    companyName?: string;
    companySize?: string;
    industry?: string;
    totalSpent: number;
    postedJobs: number;
    rating: number;
    reviewCount: number;
  };
  createdAt: string;
  lastLoginAt?: string;
  fullName: string;
}

interface UserSettings {
  emailNotifications: boolean;
  profileVisibility: 'public' | 'private' | 'freelancers_only';
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
}

export default function ClientProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [settingsData, setSettingsData] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchUserData();
    fetchUserSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authService.getMe();
      setUser(response);
      setFormData({
        firstName: response.profile?.firstName || '',
        lastName: response.profile?.lastName || '',
        phone: response.profile?.phone || '',
        dateOfBirth: response.profile?.dateOfBirth || '',
        gender: response.profile?.gender || '',
        bio: response.profile?.bio || '',
        country: response.profile?.location?.country || '',
        state: response.profile?.location?.state || '',
        city: response.profile?.location?.city || '',
        timezone: response.profile?.location?.timezone || '',
        website: response.profile?.website || '',
        linkedin: response.profile?.socialLinks?.linkedin || '',
        github: response.profile?.socialLinks?.github || '',
        portfolio: response.profile?.socialLinks?.portfolio || '',
        companyName: response.clientData?.companyName || '',
        companySize: response.clientData?.companySize || '',
        industry: response.clientData?.industry || ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile data');
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await apiClient.get('/users/settings');
      setSettings(response);
      setSettingsData({
        emailNotifications: response.emailNotifications,
        profileVisibility: response.profileVisibility,
        language: response.language,
        timezone: response.timezone,
        twoFactorEnabled: response.twoFactorEnabled
      });
    } catch (error: any) {
      console.warn('Failed to load settings:', error);
      // Set default settings if API fails
      setSettings({
        emailNotifications: true,
        profileVisibility: 'public',
        language: 'en',
        timezone: 'UTC',
        twoFactorEnabled: false,
        isActive: true,
        isEmailVerified: true
      });
      setSettingsData({
        emailNotifications: true,
        profileVisibility: 'public',
        language: 'en',
        timezone: 'UTC',
        twoFactorEnabled: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettingsData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Upload avatar if selected
      if (avatarFile) {
        const formDataObj = new FormData();
        formDataObj.append('avatar', avatarFile);
        await apiClient.postFormData('/users/upload-avatar', formDataObj);
      }

      // Update general profile
      const generalProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bio: formData.bio,
        location: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          timezone: formData.timezone
        },
        website: formData.website,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio
        }
      };

      await apiClient.put('/users/me', generalProfileData);

      // Update client-specific profile
      const clientProfileData = {
        companyName: formData.companyName,
        companySize: formData.companySize,
        industry: formData.industry
      };

      await clientApi.updateProfile(clientProfileData);

      toast.success('Profile updated successfully');
      await fetchUserData(); // Refresh data
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.put('/users/settings', settingsData);
      toast.success('Settings updated successfully');
      await fetchUserSettings(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="client">
        <div className="space-y-6">
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/client' },
              { label: 'Profile' }
            ]}
          />
          <div className="flex justify-center py-12">
            <ComponentLoader size="lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/client' },
            { label: 'Profile' }
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      {avatarPreview || user?.profile?.avatar ? (
                        <img
                          src={avatarPreview || user?.profile?.avatar}
                          alt={user?.fullName}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user?.fullName}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a new profile picture (max 5MB)
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      type="text"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <Input
                      type="text"
                      value={formData.website}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <TextArea
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <Input
                        type="text"
                        value={formData.country}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('country', e.target.value)}
                        placeholder="Enter your country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <Input
                        type="text"
                        value={formData.state}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('state', e.target.value)}
                        placeholder="Enter your state/province"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <Input
                        type="text"
                        value={formData.city}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('city', e.target.value)}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Asia/Shanghai">Shanghai</option>
                        <option value="Australia/Sydney">Sydney</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <Input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                      <Input
                        type="text"
                        value={formData.github}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('github', e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                    <Input
                      type="text"
                      value={formData.portfolio}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('portfolio', e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Company Tab */}
        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <Input
                      type="text"
                      value={formData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    type="text"
                    value={formData.industry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>

                {/* Company Stats (Read-only) */}
                {user?.clientData && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Company Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {user.clientData.postedJobs}
                        </div>
                        <div className="text-sm text-gray-600">Jobs Posted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${user.clientData.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {user.clientData.rating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {user.clientData.reviewCount}
                        </div>
                        <div className="text-sm text-gray-600">Reviews</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
            <CardFooter>
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Company Info'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settingsData.emailNotifications}
                        onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <p className="text-sm text-gray-500">Receive email notifications about your account activity</p>
                  </div>
                </div>

                {/* Privacy */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Privacy
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                    <select
                      value={settingsData.profileVisibility}
                      onChange={(e) => handleSettingsChange('profileVisibility', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="freelancers_only">Freelancers Only - Only freelancers can see your profile</option>
                      <option value="private">Private - Profile is hidden</option>
                    </select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        value={settingsData.language}
                        onChange={(e) => handleSettingsChange('language', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ru">Russian</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={settingsData.timezone}
                        onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Asia/Shanghai">Shanghai (CST)</option>
                        <option value="Australia/Sydney">Sydney (AEDT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Security</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settingsData.twoFactorEnabled}
                        onChange={(e) => handleSettingsChange('twoFactorEnabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Two-Factor Authentication</span>
                    </label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Email Verification</div>
                        <div className="text-sm text-gray-600">
                          {user?.isEmailVerified ? 'Your email is verified' : 'Please verify your email'}
                        </div>
                      </div>
                      <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Account Status</div>
                        <div className="text-sm text-gray-600">
                          {user?.isActive ? 'Your account is active' : 'Your account is inactive'}
                        </div>
                      </div>
                      <Badge variant={user?.isActive ? 'success' : 'error'}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}