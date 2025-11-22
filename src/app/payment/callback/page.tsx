"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    const handlePaymentCallback = async () => {
      // Get payment status from URL parameters
      const paymentStatus = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");

      console.log("Payment callback params:", {
        status: paymentStatus,
        tx_ref: txRef,
        transaction_id: transactionId,
      });

      // Get pending registration info
      const pendingRegistration = localStorage.getItem("pendingRegistration");
      let registrationData = null;

      if (pendingRegistration) {
        try {
          registrationData = JSON.parse(pendingRegistration);
        } catch (error) {
          console.error("Error parsing pending registration:", error);
        }
      }

      if (paymentStatus === "successful" || paymentStatus === "completed") {
        // Payment successful
        setStatus("success");
        setMessage("Payment successful! Your account is being activated...");
        toast.success("Payment completed successfully!");

        // Clear pending registration
        localStorage.removeItem("pendingRegistration");

        // Redirect to email verification page after 3 seconds
        setTimeout(() => {
          if (registrationData?.email) {
            router.push(
              `/register/success?email=${encodeURIComponent(
                registrationData.email
              )}`
            );
          } else {
            router.push("/sign-in");
          }
        }, 3000);
      } else if (paymentStatus === "cancelled") {
        // Payment cancelled
        setStatus("failed");
        setMessage("Payment was cancelled. You can try again.");
        toast.error("Payment cancelled");

        // Redirect to pricing page after 5 seconds
        setTimeout(() => {
          router.push("/#pricing");
        }, 5000);
      } else {
        // Payment failed
        setStatus("failed");
        setMessage("Payment failed. Please try again or contact support.");
        toast.error("Payment failed");

        // Redirect to pricing page after 5 seconds
        setTimeout(() => {
          router.push("/#pricing");
        }, 5000);
      }
    };

    handlePaymentCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Please check your email to verify your account and complete the
                setup.
              </p>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push("/#pricing")}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
