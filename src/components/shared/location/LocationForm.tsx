"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  ChevronDown,
  Navigation,
  Bookmark,
  Clock,
  X,
  Check,
} from "lucide-react";
import {
  LocationData,
  SavedLocation,
  NigerianState,
  Country,
} from "@/services/location.service";
import locationService from "@/services/location.service";
import MapModal from "./MapModal";

interface LocationFormProps {
  value: Partial<LocationData>;
  onChange: (location: Partial<LocationData>) => void;
  onValidation?: (errors: string[]) => void;
  className?: string;
  required?: boolean;
}

export default function LocationForm({
  value,
  onChange,
  onValidation,
  className = "",
  required = false,
}: LocationFormProps) {
  const [showMapModal, setShowMapModal] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<NigerianState[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    // Load cities when country changes
    if (value.country) {
      loadCitiesForCountry(value.country);
    }
  }, [value.country]);

  useEffect(() => {
    // Load LGAs when state changes (for Nigeria)
    if (value.country === "Nigeria" && value.state) {
      const selectedState = states.find((s) => s.name === value.state);
      if (selectedState) {
        setLgas(selectedState.lgas);
      }
    }
  }, [value.state, states]);

  useEffect(() => {
    // Validate location data
    const validationErrors = locationService.validateLocation(value);
    setErrors(validationErrors);
    if (onValidation) {
      onValidation(validationErrors);
    }
  }, [value, onValidation]);

  const initializeData = async () => {
    try {
      // Load countries
      const countriesData = await locationService.loadCountries();
      setCountries(countriesData);

      // Load Nigerian states
      const statesData = locationService.getNigerianStates();
      setStates(statesData);

      // Load saved locations
      setSavedLocations(locationService.getSavedLocations());

      // Set default country to Nigeria if not set
      if (!value.country) {
        onChange({ ...value, country: "Nigeria" });
      }
    } catch (error) {
      console.error("Failed to initialize location data:", error);
    }
  };

  const handleAddressSearch = async (address: string) => {
    if (address.length < 3) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const suggestions = data.map((item: any) => item.display_name);
        setAddressSuggestions(suggestions.slice(0, 5));
        setShowAddressSuggestions(true);
      }
    } catch (error) {
      console.error("Address search error:", error);
    }
  };

  const loadCitiesForCountry = async (countryName: string) => {
    try {
      const citiesData = await locationService.getCitiesForCountry(countryName);
      setCities(citiesData);

      // Clear city and state if country changed
      if (value.country !== countryName) {
        onChange({
          ...value,
          country: countryName,
          state: "",
          city: "",
        });
      }
    } catch (error) {
      console.error("Failed to load cities:", error);
    }
  };

  const handleCountryChange = (countryName: string) => {
    onChange({
      ...value,
      country: countryName,
      state: "",
      city: "",
    });
    loadCitiesForCountry(countryName);
  };

  const handleStateChange = (stateName: string) => {
    onChange({
      ...value,
      state: stateName,
      city: "",
    });

    // Load cities for the selected state (Nigeria)
    if (value.country === "Nigeria") {
      const citiesForState = locationService.getCitiesForState(stateName);
      setCities(citiesForState);
    }
  };

  const handleMapLocationSelect = (location: LocationData) => {
    onChange(location);
    setShowMapModal(false);
  };

  const handleSavedLocationSelect = (location: SavedLocation) => {
    onChange(location);
    setShowSavedLocations(false);
  };

  const handleCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coordinates = await locationService.getCurrentLocation();
      if (coordinates) {
        const locationData = await locationService.reverseGeocode(
          coordinates.lat,
          coordinates.lng
        );
        if (locationData) {
          onChange(locationData);
        }
      }
    } catch (error) {
      console.error("Failed to get current location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleAddressChange = (address: string) => {
    onChange({ ...value, address });

    // Debounced address search
    if (address.length > 2) {
      const timeoutId = setTimeout(() => {
        handleAddressSearch(address);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="flex items-center px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use Map
        </button>

        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isLoadingLocation ? "Getting Location..." : "Current Location"}
        </button>

        {savedLocations.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSavedLocations(!showSavedLocations)}
            className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Saved Locations
          </button>
        )}
      </div>

      {/* Saved Locations Dropdown */}
      <AnimatePresence>
        {showSavedLocations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Saved Locations</h4>
              <button
                onClick={() => setShowSavedLocations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {savedLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSavedLocationSelect(location)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {location.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {locationService.formatLocationDisplay(location)}
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(location.lastUsed).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address Field */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              value={value.address || ""}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() =>
                value.address &&
                value.address.length > 2 &&
                handleAddressSearch(value.address)
              }
              placeholder="Enter street address"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.includes("Address is required")
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            />
            <Search className="h-5 w-5 absolute right-3 top-3 text-gray-400" />

            {/* Address Suggestions */}
            {showAddressSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onChange({ ...value, address: suggestion });
                      setShowAddressSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.includes("Address is required") && (
            <p className="text-red-500 text-sm mt-1">Address is required</p>
          )}
        </div>

        {/* Country Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={value.country || ""}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none ${
                errors.includes("Country is required")
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-5 w-5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
          {errors.includes("Country is required") && (
            <p className="text-red-500 text-sm mt-1">Country is required</p>
          )}
        </div>

        {/* State Field (for Nigeria) */}
        {value.country === "Nigeria" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <div className="relative">
              <select
                value={value.state || ""}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* State Field (for other countries) */}
        {value.country && value.country !== "Nigeria" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={value.state || ""}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              placeholder="Enter state or province"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )}

        {/* City Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City {required && <span className="text-red-500">*</span>}
          </label>
          {value.country === "Nigeria" ? (
            <div className="relative">
              <select
                value={value.city || ""}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none ${
                  errors.includes("City is required")
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <input
              type="text"
              value={value.city || ""}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="Enter city"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.includes("City is required")
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            />
          )}
          {errors.includes("City is required") && (
            <p className="text-red-500 text-sm mt-1">City is required</p>
          )}
        </div>

        {/* LGA Field (for Nigeria) */}
        {value.country === "Nigeria" && value.state && lgas.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local Government Area
            </label>
            <div className="relative">
              <select
                value={(value as any).lga || ""}
                onChange={(e) =>
                  onChange({ ...value, lga: e.target.value } as any)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="">Select LGA</option>
                {lgas.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {value.coordinates && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">
                Location Coordinates
              </h4>
              <p className="text-sm text-gray-600">
                Latitude: {value.coordinates.lat?.toFixed(6)}, Longitude:{" "}
                {value.coordinates.lng?.toFixed(6)}
              </p>
            </div>
            <Check className="h-5 w-5 text-green-500" />
          </div>
        </div>
      )}

      {/* Map Modal */}
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={value.coordinates}
      />
    </div>
  );
}
