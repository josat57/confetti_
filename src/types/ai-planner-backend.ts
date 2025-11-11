/**
 * AI Event Planner Backend Types
 *
 * This file contains all TypeScript interfaces and types for the AI Event Planner backend.
 * These types should be used by the backend API service.
 */

// ============================================================================
// Enums
// ============================================================================

export enum EventType {
  WEDDING = "wedding",
  CORPORATE = "corporate",
  BIRTHDAY = "birthday",
  GRADUATION = "graduation",
  CONFERENCE = "conference",
  OTHER = "other",
}

export enum VendorCategory {
  VENUE = "venue",
  CATERING = "catering",
  ENTERTAINMENT = "entertainment",
  PHOTOGRAPHY = "photography",
  VIDEOGRAPHY = "videography",
  DECORATION = "decoration",
  FLORALS = "florals",
  TRANSPORTATION = "transportation",
  CAR_RENTAL = "car_rental",
  AUDIO_VISUAL = "audio_visual",
  EVENT_PLANNING = "event_planning",
  SECURITY = "security",
  VALET_PARKING = "valet_parking",
  RENTALS = "rentals",
  CAKE_DESSERTS = "cake_desserts",
  BAR_SERVICES = "bar_services",
  LIGHTING = "lighting",
  INVITATIONS = "invitations",
  FAVORS_GIFTS = "favors_gifts",
}

export enum AgeGroup {
  CHILDREN = "children",
  TEENAGERS = "teenagers",
  YOUNG_ADULTS = "young_adults",
  ADULTS = "adults",
  SENIORS = "seniors",
}

export enum FormalityLevel {
  CASUAL = "casual",
  SEMI_FORMAL = "semi_formal",
  FORMAL = "formal",
  BLACK_TIE = "black_tie",
}

export enum SocialStatus {
  BUDGET_CONSCIOUS = "budget_conscious",
  MIDDLE_CLASS = "middle_class",
  AFFLUENT = "affluent",
  LUXURY = "luxury",
}

export enum SpecialRequirement {
  DIETARY_RESTRICTIONS = "dietary_restrictions",
  ACCESSIBILITY_NEEDS = "accessibility_needs",
  CULTURAL_CONSIDERATIONS = "cultural_considerations",
  RELIGIOUS_CONSIDERATIONS = "religious_considerations",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  CAD = "CAD",
}

export enum RequestStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  EXPIRED = "expired",
}

export enum Priority {
  ESSENTIAL = "essential",
  RECOMMENDED = "recommended",
  OPTIONAL = "optional",
}

export enum Availability {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// ============================================================================
// Request Models
// ============================================================================

export interface LocationData {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone?: string;
}

export interface GuestClassData {
  ageGroups: AgeGroup[];
  formality: FormalityLevel;
  socialStatus: SocialStatus[];
  specialRequirements: SpecialRequirement[];
  additionalDetails: string;
}

export interface BudgetData {
  amount: number;
  currency: Currency;
}

export interface EventPlanRequest {
  eventType: EventType;
  eventDate: Date;
  guestCount: number;
  location: LocationData;
  eventDescription: string;
  guestClass: GuestClassData;
  budget: BudgetData;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Database Entity Models
// ============================================================================

export interface EventPlanRequestEntity {
  id: string;
  sessionToken: string;
  userId?: string;
  eventType: EventType;
  eventDate: Date;
  guestCount: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  eventDescription: string;
  guestClassData: GuestClassData;
  budgetAmount: number;
  budgetCurrency: Currency;
  ipAddress?: string;
  userAgent?: string;
  status: RequestStatus;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

export interface EventPlanResultEntity {
  id: string;
  requestId: string;
  analysisData: EventAnalysis;
  teaserData: EventPlanTeaser;
  fullPlanData?: EventPlanFull;
  feasibilityScore: number;
  processingTimeMs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorCategoryEntity {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Analysis Models
// ============================================================================

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  currency: Currency;
}

export interface VendorCategoryData {
  category: VendorCategory;
  vendorCount: number;
  priceRange: PriceRange;
  averageRating: number;
  availability: Availability;
}

export interface VendorAggregateData {
  location: string;
  categories: VendorCategoryData[];
  totalVendorsFound: number;
  averagePricing: Record<string, PriceRange>;
}

export interface BudgetCategoryAllocation {
  category: VendorCategory;
  allocatedAmount: number;
  percentage: number;
  priceRange: PriceRange;
  priority: Priority;
  rationale: string;
}

export interface BudgetAllocation {
  categories: BudgetCategoryAllocation[];
  totalAllocated: number;
  contingency: number;
  contingencyPercentage: number;
}

export interface Recommendation {
  type: "budget" | "vendor" | "timeline" | "general";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface EventAnalysis {
  vendorData: VendorAggregateData;
  budgetAllocation: BudgetAllocation;
  recommendations: Recommendation[];
  feasibilityScore: number;
  warnings: string[];
}

// ============================================================================
// Teaser Models (Public - No Vendor Details)
// ============================================================================

export interface EventSummary {
  eventType: string;
  eventDate: Date;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  formality: string;
}

export interface BudgetBreakdownTeaser {
  categories: {
    name: string;
    percentage: number;
    amount: number;
    description: string;
    priority: string;
  }[];
  totalAllocated: number;
  contingency: number;
}

export interface VendorCategoryTeaser {
  name: string;
  description: string;
  estimatedCost: { min: number; max: number };
  priority: string;
  locked: true;
  vendorCount: number;
}

export interface TimelineTeaser {
  planningMilestones: {
    title: string;
    timeframe: string;
    description: string;
  }[];
  eventDayHighlights: {
    time: string;
    activity: string;
  }[];
  detailedTimelineLocked: true;
}

export interface EventPlanTeaser {
  eventSummary: EventSummary;
  budgetBreakdown: BudgetBreakdownTeaser;
  vendorCategories: VendorCategoryTeaser[];
  timeline: TimelineTeaser;
  recommendations: string[];
  aiInsights: string;
}

// ============================================================================
// Full Plan Models (Authenticated Users Only)
// ============================================================================

export interface ContactInfo {
  email: string;
  phone: string;
  website: string;
  address: string;
}

export interface VendorRecommendation {
  vendorId: string;
  name: string;
  category: VendorCategory;
  rating: number;
  reviewCount: number;
  priceRange: PriceRange;
  contactInfo: ContactInfo;
  portfolio: string[];
  availability: boolean;
  matchScore: number;
  whyRecommended: string;
}

export interface Task {
  title: string;
  description: string;
  deadline: Date;
  priority: "high" | "medium" | "low";
  category: VendorCategory;
  completed: boolean;
}

export interface PlanningPhase {
  phase: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

export interface ScheduleActivity {
  time: string;
  endTime: string;
  activity: string;
  description: string;
  vendor?: string;
  location?: string;
  notes: string;
}

export interface EventDaySchedule {
  activities: ScheduleActivity[];
  totalDuration: number;
}

export interface DetailedTimeline {
  planningPhases: PlanningPhase[];
  eventDaySchedule: EventDaySchedule;
}

export interface ActionItem {
  title: string;
  description: string;
  deadline: Date;
  category: VendorCategory;
  priority: "high" | "medium" | "low";
}

export interface Resource {
  title: string;
  description: string;
  type: "checklist" | "template" | "guide" | "tool";
  url: string;
}

export interface EventPlanFull extends EventPlanTeaser {
  vendors: VendorRecommendation[];
  detailedTimeline: DetailedTimeline;
  actionItems: ActionItem[];
  resources: Resource[];
}

// ============================================================================
// Result Models
// ============================================================================

export interface EventPlanResult {
  id: string;
  sessionToken: string;
  request: EventPlanRequest;
  analysis: EventAnalysis;
  teaser: EventPlanTeaser;
  fullPlan?: EventPlanFull;
  createdAt: Date;
  expiresAt: Date;
  userId?: string;
  status: RequestStatus;
}

// ============================================================================
// API Response Models
// ============================================================================

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  code?: string;
}

export interface AnalyzeEventResponse {
  sessionToken: string;
  eventPlan: EventPlanTeaser;
  expiresAt: string;
}

export interface SaveEventPlanResponse {
  eventId: string;
  fullPlan: EventPlanFull;
}

export interface GetEventPlanResponse {
  eventPlan: EventPlanTeaser;
  expiresAt: string;
  canUpgrade: boolean;
}

export interface GetFullPlanResponse {
  fullPlan: EventPlanFull;
}

// ============================================================================
// Error Models
// ============================================================================

export interface InsufficientBudgetErrorData {
  minimumBudget: number;
  suggestedBudget: number;
  alternatives: string[];
}

export interface LocationNotSupportedErrorData {
  nearestSupportedCities: string[];
  notifyWhenAvailable: boolean;
}

// ============================================================================
// Service Configuration Models
// ============================================================================

export interface AllocationTemplate {
  category: VendorCategory;
  percentage: number;
  priority: Priority;
}

export interface BudgetTemplate {
  eventType: EventType;
  allocations: AllocationTemplate[];
}

export interface TimelineMilestone {
  title: string;
  timeframe: string;
  description: string;
  monthsBefore: number;
}

export interface EventDayScheduleTemplate {
  eventType: EventType;
  activities: {
    time: string;
    activity: string;
  }[];
}

// ============================================================================
// Vendor Models (Extended)
// ============================================================================

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  eventTypes: EventType[];
  averagePrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  availabilityStatus: "available" | "limited" | "unavailable";
  contactInfo: ContactInfo;
  portfolio: string[];
  description: string;
  currency: Currency;
}

// ============================================================================
// Cache Models
// ============================================================================

export interface CacheKey {
  type: "session" | "vendor" | "budget" | "ratelimit";
  identifier: string;
}

export interface SessionCacheData {
  eventPlanResult: EventPlanResult;
  expiresAt: Date;
}

export interface VendorCacheData {
  vendorData: VendorAggregateData;
  cachedAt: Date;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
