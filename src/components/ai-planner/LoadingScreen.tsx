import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Search,
  Calculator,
  Users,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingScreenProps } from "@/types/ai-planner";

const loadingSteps = [
  { progress: 0, message: "Analyzing your event requirements...", icon: Brain },
  {
    progress: 20,
    message: "Searching vendor database in your area...",
    icon: Search,
  },
  {
    progress: 40,
    message: "Calculating optimal budget allocation...",
    icon: Calculator,
  },
  {
    progress: 60,
    message: "Matching vendors to your preferences...",
    icon: Users,
  },
  {
    progress: 80,
    message: "Generating your personalized event plan...",
    icon: Calendar,
  },
  { progress: 100, message: "Your event plan is ready!", icon: Sparkles },
];

export default function LoadingScreen({
  progress,
  currentStep,
}: LoadingScreenProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const currentStepData =
    loadingSteps.find((step) => step.progress <= progress) || loadingSteps[0];
  const Icon = currentStepData.icon;

  useEffect(() => {
    // Smooth progress animation
    const interval = setInterval(() => {
      setDisplayedProgress((prev) => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* AI Animation */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Floating Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.sin(i) * 20, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${i * 60}deg) translateX(60px)`,
                }}
              />
            ))}
          </div>

          {/* Status Message */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStepData.message}
            </h2>
            <p className="text-gray-600">
              Please wait while our AI creates your perfect event plan
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayedProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{displayedProgress}% Complete</span>
              <span>{displayedProgress < 100 ? "Processing..." : "Done!"}</span>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {loadingSteps.slice(0, -1).map((step, index) => {
              const StepIcon = step.icon;
              const isComplete = progress >= step.progress;
              const isCurrent = currentStepData.progress === step.progress;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isComplete
                      ? "border-green-500 bg-green-50"
                      : isCurrent
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <StepIcon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      isComplete
                        ? "text-green-600"
                        : isCurrent
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p className="text-xs text-gray-600 text-center">
                    {step.message.split("...")[0]}
                  </p>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-center mt-1"
                    >
                      <span className="text-green-600">✓</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-purple-100"
          >
            <p className="text-sm text-gray-600">
              💡 <strong>Did you know?</strong> Our AI analyzes thousands of
              vendor options to find the perfect match for your event!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
