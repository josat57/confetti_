// Planner Dashboard Types

export type EventStatus =
  | "Draft"
  | "Planning"
  | "Confirmed"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type EventType =
  | "Wedding"
  | "Corporate Event"
  | "Birthday Party"
  | "Graduation"
  | "Conference"
  | "Anniversary"
  | "Other";

export type SubscriptionTier =
  | "starter"
  | "professional"
  | "business"
  | "enterprise";

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
}

export interface Budget {
  total: number;
  currency: string;
  allocations: BudgetAllocation[];
}

export interface VendorAssignment {
  vendor: string; // Vendor ID
  category: string;
  status:
    | "Pending"
    | "Contacted"
    | "Quoted"
    | "Booked"
    | "Confirmed"
    | "Declined";
  amount?: number;
  bookingDate?: string;
  notes?: string;
}

export interface Milestone {
  milestone: string;
  date: string;
  completed: boolean;
  description?: string;
}

export interface Media {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface TeamMember {
  user: string; // User ID
  role: "Admin" | "Manager" | "Coordinator";
  assignedAt: string;
}

export interface Event {
  _id: string;
  planner: string; // User ID
  client?: string; // Client ID
  name: string;
  type: EventType;
  description?: string;
  date: string;
  endDate?: string;
  location: Location;
  status: EventStatus;
  budget: Budget;
  guestCount: number;
  vendors: VendorAssignment[];
  timeline: Milestone[];
  tasks: string[]; // Task IDs
  guests: string[]; // Guest IDs
  documents: string[]; // Document IDs
  media: Media[];
  teamMembers: TeamMember[];
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateEventInput {
  name: string;
  type: EventType;
  description?: string;
  date: string;
  endDate?: string;
  location: Location;
  budget: {
    total: number;
    currency: string;
  };
  guestCount: number;
  client?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

export interface EventFilters {
  status?: EventStatus;
  type?: EventType;
  client?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface EventSortOption {
  field: "date" | "name" | "status" | "budget" | "createdAt";
  order: "asc" | "desc";
}

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Client Types
export interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ClientPreferences {
  eventTypes: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  communicationPreference: "Email" | "Phone" | "SMS" | "WhatsApp";
}

export interface ClientNote {
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface ClientFeedback {
  eventId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Client {
  _id: string;
  planner: string; // User ID
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: ClientAddress;
  preferences: ClientPreferences;
  events: string[]; // Event IDs
  notes: ClientNote[];
  satisfactionRating?: number;
  feedback: ClientFeedback[];
  totalSpent: number;
  eventsCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: ClientAddress;
  preferences?: Partial<ClientPreferences>;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  status?: "Active" | "Inactive";
}

export interface PaginatedClients {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Vendor Search & Discovery Types
export interface Vendor {
  _id: string;
  businessName: string;
  category: string;
  subcategory?: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  pricing: {
    startingPrice: number;
    currency: string;
    priceRange: "Budget" | "Mid-Range" | "Premium" | "Luxury";
  };
  rating: number;
  reviewCount: number;
  availability: "Available" | "Limited" | "Booked";
  portfolio: Array<{
    url: string;
    caption?: string;
  }>;
  services: string[];
  featured: boolean;
  responseTime: string; // e.g., "Within 24 hours"
  createdAt: string;
  updatedAt: string;
}

export interface VendorSearchFilters {
  search?: string;
  category?: string;
  location?: string;
  priceRange?: string;
  minRating?: number;
  availability?: string;
  sortBy?: "rating" | "price" | "distance" | "popularity";
  page?: number;
  limit?: number;
}

export interface PaginatedVendors {
  vendors: Vendor[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface VendorFavorite {
  _id: string;
  planner: string;
  vendor: string;
  createdAt: string;
}

// Vendor Booking Types
export type BookingStatus =
  | "Pending"
  | "Contacted"
  | "Quoted"
  | "Booked"
  | "Confirmed"
  | "Declined"
  | "Cancelled";

export interface VendorBooking {
  _id: string;
  planner: string;
  vendor: string;
  event: string;
  status: BookingStatus;
  serviceRequirements: string;
  budget: number;
  currency: string;
  specialRequirements?: string;
  quotedPrice?: number;
  contractUrl?: string;
  paymentSchedule?: Array<{
    amount: number;
    dueDate: string;
    status: "Pending" | "Paid" | "Overdue";
  }>;
  notes: Array<{
    content: string;
    createdAt: string;
    createdBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  vendor: string;
  event: string;
  serviceRequirements: string;
  budget: number;
  specialRequirements?: string;
}

export interface UpdateBookingInput extends Partial<CreateBookingInput> {
  status?: BookingStatus;
  quotedPrice?: number;
}

export interface PaginatedBookings {
  bookings: VendorBooking[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Budget Management Types
export interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  percentage: number;
}

export interface Expense {
  _id: string;
  event: string;
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  date: string;
  paymentStatus: "Pending" | "Paid" | "Overdue";
  paymentDueDate?: string;
  receipt?: {
    url: string;
    filename: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventBudget {
  _id: string;
  event: string;
  total: number;
  currency: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  totalSpent: number;
  remaining: number;
  contingency?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  date: string;
  paymentStatus: "Pending" | "Paid" | "Overdue";
  paymentDueDate?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface BudgetTemplate {
  eventType: EventType;
  categories: Array<{
    category: string;
    percentage: number;
  }>;
}

// Task Management Types
export type TaskStatus = "Todo" | "In Progress" | "Completed" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface TaskComment {
  user: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  _id: string;
  event: string;
  planner: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string;
  category: string;
  dependencies: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  completedAt?: string;
  completedBy?: string;
  recurring?: {
    frequency: "Daily" | "Weekly" | "Monthly";
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  event: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string;
  category: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface TaskFilters {
  event?: string;
  assignee?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  limit?: number;
}

export interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}


// Guest Management Types
export type RSVPStatus = "Pending" | "Accepted" | "Declined" | "Maybe";

export interface Gu