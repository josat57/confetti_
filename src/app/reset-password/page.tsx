"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, RefreshCw, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";

interface PasswordRequirement {
  text: string;
  regex: RegExp;
  met: boolean;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
    token: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { text: "At least 8 characters", regex: /.{8,}/, met: false },
    { text: "At least one uppercase letter", regex: /[A-Z]/, met: false },
    { text: "At least one lowercase letter", regex: /[a-z]/, met: false },
    { text: "At least one number", regex: /[0-9]/, met: false },
    { text: "At least one special character", regex: /[!@#$%^&*(),.?":{}|<>]/, met: false },
  ]);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (formData.password) {
      const updatedRequirements = requirements.map(req => ({
        ...req,
        met: req.regex.test(formData.password)
      }));
      setRequirements(updatedRequirements);
      
      const strength = updatedRequirements.filter(req => req.met).length;
      setPasswordStrength(strength);
    } else {
      setRequirements(requirements.map(req => ({ ...req, met: false })));
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
      formData.token = token!;
      const response = await Auth.resetPassword(formData);
      if (response.status === "success") {
        setSuccess(true);
        toast.success(response.message);
        router.push("/sign-in");
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setError(null);
    setIsLoading(true);
    try {
      const response = await Auth.resendOtp(email!);
      if (response.status === "success") {
        toast.success(response.message)
        setResendTimer(60);
        setCanResend(false);
        router.push("/sign-in");
      } else {
        router.push("/forgot-password");
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            alt="Elegant event setup with purple lighting"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-purple-900/90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Reset Your Password</h1>
            <p className="text-lg text-purple-100 mb-8">
              Enter the code sent to your email and create a new password
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-white">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-gray-600">
              Enter the code sent to {email}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
                Password reset successful! Redirecting to sign in...
              </div>
            )}

            {/* OTP */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-sm text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Password Strength: {getStrengthText(passwordStrength)}
                </p>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {requirement.met ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 mr-2" />
                    )}
                    <span className={requirement.met ? "text-green-600" : "text-gray-500"}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
} 