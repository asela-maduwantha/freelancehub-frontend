'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Save } from 'lucide-react';
import { NotificationSettings } from '@/lib/types';
import { MessagingService } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const notificationCategories = [
  { key: 'messages', label: 'Messages', icon: Bell },
  { key: 'proposals', label: 'Proposals', icon: Bell },
  { key: 'payments', label: 'Payments', icon: Bell },
  { key: 'milestones', label: 'Milestones', icon: Bell },
  { key: 'reviews', label: 'Reviews', icon: Bell },
  { key: 'system', label: 'System', icon: Bell },
] as const;

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await MessagingService.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await MessagingService.updateNotificationSettings(settings);
      // Show success message
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateCategorySetting = (
    category: keyof NotificationSettings,
    setting: string,
    value: boolean | string
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [category]: {
        ...(settings[category as keyof NotificationSettings] as any || {}),
        [setting]: value
      }
    });
  };

  const updateDoNotDisturb = (field: string, value: string | boolean) => {
    if (!settings) return;

    setSettings({
      ...settings,
      doNotDisturb: {
        ...settings.doNotDisturb,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage how you receive notifications
        </p>
      </div>

      {/* Notification Categories */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          <p className="text-gray-600 mt-1">
            Choose how you want to be notified for different types of activities
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {notificationCategories.map(({ key, label, icon: Icon }) => {
            const categorySettings = settings[key];
            return (
              <div key={key} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">{label}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Push Notifications */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categorySettings.push}
                        onChange={(e) => updateCategorySetting(key, 'push', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Smartphone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Push</span>
                    </label>
                  </div>

                  {/* Email Notifications */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categorySettings.email}
                        onChange={(e) => updateCategorySetting(key, 'email', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Email</span>
                    </label>
                  </div>

                  {/* In-App Notifications */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categorySettings.inApp}
                        onChange={(e) => updateCategorySetting(key, 'inApp', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">In-App</span>
                    </label>
                  </div>
                </div>

                {/* Priority */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={categorySettings.priority}
                    onChange={(e) => updateCategorySetting(key, 'priority', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Do Not Disturb */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Do Not Disturb</h2>
          <p className="text-gray-600 mt-1">
            Set quiet hours when you don't want to receive notifications
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.doNotDisturb.enabled}
                onChange={(e) => updateDoNotDisturb('enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Enable Do Not Disturb</span>
            </label>
          </div>

          {settings.doNotDisturb.enabled && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.doNotDisturb.startTime || ''}
                  onChange={(e) => updateDoNotDisturb('startTime', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.doNotDisturb.endTime || ''}
                  onChange={(e) => updateDoNotDisturb('endTime', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sound Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Sound Settings</h2>
          <p className="text-gray-600 mt-1">
            Configure notification sounds
          </p>
        </div>

        <div className="p-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">Enable notification sounds</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
