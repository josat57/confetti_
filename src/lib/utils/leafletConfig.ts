/**
 * Leaflet Configuration Utility
 *
 * This file configures Leaflet for use in Next.js with proper icon paths.
 * Import this in components that use Leaflet to ensure icons display correctly.
 */

import L from "leaflet";

// Fix for default marker icons in Next.js
export const configureLeafletIcons = () => {
  // Delete the default icon URL getter
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  // Set new default icon URLs
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

// Custom marker icon with purple color to match the app theme
export const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: #9333ea;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default configureLeafletIcons;
