/**
 * Invoices Service
 * Handles all invoice management related API calls
 */

import api from "@/api/api";
import type {
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceFilters,
  InvoicesResponse,
  InvoiceStats,
  InvoicePaymentCreate,
  InvoiceTemplate,
} from "@/types/invoice.types";

export const invoicesService = {
  /**
   * Get all invoices with optional filters
   */
  async getAll(params?: InvoiceFilters): Promise<InvoicesResponse> {
    const response = await api.get("/vendors/invoices", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get a single invoice by ID
   */
  async getById(id: string): Promise<Invoice> {
    const response = await api.get(`/vendors/invoices/${id}`, {
      withCredentials: true,
    });
    return response.data.data.invoice;
  },

  /**
   * Create a new invoice
   */
  async create(data: InvoiceCreate): Promise<Invoice> {
    const response = await api.post("/vendors/invoices", data, {
      withCredentials: true,
    });
    return response.data.data.invoice;
  },

  /**
   * Update an invoice
   */
  async update(id: string, data: InvoiceUpdate): Promise<Invoice> {
    const response = await api.put(`/vendors/invoices/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data.invoice;
  },

  /**
   * Delete an invoice
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/invoices/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Send invoice to client
   */
  async send(id: string): Promise<Invoice> {
    const response = await api.post(
      `/vendors/invoices/${id}/send`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.invoice;
  },

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    id: string,
    paymentData?: InvoicePaymentCreate
  ): Promise<Invoice> {
    const response = await api.post(
      `/vendors/invoices/${id}/mark-paid`,
      paymentData || {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.invoice;
  },

  /**
   * Record a payment
   */
  async recordPayment(
    id: string,
    payment: InvoicePaymentCreate
  ): Promise<Invoice> {
    const response = await api.post(
      `/vendors/invoices/${id}/payments`,
      payment,
      {
        withCredentials: true,
      }
    );
    return response.data.data.invoice;
  },

  /**
   * Cancel an invoice
   */
  async cancel(id: string, reason?: string): Promise<Invoice> {
    const response = await api.post(
      `/vendors/invoices/${id}/cancel`,
      { reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.invoice;
  },

  /**
   * Duplicate an invoice
   */
  async duplicate(id: string): Promise<Invoice> {
    const response = await api.post(
      `/vendors/invoices/${id}/duplicate`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data.data.invoice;
  },

  /**
   * Download invoice as PDF
   */
  async downloadPDF(id: string): Promise<Blob> {
    const response = await api.get(`/vendors/invoices/${id}/pdf`, {
      responseType: "blob",
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Preview invoice
   */
  async preview(id: string): Promise<{ previewUrl: string }> {
    const response = await api.get(`/vendors/invoices/${id}/preview`, {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get invoice statistics
   */
  async getStats(): Promise<InvoiceStats> {
    const response = await api.get("/vendors/invoices/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get overdue invoices
   */
  async getOverdue(): Promise<Invoice[]> {
    const response = await api.get("/vendors/invoices/overdue", {
      withCredentials: true,
    });
    return response.data.data.invoices;
  },

  /**
   * Get recent invoices
   */
  async getRecent(limit?: number): Promise<Invoice[]> {
    const response = await api.get("/vendors/invoices/recent", {
      params: { limit },
      withCredentials: true,
    });
    return response.data.data.invoices;
  },

  /**
   * Send payment reminder
   */
  async sendReminder(id: string): Promise<void> {
    await api.post(
      `/vendors/invoices/${id}/reminder`,
      {},
      {
        withCredentials: true,
      }
    );
  },

  /**
   * Get invoice templates
   */
  async getTemplates(): Promise<InvoiceTemplate[]> {
    const response = await api.get("/vendors/invoices/templates", {
      withCredentials: true,
    });
    return response.data.data.templates;
  },

  /**
   * Save invoice template
   */
  async saveTemplate(data: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> {
    const response = await api.post("/vendors/invoices/templates", data, {
      withCredentials: true,
    });
    return response.data.data.template;
  },

  /**
   * Export invoices
   */
  async export(format: "csv" | "pdf", filters?: InvoiceFilters): Promise<Blob> {
    const response = await api.get("/vendors/invoices/export", {
      params: { format, ...filters },
      responseType: "blob",
      withCredentials: true,
    });
    return response.data;
  },

  /**
   * Get next invoice number
   */
  async getNextInvoiceNumber(): Promise<{ invoiceNumber: string }> {
    const response = await api.get("/vendors/invoices/next-number", {
      withCredentials: true,
    });
    return response.data.data;
  },
};

export default invoicesService;
