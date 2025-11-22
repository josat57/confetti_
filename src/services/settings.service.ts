import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    const response = await api.get("/settings");
    return response.data;
  },

  // Export user data (GDPR)
  exportData: async () => {
    const response = await api.get("/settings/export-data");
    return response.data;
  },

  // Notification Settings
  updateNotifications: async (data: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    newLeads?: boolean;
    bookingUpdates?: boolean;
    paymentReminders?: boolean;
    marketingEmails?: boolean;
    systemUpdates?: boolean;
  }) => {
    const response = await api.patch("/settings/notifications", data);
    return response.data;
  },

  // Preference Settings
  updatePreferences: async (data: {
    theme?: "light" | "dark" | "auto";
    language?: string;
    timezone?: string;
    currency?: string;
    dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    timeFormat?: "12h" | "24h";
  }) => {
    const response = await api.patch("/settings/preferences", data);
    return response.data;
  },

  // Security Settings
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.patch("/users/me/password", data);
    return response.data;
  },

  getSecurityActivity: async () => {
    const response = await api.get("/settings/security/activity");
    return response.data;
  },

  // Two-Factor Authentication
  enable2FA: async () => {
    const response = await api.post("/settings/security/2fa/enable");
    return response.data;
  },

  verify2FA: async (token: string) => {
    const response = await api.post("/settings/security/2fa/verify", { token });
    return response.data;
  },

  disable2FA: async (password: string) => {
    const response = await api.post("/settings/security/2fa/disable", {
      password,
    });
    return response.data;
  },

  regenerateBackupCodes: async () => {
    const response = await api.post("/settings/security/2fa/backup-codes");
    return response.data;
  },

  // Billing Settings
  initializePaymentMethod: async () => {
    const response = await api.post(
      "/settings/billing/payment-methods/initialize"
    );
    return response.data;
  },

  verifyPaymentMethod: async (reference: string) => {
    const response = await api.post(
      "/settings/billing/payment-methods/verify",
      { reference }
    );
    return response.data;
  },

  removePaymentMethod: async (id: string) => {
    const response = await api.delete(
      `/settings/billing/payment-methods/${id}`
    );
    return response.data;
  },

  setDefaultPaymentMethod: async (id: string) => {
    const response = await api.patch(
      `/settings/billing/payment-methods/${id}/default`
    );
    return response.data;
  },

  changePlan: async (data: {
    planId: string;
    planName: string;
    amount: number;
    currency: string;
  }) => {
    const response = await api.post("/settings/billing/change-plan", data);
    return response.data;
  },
};
