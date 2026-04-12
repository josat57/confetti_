"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, MapPin, Search } from "lucide-react";
import { EventType } from "@/types/planner";
import { AIPlanRequest } from "@/services/planner/ai-planner.service";
import Script from "next/script";

interface AIPlannerFormProps {
  onSubmit: (request: AIPlanRequest) => void;
  loading: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

// Internal form state (user-friendly)
interface FormState {
  eventType: string;
  eventDate: string;
  locationString: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  guestCount: number;
  budget: number;
  eventDescription: string;
  formality: string;
  preferences: string[];
}

export default function AIPlannerForm({
  onSubmit,
  loading,
}: AIPlannerFormProps) {
  const [formData, setFormData] = useState<FormState>({
    eventType: "wedding",
    eventDate: "",
    locationString: "",
    city: "",
    state: "",
    guestCount: 0,
    budget: 0,
    eventDescription: "",
    formality: "casual",
    preferences: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // Backend enum values - must match exactly
  const eventTypes = [
    "wedding",
    "birthday",
    "corporate",
    "conference",
    "graduation",
    "anniversary",
    "funeral",
    "get-together",
    "trip",
    "baby-shower",
    "bridal-shower",
    "engagement",
    "reunion",
    "fundraiser",
    "product-launch",
    "workshop",
    "festival",
    "concert",
    "other",
  ];

  // Display labels for event types
  const eventTypeLabels: Record<string, string> = {
    wedding: "Wedding",
    birthday: "Birthday Party",
    corporate: "Corporate Event",
    conference: "Conference",
    graduation: "Graduation",
    anniversary: "Anniversary",
    funeral: "Burial/Funeral",
    "get-together": "Get Together",
    trip: "Trip/Excursion",
    "baby-shower": "Baby Shower",
    "bridal-shower": "Bridal Shower",
    engagement: "Engagement Party",
    reunion: "Reunion",
    fundraiser: "Fundraiser",
    "product-launch": "Product Launch",
    workshop: "Workshop/Seminar",
    festival: "Festival",
    concert: "Concert",
    other: "Other",
  };

  const formalityLevels = [
    { value: "casual", label: "Casual" },
    { value: "semi-formal", label: "Semi-Formal" },
    { value: "formal", label: "Formal" },
    { value: "black-tie", label: "Black Tie" },
  ];

  const preferenceOptions = [
    // Venue
    "Outdoor venue",
    "Indoor venue",
    "Garden venue",
    "Beach venue",
    "Hotel venue",
    "Hall/Banquet",

    // Entertainment
    "Live music",
    "DJ",
    "Live band",
    "Master of Ceremonies (MC)",
    "Comedian",
    "Dancers",

    // Food & Beverage
    "Vegetarian menu",
    "Vegan menu",
    "Halal menu",
    "Open bar",
    "Cocktail bar",
    "Buffet style",
    "Plated service",
    "Food trucks",
    "Cake",
    "Dessert bar",

    // Services
    "Photography",
    "Videography",
    "Photo booth",
    "Car rental/Transport",
    "Valet parking",
    "Security",

    // Decor & Styling
    "Flowers",
    "Decorations",
    "Lighting",
    "Stage setup",
    "Red carpet",
    "Balloons",

    // Dress Code
    "Formal dress code",
    "Semi-formal dress code",
    "Casual dress code",
    "Traditional attire",

    // Special Items
    "Gifting hampers",
    "Party favors",
    "Welcome drinks",
    "Kids entertainment",
    "Fireworks",
  ];

  useEffect(() => {
    if (googleMapsLoaded && locationInputRef.current && window.google) {
      initializeAutocomplete();
    }
  }, [googleMapsLoaded]);

  const initializeAutocomplete = () => {
    if (!locationInputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "ng" },
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      setSelectedPlace(place);

      if (place.formatted_address) {
        // Extract city and state from address components
        let city = "";
        let state = "";
        let latitude: number | undefined;
        let longitude: number | undefined;

        place.address_components?.forEach((component: any) => {
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
        });

        // Extract coordinates if available
        if (place.geometry?.location) {
          latitude = place.geometry.location.lat();
          longitude = place.geometry.location.lng();
        }

        setFormData((prev) => ({
          ...prev,
          locationString: place.formatted_address,
          city,
          state,
          latitude,
          longitude,
        }));

        setErrors((prev) => ({
          ...prev,
          locationString: "",
          city: "",
          state: "",
        }));
      }
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventType) newErrors.eventType = "Event type is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";

    // Check if date is in the past
    const selectedDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.eventDate = "Event date cannot be in the past";
    }

    if (!formData.locationString.trim())
      newErrors.locationString = "Location is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (formData.guestCount <= 0)
      newErrors.guestCount = "Guest count must be greater than 0";
    if (formData.budget <= 0)
      newErrors.budget = "Budget must be greater than 0";

    if (
      !formData.eventDescription ||
      formData.eventDescription.trim().length < 50
    ) {
      newErrors.eventDescription =
        "Event description must be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Transform form data to API format
      const apiRequest: AIPlanRequest = {
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        location: {
          address: formData.locationString,
          city: formData.city,
          state: formData.state,
          country: "Nigeria",
          // Include coordinates if available from Google Maps
          ...(formData.latitude !== undefined &&
            formData.longitude !== undefined && {
              latitude: formData.latitude,
              longitude: formData.longitude,
            }),
        },
        guestCount: formData.guestCount,
        budget: {
          amount: formData.budget,
          currency: "NGN",
        },
        eventDescription: formData.eventDescription,
        guestClass: {
          formality: formData.formality,
          ageGroups: ["adults"], // Default, can be enhanced
          socialStatus: ["middle-class"], // Default, can be enhanced
          specialRequirements: [],
          additionalDetails:
            formData.preferences.length > 0
              ? `Preferences: ${formData.preferences.join(", ")}`
              : "No specific preferences",
        },
      };

      onSubmit(apiRequest);
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
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setGoogleMapsLoaded(true)}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              AI Event Planner
            </h2>
            <p className="text-gray-600">
              Let AI help you plan your perfect event
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type <span className="text-red-500">*</span>
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
                  {eventTypeLabels[type] || type}
                </option>
              ))}
            </select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
            )}
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.eventDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
            )}
          </div>

          {/* Location with Google Maps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                ref={locationInputRef}
                type="text"
                value={formData.locationString}
                onChange={(e) =>
                  setFormData({ ...formData, locationString: e.target.value })
                }
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.locationString ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Start typing to search location..."
              />
              {googleMapsLoaded && (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
            </div>
            {errors.locationString && (
              <p className="mt-1 text-sm text-red-600">
                {errors.locationString}
              </p>
            )}
            {googleMapsLoaded && (
              <p className="mt-1 text-xs text-gray-500">
                📍 Powered by Google Maps - Start typing for suggestions
              </p>
            )}
          </div>

          {/* City and State (auto-filled from Google Maps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Lagos"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Lagos State"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Guest Count and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Count <span className="text-red-500">*</span>
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
                Budget (NGN) <span className="text-red-500">*</span>
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

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.eventDescription}
              onChange={(e) =>
                setFormData({ ...formData, eventDescription: e.target.value })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.eventDescription ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe your event in detail... (minimum 50 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.eventDescription && (
                <p className="text-sm text-red-600">
                  {errors.eventDescription}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.eventDescription.length}/50 characters minimum
              </p>
            </div>
          </div>

          {/* Formality Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formality Level
            </label>
            <select
              value={formData.formality}
              onChange={(e) =>
                setFormData({ ...formData, formality: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {formalityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
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
            <p className="text-sm text-gray-500 mb-3">
              Select all that apply to help us personalize your event plan
            </p>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {preferenceOptions.map((preference) => (
                  <label
                    key={preference}
                    className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData.preferences?.includes(preference) || false
                      }
                      onChange={() => handlePreferenceToggle(preference)}
                      className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{preference}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {formData.preferences?.length || 0} preference(s) selected
            </p>
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
    </>
  );
}
