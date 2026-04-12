import axios from "axios";
import {
  UserAnalytics,
  EventAnalytics,
  FinancialAnalytics,
  EngagementAnalytics,
  DashboardMetrics,
  CustomReport,
  ScheduledReport,
  AnalyticsFilters,
  ReportExportOptions,
} from "@/types/analytics";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AnalyticsService {
  private baseUrl = "/admin/analytics";

  /**
   * Get dashboard metrics overview
   */
  async getDashboardMetrics(
    filters?: AnalyticsFilters
  ): Promise<{ metrics: DashboardMetrics }> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/dashboard/metrics?${queryString}`
      : `/admin/dashboard/metrics`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get system analytics overview
   */
  async getSystemAnalytics(
    filters?: AnalyticsFilters
  ): Promise<{ analytics: any }> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(
    filters?: AnalyticsFilters
  ): Promise<{ analytics: UserAnalytics }> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.groupBy) queryParams.append("groupBy", filters.groupBy);
    if (filters?.userRole) queryParams.append("userRole", filters.userRole);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/users?${queryString}`
      : `${this.baseUrl}/users`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(
    filters?: AnalyticsFilters
  ): Promise<{ analytics: EventAnalytics }> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.groupBy) queryParams.append("groupBy", filters.groupBy);
    if (filters?.eventType) queryParams.append("eventType", filters.eventType);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/events?${queryString}`
      : `${this.baseUrl}/events`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(
    filters?: AnalyticsFilters
  ): Promise<{ analytics: FinancialAnalytics }> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.groupBy) queryParams.append("groupBy", filters.groupBy);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/financial?${queryString}`
      : `${this.baseUrl}/financial`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get engagement analytics
   */
  async getEngagementAnalytics(
    filters?: AnalyticsFilters
  ): Promise<{ analytics: EngagementAnalytics }> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/engagement?${queryString}`
      : `${this.baseUrl}/engagement`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Export report
   */
  async exportReport(
    options: ReportExportOptions
  ): Promise<{ downloadUrl: string; message: string }> {
    const response = await api.post(`${this.baseUrl}/export`, options);
    return response.data;
  }

  /**
   * Get custom reports
   */
  async getCustomReports(): Promise<{ reports: CustomReport[] }> {
    const response = await api.get(`${this.baseUrl}/reports`);
    return response.data;
  }

  /**
   * Create custom report
   */
  async createCustomReport(
    report: Omit<CustomReport, "_id" | "createdBy" | "createdAt" | "lastRun">
  ): Promise<{ report: CustomReport; message: string }> {
    const response = await api.post(`${this.baseUrl}/reports`, report);
    return response.data;
  }

  /**
   * Run custom report
   */
  async runCustomReport(
    reportId: string
  ): Promise<{ data: any; message: string }> {
    const response = await api.post(`${this.baseUrl}/reports/${reportId}/run`);
    return response.data;
  }

  /**
   * Generate custom report (alternative endpoint)
   */
  async generateCustomReport(
    reportConfig: any
  ): Promise<{ report: any; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/custom-report`,
      reportConfig
    );
    return response.data;
  }

  /**
   * Delete custom report
   */
  async deleteCustomReport(reportId: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/reports/${reportId}`);
    return response.data;
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<{ reports: ScheduledReport[] }> {
    const response = await api.get(`${this.baseUrl}/scheduled-reports`);
    return response.data;
  }

  /**
   * Create scheduled report
   */
  async createScheduledReport(
    report: Omit<ScheduledReport, "_id" | "createdAt" | "lastRun">
  ): Promise<{ report: ScheduledReport; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/scheduled-reports`,
      report
    );
    return response.data;
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(
    reportId: string,
    updates: Partial<ScheduledReport>
  ): Promise<{ report: ScheduledReport; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/scheduled-reports/${reportId}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(reportId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/scheduled-reports/${reportId}`
    );
    return response.data;
  }
}

export default new AnalyticsService();
