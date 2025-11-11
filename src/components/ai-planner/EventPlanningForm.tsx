import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
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
    e.preventDefault();
    await submitForm(onSubmit);
  };

  const handleNext = () => {
    nextStep();
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
    <form onSubmit={handleSubmit} className="space-y-8">
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
            {/* Step 1: Event Basics */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Event Basics
                  </h2>
                  <p className="text-gray-600">
                    Let's start with the fundamental details of your event
                  </p>
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
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Event Location
                  </h2>
                  <p className="text-gray-600">
                    Where will your event take place?
                  </p>
                </div>

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

            {/* Step 3: Event Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Event Details
                  </h2>
                  <p className="text-gray-600">
                    Tell us more about your event and guests
                  </p>
                </div>

                <EventDescriptionTextarea
                  value={formData.eventDescription}
                  onChange={(value) =>
                    updateFormData({ eventDescription: value })
                  }
                  error={errors.eventDescription}
                />

                <GuestClassForm
                  value={formData.guestClass}
                  onChange={updateGuestClass}
                  errors={{
                    guestClassAgeGroups: errors.guestClassAgeGroups,
                    guestClassFormality: errors.guestClassFormality,
                    guestClassSocialStatus: errors.guestClassSocialStatus,
                    guestClassAdditionalDetails:
                      errors.guestClassAdditionalDetails,
                  }}
                />
              </div>
            )}

            {/* Step 4: Budget */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Budget
                  </h2>
                  <p className="text-gray-600">
                    What's your total budget for this event?
                  </p>
                </div>

                <BudgetInput
                  amount={formData.budget.amount}
                  currency={formData.budget.currency}
                  onAmountChange={(amount) => updateBudget({ amount })}
                  onCurrencyChange={(currency) => updateBudget({ currency })}
                  error={errors.budgetAmount}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>What happens next?</strong> Our AI will analyze
                    your requirements and create a personalized event plan with
                    budget breakdown, vendor recommendations, and timeline.
                  </p>
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

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
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
                Get AI Event Plan
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
