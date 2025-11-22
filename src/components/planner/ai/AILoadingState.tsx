"use client";

import { Brain, Sparkles, Zap, Target } from "lucide-react";

type LoadingStage = "analyzing" | "generating" | "optimizing" | "finalizing";

interface AILoadingStateProps {
  stage: LoadingStage;
}

export default function AILoadingState({ stage }: AILoadingStateProps) {
  const stages = {
    analyzing: {
      icon: Brain,
      title: "Analyzing Your Requirements",
      description: "Our AI is processing your event details and preferences",
      progress: 25,
      messages: [
        "Understanding event type and requirements...",
        "Analyzing budget constraints...",
        "Evaluating location and venue options...",
      ],
    },
    generating: {
      icon: Sparkles,
      title: "Generating Event Plan",
      description:
        "Creating a customized timeline and task list for your event",
      progress: 50,
      messages: [
        "Building event timeline...",
        "Creating task checklist...",
        "Identifying key milestones...",
      ],
    },
    optimizing: {
      icon: Zap,
      title: "Optimizing Budget & Vendors",
      description:
        "Finding the best vendors and optimizing your budget allocation",
      progress: 75,
      messages: [
        "Analyzing vendor prices...",
        "Optimizing budget allocation...",
        "Matching vendors to requirements...",
      ],
    },
    finalizing: {
      icon: Target,
      title: "Finalizing Your Plan",
      description:
        "Putting the finishing touches on your personalized event plan",
      progress: 95,
      messages: [
        "Generating recommendations...",
        "Preparing final report...",
        "Almost ready...",
      ],
    },
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto animate-ping opacity-20" />
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {currentStage.title}
        </h3>
        <p className="text-gray-600 mb-6">{currentStage.description}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {currentStage.progress}% complete
        </p>

        {/* Progress Messages */}
        <div className="space-y-2 mb-6">
          {currentStage.messages.map((message, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 text-sm text-gray-600"
              style={{
                animation: `fadeIn 0.5s ease-in ${index * 0.2}s both`,
              }}
            >
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              {message}
            </div>
          ))}
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
