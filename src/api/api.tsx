import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Ensure withCredentials is always set to true for all requests
    config.withCredentials = true;
    // No need to manually set Authorization header - HTTP-only cookies will be sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Plan limits and paid features: let the dashboard offer an upgrade (components/subscription/PlanLimitPrompt)
    const planCode = error.response?.data?.code;
    if (
      typeof window !== "undefined" &&
      (planCode === "PLAN_LIMIT_REACHED" ||
        planCode === "PLAN_FEATURE_REQUIRED" ||
        planCode === "PASS_REQUIRED")
    ) {
      window.dispatchEvent(
        new CustomEvent("confetti:plan-limit", { detail: error.response.data })
      );
    }

    // List of URLs that should NOT trigger token refresh
    const excludedUrls = [
      "/auth/refresh-token",
      "/auth/verify",
      "/auth/signin",
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
    ];

    // Check if the request URL should be excluded from token refresh
    const shouldExclude = excludedUrls.some((url) =>
      originalRequest.url?.includes(url)
    );

    // Handle 401 errors
    if (error.response?.status === 401 && !shouldExclude) {
      const errorMessage = error.response?.data?.message || "";

      // If user no longer exists or similar critical auth errors, immediately logout
      if (
        errorMessage.includes("User no longer exists") ||
        errorMessage.includes("Invalid token") ||
        errorMessage.includes("Token expired") ||
        errorMessage.includes("User not found")
      ) {
        // Clear local storage and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("rememberedEmail");
        if (typeof window !== "undefined") {
          // Dispatch a custom event to notify the AuthContext
          window.dispatchEvent(
            new CustomEvent("auth-logout", {
              detail: { reason: errorMessage },
            })
          );
          // Small delay to allow the event to be processed
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 100);
        }
        return Promise.reject(error);
      }

      // Try token refresh for other 401 errors (if not already tried)
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token using a separate axios instance to avoid interceptor loops
          const refreshApi = axios.create({
            baseURL:
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1",
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          });

          const refreshResponse = await refreshApi.post(
            "/auth/refresh-token",
            {}
          );

          if (refreshResponse.status === 200) {
            // After successful refresh, retry the original request
            return api(originalRequest);
          } else {
            // Clear local storage and redirect to login
            localStorage.removeItem("user");
            localStorage.removeItem("rememberedEmail");
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("auth-logout", {
                  detail: { reason: "Token refresh failed" },
                })
              );
              setTimeout(() => {
                window.location.href = "/sign-in";
              }, 100);
            }
            return Promise.reject(error);
          }
        } catch (refreshError) {
          // Clear local storage and redirect to login
          localStorage.removeItem("user");
          localStorage.removeItem("rememberedEmail");
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("auth-logout", {
                detail: { reason: "Token refresh error" },
              })
            );
            setTimeout(() => {
              window.location.href = "/sign-in";
            }, 100);
          }
          return Promise.reject(error); // Return original error, not refresh error
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const Auth = {
  register: async (userData: {
    userName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    planId?: string;
    planName?: string;
    planType?: "vendor" | "event_planner" | "planner" | "client";
    amount?: number;
    currency?: string;
    billingCycle?: "monthly" | "yearly";
    couponCode?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  signIn: async (formData: object) => {
    try {
      const response = await api.post("/auth/signin", formData);
      if (response.data?.status === "success" && response.data?.user) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error: any) {
      // Extract the actual error message from the response
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to sign in. Please try again.";
      throw new Error(errorMessage);
    }
  },

  signOut: async () => {
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch {
      // Don't throw on signout — frontend clears local state regardless
    }
  },

  verifyEmail: async (token: string, otp: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}/${otp}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to verify email. Please try again."
      );
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  verifyOtp: async (email: string, resetToken: string, otp: string) => {
    const response = await api.post("/auth/verify-otp", {
      email,
      resetToken,
      otp,
    });
    return response.data;
  },

  resetPassword: async (formData: object) => {
    const response = await api.post(`/auth/reset-password`, formData);
    return response.data;
  },

  verifyUser: async () => {
    try {
      const response = await api.get("/auth/verify", {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resendOtp: async (email: string) => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  completeProfile: async (formData: FormData) => {
    try {
      const response = await api.post("/auth/complete-profile", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to complete profile. Please try again."
      );
    }
  },

  uploadProfileImage: async (formData: FormData) => {
    try {
      const response = await api.post(
        "/uploads/upload-profile-image",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to upload profile image. Please try again."
      );
    }
  },

  socialAuth: async (
    provider: "google" | "facebook" | "twitter",
    token: string
  ) => {
    try {
      const response = await api.post(`/auth/${provider}`, { token });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to authenticate with ${provider}. Please try again.`
      );
    }
  },
};

export const User = {
  getProfile: async () => {
    try {
      const response = await api.get("/users/me", {
        withCredentials: true,
      });
      if (response.status === 401 || response.status === 404) {
        return null;
      }
      if (!response.data) {
        throw new Error("No data received from server");
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (formData: FormData) => {
    const response = await api.patch("/users/me", formData);
    return response.data;
  },

  uploadCoverPhoto: async (formData: FormData) => {
    try {
      const response = await api.post("/users/me/cover-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to upload cover photo. Please try again."
      );
    }
  },

  uploadProfileImage: async (formData: FormData) => {
    try {
      const response = await api.post("/users/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to upload profile image. Please try again."
      );
    }
  },

  deleteProfileImage: async () => {
    try {
      const response = await api.delete("/users/me/profile-image");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete profile image. Please try again."
      );
    }
  },

  deleteCoverPhoto: async () => {
    try {
      const response = await api.delete("/users/me/cover-photo");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete cover photo. Please try again."
      );
    }
  },

  uploadDocuments: async (formData: FormData) => {
    const response = await api.post("/uploads/upload_documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  verifyDocuments: async (formData: FormData) => {
    const response = await api.post("/auth/verify_documents", formData);
    return response.data;
  },

  getUserSuggestions: async () => {
    const response = await api.get("/auth/user_suggestions");
    return response.data;
  },

  getHashtagSuggestions: async () => {
    const response = await api.get("/users/hashtag_suggestions");
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await api.post(`/users/follow_user/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const response = await api.post(`/users/unfollow_user/${userId}`);
    return response.data;
  },

  getFollowers: async (userId: string) => {
    const response = await api.get(`/users/followers/${userId}`);
    return response.data;
  },

  getFollowing: async (userId: string) => {
    const response = await api.get(`/users/following/${userId}`);
    return response.data;
  },

  tagUser: async (userId: string, tagId: string) => {
    const response = await api.post(`/users/tag_user/${userId}/${tagId}`);
    return response.data;
  },

  untagUser: async (userId: string, tagId: string) => {
    const response = await api.post(`/users/untag_user/${userId}/${tagId}`);
    return response.data;
  },

  getTaggedUsers: async (userId: string) => {
    const response = await api.get(`/users/tagged_users/${userId}`);
    return response.data;
  },

  getTaggedHashtags: async (userId: string) => {
    const response = await api.get(`/users/tagged_hashtags/${userId}`);
    return response.data;
  },
};

export const Notifications = {
  sendNotification: async (notificationData: any) => {
    const response = await api.post(
      "/notifications/send_notification",
      notificationData
    );
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get("/notifications/get_notifications");
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.put(
      `/notifications/mark_as_read/${notificationId}`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/mark_all_as_read");
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(
      `/notifications/delete_notification/${notificationId}`
    );
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete(
      "/notifications/delete_all_notifications"
    );
    return response.data;
  },

  getNotificationCount: async () => {
    const response = await api.get("/notifications/get_notification_count");
    return response.data;
  },
};

export const SubscriptionPlans = {
  // Get all subscription plans with optional filters
  getAllPlans: async (params?: {
    planType?: "vendor" | "event_planner";
    currency?: "NGN" | "USD";
    activeOnly?: boolean;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.planType) queryParams.append("planType", params.planType);
      if (params?.currency) queryParams.append("currency", params.currency);
      if (params?.activeOnly !== undefined)
        queryParams.append("activeOnly", params.activeOnly.toString());

      const response = await api.get(
        `/subscription-plans?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  // Get specific plan by type and name
  getPlanByTypeAndName: async (
    planType: "vendor" | "event_planner",
    planName: string,
    currency?: "NGN" | "USD"
  ) => {
    try {
      const queryParams = currency ? `?currency=${currency}` : "";
      const response = await api.get(
        `/subscription-plans/find/${planType}/${planName}${queryParams}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching plan by type and name:", error);
      throw error;
    }
  },

  // Get plan by ID
  getPlanById: async (id: string) => {
    try {
      const response = await api.get(`/subscription-plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching plan by ID:", error);
      throw error;
    }
  },
};

export const Subscription = {
  getPlans: async () => {
    try {
      const response = await api.get("/subscriptions/plans");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  subscribe: async (
    planId: string,
    paymentProvider: "flutterwave" | "paystack"
  ) => {
    try {
      const response = await api.post("/subscriptions/subscribe", {
        planId,
        paymentProvider,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error subscribing to plan:", error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await api.post("/subscriptions/cancel");
      return response.data;
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      throw error;
    }
  },

  getCurrentSubscription: async () => {
    try {
      const response = await api.get("/subscriptions/current");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching current subscription:", error);
      throw error;
    }
  },

  upgradeSubscription: async (newPlanId: string) => {
    try {
      const response = await api.post("/subscriptions/upgrade", { newPlanId });
      return response.data;
    } catch (error: any) {
      console.error("Error upgrading subscription:", error);
      throw error;
    }
  },

  getTrialStatus: async () => {
    try {
      const response = await api.get("/subscriptions/trial-status");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching trial status:", error);
      throw error;
    }
  },
};

// Export api as default for service files
export default api;
