import api from "@/api/api";

export type UserBookingStatus =
  | "Pending"
  | "Contacted"
  | "Quoted"
  | "Booked"
  | "Confirmed"
  | "Declined"
  | "Cancelled";

export interface UserBooking {
  _id: string;
  vendor: {
    _id: string;
    businessName: string;
    category: string;
    contactInfo?: { email?: string; phone?: string };
  } | string;
  event?: {
    _id?: string;
    name?: string;
    type?: string;
    date?: string;
  } | string;
  status: UserBookingStatus;
  serviceRequirements: string;
  budget: number;
  currency: string;
  specialRequirements?: string;
  quotedPrice?: number;
  notes?: Array<{ content: string; createdAt: string; createdBy: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequestData {
  vendorId: string;
  vendorName: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  budget: number;
  serviceRequirements: string;
  specialRequirements?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

// API: confetti_server routes/user.routes.js (/users/bookings…). A request creates a booking
// you can follow here and a lead the vendor can reply to.
export const userBookingService = {
  /**
   * Submit a quote request to a vendor.
   */
  async requestQuote(data: QuoteRequestData): Promise<UserBooking> {
    const res = await api.post(`/users/bookings/request`, {
      vendor: data.vendorId,
      serviceRequirements: data.serviceRequirements,
      budget: data.budget,
      specialRequirements: data.specialRequirements,
      eventType: data.eventType,
      eventDate: data.eventDate,
      location: data.location,
      guestCount: data.guestCount,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });
    return res.data.data.booking;
  },

  /**
   * Get all bookings/requests for the current user.
   */
  async getMyBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: UserBooking[]; total: number; totalPages: number }> {
    const res = await api.get("/users/bookings", { params: { ...params, limit: params?.limit ?? 12 } });
    const data = res.data.data || {};
    return {
      bookings: data.bookings || [],
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  },

  /**
   * Get a single booking by ID.
   */
  async getBookingById(id: string): Promise<UserBooking | null> {
    const res = await api.get(`/users/bookings/${id}`);
    return res.data.data?.booking ?? null;
  },

  /**
   * Cancel a booking request (before the vendor confirms).
   */
  async cancelBooking(id: string, reason?: string): Promise<void> {
    await api.patch(`/users/bookings/${id}/cancel`, { reason });
  },
};

export default userBookingService;
