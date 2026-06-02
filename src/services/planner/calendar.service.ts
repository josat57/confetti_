import api from "@/api/api";

export interface CalendarEvent {
  _id: string;
  type: "event" | "task" | "milestone" | "booking";
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  eventId?: string;
  taskId?: string;
  status?: string;
  priority?: string;
  color?: string;
  category?: string;
}

export interface CalendarFilters {
  eventIds?: string[];
  taskTypes?: string[];
  teamMembers?: string[];
  showEvents?: boolean;
  showTasks?: boolean;
  showMilestones?: boolean;
}

export interface CalendarData {
  events: CalendarEvent[];
  conflicts: Array<{
    date: Date;
    items: CalendarEvent[];
  }>;
}

export interface AvailabilityCheck {
  date: Date;
  available: boolean;
  conflicts: CalendarEvent[];
}

class PlannerCalendarService {
  /**
   * Get calendar data for date range
   */
  async getCalendar(
    startDate: string,
    endDate: string,
    view: "month" | "week" | "day" = "month",
    filters?: CalendarFilters
  ): Promise<CalendarData> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      view,
    });

    if (filters) {
      if (filters.eventIds?.length) {
        params.append("eventIds", filters.eventIds.join(","));
      }
      if (filters.taskTypes?.length) {
        params.append("taskTypes", filters.taskTypes.join(","));
      }
      if (filters.teamMembers?.length) {
        params.append("teamMembers", filters.teamMembers.join(","));
      }
      if (filters.showEvents !== undefined) {
        params.append("showEvents", String(filters.showEvents));
      }
      if (filters.showTasks !== undefined) {
        params.append("showTasks", String(filters.showTasks));
      }
      if (filters.showMilestones !== undefined) {
        params.append("showMilestones", String(filters.showMilestones));
      }
    }

    const response = await api.get(`/planner/calendar?${params}`);
    return response.data;
  }

  /**
   * Check availability for specific date
   */
  async checkAvailability(date: string): Promise<AvailabilityCheck> {
    const response = await api.get(
      `/planner/calendar/availability?date=${date}`
    );
    return response.data;
  }

  /**
   * Sync with external calendar (Google/Outlook)
   */
  async syncCalendar(
    provider: "google" | "outlook"
  ): Promise<{ success: boolean; synced: number }> {
    const response = await api.post("/planner/calendar/sync", {
      provider,
      action: "sync",
    });
    return response.data;
  }

  /**
   * Export calendar to iCal format.
   * Backend: GET /planner/calendar/export?startDate=...&endDate=...
   */
  async exportCalendar(
    startDate: string,
    endDate: string
  ): Promise<{ downloadUrl: string }> {
    const response = await api.get("/planner/calendar/export", {
      params: { startDate, endDate, includeEvents: true, includeTasks: true },
    });
    return response.data;
  }
}

export const plannerCalendarService = new PlannerCalendarService();
