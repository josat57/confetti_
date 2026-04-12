import axios from "axios";
import {
  Transaction,
  TransactionDetails,
  PaymentAnalytics,
  ReconciliationReport,
  TransactionFilters,
  ExportOptions,
} from "@/types/transaction-admin";

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

class TransactionsService {
  private baseUrl = "/admin/transactions";

  /**
   * Get all transactions with filtering
   */
  async getTransactions(
    filters?: TransactionFilters & { page?: number; limit?: number }
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.type) queryParams.append("type", filters.type);
    if (filters?.gateway) queryParams.append("gateway", filters.gateway);
    if (filters?.userId) queryParams.append("userId", filters.userId);
    if (filters?.transactionId)
      queryParams.append("transactionId", filters.transactionId);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.minAmount)
      queryParams.append("minAmount", filters.minAmount.toString());
    if (filters?.maxAmount)
      queryParams.append("maxAmount", filters.maxAmount.toString());
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionById(
    transactionId: string
  ): Promise<{ transaction: TransactionDetails }> {
    const response = await api.get(`${this.baseUrl}/${transactionId}`);
    return response.data;
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<{ transaction: Transaction; refund: any; message: string }> {
    const response = await api.post(`${this.baseUrl}/${transactionId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  }

  /**
   * Mark transaction as disputed
   */
  async markAsDisputed(
    transactionId: string,
    reason: string
  ): Promise<{ transaction: Transaction; dispute: any; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${transactionId}/dispute`,
      {
        reason,
      }
    );
    return response.data;
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    transactionId: string,
    resolution: string,
    refundAmount?: number
  ): Promise<{ transaction: Transaction; message: string }> {
    const response = await api.post(
      `${this.baseUrl}/${transactionId}/resolve-dispute`,
      {
        resolution,
        refundAmount,
      }
    );
    return response.data;
  }

  /**
   * Retry a failed transaction
   */
  async retryTransaction(
    transactionId: string
  ): Promise<{ transaction: Transaction; message: string }> {
    const response = await api.post(`${this.baseUrl}/${transactionId}/retry`);
    return response.data;
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    gateway?: string;
  }): Promise<{ analytics: PaymentAnalytics }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.gateway) queryParams.append("gateway", params.gateway);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/analytics?${queryString}`
      : `${this.baseUrl}/analytics`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Export transactions
   */
  async exportTransactions(
    options: ExportOptions
  ): Promise<{ downloadUrl: string; message: string }> {
    const response = await api.post(`${this.baseUrl}/export`, options);
    return response.data;
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(params: {
    gateway: string;
    startDate: string;
    endDate: string;
  }): Promise<{ report: ReconciliationReport; message: string }> {
    const response = await api.post(`${this.baseUrl}/reconciliation`, params);
    return response.data;
  }

  /**
   * Get reconciliation reports
   */
  async getReconciliationReports(params?: {
    gateway?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    reports: ReconciliationReport[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.gateway) queryParams.append("gateway", params.gateway);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/reconciliation?${queryString}`
      : `${this.baseUrl}/reconciliation`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get failed transactions
   */
  async getFailedTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append("status", "failed");
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get(`${this.baseUrl}?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get disputed transactions
   */
  async getDisputedTransactions(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await api.get(`${this.baseUrl}/disputed`, { params });
    return response.data;
  }

  /**
   * Get transaction trends
   */
  async getTransactionTrends(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<{ trends: any }> {
    const response = await api.get(`${this.baseUrl}/trends`, { params });
    return response.data;
  }
}

export default new TransactionsService();
