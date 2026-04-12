import axios from "axios";
import {
  SystemSettings,
  SubscriptionTierConfig,
  FeatureFlag,
  SettingsUpdateRequest,
  EmailTemplate,
} from "@/types/system-settings";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class SystemSettingsService {
  private baseUrl = "/admin/system";

  // System Configurations
  async getSystemConfigs(): Promise<{ configs: any[] }> {
    const response = await api.get(`${this.baseUrl}/configs`);
    return response.data;
  }

  async getSystemConfigByKey(key: string): Promise<{ config: any }> {
    const response = await api.get(`${this.baseUrl}/configs/${key}`);
    return response.data;
  }

  async createSystemConfig(data: {
    key: string;
    value: any;
    description?: string;
  }): Promise<{ config: any; message: string }> {
    const response = await api.post(`${this.baseUrl}/configs`, data);
    return response.data;
  }

  async updateSystemConfig(
    key: string,
    data: { value: any; description?: string }
  ): Promise<{ config: any; message: string }> {
    const response = await api.put(`${this.baseUrl}/configs/${key}`, data);
    return response.data;
  }

  async deleteSystemConfig(key: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/configs/${key}`);
    return response.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<{ settings: any }> {
    const response = await api.get(`/admin/security/settings`);
    return response.data;
  }

  async updateSecuritySetting(
    key: string,
    value: any
  ): Promise<{ setting: any; message: string }> {
    const response = await api.put(`/admin/security/settings/${key}`, {
      value,
    });
    return response.data;
  }

  async getSecurityLogs(): Promise<{ logs: any[] }> {
    const response = await api.get(`/admin/security-logs`);
    return response.data;
  }

  // Legacy methods for backward compatibility
  async getSettings(): Promise<{ settings: SystemSettings }> {
    const configs = await this.getSystemConfigs();
    return { settings: configs.configs as any };
  }

  async updateSettings(
    request: SettingsUpdateRequest
  ): Promise<{ settings: SystemSettings; message: string }> {
    // Update multiple configs
    const results = await Promise.all(
      Object.entries(request).map(([key, value]) =>
        this.updateSystemConfig(key, { value })
      )
    );
    return {
      settings: {} as SystemSettings,
      message: "Settings updated successfully",
    };
  }

  async getSubscriptionTiers(): Promise<{ tiers: SubscriptionTierConfig[] }> {
    const response = await api.get(`${this.baseUrl}/subscription-tiers`);
    return response.data;
  }

  async createSubscriptionTier(
    tier: Omit<SubscriptionTierConfig, "_id" | "createdAt" | "updatedAt">
  ): Promise<{ tier: SubscriptionTierConfig; message: string }> {
    const response = await api.post(`${this.baseUrl}/subscription-tiers`, tier);
    return response.data;
  }

  async updateSubscriptionTier(
    tierId: string,
    updates: Partial<SubscriptionTierConfig>
  ): Promise<{ tier: SubscriptionTierConfig; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/subscription-tiers/${tierId}`,
      updates
    );
    return response.data;
  }

  async deleteSubscriptionTier(tierId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/subscription-tiers/${tierId}`
    );
    return response.data;
  }

  async testPaymentGateway(
    gateway: "flutterwave" | "paystack"
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`${this.baseUrl}/test-gateway`, {
      gateway,
    });
    return response.data;
  }

  async getEmailTemplates(): Promise<{ templates: EmailTemplate[] }> {
    const response = await api.get(`${this.baseUrl}/email-templates`);
    return response.data;
  }

  async updateEmailTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<{ template: EmailTemplate; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/email-templates/${templateId}`,
      updates
    );
    return response.data;
  }

  async getFeatureFlags(): Promise<{ flags: FeatureFlag[] }> {
    const response = await api.get(`${this.baseUrl}/feature-flags`);
    return response.data;
  }

  async updateFeatureFlag(
    flagId: string,
    updates: Partial<FeatureFlag>
  ): Promise<{ flag: FeatureFlag; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/feature-flags/${flagId}`,
      updates
    );
    return response.data;
  }
}

export default new SystemSettingsService();
