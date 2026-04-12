import { useState, useEffect } from "react";
import { User, Palette, Music } from "lucide-react";
import { ClientProfileData } from "@/types/ai-planner";

interface ClientProfileStepProps {
  value?: ClientProfileData;
  onChange: (data: ClientProfileData) => void;
  errors: Record<string, string>;
}

export default function ClientProfileStep({
  value,
  onChange,
  errors,
}: ClientProfileStepProps) {
  const [localData, setLocalData] = useState<ClientProfileData>(() => ({
    demographics: {
      age: 30,
      occupation: "professional",
      lifestyle: "modern",
      personality: "balanced",
      eventExperience: "some_experience",
    },
    stylePreferences: {
      colorScheme: ["purple", "white"],
      musicGenre: ["contemporary"],
      foodStyle: "plated",
      formalityLevel: "semi_formal",
      photographyStyle: "candid",
    },
    culturalBackground: {
      ethnicity: "nigerian",
      religion: "christian",
      importantTraditions: [],
      languages: ["english"],
    },
    ...value,
  }));

  useEffect(() => {
    onChange(localData);
  }, [localData, onChange]);

  const updateData = (updates: Partial<ClientProfileData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
  };

  const updateDemographics = (
    updates: Partial<ClientProfileData["demographics"]>
  ) => {
    updateData({ demographics: { ...localData.demographics, ...updates } });
  };

  const updateStylePreferences = (
    updates: Partial<ClientProfileData["stylePreferences"]>
  ) => {
    updateData({
      stylePreferences: { ...localData.stylePreferences, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Demographics
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Age</label>
            <input
              type="number"
              min="18"
              max="100"
              value={localData.demographics.age}
              onChange={(e) =>
                updateDemographics({ age: parseInt(e.target.value) || 30 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Occupation
            </label>
            <select
              value={localData.demographics.occupation}
              onChange={(e) =>
                updateDemographics({ occupation: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="business_owner">Business Owner</option>
              <option value="student">Student</option>
              <option value="creative">Creative</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Lifestyle
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { value: "modern", label: "Modern", icon: "🏢" },
            { value: "traditional", label: "Traditional", icon: "🏛️" },
            { value: "luxury", label: "Luxury", icon: "💎" },
            { value: "minimalist", label: "Minimalist", icon: "⚪" },
            { value: "bohemian", label: "Bohemian", icon: "🌸" },
          ].map((style) => (
            <label
              key={style.value}
              className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.demographics.lifestyle === style.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="lifestyle"
                value={style.value}
                checked={localData.demographics.lifestyle === style.value}
                onChange={(e) =>
                  updateDemographics({ lifestyle: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="text-xl mb-1">{style.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {style.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            Preferred Colors (Max 3)
          </label>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            { value: "purple", color: "bg-purple-500" },
            { value: "blue", color: "bg-blue-500" },
            { value: "green", color: "bg-green-500" },
            { value: "pink", color: "bg-pink-500" },
            { value: "red", color: "bg-red-500" },
            { value: "yellow", color: "bg-yellow-500" },
            { value: "orange", color: "bg-orange-500" },
            { value: "gray", color: "bg-gray-500" },
            { value: "white", color: "bg-white border-2 border-gray-300" },
            { value: "black", color: "bg-black" },
            { value: "gold", color: "bg-yellow-400" },
            { value: "silver", color: "bg-gray-300" },
          ].map((color) => (
            <label
              key={color.value}
              className={`relative w-12 h-12 rounded-lg cursor-pointer transition-all ${
                color.color
              } ${
                localData.stylePreferences.colorScheme.includes(color.value)
                  ? "ring-4 ring-purple-500 ring-offset-2"
                  : "hover:scale-105"
              }`}
            >
              <input
                type="checkbox"
                checked={localData.stylePreferences.colorScheme.includes(
                  color.value
                )}
                onChange={(e) => {
                  const current = localData.stylePreferences.colorScheme;
                  let updated;
                  if (e.target.checked && current.length < 3) {
                    updated = [...current, color.value];
                  } else if (!e.target.checked) {
                    updated = current.filter((c) => c !== color.value);
                  } else {
                    updated = current; // Don't add if already at max
                  }
                  updateStylePreferences({ colorScheme: updated });
                }}
                className="sr-only"
              />
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Selected:{" "}
          {localData.stylePreferences.colorScheme.join(", ") || "None"}
        </p>
      </div>

      {/* Food Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Food Service Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              value: "buffet",
              label: "Buffet",
              description: "Self-service",
              icon: "🍽️",
            },
            {
              value: "plated",
              label: "Plated",
              description: "Served at table",
              icon: "🍽️",
            },
            {
              value: "family_style",
              label: "Family Style",
              description: "Shared dishes",
              icon: "👨‍👩‍👧‍👦",
            },
            {
              value: "cocktail",
              label: "Cocktail",
              description: "Finger foods",
              icon: "🍸",
            },
          ].map((style) => (
            <label
              key={style.value}
              className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.stylePreferences.foodStyle === style.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="foodStyle"
                value={style.value}
                checked={localData.stylePreferences.foodStyle === style.value}
                onChange={(e) =>
                  updateStylePreferences({ foodStyle: e.target.value as any })
                }
                className="sr-only"
              />
              <span className="text-xl mb-1">{style.icon}</span>
              <span className="font-medium text-gray-900">{style.label}</span>
              <span className="text-sm text-gray-600">{style.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Formality Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Formality Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "casual", label: "Casual", icon: "👕" },
            { value: "semi_formal", label: "Semi-Formal", icon: "👔" },
            { value: "formal", label: "Formal", icon: "🤵" },
            { value: "black_tie", label: "Black Tie", icon: "🎩" },
          ].map((level) => (
            <label
              key={level.value}
              className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                localData.stylePreferences.formalityLevel === level.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="formalityLevel"
                value={level.value}
                checked={
                  localData.stylePreferences.formalityLevel === level.value
                }
                onChange={(e) =>
                  updateStylePreferences({
                    formalityLevel: e.target.value as any,
                  })
                }
                className="sr-only"
              />
              <span className="text-xl mb-1">{level.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {level.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
