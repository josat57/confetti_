"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  Bot,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  aiPlannerService,
  EventPlanningRequest,
} from "@/services/ai-planner.service";

export default function CreateAIPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventPlanningRequest>({
    eventType: "",
    budget: 0,
    guestCount: 0,
    date: "",
    location: "",
    duration: 4,
    preferences: {
      theme: "",
      style: "",
      dietary: [],
      accessibility: [],
      entertainment: [],
      special_requests: "",
    },
    clientInfo: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const [dietaryInput, setDietaryInput] = useState("");
  const [accessibilityInput, setAccessibilityInput] = useState("");
  const [entertainmentInput, setEntertainmentInput] = useState("");

  const eventTypes = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Anniversary",
    "Conference",
    "Product Launch",
    "Graduation",
    "Baby Shower",
    "Engagement",
    "Funeral/Memorial",
    "Charity Event",
    "Festival",
    "Other",
  ];

  const themes = [
    "Elegant & Classic",
    "Modern & Minimalist",
    "Rustic & Natural",
    "Vintage & Retro",
    "Tropical & Beach",
    "Garden & Outdoor",
    "Luxury & Glamorous",
    "Cultural & Traditional",
    "Bohemian & Artistic",
    "Industrial & Urban",
  ];

  const styles = [
    "Formal",
    "Semi-Formal",
    "Casual",
    "Black Tie",
    "Cocktail",
    "Outdoor",
    "Indoor",
    "Intimate",
    "Grand",
    "Interactive",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const plan = await aiPlannerService.createEventPlan(formData);
      toast.success("AI event plan generated successfully!");
      router.push(`/vendor/dashboard/ai-planner/plans/${plan.id}`);
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(error.response?.data?.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (
    field: "dietary" | "accessibility" | "entertainment",
    value: string,
    setValue: (value: string) => void
  ) => {
    if (value.trim() && !formData.preferences[field]?.includes(value.trim())) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [field]: [...(formData.preferences[field] || []), value.trim()],
        },
      });
      setValue("");
    }
  };

  const removeFromArray = (
    field: "dietary" | "accessibility" | "entertainment",
    value: string
  ) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [field]:
          formData.preferences[field]?.filter((item) => item !== value) || [],
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/vendor/dashboard/ai-planner"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AI Planner
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create AI Event Plan
            </h1>
            <p className="text-gray-600">
              Let AI generate a comprehensive event plan for you
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Event Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Event Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Guest Count *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.guestCount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guestCount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Number of guests"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.budget || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Total budget in Naira"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City or venue location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 4,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Event Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Event Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={formData.preferences.theme}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      theme: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select theme</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={formData.preferences.style}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      style: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select style</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Requirements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                  addToArray("dietary", dietaryInput, setDietaryInput))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add dietary requirement (e.g., Vegetarian, Halal, Gluten-free)"
              />
              <button
                type="button"
                onClick={() =>
                  addToArray("dietary", dietaryInput, setDietaryInput)
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.dietary?.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray("dietary", item)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Accessibility Requirements */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accessibility Requirements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={accessibilityInput}
                onChange={(e) => setAccessibilityInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                  addToArray(
                    "accessibility",
                    accessibilityInput,
                    setAccessibilityInput
                  ))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add accessibility need (e.g., Wheelchair access, Sign language)"
              />
              <button
                type="button"
                onClick={() =>
                  addToArray(
                    "accessibility",
                    accessibilityInput,
                    setAccessibilityInput
                  )
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.accessibility?.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray("accessibility", item)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Entertainment Preferences */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entertainment Preferences
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={entertainmentInput}
                onChange={(e) => setEntertainmentInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                  addToArray(
                    "entertainment",
                    entertainmentInput,
                    setEntertainmentInput
                  ))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add entertainment type (e.g., Live band, DJ, Comedian)"
              />
              <button
                type="button"
                onClick={() =>
                  addToArray(
                    "entertainment",
                    entertainmentInput,
                    setEntertainmentInput
                  )
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.entertainment?.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray("entertainment", item)}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.preferences.special_requests}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    special_requests: e.target.value,
                  },
                })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any special requests or additional details..."
            />
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Client Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientInfo.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientInfo: {
                      ...formData.clientInfo,
                      name: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Client's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email *
              </label>
              <input
                type="email"
                required
                value={formData.clientInfo.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientInfo: {
                      ...formData.clientInfo,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="client@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Phone
              </label>
              <input
                type="tel"
                value={formData.clientInfo.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    clientInfo: {
                      ...formData.clientInfo,
                      phone: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/vendor/dashboard/ai-planner"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
