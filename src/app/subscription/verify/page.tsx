"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";

function SubscriptionVerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [paymentDetails, setPaymentDetails] = useState<{
    reference: string;
    transactionId: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const handlePaymentVerification = () => {
      // Get payment status from URL parameters
      const paymentStatus = searchParams.get("status");
      const reference = searchParams.get("reference");
      const txRef = searchParams.get("tx_ref");
      const transactionId = searchParams.get("transaction_id");


      // Get pending registration info from localStorage
      const pendingRegistration = localStorage.getItem("pendingRegistration");
      let email = "";

      if (pendingRegistration) {
        try {
          const data = JSON.parse(pendingRegistration);
          email = data.email;
        } catch {
          // ignore parse error
        }
      }

      // Store payment details
      setPaymentDetails({
        reference: reference || txRef || "",
        transactionId: transactionId || "",
        email,
      });

      if (paymentStatus === "successful" || paymentStatus === "completed") {
        // Payment successful
        setStatus("success");
        toast.success("Payment completed successfully!");

        // Clear pending registration from localStorage
        localStorage.removeItem("pendingRegistration");
      } else if (paymentStatus === "cancelled") {
        // Payment cancelled
        setStatus("failed");
        toast.error("Payment was cancelled");
      } else {
        // Payment failed
        setStatus("failed");
        toast.error("Payment failed");
      }
    };

    handlePaymentVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {status === "loading" && (
          <div className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-green-50">
                Your subscription has been activated
              </p>
            </div>

            {/* Payment Receipt */}
            <div className="p-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Receipt
                </h3>
                <div className="space-y-3">
                  {paymentDetails?.transactionId && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-900">
                        {paymentDetails.transactionId}
                      </span>
                    </div>
                  )}
                  {paymentDetails?.reference && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Reference</span>
                      <span className="font-mono text-sm text-gray-900">
                        {paymentDetails.reference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Verification Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6"
              >
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-blue-800 mb-3">
                      We've sent a verification email to{" "}
                      <span className="font-semibold">
                        {paymentDetails?.email || "your email address"}
                      </span>
                      . Please check your inbox and click the verification link
                      to complete your account setup.
                    </p>
                    <p className="text-sm text-blue-700">
                      💡 Don't forget to check your spam folder if you don't see
                      the email within a few minutes.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Next Steps */}
              <div className="bg-purple-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  What's Next?
                </h3>
                <ol className="space-y-2 text-purple-800">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-900 font-semibold text-sm mr-3 flex-shrink-0">
                      1
                    </span>
                    <span>Check your email for the verification link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-900 font-semibold text-sm mr-3 flex-shrink-0">
                      2
                    </span>
                    <span>Click the link to verify your email address</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-900 font-semibold text-sm mr-3 flex-shrink-0">
                      3
                    </span>
                    <span>Sign in and start using your account</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-in"
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
                >
                  Go to Sign In
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            {/* Failure Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-red-50">We couldn't process your payment</p>
            </div>

            {/* Failure Details */}
            <div className="p-8">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  What happened?
                </h3>
                <p className="text-red-800 mb-4">
                  Your payment was not completed successfully. This could be due
                  to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700 mb-4">
                  <li>Payment was cancelled</li>
                  <li>Insufficient funds</li>
                  <li>Card declined</li>
                  <li>Network issues</li>
                </ul>
                <p className="text-sm text-red-600">
                  Don't worry, no charges were made to your account.
                </p>
              </div>

              {paymentDetails?.reference && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    Reference:{" "}
                    <span className="font-mono text-gray-900">
                      {paymentDetails.reference}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/#pricing"
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function SubscriptionVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
        </div>
      }
    >
      <SubscriptionVerifyContent />
    </Suspense>
  );
}
