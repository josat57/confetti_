/**
 * Bookings Service
 * Handles all booking management related API calls
 */

import api from "@/api/api";
import type {
  Booking,
  BookingCreate,
  BookingUpdate,
  BookingFilters,
  BookingsResponse,
  BookingStats,
  BookingPaymentUpdate,
  BookingNote,
} from "@/types/booking.types";

export const bookingsService = {
  /**
   * Get all bookings with optional filters
   */
  async getAll(params?: BookingFilters): Promise<BookingsResponse> {
    const response = await api.get("/vendors/bookings", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get a single booking by ID
   */
  async getById(id: string): Promise<Booking> {
    const response = await api.get(`/vendors/bookings/${id}`, {
      withCredentials: true,
    });
    return response.data.data.booking;
  },

  /**
   * Create a new booking
   */
  async create(data: BookingCreate): Promise<Booking> {
    const response = await api.post("/vendors/bookings", data, {
      withCredentials: true,
    });
    return response.data.data.booking;
  },

  /**
   * Update a booking
   */
  async update(id: string, data: BookingUpdate): Promise<Booking> {
    const response = await api.put(`/vendors/bookings/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data.booking;
  },

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/bookings/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Update booking status
   */
  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<Booking> {
    const response = await api.patch(
      `/vendors/bookings/${id}/status`,
      { status, reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Confirm a booking
   */
  async confirm(id: string): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/confirm`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Cancel a booking
   */
  async cancel(id: string, reason: string): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/cancel`,
      { reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Complete a booking
   */
  async complete(id: string): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/complete`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Add a note to a booking
   */
  async addNote(id: string, note: string): Promise<BookingNote> {
    const response = await api.post(
      `/vendors/bookings/${id}/notes`,
      { note },
      {
        withCredentials: true,
      }
    );
    return response.data.data.note;
  },

  /**
   * Record a payment
   */
  async recordPayment(
    id: string,
    payment: BookingPaymentUpdate
  ): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/payments`,
      payment,
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Mark deposit as paid
   */
  async markDepositPaid(id: string, paymentMethod: string): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/deposit`,
      { paymentMethod },
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },

  /**
   * Get booking statistics
   */
  async getStats(): Promise<BookingStats> {
    const response = await api.get("/vendors/bookings/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get upcoming bookings
   */
  async getUpcoming(limit?: number): Promise<Booking[]> {
    const response = await api.get("/vendors/bookings/upcoming", {
      params: { limit },
      withCredentials: true,
    });
    return response.data.data.bookings;
  },

  /**
   * Get bookings for a specific date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    const response = await api.get("/vendors/bookings/date-range", {
      params: { startDate, endDate },
      withCredentials: true,
    });
    return response.data.data.bookings;
  },

  /**
   * Send booking confirmation email
   */
  async sendConfirmation(id: string): Promise<void> {
    await api.post(
      `/vendors/bookings/${id}/send-confirmation`,
      {},
      {
        withCredentials: true,
      }
    );
  },

  /**
   * Generate booking contract
   */
  async generateContract(id: string): Promise<{ contractUrl: string }> {
    const response = await api.post(
      `/vendors/bookings/${id}/contract`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  /**
   * Mark contract as signed
   */
  async markContractSigned(id: string): Promise<Booking> {
    const response = await api.post(
      `/vendors/bookings/${id}/contract/signed`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.booking;
  },
};

export default bookingsService;
