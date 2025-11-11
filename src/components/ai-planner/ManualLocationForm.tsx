import { MapPin } from "lucide-react";
import { LocationData } from "@/types/ai-planner";

interface ManualLocationFormProps {
  location: LocationData;
  onChange: (location: LocationData) => void;
  errors?: {
    locationAddress?: string;
    locationCity?: string;
    locationState?: string;
  };
}

// US States for dropdown
const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

// Major cities by state (simplified - you can expand this)
const CITIES_BY_STATE: Record<string, string[]> = {
  California: [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "San Jose",
    "Sacramento",
  ],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
  Texas: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
  Illinois: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford"],
  // Add more as needed
};

export default function ManualLocationForm({
  location,
  onChange,
  errors,
}: ManualLocationFormProps) {
  const handleStateChange = (state: string) => {
    onChange({
      ...location,
      state,
      city: "", // Reset city when state changes
      method: "manual",
    });
  };

  const handleCityChange = (city: string) => {
    onChange({
      ...location,
      city,
      method: "manual",
    });
  };

  const handleAddressChange = (address: string) => {
    onChange({
      ...location,
      address,
      method: "manual",
    });
  };

  const availableCities = location.state
    ? CITIES_BY_STATE[location.state] || []
    : [];

  return (
    <div className="space-y-4">
      {/* State Selection */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 mr-2" />
          State <span className="text-red-500">*</span>
        </label>
        <select
          value={location.state}
          onChange={(e) => handleStateChange(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors?.locationState
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-colors`}
          aria-label="Select state"
          aria-invalid={!!errors?.locationState}
        >
          <option value="">Select state</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors?.locationState && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.locationState}
          </p>
        )}
      </div>

      {/* City Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          City <span className="text-red-500">*</span>
        </label>
        {availableCities.length > 0 ? (
          <select
            value={location.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!location.state}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors?.locationCity
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Select city"
            aria-invalid={!!errors?.locationCity}
          >
            <option value="">Select city</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={location.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!location.state}
            placeholder="Enter city name"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors?.locationCity
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            } focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Enter city"
            aria-invalid={!!errors?.locationCity}
          />
        )}
        {errors?.locationCity && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.locationCity}
          </p>
        )}
        {!location.state && (
          <p className="text-sm text-gray-500">Select a state first</p>
        )}
      </div>

      {/* Address Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={location.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Enter street address or venue name"
          className={`w-full px-4 py-3 rounded-lg border ${
            errors?.locationAddress
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          } focus:ring-2 focus:border-transparent transition-colors`}
          aria-label="Enter address"
          aria-invalid={!!errors?.locationAddress}
        />
        {errors?.locationAddress && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.locationAddress}
          </p>
        )}
      </div>

      {/* Location Summary */}
      {location.address && location.city && location.state && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">📍 Location:</p>
          <p className="text-sm text-green-700 mt-1">
            {location.address}, {location.city}, {location.state}
          </p>
        </div>
      )}
    </div>
  );
}
