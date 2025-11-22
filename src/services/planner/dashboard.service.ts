// Dashboard Service for Planner Dashboard
import api from "@/api/api";

export interface DashboardMetrics {
  activeEvents: number;
  upcomingEvents: number;
  totalClients: number;
  totalBudget: number;
  statusDistribution: {
    draft: number;
    planning: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export interface RecentActivity {
  id: string;
  type: "event" | "task" | "vendor" | "client";
  title: string;
  description: string;
  timestamp: Date;
}

export interface Deadline {
  id: string;
  title: string;
  type: "task" | "payment" | "event";
  dueDate: Date;
  eventId?: string;
  eventName?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export const dashboardService = {
  /**
   * Fetch dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get("/planner/dashboard/metrics");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
      // Return mock data for development
      return {
        activeEvents: 0,
        upcomingEvents: 0,
        totalClients: 0,
        totalBudget: 0,
        statusDistribution: {
          draft: 0,
          planning: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        },
      };
    }
  },

  /**
   * Fetch recent activity
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const response = await api.get("/planner/dashboard/activity");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      return [];
    }
  },

  /**
   * Fetch upcoming deadlines
   */
  async getUpcomingDeadlines(): Promise<Deadline[]> {
    try {
      const response = await api.get("/planner/dashboard/quick-stats");
      // Handle different response structures
      const data = response.data?.data || response.data;

      // If data has a deadlines property, use that
      if (data?.deadlines && Array.isArray(data.deadlines)) {
        return data.deadlines;
      }

      // If data itself is an array, return it
      if (Array.isArray(data)) {
        return data;
      }

      // Otherwise return empty array
      return [];
    } catch (error) {
      console.error("Failed to fetch upcoming deadlines:", error);
      return [];
    }
  },
};
