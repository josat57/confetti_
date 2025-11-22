"use client";

import React, { useState, useEffect } from "react";
import {
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import settingsService, {
  PreferencesData,
} from "@/services/planner/settings.service";

const GeneralPreferencesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: {
      email: true,
      inApp: true,
      sms: false,
    },
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    language: "en",
  });

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];

  const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "MMM DD, YYYY",
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
  ];

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PreferencesData, value: string) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await settingsService.updatePreferences(preferences);
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            General Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize your regional and display settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Timezone */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-400" />
              Timezone
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              All dates and times will be displayed in this timezone
            </p>
          </div>

          {/* Date Format */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {dateFormats.map((format) => (
                <option key={format} value={format}>
                  {format} (e.g., {new Date().toLocaleDateString("en-US")})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Choose how dates are displayed throughout the app
            </p>
          </div>

          {/* Currency */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" />
              Default Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              This will be the default currency for new events and budgets
            </p>
          </div>

          {/* Language */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-400" />
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select your preferred language for the interface
            </p>
          </div>

          {/* Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleDateString("en-US")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString("en-US")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium text-gray-900">
                  {
                    currencies.find((c) => c.code === preferences.currency)
                      ?.symbol
                  }
                  1,234.56
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={loadPreferences}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralPreferencesPage;
