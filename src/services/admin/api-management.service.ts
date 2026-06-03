import axios from "axios";
import {
  APIKey,
  APILog,
  APIUsageStats,
  Webhook,
  Integration,
  APIKeyFilters,
  APILogFilters,
  WebhookFilters,
  IntegrationFilters,
  APIKeyListResponse,
  APILogListResponse,
  WebhookListResponse,
  IntegrationListResponse,
  CreateAPIKeyRequest,
  CreateWebhookRequest,
  CreateIntegrationRequest,
  RateLimitConfig,
} from "@/types/api-management";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  withCredentials: true,
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

class APIManagementService {
  private baseUrl = "/admin/api";

  // API Keys
  async getAPIKeys(filters?: APIKeyFilters): Promise<APIKeyListResponse> {
    const response = await api.get(`${this.baseUrl}/keys`, { params: filters });
    return response.data;
  }

  async getAPIKeyById(keyId: string): Promise<{ apiKey: APIKey }> {
    const response = await api.get(`${this.baseUrl}/keys/${keyId}`);
    return response.data;
  }

  async createAPIKey(
    data: CreateAPIKeyRequest
  ): Promise<{ apiKey: APIKey; message: string }> {
    const response = await api.post(`${this.baseUrl}/keys`, data);
    return response.data;
  }

  async updateAPIKey(
    keyId: string,
    data: Partial<CreateAPIKeyRequest>
  ): Promise<{ apiKey: APIKey; message: string }> {
    const response = await api.put(`${this.baseUrl}/keys/${keyId}`, data);
    return response.data;
  }

  async revokeAPIKey(keyId: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/keys/${keyId}/revoke`);
    return response.data;
  }

  async deleteAPIKey(keyId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/keys/${keyId}`);
    return response.data;
  }

  async regenerateAPIKey(
    keyId: string
  ): Promise<{ apiKey: APIKey; message: string }> {
    const response = await api.post(`${this.baseUrl}/keys/${keyId}/regenerate`);
    return response.data;
  }

  async updateRateLimit(
    keyId: string,
    rateLimit: RateLimitConfig
  ): Promise<{ message: string }> {
    const response = await api.put(
      `${this.baseUrl}/keys/${keyId}/rate-limit`,
      rateLimit
    );
    return response.data;
  }

  // API Logs
  async getAPILogs(filters?: APILogFilters): Promise<APILogListResponse> {
    const response = await api.get(`${this.baseUrl}/logs`, { params: filters });
    return response.data;
  }

  async getAPILogById(logId: string): Promise<{ log: APILog }> {
    const response = await api.get(`${this.baseUrl}/logs/${logId}`);
    return response.data;
  }

  async exportAPILogs(
    filters?: APILogFilters,
    format: "csv" | "json" = "csv"
  ): Promise<{ downloadUrl: string }> {
    const response = await api.post(`${this.baseUrl}/logs/export`, {
      filters,
      format,
    });
    return response.data;
  }

  // API Usage Stats
  async getAPIUsageStats(
    keyId?: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<{ stats: APIUsageStats }> {
    const response = await api.get(`${this.baseUrl}/stats`, {
      params: { keyId, ...dateRange },
    });
    return response.data;
  }

  // Webhooks
  async getWebhooks(filters?: WebhookFilters): Promise<WebhookListResponse> {
    const response = await api.get(`${this.baseUrl}/webhooks`, {
      params: filters,
    });
    return response.data;
  }

  async getWebhookById(webhookId: string): Promise<{ webhook: Webhook }> {
    const response = await api.get(`${this.baseUrl}/webhooks/${webhookId}`);
    return response.data;
  }

  async createWebhook(
    data: CreateWebhookRequest
  ): Promise<{ webhook: Webhook; message: string }> {
    const response = await api.post(`${this.baseUrl}/webhooks`, data);
    return response.data;
  }

  async updateWebhook(
    webhookId: string,
    data: Partial<CreateWebhookRequest>
  ): Promise<{ webhook: Webhook; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/webhooks/${webhookId}`,
      data
    );
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/webhooks/${webhookId}`);
    return response.data;
  }

  async testWebhook(
    webhookId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/webhooks/${webhookId}/test`
    );
    return response.data;
  }

  async toggleWebhook(
    webhookId: string,
    active: boolean
  ): Promise<{ message: string }> {
    const response = await api.patch(
      `${this.baseUrl}/webhooks/${webhookId}/toggle`,
      { active }
    );
    return response.data;
  }

  // Integrations
  async getIntegrations(
    filters?: IntegrationFilters
  ): Promise<IntegrationListResponse> {
    const response = await api.get(`${this.baseUrl}/integrations`, {
      params: filters,
    });
    return response.data;
  }

  async getIntegrationById(
    integrationId: string
  ): Promise<{ integration: Integration }> {
    const response = await api.get(
      `${this.baseUrl}/integrations/${integrationId}`
    );
    return response.data;
  }

  async createIntegration(
    data: CreateIntegrationRequest
  ): Promise<{ integration: Integration; message: string }> {
    const response = await api.post(`${this.baseUrl}/integrations`, data);
    return response.data;
  }

  async updateIntegration(
    integrationId: string,
    data: Partial<CreateIntegrationRequest>
  ): Promise<{ integration: Integration; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/integrations/${integrationId}`,
      data
    );
    return response.data;
  }

  async deleteIntegration(integrationId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/integrations/${integrationId}`
    );
    return response.data;
  }

  async toggleIntegration(
    integrationId: string,
    enabled: boolean
  ): Promise<{ message: string }> {
    const response = await api.patch(
      `${this.baseUrl}/integrations/${integrationId}/toggle`,
      { enabled }
    );
    return response.data;
  }

  async testIntegration(
    integrationId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/integrations/${integrationId}/test`
    );
    return response.data;
  }

  async syncIntegration(integrationId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/integrations/${integrationId}/sync`
    );
    return response.data;
  }

  // Available Events for Webhooks
  async getAvailableEvents(): Promise<{ events: string[] }> {
    const response = await api.get(`${this.baseUrl}/webhooks/events`);
    return response.data;
  }

  // Available Integration Providers
  async getAvailableProviders(): Promise<{
    providers: { type: string; name: string; description: string }[];
  }> {
    const response = await api.get(`${this.baseUrl}/integrations/providers`);
    return response.data;
  }
}

export default new APIManagementService();
