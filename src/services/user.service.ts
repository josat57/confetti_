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

// The API stores events as { title, eventType, startDate, status: draft|published|… };
// the client screens use { name, type, date, status: Draft|Planning|… }.
const STATUS_LABEL: Record<string, UserEvent["status"]> = {
  draft: "Draft",
  published: "Planning",
  completed: "Completed",
  cancelled: "Cancelled",
};
const TYPE_TO_API: Record<string, string> = {
  wedding: "wedding",
  "engagement party": "wedding",
  "birthday party": "birthday",
  birthday: "birthday",
  "corporate event": "corporate",
  conference: "corporate",
  anniversary: "social",
  graduation: "social",
  "naming ceremony": "social",
  "funeral/memorial": "other",
};

export function normalizeEvent(raw: any): UserEvent {
  const address = raw?.location?.address;
  return {
    _id: raw._id,
    name: raw.name || raw.title || "Untitled event",
    type: raw.type || raw.eventType || "other",
    date: raw.date || raw.startDate,
    endDate: raw.endDate,
    status: STATUS_LABEL[raw.status] || raw.status || "Draft",
    location: {
      address: typeof address === "string" ? address : address?.street || "",
      city: (typeof address === "object" && address?.city) || raw?.location?.city || "",
      state: (typeof address === "object" && address?.state) || raw?.location?.state || "",
      country: (typeof address === "object" && address?.country) || raw?.location?.country || "",
    },
    guestCount: raw.guestCount || 0,
    budget: {
      total: raw.budget?.amount ?? raw.budget?.total ?? 0,
      currency: raw.budget?.currency || "NGN",
    },
    completionPercentage: raw.completionPercentage || 0,
    createdAt: raw.createdAt,
  };
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
        const events: UserEvent[] = (
          eventsRes.data.data?.events ||
          eventsRes.data.events ||
          []
        ).map(normalizeEvent);

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
      const statusToApi: Record<string, string> = { Draft: "draft", Planning: "published", Completed: "completed", Cancelled: "cancelled" };
      const response = await api.get("/events", {
        params: {
          ...params,
          status: params?.status ? statusToApi[params.status] || params.status : undefined,
          limit: params?.limit ?? 12,
        },
      });
      const data = response.data.data || response.data;
      const events = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return {
        events: events.map(normalizeEvent),
        total: data.total || 0,
        totalPages: data.totalPages || data.pages || 1,
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
      const events: UserEvent[] = (Array.isArray(data.events) ? data.events : []).map(normalizeEvent);
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
    // The API validates { title, description, eventType, startDate, endDate }
    const start = new Date(data.date);
    const end = data.endDate ? new Date(data.endDate) : new Date(start.getTime() + 6 * 60 * 60 * 1000);
    const description =
      data.description && data.description.trim().length >= 10
        ? data.description.trim()
        : `${data.type} — ${data.name}`.padEnd(10, ".");
    const response = await api.post("/events", {
      title: data.name,
      description,
      eventType: TYPE_TO_API[data.type.toLowerCase()] || "other",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      ...(data.guestCount > 0 ? { guestCount: data.guestCount } : {}),
      location: {
        address: {
          ...(data.location.address ? { street: data.location.address } : {}),
          ...(data.location.city ? { city: data.location.city } : {}),
          ...(data.location.state ? { state: data.location.state } : {}),
          ...(data.location.country ? { country: data.location.country } : {}),
        },
      },
    });
    const created = response.data.data?.event || response.data.event || response.data;
    // The budget lives on the event's budget record
    if (data.budget?.total > 0) {
      await api
        .put(`/events/${created._id}/budget`, { totalBudget: data.budget.total, currency: data.budget.currency })
        .catch(() => {});
    }
    return normalizeEvent(created);
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};

export default userService;
