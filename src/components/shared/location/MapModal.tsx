"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Search,
  Crosshair,
  Navigation,
  Bookmark,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import { LocationData, SavedLocation } from "@/services/location.service";
import locationService from "@/services/location.service";
import dynamic from "next/dynamic";
import LeafletLoader from "@/components/shared/LeafletLoader";

// Dynamic imports for Leaflet components (SSR-safe)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
}

// LocationMarker component that handles map clicks
function LocationMarker({ position, setPosition }: any) {
  const [useMapEventsHook, setUseMapEventsHook] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setUseMapEventsHook(() => mod.useMapEvents);
    });
  }, []);

  if (!useMapEventsHook) return null;

  const MapEventsComponent = () => {
    const map = useMapEventsHook({
      click(e: any) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });
    return position === null ? null : <Marker position={position} />;
  };

  return <MapEventsComponent />;
}

export default function MapModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: MapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>(
    initialLocation
      ? [initialLocation.lat, initialLocation.lng]
      : [9.082, 8.6753] // Nigeria center coordinates
  );
  const [markerPosition, setMarkerPosition] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSavedLocations(locationService.getSavedLocations());
      setIsMounted(true);

      // Configure Leaflet icons for Next.js
      import("@/lib/utils/leafletConfig")
        .then((module) => {
          module.configureLeafletIcons();
        })
        .catch((error) => {
          console.error("Failed to load Leaflet config:", error);
        });

      // Set initial marker if location provided
      if (initialLocation) {
        setMarkerPosition({
          lat: initialLocation.lat,
          lng: initialLocation.lng,
        });
        handleLocationChange(initialLocation.lat, initialLocation.lng);
      }
    }
  }, [isOpen]);

  const handleLocationChange = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      // Use OpenStreetMap Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data && data.address) {
        const locationData: LocationData = {
          address: data.display_name.split(",")[0] || data.display_name,
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          state: data.address.state || "",
          country: data.address.country || "Nigeria",
          coordinates: { lat, lng },
        };
        setSelectedLocation(locationData);
      }
    } catch (error) {
      console.error("Failed to get location details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const { lat, lng } = location;
        setMapPosition([lat, lng]);
        setMarkerPosition({ lat, lng });
        await handleLocationChange(lat, lng);
      }
    } catch (error) {
      console.error("Failed to get current location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavedLocationSelect = (location: SavedLocation) => {
    const { lat, lng } = location.coordinates;
    setMapPosition([lat, lng]);
    setMarkerPosition({ lat, lng });
    setSelectedLocation(location);
    setShowSavedLocations(false);
  };

  const handleDeleteSavedLocation = (id: string) => {
    locationService.deleteSavedLocation(id);
    setSavedLocations(locationService.getSavedLocations());
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchValue
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setMapPosition([lat, lng]);
        setMarkerPosition({ lat, lng });
        await handleLocationChange(lat, lng);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapClick = (latlng: any) => {
    setMarkerPosition(latlng);
    handleLocationChange(latlng.lat, latlng.lng);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      const name = prompt("Enter a name for this location:");
      if (name) {
        locationService.saveLocation(selectedLocation, name);
        setSavedLocations(locationService.getSavedLocations());
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <LeafletLoader />
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-4 bg-white rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                Select Location
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex">
            {/* Map Container */}
            <div className="flex-1 relative">
              {/* Search Bar */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for places..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    title="Search location"
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={handleCurrentLocation}
                    disabled={isLoading}
                    className="p-3 bg-white border border-gray-300 rounded-xl shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Use current location"
                  >
                    <Navigation className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowSavedLocations(!showSavedLocations)}
                    className="p-3 bg-white border border-gray-300 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                    title="Saved locations"
                  >
                    <Bookmark className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Saved Locations Panel */}
              {showSavedLocations && (
                <div className="absolute top-20 left-4 w-80 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">
                      Saved Locations
                    </h3>
                  </div>
                  {savedLocations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No saved locations yet
                    </div>
                  ) : (
                    <div className="p-2">
                      {savedLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleSavedLocationSelect(location)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {location.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {locationService.formatLocationDisplay(location)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedLocation(location.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Map */}
              {!isMounted ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="w-full h-full">
                  <MapContainer
                    center={mapPosition}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      position={markerPosition}
                      setPosition={handleMapClick}
                    />
                  </MapContainer>
                </div>
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="text-gray-600">Loading location...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-200 p-6 flex flex-col">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Location Details
              </h3>

              {selectedLocation ? (
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                      {selectedLocation.address}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                      {selectedLocation.city}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                      {selectedLocation.state}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                      {selectedLocation.country}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coordinates
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                      {selectedLocation.coordinates.lat.toFixed(6)},{" "}
                      {selectedLocation.coordinates.lng.toFixed(6)}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={handleSaveLocation}
                      className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Crosshair className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Click on the map to select a location</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={!selectedLocation}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
