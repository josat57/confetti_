// Calendar & Availability Type Definitions

export interface CalendarData {
  events: CalendarEvent[];
  blockedDates: BlockedDate[];
  businessHours: BusinessHours[];
}

export interface CalendarEvent {
  _id: string;
  title: string;
  date: Date;
  type: "booking" | "blocked" | "available";
  details?: any;
}

export interface BlockedDate {
  _id: string;
  dates: string[];
  reason?: string;
  createdAt: Date;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface AvailabilityStatus {
  date: string;
  available: boolean;
  reason?: string;
  bookings?: number;
}

export interface BlockDatesRequest {
  dates: string[];
  reason?: string;
}

export interface CalendarParams {
  startDate: string;
  endDate: string;
}
