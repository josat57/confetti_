import { useState } from "react";
import { MapPin, Edit3 } from "lucide-react";
import { LocationData } from "@/types/ai-planner";
import MapPicker from "./MapPicker";
import ManualLocationForm from "./ManualLocationForm";

interface LocationStepProps {
  location: LocationData;
  onChange: (location: LocationData) => void;
  errors?: {
    locationAddress?: string;
    locationCity?: string;
    locationState?: string;
  };
}

export default function LocationStep({
  location,
  onChange,
  errors,
}: LocationStepProps) {
  const [useMap, setUseMap] = useState(location.method === "map");

  const handleLocationSelect = (newLocation: LocationData) => {
    onChange(newLocation);
  };

  const toggleMethod = () => {
    setUseMap(!useMap);
    onChange({
      ...location,
      method: useMap ? "manual" : "map",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Event Location
          </h3>
        </div>
        <button
          type="button"
          onClick={toggleMethod}
          className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          {useMap ? "Use Manual Entry" : "Use Map Picker"}
        </button>
      </div>

      {/* Content */}
      {useMap ? (
        <MapPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={
            location.latitude && location.longitude
              ? { lat: location.latitude, lng: location.longitude }
              : undefined
          }
          onToggleManualEntry={toggleMethod}
        />
      ) : (
        <ManualLocationForm
          location={location}
          onChange={onChange}
          errors={errors}
        />
      )}

      {/* Selected Location Display */}
      {location.address && location.city && location.state && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">Selected Location</p>
              <p className="text-sm text-purple-700 mt-1">{location.address}</p>
              <p className="text-sm text-purple-600">
                {location.city}, {location.state}
              </p>
              {location.latitude && location.longitude && (
                <p className="text-xs text-purple-500 mt-1">
                  Coordinates: {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
