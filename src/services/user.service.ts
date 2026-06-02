import api from "@/api/api";

export interface UserDashboardStats {
  upcomingEvents: number;
  totalEvents: number;
  savedVendors: number;
  activeBookings: number;
}

export interface UserEvent {
  _id: string;
  name: string;
  type: string;
  date: string;
  endDate?: string;
  status: "Draft" | "Planning" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  guestCount: number;
  budget: {
    total: number;
    currency: string;
  };
  completionPercentage: number;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  type: "event" | "vendor" | "booking" | "system";
  title: string;
  description: string;
  timestamp: string;
}

export const userService = {
  async getDashboardStats(): Promise<UserDashboardStats> {
    try {
      const response = await api.get("/users/dashboard/stats");
      return response.data.data || response.data;
    } catch {
      // Derive stats from events if dedicated endpoint doesn't exist
      try {
        const eventsRes = await api.get("/events?limit=100");
        const events: UserEvent[] =
          eventsRes.data.data?.events ||
          eventsRes.data.events ||
          eventsRes.data ||
          [];

        const now = new Date();
        const upcoming = Array.isArray(events)
          ? events.filter(
              (e) =>
                new Date(e.date) >= now &&
                e.status !== "Cancelled" &&
                e.status !== "Completed"
            ).length
          : 0;

        return {
          upcomingEvents: upcoming,
          totalEvents: Array.isArray(events) ? events.length : 0,
          savedVendors: 0,
          activeBookings: 0,
        };
      } catch {
        return {
          upcomingEvents: 0,
          totalEvents: 0,
          savedVendors: 0,
          activeBookings: 0,
        };
      }
    }
  },

  async getMyEvents(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: UserEvent[]; total: number; totalPages: number }> {
    try {
      const response = await api.get("/events", { params: { ...params, limit: params?.limit ?? 12 } });
      const data = response.data.data || response.data;
      return {
        events: data.events || data || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    } catch {
      return { events: [], total: 0, totalPages: 1 };
    }
  },

  async getUpcomingEvents(limit = 5): Promise<UserEvent[]> {
    try {
      const response = await api.get("/events", {
        params: { limit, sortBy: "date", sortOrder: "asc" },
      });
      const data = response.data.data || response.data;
      const events: UserEvent[] = data.events || data || [];
      const now = new Date();
      return events
        .filter(
          (e) =>
            new Date(e.date) >= now &&
            e.status !== "Cancelled" &&
            e.status !== "Completed"
        )
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  async getRecentActivity(limit = 8): Promise<UserActivity[]> {
    try {
      const response = await api.get("/users/activity", { params: { limit } });
      return response.data.data?.activities || response.data.activities || [];
    } catch {
      return [];
    }
  },

  async createEvent(data: {
    name: string;
    type: string;
    date: string;
    endDate?: string;
    location: { address: string; city: string; state: string; country: string };
    budget: { total: number; currency: string };
    guestCount: number;
    description?: string;
  }): Promise<UserEvent> {
    const response = await api.post("/events", data);
    return response.data.data?.event || response.data.event || response.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};

export default userService;
