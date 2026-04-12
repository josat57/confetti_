"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { EventPlanFormData } from "@/types/ai-planner";
import EventPlanningForm from "@/components/ai-planner/EventPlanningForm";
import LoadingScreen from "@/components/ai-planner/LoadingScreen";
import { analyzeEvent } from "@/lib/api/ai-planner";
import { toast } from "react-toastify";

export default function AIEventPlannerPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");

  const simulateProgress = () => {
    const steps = [
      {
        progress: 0,
        message: "Analyzing your event requirements...",
        delay: 0,
      },
      {
        progress: 20,
        message: "Searching vendor database in your area...",
        delay: 1500,
      },
      {
        progress: 40,
        message: "Calculating optimal budget allocation...",
        delay: 3000,
      },
      {
        progress: 60,
        message: "Matching vendors to your preferences...",
        delay: 4500,
      },
      {
        progress: 80,
        message: "Generating your personalized event plan...",
        delay: 6000,
      },
      { progress: 100, message: "Your event plan is ready!", delay: 7500 },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setProgress(step.progress);
        setCurrentStep(step.message);
      }, step.delay);
    });
  };

  const handleSubmit = async (formData: EventPlanFormData) => {
    setIsAnalyzing(true);
    setProgress(0);
    simulateProgress();

    try {
      const result = await analyzeEvent(formData);

      // Debug: Log the full response to see what we're getting
      console.log("AI Planner API Response:", result);

      // Based on the implementation guide, the session token should be at the top level
      const sessionToken = result.sessionToken;

      if (!sessionToken) {
        console.error("No session token found in response:", result);
        console.error("Available keys:", Object.keys(result));
        console.error(
          "EventPlan keys:",
          result.eventPlan ? Object.keys(result.eventPlan) : "No eventPlan"
        );
        throw new Error("Invalid response: missing session token");
      }

      console.log("Using session token:", sessionToken);

      // Store session token
      localStorage.setItem("eventPlanSessionToken", sessionToken);

      // Navigate to result page
      setTimeout(() => {
        router.push(`/ai-event-planner/result/${sessionToken}`);
      }, 8000); // Wait for animation to complete
    } catch (error: any) {
      setIsAnalyzing(false);
      console.error("Error analyzing event:", error);

      // Show detailed error message
      let errorMessage = "Failed to generate event plan. Please try again.";

      if (error.code === "NETWORK_ERROR") {
        errorMessage =
          "Cannot connect to server. Please check if the backend is running.";
      } else if (error.code === "INSUFFICIENT_BUDGET") {
        errorMessage = `Budget too low. Minimum: ${
          error.data?.minimumBudget || "N/A"
        }`;
      } else if (error.code === "VALIDATION_ERROR") {
        errorMessage = `Validation error: ${error.message}`;
      } else if (error.code === "RATE_LIMIT_EXCEEDED") {
        errorMessage = `Rate limit exceeded. Try again in ${
          error.data?.retryAfterMinutes || 60
        } minutes.`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        autoClose: 5000,
        position: "top-center",
      });
    }
  };

  if (isAnalyzing) {
    return <LoadingScreen progress={progress} currentStep={currentStep} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </motion.button>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 pt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Event Planning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Event with AI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your event and our AI will create a personalized plan
            with budget breakdown, vendor recommendations, and timeline.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Instant results</span>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <EventPlanningForm onSubmit={handleSubmit} />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 mb-4">
            Trusted by thousands of event planners
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">10,000+</p>
              <p className="text-xs">Events Planned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">5,000+</p>
              <p className="text-xs">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">1,000+</p>
              <p className="text-xs">Vendors</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
