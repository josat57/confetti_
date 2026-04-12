import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export interface Client {
  _id: string;
  id?: string; // Frontend convenience field
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags?: string[]; // Optional - may not be in backend response
  totalSpent?: number; // Optional - may not be in backend response
  eventsCount?: number; // Optional - may not be in backend response
  lastContact?: Date;
  nextFollowUp?: Date;
  status?: string;
  planner?: string;
  notes?: Array<{
    _id?: string;
    id?: string;
    content?: string;
    text?: string;
    createdBy?: string;
    createdAt: Date | string;
  }>;
  feedback?: any[];
  preferences?: {
    budgetRange?: {
      currency?: string;
    };
    communicationMethod?: string;
    eventTypes?: string[];
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  nextFollowUp?: Date;
}

export const clientsService = {
  /**
   * Get all clients
   * Note: This is used by vendor dashboard, uses /vendors/clients endpoint
   */
  async getClients(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ clients: Client[]; total: number }> {
    const response = await api.get("/vendors/clients", { params });
    return response.data.data || { clients: [], total: 0 };
  },

  /**
   * Get a single client by ID
   */
  async getClientById(id: string): Promise<Client> {
    const response = await api.get(`/vendors/clients/${id}`);
    return response.data.data.client;
  },

  /**
   * Create a new client
   */
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post("/vendors/clients", data);
    return response.data.data.client;
  },

  /**
   * Update client
   */
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.patch(`/vendors/clients/${id}`, data);
    return response.data.data.client;
  },

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/vendors/clients/${id}`);
  },

  /**
   * Add note to client
   * Note: Backend returns notes array, not full client object
   */
  async addNote(id: string, note: string): Promise<any> {
    const response = await api.post(`/vendors/clients/${id}/notes`, {
      text: note,
    });
    return response.data.data; // Returns { notes: [...] }
  },

  /**
   * Delete note from client
   */
  async deleteNote(clientId: string, noteId: string): Promise<Client> {
    const response = await api.delete(
      `/vendors/clients/${clientId}/notes/${noteId}`
    );
    return response.data.data.client;
  },

  /**
   * Add tag to client
   * Note: Backend expects full tags array, so we need to get current tags first
   */
  async addTag(id: string, tag: string): Promise<Client> {
    // Get current client to retrieve existing tags
    const client = await this.getClientById(id);
    const currentTags = client.tags || [];

    // Add new tag if it doesn't exist
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
    }

    // Update with full tags array
    const response = await api.put(`/vendors/clients/${id}/tags`, {
      tags: currentTags,
    });
    return response.data.data?.client || response.data.client;
  },

  /**
   * Remove tag from client
   * Note: Backend expects full tags array, so we need to get current tags first
   */
  async removeTag(id: string, tag: string): Promise<Client> {
    // Get current client to retrieve existing tags
    const client = await this.getClientById(id);
    const currentTags = client.tags || [];

    // Remove the tag
    const updatedTags = currentTags.filter((t) => t !== tag);

    // Update with full tags array
    const response = await api.put(`/vendors/clients/${id}/tags`, {
      tags: updatedTags,
    });
    return response.data.data?.client || response.data.client;
  },

  /**
   * Set follow-up date
   */
  async setFollowUp(id: string, date: string): Promise<Client> {
    const response = await api.patch(`/vendors/clients/${id}/follow-up`, {
      nextFollowUp: date,
    });
    return response.data.data.client;
  },

  /**
   * Clear follow-up date
   */
  async clearFollowUp(id: string): Promise<Client> {
    const response = await api.delete(`/vendors/clients/${id}/follow-up`);
    return response.data.data.client;
  },

  /**
   * Get client bookings
   */
  async getClientBookings(id: string): Promise<any[]> {
    const response = await api.get(`/vendors/clients/${id}/bookings`);
    return response.data.data.bookings || [];
  },

  /**
   * Get client invoices
   */
  async getClientInvoices(id: string): Promise<any[]> {
    const response = await api.get(`/vendors/clients/${id}/invoices`);
    return response.data.data.invoices || [];
  },

  /**
   * Get client quotes
   */
  async getClientQuotes(id: string): Promise<any[]> {
    const response = await api.get(`/vendors/clients/${id}/quotes`);
    return response.data.data.quotes || [];
  },

  /**
   * Get client events
   */
  async getClientEvents(id: string): Promise<any[]> {
    const response = await api.get(`/vendors/clients/${id}/events`);
    return response.data.data.events || [];
  },

  /**
   * Get client statistics
   */
  async getClientStats(): Promise<{
    totalClients: number;
    totalRevenue: number;
    avgSpent: number;
    upcomingFollowUps: number;
  }> {
    const response = await api.get("/vendors/clients/stats");
    return response.data.data;
  },

  /**
   * Search clients
   */
  async searchClients(query: string): Promise<Client[]> {
    const response = await api.get("/vendors/clients/search", {
      params: { q: query },
    });
    return response.data.data.clients || [];
  },

  /**
   * Get clients with upcoming follow-ups
   */
  async getUpcomingFollowUps(): Promise<Client[]> {
    const response = await api.get("/vendors/clients/follow-ups");
    return response.data.data.clients || [];
  },

  /**
   * Export clients
   */
  async exportClients(format: "csv" | "pdf"): Promise<Blob> {
    const response = await api.get("/vendors/clients/export", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};

export default clientsService;
