"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";
import { AdminAPI } from "@/api/adminApi";
import { guestSessionService } from "@/services/guest-session.service";
import { saveEventPlan } from "@/lib/api/ai-planner";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: "admin" | "super_admin" | "event-planner" | "vendor" | "user";
  status: "pending_payment" | "pending_verification" | "active" | "suspended";
  subscription: string | Subscription; // Can be ObjectId or populated object
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: "light" | "dark";
    language: string;
  };
  isEmailVerified: boolean;
  profilePicture?: string;
  oauthProvider?: string;
  oauthId?: string;
  isActive: boolean;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  ssoConfig?: {
    enabled: boolean;
    provider?: string;
    domain?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  _id: string;
  user: string;
  planType: "vendor" | "planner";
  planName: string;
  status: "pending_payment" | "active" | "trial" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  paymentProvider: "flutterwave" | "paystack" | "none";
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
  usage: {
    eventsCreated: number;
    photosUploaded: number;
    lastResetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  verifyUser: () => Promise<any>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrateAndVerify = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        let parsedUser: User | null = null;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("user");
        }
        if (!parsedUser) {
          setLoading(false);
          return;
        }
        // Immediately restore from localStorage so the UI isn't blank during verify
        setUser(parsedUser);
        try {
          let verifiedUser = null;
          if (
            parsedUser.role === "admin" ||
            parsedUser.role === "super_admin"
          ) {
            const response = await AdminAPI.verifyAdminAccess();
            verifiedUser = response?.data?.admin;
          } else {
            const response = await Auth.verifyUser();
            verifiedUser = response?.userData;
          }
          if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem("user", JSON.stringify(verifiedUser));
          }
          // If verifiedUser is null but no auth error was thrown, keep existing
          // stored user — the verify endpoint may have returned an unexpected format
        } catch (error: any) {
          const status = error?.response?.status;
          const errorMessage =
            error?.response?.data?.message || error?.message || "";

          // Only clear session on explicit authentication failures
          const isAuthError =
            status === 401 ||
            status === 403 ||
            errorMessage.includes("User no longer exists") ||
            errorMessage.includes("Invalid token") ||
            errorMessage.includes("User not found") ||
            errorMessage.includes("Not authenticated");

          if (isAuthError) {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("rememberedEmail");
            router.push("/sign-in");
          }
          // Network errors / 500s: keep the user logged in with stored data
        }
      }
      setLoading(false);
    };

    // Listen for auth logout events from the API interceptor
    const handleAuthLogout = (event: CustomEvent) => {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedEmail");
      toast.error(`Session expired: ${event.detail.reason}`);
    };

    window.addEventListener("auth-logout", handleAuthLogout as EventListener);

    hydrateAndVerify();

    return () => {
      window.removeEventListener(
        "auth-logout",
        handleAuthLogout as EventListener
      );
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save a plan the user generated before authenticating (stored in localStorage by the public planner flow).
  const savePendingEventPlan = async () => {
    const token =
      localStorage.getItem("eventPlanToken") ||
      localStorage.getItem("eventPlanSessionToken");
    if (!token) return;
    try {
      await saveEventPlan(token);
      localStorage.removeItem("eventPlanToken");
      localStorage.removeItem("eventPlanSessionToken");
    } catch {
      // Non-critical — plan might already be saved or token expired
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setLoading(true);
      const response = await Auth.signIn({ email, password });

      if (response?.status === "success" && response?.user) {
        setUser(response.user);
        // Always persist user for session continuity; remember email separately
        localStorage.setItem("user", JSON.stringify(response.user));
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Convert any existing guest session plans to this user's account
        if (guestSessionService.hasGuestSession()) {
          try {
            await guestSessionService.convertGuestSession();
          } catch {
            // Non-critical — don't block login if conversion fails
          }
        }

        // Save any AI plan the user generated before logging in
        await savePendingEventPlan();

        return response;
      } else {
        throw new Error(response?.message || "Login failed");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await Auth.register(userData);
      return response;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Try to call backend signout, but don't fail if it errors
      try {
        await Auth.signOut();
      } catch {
        // Continue with local cleanup even if backend signout fails
      }

      setUser(null);
      // Clear stored user data
      localStorage.removeItem("user");
      localStorage.removeItem("rememberedEmail");
      router.push("/sign-in");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async () => {
    try {
      const response = await Auth.verifyUser();
      if (response?.status === "success" && response?.userData) {
        setUser(response.userData);
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(response.userData));
        return response;
      } else {
        setUser(null);
        localStorage.removeItem("user");
        return null;
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem("user");
      return null;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
