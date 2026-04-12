/**
 * Invoice Types
 * Type definitions for invoice management
 */

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export interface InvoiceClient {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
}

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface InvoicePayment {
  _id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}

export interface Invoice {
  _id: string;
  vendor: string;
  invoiceNumber: string;
  client: InvoiceClient;
  booking?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: "percentage" | "fixed";
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  payments: InvoicePayment[];
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCreate {
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  bookingId?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  taxRate?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  currency?: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
}

export interface InvoiceUpdate {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  taxRate?: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  status?: InvoiceStatus;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InvoiceStats {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  cancelled: number;
  totalRevenue: number;
  totalOutstanding: number;
  averageInvoiceValue: number;
  paidThisMonth: number;
  overdueAmount: number;
}

export interface InvoicePaymentCreate {
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  notes?: string;
}

export interface InvoiceTemplate {
  _id: string;
  name: string;
  items: InvoiceItem[];
  taxRate: number;
  terms?: string;
  notes?: string;
}
