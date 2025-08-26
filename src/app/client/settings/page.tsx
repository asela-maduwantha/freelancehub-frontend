"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/context/toast-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Eye,
  EyeOff,
  Save,
  Edit,
  Trash2,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  Settings as SettingsIcon,
  Lock,
  Download,
  Upload
} from "lucide-react";
import api from "@/api/axios-instance";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  company?: {
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    description?: string;
    location?: string;
  };
  preferences: {
    timezone: string;
    language: string;
    currency: string;
  };
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  email: {
    projectUpdates: boolean;
    proposalReceived: boolean;
    milestoneCompleted: boolean;
    paymentProcessed: boolean;
    messageReceived: boolean;
    marketingEmails: boolean;
  };
  push: {
    projectUpdates: boolean;
    proposalReceived: boolean;
    milestoneCompleted: boolean;
    paymentProcessed: boolean;
    messageReceived: boolean;
  };
  sms: {
    criticalAlerts: boolean;
    paymentAlerts: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: "PUBLIC" | "VERIFIED_ONLY" | "PRIVATE";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowDirectContact: boolean;
  showOnlineStatus: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const toast = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const [profileResult, notificationResult, privacyResult] = await Promise.allSettled([
        api.get("/users/me"),
        api.get("/users/me/notification-settings"),
        api.get("/users/me/privacy-settings"),
      ]);

      // Extract values with fallbacks for failed calls
      const profileRes = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const notificationRes = notificationResult.status === 'fulfilled' ? notificationResult.value : null;
      const privacyRes = privacyResult.status === 'fulfilled' ? privacyResult.value : null;

      // Log any failures for debugging
      if (profileResult.status === 'rejected') {
        console.error('Failed to load profile:', profileResult.reason);
      }
      if (notificationResult.status === 'rejected') {
        console.error('Failed to load notification settings:', notificationResult.reason);
      }
      if (privacyResult.status === 'rejected') {
        console.error('Failed to load privacy settings:', privacyResult.reason);
      }

      setProfile((profileRes?.data as any)?.user || null);
      setNotifications((notificationRes?.data as any)?.settings || {});
      setPrivacy((privacyRes?.data as any)?.settings || {});
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      await api.put("/users/me", profile);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotifications = async () => {
    if (!notifications) return;

    try {
      setIsSaving(true);
      await api.put("/users/me/notification-settings", notifications);
      toast.success("Notification settings updated");
    } catch (error) {
      console.error("Failed to update notifications:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const savePrivacy = async () => {
    if (!privacy) return;

    try {
      setIsSaving(true);
      await api.put("/users/me/privacy-settings", privacy);
      toast.success("Privacy settings updated");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSaving(true);
      await api.put("/users/me/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const enable2FA = async () => {
    try {
      await api.post("/users/me/enable-2fa");
      setProfile(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
      toast.success("Two-factor authentication enabled");
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      toast.error("Failed to enable two-factor authentication");
    }
  };

  const disable2FA = async () => {
    try {
      await api.post("/users/me/disable-2fa");
      setProfile(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
      toast.success("Two-factor authentication disabled");
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      toast.error("Failed to disable two-factor authentication");
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get("/users/me/export-data", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "my-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Data export started");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "data", label: "Data", icon: Download },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && profile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {profile.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Button variant="outline" size="sm">Verify</Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {profile.phoneVerified ? (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Button variant="outline" size="sm">Verify</Button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveProfile} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={profile.company?.name || ""}
                        onChange={(e) => setProfile({
                          ...profile,
                          company: { 
                            name: e.target.value,
                            ...profile.company
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.company?.website || ""}
                        onChange={(e) => setProfile({
                          ...profile,
                          company: { 
                            name: profile.company?.name || "",
                            ...profile.company, 
                            website: e.target.value 
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={profile.company?.industry || ""}
                        onChange={(e) => setProfile({
                          ...profile,
                          company: { 
                            name: profile.company?.name || "",
                            ...profile.company, 
                            industry: e.target.value 
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size
                      </label>
                      <select
                        value={profile.company?.size || ""}
                        onChange={(e) => setProfile({
                          ...profile,
                          company: { 
                            name: profile.company?.name || "",
                            ...profile.company, 
                            size: e.target.value 
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && notifications && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={value}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            email: { ...notifications.email, [key]: e.target.checked }
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                  
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={saveNotifications} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <Button onClick={changePassword} disabled={isSaving}>
                    <Key className="h-4 w-4 mr-2" />
                    {isSaving ? "Changing..." : "Change Password"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    {profile?.twoFactorEnabled ? (
                      <Button variant="outline" onClick={disable2FA}>
                        Disable 2FA
                      </Button>
                    ) : (
                      <Button onClick={enable2FA}>
                        Enable 2FA
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "data" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Download className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">Export Your Data</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Download a copy of all your data including profile, projects, and messages.
                        </p>
                        <Button onClick={exportData}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start gap-4">
                      <Trash2 className="h-6 w-6 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-700 mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button variant="danger">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
