import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface Notification {
  _id: string;
  recipient: string;
  type: "lead" | "booking" | "payment" | "review" | "system" | "team";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: {
    leadId?: string;
    bookingId?: string;
    paymentId?: string;
    reviewId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  readAt?: Date;
}

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(params?: {
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    const response = await api.get("/notifications", { params });
    return {
      notifications:
        response.data.data?.notifications || response.data.notifications || [],
      total: response.data.data?.total || response.data.total || 0,
      unreadCount:
        response.data.data?.unreadCount || response.data.unreadCount || 0,
    };
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread-count");
    return response.data.data?.count || response.data.count || 0;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    await api.delete("/notifications/read");
  },
};

export default notificationsService;
