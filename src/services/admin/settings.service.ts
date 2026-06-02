import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    companyName: string;
    companyAddress: string;
    timezone: string;
    language: string;
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  payment: {
    flutterwaveEnabled: boolean;
    flutterwavePublicKey: string;
    flutterwaveSecretKey: string;
    paystackEnabled: boolean;
    paystackPublicKey: string;
    paystackSecretKey: string;
    currency: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorEnabled: boolean;
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    socialLogin: boolean;
    guestCheckout: boolean;
    reviews: boolean;
    ratings: boolean;
    wishlist: boolean;
    notifications: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
}

class SettingsService {
  private baseUrl = "/admin/settings";

  /**
   * Get all system settings
   */
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const response = await api.get(this.baseUrl);
    const backendData = response.data.data || response.data.settings || {};

    // Provide default values for missing data
    const defaultSettings: SystemSettings = {
      general: {
        siteName: "Confetti",
        siteDescription: "Event Planning & Management Platform",
        contactEmail: "contact@confetti.com",
        supportEmail: "support@confetti.com",
        companyName: "Confetti Inc.",
        companyAddress: "",
        timezone: "Africa/Lagos",
        language: "en",
      },
      email: {
        provider: "smtp",
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        fromEmail: "noreply@confetti.com",
        fromName: "Confetti",
      },
      payment: {
        flutterwaveEnabled: false,
        flutterwavePublicKey: "",
        flutterwaveSecretKey: "",
        paystackEnabled: false,
        paystackPublicKey: "",
        paystackSecretKey: "",
        currency: "NGN",
      },
      security:
        Array.isArray(backendData.security) && backendData.security.length > 0
          ? backendData.security[0]
          : {
              passwordMinLength: 8,
              passwordRequireUppercase: true,
              passwordRequireLowercase: true,
              passwordRequireNumbers: true,
              passwordRequireSpecialChars: false,
              sessionTimeout: 30,
              maxLoginAttempts: 5,
              lockoutDuration: 15,
              twoFactorEnabled: false,
            },
      features:
        Array.isArray(backendData.features) && backendData.features.length > 0
          ? backendData.features[0]
          : {
              userRegistration: true,
              emailVerification: true,
              socialLogin: false,
              guestCheckout: false,
              reviews: true,
              ratings: true,
              wishlist: true,
              notifications: true,
            },
      maintenance: {
        enabled: false,
        message:
          "We're currently performing maintenance. Please check back soon.",
        allowedIPs: [],
      },
    };

    // Merge backend data with defaults
    return {
      settings: {
        general: { ...defaultSettings.general, ...(backendData.general || {}) },
        email: { ...defaultSettings.email, ...(backendData.email || {}) },
        payment: { ...defaultSettings.payment, ...(backendData.payment || {}) },
        security: {
          ...defaultSettings.security,
          ...(backendData.security || {}),
        },
        features: {
          ...defaultSettings.features,
          ...(backendData.features || {}),
        },
        maintenance: {
          ...defaultSettings.maintenance,
          ...(backendData.maintenance || {}),
        },
      },
    };
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: Partial<SystemSettings>): Promise<{
    settings: SystemSettings;
    message: string;
  }> {
    const response = await api.put(this.baseUrl, {
      ...settings,
      resourceType: "system-settings",
    });
    return {
      settings: response.data.data?.settings || response.data.settings,
      message: response.data.message || "Settings updated successfully",
    };
  }

  /**
   * Update specific setting category
   */
  async updateCategory(
    category: keyof SystemSettings,
    data: any
  ): Promise<{
    settings: SystemSettings;
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/${category}`, {
      ...data,
      resourceType: "system-settings",
    });
    return {
      settings: response.data.data?.settings || response.data.settings,
      message:
        response.data.message || `${category} settings updated successfully`,
    };
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(testEmail: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/test-email`, {
      email: testEmail,
    });
    return {
      message: response.data.message || "Test email sent successfully",
    };
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags(): Promise<{ features: SystemSettings["features"] }> {
    const response = await api.get(`${this.baseUrl}/features`);
    return {
      features: response.data.data?.features || response.data.features || {},
    };
  }

  /**
   * Update feature flags
   */
  async updateFeatureFlags(
    features: Partial<SystemSettings["features"]>
  ): Promise<{
    features: SystemSettings["features"];
    message: string;
  }> {
    const response = await api.put(`${this.baseUrl}/features`, {
      ...features,
      resourceType: "feature-flags",
    });
    return {
      features: response.data.data?.features || response.data.features,
      message: response.data.message || "Feature flags updated successfully",
    };
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(
    enabled: boolean,
    message?: string
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/maintenance`, {
      enabled,
      message,
      resourceType: "maintenance-mode",
    });
    return {
      message: response.data.message || "Maintenance mode updated successfully",
    };
  }
}

export default new SettingsService();
