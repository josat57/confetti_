/**
 * Vendor Service
 * Handles all vendor profile and dashboard related API calls
 */

import api from "@/api/api";

export interface VendorProfile {
  _id: string;
  owner: string;
  businessName: string;
  displayName?: string;
  logo?: string;
  coverImage?: string;
  tagline?: string;
  description?: string;
  category: string;
  subcategory?: string;
  businessType?: string;
  eventTypes: string[];
  phone?: string;
  email?: string;
  website?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  serviceArea: {
    cities: string[];
    states: string[];
    radius?: number;
  };
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  photos: Array<{
    _id: string;
    url: string;
    caption?: string;
    order: number;
    uploadedAt: Date;
  }>;
  videos: Array<{
    _id: string;
    url: string;
    thumbnail?: string;
    title?: string;
    duration?: number;
    uploadedAt: Date;
  }>;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
    customCSS?: string;
  };
  stats: {
    profileViews: number;
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    responseTime: number;
    responseRate: number;
  };
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const vendorService = {
  /**
   * Get vendor profile
   */
  async getProfile(): Promise<VendorProfile> {
    const response = await api.get("/vendors/profile", {
      withCredentials: true,
    });
    return response.data.data.vendor;
  },

  /**
   * Update vendor profile
   */
  async updateProfile(data: Partial<VendorProfile>): Promise<VendorProfile> {
    const response = await api.put("/vendors/profile", data, {
      withCredentials: true,
    });
    return response.data.data.vendor;
  },

  /**
   * Upload logo
   */
  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.post("/vendors/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.data.logo;
  },

  /**
   * Upload cover image
   */
  async uploadCoverImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("coverImage", file);

    const response = await api.post("/vendors/profile/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.coverImage;
  },

  /**
   * Upload media (photos/videos)
   */
  async uploadMedia(
    type: "photo" | "video",
    file: File,
    metadata?: any
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    if (metadata) {
      Object.keys(metadata).forEach((key) => {
        formData.append(key, metadata[key]);
      });
    }

    const response = await api.post("/vendors/profile/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  /**
   * Delete media
   */
  async deleteMedia(mediaId: string, type: "photo" | "video"): Promise<void> {
    await api.delete(`/vendors/profile/media/${mediaId}?type=${type}`);
  },

  /**
   * Update branding (Professional+ only)
   */
  async updateBranding(branding: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
    customCSS?: string;
  }): Promise<any> {
    const response = await api.put("/vendors/profile/branding", branding);
    return response.data.data.branding;
  },

  /**
   * Get profile stats
   */
  async getProfileStats(): Promise<{
    profileViews: number;
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    responseTime: number;
    responseRate: number;
  }> {
    const response = await api.get("/vendors/profile/stats");
    return response.data.data;
  },

  /**
   * Update business hours
   */
  async updateBusinessHours(
    hours: Array<{
      day: string;
      open: string;
      close: string;
      closed: boolean;
    }>
  ): Promise<any> {
    const response = await api.put("/vendors/profile/hours", { hours });
    return response.data.data;
  },

  /**
   * Update service area
   */
  async updateServiceArea(serviceArea: {
    cities: string[];
    states: string[];
    radius?: number;
  }): Promise<any> {
    const response = await api.put(
      "/vendors/profile/service-area",
      serviceArea
    );
    return response.data.data;
  },

  // ============================================
  // PUBLIC VENDOR ENDPOINTS
  // ============================================

  /**
   * List all vendors (public, with filters)
   */
  async listPublic(params?: {
    category?: string;
    city?: string;
    state?: string;
    eventType?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    verified?: boolean;
    featured?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{
    vendors: VendorProfile[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get("/vendors", { params });
    return response.data.data;
  },

  /**
   * Search vendors
   */
  async search(
    query: string,
    params?: {
      category?: string;
      city?: string;
      state?: string;
      limit?: number;
    }
  ): Promise<{ vendors: VendorProfile[]; total: number }> {
    const response = await api.get("/vendors/search", {
      params: { q: query, ...params },
    });
    return response.data.data;
  },

  /**
   * Get featured vendors
   */
  async getFeatured(params?: {
    category?: string;
    limit?: number;
  }): Promise<VendorProfile[]> {
    const response = await api.get("/vendors/featured", { params });
    return response.data.data.vendors;
  },

  /**
   * Get vendor categories
   */
  async getCategories(): Promise<Array<{ name: string; count: number }>> {
    const response = await api.get("/vendors/categories");
    return response.data.data.categories;
  },

  /**
   * Get popular locations
   */
  async getLocations(): Promise<
    Array<{ city: string; state: string; count: number }>
  > {
    const response = await api.get("/vendors/locations");
    return response.data.data.locations;
  },

  /**
   * Get vendor details by ID (public)
   */
  async getPublicById(id: string): Promise<VendorProfile> {
    const response = await api.get(`/vendors/${id}`);
    return response.data.data.vendor;
  },

  /**
   * Get public vendor profile
   */
  async getPublicProfile(id: string): Promise<VendorProfile> {
    const response = await api.get(`/vendors/${id}/public`);
    return response.data.data.vendor;
  },

  /**
   * Track profile view
   */
  async trackView(id: string): Promise<void> {
    await api.post(`/vendors/${id}/track-view`);
  },
};

export default vendorService;
