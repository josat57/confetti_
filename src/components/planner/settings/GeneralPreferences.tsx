"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { settingsService } from "@/services/planner/settings.service";

export default function GeneralPreferences() {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    timezone: "Africa/Lagos",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "NGN",
    language: "en",
  });

  const timezones = [
    { value: "Africa/Lagos", label: "Lagos (WAT)" },
    { value: "Africa/Accra", label: "Accra (GMT)" },
    { value: "Africa/Johannesburg", label: "Johannesburg (SAST)" },
    { value: "America/New_York", label: "New York (EST)" },
    { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  ];

  const dateFormats = [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
    { value: "MMM DD, YYYY", label: "MMM DD, YYYY (Dec 31, 2024)" },
  ];

  const currencies = [
    { value: "NGN", label: "Nigerian Naira (₦)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "ZAR", label: "South African Rand (R)" },
    { value: "GHS", label: "Ghanaian Cedi (₵)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updatePreferences(preferences);
      alert("Preferences updated successfully!");
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
          General Preferences
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize your dashboard experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Timezone */}
        <div>
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Timezone
          </label>
          <select
            id="timezone"
            value={preferences.timezone}
            onChange={(e) =>
              setPreferences({ ...preferences, timezone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            All dates and times will be displayed in this timezone
          </p>
        </div>

        {/* Date Format */}
        <div>
          <label
            htmlFor="dateFormat"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date Format
          </label>
          <select
            id="dateFormat"
            value={preferences.dateFormat}
            onChange={(e) =>
              setPreferences({ ...preferences, dateFormat: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label
            htmlFor="timeFormat"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Time Format
          </label>
          <select
            id="timeFormat"
            value={preferences.timeFormat}
            onChange={(e) =>
              setPreferences({ ...preferences, timeFormat: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="12h">12-hour (2:30 PM)</option>
            <option value="24h">24-hour (14:30)</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Default Currency
          </label>
          <select
            id="currency"
            value={preferences.currency}
            onChange={(e) =>
              setPreferences({ ...preferences, currency: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This will be used for budgets and financial reports
          </p>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Language
          </label>
          <select
            id="language"
            value={preferences.language}
            onChange={(e) =>
              setPreferences({ ...preferences, language: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
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
