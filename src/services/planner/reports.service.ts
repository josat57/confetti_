import api from "@/api/api";

export interface MetricData {
  value: number;
  trend: number;
  previousValue: number;
  label: string;
}

export interface EventMetrics {
  totalEvents: number;
  completedEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  completionRate: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  averageEventBudget: number;
}

export interface VendorMetrics {
  totalVendors: number;
  averageRating: number;
  averageCost: number;
  reliabilityScore: number;
}

export interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  averageSatisfaction: number;
  repeatClientRate: number;
}

export interface DashboardReport {
  eventMetrics: EventMetrics;
  financialMetrics: FinancialMetrics;
  vendorMetrics: VendorMetrics;
  clientMetrics: ClientMetrics;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  clientId?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

const reportsService = {
  getDashboardReport: async (
    filters?: ReportFilters
  ): Promise<DashboardReport> => {
    try {
      console.log("📡 Making API request to: /planner/reports/dashboard");
      console.log("📋 Request params:", filters);
      const response = await api.get("/planner/reports/dashboard", {
        params: filters,
      });
      console.log("✅ API response received:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ API request failed:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Return mock data if API fails
      console.log("⚠️ Returning mock data with zero values");
      return {
        eventMetrics: {
          totalEvents: 0,
          completedEvents: 0,
          activeEvents: 0,
          upcomingEvents: 0,
          completionRate: 0,
        },
        financialMetrics: {
          totalRevenue: 0,
          totalExpenses: 0,
          profit: 0,
          profitMargin: 0,
          averageEventBudget: 0,
        },
        vendorMetrics: {
          totalVendors: 0,
          averageRating: 0,
          averageCost: 0,
          reliabilityScore: 0,
        },
        clientMetrics: {
          totalClients: 0,
          activeClients: 0,
          averageSatisfaction: 0,
          repeatClientRate: 0,
        },
      };
    }
  },

  getEventReport: async (eventId: string): Promise<any> => {
    const response = await api.get(`/planner/reports/events/${eventId}`);
    return response.data;
  },

  getFinancialReport: async (filters?: ReportFilters): Promise<any> => {
    const response = await api.get("/planner/reports/financial", {
      params: filters,
    });
    return response.data;
  },

  getVendorReport: async (filters?: ReportFilters): Promise<any> => {
    const response = await api.get("/planner/reports/vendors", {
      params: filters,
    });
    return response.data;
  },

  exportReport: async (
    reportType: string,
    format: "pdf" | "excel",
    filters?: ReportFilters
  ): Promise<Blob> => {
    const response = await api.post(
      "/planner/reports/export",
      { reportType, format, filters },
      { responseType: "blob" }
    );
    return response.data;
  },
};

export default reportsService;
