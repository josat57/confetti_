import { useState, useEffect } from "react";
import { Users, Utensils, Accessibility } from "lucide-react";
import { GuestProfileData } from "@/types/ai-planner";

interface GuestProfileStepProps {
  value?: GuestProfileData;
  onChange: (data: GuestProfileData) => void;
  totalGuests: number;
  errors: Record<string, string>;
}

export default function GuestProfileStep({
  value,
  onChange,
  totalGuests,
  errors,
}: GuestProfileStepProps) {
  const [localData, setLocalData] = useState<GuestProfileData>(() => ({
    ageGroups: {
      children: 0,
      teens: 0,
      adults: Math.floor(totalGuests * 0.8),
      seniors: Math.floor(totalGuests * 0.2),
    },
    dietaryRestrictions: {
      vegetarian: 0,
      vegan: 0,
      halal: 0,
      kosher: 0,
      glutenFree: 0,
      allergies: [],
      other: "",
    },
    accessibilityNeeds: {
      wheelchair: 0,
      hearingImpaired: 0,
      visualImpaired: 0,
      other: "",
    },
    guestTypes: ["family", "friends"],
    outOfTownGuests: {
      count: 0,
      needAccommodation: false,
      needTransportation: false,
    },
    ...value,
  }));

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  const updateData = (updates: Partial<GuestProfileData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  const updateAgeGroups = (
    group: keyof GuestProfileData["ageGroups"],
    value: number
  ) => {
    updateData({
      ageGroups: { ...localData.ageGroups, [group]: value },
    });
  };

  const updateDietaryRestrictions = (
    restriction: keyof GuestProfileData["dietaryRestrictions"],
    value: number | string | string[]
  ) => {
    updateData({
      dietaryRestrictions: {
        ...localData.dietaryRestrictions,
        [restriction]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Age Groups */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Age Group Distribution
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "children", label: "Children (0-12)", icon: "👶" },
            { key: "teens", label: "Teens (13-17)", icon: "🧒" },
            { key: "adults", label: "Adults (18-64)", icon: "👩" },
            { key: "seniors", label: "Seniors (65+)", icon: "👴" },
          ].map((group) => (
            <div key={group.key} className="text-center">
              <div className="text-2xl mb-2">{group.icon}</div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {group.label}
              </label>
              <input
                type="number"
                min="0"
                max={totalGuests}
                value={
                  localData.ageGroups[
                    group.key as keyof typeof localData.ageGroups
                  ]
                }
                onChange={(e) =>
                  updateAgeGroups(
                    group.key as keyof typeof localData.ageGroups,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Dietary Restrictions
          </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "vegetarian", label: "Vegetarian", icon: "🥗" },
            { key: "vegan", label: "Vegan", icon: "🌱" },
            { key: "halal", label: "Halal", icon: "☪️" },
            { key: "kosher", label: "Kosher", icon: "✡️" },
            { key: "glutenFree", label: "Gluten Free", icon: "🌾" },
          ].map((restriction) => (
            <div key={restriction.key} className="text-center">
              <div className="text-xl mb-1">{restriction.icon}</div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {restriction.label}
              </label>
              <input
                type="number"
                min="0"
                max={totalGuests}
                value={
                  localData.dietaryRestrictions[
                    restriction.key as keyof typeof localData.dietaryRestrictions
                  ] as number
                }
                onChange={(e) =>
                  updateDietaryRestrictions(
                    restriction.key as keyof typeof localData.dietaryRestrictions,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Guest Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Guest Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
            { value: "friends", label: "Friends", icon: "👥" },
            { value: "colleagues", label: "Colleagues", icon: "💼" },
            { value: "clients", label: "Clients", icon: "🤝" },
          ].map((type) => (
            <label
              key={type.value}
              className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.guestTypes.includes(type.value)
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={localData.guestTypes.includes(type.value)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...localData.guestTypes, type.value]
                    : localData.guestTypes.filter((t) => t !== type.value);
                  updateData({ guestTypes: updated });
                }}
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

      {/* Out of Town Guests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Out-of-Town Guests
        </label>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Number of out-of-town guests
            </label>
            <input
              type="number"
              min="0"
              max={totalGuests}
              value={localData.outOfTownGuests.count}
              onChange={(e) =>
                updateData({
                  outOfTownGuests: {
                    ...localData.outOfTownGuests,
                    count: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {localData.outOfTownGuests.count > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.outOfTownGuests.needAccommodation}
                  onChange={(e) =>
                    updateData({
                      outOfTownGuests: {
                        ...localData.outOfTownGuests,
                        needAccommodation: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Need accommodation assistance
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.outOfTownGuests.needTransportation}
                  onChange={(e) =>
                    updateData({
                      outOfTownGuests: {
                        ...localData.outOfTownGuests,
                        needTransportation: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  Need transportation assistance
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
