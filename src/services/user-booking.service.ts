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

export const userBookingService = {
  /**
   * Submit a quote request to a vendor.
   * Tries the planner booking endpoint; falls back to a lead-creation endpoint.
   */
  async requestQuote(data: QuoteRequestData): Promise<UserBooking> {
    // Primary: planner booking endpoint (vendor-side booking request)
    try {
      const payload = {
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
      };
      const res = await api.post(`/users/bookings/request`, payload);
      return res.data.data?.booking || res.data.booking || res.data;
    } catch {
      // Fallback: create a lead on the vendor side
      const leadPayload = {
        customer: {
          name: data.contactName,
          email: data.contactEmail,
          phone: data.contactPhone || "",
        },
        eventDetails: {
          type: data.eventType,
          date: data.eventDate,
          location: data.location,
          guestCount: data.guestCount,
          budget: data.budget,
        },
        source: "website",
        vendorId: data.vendorId,
        notes: data.serviceRequirements,
      };
      const res = await api.post(`/vendors/${data.vendorId}/leads/public`, leadPayload);
      // Shape the response to look like a booking
      return {
        _id: res.data.data?.lead?._id || res.data._id || "pending",
        vendor: data.vendorId,
        status: "Pending",
        serviceRequirements: data.serviceRequirements,
        budget: data.budget,
        currency: "NGN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Get all bookings/requests for the current user.
   */
  async getMyBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ bookings: UserBooking[]; total: number; totalPages: number }> {
    try {
      const res = await api.get("/users/bookings", { params: { ...params, limit: params?.limit ?? 12 } });
      const data = res.data.data || res.data;
      return {
        bookings: data.bookings || data || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    } catch {
      // Fallback: try planner bookings endpoint
      try {
        const res = await api.get("/planner/bookings", { params });
        const data = res.data.data || res.data;
        return {
          bookings: data.bookings || [],
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        };
      } catch {
        return { bookings: [], total: 0, totalPages: 1 };
      }
    }
  },

  /**
   * Get a single booking by ID.
   */
  async getBookingById(id: string): Promise<UserBooking | null> {
    try {
      const res = await api.get(`/users/bookings/${id}`);
      return res.data.data?.booking || res.data.booking || res.data;
    } catch {
      try {
        const res = await api.get(`/planner/bookings/${id}`);
        return res.data.data?.booking || res.data.booking || res.data;
      } catch {
        return null;
      }
    }
  },

  /**
   * Cancel a booking request.
   */
  async cancelBooking(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/users/bookings/${id}/cancel`, { reason });
    } catch {
      await api.patch(`/planner/bookings/${id}`, { status: "Cancelled", cancellationReason: reason });
    }
  },
};

export default userBookingService;
