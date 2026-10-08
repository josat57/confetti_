import api from "@/api/api";

export interface PortalApproval {
  _id: string;
  title: string;
  description?: string;
  amount?: number;
  status: "pending" | "approved" | "changes_requested";
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  response?: string;
}
export interface PortalComment {
  _id: string;
  author: "planner" | "client";
  name?: string;
  body: string;
  createdAt: string;
}
export interface PlannerPortal {
  event: { _id: string; title: string };
  invites: Array<{ _id: string; name?: string; email: string; status: "invited" | "active" | "revoked"; invitedAt: string; lastViewedAt?: string; link: string | null }>;
  approvals: PortalApproval[];
  comments: PortalComment[];
  documents: Array<{ _id: string; name: string; type: string; size: number; sharedWithClient?: boolean }>;
}
export interface ClientPortalView {
  viewer: { name?: string; email: string };
  event: { title: string; eventType: string; startDate: string; endDate: string; status: string; venue: string; guestCount?: number };
  timeline: Array<{ title: string; description?: string; startTime?: string; endTime?: string; location?: string }>;
  checklist: Array<{ title: string; status: string; dueDate?: string }>;
  budget: { total: number; currency: string; spent: number; remaining: number; expenses: Array<{ description: string; category: string; amount: number; paymentStatus: string }> } | null;
  documents: Array<{ _id: string; name: string; type: string; size: number; url: string }>;
  approvals: PortalApproval[];
  comments: PortalComment[];
}

const base = (eventId: string) => `/planner/portal/events/${eventId}`;

// API: confetti_server routes/client-portal.routes.js
export const clientPortalService = {
  async get(eventId: string): Promise<PlannerPortal> {
    return (await api.get(base(eventId))).data.data;
  },
  async invite(eventId: string, email: string, name?: string): Promise<PlannerPortal> {
    return (await api.post(`${base(eventId)}/invites`, { email, name })).data.data;
  },
  async revoke(eventId: string, inviteId: string): Promise<PlannerPortal> {
    return (await api.delete(`${base(eventId)}/invites/${inviteId}`)).data.data;
  },
  async addApproval(eventId: string, data: { title: string; description?: string; amount?: number }): Promise<PlannerPortal> {
    return (await api.post(`${base(eventId)}/approvals`, data)).data.data;
  },
  async deleteApproval(eventId: string, approvalId: string): Promise<PlannerPortal> {
    return (await api.delete(`${base(eventId)}/approvals/${approvalId}`)).data.data;
  },
  async comment(eventId: string, body: string): Promise<PlannerPortal> {
    return (await api.post(`${base(eventId)}/comments`, { body })).data.data;
  },
  async shareDocument(eventId: string, documentId: string, shared: boolean): Promise<PlannerPortal> {
    return (await api.patch(`${base(eventId)}/documents/${documentId}`, { shared })).data.data;
  },

  // Client (private link)
  async view(token: string): Promise<ClientPortalView> {
    return (await api.get(`/portal/${token}`)).data.data;
  },
  async clientComment(token: string, body: string): Promise<{ comments: PortalComment[] }> {
    return (await api.post(`/portal/${token}/comments`, { body })).data.data;
  },
  async respond(token: string, approvalId: string, decision: "approved" | "changes_requested", comment?: string) {
    return (await api.post(`/portal/${token}/approvals/${approvalId}`, { decision, comment })).data.data as {
      approvals: PortalApproval[];
      comments: PortalComment[];
    };
  },
};

export default clientPortalService;
