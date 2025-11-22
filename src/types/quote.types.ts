// Quote Management Type Definitions

import { Customer } from "./lead.types";

export interface Quote {
  _id: string;
  vendor: string;
  lead?: string;
  quoteNumber: string;
  customer: Customer;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  validUntil: Date;
  terms?: string;
  notes?: string;
  status: QuoteStatus;
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuoteCreate {
  lead?: string;
  customer: Customer;
  items: QuoteItem[];
  tax?: number;
  discount?: number;
  validUntil: Date;
  terms?: string;
  notes?: string;
}

export interface QuoteFilters {
  status?: QuoteStatus;
  leadId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuotesResponse {
  quotes: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface QuoteTemplate {
  _id?: string;
  name: string;
  items: QuoteItem[];
  terms?: string;
  notes?: string;
}
