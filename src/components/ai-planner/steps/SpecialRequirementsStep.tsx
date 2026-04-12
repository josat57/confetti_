import { useState, useEffect, useCallback } from "react";
import { Cloud, Settings, FileText } from "lucide-react";
import { SpecialRequirementsData } from "@/types/ai-planner";

interface SpecialRequirementsStepProps {
  value?: SpecialRequirementsData;
  onChange: (data: SpecialRequirementsData) => void;
  errors: Record<string, string>;
}

export default function SpecialRequirementsStep({
  value,
  onChange,
  errors,
}: SpecialRequirementsStepProps) {
  const [localData, setLocalData] = useState<SpecialRequirementsData>(() => ({
    weatherConsiderations: {
      outdoorElements: false,
      weatherBackupPlan: false,
      seasonalFactors: "",
    },
    logisticalNeeds: {
      setupTime: "4_hours",
      cleanupRequirements: "basic",
      storageNeeds: "minimal",
      securityNeeds: "basic",
    },
    customRequirements: "",
    ...value,
  }));

  // Only call onChange when localData actually changes, not on every render
  useEffect(() => {
    // Only update if the data is different from the initial value
    if (JSON.stringify(localData) !== JSON.stringify(value)) {
      onChange(localData);
    }
  }, [localData]); // Remove onChange from dependencies to prevent infinite loop

  const updateData = useCallback(
    (updates: Partial<SpecialRequirementsData>) => {
      setLocalData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateWeatherConsiderations = useCallback(
    (updates: Partial<SpecialRequirementsData["weatherConsiderations"]>) => {
      setLocalData((prev) => ({
        ...prev,
        weatherConsiderations: { ...prev.weatherConsiderations, ...updates },
      }));
    },
    []
  );

  const updateLogisticalNeeds = useCallback(
    (updates: Partial<SpecialRequirementsData["logisticalNeeds"]>) => {
      setLocalData((prev) => ({
        ...prev,
        logisticalNeeds: { ...prev.logisticalNeeds, ...updates },
      }));
    },
    []
  );

  return (
    <div className="space-y-8">
      {/* Weather Considerations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Weather Considerations
          </h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localData.weatherConsiderations.outdoorElements}
              onChange={(e) =>
                updateWeatherConsiderations({
                  outdoorElements: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Event has outdoor elements
            </span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localData.weatherConsiderations.weatherBackupPlan}
              onChange={(e) =>
                updateWeatherConsiderations({
                  weatherBackupPlan: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Need weather backup plan
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seasonal factors to consider
            </label>
            <textarea
              value={localData.weatherConsiderations.seasonalFactors}
              onChange={(e) =>
                updateWeatherConsiderations({ seasonalFactors: e.target.value })
              }
              placeholder="e.g., Rainy season considerations, heat management, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Logistical Needs */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Logistical Requirements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Setup Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Setup Time Needed
            </label>
            <div className="space-y-2">
              {[
                {
                  value: "2_hours",
                  label: "2 hours",
                  description: "Simple setup",
                },
                {
                  value: "4_hours",
                  label: "4 hours",
                  description: "Standard setup",
                },
                {
                  value: "full_day",
                  label: "Full day",
                  description: "Complex setup",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    localData.logisticalNeeds.setupTime === option.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="setupTime"
                    value={option.value}
                    checked={
                      localData.logisticalNeeds.setupTime === option.value
                    }
                    onChange={(e) =>
                      updateLogisticalNeeds({
                        setupTime: e.target.value as any,
                      })
                    }
                    className="sr-only"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Security Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Security Requirements
            </label>
            <div className="space-y-2">
              {[
                {
                  value: "none",
                  label: "None",
                  description: "No security needed",
                },
                {
                  value: "basic",
                  label: "Basic",
                  description: "Venue security only",
                },
                {
                  value: "professional",
                  label: "Professional",
                  description: "Dedicated security team",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    localData.logisticalNeeds.securityNeeds === option.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="securityNeeds"
                    value={option.value}
                    checked={
                      localData.logisticalNeeds.securityNeeds === option.value
                    }
                    onChange={(e) =>
                      updateLogisticalNeeds({
                        securityNeeds: e.target.value as any,
                      })
                    }
                    className="sr-only"
                  />
                  <div>
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Requirements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Requirements
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any other specific needs or preferences?
          </label>
          <textarea
            value={localData.customRequirements}
            onChange={(e) => updateData({ customRequirements: e.target.value })}
            placeholder="Please describe any special requirements, cultural considerations, accessibility needs, or other important details..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-600 mt-1">
            This information helps our AI create a more personalized and
            accurate event plan.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-2">
          🎉 Ready to Generate Your Plan!
        </h4>
        <p className="text-sm text-green-800">
          You've provided comprehensive information about your event. Our AI
          will now create a detailed, personalized event plan that takes into
          account all your preferences, requirements, and constraints.
        </p>
      </div>
    </div>
  );
}
