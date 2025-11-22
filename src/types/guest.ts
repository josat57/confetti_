// Guest Management Types
export type RSVPStatus = "Pending" | "Accepted" | "Declined" | "Maybe";

export interface Guest {
  _id: string;
  event: string;
  name: string;
  email?: string;
  phone?: string;
  category: string;
  rsvpStatus: RSVPStatus;
  rsvpDate?: string;
  dietaryRestrictions?: string;
  specialRequirements?: string;
  plusOneAllowed: boolean;
  plusOneName?: string;
  plusOneRSVP?: RSVPStatus;
  tableNumber?: number;
  seatNumber?: number;
  checkedIn: boolean;
  checkInTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestInput {
  name: string;
  email?: string;
  phone?: string;
  category: string;
  plusOneAllowed?: boolean;
  dietaryRestrictions?: string;
  specialRequirements?: string;
}

export interface UpdateGuestInput extends Partial<CreateGuestInput> {
  rsvpStatus?: RSVPStatus;
  plusOneName?: string;
  plusOneRSVP?: RSVPStatus;
  tableNumber?: number;
  seatNumber?: number;
  checkedIn?: boolean;
}

export interface GuestStats {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
  checkedIn: number;
}

export interface ImportResult {
  imported: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
