import axios from "axios";
import {
  FeatureFlag,
  ABTest,
  FeatureUsageAnalytics,
  FeatureFlagFilters,
  ABTestFilters,
  FeatureFlagListResponse,
  ABTestListResponse,
  CreateFeatureFlagRequest,
  CreateABTestRequest,
  UpdateFeatureFlagRequest,
  RolloutConfig,
  ABTestResults,
} from "@/types/feature-flags";

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

class FeatureFlagsService {
  private baseUrl = "/admin/feature-flags";

  // Feature Flags
  async getFeatureFlags(
    filters?: FeatureFlagFilters
  ): Promise<FeatureFlagListResponse> {
    const response = await api.get(this.baseUrl, {
      params: filters,
    });
    return response.data;
  }

  async getFeatureFlagByKey(key: string): Promise<{ flag: FeatureFlag }> {
    const response = await api.get(`${this.baseUrl}/${key}`);
    return response.data;
  }

  // Alias for backward compatibility
  async getFeatureFlagById(flagId: string): Promise<{ flag: FeatureFlag }> {
    return this.getFeatureFlagByKey(flagId);
  }

  async createFeatureFlag(
    data: CreateFeatureFlagRequest
  ): Promise<{ flag: FeatureFlag; message: string }> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateFeatureFlag(
    key: string,
    data: UpdateFeatureFlagRequest
  ): Promise<{ flag: FeatureFlag; message: string }> {
    const response = await api.put(`${this.baseUrl}/${key}`, data);
    return response.data;
  }

  async deleteFeatureFlag(key: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${key}`);
    return response.data;
  }

  async toggleFeatureFlag(
    key: string,
    enabled?: boolean
  ): Promise<{ message: string }> {
    const response = await api.patch(`${this.baseUrl}/${key}/toggle`, {
      enabled,
    });
    return response.data;
  }

  // Legacy methods for backward compatibility (A/B Tests, etc.)
  async archiveFeatureFlag(key: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${key}/archive`);
    return response.data;
  }

  async updateRollout(
    key: string,
    rollout: RolloutConfig
  ): Promise<{ message: string }> {
    const response = await api.put(`${this.baseUrl}/${key}/rollout`, rollout);
    return response.data;
  }

  async increaseRollout(
    key: string,
    percentage: number
  ): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${key}/rollout/increase`, {
      percentage,
    });
    return response.data;
  }

  // A/B Tests (kept for backward compatibility, may not be in backend)
  async getABTests(filters?: ABTestFilters): Promise<ABTestListResponse> {
    const response = await api.get(`/admin/ab-tests`, {
      params: filters,
    });
    return response.data;
  }

  async getABTestById(testId: string): Promise<{ test: ABTest }> {
    const response = await api.get(`/admin/ab-tests/${testId}`);
    return response.data;
  }

  async createABTest(
    data: CreateABTestRequest
  ): Promise<{ test: ABTest; message: string }> {
    const response = await api.post(`/admin/ab-tests`, data);
    return response.data;
  }

  async updateABTest(
    testId: string,
    data: Partial<CreateABTestRequest>
  ): Promise<{ test: ABTest; message: string }> {
    const response = await api.put(`/admin/ab-tests/${testId}`, data);
    return response.data;
  }

  async deleteABTest(testId: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/ab-tests/${testId}`);
    return response.data;
  }

  async startABTest(testId: string): Promise<{ message: string }> {
    const response = await api.post(`/admin/ab-tests/${testId}/start`);
    return response.data;
  }

  async pauseABTest(testId: string): Promise<{ message: string }> {
    const response = await api.post(`/admin/ab-tests/${testId}/pause`);
    return response.data;
  }

  async endABTest(
    testId: string,
    winnerId?: string
  ): Promise<{ message: string }> {
    const response = await api.post(`/admin/ab-tests/${testId}/end`, {
      winnerId,
    });
    return response.data;
  }

  async getABTestResults(testId: string): Promise<{ results: ABTestResults }> {
    const response = await api.get(`/admin/ab-tests/${testId}/results`);
    return response.data;
  }

  async archiveABTest(testId: string): Promise<{ message: string }> {
    const response = await api.post(`/admin/ab-tests/${testId}/archive`);
    return response.data;
  }

  // Feature Usage Analytics
  async getFeatureUsageAnalytics(
    key: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<{ analytics: FeatureUsageAnalytics }> {
    const response = await api.get(`${this.baseUrl}/${key}/analytics`, {
      params: dateRange,
    });
    return response.data;
  }

  async getAllFeatureUsage(): Promise<{ analytics: FeatureUsageAnalytics[] }> {
    const response = await api.get(`${this.baseUrl}/analytics`);
    return response.data;
  }

  // Rollback
  async rollbackFeature(key: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${key}/rollback`);
    return response.data;
  }

  // Evaluate Feature Flag (for testing)
  async evaluateFeatureFlag(
    flagKey: string,
    userId?: string
  ): Promise<{ enabled: boolean; variant?: string }> {
    const response = await api.post(`${this.baseUrl}/evaluate`, {
      flagKey,
      userId,
    });
    return response.data;
  }
}

export default new FeatureFlagsService();
