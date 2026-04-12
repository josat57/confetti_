import {
  EventType,
  EventPlanFormData,
  LocationData,
  GuestClassData,
  BudgetData,
  FormErrors,
  AgeGroup,
  SocialStatus,
  FormalityLevel,
} from "@/types/ai-planner";

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  eventType: "Please select an event type",
  eventDate: "Event date must be in the future",
  guestCount: "Guest count must be between 1 and 10,000",
  location: "Please provide a valid location",
  locationAddress: "Address is required",
  locationCity: "City is required",
  locationState: "State is required",
  eventDescription:
    "Please provide at least 50 characters describing your event",
  eventDescriptionMax: "Event description must not exceed 1000 characters",
  guestClassAgeGroups: "Please select at least one age group",
  guestClassFormality: "Please select a formality level",
  guestClassSocialStatus: "Please select at least one social status",
  budget: "Please enter a realistic budget for your event",
  budgetMin: "Budget must be at least $100",
  budgetCurrency: "Please select a currency",
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const validateEventType = (
  eventType: EventType | string
): string | null => {
  if (!eventType) {
    return ERROR_MESSAGES.eventType;
  }

  const validTypes = Object.values(EventType);
  if (!validTypes.includes(eventType as EventType)) {
    return ERROR_MESSAGES.eventType;
  }

  return null;
};

export const validateEventDate = (date: Date | string): string | null => {
  if (!date) {
    return ERROR_MESSAGES.eventDate;
  }

  const eventDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(eventDate.getTime())) {
    return "Invalid date format";
  }

  if (eventDate < today) {
    return ERROR_MESSAGES.eventDate;
  }

  return null;
};

export const validateGuestCount = (count: number | string): string | null => {
  const guestCount = typeof count === "string" ? parseInt(count, 10) : count;

  if (isNaN(guestCount) || guestCount < 1) {
    return ERROR_MESSAGES.guestCount;
  }

  if (guestCount > 10000) {
    return ERROR_MESSAGES.guestCount;
  }

  return null;
};

export const validateLocation = (location: LocationData): FormErrors => {
  const errors: FormErrors = {};

  if (!location.address || location.address.trim().length < 5) {
    errors.locationAddress = ERROR_MESSAGES.locationAddress;
  }

  if (!location.city || location.city.trim().length === 0) {
    errors.locationCity = ERROR_MESSAGES.locationCity;
  }

  if (!location.state || location.state.trim().length === 0) {
    errors.locationState = ERROR_MESSAGES.locationState;
  }

  return errors;
};

export const validateEventDescription = (
  description: string
): string | null => {
  // Allow shorter descriptions for auto-generated content
  if (!description || description.trim().length < 10) {
    return ERROR_MESSAGES.eventDescription;
  }

  if (description.trim().length > 1000) {
    return ERROR_MESSAGES.eventDescriptionMax;
  }

  return null;
};

export const validateGuestClass = (guestClass: GuestClassData): FormErrors => {
  const errors: FormErrors = {};

  if (!guestClass.ageGroups || guestClass.ageGroups.length === 0) {
    errors.guestClassAgeGroups = ERROR_MESSAGES.guestClassAgeGroups;
  }

  if (!guestClass.formality) {
    errors.guestClassFormality = ERROR_MESSAGES.guestClassFormality;
  }

  if (!guestClass.socialStatus || guestClass.socialStatus.length === 0) {
    errors.guestClassSocialStatus = ERROR_MESSAGES.guestClassSocialStatus;
  }

  // Additional details is optional, but if provided, validate length
  if (
    guestClass.additionalDetails &&
    guestClass.additionalDetails.length > 500
  ) {
    errors.guestClassAdditionalDetails =
      "Additional details must not exceed 500 characters";
  }

  return errors;
};

export const validateBudget = (
  budget: BudgetData,
  eventType?: EventType
): FormErrors => {
  const errors: FormErrors = {};

  if (!budget.amount || budget.amount < 100) {
    errors.budgetAmount = ERROR_MESSAGES.budgetMin;
  }

  if (!budget.currency) {
    errors.budgetCurrency = ERROR_MESSAGES.budgetCurrency;
  }

  // Optional: Check minimum budget based on event type
  if (eventType && budget.amount) {
    const minimumBudgets: Record<EventType, number> = {
      [EventType.WEDDING]: 5000,
      [EventType.CORPORATE]: 3000,
      [EventType.BIRTHDAY]: 500,
      [EventType.GRADUATION]: 1000,
      [EventType.CONFERENCE]: 5000,
      [EventType.OTHER]: 500,
    };

    const minBudget = minimumBudgets[eventType];
    if (budget.amount < minBudget) {
      errors.budgetAmount = `For ${eventType} events, we recommend a minimum budget of $${minBudget.toLocaleString()}`;
    }
  }

  return errors;
};

// ============================================================================
// COMPREHENSIVE FORM VALIDATION
// ============================================================================

export const validateEventPlanForm = (
  formData: EventPlanFormData
): FormErrors => {
  const errors: FormErrors = {};

  // Validate event type
  const eventTypeError = validateEventType(formData.eventType);
  if (eventTypeError) {
    errors.eventType = eventTypeError;
  }

  // Validate event date
  const eventDateError = validateEventDate(formData.eventDate);
  if (eventDateError) {
    errors.eventDate = eventDateError;
  }

  // Validate guest count
  const guestCountError = validateGuestCount(formData.guestCount);
  if (guestCountError) {
    errors.guestCount = guestCountError;
  }

  // Validate location
  const locationErrors = validateLocation(formData.location);
  Object.assign(errors, locationErrors);

  // Validate event description (optional for enhanced form)
  if (formData.eventDescription) {
    const descriptionError = validateEventDescription(
      formData.eventDescription
    );
    if (descriptionError) {
      errors.eventDescription = descriptionError;
    }
  }

  // Skip guestClass validation for enhanced form - it's handled by guestProfile instead
  // Legacy guestClass validation is only needed for old form submissions

  // Validate budget
  const budgetErrors = validateBudget(formData.budget, formData.eventType);
  Object.assign(errors, budgetErrors);

  return errors;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors: FormErrors): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};

export const sanitizeText = (text: string): string => {
  // Remove HTML tags
  const cleaned = text.replace(/<[^>]*>/g, "");
  // Trim whitespace
  return cleaned.trim();
};

export const formatCurrency = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
