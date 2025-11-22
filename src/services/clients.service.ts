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
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags: string[];
  totalSpent: number;
  eventsCount: number;
  lastContact: Date;
  nextFollowUp?: Date;
  notes: Array<{
    _id: string;
    text: string;
    createdBy: string;
    createdAt: Date;
  }>;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
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
   */
  async getClients(params?: {
    tag?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ clients: Client[]; total: number }> {
    const response = await api.get("/clients", { params });
    return response.data.data || { clients: [], total: 0 };
  },

  /**
   * Get a single client by ID
   */
  async getClientById(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data.data.client;
  },

  /**
   * Create a new client
   */
  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post("/clients", data);
    return response.data.data.client;
  },

  /**
   * Update client
   */
  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.patch(`/clients/${id}`, data);
    return response.data.data.client;
  },

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  /**
   * Add note to client
   */
  async addNote(id: string, note: string): Promise<Client> {
    const response = await api.post(`/clients/${id}/notes`, { note });
    return response.data.data.client;
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
    const response = await api.get("/clients/stats");
    return response.data.data;
  },
};

export default clientsService;
