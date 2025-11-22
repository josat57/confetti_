/**
 * Calendar Service
 * Handles all calendar and availability related API calls
 */

import api from "@/api/api";
import type {
  CalendarData,
  CalendarParams,
  AvailabilityStatus,
  BlockDatesRequest,
  BlockedDate,
  BusinessHours,
} from "@/types/calendar.types";

export const calendarService = {
  /**
   * Get calendar view for a date range
   */
  async getCalendar(params: CalendarParams): Promise<CalendarData> {
    const response = await api.get("/vendors/calendar", { params });
    return response.data.data;
  },

  /**
   * Check availability for a specific date
   */
  async checkAvailability(date: string): Promise<AvailabilityStatus> {
    const response = await api.get("/vendors/calendar/availability", {
      params: { date },
    });
    return response.data.data;
  },

  /**
   * Block dates
   */
  async blockDates(data: BlockDatesRequest): Promise<BlockedDate> {
    const response = await api.post("/vendors/calendar/block", data);
    return response.data.data;
  },

  /**
   * Unblock dates
   */
  async unblockDates(blockId: string): Promise<void> {
    await api.delete(`/vendors/calendar/block/${blockId}`);
  },

  /**
   * Update working hours
   */
  async updateHours(hours: BusinessHours[]): Promise<BusinessHours[]> {
    const response = await api.put("/vendors/calendar/hours", { hours });
    return response.data.data;
  },

  /**
   * Create a calendar event
   */
  async createEvent(data: {
    title: string;
    startDate: string;
    endDate: string;
    eventType: string;
    location?: string;
    notes?: string;
  }): Promise<any> {
    const response = await api.post("/vendors/calendar", data);
    return response.data.data.event;
  },

  /**
   * Get a single calendar event
   */
  async getEvent(id: string): Promise<any> {
    const response = await api.get(`/vendors/calendar/${id}`);
    return response.data.data.event;
  },

  /**
   * Update a calendar event
   */
  async updateEvent(
    id: string,
    data: {
      title?: string;
      startDate?: string;
      endDate?: string;
      eventType?: string;
      location?: string;
      notes?: string;
    }
  ): Promise<any> {
    const response = await api.put(`/vendors/calendar/${id}`, data);
    return response.data.data.event;
  },

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/vendors/calendar/${id}`);
  },
};

export default calendarService;
