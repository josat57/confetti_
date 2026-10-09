/**
 * Booking Types
 * Type definitions for booking management
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "deposit_paid"
  | "partially_paid"
  | "paid"
  | "refunded";

export interface BookingClient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface BookingEvent {
  type: string;
  date: string;
  endDate?: string;
  location: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  guestCount?: number;
  notes?: string;
}

export interface BookingPayment {
  total: number;
  deposit: number;
  depositPaid: boolean;
  depositPaidAt?: string;
  balance: number;
  currency: string;
  paymentMethod?: string;
  status: PaymentStatus;
}

export interface BookingNote {
  _id: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

/** Deposit and balance schedule (API utils/payment-schedule.js) */
export interface PaymentScheduleView {
  items: Array<{
    _id?: string;
    label: string;
    amount: number;
    dueDate?: string | null;
    paid: number;
    outstanding: number;
    status: "paid" | "partial" | "upcoming" | "due_soon" | "overdue";
    explicit: boolean;
  }>;
  total: number;
  paid: number;
  balance: number;
  nextDue: { label: string; amount: number; dueDate?: string | null; status: string } | null;
  overdue: number;
}

export interface Booking {
  _id: string;
  vendor: string;
  client: BookingClient;
  event: BookingEvent;
  payment: BookingPayment;
  status: BookingStatus;
  notes: BookingNote[];
  leadId?: string;
  quoteId?: string;
  contractSigned: boolean;
  contractSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  schedule?: PaymentScheduleView;
  depositDueDate?: string;
}

export interface BookingCreate {
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  eventEndDate?: string;
  location: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  guestCount?: number;
  eventNotes?: string;
  totalAmount: number;
  depositAmount: number;
  currency?: string;
  leadId?: string;
  quoteId?: string;
}

export interface BookingUpdate {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  eventType?: string;
  eventDate?: string;
  eventEndDate?: string;
  location?: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  guestCount?: number;
  eventNotes?: string;
  totalAmount?: number;
  depositAmount?: number;
  status?: BookingStatus;
}

export interface BookingFilters {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingThisWeek: number;
  upcomingThisMonth: number;
}

export interface BookingPaymentUpdate {
  amount: number;
  paymentMethod: string;
  notes?: string;
}
