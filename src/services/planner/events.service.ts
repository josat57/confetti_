// Event Service for Planner Dashboard
import api from "@/api/api";
import {
  Event,
  CreateEventInput,
  UpdateEventInput,
  EventFilters,
  EventSortOption,
  PaginatedEvents,
} from "@/types/planner";

class EventsService {
  private baseUrl = "/events";

  /**
   * Get all events with filters, sorting, and pagination
   */
  async getEvents(
    filters?: EventFilters,
    sort?: EventSortOption,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedEvents> {
    try {
      const params = new URLSearchParams();

      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.client) params.append("client", filters.client);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.search) params.append("search", filters.search);

      if (sort) {
        params.append("sortBy", sort.field);
        params.append("sortOrder", sort.order);
      }

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // Return empty data for development
      return {
        events: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 12,
      };
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(id: string): Promise<Event | null> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data.event;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventInput): Promise<Event | null> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data.data.event;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, data: UpdateEventInput): Promise<Event | null> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data.data.event;
    } catch (error) {
      console.error(`Failed to update event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update event status
   */
  async updateEventStatus(
    id: string,
    status: Event["status"]
  ): Promise<Event | null> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/status`, {
        status,
      });
      return response.data.data.event;
    } catch (error) {
      console.error(`Failed to update event status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete events
   */
  async bulkDelete(eventIds: string[]): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/bulk-action`, {
        eventIds,
        action: "delete",
      });
      return true;
    } catch (error) {
      console.error("Failed to bulk delete events:", error);
      throw error;
    }
  }

  /**
   * Bulk update event status
   */
  async bulkUpdateStatus(
    eventIds: string[],
    status: Event["status"]
  ): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/bulk-action`, {
        eventIds,
        action: "status-change",
        data: { status },
      });
      return true;
    } catch (error) {
      console.error("Failed to bulk update event status:", error);
      throw error;
    }
  }

  /**
   * Add vendor to event
   */
  async addVendor(
    eventId: string,
    vendorId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/vendors`, {
        vendorId,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add vendor to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Remove vendor from event
   */
  async removeVendor(
    eventId: string,
    vendorId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/${eventId}/vendors/${vendorId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to remove vendor from event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add guest to event
   */
  async addGuest(eventId: string, guestData: any): Promise<{ guest: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/guests`,
        guestData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add guest to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Remove guest from event
   */
  async removeGuest(
    eventId: string,
    guestId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/${eventId}/guests/${guestId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to remove guest from event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Update event budget
   */
  async updateBudget(
    eventId: string,
    budgetData: any
  ): Promise<{ budget: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/budget`,
        budgetData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update budget for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Update event schedule
   */
  async updateSchedule(
    eventId: string,
    scheduleData: any
  ): Promise<{ schedule: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/schedule`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update schedule for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add timeline item
   */
  async addTimelineItem(
    eventId: string,
    timelineData: any
  ): Promise<{ timeline: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/timeline`,
        timelineData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add timeline item to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add checklist item
   */
  async addChecklistItem(
    eventId: string,
    checklistData: any
  ): Promise<{ checklist: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/checklist`,
        checklistData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add checklist item to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add document to event
   */
  async addDocument(
    eventId: string,
    documentData: FormData
  ): Promise<{ document: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/documents`,
        documentData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to add document to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Add note to event
   */
  async addNote(eventId: string, noteContent: string): Promise<{ note: any }> {
    try {
      const response = await api.post(`${this.baseUrl}/${eventId}/notes`, {
        content: noteContent,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to add note to event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Upload event image
   */
  async uploadImage(
    eventId: string,
    imageData: FormData
  ): Promise<{ image: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/image`,
        imageData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload image for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Upload event media
   */
  async uploadMedia(
    eventId: string,
    mediaData: FormData
  ): Promise<{ media: any }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/media`,
        mediaData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload media for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Upload multiple photos
   */
  async uploadPhotos(
    eventId: string,
    photosData: FormData
  ): Promise<{ photos: any[] }> {
    try {
      const response = await api.post(
        `${this.baseUrl}/${eventId}/photos`,
        photosData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload photos for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Delete event media
   */
  async deleteMedia(
    eventId: string,
    mediaId: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/${eventId}/media/${mediaId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to delete media from event ${eventId}:`, error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
