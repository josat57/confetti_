import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface Payment {
  _id: string;
  invoiceNumber: string;
  vendor: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod?: "flutterwave" | "paystack" | "bank_transfer" | "cash";
  dueDate: Date;
  paidAt?: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  amount: number;
  currency?: string;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export const paymentsService = {
  /**
   * Get all payments for the current vendor
   */
  async getPayments(params?: {
    status?: "pending" | "paid" | "overdue" | "cancelled";
    page?: number;
    limit?: number;
  }): Promise<{ payments: Payment[]; total: number }> {
    const response = await api.get("/payments", { params });
    return response.data.data || { payments: [], total: 0 };
  },

  /**
   * Get a single payment by ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`);
    return response.data.data.payment;
  },

  /**
   * Create a new payment/invoice
   */
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await api.post("/payments", data);
    return response.data.data.payment;
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    status: "pending" | "paid" | "overdue" | "cancelled"
  ): Promise<Payment> {
    const response = await api.patch(`/payments/${id}/status`, { status });
    return response.data.data.payment;
  },

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(id: string): Promise<void> {
    await api.post(`/payments/${id}/remind`);
  },

  /**
   * Delete a payment
   */
  async deletePayment(id: string): Promise<void> {
    await api.delete(`/payments/${id}`);
  },

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalRevenue: number;
    pending: number;
    overdue: number;
    totalInvoices: number;
  }> {
    const response = await api.get("/payments/stats");
    return response.data.data;
  },
};

export default paymentsService;
