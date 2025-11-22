import api from "@/api/api";
import {
  Guest,
  CreateGuestInput,
  UpdateGuestInput,
  GuestStats,
  ImportResult,
} from "@/types/guest";

class GuestsService {
  /**
   * Get guests for an event
   */
  async getEventGuests(
    eventId: string,
    filters?: {
      category?: string;
      rsvpStatus?: string;
      search?: string;
    }
  ): Promise<{ guests: Guest[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.rsvpStatus) params.append("rsvpStatus", filters.rsvpStatus);
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(
      `/api/v1/planner/events/${eventId}/guests?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get guest statistics for an event
   */
  async getGuestStats(eventId: string): Promise<GuestStats> {
    const response = await api.get(
      `/api/v1/planner/events/${eventId}/guests/stats`
    );
    return response.data;
  }

  /**
   * Create a new guest
   */
  async createGuest(eventId: string, data: CreateGuestInput): Promise<Guest> {
    const response = await api.post(
      `/api/v1/planner/events/${eventId}/guests`,
      data
    );
    return response.data.guest;
  }

  /**
   * Update a guest
   */
  async updateGuest(guestId: string, data: UpdateGuestInput): Promise<Guest> {
    const response = await api.put(`/api/v1/planner/guests/${guestId}`, data);
    return response.data.guest;
  }

  /**
   * Delete a guest
   */
  async deleteGuest(guestId: string): Promise<void> {
    await api.delete(`/api/v1/planner/guests/${guestId}`);
  }

  /**
   * Import guests from CSV
   */
  async importGuests(eventId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/api/v1/planner/events/${eventId}/guests/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Check in a guest
   */
  async checkInGuest(guestId: string): Promise<Guest> {
    const response = await api.patch(
      `/api/v1/planner/guests/${guestId}/check-in`
    );
    return response.data.guest;
  }

  /**
   * Send invitations to guests
   */
  async sendInvitations(
    eventId: string,
    guestIds: string[]
  ): Promise<{ sent: number }> {
    const response = await api.post(
      `/api/v1/planner/events/${eventId}/guests/send-invitations`,
      {
        guestIds,
      }
    );
    return response.data;
  }
}

export default new GuestsService();
