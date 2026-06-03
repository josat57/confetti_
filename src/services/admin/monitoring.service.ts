import axios from "axios";
import {
  SystemHealth,
  ServerMetrics,
  DatabaseMetrics,
  APIMetrics,
  ErrorLog,
  BackgroundJob,
  CacheMetrics,
  MonitoringStats,
  ErrorLogFilters,
  JobFilters,
  ErrorLogListResponse,
  JobListResponse,
  AlertConfig,
} from "@/types/monitoring";

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

class MonitoringService {
  private baseUrl = "/admin/monitoring";

  // System Health
  async getSystemHealth(): Promise<{ health: SystemHealth }> {
    const response = await api.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async getSystemMetrics(): Promise<{ metrics: any }> {
    const response = await api.get(`${this.baseUrl}/metrics`);
    return response.data;
  }

  async getCurrentMetrics(): Promise<{ metrics: any }> {
    const response = await api.get(`${this.baseUrl}/metrics/current`);
    return response.data;
  }

  async getMetricStatistics(metricType: string): Promise<{ statistics: any }> {
    const response = await api.get(
      `${this.baseUrl}/metrics/${metricType}/statistics`
    );
    return response.data;
  }

  async getServerMetrics(): Promise<{ metrics: ServerMetrics }> {
    const response = await api.get(`${this.baseUrl}/server`);
    return response.data;
  }

  async getDatabaseMetrics(): Promise<{ metrics: DatabaseMetrics }> {
    const response = await api.get(`${this.baseUrl}/database`);
    return response.data;
  }

  async getAPIMetrics(): Promise<{ metrics: APIMetrics }> {
    const response = await api.get(`${this.baseUrl}/api`);
    return response.data;
  }

  async getCacheMetrics(): Promise<{ metrics: CacheMetrics }> {
    const response = await api.get(`${this.baseUrl}/cache`);
    return response.data;
  }

  async getStats(): Promise<{ stats: MonitoringStats }> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  // Error Logs
  async getErrorLogs(filters?: ErrorLogFilters): Promise<ErrorLogListResponse> {
    const response = await api.get(`${this.baseUrl}/errors`, {
      params: filters,
    });
    return response.data;
  }

  async getErrorById(errorId: string): Promise<{ error: ErrorLog }> {
    const response = await api.get(`${this.baseUrl}/errors/${errorId}`);
    return response.data;
  }

  async getErrorStatistics(): Promise<{ statistics: any }> {
    const response = await api.get(`${this.baseUrl}/errors/statistics`);
    return response.data;
  }

  async resolveError(errorId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/errors/${errorId}/resolve`
    );
    return response.data;
  }

  async deleteError(errorId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/errors/${errorId}`);
    return response.data;
  }

  // Background Jobs
  async getJobs(filters?: JobFilters): Promise<JobListResponse> {
    const response = await api.get(`${this.baseUrl}/jobs`, { params: filters });
    return response.data;
  }

  async getJobById(jobId: string): Promise<{ job: BackgroundJob }> {
    const response = await api.get(`${this.baseUrl}/jobs/${jobId}`);
    return response.data;
  }

  async retryJob(jobId: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/jobs/${jobId}/retry`);
    return response.data;
  }

  async cancelJob(jobId: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/jobs/${jobId}/cancel`);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/jobs/${jobId}`);
    return response.data;
  }

  // Cache Management
  async clearCache(pattern?: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/cache/clear`, { pattern });
    return response.data;
  }

  async clearAllCache(): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/cache/clear-all`);
    return response.data;
  }

  // Alerts
  async getAlerts(): Promise<{ alerts: AlertConfig[] }> {
    const response = await api.get(`${this.baseUrl}/alerts`);
    return response.data;
  }

  async getAlertById(alertId: string): Promise<{ alert: AlertConfig }> {
    const response = await api.get(`${this.baseUrl}/alerts/${alertId}`);
    return response.data;
  }

  async acknowledgeAlert(alertId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/alerts/${alertId}/acknowledge`
    );
    return response.data;
  }

  async resolveAlert(alertId: string): Promise<{ message: string }> {
    const response = await api.post(
      `${this.baseUrl}/alerts/${alertId}/resolve`
    );
    return response.data;
  }

  async getAlertStatistics(): Promise<{ statistics: any }> {
    const response = await api.get(`${this.baseUrl}/alerts/statistics`);
    return response.data;
  }

  async createAlert(
    data: Omit<AlertConfig, "_id" | "createdAt" | "updatedAt">
  ): Promise<{ alert: AlertConfig; message: string }> {
    const response = await api.post(`${this.baseUrl}/alerts`, data);
    return response.data;
  }

  async updateAlert(
    alertId: string,
    data: Partial<AlertConfig>
  ): Promise<{ alert: AlertConfig; message: string }> {
    const response = await api.put(`${this.baseUrl}/alerts/${alertId}`, data);
    return response.data;
  }

  async deleteAlert(alertId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/alerts/${alertId}`);
    return response.data;
  }

  // Historical Data
  async getHistoricalMetrics(
    type: "server" | "database" | "api",
    timeRange: "1h" | "24h" | "7d" | "30d"
  ): Promise<{ data: any[] }> {
    const response = await api.get(`${this.baseUrl}/historical/${type}`, {
      params: { timeRange },
    });
    return response.data;
  }
}

export default new MonitoringService();
