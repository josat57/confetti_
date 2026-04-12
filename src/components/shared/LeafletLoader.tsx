"use client";

import { useEffect } from "react";

/**
 * Component to dynamically load Leaflet CSS
 * This prevents SSR issues with Leaflet
 */
export default function LeafletLoader() {
  useEffect(() => {
    // Dynamically load Leaflet CSS only on client side
    if (
      typeof window !== "undefined" &&
      !document.querySelector('link[href*="leaflet.css"]')
    ) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
