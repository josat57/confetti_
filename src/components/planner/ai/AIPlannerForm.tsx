"use client";

import { useState } from "react";
import { Sparkles, MapPin } from "lucide-react";
import { EventType } from "@/types/planner";
import { AIPlanRequest } from "@/services/planner/ai-planner.service";

interface AIPlannerFormProps {
  onSubmit: (request: AIPlanRequest) => void;
  loading: boolean;
}

export default function AIPlannerForm({
  onSubmit,
  loading,
}: AIPlannerFormProps) {
  const [formData, setFormData] = useState<AIPlanRequest>({
    eventType: "Wedding",
    date: "",
    location: "",
    guestCount: 0,
    budget: 0,
    guestClass: "Mixed",
    preferences: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventTypes: EventType[] = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Graduation",
    "Conference",
    "Anniversary",
    "Other",
  ];

  const guestClasses = ["Budget", "Standard", "Premium", "Luxury", "Mixed"];

  const preferenceOptions = [
    "Outdoor venue",
    "Indoor venue",
    "Live music",
    "DJ",
    "Formal dress code",
    "Casual dress code",
    "Vegetarian menu",
    "Open bar",
    "Photography",
    "Videography",
    "Flowers",
    "Decorations",
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventType) newErrors.eventType = "Event type is required";
    if (!formData.date) newErrors.date = "Event date is required";

    // Check if date is in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = "Event date cannot be in the past";
    }

    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.guestCount <= 0)
      newErrors.guestCount = "Guest count must be greater than 0";
    if (formData.budget <= 0)
      newErrors.budget = "Budget must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handlePreferenceToggle = (preference: string) => {
    const current = formData.preferences || [];
    const updated = current.includes(preference)
      ? current.filter((p) => p !== preference)
      : [...current, preference];
    setFormData({ ...formData, preferences: updated });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Event Planner</h2>
          <p className="text-gray-600">
            Let AI help you plan your perfect event
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            value={formData.eventType}
            onChange={(e) =>
              setFormData({ ...formData, eventType: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.eventType ? "border-red-500" : "border-gray-300"
            }`}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.eventType && (
            <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
          )}
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Lagos, Nigeria"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Guest Count and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Count *
            </label>
            <input
              type="number"
              value={formData.guestCount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  guestCount: parseInt(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.guestCount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="100"
              min="1"
            />
            {errors.guestCount && (
              <p className="mt-1 text-sm text-red-600">{errors.guestCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (NGN) *
            </label>
            <input
              type="number"
              value={formData.budget || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.budget ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="500000"
              min="1"
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Guest Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guest Class (Optional)
          </label>
          <select
            value={formData.guestClass}
            onChange={(e) =>
              setFormData({ ...formData, guestClass: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {guestClasses.map((guestClass) => (
              <option key={guestClass} value={guestClass}>
                {guestClass}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Helps AI recommend appropriate vendors and services
          </p>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferences (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {preferenceOptions.map((preference) => (
              <label
                key={preference}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.preferences?.includes(preference) || false}
                  onChange={() => handlePreferenceToggle(preference)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{preference}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate AI Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
