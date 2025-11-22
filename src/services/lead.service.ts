/**
 * Lead Service
 * Handles all lead management related API calls
 */

import api from "@/api/api";
import type {
  Lead,
  LeadCreate,
  LeadFilters,
  LeadsResponse,
  LeadStats,
  LeadStatus,
  Note,
} from "@/types/lead.types";

export const leadService = {
  /**
   * Get all leads with optional filters
   */
  async getAll(params?: LeadFilters): Promise<LeadsResponse> {
    const response = await api.get("/vendors/leads", {
      params,
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Create a new lead
   */
  async create(data: LeadCreate): Promise<Lead> {
    const response = await api.post("/vendors/leads", data, {
      withCredentials: true,
    });
    return response.data.data.lead;
  },

  /**
   * Get a single lead by ID
   */
  async getById(id: string): Promise<Lead> {
    const response = await api.get(`/vendors/leads/${id}`, {
      withCredentials: true,
    });
    return response.data.data.lead;
  },

  /**
   * Update a lead
   */
  async update(id: string, data: Partial<LeadCreate>): Promise<Lead> {
    const response = await api.put(`/vendors/leads/${id}`, data, {
      withCredentials: true,
    });
    return response.data.data.lead;
  },

  /**
   * Update lead status
   */
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const response = await api.put(
      `/vendors/leads/${id}/status`,
      { status },
      {
        withCredentials: true,
      }
    );
    return response.data.data.lead;
  },

  /**
   * Add a note to a lead
   */
  async addNote(id: string, note: string): Promise<Note> {
    const response = await api.post(
      `/vendors/leads/${id}/notes`,
      { note },
      {
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  /**
   * Send a quote to a lead
   */
  async sendQuote(id: string, quoteId: string): Promise<void> {
    await api.post(
      `/vendors/leads/${id}/quote`,
      { quoteId },
      {
        withCredentials: true,
      }
    );
  },

  /**
   * Get lead statistics
   */
  async getStats(): Promise<LeadStats> {
    const response = await api.get("/vendors/leads/stats", {
      withCredentials: true,
    });
    return response.data.data;
  },

  /**
   * Get leads needing follow-up
   */
  async getFollowUp(): Promise<Lead[]> {
    const response = await api.get("/vendors/leads/followup", {
      withCredentials: true,
    });
    return response.data.data.leads;
  },

  /**
   * Delete a lead
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/vendors/leads/${id}`, {
      withCredentials: true,
    });
  },

  /**
   * Assign lead to team member
   */
  async assign(id: string, assignedTo: string): Promise<Lead> {
    const response = await api.put(
      `/vendors/leads/${id}/assign`,
      { assignedTo },
      {
        withCredentials: true,
      }
    );
    return response.data.data.lead;
  },

  /**
   * Set follow-up date for a lead
   */
  async setFollowUp(id: string, followUpDate: string): Promise<Lead> {
    const response = await api.put(
      `/vendors/leads/${id}/followup`,
      { followUpDate },
      {
        withCredentials: true,
      }
    );
    return response.data.data.lead;
  },

  /**
   * Mark lead as won
   */
  async markAsWon(id: string, dealValue?: number): Promise<Lead> {
    const response = await api.post(
      `/vendors/leads/${id}/won`,
      { dealValue },
      {
        withCredentials: true,
      }
    );
    return response.data.data.lead;
  },

  /**
   * Mark lead as lost
   */
  async markAsLost(id: string, reason?: string): Promise<Lead> {
    const response = await api.post(
      `/vendors/leads/${id}/lost`,
      { reason },
      {
        withCredentials: true,
      }
    );
    return response.data.data.lead;
  },
};

export default leadService;
