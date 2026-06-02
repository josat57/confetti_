"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, User, Shield } from "lucide-react";
import { EventPlanFormData } from "@/types/ai-planner";
import EventPlanningForm from "@/components/ai-planner/EventPlanningForm";
import LoadingScreen from "@/components/ai-planner/LoadingScreen";
import GuestSessionBanner from "@/components/guest-session/GuestSessionBanner";
import GuestSessionManager from "@/components/guest-session/GuestSessionManager";
import { analyzeEvent } from "@/lib/api/ai-planner";
import { guestSessionService } from "@/services/guest-session.service";
import { toast } from "react-toastify";

export default function PlanEventPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGuestManager, setShowGuestManager] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("user");
      setIsAuthenticated(!!authToken);

      // Show guest manager if user has guest session but is not authenticated
      if (!authToken) {
        try {
          const hasGuestSession = guestSessionService.hasGuestSession();
          setShowGuestManager(hasGuestSession);
        } catch (error) {
          console.error("Error checking guest session:", error);
          setShowGuestManager(false);
        }
      }
    }
  }, []);

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
    console.log("Form submission started with data:", formData);
    console.log("Form data validation:", {
      eventType: formData.eventType,
      eventDate: formData.eventDate,
      guestCount: formData.guestCount,
      location: formData.location,
      budget: formData.budget,
    });

    setIsAnalyzing(true);
    setProgress(0);
    simulateProgress();

    try {
      console.log("Calling analyzeEvent API...");
      console.log("About to call analyzeEvent with formData:", formData);
      const result = await analyzeEvent(formData);
      console.log("API response received:", result);

      // Store session token (works for both authenticated and guest users)
      const sessionToken = result.sessionToken;
      if (!sessionToken) {
        throw new Error("No session token received from API");
      }

      localStorage.setItem("eventPlanSessionToken", sessionToken);

      // Show success message based on user type
      if (!isAuthenticated) {
        toast.success(
          "🎉 Your AI event plan is ready! Sign up to save it permanently."
        );
        setShowGuestManager(true);
      } else {
        toast.success("AI event plan generated successfully!");
      }

      // Navigate to result page
      setTimeout(() => {
        router.push(`/ai-event-planner/result/${sessionToken}`);
      }, 8000); // Wait for animation to complete
    } catch (error: any) {
      setIsAnalyzing(false);
      console.error("Error analyzing event:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Handle CORS errors specifically
      if (error.message?.includes("CORS") || error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the AI service. Please check if the backend server is running and CORS is configured properly."
        );
        return;
      }

      if (error.message.includes("budget")) {
        toast.error(
          "Budget is too low for this event type. Please increase your budget."
        );
      } else if (error.message.includes("location")) {
        toast.error(
          "Limited vendor data for this location. We'll notify you when we expand to your area."
        );
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message ||
            "Invalid form data. Please check your inputs."
        );
      } else if (error.response?.status === 429) {
        toast.error(
          "Too many requests. Please wait a moment before trying again."
        );
      } else {
        toast.error(
          error.message || "Failed to generate event plan. Please try again."
        );
      }
    }
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handlePlanClick = (sessionToken: string) => {
    router.push(`/ai-event-planner/result/${sessionToken}`);
  };

  if (isAnalyzing) {
    return <LoadingScreen progress={progress} currentStep={currentStep} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Guest Session Banner */}
      {!isAuthenticated && (
        <GuestSessionBanner
          onSignUpClick={handleSignUp}
          onSignInClick={handleSignIn}
        />
      )}

      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        style={{
          top: !isAuthenticated ? "5rem" : "1.5rem",
        }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </motion.button>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
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
                Tell us about your event and our AI will create a personalized
                plan with budget breakdown, vendor recommendations, and
                timeline.
              </p>

              {/* Benefits */}
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

              {/* Guest User Benefits */}
              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Guest Mode Active
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    You can create and view plans without signing up!
                    <button
                      onClick={handleSignUp}
                      className="ml-1 underline hover:no-underline font-medium"
                    >
                      Create an account
                    </button>{" "}
                    to save plans permanently and unlock premium features.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <EventPlanningForm onSubmit={handleSubmit} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Guest Session Manager */}
              {!isAuthenticated && showGuestManager && (
                <GuestSessionManager
                  onPlanClick={handlePlanClick}
                  onSignUpClick={handleSignUp}
                />
              )}

              {/* Trust Indicators */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4 text-center">
                  Trusted by Event Planners
                </h3>
                <div className="grid grid-cols-1 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      10,000+
                    </p>
                    <p className="text-xs text-gray-600">Events Planned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">5,000+</p>
                    <p className="text-xs text-gray-600">Happy Clients</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">1,000+</p>
                    <p className="text-xs text-gray-600">Verified Vendors</p>
                  </div>
                </div>
              </motion.div>

              {/* Security Badge */}
              {!isAuthenticated && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      Secure & Private
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Your data is encrypted and secure. Guest sessions expire in
                    7 days for your privacy.
                  </p>
                  <button
                    onClick={handleSignUp}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Create Permanent Account
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
