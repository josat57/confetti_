/**
 * Quote Service
 * Handles all quote management related API calls
 */

import api from "@/api/api";
import type {
  Quote,
  QuoteCreate,
  QuoteFilters,
  QuotesResponse,
  QuoteTemplate,
} from "@/types/quote.types";

export const quoteService = {
  /**
   * Get all quotes with optional filters
   */
  async getAll(params?: QuoteFilters): Promise<QuotesResponse> {
    const response = await api.get("/vendors/quotes", { params });
    return response.data.data;
  },

  /**
   * Create a new quote
   */
  async create(data: QuoteCreate): Promise<Quote> {
    const response = await api.post("/vendors/quotes", data);
    return response.data.data.quote;
  },

  /**
   * Get a single quote by ID
   */
  async getById(id: string): Promise<Quote> {
    const response = await api.get(`/vendors/quotes/${id}`);
    return response.data.data.quote;
  },

  /**
   * Update a quote
   */
  async update(id: string, data: Partial<QuoteCreate>): Promise<Quote> {
    const response = await api.put(`/vendors/quotes/${id}`, data);
    return response.data.data.quote;
  },

  /**
   * Send quote to client
   */
  async send(id: string): Promise<Quote> {
    const response = await api.post(`/vendors/quotes/${id}/send`);
    return response.data.data.quote;
  },

  /**
   * Duplicate a quote
   */
  async duplicate(id: string): Promise<Quote> {
    const response = await api.post(`/vendors/quotes/${id}/duplicate`);
    return response.data.data.quote;
  },

  /**
   * Get quote templates
   */
  async getTemplates(): Promise<QuoteTemplate[]> {
    const response = await api.get("/vendors/quotes/templates");
    return response.data.data.templates;
  },

  /**
   * Save a quote template
   */
  async saveTemplate(data: QuoteTemplate): Promise<QuoteTemplate> {
    const response = await api.post("/vendors/quotes/templates", data);
    return response.data.data.template;
  },

  /**
   * Delete a quote
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/quotes/${id}`);
  },

  /**
   * Accept a quote (customer action)
   */
  async accept(id: string): Promise<Quote> {
    const response = await api.post(`/vendors/quotes/${id}/accept`);
    return response.data.data.quote;
  },

  /**
   * Reject a quote (customer action)
   */
  async reject(id: string, reason?: string): Promise<Quote> {
    const response = await api.post(`/vendors/quotes/${id}/reject`, { reason });
    return response.data.data.quote;
  },
};

export default quoteService;
