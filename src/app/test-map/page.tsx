"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
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
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function TestMapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Configure Leaflet icons
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <LeafletLoader />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Map Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            This is a simple test to verify Leaflet map is working correctly.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-blue-900 mb-2">
                ✅ What You Should See:
              </h2>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Interactive map with street tiles</li>
                <li>• Blue marker in London</li>
                <li>• Ability to zoom in/out</li>
                <li>• Ability to pan around</li>
                <li>• Click marker to see popup</li>
              </ul>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300">
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[51.505, -0.09]}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Map is working! 🎉</p>
                      <p className="text-sm text-gray-600">London, UK</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="font-semibold text-green-900 mb-2">
                ✅ If Map is Working:
              </h2>
              <p className="text-sm text-green-800">
                Great! The Leaflet integration is working correctly. You can now
                use the AI Event Planner map feature.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="font-semibold text-red-900 mb-2">
                ❌ If Map is NOT Working:
              </h2>
              <ul className="text-sm text-red-800 space-y-1">
                <li>1. Open browser console (F12) and check for errors</li>
                <li>2. Clear cache and hard refresh (Ctrl+Shift+R)</li>
                <li>3. Stop dev server and run: rm -rf .next && npm run dev</li>
                <li>4. Check docs/MAP_TROUBLESHOOTING.md for detailed help</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <a
                href="/ai-event-planner"
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-medium"
              >
                Go to AI Event Planner
              </a>
              <a
                href="/"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Technical Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Map Library:</p>
              <p className="text-gray-600">Leaflet 1.9.4</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">React Integration:</p>
              <p className="text-gray-600">React-Leaflet 4.2.1</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Tile Provider:</p>
              <p className="text-gray-600">OpenStreetMap (Free)</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">API Keys:</p>
              <p className="text-gray-600">None Required ✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
