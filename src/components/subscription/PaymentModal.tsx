"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
  };
  paymentProvider: "flutterwave" | "paystack";
  onSuccess: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    PaystackPop: any;
    FlutterwaveCheckout: (config: any) => {
      close: () => void;
    };
  }
}

const PaymentModal = ({
  isOpen,
  onClose,
  plan,
  paymentProvider: initialPaymentProvider,
  onSuccess,
  onCancel,
  onError,
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<
    "flutterwave" | "paystack"
  >(initialPaymentProvider);
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management: trap focus within modal and restore on close
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);

      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    } else {
      // Restore focus to the previously focused element when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  const handleFlutterwavePayment = async () => {
    const flutterwaveKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

    // Check if Flutterwave is configured
    if (!flutterwaveKey || flutterwaveKey === "your_key") {
      console.warn("Flutterwave not configured, falling back to Paystack");
      setActiveProvider("paystack");
      return handlePaystackPayment();
    }

    // Check if FlutterwaveCheckout is available
    if (typeof window.FlutterwaveCheckout !== "function") {
      console.warn("Flutterwave script not loaded, falling back to Paystack");
      setActiveProvider("paystack");
      return handlePaystackPayment();
    }

    if (!user?.email) {
      const errorMessage = "User email is required for payment.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      return;
    }

    try {
      setIsProcessing(true);

      // Generate unique transaction reference
      const txRef = `CONF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      // Flutterwave Inline configuration
      const paymentConfig = {
        public_key: flutterwaveKey,
        tx_ref: txRef,
        amount: plan.price,
        currency: "NGN", // Use NGN as default, can be changed based on user selection
        payment_options: "card,mobilemoney,ussd,banktransfer",
        customer: {
          email: user.email,
          phone_number: user.phone || "",
          name: user.username || user.email.split("@")[0],
        },
        customizations: {
          title: "Confetti Subscription",
          description: `${plan.name} Plan - ${plan.period}`,
          logo: "https://confetti.com/logo.png", // Replace with your actual logo URL
        },
        callback: function (data: any) {
          console.log("Flutterwave payment callback:", data);

          // Close the payment modal
          setIsProcessing(false);

          // Verify payment status
          if (data.status === "successful" || data.status === "completed") {
            // Payment successful
            setPaymentError(null);
            toast.success("Payment successful! Verifying transaction...");

            // Here you should verify the transaction on your backend
            // For now, we'll call onSuccess
            onSuccess();
            onClose();
          } else {
            // Payment failed or cancelled
            const errorMessage = `Payment ${data.status}. Please try again.`;
            setPaymentError(errorMessage);
            toast.error(errorMessage);
            if (onError) {
              onError(errorMessage);
            }
          }
        },
        onclose: function () {
          // User closed the payment modal
          console.log("Flutterwave payment modal closed");
          setIsProcessing(false);

          const errorMessage = "Payment cancelled. You can retry when ready.";
          setPaymentError(errorMessage);
          toast.info(errorMessage);

          if (onCancel) {
            onCancel();
          }
        },
      };

      // Initialize Flutterwave Checkout
      window.FlutterwaveCheckout(paymentConfig);
    } catch (error: any) {
      console.error("Flutterwave initialization error:", error);
      setIsProcessing(false);

      // Try to fall back to Paystack
      console.warn("Falling back to Paystack");
      setActiveProvider("paystack");
      return handlePaystackPayment();
    }
  };

  const loadPaystackScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve();
      const existing = document.getElementById("paystack-inline-js");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.id = "paystack-inline-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const handlePaystackPayment = async () => {
    // Load Paystack script on-demand to avoid the "form element" init warning
    try {
      await loadPaystackScript();
    } catch {
      const errorMessage = "Failed to load payment SDK. Please try again.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
      return;
    }

    // Check if PaystackPop is available
    if (!window.PaystackPop) {
      const errorMessage =
        "Payment system is loading. Please try again in a moment.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      return;
    }

    try {
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

      // Validate configuration
      if (!paystackKey || paystackKey === "your_key") {
        const errorMessage =
          "Payment configuration error. Please contact support.";
        setPaymentError(errorMessage);
        toast.error(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        console.error("Paystack public key is not configured");
        return;
      }

      if (!user?.email) {
        const errorMessage = "User email is required for payment.";
        setPaymentError(errorMessage);
        toast.error(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        return;
      }

      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount: plan.price * 100, // Convert to kobo/cents
        currency: "NGN",
        ref: `PS-${Date.now()}-${Math.ceil(Math.random() * 1000000)}`,
        callback: (response: any) => {
          setPaymentError(null);
          onSuccess();
          onClose();
          toast.success("Payment successful!");
        },
        onClose: () => {
          const errorMessage =
            "Payment was cancelled. You can retry payment or contact support if you need assistance.";
          setPaymentError(errorMessage);
          toast.error(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
          if (onCancel) {
            onCancel();
          }
        },
      });
      handler.openIframe();
    } catch (error: any) {
      console.error("Paystack initialization error:", error);
      const errorMessage =
        error.message || "Failed to initialize payment. Please try again.";
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      onClose();
      return;
    }

    // Clear previous error
    setPaymentError(null);

    // Try Flutterwave first (primary), fall back to Paystack if unavailable
    if (activeProvider === "flutterwave") {
      await handleFlutterwavePayment();
    } else {
      await handlePaystackPayment();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          aria-describedby="payment-modal-description"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget && !isProcessing) {
              onClose();
            }
          }}
          onKeyDown={(e) => {
            // Close modal on Escape key
            if (e.key === "Escape" && !isProcessing) {
              onClose();
            }
          }}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close payment modal"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>

              <div className="text-center mb-6">
                <h3
                  id="payment-modal-title"
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  Complete Your Subscription
                </h3>
                <p id="payment-modal-description" className="text-gray-600">
                  You're subscribing to the {plan.name} plan
                </p>
              </div>

              <div
                className="bg-gray-50 rounded-lg p-4 mb-6"
                role="region"
                aria-label="Payment summary"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Plan</span>
                  <span
                    className="font-medium"
                    aria-label={`Plan name: ${plan.name}`}
                  >
                    {plan.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span
                    className="font-medium"
                    aria-label={`Amount: ${plan.price} dollars ${plan.period}`}
                  >
                    ${plan.price}
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Display payment error message */}
              <AnimatePresence>
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 overflow-hidden"
                    role="alert"
                    aria-live="assertive"
                  >
                    <p className="text-sm text-red-800">{paymentError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
                whileHover={!isProcessing ? { scale: 1.02 } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  isProcessing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                }`}
                aria-label={`Pay ${plan.price} dollars with ${
                  activeProvider === "flutterwave" ? "Flutterwave" : "Paystack"
                }`}
                aria-busy={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2
                      className="w-5 h-5 animate-spin mr-2"
                      aria-hidden="true"
                    />
                    <span role="status">Processing payment...</span>
                  </div>
                ) : (
                  `Pay with ${
                    activeProvider === "flutterwave"
                      ? "Flutterwave"
                      : "Paystack"
                  }`
                )}
              </motion.button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Your payment is secure and encrypted
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
