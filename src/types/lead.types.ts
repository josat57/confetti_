// Lead Management Type Definitions

export interface Lead {
  _id: string;
  vendor: string;
  customer: Customer;
  eventDetails: EventDetails;
  status: LeadStatus;
  source: LeadSource;
  notes: Note[];
  assignedTo?: string;
  /** Signed-in client who sent the enquiry (can be messaged) */
  customerUser?: string;
  booking?: string;
  priority: "low" | "medium" | "high";
  estimatedValue?: number;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "negotiating"
  | "won"
  | "lost";

export type LeadSource = "website" | "referral" | "social" | "direct" | "other";

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface EventDetails {
  type: string;
  date: Date;
  location: string;
  guestCount?: number;
  budget?: number;
}

export interface Note {
  _id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
}

export interface LeadCreate {
  customer: Customer;
  eventDetails: EventDetails;
  source?: LeadSource;
  priority?: "low" | "medium" | "high";
  estimatedValue?: number;
  followUpDate?: Date;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: "low" | "medium" | "high";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  conversionRate: number;
  averageValue: number;
}
