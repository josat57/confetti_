import api from "@/api/api";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  isPriority: boolean;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  resolution: { content: string; resolvedAt: string } | null;
  satisfaction: { rating: number; feedback?: string } | null;
  messages?: Array<{ _id: string; from: "you" | "support"; content: string; createdAt: string }>;
}

// API: confetti_server routes/support.routes.js
export const supportService = {
  async list(): Promise<{ tickets: Ticket[]; priority: string | null }> {
    const res = await api.get("/support/tickets");
    return res.data.data;
  },
  async get(id: string): Promise<Ticket> {
    const res = await api.get(`/support/tickets/${id}`);
    return res.data.data.ticket;
  },
  async create(data: { subject: string; description: string; category: string }): Promise<Ticket> {
    const res = await api.post("/support/tickets", data);
    return res.data.data.ticket;
  },
  async reply(id: string, content: string): Promise<Ticket> {
    const res = await api.post(`/support/tickets/${id}/messages`, { content });
    return res.data.data.ticket;
  },
  async close(id: string): Promise<Ticket> {
    const res = await api.post(`/support/tickets/${id}/close`);
    return res.data.data.ticket;
  },
  async rate(id: string, rating: number, feedback?: string): Promise<Ticket> {
    const res = await api.post(`/support/tickets/${id}/rating`, { rating, feedback });
    return res.data.data.ticket;
  },
};

export default supportService;
