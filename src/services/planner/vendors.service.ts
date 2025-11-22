import api from "@/api/api";
import {
  Vendor,
  VendorSearchFilters,
  PaginatedVendors,
  VendorFavorite,
  VendorBooking,
  CreateBookingInput,
  UpdateBookingInput,
  PaginatedBookings,
} from "@/types/planner";

class VendorsService {
  private baseUrl = "/api/v1/planner/vendors";

  /**
   * Search vendors with filters
   */
  async searchVendors(
    filters?: VendorSearchFilters
  ): Promise<PaginatedVendors> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.priceRange) params.append("priceRange", filters.priceRange);
    if (filters?.minRating)
      params.append("minRating", filters.minRating.toString());
    if (filters?.availability)
      params.append("availability", filters.availability);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/search?${queryString}`
      : `${this.baseUrl}/search`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get vendor by ID
   */
  async getVendor(vendorId: string): Promise<{ vendor: Vendor }> {
    const response = await api.get(`${this.baseUrl}/${vendorId}`);
    return response.data;
  }

  /**
   * Add vendor to favorites
   */
  async addToFavorites(
    vendorId: string
  ): Promise<{ favorite: VendorFavorite }> {
    const response = await api.post(`${this.baseUrl}/${vendorId}/favorite`);
    return response.data;
  }

  /**
   * Remove vendor from favorites
   */
  async removeFromFavorites(vendorId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`${this.baseUrl}/${vendorId}/favorite`);
    return response.data;
  }

  /**
   * Get favorite vendors
   */
  async getFavorites(): Promise<{ vendors: Vendor[] }> {
    const response = await api.get(`${this.baseUrl}/favorites`);
    return response.data;
  }

  /**
   * Create booking request
   */
  async createBooking(
    data: CreateBookingInput
  ): Promise<{ booking: VendorBooking }> {
    const response = await api.post(
      `${this.baseUrl}/${data.vendor}/book`,
      data
    );
    return response.data;
  }

  /**
   * Get all bookings
   */
  async getBookings(filters?: {
    event?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedBookings> {
    const params = new URLSearchParams();
    if (filters?.event) params.append("event", filters.event);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/planner/bookings?${queryString}`
      : "/api/v1/planner/bookings";

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(
    bookingId: string,
    data: UpdateBookingInput
  ): Promise<{ booking: VendorBooking }> {
    const response = await api.put(
      `/api/v1/planner/bookings/${bookingId}`,
      data
    );
    return response.data;
  }

  /**
   * Get vendor categories
   */
  async getCategories(): Promise<{ categories: string[] }> {
    const response = await api.get(`${this.baseUrl}/categories`);
    return response.data;
  }
}

export const vendorsService = new VendorsService();
