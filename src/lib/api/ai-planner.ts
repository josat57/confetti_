import axios from "axios";
import {
  EventPlanFormData,
  APIResponse,
  AnalyzeEventResponse,
  GetResultResponse,
} from "@/types/ai-planner";
import { guestSessionService } from "@/services/guest-session.service";
import aiPlannerService, {
  EventPlanningRequest,
} from "@/services/ai-planner.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Add guest session headers if not authenticated
      const guestHeaders = guestSessionService.getGuestSessionHeaders();
      Object.assign(config.headers, guestHeaders);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Store rate limit info if available
    const rateLimitRemaining = response.headers["x-ratelimit-remaining"];
    const rateLimitReset = response.headers["x-ratelimit-reset"];

    if (rateLimitRemaining !== undefined) {
      localStorage.setItem(
        "ai_planner_rate_limit_remaining",
        rateLimitRemaining
      );
    }
    if (rateLimitReset !== undefined) {
      localStorage.setItem("ai_planner_rate_limit_reset", rateLimitReset);
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error - throw the full error object
      throw error.response.data;
    } else if (error.request) {
      // Request made but no response
      throw {
        status: "error",
        code: "NETWORK_ERROR",
        message: "No response from server. Please check your connection.",
      };
    } else {
      // Something else happened
      throw {
        status: "error",
        code: "UNKNOWN_ERROR",
        message: error.message || "An unexpected error occurred",
      };
    }
  }
);

/**
 * Check if user can submit a new request (rate limit check)
 */
export const canSubmitRequest = (): {
  canSubmit: boolean;
  remaining: number;
  resetTime: number;
} => {
  const remaining = parseInt(
    localStorage.getItem("ai_planner_rate_limit_remaining") || "5"
  );
  const resetTime = parseInt(
    localStorage.getItem("ai_planner_rate_limit_reset") || "0"
  );

  const now = Date.now();
  const canSubmit = remaining > 0 || now > resetTime;

  return {
    canSubmit,
    remaining: canSubmit ? remaining : 0,
    resetTime,
  };
};

/**
 * Get minutes until rate limit resets
 */
export const getMinutesUntilReset = (): number => {
  const resetTime = parseInt(
    localStorage.getItem("ai_planner_rate_limit_reset") || "0"
  );
  const now = Date.now();
  const diff = resetTime - now;
  return Math.ceil(diff / 1000 / 60);
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("authToken");
};

/**
 * Ensure guest session exists for non-authenticated users
 */
const ensureGuestSession = async (): Promise<string | null> => {
  if (isAuthenticated()) {
    return null; // No guest session needed for authenticated users
  }

  try {
    const session = await guestSessionService.getOrCreateGuestSession();
    return session.guestSessionToken;
  } catch (error) {
    console.error("Failed to ensure guest session:", error);
    return null;
  }
};

/**
 * Analyze event and generate AI-powered event plan
 */
export const analyzeEvent = async (
  formData: EventPlanFormData
): Promise<AnalyzeEventResponse> => {
  // Ensure guest session exists for non-authenticated users
  const guestSessionToken = await ensureGuestSession();

  const payload = {
    // Core event information
    eventType: formData.eventType,
    eventDate: formData.eventDate.toISOString(),
    guestCount: formData.guestCount,
    location: {
      city: formData.location.city,
      state: formData.location.state,
      country: formData.location.country || "Nigeria",
      address: formData.location.address,
      // Backend expects coordinates as [longitude, latitude] array (optional)
      ...(formData.location.longitude && formData.location.latitude
        ? {
            coordinates: [
              formData.location.longitude,
              formData.location.latitude,
            ],
          }
        : {}),
    },
    budget: {
      amount: formData.budget.amount,
      currency: formData.budget.currency,
    },

    // Enhanced form data (optional)
    ...(formData.eventDuration && {
      eventDuration: formData.eventDuration,
    }),
    ...(formData.venuePreferences && {
      venuePreferences: formData.venuePreferences,
    }),
    ...(formData.budgetBreakdown && {
      budgetBreakdown: formData.budgetBreakdown,
    }),
    ...(formData.guestProfile && {
      guestProfile: formData.guestProfile,
    }),
    ...(formData.clientProfile && {
      clientProfile: formData.clientProfile,
    }),
    ...(formData.eventSpecific && {
      eventSpecific: formData.eventSpecific,
    }),
    ...(formData.specialRequirements && {
      specialRequirements: formData.specialRequirements,
    }),

    // Legacy fields for backward compatibility
    ...(formData.eventDescription && {
      eventDescription: formData.eventDescription,
    }),
    ...(formData.guestClass && {
      guestClass: {
        ageGroups: formData.guestClass.ageGroups,
        formality: formData.guestClass.formality,
        socialStatus: formData.guestClass.socialStatus,
        specialRequirements: formData.guestClass.specialRequirements,
        additionalDetails: formData.guestClass.additionalDetails,
      },
    }),

    // Include guest session token in payload as fallback
    ...(guestSessionToken ? { guestSessionToken } : {}),
  };

  // Validate required fields
  if (!payload.eventType) {
    throw new Error("Event type is required");
  }
  if (!payload.eventDate) {
    throw new Error("Event date is required");
  }
  if (!payload.guestCount || payload.guestCount <= 0) {
    throw new Error("Guest count must be greater than 0");
  }
  if (!payload.location?.city) {
    throw new Error("Location city is required");
  }
  if (!payload.budget?.amount || payload.budget.amount <= 0) {
    throw new Error("Budget amount must be greater than 0");
  }

  // Log payload for debugging
  console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));

  try {
    console.log(
      "Making API request to /ai-planner/generate with payload:",
      payload
    );
    const response = await apiClient.post<APIResponse<AnalyzeEventResponse>>(
      "/ai-planner/generate",
      payload
    );
    console.log("API response received:", response.data);

    if (response.data.status === "success" && response.data.data) {
      // Store plan result for guest sessions
      if (!isAuthenticated() && response.data.data) {
        guestSessionService.storePlanResult(response.data.data);

        // Update session info if provided in response
        if ((response.data.data as any).guestSession) {
          guestSessionService.storeSessionInfo(
            (response.data.data as any).guestSession
          );
        }
      }

      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to analyze event");
  } catch (error: any) {
    // Log detailed error information
    console.error("API Error Details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      data: error.data,
      fullError: error,
    });

    // If the endpoint doesn't exist (404) or there's a server error (5xx), try fallback
    if (error.response?.status === 404 || error.response?.status >= 500) {
      console.log("Primary endpoint failed, trying fallback service...");

      try {
        // Transform EventPlanFormData to EventPlanningRequest
        const fallbackRequest: EventPlanningRequest = {
          eventType: formData.eventType,
          budget: formData.budget.amount,
          guestCount: formData.guestCount,
          date: formData.eventDate.toISOString(),
          location: `${formData.location.city}, ${formData.location.state}, ${formData.location.country}`,
          duration: formData.eventDuration
            ? (() => {
                const start = parseInt(
                  formData.eventDuration.startTime.split(":")[0]
                );
                const end = parseInt(
                  formData.eventDuration.endTime.split(":")[0]
                );
                return end > start ? end - start : 4;
              })()
            : 4, // Default 4 hours
          preferences: {
            theme:
              formData.eventSpecific?.weddingSpecific?.ceremonyType ||
              formData.eventSpecific?.corporateSpecific?.eventPurpose ||
              formData.eventSpecific?.birthdaySpecific?.theme ||
              "",
            style: formData.guestClass?.formality || "casual",
            dietary: [], // Not available in SpecialRequirementsData
            accessibility: [], // Not available in SpecialRequirementsData
            entertainment: [],
            special_requests:
              formData.specialRequirements?.customRequirements ||
              formData.eventDescription ||
              "",
          },
          clientInfo: {
            name: "Guest User", // ClientProfileData doesn't have simple name field
            email: "guest@example.com", // ClientProfileData doesn't have simple email field
            phone: "", // ClientProfileData doesn't have simple phone field
          },
        };

        const fallbackResult = await aiPlannerService.createEventPlan(
          fallbackRequest
        );

        // Transform AIEventPlan to AnalyzeEventResponse format
        const transformedResult: AnalyzeEventResponse = {
          sessionToken: fallbackResult.id || "fallback-session",
          eventPlan: fallbackResult as any, // AIEventPlan needs to be transformed to EventPlanTeaser
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        };

        return transformedResult;
      } catch (fallbackError) {
        console.error("Fallback service also failed:", fallbackError);
        throw new Error("Both primary and fallback services are unavailable");
      }
    }

    throw error;
  }
};

/**
 * Get event plan result by session token
 */
export const getEventPlanResult = async (
  sessionToken: string
): Promise<GetResultResponse> => {
  const response = await apiClient.get<APIResponse<GetResultResponse>>(
    `/ai-planner/result/${sessionToken}`
  );

  if (response.data.status === "success" && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to retrieve event plan");
};

/**
 * Save event plan to user account (requires authentication)
 */
export const saveEventPlan = async (sessionToken: string): Promise<any> => {
  const response = await apiClient.post<APIResponse<any>>("/ai-planner/save-plan", {
    sessionToken,
  });

  if (response.data.status === "success") {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to save event plan");
};

/**
 * Get full event plan (requires authentication)
 */
export const getFullEventPlan = async (eventId: string): Promise<any> => {
  const response = await apiClient.get<APIResponse<any>>(
    `/ai-planner/full/${eventId}`
  );

  if (response.data.status === "success" && response.data.data) {
    return response.data.data;
  }

  throw new Error(
    response.data.message || "Failed to retrieve full event plan"
  );
};

/**
 * Health check for AI Event Planner service
 */
export const healthCheck = async (): Promise<any> => {
  const response = await apiClient.get<APIResponse<any>>("/ai-planner/health");

  if (response.data.status === "success") {
    return response.data.data;
  }

  throw new Error("Health check failed");
};

/**
 * Refine event plan (works for both authenticated and guest users)
 */
export const refineEventPlan = async (
  resultId: string,
  refinementPrompt: string,
  refinementType: string = "general"
): Promise<any> => {
  // Ensure guest session exists for non-authenticated users
  const guestSessionToken = await ensureGuestSession();

  const payload = {
    refinementPrompt,
    refinementType,
    // Include guest session token in payload as fallback
    ...(guestSessionToken ? { guestSessionToken } : {}),
  };

  try {
    const response = await apiClient.post(
      `/ai-planner/refine/${resultId}`,
      payload
    );

    if (response.data?.status === "success" && response.data?.data) {
      // Store updated plan result for guest sessions
      if (!isAuthenticated() && response.data.data) {
        guestSessionService.storePlanResult(response.data.data);
      }

      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to refine event plan");
  } catch (error: any) {
    console.error("Failed to refine event plan:", error);
    throw new Error(
      error.response?.data?.message || "Failed to refine event plan"
    );
  }
};

/**
 * Convert guest session to authenticated account.
 * Auth is handled via httpOnly cookie automatically.
 */
export const convertGuestSession = async (): Promise<any> => {
  try {
    const result = await guestSessionService.convertGuestSession();
    return result;
  } catch (error: any) {
    console.error("Failed to convert guest session:", error);
    throw error;
  }
};

export default {
  analyzeEvent,
  getEventPlanResult,
  saveEventPlan,
  getFullEventPlan,
  healthCheck,
  canSubmitRequest,
  getMinutesUntilReset,
  refineEventPlan,
  convertGuestSession,
  ensureGuestSession,
};
