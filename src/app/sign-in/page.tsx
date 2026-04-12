"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CalendarHeart,
  Sparkles,
  Users,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import Image from "next/image";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: CalendarHeart,
    title: "Manage Events",
    desc: "Plan and track every detail of your events",
  },
  {
    icon: Users,
    title: "Collaborate",
    desc: "Work seamlessly with your team & vendors",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    desc: "Real-time insights and analytics",
  },
  {
    icon: Sparkles,
    title: "AI Planning",
    desc: "Smart suggestions powered by AI",
  },
];

function SignInContent() {
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

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (response?.user?.role) {
        const roleRouteMap: Record<string, string> = {
          event_planner: "/planner/dashboard",
          "event-planner": "/planner/dashboard",
          vendor: "/vendor/dashboard",
          admin: "/admin",
          user: "/user/dashboard",
        };
        const dashboardRoute = roleRouteMap[response.user.role] || "/dashboard";
        router.push(dashboardRoute);
      } else {
        toast.error("Invalid user role");
        await logout();
        router.push("/sign-in");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      toast.error(errorMessage);
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
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      const authUrl = `${
        process.env.NEXT_PUBLIC_API_URL
      }/auth/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      window.location.href = authUrl;
    } catch (err: any) {
      const errorMessage = err.message || `Failed to sign in with ${provider}`;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push("/")}
        className="fixed top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </motion.button>

      {/* Left Side — fixed image panel */}
      <div className="hidden lg:flex lg:w-1/2 fixed inset-y-0 left-0 flex-col">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
            alt="Elegant event setup"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Purple colour wash on top */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/70 to-purple-800/60" />
          {/* Bottom vignette so footer text pops */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Left panel content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-14 py-12 text-white">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-white/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight drop-shadow-sm">Confetti</span>
          </div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold leading-tight mb-4 drop-shadow-md">
              Welcome back to <br />
              <span className="text-purple-200">your workspace</span>
            </h1>
            <p className="text-white/80 text-base mb-10 leading-relaxed drop-shadow-sm">
              Everything you need to plan, collaborate, and deliver unforgettable events — all in one place.
            </p>

            {/* Feature tiles */}
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-colors shadow-sm"
                >
                  <Icon className="w-5 h-5 text-purple-200 mb-2" />
                  <p className="text-sm font-semibold text-white drop-shadow-sm">{title}</p>
                  <p className="text-xs text-white/70 mt-0.5 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer quote */}
          <p className="text-white/60 text-xs drop-shadow-sm">
            Trusted by event planners, vendors &amp; clients worldwide
          </p>
        </div>
      </div>

      {/* Right Side — scrollable sign-in form */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] min-h-screen flex items-center justify-center px-6 py-16 bg-gray-50/50">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Confetti</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-purple-600 font-medium hover:text-purple-700">
                Create one free
              </Link>
            </p>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Social auth */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  provider: "google" as const,
                  label: "Google",
                  icon: <FcGoogle className="w-5 h-5" />,
                },
                {
                  provider: "facebook" as const,
                  label: "Facebook",
                  icon: (
                    <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  provider: "twitter" as const,
                  label: "Twitter",
                  icon: (
                    <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  ),
                },
              ].map(({ provider, label, icon }) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialAuth(provider)}
                  disabled={isLoading}
                  aria-label={`Sign in with ${label}`}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-50/50 text-gray-400 font-medium">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-purple-600 font-medium hover:text-purple-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-shadow"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                />
                <label htmlFor="remember-me" className="text-sm text-gray-600">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-semibold shadow-sm shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              By signing in you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
