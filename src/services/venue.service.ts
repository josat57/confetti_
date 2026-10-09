import api from "@/api/api";

/** Venue plan tools: spaces, calendar, holds and bookings. API: confetti_server routes/venue.routes.js */

export type ReservationStatus = "held" | "booked" | "blocked" | "released" | "expired" | "cancelled";
export type VenueSession = "full" | "morning" | "evening";

export interface VenueSpace {
  _id: string;
  name: string;
  description?: string;
  capacity?: { seated?: number; standing?: number };
  pricePerDay?: number;
  active: boolean;
}
export interface VenueReservation {
  _id: string;
  space: string | { _id: string; name: string };
  status: ReservationStatus;
  dateFrom: string;
  dateTo: string;
  session: VenueSession;
  title?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  guestCount?: number;
  notes?: string;
  holdExpiresAt?: string;
  booking?: string;
  history?: Array<{ action: string; note?: string; at: string }>;
}
export interface ReservationInput {
  space?: string;
  status?: "held" | "booked" | "blocked";
  dateFrom?: string;
  dateTo?: string;
  session?: VenueSession;
  title?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  guestCount?: number | "";
  notes?: string;
  holdExpiresAt?: string;
  booking?: string;
  totalAmount?: number | "";
  depositAmount?: number | "";
  depositDueDate?: string;
}

const base = "/vendors/venue";
export const venueService = {
  async listSpaces(): Promise<VenueSpace[]> {
    return (await api.get(`${base}/spaces`)).data.data.spaces;
  },
  async createSpace(data: Partial<VenueSpace>): Promise<VenueSpace> {
    return (await api.post(`${base}/spaces`, data)).data.data.space;
  },
  async updateSpace(id: string, data: Partial<VenueSpace>): Promise<VenueSpace> {
    return (await api.patch(`${base}/spaces/${id}`, data)).data.data.space;
  },
  async deleteSpace(id: string): Promise<{ archived?: boolean; deleted?: boolean }> {
    return (await api.delete(`${base}/spaces/${id}`)).data.data;
  },
  async calendar(params: { from: string; to: string; space?: string }): Promise<{ from: string; to: string; spaces: VenueSpace[]; reservations: VenueReservation[] }> {
    return (await api.get(`${base}/calendar`, { params })).data.data;
  },
  async availability(params: { space: string; dateFrom: string; dateTo?: string; session?: VenueSession }) {
    return (await api.get(`${base}/availability`, { params })).data.data as { available: boolean; conflicts: VenueReservation[] };
  },
  async listReservations(params?: { status?: string; space?: string; upcoming?: boolean }): Promise<VenueReservation[]> {
    return (await api.get(`${base}/reservations`, { params })).data.data.reservations;
  },
  async createReservation(data: ReservationInput): Promise<VenueReservation> {
    return (await api.post(`${base}/reservations`, data)).data.data.reservation;
  },
  async updateReservation(id: string, data: ReservationInput): Promise<VenueReservation> {
    return (await api.patch(`${base}/reservations/${id}`, data)).data.data.reservation;
  },
  async extendHold(id: string, holdExpiresAt: string): Promise<VenueReservation> {
    return (await api.post(`${base}/reservations/${id}/extend`, { holdExpiresAt })).data.data.reservation;
  },
  async convertHold(id: string, data: ReservationInput): Promise<VenueReservation> {
    return (await api.post(`${base}/reservations/${id}/convert`, data)).data.data.reservation;
  },
  async release(id: string, reason?: string): Promise<VenueReservation> {
    return (await api.post(`${base}/reservations/${id}/release`, { reason })).data.data.reservation;
  },
};

export default venueService;
