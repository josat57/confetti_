"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Auth } from "@/api/api";
import { toast } from "react-toastify";
import { AdminAPI } from "@/api/adminApi";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: "admin" | "event-planner" | "vendor" | "user";
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
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        try {
          let verifiedUser = null;
          if (
            parsedUser.role === "admin" ||
            parsedUser.role === "super_admin"
          ) {
            // Call admin verify
            const response = await AdminAPI.verifyAdminAccess();
            verifiedUser = response?.data?.admin;
          } else {
            // Call regular user verify
            const response = await Auth.verifyUser();
            verifiedUser = response?.userData;
          }
          if (verifiedUser) {
            setUser(verifiedUser);
            localStorage.setItem("user", JSON.stringify(verifiedUser));
          } else {
            setUser(null);
            localStorage.removeItem("user");
          }
        } catch (error) {
          setUser(null);
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    hydrateAndVerify();
  }, []);

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
        // Store user data in localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("rememberedEmail");
        }
        return response;
      } else {
        throw new Error(response?.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
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
      console.error("Registration error:", error);
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
      } catch (signOutError) {
        console.error("Backend signout error:", signOutError);
        // Continue with local cleanup even if backend fails
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
