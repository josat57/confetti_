"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Bell, Mail, MessageSquare } from "lucide-react";
import { settingsService } from "@/services/planner/settings.service";

interface NotificationPrefs {
  email: {
    vendorResponses: boolean;
    clientApprovals: boolean;
    taskDeadlines: boolean;
    paymentDue: boolean;
    newMessages: boolean;
  };
  inApp: {
    vendorResponses: boolean;
    clientApprovals: boolean;
    taskDeadlines: boolean;
    paymentDue: boolean;
    newMessages: boolean;
  };
  sms: {
    urgentOnly: boolean;
    enabled: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    email: {
      vendorResponses: true,
      clientApprovals: true,
      taskDeadlines: true,
      paymentDue: true,
      newMessages: true,
    },
    inApp: {
      vendorResponses: true,
      clientApprovals: true,
      taskDeadlines: true,
      paymentDue: true,
      newMessages: true,
    },
    sms: {
      urgentOnly: true,
      enabled: false,
    },
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updatePreferences(preferences);
      alert("Notification preferences updated successfully!");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      alert("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose how you want to be notified about important updates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Email Notifications
            </h3>
          </div>
          <div className="space-y-3 ml-7">
            {Object.entries(preferences.email).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      email: { ...preferences.email, [key]: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              In-App Notifications
            </h3>
          </div>
          <div className="space-y-3 ml-7">
            {Object.entries(preferences.inApp).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      inApp: { ...preferences.inApp, [key]: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="text-base font-semibold text-gray-900">
              SMS Notifications
            </h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              Professional+
            </span>
          </div>
          <div className="space-y-3 ml-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.sms.enabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                Enable SMS notifications
              </span>
            </label>
            {preferences.sms.enabled && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.sms.urgentOnly}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      sms: {
                        ...preferences.sms,
                        urgentOnly: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  Urgent notifications only
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Quiet Hours
          </h3>
          <div className="space-y-4 ml-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                Enable quiet hours (no notifications during this time)
              </span>
            </label>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
