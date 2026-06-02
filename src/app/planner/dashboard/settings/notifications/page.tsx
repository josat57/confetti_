"use client";

import React, { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import settingsService, {
  PreferencesData,
} from "@/services/planner/settings.service";

const NotificationSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: {
      email: true,
      inApp: true,
      sms: false,
      quietHoursStart: "",
      quietHoursEnd: "",
    },
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPreferences();
      setPreferences(data);
    } catch {
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (channel: "email" | "inApp" | "sms") => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [channel]: !preferences.notifications?.[channel],
      },
    });
  };

  const handleQuietHoursChange = (
    field: "quietHoursStart" | "quietHoursEnd",
    value: string
  ) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updatePreferences(preferences);
      toast.success("Notification preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleCls = (on: boolean) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      on ? "bg-teal-600" : "bg-gray-200 dark:bg-gray-600"
    }`;

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Notification Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage how you receive notifications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Notification Channels */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Notification Channels
            </h3>
            <div className="space-y-4">
              {(
                [
                  { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "inApp", label: "In-App Notifications", desc: "Receive notifications in the app" },
                  { key: "sms",   label: "SMS Notifications",   desc: "Receive notifications via SMS (Professional+ tier)" },
                ] as const
              ).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(key)}
                    className={toggleCls(!!preferences.notifications?.[key])}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.notifications?.[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Quiet Hours
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Set hours when you don't want to receive notifications
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.notifications?.quietHoursStart || ""}
                  onChange={(e) => handleQuietHoursChange("quietHoursStart", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.notifications?.quietHoursEnd || ""}
                  onChange={(e) => handleQuietHoursChange("quietHoursEnd", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Notification Types
            </h3>
            <div className="space-y-3">
              {[
                "Vendor responses",
                "Client approvals",
                "Task deadlines",
                "Payment due dates",
                "New messages",
                "Team activity",
              ].map((label) => (
                <label key={label} className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={loadPreferences}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
