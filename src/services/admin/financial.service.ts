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

export interface Transaction {
  _id: string;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  reference: string;
  transactionId?: string;
  description?: string;
  subscriptionDetails?: {
    planType: string;
    planName: string;
    billingCycle: string;
    isUpgrade: boolean;
  };
  webhookReceived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
  }>;
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
  }>;
}

export interface FinancialReport {
  _id: string;
  reportType: string;
  period?: {
    start: string | Date;
    end: string | Date;
  };
  data?: any;
  generatedBy?: string;
  createdAt: string | Date;
}

class FinancialService {
  /**
   * Get all transactions
   */
  async getTransactions(params?: {
    status?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/transactions?${queryString}`
      : "/admin/transactions";

    const response = await api.get(url);
    return {
      transactions: response.data.data?.transactions || [],
      total: response.data.data?.pagination?.total || 0,
      page: response.data.data?.pagination?.page || 1,
      pages: response.data.data?.pagination?.pages || 1,
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<{
    transaction: Transaction;
  }> {
    const response = await api.get(`/admin/transactions/${transactionId}`);
    return {
      transaction: response.data.data?.transaction || response.data.transaction,
    };
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<{ stats: RevenueStats }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.groupBy) queryParams.append("groupBy", params.groupBy);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/revenue/reports?${queryString}`
      : "/admin/revenue/reports";

    const response = await api.get(url);
    const backendReports =
      response.data.data?.reports || response.data.reports || [];

    // Transform backend data to stats format
    const totalRevenue = backendReports.reduce(
      (sum: number, report: any) => sum + (report.revenue || 0),
      0
    );
    const totalCount = backendReports.reduce(
      (sum: number, report: any) => sum + (report.count || 0),
      0
    );

    return {
      stats: {
        totalRevenue,
        monthlyRevenue: totalRevenue,
        yearlyRevenue: totalRevenue,
        revenueByMonth: backendReports.map((report: any) => ({
          month: `${report._id.year}-${String(report._id.month).padStart(
            2,
            "0"
          )}`,
          revenue: report.revenue || 0,
        })),
        revenueByPaymentMethod: [],
        revenueByPlan: [],
      },
    };
  }

  /**
   * Get financial reports
   */
  async getFinancialReports(params?: {
    reportType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ reports: FinancialReport[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.reportType)
        queryParams.append("reportType", params.reportType);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/admin/financial-reports?${queryString}`
        : "/admin/financial-reports";

      const response = await api.get(url);
      return {
        reports: response.data.data?.reports || response.data.reports || [],
      };
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        console.warn("Financial reports endpoint not available");
        return { reports: [] };
      }
      throw error;
    }
  }

  /**
   * Generate financial report
   */
  async generateReport(reportData: {
    reportType: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    report: FinancialReport;
    message: string;
  }> {
    const response = await api.post("/admin/reports/generate", {
      ...reportData,
      resourceType: "financial-report",
    });
    return {
      report: response.data.data?.report || response.data.report,
      message: response.data.message || "Report generated successfully",
    };
  }

  /**
   * Export transactions
   */
  async exportTransactions(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    format?: "csv" | "excel";
  }): Promise<{ downloadUrl: string }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.format) queryParams.append("format", params.format);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/transactions/export?${queryString}`
      : "/admin/transactions/export";

    const response = await api.get(url);
    return {
      downloadUrl: response.data.data?.downloadUrl || response.data.downloadUrl,
    };
  }

  /**
   * Issue refund
   */
  async issueRefund(refundData: {
    transactionId: string;
    amount: number;
    reason: string;
  }): Promise<{ message: string }> {
    const response = await api.post("/admin/payments/refund", {
      ...refundData,
      resourceType: "refund",
    });
    return {
      message: response.data.message || "Refund issued successfully",
    };
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string): Promise<{ message: string }> {
    const response = await api.post(`/admin/payments/${paymentId}/retry`, {
      resourceType: "payment-retry",
    });
    return {
      message: response.data.message || "Payment retry initiated",
    };
  }
}

export default new FinancialService();
