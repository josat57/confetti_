/**
 * Activity Service
 * Handles all activity feed and dashboard stats related API calls
 */

import api from "@/api/api";
import type {
  Activity,
  ActivityFilters,
  ActivitiesResponse,
  ActivityStats,
  DashboardStats,
} from "@/types/activity.types";

export const activityService = {
  /**
   * Get all activities with optional filters
   */
  async getAll(params?: ActivityFilters): Promise<ActivitiesResponse> {
    const response = await api.get("/vendors/activities", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get a single activity by ID
   */
  async getById(id: string): Promise<Activity> {
    const response = await api.get(`/vendors/activities/${id}`, {
      withCredentials: true,
    });
    return response.data.data.activity;
  },

  /**
   * Mark activity as read
   */
  async markAsRead(id: string): Promise<Activity> {
    const response = await api.patch(
      `/vendors/activities/${id}/read`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.activity;
  },

  /**
   * Mark all activities as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch(
      "/vendors/activities/read-all",
      {},
      {
        withCredentials: true,
      }
    );
  },

  /**
   * Delete an activity
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/activities/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Clear all activities
   */
  async clearAll(): Promise<void> {
    await api.delete("/vendors/activities", {
      withCredentials: true,
    });
  },

  /**
   * Get activity statistics
   */
  async getStats(): Promise<ActivityStats> {
    const response = await api.get("/vendors/activities/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get recent activities
   */
  async getRecent(limit?: number): Promise<Activity[]> {
    const response = await api.get("/vendors/activities/recent", {
      params: { limit },
      withCredentials: true,
    });
    return response.data.data.activities;
  },

  /**
   * Get unread activities
   */
  async getUnread(): Promise<Activity[]> {
    const response = await api.get("/vendors/activities/unread", {
      withCredentials: true,
    });
    return response.data.data.activities;
  },

  /**
   * Get activities by type
   */
  async getByType(type: string, limit?: number): Promise<Activity[]> {
    const response = await api.get("/vendors/activities/by-type", {
      params: { type, limit },
      withCredentials: true,
    });
    return response.data.data.activities;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/vendors/profile/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get dashboard summary (stats + recent activities)
   */
  async getDashboardSummary(): Promise<{
    stats: DashboardStats;
    activities: Activity[];
  }> {
    const response = await api.get("/vendors/dashboard/summary", {
      withCredentials: true,
    });
    const data = response.data.data;

    // Backend returns 'recentActivity' but we need 'activities'
    return {
      stats: data.summary || data.stats || {},
      activities: data.recentActivity || data.activities || [],
    };
  },
};

export default activityService;
