// AI Event Planner Type Definitions

// ============================================================================
// ENUMS
// ============================================================================

export enum EventType {
  WEDDING = "wedding",
  CORPORATE = "corporate",
  BIRTHDAY = "birthday",
  GRADUATION = "graduation",
  CONFERENCE = "conference",
  OTHER = "other",
}

export enum AgeGroup {
  CHILDREN = "children",
  TEENAGERS = "teenagers",
  YOUNG_ADULTS = "young-adults",
  ADULTS = "adults",
  SENIORS = "seniors",
}

export enum FormalityLevel {
  CASUAL = "casual",
  SEMI_FORMAL = "semi-formal",
  FORMAL = "formal",
  BLACK_TIE = "black-tie",
}

export enum SocialStatus {
  BUDGET_CONSCIOUS = "budget-conscious",
  MIDDLE_CLASS = "middle-class",
  AFFLUENT = "affluent",
  LUXURY = "luxury",
}

export enum SpecialRequirement {
  DIETARY_RESTRICTIONS = "dietary-restrictions",
  ACCESSIBILITY_NEEDS = "accessibility-needs",
  CULTURAL_CONSIDERATIONS = "cultural-considerations",
  RELIGIOUS_CONSIDERATIONS = "religious-considerations",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  NGN = "NGN",
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
  CAR_RENTAL = "car-rental",
  AUDIO_VISUAL = "audio-visual",
  EVENT_PLANNING = "event-planning",
  SECURITY = "security",
  VALET_PARKING = "valet-parking",
  RENTALS = "rentals",
  CAKE_DESSERTS = "cake-desserts",
  BAR_SERVICES = "bar-services",
  LIGHTING = "lighting",
  INVITATIONS = "invitations",
  FAVORS_GIFTS = "favors-gifts",
}

// ============================================================================
// FORM DATA INTERFACES
// ============================================================================

export interface LocationData {
  method: "map" | "manual";
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface EventDurationData {
  startTime: string; // "14:00"
  endTime: string; // "22:00"
  isMultiDay: boolean;
  numberOfDays: number;
  timeFlexibility: "strict" | "moderate" | "flexible";
}

export interface VenuePreferencesData {
  venueType: "indoor" | "outdoor" | "hybrid" | "flexible";
  capacity: number;
  style: "elegant" | "rustic" | "modern" | "traditional" | "luxury" | "casual";
  mustHaveAmenities: string[];
  niceToHaveAmenities: string[];
  accessibilityNeeds: string[];
  locationFlexibility: "same_city" | "nearby_cities" | "anywhere";
}

export interface BudgetBreakdownData {
  totalBudget: number;
  priorities: string[]; // Drag & drop ranking
  flexibleCategories: string[];
  fixedCategories: string[];
  contingencyPercentage: number; // 5-20%
  paymentPreferences: "upfront" | "installments" | "milestone_based";
  budgetFlexibility: "strict" | "moderate" | "flexible";
}

export interface GuestProfileData {
  ageGroups: {
    children: number;
    teens: number;
    adults: number;
    seniors: number;
  };
  dietaryRestrictions: {
    vegetarian: number;
    vegan: number;
    halal: number;
    kosher: number;
    glutenFree: number;
    allergies: string[];
    other: string;
  };
  accessibilityNeeds: {
    wheelchair: number;
    hearingImpaired: number;
    visualImpaired: number;
    other: string;
  };
  guestTypes: string[];
  outOfTownGuests: {
    count: number;
    needAccommodation: boolean;
    needTransportation: boolean;
  };
}

export interface ClientProfileData {
  demographics: {
    age: number;
    occupation: string;
    lifestyle: "modern" | "traditional" | "luxury" | "minimalist" | "bohemian";
    personality: "extroverted" | "introverted" | "balanced";
    eventExperience: "first_time" | "some_experience" | "very_experienced";
  };
  stylePreferences: {
    colorScheme: string[]; // Max 3 colors
    musicGenre: string[];
    foodStyle: "buffet" | "plated" | "family_style" | "cocktail";
    formalityLevel: "casual" | "semi_formal" | "formal" | "black_tie";
    photographyStyle: "candid" | "posed" | "artistic" | "documentary";
  };
  culturalBackground: {
    ethnicity: string;
    religion: string;
    importantTraditions: string[];
    languages: string[];
  };
}

export interface EventSpecificData {
  // Wedding specific
  weddingSpecific?: {
    ceremonyType: "religious" | "civil" | "traditional" | "destination";
    receptionStyle: "seated_dinner" | "cocktail" | "buffet" | "garden_party";
    specialMoments: string[];
    weddingPartySize: {
      bridesmaids: number;
      groomsmen: number;
      flowergirls: number;
      ringbearers: number;
    };
    mustHaveVendors: string[];
    weddingTraditions: string[];
  };

  // Corporate specific
  corporateSpecific?: {
    eventPurpose:
      | "conference"
      | "product_launch"
      | "team_building"
      | "awards"
      | "networking";
    companySize: "startup" | "small" | "medium" | "large" | "enterprise";
    brandGuidelines: boolean;
    techRequirements: string[];
    businessObjectives: string[];
    attendeeTypes: string[];
  };

  // Birthday specific
  birthdaySpecific?: {
    celebrantAge: number;
    ageCategory: "child" | "teen" | "adult" | "milestone";
    theme: string;
    activities: string[];
    giftPreferences: "registry" | "cash" | "experiences" | "charity" | "none";
    surpriseElement: boolean;
  };
}

export interface SpecialRequirementsData {
  weatherConsiderations: {
    outdoorElements: boolean;
    weatherBackupPlan: boolean;
    seasonalFactors: string;
  };
  logisticalNeeds: {
    setupTime: "2_hours" | "4_hours" | "full_day";
    cleanupRequirements: "basic" | "thorough" | "professional";
    storageNeeds: "none" | "minimal" | "extensive";
    securityNeeds: "none" | "basic" | "professional";
  };
  customRequirements: string;
}

// Legacy interfaces for backward compatibility
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

// Enhanced form data interface
export interface EventPlanFormData {
  // Step 1: Basic Information
  eventType: EventType;
  eventDate: Date;
  guestCount: number;
  budget: BudgetData;
  location: LocationData;

  // Step 2: Event Duration & Timing
  eventDuration?: EventDurationData;

  // Step 3: Venue Preferences
  venuePreferences?: VenuePreferencesData;

  // Step 4: Budget Breakdown & Priorities
  budgetBreakdown?: BudgetBreakdownData;

  // Step 5: Guest Profile & Requirements
  guestProfile?: GuestProfileData;

  // Step 6: Client Profile & Preferences
  clientProfile?: ClientProfileData;

  // Step 7: Event-Specific Requirements
  eventSpecific?: EventSpecificData;

  // Step 8: Special Requirements & Notes
  specialRequirements?: SpecialRequirementsData;

  // Legacy fields for backward compatibility
  eventDescription?: string;
  guestClass?: GuestClassData;
}

// ============================================================================
// API RESPONSE INTERFACES
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

export interface BudgetCategory {
  name: string; // Display name
  category: string; // Internal category name
  percentage: number; // 0-100
  amount: number; // In user's currency
  priority: "essential" | "recommended" | "optional";
  confidence: number; // 0-100
  description: string; // Rationale
}

export interface BudgetBreakdownTeaser {
  categories: BudgetCategory[];
  totalAllocated: number;
  contingency: number;
  feasibilityScore: number; // 0-100
}

export interface VendorCategoryTeaser {
  name: string; // Display name
  category: string; // Internal name
  description: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  allocatedAmount: number;
  priority: "essential" | "recommended" | "optional";
  locked: true; // Always true for teaser
  vendorCount: number; // Number of vendors available
}

export interface Milestone {
  title: string;
  timeframe: string;
  description: string;
  status: "active" | "upcoming" | "overdue";
}

export interface ScheduleHighlight {
  time: string; // "02:00 PM"
  activity: string;
}

export interface TimelineTeaser {
  planningMilestones: Milestone[];
  eventDayHighlights: ScheduleHighlight[];
  detailedTimelineLocked: true; // Always true for teaser
  metadata: {
    generatedAt: string;
    processingTime: number;
    daysUntilEvent: number;
  };
}

export interface AIInsights {
  sentiment: {
    score: number; // 0-1
    label: "positive" | "neutral" | "negative";
  };
  keywords: string[];
  feasibilityScore: number; // 0-100
}

export interface EventPlanTeaser {
  eventSummary: EventSummary;
  budgetBreakdown: BudgetBreakdownTeaser;
  vendorCategories: VendorCategoryTeaser[];
  timeline: TimelineTeaser;
  recommendations: string[];
  aiInsights: AIInsights;
}

export interface APIResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  code?: string;
  meta?: {
    processingTime?: number;
  };
}

// Error Response Types
export interface InsufficientBudgetError {
  status: "error";
  code: "INSUFFICIENT_BUDGET";
  message: string;
  data: {
    minimumBudget: number;
    suggestedBudget: number;
    alternatives: string[];
  };
}

export interface ValidationError {
  status: "error";
  code: "VALIDATION_ERROR";
  message: string;
  field: string;
}

export interface RateLimitError {
  status: "error";
  code: "RATE_LIMIT_EXCEEDED";
  message: string;
  data: {
    retryAfter: number;
    retryAfterMinutes: number;
  };
}

export interface ProcessingTimeoutError {
  status: "error";
  code: "PROCESSING_TIMEOUT";
  message: string;
  data: {
    retryable: boolean;
    suggestion: string;
  };
}

export type APIError =
  | InsufficientBudgetError
  | ValidationError
  | RateLimitError
  | ProcessingTimeoutError;

export interface AnalyzeEventResponse {
  sessionToken: string;
  eventPlan: EventPlanTeaser;
  expiresAt: string;
}

export interface GetResultResponse {
  eventPlan: EventPlanTeaser;
  expiresAt: string;
  canUpgrade: boolean;
}

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface FormErrors {
  [field: string]: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: Date;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface EventPlanningFormProps {
  onSubmit: (data: EventPlanFormData) => Promise<void>;
  initialData?: Partial<EventPlanFormData>;
}

export interface MapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { lat: number; lng: number };
  onToggleManualEntry: () => void;
}

export interface GuestClassFormProps {
  value: GuestClassData;
  onChange: (data: GuestClassData) => void;
  errors?: FormErrors;
}

export interface LoadingScreenProps {
  progress: number;
  currentStep: string;
}

export interface TeaserResultPageProps {
  eventPlan: EventPlanTeaser;
  sessionToken: string;
  onSignUp: () => void;
  onSaveContinue: () => void;
}

export interface BudgetBreakdownChartProps {
  categories: BudgetCategory[];
  totalBudget: number;
  currency: string;
  chartType: "pie" | "bar" | "donut";
}

export interface VendorCategoryCardProps {
  category: VendorCategoryTeaser;
  locked: boolean;
  onUnlockClick: () => void;
}

export interface CTASectionProps {
  onSignUp: () => void;
  onSaveContinue: () => void;
  benefits: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingStep = {
  progress: number;
  message: string;
};

export type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
