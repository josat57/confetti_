import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  DollarSign,
  Users,
  User,
  Star,
  Settings,
} from "lucide-react";
import { EventPlanFormData } from "@/types/ai-planner";
import { useEventPlanForm } from "@/hooks/useEventPlanForm";
import FormProgress from "./FormProgress";
import EventTypeSelect from "./EventTypeSelect";
import EventDatePicker from "./EventDatePicker";
import GuestCountInput from "./GuestCountInput";
import LocationStep from "./LocationStep";
import EventDescriptionTextarea from "./EventDescriptionTextarea";
import GuestClassForm from "./GuestClassForm";
import BudgetInput from "./BudgetInput";
// New step components
import EventDurationStep from "./steps/EventDurationStep";
import VenuePreferencesStep from "./steps/VenuePreferencesStep";
import BudgetBreakdownStep from "./steps/BudgetBreakdownStep";
import GuestProfileStep from "./steps/GuestProfileStep";
import ClientProfileStep from "./steps/ClientProfileStep";
import EventSpecificStep from "./steps/EventSpecificStep";
import SpecialRequirementsStep from "./steps/SpecialRequirementsStep";

interface EventPlanningFormProps {
  onSubmit: (data: EventPlanFormData) => Promise<void>;
  initialData?: Partial<EventPlanFormData>;
}

export default function EventPlanningForm({
  onSubmit,
  initialData,
}: EventPlanningFormProps) {
  const {
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
  } = useEventPlanForm(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form handleSubmit called on step:", currentStep, e);
    e.preventDefault();

    if (currentStep !== 8) {
      console.error(
        "Form submitted on wrong step! Current step:",
        currentStep,
        "Expected: 8"
      );
      return;
    }

    console.log("Calling submitForm...");
    try {
      await submitForm(onSubmit);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleNext = () => {
    console.log("handleNext called, currentStep:", currentStep);
    const success = nextStep();
    console.log(
      "nextStep returned:",
      success,
      "new currentStep should be:",
      currentStep + 1
    );
  };

  const handleBack = () => {
    prevStep();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && currentStep < 8) {
          console.log(
            "Enter pressed on step",
            currentStep,
            "preventing form submission"
          );
          e.preventDefault();
          handleNext();
        }
      }}
      className="space-y-8"
    >
      {/* Progress Indicator */}
      <FormProgress
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Form Steps */}
      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[600px]">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Basic Information
                    </h2>
                    <p className="text-gray-600">
                      Let's start with the fundamental details of your event
                    </p>
                  </div>
                </div>

                <EventTypeSelect
                  value={formData.eventType}
                  onChange={(value) => updateFormData({ eventType: value })}
                  error={errors.eventType}
                />

                <EventDatePicker
                  value={formData.eventDate}
                  onChange={(value) => updateFormData({ eventDate: value })}
                  error={errors.eventDate}
                />

                <GuestCountInput
                  value={formData.guestCount}
                  onChange={(value) => updateFormData({ guestCount: value })}
                  error={errors.guestCount}
                />

                <BudgetInput
                  amount={formData.budget.amount}
                  currency={formData.budget.currency}
                  onAmountChange={(amount) => updateBudget({ amount })}
                  onCurrencyChange={(currency) => updateBudget({ currency })}
                  error={errors.budgetAmount}
                />

                <LocationStep
                  location={formData.location}
                  onChange={updateLocation}
                  errors={{
                    locationAddress: errors.locationAddress,
                    locationCity: errors.locationCity,
                    locationState: errors.locationState,
                  }}
                />
              </div>
            )}

            {/* Step 2: Event Duration & Timing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Event Duration & Timing
                    </h2>
                    <p className="text-gray-600">
                      When will your event start and end?
                    </p>
                  </div>
                </div>

                <EventDurationStep
                  value={formData.eventDuration}
                  onChange={(value) => updateFormData({ eventDuration: value })}
                  eventType={formData.eventType}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 3: Venue Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Venue Preferences
                    </h2>
                    <p className="text-gray-600">
                      What type of venue are you looking for?
                    </p>
                  </div>
                </div>

                <VenuePreferencesStep
                  value={formData.venuePreferences}
                  onChange={(value) =>
                    updateFormData({ venuePreferences: value })
                  }
                  guestCount={formData.guestCount}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 4: Budget Breakdown & Priorities */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Budget Breakdown & Priorities
                    </h2>
                    <p className="text-gray-600">
                      How would you like to allocate your budget?
                    </p>
                  </div>
                </div>

                <BudgetBreakdownStep
                  value={formData.budgetBreakdown}
                  onChange={(value) =>
                    updateFormData({ budgetBreakdown: value })
                  }
                  totalBudget={formData.budget.amount}
                  eventType={formData.eventType}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 5: Guest Profile & Requirements */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Guest Profile & Requirements
                    </h2>
                    <p className="text-gray-600">
                      Tell us about your guests and their needs
                    </p>
                  </div>
                </div>

                <GuestProfileStep
                  value={formData.guestProfile}
                  onChange={(value) => updateFormData({ guestProfile: value })}
                  totalGuests={formData.guestCount}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 6: Client Profile & Preferences */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Your Profile & Preferences
                    </h2>
                    <p className="text-gray-600">
                      Help us understand your style and preferences
                    </p>
                  </div>
                </div>

                <ClientProfileStep
                  value={formData.clientProfile}
                  onChange={(value) => updateFormData({ clientProfile: value })}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 7: Event-Specific Requirements */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Event-Specific Details
                    </h2>
                    <p className="text-gray-600">
                      Special requirements for your {formData.eventType} event
                    </p>
                  </div>
                </div>

                <EventSpecificStep
                  value={formData.eventSpecific}
                  onChange={(value) => updateFormData({ eventSpecific: value })}
                  eventType={formData.eventType}
                  errors={errors}
                />
              </div>
            )}

            {/* Step 8: Special Requirements & Notes */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Special Requirements & Notes
                    </h2>
                    <p className="text-gray-600">
                      Any additional requirements or special considerations?
                    </p>
                  </div>
                </div>

                <SpecialRequirementsStep
                  value={formData.specialRequirements}
                  onChange={(value) =>
                    updateFormData({ specialRequirements: value })
                  }
                  errors={errors}
                />

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">
                        Ready to Generate Your AI Event Plan!
                      </h3>
                      <p className="text-sm text-purple-800 mb-3">
                        Our AI will analyze all your requirements and create a
                        comprehensive event plan with:
                      </p>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Detailed budget breakdown and optimization</li>
                        <li>• Personalized vendor recommendations</li>
                        <li>• Complete event timeline and milestones</li>
                        <li>• Cultural and dietary considerations</li>
                        <li>• Risk analysis and contingency planning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {currentStep < 8 ? (
          <button
            type="button"
            onClick={(e) => {
              console.log("Next button clicked on step:", currentStep);
              e.preventDefault(); // Ensure no form submission
              handleNext();
            }}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              console.log("Submit button clicked!", e);
              // Don't prevent default - let form submission handle it
            }}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Plan
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
