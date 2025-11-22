"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Facebook,
  Twitter,
  Phone,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Image from "next/image";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";
import { usePlan } from "@/contexts/PlanContext";
import PlanDetailsCard from "@/components/registration/PlanDetailsCard";
import PaymentModal from "@/components/subscription/PaymentModal";

interface PasswordRequirement {
  text: string;
  regex: RegExp;
  met: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { selectedPlan, getSelectedPlan, clearSelectedPlan } = usePlan();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    planId: "",
    planName: "",
    planType: "" as "vendor" | "event_planner" | "",
    amount: 0,
    currency: "NGN" as "NGN" | "USD",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<
    "flutterwave" | "paystack"
  >("flutterwave");
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [lastRegistrationData, setLastRegistrationData] = useState<any>(null);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { text: "At least 8 characters", regex: /.{8,}/, met: false },
    { text: "At least one uppercase letter", regex: /[A-Z]/, met: false },
    { text: "At least one lowercase letter", regex: /[a-z]/, met: false },
    { text: "At least one number", regex: /[0-9]/, met: false },
    {
      text: "At least one special character",
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      met: false,
    },
  ]);

  // Check for selected plan on component mount and populate formData
  useEffect(() => {
    const plan = getSelectedPlan();
    if (!plan) {
      // Handle expired or missing plan selection
      toast.info("Please select a plan to continue");
      router.push("/#pricing");
    } else {
      // Populate formData with plan details only if not already set
      setFormData((prev) => {
        // Only update if planId is empty or different to avoid infinite loop
        if (!prev.planId || prev.planId !== plan.planId) {
          return {
            ...prev,
            planId: plan.planId,
            planName: plan.planName,
            planType: plan.planType,
            amount: plan.amount,
            currency: plan.currency || "NGN",
          };
        }
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlan]); // Re-run when selectedPlan changes

  // Handle browser back button navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Check if plan is still valid when navigating back
      const plan = getSelectedPlan();
      if (!plan) {
        toast.info(
          "Your plan selection has expired. Please select a plan again."
        );
        router.push("/#pricing");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [getSelectedPlan, router]);

  useEffect(() => {
    if (formData.password) {
      const updatedRequirements = requirements.map((req) => ({
        ...req,
        met: req.regex.test(formData.password),
      }));
      setRequirements(updatedRequirements);

      const strength = updatedRequirements.filter((req) => req.met).length;
      setPasswordStrength(strength);
    } else {
      setRequirements(requirements.map((req) => ({ ...req, met: false })));
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const getStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
        return "bg-gray-200";
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
        return "No password";
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "No password";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate plan is still selected and not expired
    const currentPlan = getSelectedPlan();
    if (!currentPlan) {
      setError("Your plan selection has expired. Please select a plan again.");
      toast.error(
        "Your plan selection has expired. Please select a plan again."
      );
      setIsLoading(false);
      router.push("/#pricing");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    // Validate password strength
    if (passwordStrength < 4) {
      setError("Please choose a stronger password");
      toast.error("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    try {
      // Include plan data in registration payload
      // Convert amount to smallest unit (kobo for NGN, cents for USD)
      const amountInSmallestUnit = formData.amount * 100;

      const registrationPayload = {
        userName: formData.userName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        planId: formData.planId,
        planName: formData.planName,
        planType: formData.planType as "vendor" | "event_planner",
        amount: amountInSmallestUnit,
        currency: formData.currency,
      };

      // Store registration data for potential retry
      setLastRegistrationData(registrationPayload);
      setRegistrationAttempts((prev) => prev + 1);

      const response = await Auth.register(registrationPayload);
      console.log("Registration response: ", response);

      if (response.status === "success") {
        // Reset attempts on success
        setRegistrationAttempts(0);
        setLastRegistrationData(null);

        // Check if backend provided a payment URL (paid plan)
        if (response.data?.paymentUrl) {
          // Paid plan - redirect to Flutterwave payment page
          toast.success("Registration successful! Redirecting to payment...");

          // Store registration info for after payment
          localStorage.setItem(
            "pendingRegistration",
            JSON.stringify({
              email: formData.email,
              reference: response.data.reference,
              subscriptionId: response.data.subscriptionId,
            })
          );

          // Redirect to Flutterwave payment page
          window.location.href = response.data.paymentUrl;
        } else {
          // Free plan - redirect to email verification page
          toast.success(
            "Registration successful! Please check your email to verify your account."
          );
          router.push(
            `/register/success?email=${encodeURIComponent(formData.email)}`
          );
        }
      } else {
        const errorMessage = response.message || "Failed to create account";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      // Handle network errors with detailed messaging
      const isNetworkError =
        !err.response ||
        err.code === "ECONNABORTED" ||
        err.code === "ERR_NETWORK" ||
        err.message?.toLowerCase().includes("network");

      if (isNetworkError) {
        const errorMessage =
          "Network error. Please check your connection and try again.";
        setError(errorMessage);
        toast.error(errorMessage, {
          autoClose: 5000,
        });
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create account. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
      console.log("error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry registration with last data
  const handleRetryRegistration = async () => {
    if (!lastRegistrationData) {
      toast.error("No previous registration data found");
      return;
    }

    // Validate plan is still selected
    const currentPlan = getSelectedPlan();
    if (!currentPlan) {
      setError("Your plan selection has expired. Please select a plan again.");
      toast.error(
        "Your plan selection has expired. Please select a plan again."
      );
      router.push("/#pricing");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      setRegistrationAttempts((prev) => prev + 1);
      const response = await Auth.register(lastRegistrationData);

      if (response.status === "success") {
        // Reset attempts on success
        setRegistrationAttempts(0);
        setLastRegistrationData(null);

        // Check if plan is free (amount is 0)
        if (formData.amount === 0) {
          toast.success(
            "Registration successful! Please check your email to verify your account."
          );
          router.push(
            `/register/success?email=${encodeURIComponent(formData.email)}`
          );
        } else {
          toast.success(
            "Registration successful! Please complete payment to activate your subscription."
          );
          setShowPaymentModal(true);
        }
      } else {
        const errorMessage = response.message || "Failed to create account";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const isNetworkError =
        !err.response ||
        err.code === "ECONNABORTED" ||
        err.code === "ERR_NETWORK" ||
        err.message?.toLowerCase().includes("network");

      if (isNetworkError) {
        const errorMessage =
          "Network error. Please check your connection and try again.";
        setError(errorMessage);
        toast.error(errorMessage, {
          autoClose: 5000,
        });
      } else {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create account. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (
    provider: "google" | "facebook" | "twitter"
  ) => {
    setError(null);
    setIsLoading(true);

    try {
      switch (provider) {
        case "google":
          // Redirect to Google OAuth
          const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
          window.location.href = googleAuthUrl;
          return;

        case "facebook":
          // Redirect to Facebook OAuth
          const facebookAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
          window.location.href = facebookAuthUrl;
          return;

        case "twitter":
          // Redirect to Twitter OAuth
          const twitterAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/twitter`;
          window.location.href = twitterAuthUrl;
          return;
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to sign up with ${provider}`;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Close payment modal
    setShowPaymentModal(false);

    // Display success toast message
    toast.success(
      "Payment successful! Please check your email for verification."
    );

    // Clear selected plan from context
    clearSelectedPlan();

    // Redirect to success page with email parameter
    router.push(
      `/register/success?email=${encodeURIComponent(formData.email)}`
    );
  };

  const handlePaymentCancel = () => {
    // Keep payment modal open on failure
    // Error message is already displayed in the modal
    // User can retry payment without re-registering
    toast.info("You can retry payment when ready. Your registration is saved.");
  };

  const handlePaymentError = (error: string) => {
    // Display user-friendly error message for payment failures
    toast.error(
      error || "Payment failed. Please try again or contact support.",
      {
        autoClose: 7000,
      }
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        aria-label="Go back to home page"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        <span>Back to Home</span>
      </motion.button>

      {/* Left Side - Fixed Background Image with Overlay */}
      <div className="hidden lg:block lg:w-1/2 fixed inset-y-0 left-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            alt="Elegant event setup with purple lighting"
            fill
            sizes="50vw"
            className="object-cover"
            priority
            quality={100}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-purple-900/90" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Welcome to Confetti</h1>
            <p className="text-lg text-purple-100 mb-8">
              Join our community of event planners and start creating
              unforgettable experiences.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">1</span>
                </div>
                <span>Create your account</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">2</span>
                </div>
                <span>Set up your profile</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">3</span>
                </div>
                <span>Start planning events</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Scrollable Registration Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen overflow-y-auto bg-white">
        <div className="max-w-md w-full mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">
              Join Confetti and start planning your perfect event
            </p>
          </motion.div>

          {/* Social Authentication Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
            role="group"
            aria-label="Social authentication options"
          >
            <button
              onClick={() => handleSocialAuth("google")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Google"
            >
              <FcGoogle className="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              onClick={() => handleSocialAuth("facebook")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Facebook"
            >
              <Facebook className="w-6 h-6 text-[#1877F2]" aria-hidden="true" />
            </button>
            <button
              onClick={() => handleSocialAuth("twitter")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign up with Twitter"
            >
              <Twitter className="w-6 h-6 text-[#1DA1F2]" aria-hidden="true" />
            </button>
          </motion.div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6 bg-white p-8 relative"
          >
            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">
                      Creating your account...
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Please wait while we process your registration
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display selected plan details */}
            {selectedPlan && (
              <PlanDetailsCard
                planName={selectedPlan.planName}
                planType={selectedPlan.planType}
                amount={selectedPlan.amount}
                period={selectedPlan.period}
              />
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm overflow-hidden"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium mb-1">Registration Error</p>
                      <p>{error}</p>
                    </div>
                    {lastRegistrationData &&
                      error.toLowerCase().includes("network") && (
                        <button
                          onClick={handleRetryRegistration}
                          disabled={isLoading}
                          className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          aria-label="Retry registration"
                        >
                          Retry
                        </button>
                      )}
                  </div>
                  {registrationAttempts > 1 && (
                    <p className="mt-2 text-xs text-red-500">
                      Attempt {registrationAttempts}. If the problem persists,
                      please contact support.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Name(Optional)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="John Doe"
                    aria-label="User name (optional)"
                    aria-required="false"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address(Required)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="you@example.com"
                    aria-label="Email address (required)"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number(Required)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    disabled={isLoading}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="+1 (555) 000-0000"
                    aria-label="Phone number (required)"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password(Required)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="••••••••"
                    aria-label="Password (required)"
                    aria-required="true"
                    aria-describedby="password-strength password-requirements"
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-5 w-5 text-gray-400 hover:text-gray-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 text-gray-400 hover:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {/* Password Strength Bar */}
                  <div
                    className="h-2 w-full bg-gray-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={passwordStrength}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label="Password strength indicator"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(
                        passwordStrength
                      )}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <p
                    id="password-strength"
                    className="text-sm text-gray-600"
                    role="status"
                    aria-live="polite"
                  >
                    Password Strength:{" "}
                    <span className="font-medium">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </p>
                  {/* Password Requirements */}
                  <AnimatePresence>
                    {passwordStrength < 5 && (
                      <motion.div
                        id="password-requirements"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                        role="list"
                        aria-label="Password requirements"
                      >
                        {requirements.map((requirement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="flex items-center text-sm"
                            role="listitem"
                          >
                            {requirement.met ? (
                              <Check
                                className="w-4 h-4 text-green-500 mr-2"
                                aria-hidden="true"
                              />
                            ) : (
                              <X
                                className="w-4 h-4 text-red-500 mr-2"
                                aria-hidden="true"
                              />
                            )}
                            <span
                              className={
                                requirement.met
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                              aria-label={`${requirement.text}: ${
                                requirement.met ? "met" : "not met"
                              }`}
                            >
                              {requirement.text}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={isLoading}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="••••••••"
                    aria-label="Confirm password (required)"
                    aria-required="true"
                    aria-describedby="password-match-status"
                  />
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:cursor-not-allowed"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        className="h-5 w-5 text-gray-400 hover:text-gray-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-5 w-5 text-gray-400 hover:text-gray-500"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <motion.p
                    id="password-match-status"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-1 text-sm ${
                      formData.password === formData.confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {formData.password === formData.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </motion.p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      disabled={isLoading}
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-medium text-gray-700"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-purple-600 hover:text-purple-500"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-purple-600 hover:text-purple-500"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                    <p className="text-gray-500 mt-1">
                      By creating an account, you agree to our terms and
                      conditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !acceptedTerms}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Create account"
                aria-busy={isLoading}
                aria-disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      aria-hidden="true"
                    />
                    <span role="status">Creating account...</span>
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
              {!acceptedTerms && (
                <p
                  className="mt-2 text-sm text-red-600 text-center"
                  role="alert"
                  aria-live="polite"
                >
                  Please accept the terms and conditions to continue
                </p>
              )}
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{" "}
              <Link
                href="/sign-in"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Sign in
              </Link>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Payment Modal for paid plans */}
      {selectedPlan && formData.amount > 0 && showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={{
            id: formData.planId,
            name: formData.planName,
            price: formData.amount,
            period: selectedPlan.period,
          }}
          paymentProvider={paymentProvider}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
}
