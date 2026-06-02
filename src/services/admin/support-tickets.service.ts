import axios from "axios";
import {
  SupportTicket,
  TicketMessage,
  CannedResponse,
  TicketAnalytics,
  TicketFilters,
  TicketPriority,
  TicketStatus,
} from "@/types/support-ticket";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Use cookies for authentication
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

class SupportTicketsService {
  private baseUrl = "/admin/tickets";

  /**
   * Get all support tickets with filtering
   */
  async getTickets(
    filters?: TicketFilters & { page?: number; limit?: number }
  ): Promise<{
    tickets: SupportTicket[];
    total: number;
    page: number;
    pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.priority) queryParams.append("priority", filters.priority);
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.assignedTo)
      queryParams.append("assignedTo", filters.assignedTo);
    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get ticket details by ID
   */
  async getTicketById(ticketId: string): Promise<{ ticket: SupportTicket }> {
    const response = await api.get(`${this.baseUrl}/${ticketId}`);
    return response.data;
  }

  /**
   * Assign ticket to admin
   */
  async assignTicket(
    ticketId: string,
    adminId: string
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/assign`, {
      adminId,
    });
    return response.data;
  }

  /**
   * Respond to ticket
   */
  async respondToTicket(
    ticketId: string,
    message: string,
    isInternal: boolean = false
  ): Promise<{ ticket: SupportTicket; message: TicketMessage }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/respond`, {
      message,
      isInternal,
    });
    return response.data;
  }

  /**
   * Close ticket with resolution
   */
  async closeTicket(
    ticketId: string,
    resolution: string
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/close`, {
      resolution,
    });
    return response.data;
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(
    ticketId: string,
    reason: string,
    newPriority: TicketPriority
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/escalate`, {
      reason,
      newPriority,
    });
    return response.data;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.patch(`${this.baseUrl}/${ticketId}/status`, {
      status,
    });
    return response.data;
  }

  /**
   * Update ticket priority
   */
  async updateTicketPriority(
    ticketId: string,
    priority: TicketPriority
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.patch(`${this.baseUrl}/${ticketId}/priority`, {
      priority,
    });
    return response.data;
  }

  /**
   * Add tags to ticket
   */
  async addTags(
    ticketId: string,
    tags: string[]
  ): Promise<{ ticket: SupportTicket; message: string }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/tags`, {
      tags,
    });
    return response.data;
  }

  /**
   * Get canned responses
   */
  async getCannedResponses(params?: {
    category?: string;
    search?: string;
  }): Promise<{ responses: CannedResponse[] }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.baseUrl}/canned-responses?${queryString}`
      : `${this.baseUrl}/canned-responses`;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Create canned response
   */
  async createCannedResponse(
    data: Omit<
      CannedResponse,
      "_id" | "usageCount" | "createdBy" | "createdAt" | "updatedAt"
    >
  ): Promise<{ response: CannedResponse; message: string }> {
    const response = await api.post(`${this.baseUrl}/canned-responses`, data);
    return response.data;
  }

  /**
   * Update canned response
   */
  async updateCannedResponse(
    responseId: string,
    data: Partial<CannedResponse>
  ): Promise<{ response: CannedResponse; message: string }> {
    const response = await api.put(
      `${this.baseUrl}/canned-responses/${responseId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete canned response
   */
  async deleteCannedResponse(responseId: string): Promise<{ message: string }> {
    const response = await api.delete(
      `${this.baseUrl}/canned-responses/${responseId}`
    );
    return response.data;
  }

  /**
   * Get ticket statistics
   */
  async getTicketStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ statistics: TicketAnalytics }> {
    const response = await api.get(`${this.baseUrl}/statistics`, { params });
    return response.data;
  }

  /**
   * Get ticket analytics (alias for backward compatibility)
   */
  async getTicketAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ analytics: TicketAnalytics }> {
    const result = await this.getTicketStatistics(params);
    return { analytics: result.statistics };
  }

  /**
   * Export tickets
   */
  async exportTickets(
    filters?: TicketFilters
  ): Promise<{ downloadUrl: string }> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Add internal note to ticket
   */
  async addNote(ticketId: string, note: string): Promise<{ message: string }> {
    const response = await api.post(`${this.baseUrl}/${ticketId}/notes`, {
      note,
    });
    return response.data;
  }

  /**
   * Get my assigned tickets
   */
  async getMyTickets(): Promise<{ tickets: SupportTicket[] }> {
    const response = await api.get(`${this.baseUrl}/my-tickets`);
    return response.data;
  }

  /**
   * Bulk assign tickets
   */
  async bulkAssign(
    ticketIds: string[],
    adminId: string
  ): Promise<{ assigned: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk/assign`, {
      ticketIds,
      adminId,
    });
    return response.data;
  }

  /**
   * Bulk close tickets
   */
  async bulkClose(
    ticketIds: string[],
    resolution: string
  ): Promise<{ closed: number; message: string }> {
    const response = await api.post(`${this.baseUrl}/bulk/close`, {
      ticketIds,
      resolution,
    });
    return response.data;
  }
}

export default new SupportTicketsService();
