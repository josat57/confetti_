import axios from "axios";

/**
 * @deprecated This file is deprecated. Please use the service files in src/services/admin/ instead.
 *
 * New service files provide:
 * - Proper TypeScript types
 * - Consistent error handling
 * - Better organization
 * - Up-to-date endpoints
 *
 * Migration guide:
 * - AdminAPI.getDashboardStats() → analyticsService.getDashboardMetrics()
 * - AdminAPI.getUsers() → usersService.getUsers()
 * - AdminAPI.getVendors() → vendorsService.getVendors()
 */

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Admin API functions
export const AdminAPI = {
  // Authentication & Authorization
  adminLogin: async (credentials: {
    email: string;
    password: string;
    twoFactorCode?: string;
  }) => {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  },

  adminLogout: async () => {
    const response = await api.post("/admin/logout");
    return response.data;
  },

  verifyAdminAccess: async () => {
    const response = await api.get("/admin/verify");
    return response.data;
  },

  // Admin Management
  getAdmins: async () => {
    const response = await api.get("/admin/admins");
    return response.data;
  },

  createAdmin: async (adminData: any) => {
    const response = await api.post("/admin/admins", adminData);
    return response.data;
  },

  updateAdmin: async (adminId: string, adminData: any) => {
    const response = await api.put(`/admin/admins/${adminId}`, adminData);
    return response.data;
  },

  deleteAdmin: async (adminId: string) => {
    const response = await api.delete(`/admin/admins/${adminId}`);
    return response.data;
  },

  // User Management
  getUsers: async (params?: any) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Vendor Management
  getVendors: async (params?: any) => {
    const response = await api.get("/admin/vendors", { params });
    return response.data;
  },

  getVendorDetails: async (vendorId: string) => {
    const response = await api.get(`/admin/vendors/${vendorId}`);
    return response.data;
  },

  verifyVendor: async (vendorId: string, verificationData: any) => {
    const response = await api.put(
      `/admin/vendors/${vendorId}/verify`,
      verificationData
    );
    return response.data;
  },

  updateVendorStatus: async (vendorId: string, status: string) => {
    const response = await api.put(`/admin/vendors/${vendorId}/status`, {
      status,
    });
    return response.data;
  },

  deleteVendor: async (vendorId: string) => {
    const response = await api.delete(`/admin/vendors/${vendorId}`);
    return response.data;
  },

  // Content Management
  getContent: async (params?: any) => {
    const response = await api.get("/admin/content", { params });
    return response.data;
  },

  updateContent: async (contentId: string, contentData: any) => {
    const response = await api.put(`/admin/content/${contentId}`, contentData);
    return response.data;
  },

  deleteContent: async (contentId: string) => {
    const response = await api.delete(`/admin/content/${contentId}`);
    return response.data;
  },

  // System Configuration
  getSystemSettings: async () => {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  updateSystemSettings: async (settings: any) => {
    const response = await api.put("/admin/settings", settings);
    return response.data;
  },

  getFeatureFlags: async () => {
    const response = await api.get("/admin/feature-flags");
    return response.data;
  },

  updateFeatureFlags: async (flags: any) => {
    const response = await api.put("/admin/feature-flags", flags);
    return response.data;
  },

  // Moderation
  getReports: async (params?: any) => {
    const response = await api.get("/admin/reports", { params });
    return response.data;
  },

  handleReport: async (reportId: string, action: string, reason?: string) => {
    const response = await api.put(`/admin/reports/${reportId}`, {
      action,
      reason,
    });
    return response.data;
  },

  moderateContent: async (
    contentId: string,
    action: string,
    reason?: string
  ) => {
    const response = await api.put(`/admin/content/${contentId}/moderate`, {
      action,
      reason,
    });
    return response.data;
  },

  // Support System
  getSupportTickets: async (params?: any) => {
    const response = await api.get("/admin/support-tickets", { params });
    return response.data;
  },

  getTicketDetails: async (ticketId: string) => {
    const response = await api.get(`/admin/support-tickets/${ticketId}`);
    return response.data;
  },

  updateTicketStatus: async (
    ticketId: string,
    status: string,
    response?: string
  ) => {
    const responseData = await api.put(`/admin/support-tickets/${ticketId}`, {
      status,
      response,
    });
    return responseData.data;
  },

  // Audit & Logging
  getAuditLogs: async (params?: any) => {
    const response = await api.get("/admin/audit-logs", { params });
    return response.data;
  },

  getAdminActions: async (params?: any) => {
    const response = await api.get("/admin/admin-actions", { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (params?: any) => {
    const response = await api.get("/admin/analytics", { params });
    return response.data;
  },

  getDashboardStats: async () => {
    // ✅ CORRECT: Updated to match backend endpoint
    const response = await api.get("/admin/dashboard/metrics");
    return response.data;
  },

  generateReport: async (reportType: string, dateRange: any) => {
    const response = await api.post("/admin/reports/generate", {
      reportType,
      dateRange,
    });
    return response.data;
  },

  // Communication
  sendAnnouncement: async (announcement: any) => {
    const response = await api.post("/admin/announcements", announcement);
    return response.data;
  },

  getAnnouncements: async () => {
    const response = await api.get("/admin/announcements");
    return response.data;
  },

  updateAnnouncement: async (announcementId: string, announcement: any) => {
    const response = await api.put(
      `/admin/announcements/${announcementId}`,
      announcement
    );
    return response.data;
  },

  deleteAnnouncement: async (announcementId: string) => {
    const response = await api.delete(`/admin/announcements/${announcementId}`);
    return response.data;
  },

  // Security & Compliance
  getSecurityLogs: async (params?: any) => {
    const response = await api.get("/admin/security-logs", { params });
    return response.data;
  },

  getComplianceReports: async () => {
    const response = await api.get("/admin/compliance-reports");
    return response.data;
  },

  updateSecuritySettings: async (settings: any) => {
    const response = await api.put("/admin/security-settings", settings);
    return response.data;
  },

  // Financial Oversight
  getFinancialReports: async (params?: any) => {
    const response = await api.get("/admin/financial-reports", { params });
    return response.data;
  },

  getTransactions: async (params?: any) => {
    const response = await api.get("/admin/transactions", { params });
    return response.data;
  },

  getRevenueStats: async (params?: any) => {
    const response = await api.get("/admin/revenue-stats", { params });
    return response.data;
  },

  // Notifications
  sendNotification: async (notification: any) => {
    const response = await api.post("/admin/notifications", notification);
    return response.data;
  },

  getNotificationHistory: async (params?: any) => {
    const response = await api.get("/admin/notifications", { params });
    return response.data;
  },
};

export default AdminAPI;
