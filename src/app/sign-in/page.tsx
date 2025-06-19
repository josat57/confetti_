"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Image from "next/image";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password, formData.rememberMe);
      console.log('Login response:', response);
      
      if (response?.user?.role) {
        // Redirect to role-specific dashboard
        router.push(`/${response.user.role}/dashboard`);
      } else {
        toast.error("Invalid user role");
        // Log out the user if they don't have a valid role
        await logout();
        router.push('/sign-in');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "facebook" | "twitter") => {
    setError(null);
    setIsLoading(true);

    try {
      // Get the callback URL from query params or default to dashboard
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      window.location.href = authUrl;
    } catch (err: any) {
      const errorMessage = err.message || `Failed to sign in with ${provider}`;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
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

      {/* Left Side - Fixed Background Image with Overlay */}
      <div className="hidden lg:block lg:w-1/2 fixed inset-y-0 left-0">
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
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
            <p className="text-lg text-purple-100 mb-8">
              Sign in to access your event planning dashboard and continue creating amazing experiences.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">1</span>
                </div>
                <span>Access your events</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">2</span>
                </div>
                <span>Manage your team</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-semibold">3</span>
                </div>
                <span>Track your progress</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Scrollable Sign In Form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen overflow-y-auto bg-white">
        <div className="max-w-md w-full mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-gray-600">Welcome back to Confetti</p>
          </motion.div>

          {/* Social Authentication Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <button
              onClick={() => handleSocialAuth("google")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleSocialAuth("facebook")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button
              onClick={() => handleSocialAuth("twitter")}
              disabled={isLoading}
              className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
          </motion.div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 py-2 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-purple-700 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{" "}
              <Link
                href="/register"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Create account
              </Link>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
} 