import { Check } from "lucide-react";
import { FormStep } from "@/types/ai-planner";

interface FormProgressProps {
  currentStep: FormStep;
  completedSteps: FormStep[];
  onStepClick?: (step: FormStep) => void;
}

const steps = [
  {
    number: 1 as FormStep,
    title: "Basic Info",
    description: "Event fundamentals",
  },
  {
    number: 2 as FormStep,
    title: "Timing",
    description: "Duration & schedule",
  },
  {
    number: 3 as FormStep,
    title: "Venue",
    description: "Location preferences",
  },
  {
    number: 4 as FormStep,
    title: "Budget",
    description: "Financial planning",
  },
  {
    number: 5 as FormStep,
    title: "Guests",
    description: "Guest requirements",
  },
  {
    number: 6 as FormStep,
    title: "Style",
    description: "Your preferences",
  },
  {
    number: 7 as FormStep,
    title: "Details",
    description: "Event specifics",
  },
  {
    number: 8 as FormStep,
    title: "Final",
    description: "Special requirements",
  },
];

export default function FormProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: FormProgressProps) {
  const isStepCompleted = (step: FormStep) => completedSteps.includes(step);
  const isStepCurrent = (step: FormStep) => currentStep === step;
  const isStepClickable = (step: FormStep) =>
    isStepCompleted(step) || step < currentStep;

  return (
    <div className="w-full">
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of 8
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / 8) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {steps[currentStep - 1].title}: {steps[currentStep - 1].description}
        </p>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const completed = isStepCompleted(step.number);
            const current = isStepCurrent(step.number);
            const clickable = isStepClickable(step.number);

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => clickable && onStepClick?.(step.number)}
                  disabled={!clickable}
                  className={`relative flex flex-col items-center ${
                    clickable ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      completed
                        ? "bg-green-500 text-white"
                        : current
                        ? "bg-purple-600 text-white ring-4 ring-purple-100"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completed ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        current
                          ? "text-purple-600"
                          : completed
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-4 relative"
                    style={{ top: "-20px" }}
                  >
                    <div
                      className={`h-full rounded transition-all ${
                        isStepCompleted(steps[index + 1].number) ||
                        currentStep > step.number
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
