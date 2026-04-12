import { useState, useEffect } from "react";
import { MapPin, Users, Palette, Check, Accessibility } from "lucide-react";
import { VenuePreferencesData } from "@/types/ai-planner";

interface VenuePreferencesStepProps {
  value?: VenuePreferencesData;
  onChange: (data: VenuePreferencesData) => void;
  guestCount: number;
  errors: Record<string, string>;
}

const venueStyles = [
  {
    value: "elegant",
    label: "Elegant",
    description: "Sophisticated and refined",
    emoji: "✨",
  },
  {
    value: "rustic",
    label: "Rustic",
    description: "Natural and charming",
    emoji: "🌿",
  },
  {
    value: "modern",
    label: "Modern",
    description: "Contemporary and sleek",
    emoji: "🏢",
  },
  {
    value: "traditional",
    label: "Traditional",
    description: "Classic and timeless",
    emoji: "🏛️",
  },
  {
    value: "luxury",
    label: "Luxury",
    description: "Premium and exclusive",
    emoji: "💎",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed and informal",
    emoji: "🌻",
  },
];

const mustHaveAmenities = [
  { value: "kitchen", label: "Full Kitchen", icon: "🍳" },
  { value: "sound_system", label: "Sound System", icon: "🔊" },
  { value: "parking", label: "Parking", icon: "🚗" },
  { value: "restrooms", label: "Restrooms", icon: "🚻" },
  { value: "air_conditioning", label: "Air Conditioning", icon: "❄️" },
  { value: "wifi", label: "WiFi", icon: "📶" },
];

const niceToHaveAmenities = [
  { value: "bridal_suite", label: "Bridal Suite", icon: "👰" },
  { value: "garden", label: "Garden/Outdoor Space", icon: "🌺" },
  { value: "bar", label: "Bar Area", icon: "🍸" },
  { value: "dance_floor", label: "Dance Floor", icon: "💃" },
  { value: "stage", label: "Stage/Platform", icon: "🎭" },
  { value: "photo_booth_area", label: "Photo Booth Area", icon: "📸" },
];

const accessibilityOptions = [
  {
    value: "wheelchair_accessible",
    label: "Wheelchair Accessible",
    icon: "♿",
  },
  { value: "elevator", label: "Elevator Access", icon: "🛗" },
  { value: "accessible_parking", label: "Accessible Parking", icon: "🚗" },
  { value: "accessible_restrooms", label: "Accessible Restrooms", icon: "🚻" },
];

export default function VenuePreferencesStep({
  value,
  onChange,
  guestCount,
  errors,
}: VenuePreferencesStepProps) {
  const [localData, setLocalData] = useState<VenuePreferencesData>(() => ({
    venueType: "flexible",
    capacity: guestCount,
    style: "elegant",
    mustHaveAmenities: ["parking", "restrooms"],
    niceToHaveAmenities: [],
    accessibilityNeeds: [],
    locationFlexibility: "same_city",
    ...value,
  }));

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  useEffect(() => {
    // Update capacity when guest count changes
    setLocalData((prev) => ({ ...prev, capacity: guestCount }));
  }, [guestCount]);

  const updateData = (updates: Partial<VenuePreferencesData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  const toggleAmenity = (amenity: string, type: "mustHave" | "niceToHave") => {
    const key =
      type === "mustHave" ? "mustHaveAmenities" : "niceToHaveAmenities";
    const current = localData[key];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    updateData({ [key]: updated });
  };

  const toggleAccessibility = (need: string) => {
    const current = localData.accessibilityNeeds;
    const updated = current.includes(need)
      ? current.filter((n) => n !== need)
      : [...current, need];
    updateData({ accessibilityNeeds: updated });
  };

  return (
    <div className="space-y-8">
      {/* Venue Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Venue Type Preference
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              value: "indoor",
              label: "Indoor",
              icon: "🏢",
              description: "Climate controlled",
            },
            {
              value: "outdoor",
              label: "Outdoor",
              icon: "🌳",
              description: "Natural setting",
            },
            {
              value: "hybrid",
              label: "Hybrid",
              icon: "🏡",
              description: "Indoor & outdoor",
            },
            {
              value: "flexible",
              label: "Flexible",
              icon: "🤝",
              description: "Open to options",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.venueType === option.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="venueType"
                value={option.value}
                checked={localData.venueType === option.value}
                onChange={(e) =>
                  updateData({ venueType: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="text-2xl mb-2">{option.icon}</span>
              <span className="font-medium text-gray-900 text-center">
                {option.label}
              </span>
              <span className="text-xs text-gray-600 text-center mt-1">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Capacity Needed
        </label>
        <div className="relative w-48">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="number"
            min="1"
            value={localData.capacity}
            onChange={(e) =>
              updateData({ capacity: parseInt(e.target.value) || guestCount })
            }
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Recommended: {Math.ceil(guestCount * 1.1)} (10% buffer for comfort)
        </p>
      </div>

      {/* Style Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Style Preference
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {venueStyles.map((style) => (
            <label
              key={style.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.style === style.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="style"
                value={style.value}
                checked={localData.style === style.value}
                onChange={(e) => updateData({ style: e.target.value as any })}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{style.emoji}</span>
                <span className="font-medium text-gray-900">{style.label}</span>
              </div>
              <span className="text-sm text-gray-600">{style.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Must-Have Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Must-Have Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mustHaveAmenities.map((amenity) => (
            <label
              key={amenity.value}
              className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.mustHaveAmenities.includes(amenity.value)
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={localData.mustHaveAmenities.includes(amenity.value)}
                onChange={() => toggleAmenity(amenity.value, "mustHave")}
                className="sr-only"
              />
              <span className="text-lg mr-3">{amenity.icon}</span>
              <span className="font-medium text-gray-900 flex-1">
                {amenity.label}
              </span>
              {localData.mustHaveAmenities.includes(amenity.value) && (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Nice-to-Have Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Nice-to-Have Amenities
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {niceToHaveAmenities.map((amenity) => (
            <label
              key={amenity.value}
              className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.niceToHaveAmenities.includes(amenity.value)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={localData.niceToHaveAmenities.includes(amenity.value)}
                onChange={() => toggleAmenity(amenity.value, "niceToHave")}
                className="sr-only"
              />
              <span className="text-lg mr-3">{amenity.icon}</span>
              <span className="font-medium text-gray-900 flex-1">
                {amenity.label}
              </span>
              {localData.niceToHaveAmenities.includes(amenity.value) && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Accessibility Needs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Accessibility className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Accessibility Requirements
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accessibilityOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.accessibilityNeeds.includes(option.value)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={localData.accessibilityNeeds.includes(option.value)}
                onChange={() => toggleAccessibility(option.value)}
                className="sr-only"
              />
              <span className="text-lg mr-3">{option.icon}</span>
              <span className="font-medium text-gray-900 flex-1">
                {option.label}
              </span>
              {localData.accessibilityNeeds.includes(option.value) && (
                <Check className="w-5 h-5 text-purple-600" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Location Flexibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Location Flexibility
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: "same_city",
              label: "Same City",
              description: "Within city limits only",
              icon: "🏙️",
            },
            {
              value: "nearby_cities",
              label: "Nearby Cities",
              description: "Within 50km radius",
              icon: "🗺️",
            },
            {
              value: "anywhere",
              label: "Anywhere",
              description: "Open to any location",
              icon: "🌍",
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                localData.locationFlexibility === option.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="locationFlexibility"
                value={option.value}
                checked={localData.locationFlexibility === option.value}
                onChange={(e) =>
                  updateData({ locationFlexibility: e.target.value as any })
                }
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{option.icon}</span>
                <span className="font-medium text-gray-900">
                  {option.label}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
