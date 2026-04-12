import { useState, useEffect } from "react";
import { Heart, Briefcase, Gift, Star } from "lucide-react";
import { EventSpecificData, EventType } from "@/types/ai-planner";

interface EventSpecificStepProps {
  value?: EventSpecificData;
  onChange: (data: EventSpecificData) => void;
  eventType: EventType;
  errors: Record<string, string>;
}

export default function EventSpecificStep({
  value,
  onChange,
  eventType,
  errors,
}: EventSpecificStepProps) {
  const [localData, setLocalData] = useState<EventSpecificData>(() => ({
    ...value,
  }));

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  const updateData = (updates: Partial<EventSpecificData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  // Wedding-specific form
  if (eventType === EventType.WEDDING) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Wedding Details
          </h3>
        </div>

        {/* Ceremony Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ceremony Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "religious", label: "Religious", icon: "⛪" },
              { value: "civil", label: "Civil", icon: "🏛️" },
              { value: "traditional", label: "Traditional", icon: "🌺" },
              { value: "destination", label: "Destination", icon: "✈️" },
            ].map((type) => (
              <label
                key={type.value}
                className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localData.weddingSpecific?.ceremonyType === type.value
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="ceremonyType"
                  value={type.value}
                  checked={
                    localData.weddingSpecific?.ceremonyType === type.value
                  }
                  onChange={(e) =>
                    updateData({
                      weddingSpecific: {
                        ceremonyType: e.target.value as any,
                        receptionStyle:
                          localData.weddingSpecific?.receptionStyle ||
                          "seated_dinner",
                        specialMoments:
                          localData.weddingSpecific?.specialMoments || [],
                        weddingPartySize: localData.weddingSpecific
                          ?.weddingPartySize || {
                          bridesmaids: 0,
                          groomsmen: 0,
                          flowergirls: 0,
                          ringbearers: 0,
                        },
                        mustHaveVendors:
                          localData.weddingSpecific?.mustHaveVendors || [],
                        weddingTraditions:
                          localData.weddingSpecific?.weddingTraditions || [],
                      },
                    })
                  }
                  className="sr-only"
                />
                <span className="text-xl mb-1">{type.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Must-Have Vendors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Must-Have Vendors
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "photographer", label: "Photographer", icon: "📸" },
              { value: "videographer", label: "Videographer", icon: "🎥" },
              { value: "dj", label: "DJ/Music", icon: "🎵" },
              { value: "florist", label: "Florist", icon: "💐" },
              { value: "makeup", label: "Makeup Artist", icon: "💄" },
              { value: "transportation", label: "Transportation", icon: "🚗" },
            ].map((vendor) => (
              <label
                key={vendor.value}
                className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localData.weddingSpecific?.mustHaveVendors?.includes(
                    vendor.value
                  )
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    localData.weddingSpecific?.mustHaveVendors?.includes(
                      vendor.value
                    ) || false
                  }
                  onChange={(e) => {
                    const current =
                      localData.weddingSpecific?.mustHaveVendors || [];
                    const updated = e.target.checked
                      ? [...current, vendor.value]
                      : current.filter((v) => v !== vendor.value);
                    updateData({
                      weddingSpecific: {
                        ceremonyType:
                          localData.weddingSpecific?.ceremonyType ||
                          "traditional",
                        receptionStyle:
                          localData.weddingSpecific?.receptionStyle ||
                          "seated_dinner",
                        specialMoments:
                          localData.weddingSpecific?.specialMoments || [],
                        weddingPartySize: localData.weddingSpecific
                          ?.weddingPartySize || {
                          bridesmaids: 0,
                          groomsmen: 0,
                          flowergirls: 0,
                          ringbearers: 0,
                        },
                        mustHaveVendors: updated,
                        weddingTraditions:
                          localData.weddingSpecific?.weddingTraditions || [],
                      },
                    });
                  }}
                  className="sr-only"
                />
                <span className="text-lg mr-3">{vendor.icon}</span>
                <span className="font-medium text-gray-900">
                  {vendor.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Corporate-specific form
  if (eventType === EventType.CORPORATE) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Corporate Event Details
          </h3>
        </div>

        {/* Event Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Event Purpose
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "conference", label: "Conference", icon: "🎤" },
              { value: "product_launch", label: "Product Launch", icon: "🚀" },
              { value: "team_building", label: "Team Building", icon: "🤝" },
              { value: "awards", label: "Awards Ceremony", icon: "🏆" },
              { value: "networking", label: "Networking", icon: "🌐" },
            ].map((purpose) => (
              <label
                key={purpose.value}
                className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localData.corporateSpecific?.eventPurpose === purpose.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="eventPurpose"
                  value={purpose.value}
                  checked={
                    localData.corporateSpecific?.eventPurpose === purpose.value
                  }
                  onChange={(e) =>
                    updateData({
                      corporateSpecific: {
                        eventPurpose: e.target.value as any,
                        companySize:
                          localData.corporateSpecific?.companySize || "medium",
                        brandGuidelines:
                          localData.corporateSpecific?.brandGuidelines || false,
                        techRequirements:
                          localData.corporateSpecific?.techRequirements || [],
                        businessObjectives:
                          localData.corporateSpecific?.businessObjectives || [],
                        attendeeTypes:
                          localData.corporateSpecific?.attendeeTypes || [],
                      },
                    })
                  }
                  className="sr-only"
                />
                <span className="text-xl mb-1">{purpose.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {purpose.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tech Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Technology Requirements
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "av_equipment", label: "AV Equipment", icon: "🎥" },
              { value: "live_streaming", label: "Live Streaming", icon: "📡" },
              { value: "wifi", label: "High-Speed WiFi", icon: "📶" },
              {
                value: "presentation_tools",
                label: "Presentation Tools",
                icon: "📊",
              },
            ].map((tech) => (
              <label
                key={tech.value}
                className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localData.corporateSpecific?.techRequirements?.includes(
                    tech.value
                  )
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    localData.corporateSpecific?.techRequirements?.includes(
                      tech.value
                    ) || false
                  }
                  onChange={(e) => {
                    const current =
                      localData.corporateSpecific?.techRequirements || [];
                    const updated = e.target.checked
                      ? [...current, tech.value]
                      : current.filter((t) => t !== tech.value);
                    updateData({
                      corporateSpecific: {
                        eventPurpose:
                          localData.corporateSpecific?.eventPurpose ||
                          "conference",
                        companySize:
                          localData.corporateSpecific?.companySize || "medium",
                        brandGuidelines:
                          localData.corporateSpecific?.brandGuidelines || false,
                        techRequirements: updated,
                        businessObjectives:
                          localData.corporateSpecific?.businessObjectives || [],
                        attendeeTypes:
                          localData.corporateSpecific?.attendeeTypes || [],
                      },
                    });
                  }}
                  className="sr-only"
                />
                <span className="text-lg mr-3">{tech.icon}</span>
                <span className="font-medium text-gray-900">{tech.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Birthday-specific form
  if (eventType === EventType.BIRTHDAY) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Birthday Party Details
          </h3>
        </div>

        {/* Celebrant Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Celebrant's Age
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={localData.birthdaySpecific?.celebrantAge || 25}
            onChange={(e) =>
              updateData({
                birthdaySpecific: {
                  celebrantAge: parseInt(e.target.value) || 25,
                  ageCategory:
                    localData.birthdaySpecific?.ageCategory || "adult",
                  theme: localData.birthdaySpecific?.theme || "",
                  activities: localData.birthdaySpecific?.activities || [],
                  giftPreferences:
                    localData.birthdaySpecific?.giftPreferences || "registry",
                  surpriseElement:
                    localData.birthdaySpecific?.surpriseElement || false,
                },
              })
            }
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Party Theme
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "elegant", label: "Elegant", icon: "✨" },
              { value: "fun", label: "Fun & Colorful", icon: "🎈" },
              { value: "surprise", label: "Surprise Party", icon: "🎉" },
              { value: "milestone", label: "Milestone Birthday", icon: "🎂" },
            ].map((theme) => (
              <label
                key={theme.value}
                className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  localData.birthdaySpecific?.theme === theme.value
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.value}
                  checked={localData.birthdaySpecific?.theme === theme.value}
                  onChange={(e) =>
                    updateData({
                      birthdaySpecific: {
                        celebrantAge:
                          localData.birthdaySpecific?.celebrantAge || 25,
                        ageCategory:
                          localData.birthdaySpecific?.ageCategory || "adult",
                        theme: e.target.value,
                        activities:
                          localData.birthdaySpecific?.activities || [],
                        giftPreferences:
                          localData.birthdaySpecific?.giftPreferences ||
                          "registry",
                        surpriseElement:
                          localData.birthdaySpecific?.surpriseElement || false,
                      },
                    })
                  }
                  className="sr-only"
                />
                <span className="text-xl mb-1">{theme.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {theme.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default for other event types
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Event-Specific Details
        </h3>
      </div>

      <div className="text-center py-8">
        <p className="text-gray-600">
          No specific requirements for {eventType} events at this time.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          You can add any special notes in the next step.
        </p>
      </div>
    </div>
  );
}
