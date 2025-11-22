"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, CreditCard } from "lucide-react";
import { toast } from "react-toastify";
import { settingsService } from "@/services/settings.service";

export default function VerifyPaymentMethodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      // Get reference from URL params or session storage
      const reference =
        searchParams.get("tx_ref") ||
        searchParams.get("reference") ||
        sessionStorage.getItem("paymentMethodReference");

      const flutterwaveStatus = searchParams.get("status");

      // Check if payment was cancelled
      if (flutterwaveStatus === "cancelled") {
        setStatus("error");
        setMessage("Payment was cancelled. Please try again.");
        toast.error("Payment was cancelled");
        setTimeout(() => {
          router.push("/vendor/dashboard/settings?tab=billing");
        }, 3000);
        return;
      }

      if (!reference) {
        setStatus("error");
        setMessage("Invalid payment reference. Please try again.");
        toast.error("Invalid payment reference");
        setTimeout(() => {
          router.push("/vendor/dashboard/settings?tab=billing");
        }, 3000);
        return;
      }

      try {
        // Verify payment method with backend
        const response = await settingsService.verifyPaymentMethod(reference);

        if (response.status === "success") {
          setStatus("success");
          setMessage(response.message || "Payment method added successfully!");
          toast.success("Payment method added successfully!");

          // Clear session storage
          sessionStorage.removeItem("paymentMethodReference");

          // Redirect to settings after 2 seconds
          setTimeout(() => {
            router.push("/vendor/dashboard/settings?tab=billing");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(
            response.message ||
              "Failed to verify payment method. Please try again."
          );
          toast.error("Failed to verify payment method");

          setTimeout(() => {
            router.push("/vendor/dashboard/settings?tab=billing");
          }, 3000);
        }
      } catch (error: any) {
        console.error("Error verifying payment method:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to verify payment method. Please try again."
        );
        toast.error("Failed to verify payment method");

        setTimeout(() => {
          router.push("/vendor/dashboard/settings?tab=billing");
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {status === "verifying" && (
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <XCircle className="w-10 h-10 text-red-600" />
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "verifying" && "Verifying Payment Method"}
              {status === "success" && "Payment Method Added!"}
              {status === "error" && "Verification Failed"}
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              {status === "verifying" &&
                "Please wait while we verify your payment method..."}
              {status === "success" && message}
              {status === "error" && message}
            </p>

            {/* Additional Info */}
            {status === "verifying" && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                <span>This may take a few moments</span>
              </div>
            )}

            {status === "success" && (
              <div className="text-sm text-gray-500">
                Redirecting to settings...
              </div>
            )}

            {status === "error" && (
              <button
                onClick={() =>
                  router.push("/vendor/dashboard/settings?tab=billing")
                }
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Return to Settings
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
