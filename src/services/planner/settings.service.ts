import api from "@/api/api";

export interface ProfileData {
  userName?: string; // Keep for backward compatibility
  firstName?: string;
  lastName?: string;
  otherName?: string;
  email: string;
  phone: string;
  aboutMe?: string;
  bio?: string; // Alternative field name
  profileImage?: string;
  photo?: string; // Alternative field name
  coverPhoto?: string;
  companyName?: string;
  businessName?: string; // Alternative field name
  businessAddress?: string;
  businessPhone?: string;
  registrationNumber?: string;
  street?: string;
  address?: string; // Keep for backward compatibility
  city?: string;
  state?: string;
  nationality?: string;
  country?: string; // Alternative field name
  website?: string;
  businessLogo?: string;
  companyLogo?: string;
}

export interface NotificationPreferences {
  email: {
    vendorResponses: boolean;
    clientApprovals: boolean;
    taskDeadlines: boolean;
    paymentDue: boolean;
    newMessages: boolean;
  };
  inApp: {
    vendorResponses: boolean;
    clientApprovals: boolean;
    taskDeadlines: boolean;
    paymentDue: boolean;
    newMessages: boolean;
  };
  sms: {
    urgentOnly: boolean;
    enabled: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface GeneralPreferences {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
}

export interface BrandingData {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface PreferencesData {
  notifications?: {
    email?: boolean;
    inApp?: boolean;
    sms?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
}

export interface SubscriptionData {
  planName: string;
  planType: string;
  status: string;
  currentPeriodEnd: string;
  tier?: string;
  billingCycle?: string;
  nextBillingDate?: string;
  usage: {
    activeEvents?: number;
    maxEvents?: number;
    teamMembers?: number;
    maxTeamMembers?: number;
    storageUsed?: number;
    maxStorage?: number;
    events?: {
      used: number;
      limit: number;
    };
    clients?: {
      used: number;
      limit: number;
    };
    storage?: {
      used: number;
      limit: number;
    };
  };
}

export const settingsService = {
  /**
   * Get profile settings
   */
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await api.get("/planner/settings/profile");
      // Backend returns data nested as: { status: "success", data: { profile: {...} } }
      return (
        response.data.data?.profile ||
        response.data.profile ||
        response.data.data ||
        response.data
      );
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  },

  /**
   * Update profile settings
   */
  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const response = await api.put("/planner/settings/profile", data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  },

  /**
   * Upload business logo
   */
  async uploadBusinessLogo(formData: FormData): Promise<any> {
    try {
      const response = await api.post(
        "/planner/settings/business-logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to upload business logo:", error);
      throw error;
    }
  },

  /**
   * Update preferences (notification, general, etc.)
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences & GeneralPreferences>
  ): Promise<void> {
    try {
      await api.put("/planner/settings/preferences", preferences);
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  },

  /**
   * Get subscription information
   */
  async getSubscription(): Promise<SubscriptionData> {
    try {
      const response = await api.get("/planner/settings/subscription");
      // Backend returns: { status: "success", data: { billing: { subscription: {...} } } }
      return (
        response.data.data?.billing?.subscription ||
        response.data.billing?.subscription ||
        response.data.data ||
        response.data
      );
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      throw error;
    }
  },

  /**
   * Request data export
   */
  async requestDataExport(): Promise<{ exportId: string }> {
    try {
      const response = await api.post("/planner/settings/export");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to request data export:", error);
      throw error;
    }
  },

  /**
   * Get data export status and download URL
   */
  async getDataExport(exportId?: string): Promise<{
    status: string;
    downloadUrl?: string;
  }> {
    try {
      const url = exportId
        ? `/planner/settings/export?exportId=${exportId}`
        : "/planner/settings/export";
      const response = await api.get(url);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get data export:", error);
      throw error;
    }
  },

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete("/planner/settings/account", {
        data: { password },
      });
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  },

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(
    tier: string,
    billingCycle: "monthly" | "annual"
  ): Promise<void> {
    try {
      await api.post("/planner/settings/subscription/upgrade", {
        tier,
        billingCycle,
      });
    } catch (error) {
      console.error("Failed to upgrade subscription:", error);
      throw error;
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      await api.post("/planner/settings/subscription/cancel");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw error;
    }
  },

  /**
   * Get billing portal URL
   */
  async getBillingPortalUrl(): Promise<{ url: string }> {
    try {
      const response = await api.get("/planner/settings/billing/portal");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get billing portal URL:", error);
      throw error;
    }
  },

  /**
   * Initialize payment method setup
   */
  async initializePaymentMethod(): Promise<any> {
    try {
      const response = await api.post(
        "/planner/settings/payment-methods/initialize"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to initialize payment method:", error);
      throw error;
    }
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await api.get(
        "/planner/settings/payment-methods"
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get payment methods:", error);
      throw error;
    }
  },

  /**
   * Remove payment method
   */
  async removePaymentMethod(id: string): Promise<void> {
    try {
      await api.delete(`/planner/settings/payment-methods/${id}`);
    } catch (error) {
      console.error("Failed to remove payment method:", error);
      throw error;
    }
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(id: string): Promise<void> {
    try {
      await api.patch(`/planner/settings/payment-methods/${id}/default`);
    } catch (error) {
      console.error("Failed to set default payment method:", error);
      throw error;
    }
  },

  /**
   * Get branding settings
   */
  async getBranding(): Promise<BrandingData> {
    try {
      const response = await api.get("/planner/settings/branding");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get branding:", error);
      // Return default branding on error
      return {
        logo: "",
        primaryColor: "#0d9488",
        secondaryColor: "#14b8a6",
        accentColor: "#2dd4bf",
      };
    }
  },

  /**
   * Update branding settings
   */
  async updateBranding(data: Partial<BrandingData>): Promise<BrandingData> {
    try {
      const response = await api.put("/planner/settings/branding", data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to update branding:", error);
      throw error;
    }
  },

  /**
   * Upload logo
   */
  async uploadLogo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const response = await api.post(
        "/planner/settings/branding/logo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data?.logoUrl || response.data.logoUrl || "";
    } catch (error) {
      console.error("Failed to upload logo:", error);
      throw error;
    }
  },

  /**
   * Export all data
   */
  async exportData(): Promise<Blob> {
    try {
      const response = await api.get("/planner/settings/export", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  },

  /**
   * Get preferences
   */
  async getPreferences(): Promise<PreferencesData> {
    try {
      const response = await api.get("/planner/settings/preferences");
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to get preferences:", error);
      // Return default preferences on error
      return {
        notifications: {
          email: true,
          inApp: true,
          sms: false,
          quietHoursStart: "",
          quietHoursEnd: "",
        },
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        currency: "USD",
      };
    }
  },

  /**
   * Upload profile photo
   */
  async uploadPhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await api.post(
        "/planner/settings/profile/photo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data?.photoUrl || response.data.photoUrl || "";
    } catch (error) {
      console.error("Failed to upload photo:", error);
      throw error;
    }
  },
};

export default settingsService;
