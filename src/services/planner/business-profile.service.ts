import api from "@/api/api";

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface BusinessLocation {
  _id?: string;
  name: string;
  address: BusinessAddress;
  isPrimary: boolean;
  createdAt?: Date;
}

export interface BrandingTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  customCSS?: string;
}

export interface BusinessProfileData {
  _id?: string;
  userId?: string;
  companyName: string;
  registrationNumber?: string;
  address: BusinessAddress;
  logo?: string;
  logoFileId?: string;
  description?: string;
  yearEstablished?: number;
  taxId?: string;
  website?: string;
  additionalLocations?: BusinessLocation[];
  branding?: BrandingTheme;
  verificationStatus?: "pending" | "verified" | "rejected";
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const businessProfileService = {
  /**
   * Get business profile
   */
  async getProfile(): Promise<BusinessProfileData | null> {
    try {
      const response = await api.get("/business-profile");
      return (
        response.data.data?.profile || response.data.profile || response.data
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No profile exists
      }
      console.error("Failed to fetch business profile:", error);
      throw error;
    }
  },

  /**
   * Create business profile
   */
  async createProfile(
    data: Partial<BusinessProfileData>
  ): Promise<BusinessProfileData> {
    try {
      const response = await api.post("/business-profile", data);
      return (
        response.data.data?.profile || response.data.profile || response.data
      );
    } catch (error) {
      console.error("Failed to create business profile:", error);
      throw error;
    }
  },

  /**
   * Update business profile
   */
  async updateProfile(
    data: Partial<BusinessProfileData>
  ): Promise<BusinessProfileData> {
    try {
      const response = await api.put("/business-profile", data);
      return (
        response.data.data?.profile || response.data.profile || response.data
      );
    } catch (error) {
      console.error("Failed to update business profile:", error);
      throw error;
    }
  },

  /**
   * Delete business profile
   */
  async deleteProfile(): Promise<void> {
    try {
      await api.delete("/business-profile");
    } catch (error) {
      console.error("Failed to delete business profile:", error);
      throw error;
    }
  },

  /**
   * Upload business logo
   */
  async uploadLogo(file: File): Promise<{ logo: string }> {
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await api.post(
        "/business-profile/logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to upload logo:", error);
      throw error;
    }
  },

  /**
   * Delete business logo
   */
  async deleteLogo(): Promise<void> {
    try {
      await api.delete("/business-profile/logo");
    } catch (error) {
      console.error("Failed to delete logo:", error);
      throw error;
    }
  },

  /**
   * Add location (planner only)
   */
  async addLocation(
    location: Omit<BusinessLocation, "_id" | "createdAt">
  ): Promise<BusinessLocation> {
    try {
      const response = await api.post(
        "/business-profile/locations",
        location
      );
      return (
        response.data.data?.location || response.data.location || response.data
      );
    } catch (error) {
      console.error("Failed to add location:", error);
      throw error;
    }
  },

  /**
   * Update location (planner only)
   */
  async updateLocation(
    locationId: string,
    updates: Partial<BusinessLocation>
  ): Promise<BusinessLocation> {
    try {
      const response = await api.put(
        `/business-profile/locations/${locationId}`,
        updates
      );
      return (
        response.data.data?.location || response.data.location || response.data
      );
    } catch (error) {
      console.error("Failed to update location:", error);
      throw error;
    }
  },

  /**
   * Delete location (planner only)
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      await api.delete(`/business-profile/locations/${locationId}`);
    } catch (error) {
      console.error("Failed to delete location:", error);
      throw error;
    }
  },

  /**
   * Update branding/theming
   */
  async updateBranding(branding: BrandingTheme): Promise<BusinessProfileData> {
    try {
      const response = await api.put("/business-profile", { branding });
      return (
        response.data.data?.profile || response.data.profile || response.data
      );
    } catch (error) {
      console.error("Failed to update branding:", error);
      throw error;
    }
  },

  /**
   * Get branding/theming
   */
  async getBranding(): Promise<BrandingTheme | null> {
    try {
      const profile = await this.getProfile();
      return profile?.branding || null;
    } catch (error) {
      console.error("Failed to get branding:", error);
      return null;
    }
  },
};

export default businessProfileService;
