/**
 * Location Service
 * Handles location data, geocoding, and map integration
 */

import nigeriaData from "@/data/nigeria-locations.json";

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Country {
  name: string;
  code: string;
  cities: string[];
}

export interface NigerianState {
  name: string;
  code: string;
  capital: string;
  cities: string[];
  lgas: string[];
}

export interface SavedLocation extends LocationData {
  id: string;
  name: string;
  lastUsed: string;
}

class LocationService {
  private savedLocations: SavedLocation[] = [];
  private countries: Country[] = [];

  constructor() {
    this.loadSavedLocations();
    this.loadCountries();
  }

  /**
   * Get Nigerian states data
   */
  getNigerianStates(): NigerianState[] {
    return nigeriaData.states;
  }

  /**
   * Get major Nigerian cities (prioritized)
   */
  getMajorNigerianCities() {
    return nigeriaData.majorCities;
  }

  /**
   * Get cities for a specific Nigerian state
   */
  getCitiesForState(stateName: string): string[] {
    const state = nigeriaData.states.find((s) => s.name === stateName);
    return state ? state.cities : [];
  }

  /**
   * Get LGAs for a specific Nigerian state
   */
  getLGAsForState(stateName: string): string[] {
    const state = nigeriaData.states.find((s) => s.name === stateName);
    return state ? state.lgas : [];
  }

  /**
   * Get all Nigerian cities (major cities first)
   */
  getAllNigerianCities(): string[] {
    const majorCities = nigeriaData.majorCities.map((city) => city.name);
    const allCities = new Set<string>();

    // Add major cities first
    majorCities.forEach((city) => allCities.add(city));

    // Add all other cities
    nigeriaData.states.forEach((state) => {
      state.cities.forEach((city) => allCities.add(city));
    });

    return Array.from(allCities);
  }

  /**
   * Load countries from REST Countries API
   */
  async loadCountries(): Promise<Country[]> {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2"
      );
      const data = await response.json();

      this.countries = data
        .map((country: any) => ({
          name: country.name.common,
          code: country.cca2,
          cities: [], // Will be populated when needed
        }))
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

      // Put Nigeria first
      const nigeriaIndex = this.countries.findIndex(
        (c) => c.name === "Nigeria"
      );
      if (nigeriaIndex > -1) {
        const nigeria = this.countries.splice(nigeriaIndex, 1)[0];
        this.countries.unshift(nigeria);
      }

      return this.countries;
    } catch (error) {
      console.error("Failed to load countries:", error);
      // Fallback to basic countries list
      this.countries = [
        { name: "Nigeria", code: "NG", cities: [] },
        { name: "Ghana", code: "GH", cities: [] },
        { name: "South Africa", code: "ZA", cities: [] },
        { name: "Kenya", code: "KE", cities: [] },
        { name: "United States", code: "US", cities: [] },
        { name: "United Kingdom", code: "GB", cities: [] },
      ];
      return this.countries;
    }
  }

  /**
   * Get countries list
   */
  getCountries(): Country[] {
    return this.countries;
  }

  /**
   * Get cities for a country (Nigeria has special handling)
   */
  async getCitiesForCountry(countryName: string): Promise<string[]> {
    if (countryName === "Nigeria") {
      return this.getAllNigerianCities();
    }

    // For other countries, you might want to use a cities API
    // For now, return empty array or implement as needed
    return [];
  }

  /**
   * Geocode address using OpenStreetMap Nominatim API
   */
  async geocodeAddress(address: string): Promise<LocationData | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return this.parseNominatimResult(result);
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address using OpenStreetMap Nominatim API
   */
  async reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      if (data && data.address) {
        return this.parseNominatimResult(data);
      }

      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }

  /**
   * Parse OpenStreetMap Nominatim result
   */
  private parseNominatimResult(result: any): LocationData {
    const address =
      result.display_name?.split(",")[0] || result.display_name || "";
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      "";
    const state = result.address?.state || "";
    const country = result.address?.country || "";
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    return {
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      coordinates: { lat, lng },
    };
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Save location for future use
   */
  saveLocation(location: LocationData, name: string): void {
    const savedLocation: SavedLocation = {
      ...location,
      id: Date.now().toString(),
      name,
      lastUsed: new Date().toISOString(),
    };

    // Remove existing location with same name
    this.savedLocations = this.savedLocations.filter(
      (loc) => loc.name !== name
    );

    // Add new location at the beginning
    this.savedLocations.unshift(savedLocation);

    // Keep only last 10 locations
    this.savedLocations = this.savedLocations.slice(0, 10);

    // Save to localStorage
    localStorage.setItem("savedLocations", JSON.stringify(this.savedLocations));
  }

  /**
   * Get saved locations
   */
  getSavedLocations(): SavedLocation[] {
    return this.savedLocations;
  }

  /**
   * Load saved locations from localStorage
   */
  private loadSavedLocations(): void {
    try {
      const saved = localStorage.getItem("savedLocations");
      if (saved) {
        this.savedLocations = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load saved locations:", error);
      this.savedLocations = [];
    }
  }

  /**
   * Delete saved location
   */
  deleteSavedLocation(id: string): void {
    this.savedLocations = this.savedLocations.filter((loc) => loc.id !== id);
    localStorage.setItem("savedLocations", JSON.stringify(this.savedLocations));
  }

  /**
   * Validate location data
   */
  validateLocation(location: Partial<LocationData>): string[] {
    const errors: string[] = [];

    if (!location.address?.trim()) {
      errors.push("Address is required");
    }

    if (!location.city?.trim()) {
      errors.push("City is required");
    }

    if (!location.country?.trim()) {
      errors.push("Country is required");
    }

    if (!location.coordinates?.lat || !location.coordinates?.lng) {
      errors.push("Coordinates are required");
    }

    return errors;
  }

  /**
   * Format location for display
   */
  formatLocationDisplay(location: LocationData): string {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.country,
    ]
      .filter((part) => part && part.trim())
      .map((part) => part.trim());

    return parts.join(", ");
  }
}

export const locationService = new LocationService();
export default locationService;
