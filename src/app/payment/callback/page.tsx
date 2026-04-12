"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Processing your payment...");
  const [countdown, setCountdown] = useState(5);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = (seconds: number, destination: string) => {
    setCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          router.push(destination);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelRedirect = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setRedirectCancelled(true);
  };

  useEffect(() => {
    const handlePaymentCallback = () => {
      const paymentStatus = searchParams.get("status");
      const txRef = searchParams.get("tx_ref");

      const pendingRegistration = localStorage.getItem("pendingRegistration");
      let registrationData: { email?: string } | null = null;

      if (pendingRegistration) {
        try {
          registrationData = JSON.parse(pendingRegistration);
        } catch {
          // ignore parse error
        }
      }

      if (paymentStatus === "successful" || paymentStatus === "completed") {
        setStatus("success");
        setMessage("Payment confirmed! Your account is being activated.");
        toast.success("Payment completed successfully!");
        localStorage.removeItem("pendingRegistration");

        const destination = registrationData?.email
          ? `/register/success?email=${encodeURIComponent(registrationData.email)}`
          : "/sign-in";

        startCountdown(4, destination);
      } else if (paymentStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled. You can choose a plan and try again.");
        toast.error("Payment cancelled");
        startCountdown(6, "/#pricing");
      } else {
        setStatus("failed");
        setMessage("Payment was not completed. Please try again or contact support.");
        toast.error("Payment failed");
        startCountdown(6, "/#pricing");
      }
    };

    handlePaymentCallback();

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 text-center"
            >
              <Loader2 className="w-14 h-14 animate-spin text-purple-600 mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
              <p className="text-gray-500 text-sm">{message}</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Green header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 text-white mx-auto mb-3" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-1">Payment Successful!</h2>
                <p className="text-green-100 text-sm">{message}</p>
              </div>

              <div className="p-7 text-center">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-800">
                  Please check your email to verify your account and complete setup.
                </div>

                {!redirectCancelled ? (
                  <>
                    <p className="text-gray-500 text-sm mb-3">
                      Redirecting in <span className="font-semibold text-gray-700">{countdown}s</span>…
                    </p>
                    <button
                      onClick={cancelRedirect}
                      className="text-sm text-purple-600 hover:text-purple-700 underline"
                    >
                      Cancel redirect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                  >
                    Go to Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Red header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                >
                  <XCircle className="w-16 h-16 text-white mx-auto mb-3" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-1">Payment Failed</h2>
                <p className="text-red-100 text-sm">{message}</p>
              </div>

              <div className="p-7 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
                  No charges were made to your account.
                </div>

                {!redirectCancelled ? (
                  <>
                    <p className="text-gray-500 text-sm mb-3">
                      Redirecting to pricing in <span className="font-semibold text-gray-700">{countdown}s</span>…
                    </p>
                    <button
                      onClick={cancelRedirect}
                      className="text-sm text-gray-500 hover:text-gray-700 underline mb-4 block mx-auto"
                    >
                      Cancel redirect
                    </button>
                  </>
                ) : null}

                <button
                  onClick={() => router.push("/#pricing")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
