"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { LocationData } from "@/types/ai-planner";
import dynamic from "next/dynamic";
import LeafletLoader from "@/components/shared/LeafletLoader";

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

interface MapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  onToggleManualEntry: () => void;
}

// LocationMarker component that uses useMapEvents
function LocationMarker({ position, setPosition }: any) {
  // Import useMapEvents dynamically within the component
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

export default function MapPicker({
  onLocationSelect,
  initialLocation,
  onToggleManualEntry,
}: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [mapPosition, setMapPosition] = useState<[number, number]>(
    initialLocation
      ? [initialLocation.lat, initialLocation.lng]
      : [37.7749, -122.4194]
  );
  const [markerPosition, setMarkerPosition] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Configure Leaflet icons for Next.js
    import("@/lib/utils/leafletConfig")
      .then((module) => {
        module.configureLeafletIcons();
      })
      .catch((error) => {
        console.error("Failed to load Leaflet config:", error);
      });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        setMapPosition([lat, lon]);
        setMarkerPosition({ lat, lng: lon });
        await reverseGeocode(lat, lon);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      if (data && data.address) {
        const location: LocationData = {
          method: "map",
          latitude: lat,
          longitude: lon,
          address: data.display_name.split(",")[0] || data.display_name,
          city:
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "",
          state: data.address.state || "",
          country: data.address.country || "USA",
        };
        setSelectedLocation(location);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const handleMapClick = (latlng: any) => {
    setMarkerPosition(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LeafletLoader />
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Search className="w-4 h-4 mr-2" />
          Search Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a location, address, or venue..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300">
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

        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">Selected Location</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLocation.address}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedLocation.city}, {selectedLocation.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null);
                  setMarkerPosition(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
        <button
          type="button"
          onClick={onToggleManualEntry}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Use Manual Entry
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Search for your venue name, address, or city,
          then click on the map to fine-tune the location.
        </p>
      </div>
    </div>
  );
}
