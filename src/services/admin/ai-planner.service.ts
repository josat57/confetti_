/**
 * Admin AI Event Planner Service
 * Enhanced AI planner service with admin-level functionality
 */

import axios from "axios";
import aiPlannerService, {
  EventPlanningRequest,
  AIEventPlan,
  PlanningSession,
} from "@/services/ai-planner.service";

// Admin-specific interfaces
export interface AdminAIInsights {
  totalPlansGenerated: number;
  averagePlanningTime: number; // in minutes
  mostPopularEventTypes: {
    eventType: string;
    count: number;
    percentage: number;
  }[];
  budgetTrends: {
    eventType: string;
    averageBudget: number;
    trend: "up" | "down" | "stable";
    changePercentage: number;
  }[];
  clientSatisfactionScore: number;
  timesSaved: number; // in hours
  revenueGenerated: number;
  conversionRate: number; // plans to bookings
  topPerformingPlanners: {
    plannerId: string;
    plannerName: string;
    plansGenerated: number;
    averageRating: number;
  }[];
  monthlyStats: {
    month: string;
    plansGenerated: number;
    revenue: number;
    satisfaction: number;
  }[];
  geographicDistribution: {
    location: string;
    count: number;
    percentage: number;
  }[];
  seasonalTrends: {
    season: string;
    popularEventTypes: string[];
    averageBudget: number;
    bookingRate: number;
  }[];
}

export interface AdminEventPlan extends AIEventPlan {
  // Admin-specific fields
  plannerId?: string;
  plannerName?: string;
  clientFeedback?: {
    rating: number;
    comments: string;
    date: string;
  };
  bookingStatus: "draft" | "sent" | "approved" | "rejected" | "booked";
  revenueGenerated?: number;
  profitMargin?: number;
  executionNotes?: string;
  performanceMetrics?: {
    clientSatisfaction: number;
    budgetAccuracy: number;
    timelineAccuracy: number;
    vendorPerformance: number;
  };
  tags?: string[];
  priority: "low" | "medium" | "high" | "urgent";
  lastModified: string;
  version: number;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  eventType: string;
  baseStructure: Partial<AIEventPlan>;
  customFields: {
    field: string;
    type: "text" | "number" | "select" | "checkbox";
    options?: string[];
    required: boolean;
  }[];
  createdBy: string;
  createdAt: string;
  usageCount: number;
  rating: number;
}

export interface AIConfiguration {
  id: string;
  name: string;
  description: string;
  parameters: {
    creativity: number; // 0-100
    budgetOptimization: number; // 0-100
    riskTolerance: number; // 0-100
    sustainabilityFocus: number; // 0-100
    localPreference: number; // 0-100
  };
  eventTypeSpecific: {
    [eventType: string]: {
      defaultBudgetDistribution: {
        [category: string]: number;
      };
      requiredVendorTypes: string[];
      timelineTemplates: {
        duration: number;
        activities: string[];
      }[];
    };
  };
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Admin AI Planner API Error:",
      error.response?.data?.message || error.message
    );
    return Promise.reject(error);
  }
);

class AdminAIPlannerService {
  private baseUrl = "/admin/ai-planner";

  // Enhanced AI Insights for Admin
  async getAdminAIInsights(): Promise<AdminAIInsights> {
    try {
      const response = await api.get(`${this.baseUrl}/insights`);
      return response.data.data;
    } catch (error) {
      // Return mock data for development
      return {
        totalPlansGenerated: 1247,
        averagePlanningTime: 12,
        mostPopularEventTypes: [
          { eventType: "wedding", count: 456, percentage: 36.6 },
          { eventType: "corporate", count: 298, percentage: 23.9 },
          { eventType: "birthday", count: 187, percentage: 15.0 },
          { eventType: "conference", count: 156, percentage: 12.5 },
          { eventType: "graduation", count: 150, percentage: 12.0 },
        ],
        budgetTrends: [
          {
            eventType: "wedding",
            averageBudget: 2500000,
            trend: "up",
            changePercentage: 15.2,
          },
          {
            eventType: "corporate",
            averageBudget: 1800000,
            trend: "stable",
            changePercentage: 2.1,
          },
          {
            eventType: "birthday",
            averageBudget: 850000,
            trend: "up",
            changePercentage: 8.7,
          },
        ],
        clientSatisfactionScore: 94.2,
        timesSaved: 3741,
        revenueGenerated: 45600000,
        conversionRate: 78.5,
        topPerformingPlanners: [
          {
            plannerId: "planner_001",
            plannerName: "Sarah Johnson",
            plansGenerated: 89,
            averageRating: 4.8,
          },
          {
            plannerId: "planner_002",
            plannerName: "Michael Chen",
            plansGenerated: 76,
            averageRating: 4.7,
          },
        ],
        monthlyStats: [
          {
            month: "Jan 2024",
            plansGenerated: 98,
            revenue: 3200000,
            satisfaction: 93.1,
          },
          {
            month: "Feb 2024",
            plansGenerated: 112,
            revenue: 3800000,
            satisfaction: 94.5,
          },
          {
            month: "Mar 2024",
            plansGenerated: 134,
            revenue: 4200000,
            satisfaction: 95.2,
          },
        ],
        geographicDistribution: [
          { location: "Lagos", count: 487, percentage: 39.1 },
          { location: "Abuja", count: 298, percentage: 23.9 },
          { location: "Port Harcourt", count: 156, percentage: 12.5 },
        ],
        seasonalTrends: [
          {
            season: "Spring",
            popularEventTypes: ["wedding", "graduation"],
            averageBudget: 1800000,
            bookingRate: 82.3,
          },
          {
            season: "Summer",
            popularEventTypes: ["corporate", "conference"],
            averageBudget: 1600000,
            bookingRate: 75.8,
          },
        ],
      };
    }
  }

  // Get all plans with admin filters
  async getAdminEventPlans(params?: {
    status?: string;
    eventType?: string;
    plannerId?: string;
    dateFrom?: string;
    dateTo?: string;
    budgetMin?: number;
    budgetMax?: number;
    priority?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ plans: AdminEventPlan[]; total: number; totalPages: number }> {
    try {
      const response = await api.get(`${this.baseUrl}/plans`, { params });
      return response.data.data;
    } catch (error) {
      // Return mock data for development
      return {
        plans: [],
        total: 0,
        totalPages: 0,
      };
    }
  }

  // Create enhanced plan with admin features
  async createAdminEventPlan(
    request: EventPlanningRequest & {
      plannerId?: string;
      priority?: "low" | "medium" | "high" | "urgent";
      tags?: string[];
      templateId?: string;
      configurationId?: string;
    }
  ): Promise<AdminEventPlan> {
    try {
      const response = await api.post(`${this.baseUrl}/plans`, request);
      return response.data.data;
    } catch (error) {
      // Fallback to regular AI planner service
      const plan = await aiPlannerService.createEventPlan(request);
      return {
        ...plan,
        bookingStatus: "draft",
        priority: request.priority || "medium",
        tags: request.tags || [],
        lastModified: new Date().toISOString(),
        version: 1,
      };
    }
  }

  // Update plan with admin features
  async updateAdminEventPlan(
    planId: string,
    updates: Partial<AdminEventPlan>
  ): Promise<AdminEventPlan> {
    try {
      const response = await api.put(
        `${this.baseUrl}/plans/${planId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to update plan");
    }
  }

  // Delete plan (admin only)
  async deleteEventPlan(planId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/plans/${planId}`);
    } catch (error) {
      throw new Error("Failed to delete plan");
    }
  }

  // Bulk operations
  async bulkUpdatePlans(
    planIds: string[],
    updates: Partial<AdminEventPlan>
  ): Promise<{ updated: number; failed: number }> {
    try {
      const response = await api.put(`${this.baseUrl}/plans/bulk`, {
        planIds,
        updates,
      });
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to bulk update plans");
    }
  }

  async bulkDeletePlans(
    planIds: string[]
  ): Promise<{ deleted: number; failed: number }> {
    try {
      const response = await api.delete(`${this.baseUrl}/plans/bulk`, {
        data: { planIds },
      });
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to bulk delete plans");
    }
  }

  // Plan Templates Management
  async getPlanTemplates(): Promise<PlanTemplate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`);
      return response.data.data;
    } catch (error) {
      // Return mock templates
      return [
        {
          id: "template_001",
          name: "Elegant Wedding Template",
          description: "Perfect for traditional and elegant weddings",
          eventType: "wedding",
          baseStructure: {
            timeline: [
              { time: "14:00", activity: "Guest Arrival", duration: 1 },
              { time: "15:00", activity: "Ceremony", duration: 1 },
              { time: "16:00", activity: "Cocktail Hour", duration: 1 },
              { time: "17:00", activity: "Reception", duration: 4 },
            ],
          },
          customFields: [
            {
              field: "ceremony_style",
              type: "select",
              options: ["Traditional", "Modern", "Religious"],
              required: true,
            },
            { field: "flower_preferences", type: "text", required: false },
          ],
          createdBy: "admin",
          createdAt: "2024-01-15T10:00:00Z",
          usageCount: 45,
          rating: 4.8,
        },
        {
          id: "template_002",
          name: "Corporate Event Template",
          description: "Professional template for corporate events",
          eventType: "corporate",
          baseStructure: {
            timeline: [
              { time: "09:00", activity: "Registration", duration: 1 },
              { time: "10:00", activity: "Opening Keynote", duration: 1 },
              { time: "11:00", activity: "Networking Break", duration: 0.5 },
              { time: "11:30", activity: "Panel Discussion", duration: 1.5 },
            ],
          },
          customFields: [
            {
              field: "industry_focus",
              type: "select",
              options: ["Tech", "Finance", "Healthcare", "Education"],
              required: true,
            },
            {
              field: "av_requirements",
              type: "checkbox",
              options: ["Microphones", "Projectors", "Live Streaming"],
              required: false,
            },
          ],
          createdBy: "admin",
          createdAt: "2024-01-20T14:30:00Z",
          usageCount: 32,
          rating: 4.6,
        },
      ];
    }
  }

  async createPlanTemplate(
    template: Omit<PlanTemplate, "id" | "createdAt" | "usageCount" | "rating">
  ): Promise<PlanTemplate> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, template);
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to create template");
    }
  }

  async updatePlanTemplate(
    templateId: string,
    updates: Partial<PlanTemplate>
  ): Promise<PlanTemplate> {
    try {
      const response = await api.put(
        `${this.baseUrl}/templates/${templateId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to update template");
    }
  }

  async deletePlanTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/templates/${templateId}`);
    } catch (error) {
      throw new Error("Failed to delete template");
    }
  }

  // AI Configuration Management
  async getAIConfigurations(): Promise<AIConfiguration[]> {
    try {
      const response = await api.get(`${this.baseUrl}/configurations`);
      return response.data.data;
    } catch (error) {
      // Return mock configurations
      return [
        {
          id: "config_001",
          name: "Balanced Planning",
          description: "Balanced approach for most event types",
          parameters: {
            creativity: 70,
            budgetOptimization: 80,
            riskTolerance: 60,
            sustainabilityFocus: 65,
            localPreference: 75,
          },
          eventTypeSpecific: {
            wedding: {
              defaultBudgetDistribution: {
                venue: 40,
                catering: 25,
                decoration: 15,
                entertainment: 10,
                photography: 10,
              },
              requiredVendorTypes: [
                "venue",
                "catering",
                "photographer",
                "florist",
              ],
              timelineTemplates: [
                {
                  duration: 6,
                  activities: [
                    "Guest Arrival",
                    "Ceremony",
                    "Cocktail Hour",
                    "Reception",
                    "Dancing",
                  ],
                },
              ],
            },
          },
          isDefault: true,
          createdBy: "system",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];
    }
  }

  async createAIConfiguration(
    config: Omit<AIConfiguration, "id" | "createdAt">
  ): Promise<AIConfiguration> {
    try {
      const response = await api.post(`${this.baseUrl}/configurations`, config);
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to create AI configuration");
    }
  }

  async updateAIConfiguration(
    configId: string,
    updates: Partial<AIConfiguration>
  ): Promise<AIConfiguration> {
    try {
      const response = await api.put(
        `${this.baseUrl}/configurations/${configId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to update AI configuration");
    }
  }

  async deleteAIConfiguration(configId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/configurations/${configId}`);
    } catch (error) {
      throw new Error("Failed to delete AI configuration");
    }
  }

  // Advanced Analytics
  async getPerformanceAnalytics(params: {
    dateFrom: string;
    dateTo: string;
    groupBy?: "day" | "week" | "month";
    eventType?: string;
    plannerId?: string;
  }): Promise<{
    planGeneration: { date: string; count: number; revenue: number }[];
    clientSatisfaction: { date: string; score: number }[];
    budgetAccuracy: { date: string; accuracy: number }[];
    conversionRates: { date: string; rate: number }[];
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/analytics/performance`, {
        params,
      });
      return response.data.data;
    } catch (error) {
      // Return mock analytics data
      return {
        planGeneration: [
          { date: "2024-01-01", count: 15, revenue: 450000 },
          { date: "2024-01-02", count: 18, revenue: 540000 },
          { date: "2024-01-03", count: 12, revenue: 360000 },
        ],
        clientSatisfaction: [
          { date: "2024-01-01", score: 94.2 },
          { date: "2024-01-02", score: 95.1 },
          { date: "2024-01-03", score: 93.8 },
        ],
        budgetAccuracy: [
          { date: "2024-01-01", accuracy: 87.5 },
          { date: "2024-01-02", accuracy: 89.2 },
          { date: "2024-01-03", accuracy: 86.8 },
        ],
        conversionRates: [
          { date: "2024-01-01", rate: 78.5 },
          { date: "2024-01-02", rate: 81.2 },
          { date: "2024-01-03", rate: 76.9 },
        ],
      };
    }
  }

  // Export and Reporting
  async exportPlans(params: {
    format: "csv" | "xlsx" | "pdf";
    filters?: any;
    includeAnalytics?: boolean;
  }): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to export plans");
    }
  }

  async generateReport(params: {
    type:
      | "performance"
      | "financial"
      | "client_satisfaction"
      | "vendor_analysis";
    dateFrom: string;
    dateTo: string;
    format: "pdf" | "html";
    includeCharts?: boolean;
  }): Promise<Blob> {
    try {
      const response = await api.post(
        `${this.baseUrl}/reports/generate`,
        params,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to generate report");
    }
  }

  // AI Training and Optimization
  async trainAIModel(params: {
    trainingData: {
      planId: string;
      feedback: {
        clientSatisfaction: number;
        budgetAccuracy: number;
        timelineAccuracy: number;
        vendorPerformance: number;
      };
    }[];
    modelType:
      | "budget_optimization"
      | "vendor_recommendation"
      | "timeline_generation";
  }): Promise<{ trainingId: string; status: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/ai/train`, params);
      return response.data.data;
    } catch (error) {
      throw new Error("Failed to start AI training");
    }
  }

  async getAIModelStatus(): Promise<{
    models: {
      type: string;
      version: string;
      accuracy: number;
      lastTrained: string;
      status: "active" | "training" | "deprecated";
    }[];
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/ai/models`);
      return response.data.data;
    } catch (error) {
      // Return mock model status
      return {
        models: [
          {
            type: "budget_optimization",
            version: "v2.1.0",
            accuracy: 94.2,
            lastTrained: "2024-01-15T10:30:00Z",
            status: "active",
          },
          {
            type: "vendor_recommendation",
            version: "v1.8.3",
            accuracy: 91.7,
            lastTrained: "2024-01-10T14:20:00Z",
            status: "active",
          },
          {
            type: "timeline_generation",
            version: "v1.5.2",
            accuracy: 88.9,
            lastTrained: "2024-01-08T09:15:00Z",
            status: "training",
          },
        ],
      };
    }
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical";
    metrics: {
      apiResponseTime: number;
      aiProcessingTime: number;
      errorRate: number;
      uptime: number;
    };
    issues: {
      severity: "low" | "medium" | "high";
      message: string;
      timestamp: string;
    }[];
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/system/health`);
      return response.data.data;
    } catch (error) {
      // Return mock health data
      return {
        status: "healthy",
        metrics: {
          apiResponseTime: 245,
          aiProcessingTime: 1850,
          errorRate: 0.8,
          uptime: 99.7,
        },
        issues: [],
      };
    }
  }
}

export default new AdminAIPlannerService();
