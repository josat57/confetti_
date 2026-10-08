import api from "@/api/api";

/**
 * Event screens for people planning their own event (also usable by planners):
 * guests, seating, checklist, budget, invitations and public RSVP.
 * API: confetti_server routes guest/checklist/budget/invitation/rsvp.
 */

export type RsvpStatus = "pending" | "accepted" | "declined" | "tentative";
export type InvitationStatus = "not_sent" | "sent" | "failed" | "opened";

export interface Guest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  plusOne: boolean;
  plusOneName?: string;
  rsvpStatus: RsvpStatus;
  rsvpDate?: string;
  rsvpMessage?: string;
  respondedVia?: "link" | "organizer";
  dietaryRestrictions?: string[];
  category?: string;
  relationship?: string;
  notes?: string;
  tableAssignment?: string;
  seatNumber?: number;
  invitation?: { status: InvitationStatus; channel?: "email" | "whatsapp"; sentAt?: string; openedAt?: string };
}

export interface GuestInput {
  name: string;
  email?: string;
  phone?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string[] | string;
  category?: string;
  relationship?: string;
  notes?: string;
  rsvpStatus?: RsvpStatus;
}

export interface GuestListResponse {
  guests: Guest[];
  stats: {
    total: number;
    withPlusOne: number;
    estimatedAttendance: number;
    attending: number;
    byStatus: Record<RsvpStatus, number>;
    invitations: Partial<Record<InvitationStatus, number>>;
  };
  limit: { max: number | null; used: number; viaPass?: boolean };
}

export interface SeatingTable {
  _id?: string;
  name: string;
  capacity: number | null;
}

export interface ChecklistItem {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "completed";
  category?: string;
  priority: "low" | "medium" | "high";
  completedAt?: string;
}

export const EXPENSE_CATEGORIES = [
  "venue", "catering", "decoration", "entertainment", "photography", "videography", "transportation",
  "invitations", "favors", "attire", "flowers", "cake", "rentals", "staff", "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled";
  paymentDueDate?: string;
  date?: string;
  notes?: string;
}

export interface Budget {
  _id: string;
  totalBudget: number;
  currency: string;
  expenses: Expense[];
  categories: Array<{ name: string; allocated: number; spent: number }>;
  totalSpent: number;
  remaining: number;
  spentPercentage: number;
  isOverBudget: boolean;
  alerts?: Array<{ category: string; type: string; message: string }>;
}

export interface InvitationDesign {
  title: string;
  hosts: string;
  message: string;
  dressCode: string;
  venue: string;
  venueText?: string;
  theme: "classic" | "floral" | "modern" | "festive" | "elegant";
  accentColor: string;
  rsvpDeadline: string | null;
  allowPlusOnes: boolean;
  startDate?: string;
  endDate?: string;
  eventType?: string;
}

export interface InvitationStats {
  guests: number;
  withEmail: number;
  withPhone: number;
  byStatus: Record<InvitationStatus, number>;
  responded: number;
}

const base = (eventId: string) => `/events/${eventId}`;

export const clientEventService = {
  // Guests
  async getGuests(eventId: string, params?: { rsvpStatus?: string; search?: string }): Promise<GuestListResponse> {
    const res = await api.get(`${base(eventId)}/guests`, { params });
    return res.data.data;
  },
  async addGuest(eventId: string, guest: GuestInput): Promise<Guest> {
    const res = await api.post(`${base(eventId)}/guests`, guest);
    return res.data.data.guest;
  },
  async importGuests(eventId: string, guests: GuestInput[]): Promise<{ imported: number; skipped: number }> {
    const res = await api.post(`${base(eventId)}/guests/import`, { guests });
    return res.data.data;
  },
  async updateGuest(guestId: string, guest: Partial<GuestInput>): Promise<Guest> {
    const res = await api.patch(`/guests/${guestId}`, guest);
    return res.data.data.guest;
  },
  async deleteGuest(guestId: string): Promise<void> {
    await api.delete(`/guests/${guestId}`);
  },
  async setRsvp(guestId: string, status: RsvpStatus): Promise<Guest> {
    const res = await api.post(`/guests/${guestId}/rsvp`, { status });
    return res.data.data.guest;
  },
  async getRsvpLink(eventId: string, guestId: string): Promise<{ url: string; whatsappUrl: string }> {
    const res = await api.get(`${base(eventId)}/guests/${guestId}/rsvp-link`);
    return res.data.data;
  },
  async markShared(eventId: string, guestId: string): Promise<void> {
    await api.post(`${base(eventId)}/guests/${guestId}/invitation/shared`);
  },

  // Seating
  async getSeating(eventId: string): Promise<{ tables: SeatingTable[]; guests: Guest[] }> {
    const res = await api.get(`${base(eventId)}/seating`);
    return res.data.data;
  },
  async saveTables(eventId: string, tables: Array<{ name: string; capacity: number }>): Promise<SeatingTable[]> {
    const res = await api.put(`${base(eventId)}/seating/tables`, { tables });
    return res.data.data.tables;
  },
  async assignSeats(eventId: string, assignments: Array<{ guestId: string; table: string; seat?: number }>): Promise<number> {
    const res = await api.post(`${base(eventId)}/seating`, { assignments });
    return res.data.data?.updated ?? 0;
  },

  // Checklist
  async getChecklist(eventId: string): Promise<{ items: ChecklistItem[]; summary: { total: number; completed: number; overdue: number } }> {
    const res = await api.get(`${base(eventId)}/checklist`);
    return res.data.data;
  },
  async addChecklistItem(eventId: string, item: Partial<ChecklistItem> & { title: string }): Promise<ChecklistItem> {
    const res = await api.post(`${base(eventId)}/checklist`, item);
    return res.data.data.item;
  },
  async updateChecklistItem(eventId: string, itemId: string, changes: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const res = await api.patch(`${base(eventId)}/checklist/${itemId}`, changes);
    return res.data.data.item;
  },
  async deleteChecklistItem(eventId: string, itemId: string): Promise<void> {
    await api.delete(`${base(eventId)}/checklist/${itemId}`);
  },
  async generateChecklist(eventId: string): Promise<number> {
    const res = await api.post(`${base(eventId)}/checklist/generate`);
    return res.data.data.added;
  },

  // Budget
  /** null when no budget has been set yet */
  async getBudget(eventId: string): Promise<Budget | null> {
    try {
      const res = await api.get(`${base(eventId)}/budget`);
      return res.data.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
  async setBudget(eventId: string, totalBudget: number, currency: string): Promise<Budget> {
    const res = await api.put(`${base(eventId)}/budget`, { totalBudget, currency });
    return res.data.data;
  },
  async addExpense(eventId: string, expense: Partial<Expense>): Promise<Budget> {
    const res = await api.post(`${base(eventId)}/budget/expenses`, expense);
    return res.data.data;
  },
  async updateExpense(eventId: string, expenseId: string, expense: Partial<Expense>): Promise<Budget> {
    const res = await api.put(`${base(eventId)}/budget/expenses/${expenseId}`, expense);
    return res.data.data;
  },
  async deleteExpense(eventId: string, expenseId: string): Promise<Budget> {
    const res = await api.delete(`${base(eventId)}/budget/expenses/${expenseId}`);
    return res.data.data;
  },

  // Invitations
  async getInvitation(eventId: string): Promise<{ invitation: InvitationDesign; themes: string[]; stats: InvitationStats }> {
    const res = await api.get(`${base(eventId)}/invitation`);
    return res.data.data;
  },
  async saveInvitation(eventId: string, design: Partial<InvitationDesign>): Promise<InvitationDesign> {
    const res = await api.put(`${base(eventId)}/invitation`, design);
    return res.data.data.invitation;
  },
  async sendInvitations(
    eventId: string,
    options?: { guestIds?: string[]; resend?: boolean }
  ): Promise<{ sent: number; failed: Array<{ guestId: string; name: string }>; stats: InvitationStats }> {
    const res = await api.post(`${base(eventId)}/invitation/send`, options || {});
    return res.data.data;
  },

  // Public RSVP (no login)
  async getRsvp(token: string): Promise<{
    invitation: InvitationDesign;
    guest: { name: string; rsvpStatus: RsvpStatus; plusOne: boolean; plusOneName: string; dietaryRestrictions: string[]; rsvpMessage: string };
    canRespond: boolean;
  }> {
    const res = await api.get(`/rsvp/${token}`);
    return res.data.data;
  },
  async submitRsvp(
    token: string,
    answer: { status: Exclude<RsvpStatus, "pending">; plusOneName?: string; dietaryRestrictions?: string[]; message?: string }
  ): Promise<RsvpStatus> {
    const res = await api.post(`/rsvp/${token}`, answer);
    return res.data.data.rsvpStatus;
  },
};

export default clientEventService;
