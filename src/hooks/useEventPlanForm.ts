import { useState, useCallback } from "react";
import {
  EventPlanFormData,
  EventType,
  LocationData,
  GuestClassData,
  BudgetData,
  Currency,
  FormStep,
  AgeGroup,
  FormalityLevel,
  SocialStatus,
} from "@/types/ai-planner";
import { validateEventPlanForm, hasErrors } from "@/lib/utils/formValidation";
import { useFormValidation } from "./useFormValidation";

const initialFormData: EventPlanFormData = {
  eventType: "" as EventType,
  eventDate: new Date(),
  guestCount: 0,
  location: {
    method: "manual",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  },
  budget: {
    amount: 0,
    currency: Currency.NGN,
  },
  // Optional enhanced fields
  eventDuration: undefined,
  venuePreferences: undefined,
  budgetBreakdown: undefined,
  guestProfile: undefined,
  clientProfile: undefined,
  eventSpecific: undefined,
  specialRequirements: undefined,
  // Legacy fields for backward compatibility
  eventDescription: "",
  guestClass: {
    ageGroups: [],
    formality: "" as FormalityLevel,
    socialStatus: [],
    specialRequirements: [],
    additionalDetails: "",
  },
};

interface UseEventPlanFormReturn {
  formData: EventPlanFormData;
  currentStep: FormStep;
  completedSteps: FormStep[];
  errors: Record<string, string>;
  isSubmitting: boolean;
  updateFormData: (data: Partial<EventPlanFormData>) => void;
  updateLocation: (location: LocationData) => void;
  updateGuestClass: (guestClass: GuestClassData) => void;
  updateBudget: (budget: Partial<BudgetData>) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: FormStep) => void;
  submitForm: (
    onSubmit: (data: EventPlanFormData) => Promise<void>
  ) => Promise<void>;
  validateCurrentStep: () => boolean;
}

export const useEventPlanForm = (
  initialData?: Partial<EventPlanFormData>
): UseEventPlanFormReturn => {
  const [formData, setFormData] = useState<EventPlanFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, setErrors, clearAllErrors } = useFormValidation();

  const updateFormData = useCallback((data: Partial<EventPlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const updateLocation = useCallback((location: LocationData) => {
    setFormData((prev) => ({ ...prev, location }));
  }, []);

  const updateGuestClass = useCallback((guestClass: GuestClassData) => {
    setFormData((prev) => ({ ...prev, guestClass }));
  }, []);

  const updateBudget = useCallback((budget: Partial<BudgetData>) => {
    setFormData((prev) => ({
      ...prev,
      budget: { ...prev.budget, ...budget },
    }));
  }, []);

  const validateStep = useCallback(
    (step: FormStep): boolean => {
      clearAllErrors();
      const stepErrors: Record<string, string> = {};

      switch (step) {
        case 1: // Basic Information
          if (!formData.eventType) {
            stepErrors.eventType = "Please select an event type";
          }
          if (!formData.eventDate) {
            stepErrors.eventDate = "Please select an event date";
          } else {
            // Allow past dates for testing, but warn about future dates in production
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDate = new Date(formData.eventDate);
            eventDate.setHours(0, 0, 0, 0);

            if (eventDate < today) {
              stepErrors.eventDate = "Please select a future date";
            }
          }
          if (!formData.guestCount || formData.guestCount < 1) {
            stepErrors.guestCount = "Please enter number of guests";
          }
          if (!formData.budget.amount || formData.budget.amount < 100) {
            stepErrors.budgetAmount = "Minimum budget is ₦100";
          }
          if (!formData.location.city) {
            stepErrors.locationCity = "City is required";
          }
          break;

        case 2: // Event Duration & Timing
          // Optional validation - these fields enhance the plan but aren't required
          break;

        case 3: // Venue Preferences
          // Optional validation
          break;

        case 4: // Budget Breakdown & Priorities
          // Optional validation
          break;

        case 5: // Guest Profile & Requirements
          // Optional validation
          break;

        case 6: // Client Profile & Preferences
          // Optional validation
          break;

        case 7: // Event-Specific Requirements
          // Optional validation
          break;

        case 8: // Special Requirements & Notes
          // Optional validation - this is the final step
          break;
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return false;
      }

      return true;
    },
    [formData, clearAllErrors, setErrors]
  );

  const validateCurrentStep = useCallback((): boolean => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  const nextStep = useCallback((): boolean => {
    console.log("nextStep called, currentStep:", currentStep);

    if (!validateStep(currentStep)) {
      console.log("Step validation failed for step:", currentStep);
      return false;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentStep < 8) {
      console.log("Moving from step", currentStep, "to step", currentStep + 1);
      setCurrentStep((currentStep + 1) as FormStep);
    } else {
      console.log("Already on final step (8), not advancing");
    }

    return true;
  }, [currentStep, completedSteps, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as FormStep);
      clearAllErrors();
    }
  }, [currentStep, clearAllErrors]);

  const goToStep = useCallback(
    (step: FormStep) => {
      // Only allow going to completed steps or the next step
      if (completedSteps.includes(step) || step === currentStep) {
        setCurrentStep(step);
        clearAllErrors();
      }
    },
    [completedSteps, currentStep, clearAllErrors]
  );

  const submitForm = useCallback(
    async (onSubmit: (data: EventPlanFormData) => Promise<void>) => {
      console.log("submitForm called with formData:", formData);

      // Ensure legacy fields are populated for backward compatibility
      const enhancedFormData: EventPlanFormData = {
        ...formData,
        // Generate eventDescription from enhanced data if not provided
        eventDescription:
          formData.eventDescription ||
          `Planning a ${formData.eventType} event for ${
            formData.guestCount
          } guests in ${formData.location.city}, ${
            formData.location.state
          }. This event will be held on ${formData.eventDate.toDateString()} with a budget of ${
            formData.budget.currency
          } ${formData.budget.amount.toLocaleString()}. Looking for comprehensive planning assistance including venue, catering, entertainment, and all necessary services to make this event memorable and successful.`,
        // Provide minimal guestClass for backward compatibility (not validated)
        guestClass: {
          ageGroups: [AgeGroup.ADULTS],
          formality: "casual" as FormalityLevel,
          socialStatus: [SocialStatus.MIDDLE_CLASS],
          specialRequirements: [],
          additionalDetails: "Auto-generated from enhanced form data",
        },
      };

      console.log("Enhanced form data:", enhancedFormData);

      // Validate all steps
      const allErrors = validateEventPlanForm(enhancedFormData);
      console.log("Validation errors:", allErrors);

      if (hasErrors(allErrors)) {
        console.log("Form has validation errors, not submitting");
        setErrors(allErrors);
        // Go to first step with errors
        for (let step = 1; step <= 8; step++) {
          if (!validateStep(step as FormStep)) {
            console.log("Going to step with errors:", step);
            setCurrentStep(step as FormStep);
            break;
          }
        }
        return;
      }

      console.log("Form validation passed, submitting...");
      setIsSubmitting(true);
      try {
        await onSubmit(enhancedFormData);
        console.log("Form submission completed successfully");
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, setErrors, validateStep]
  );

  return {
    formData,
    currentStep,
    completedSteps,
    errors,
    isSubmitting,
    updateFormData,
    updateLocation,
    updateGuestClass,
    updateBudget,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    validateCurrentStep,
  };
};
