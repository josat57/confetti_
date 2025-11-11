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
    country: "USA",
  },
  eventDescription: "",
  guestClass: {
    ageGroups: [],
    formality: "" as FormalityLevel,
    socialStatus: [],
    specialRequirements: [],
    additionalDetails: "",
  },
  budget: {
    amount: 0,
    currency: Currency.USD,
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
        case 1: // Event Basics
          if (!formData.eventType) {
            stepErrors.eventType = "Please select an event type";
          }
          if (!formData.eventDate || formData.eventDate < new Date()) {
            stepErrors.eventDate = "Please select a future date";
          }
          if (!formData.guestCount || formData.guestCount < 1) {
            stepErrors.guestCount = "Please enter number of guests";
          }
          break;

        case 2: // Location
          if (!formData.location.address) {
            stepErrors.locationAddress = "Address is required";
          }
          if (!formData.location.city) {
            stepErrors.locationCity = "City is required";
          }
          if (!formData.location.state) {
            stepErrors.locationState = "State is required";
          }
          break;

        case 3: // Event Details
          if (
            !formData.eventDescription ||
            formData.eventDescription.length < 50
          ) {
            stepErrors.eventDescription =
              "Please provide at least 50 characters";
          }
          if (formData.guestClass.ageGroups.length === 0) {
            stepErrors.guestClassAgeGroups =
              "Please select at least one age group";
          }
          if (!formData.guestClass.formality) {
            stepErrors.guestClassFormality = "Please select formality level";
          }
          if (formData.guestClass.socialStatus.length === 0) {
            stepErrors.guestClassSocialStatus =
              "Please select at least one option";
          }
          break;

        case 4: // Budget
          if (!formData.budget.amount || formData.budget.amount < 100) {
            stepErrors.budgetAmount = "Minimum budget is $100";
          }
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
    if (!validateStep(currentStep)) {
      return false;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as FormStep);
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
      // Validate all steps
      const allErrors = validateEventPlanForm(formData);

      if (hasErrors(allErrors)) {
        setErrors(allErrors);
        // Go to first step with errors
        for (let step = 1; step <= 4; step++) {
          if (!validateStep(step as FormStep)) {
            setCurrentStep(step as FormStep);
            break;
          }
        }
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
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
