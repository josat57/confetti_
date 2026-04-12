"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export default function MapModal({
  isOpen,
  onClose,
  onLocationSelect,
}: MapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (isOpen && !isMapLoaded) {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        setIsMapLoaded(true);
        return;
      }

      // If not loaded, add the script
      if (
        !document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        )
      ) {
        const script = document.createElement("script");
        scriptRef.current = script;
        // Updated to use the newer Places API
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setError(
            "Failed to load Google Maps. Please check your API key and API activation status."
          );
        };
        document.head.appendChild(script);

        // Define the callback function
        window.initMap = () => {
          try {
            initializeMap();
            setIsMapLoaded(true);
          } catch (err) {
            console.error("Map initialization error:", err);
            setError(
              "Failed to initialize Google Maps. Please check your API key and API activation status."
            );
          }
        };

        return () => {
          if (scriptRef.current && document.head.contains(scriptRef.current)) {
            document.head.removeChild(scriptRef.current);
          }
          if (window.initMap) {
            delete window.initMap;
          }
        };
      }
    }
  }, [isOpen, isMapLoaded]);

  const initializeMap = () => {
    if (!window.google) {
      throw new Error("Google Maps not loaded");
    }

    // Nigeria's coordinates
    const defaultLocation = { lat: 9.082, lng: 8.6753 };
    const mapElement = document.getElementById("map");

    if (!mapElement) {
      throw new Error("Map element not found");
    }

    try {
      // Initialize map
      mapRef.current = new window.google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 6,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Initialize search box with newer Places API
      const input = document.createElement("input");
      input.className =
        "w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent";
      input.placeholder = "Search for a location...";
      input.value = searchQuery;
      input.oninput = (e) =>
        setSearchQuery((e.target as HTMLInputElement).value);

      // Create a new instance of the Places service
      const placesService = new window.google.maps.places.PlacesService(
        mapRef.current
      );
      searchBoxRef.current = new window.google.maps.places.SearchBox(input);
      mapElement.parentElement?.insertBefore(input, mapElement);

      // Add search box listener
      searchBoxRef.current?.addListener("places_changed", () => {
        const places = searchBoxRef.current?.getPlaces();
        if (!places || places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        // Update map
        mapRef.current?.setCenter(place.geometry.location);
        mapRef.current?.setZoom(15);

        // Update marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: place.geometry.location,
          animation: window.google.maps.Animation.DROP,
        });

        // Update selected location and close modal
        const address = place.formatted_address || "";
        setSelectedLocation(address);
        onLocationSelect(address);
        onClose();
      });

      // Add click listener to map
      mapRef.current?.addListener("click", (e: google.maps.MapMouseEvent) => {
        const latLng = e.latLng;
        if (!latLng) return;

        // Update marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: latLng,
          animation: window.google.maps.Animation.DROP,
        });

        // Use Places service for reverse geocoding
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: latLng },
          (results: any, status: string) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              setSelectedLocation(address);
              onLocationSelect(address);
              onClose();
            } else {
              setError(
                "Failed to get address for selected location. Please try searching instead."
              );
              // Set a temporary location based on coordinates
              const tempLocation = `${latLng.lat().toFixed(6)}, ${latLng
                .lng()
                .toFixed(6)}`;
              setSelectedLocation(tempLocation);
            }
          }
        );
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(
        "Failed to initialize Google Maps. Please check your API key and API activation status."
      );
      throw err;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Location
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-b">{error}</div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative">
            <div id="map" className="w-full h-full rounded-b-2xl" />
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-4 z-[9999]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedLocation) {
                  onLocationSelect(selectedLocation);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedLocation}
            >
              Confirm Location
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
