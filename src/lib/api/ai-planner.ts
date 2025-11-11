import axios from "axios";
import {
  EventPlanFormData,
  APIResponse,
  AnalyzeEventResponse,
  GetResultResponse,
} from "@/types/ai-planner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1";

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
 * Analyze event and generate AI-powered event plan
 */
export const analyzeEvent = async (
  formData: EventPlanFormData
): Promise<AnalyzeEventResponse> => {
  const payload = {
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
    eventDescription: formData.eventDescription,
    guestClass: {
      ageGroups: formData.guestClass.ageGroups,
      formality: formData.guestClass.formality,
      socialStatus: formData.guestClass.socialStatus,
      specialRequirements: formData.guestClass.specialRequirements,
      additionalDetails: formData.guestClass.additionalDetails,
    },
    budget: {
      amount: formData.budget.amount,
      currency: formData.budget.currency,
    },
  };

  // Log payload for debugging
  console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));

  try {
    const response = await apiClient.post<APIResponse<AnalyzeEventResponse>>(
      "/ai-planner/analyze",
      payload
    );

    if (response.data.status === "success" && response.data.data) {
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

    // Re-throw with more context
    if (error.code) {
      throw new Error(`${error.code}: ${error.message || "Bad request"}`);
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
  const response = await apiClient.post<APIResponse<any>>("/ai-planner/save", {
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

export default {
  analyzeEvent,
  getEventPlanResult,
  saveEventPlan,
  getFullEventPlan,
  healthCheck,
  canSubmitRequest,
  getMinutesUntilReset,
};
