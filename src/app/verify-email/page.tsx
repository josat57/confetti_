"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Auth } from "@/api/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const urlOtp = searchParams.get("otp");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [hasAutoVerified, setHasAutoVerified] = useState(false);

  const handleAutoVerify = async (otpCode: string) => {
    if (hasAutoVerified) return; // Prevent multiple calls

    try {
      const response = await Auth.verifyEmail(token!, otpCode);
      if (response.status === "success") {
        toast.success(response.message || "Email verified successfully!");
        router.push("/sign-in");
      } else {
        toast.error(response.message || "Failed to verify email");
        setAutoVerifying(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email");
      setAutoVerifying(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Invalid verification link");
      router.push("/sign-in");
      return;
    }

    // If OTP is provided in URL, auto-verify (only once)
    if (urlOtp && urlOtp.length === 6 && !hasAutoVerified) {
      setAutoVerifying(true);
      setHasAutoVerified(true);
      handleAutoVerify(urlOtp);
      return;
    }

    // If no email and no OTP in URL, it's invalid
    if (!email && !urlOtp) {
      toast.error("Invalid verification link");
      router.push("/sign-in");
      return;
    }

    // Start countdown for resend button (only if not auto-verifying)
    if (!autoVerifying) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [token, email, urlOtp, router, hasAutoVerified, autoVerifying]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await Auth.verifyEmail(token!, otpString);
      if (response.status === "success") {
        toast.success(response.message);
        router.push("/sign-in");
      } else {
        toast.error(response.message || "Failed to verify email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      // Use email if available, otherwise use token for resend
      const response = email
        ? await Auth.resendVerification(email)
        : await Auth.resendVerification(token!);
      if (response.status === "success") {
        toast.success(response.message);
        setCountdown(60);
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push("/sign-in")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Sign In</span>
        </motion.button>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {autoVerifying
              ? "Verifying your email automatically..."
              : "Please enter the 6-digit verification code sent to your email"}
          </p>
        </div>

        {autoVerifying ? (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="text-lg text-gray-700">
                Verifying your email...
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleVerify}
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
                className="text-sm text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resending...</span>
                  </div>
                ) : countdown > 0 ? (
                  `Resend code in ${countdown}s`
                ) : (
                  "Resend verification code"
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
