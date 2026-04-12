import api from "@/api/api";
import {
  Client,
  CreateClientInput,
  UpdateClientInput,
  PaginatedClients,
  ClientNote,
  ClientFeedback,
} from "@/types/planner";

export interface ClientFilters {
  search?: string;
  status?: "Active" | "Inactive";
  page?: number;
  limit?: number;
}

class ClientsService {
  private baseUrl = "/planner/clients";

  /**
   * Get all clients with optional filters
   */
  async getClients(filters?: ClientFilters): Promise<PaginatedClients> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get a single client by ID
   */
  async getClientById(
    clientId: string
  ): Promise<{ client: Client; events: any[] }> {
    const response = await api.get(`${this.baseUrl}/${clientId}`);
    return response.data;
  }

  /**
   * Create a new client
   */
  async createClient(data: CreateClientInput): Promise<{ client: Client }> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update an existing client
   */
  async updateClient(
    clientId: string,
    data: UpdateClientInput
  ): Promise<{ client: Client }> {
    const response = await api.put(`${this.baseUrl}/${clientId}`, data);
    return response.data;
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`${this.baseUrl}/${clientId}`);
    return response.data;
  }

  /**
   * Add a note to a client
   */
  async addNote(
    clientId: string,
    content: string
  ): Promise<{ note: ClientNote }> {
    const response = await api.post(`${this.baseUrl}/${clientId}/notes`, {
      content,
    });
    return response.data;
  }

  /**
   * Add feedback for a client
   */
  async addFeedback(
    clientId: string,
    data: { eventId: string; rating: number; comment: string }
  ): Promise<{ feedback: ClientFeedback }> {
    const response = await api.post(
      `${this.baseUrl}/${clientId}/feedback`,
      data
    );
    return response.data;
  }

  /**
   * Get client's events
   */
  async getClientEvents(clientId: string): Promise<{ events: any[] }> {
    const response = await api.get(`${this.baseUrl}/${clientId}/events`);
    return response.data;
  }
}

export const clientsService = new ClientsService();
