/**
 * Event Service
 * Handles all vendor event listing related API calls
 */

import api from "@/api/api";

export interface EventListing {
  _id: string;
  vendor: string;
  title: string;
  date: string;
  description: string;
  status: "draft" | "published" | "completed";
  photos: Array<{
    _id: string;
    url: string;
    caption?: string;
    order: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location: {
    venue?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    coordinates: [number, number]; // [longitude, latitude] - GeoJSON format
  };
  budget?: number;
  guestCount: number;
  capacity?: number;
  category?: string;
  organizer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  price?: {
    amount?: number;
    currency?: string;
  };
  description?: string;
  status?: "draft" | "published" | "completed";
}

export const eventService = {
  /**
   * Get all events for the vendor
   */
  async getAll(): Promise<EventListing[]> {
    const response = await api.get("/events", {
      withCredentials: true,
    });
    // Backend returns array directly or in data.events
    return response.data.events || response.data.data?.events || response.data;
  },

  /**
   * Get a single event by ID (returns base64 images)
   */
  async getById(id: string): Promise<EventListing> {
    const response = await api.get(`/events/${id}`, {
      withCredentials: true,
    });
    // Backend returns event directly or in data.event
    return response.data.event || response.data.data?.event || response.data;
  },

  /**
   * Create a new event
   */
  async create(data: CreateEventData): Promise<EventListing> {
    const response = await api.post("/events", data, {
      withCredentials: true,
    });
    // Backend returns event directly in response body
    return response.data;
  },

  /**
   * Update an event
   */
  async update(
    id: string,
    data: Partial<CreateEventData>
  ): Promise<EventListing> {
    const response = await api.put(`/events/${id}`, data, {
      withCredentials: true,
    });
    // Backend returns event directly or in data.event
    return response.data.event || response.data.data?.event || response.data;
  },

  /**
   * Delete an event
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/events/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Upload cover image for an event
   */
  async uploadCoverImage(eventId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.post(`/events/${eventId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.data.image;
  },

  /**
   * Upload multiple photos for an event
   */
  async uploadPhotos(
    eventId: string,
    files: File[],
    caption?: string
  ): Promise<any[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await api.post(`/events/${eventId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.data.media;
  },

  /**
   * Upload single media (photo or video) for an event
   */
  async uploadMedia(
    eventId: string,
    file: File,
    type?: "image" | "video",
    caption?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append("media", file);
    if (type) {
      formData.append("type", type);
    }
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await api.post(`/events/${eventId}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.data.media;
  },

  /**
   * Delete media from an event
   */
  async deleteMedia(eventId: string, mediaId: string): Promise<void> {
    await api.delete(`/events/${eventId}/media/${mediaId}`, {
      withCredentials: true,
    });
  },

  /**
   * Get monthly listing count (for Basic tier limit check)
   */
  async getMonthlyCount(): Promise<number> {
    const response = await api.get("/vendors/events/monthly-count", {
      withCredentials: true,
    });
    return response.data.data.count;
  },

  // ============================================
  // EVENT VENDORS
  // ============================================

  /**
   * Add vendor to event
   */
  async addVendor(
    eventId: string,
    vendorData: {
      vendor: string;
      role: string;
      status?: string;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/vendors`, vendorData, {
      withCredentials: true,
    });
    return response.data.data.vendor;
  },

  /**
   * Remove vendor from event
   */
  async removeVendor(eventId: string, vendorId: string): Promise<void> {
    await api.delete(`/events/${eventId}/vendors/${vendorId}`, {
      withCredentials: true,
    });
  },

  // ============================================
  // EVENT GUESTS
  // ============================================

  /**
   * Add guest to event
   */
  async addGuest(
    eventId: string,
    guestData: {
      name: string;
      email?: string;
      phone?: string;
      rsvpStatus?: string;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/guests`, guestData, {
      withCredentials: true,
    });
    return response.data.data.guest;
  },

  /**
   * Remove guest from event
   */
  async removeGuest(eventId: string, guestId: string): Promise<void> {
    await api.delete(`/events/${eventId}/guests/${guestId}`, {
      withCredentials: true,
    });
  },

  // ============================================
  // EVENT PLANNING
  // ============================================

  /**
   * Update event budget
   */
  async updateBudget(
    eventId: string,
    budgetData: {
      totalBudget: number;
      categories?: Array<{
        name: string;
        allocated: number;
        spent?: number;
      }>;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/budget`, budgetData, {
      withCredentials: true,
    });
    return response.data.data.budget;
  },

  /**
   * Update event schedule
   */
  async updateSchedule(
    eventId: string,
    scheduleData: {
      items: Array<{
        time: string;
        title: string;
        description?: string;
        duration?: number;
      }>;
    }
  ): Promise<any> {
    const response = await api.post(
      `/events/${eventId}/schedule`,
      scheduleData,
      {
        withCredentials: true,
      }
    );
    return response.data.data.schedule;
  },

  /**
   * Add timeline item
   */
  async addTimelineItem(
    eventId: string,
    itemData: {
      date: string;
      title: string;
      description?: string;
      completed?: boolean;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/timeline`, itemData, {
      withCredentials: true,
    });
    return response.data.data.item;
  },

  /**
   * Add checklist item
   */
  async addChecklistItem(
    eventId: string,
    itemData: {
      title: string;
      description?: string;
      dueDate?: string;
      assignedTo?: string;
      completed?: boolean;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/checklist`, itemData, {
      withCredentials: true,
    });
    return response.data.data.item;
  },

  /**
   * Add document to event
   */
  async addDocument(
    eventId: string,
    file: File,
    metadata?: {
      title?: string;
      category?: string;
    }
  ): Promise<any> {
    const formData = new FormData();
    formData.append("document", file);
    if (metadata?.title) {
      formData.append("title", metadata.title);
    }
    if (metadata?.category) {
      formData.append("category", metadata.category);
    }

    const response = await api.post(`/events/${eventId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data.data.document;
  },

  /**
   * Add note to event
   */
  async addNote(
    eventId: string,
    noteData: {
      content: string;
      category?: string;
    }
  ): Promise<any> {
    const response = await api.post(`/events/${eventId}/notes`, noteData, {
      withCredentials: true,
    });
    return response.data.data.note;
  },
};

export default eventService;
