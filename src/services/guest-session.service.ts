/**
 * Guest Session Management Service
 * Handles guest session creation, storage, and management for non-authenticated users
 */

import api from "@/api/api";

export interface GuestSession {
  sessionToken: string;
  planLevel: number;
  totalPlansGenerated: number;
  totalRefinements: number;
  expiresAt: string;
  availableFeatures: {
    aiModels: string[];
    vendorRecommendations: number;
    visualSuggestions: string;
    marketInsights: boolean;
  };
}

export interface GuestSessionPlan {
  sessionToken: string;
  title: string;
  eventType: string;
  createdAt: string;
  guestCount?: number;
  budget?: number;
  location?: string;
}

export interface CreateGuestSessionResponse {
  guestSessionToken: string;
  session: GuestSession;
}

export interface GuestSessionInfoResponse {
  session: GuestSession;
  plans: GuestSessionPlan[];
}

export interface ConvertGuestSessionResponse {
  convertedPlans: Array<{
    originalSessionToken: string;
    newPlanId: string;
    title: string;
    eventType: string;
  }>;
  totalPlansConverted: number;
}

class GuestSessionService {
  private readonly STORAGE_KEY = "guestSessionToken";
  private readonly PLANS_STORAGE_KEY = "guestSessionPlans";
  private readonly SESSION_INFO_KEY = "guestSessionInfo";

  /**
   * Get stored guest session token
   */
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Store guest session token
   */
  storeToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  /**
   * Clear guest session data
   */
  clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PLANS_STORAGE_KEY);
    localStorage.removeItem(this.SESSION_INFO_KEY);
  }

  /**
   * Get stored session info
   */
  getStoredSessionInfo(): GuestSession | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(this.SESSION_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Store session info
   */
  storeSessionInfo(session: GuestSession): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.SESSION_INFO_KEY, JSON.stringify(session));
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session?: GuestSession): boolean {
    const sessionInfo = session || this.getStoredSessionInfo();
    if (!sessionInfo) return true;

    return new Date(sessionInfo.expiresAt) < new Date();
  }

  /**
   * Create a new guest session
   */
  async createGuestSession(): Promise<CreateGuestSessionResponse> {
    try {
      const response = await api.post("/ai-planner/guest-session");

      if (response.data?.status === "success" && response.data?.data) {
        const { guestSessionToken, session } = response.data.data;

        // Store token and session info
        this.storeToken(guestSessionToken);
        this.storeSessionInfo(session);

        return response.data.data;
      }

      throw new Error("Failed to create guest session");
    } catch (error: any) {
      console.error("Failed to create guest session:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create guest session"
      );
    }
  }

  /**
   * Get or create guest session
   */
  async getOrCreateGuestSession(): Promise<CreateGuestSessionResponse> {
    const existingToken = this.getStoredToken();
    const existingSession = this.getStoredSessionInfo();

    // If we have a valid session, return it
    if (
      existingToken &&
      existingSession &&
      !this.isSessionExpired(existingSession)
    ) {
      return {
        guestSessionToken: existingToken,
        session: existingSession,
      };
    }

    // Otherwise, create a new session
    return this.createGuestSession();
  }

  /**
   * Get guest session info
   */
  async getGuestSessionInfo(token?: string): Promise<GuestSessionInfoResponse> {
    const sessionToken = token || this.getStoredToken();

    if (!sessionToken) {
      throw new Error("No guest session token found");
    }

    try {
      const response = await api.get(
        `/ai-planner/guest-session/${sessionToken}`
      );

      if (response.data?.status === "success" && response.data?.data) {
        // Update stored session info
        this.storeSessionInfo(response.data.data.session);

        return response.data.data;
      }

      throw new Error("Failed to get guest session info");
    } catch (error: any) {
      console.error("Failed to get guest session info:", error);

      // If session not found, clear stored data
      if (error.response?.status === 404) {
        this.clearSession();
      }

      throw new Error(
        error.response?.data?.message || "Failed to get guest session info"
      );
    }
  }

  /**
   * Convert guest session to authenticated user account.
   * Auth is handled via httpOnly cookie — no token parameter needed.
   */
  async convertGuestSession(): Promise<ConvertGuestSessionResponse> {
    const guestSessionToken = this.getStoredToken();

    if (!guestSessionToken) {
      throw new Error("No guest session to convert");
    }

    try {
      const response = await api.post("/ai-planner/convert-guest-session", {
        guestSessionToken,
      });

      if (response.data?.status === "success" && response.data?.data) {
        // Clear guest session data after successful conversion
        this.clearSession();

        return response.data.data;
      }

      throw new Error("Failed to convert guest session");
    } catch (error: any) {
      console.error("Failed to convert guest session:", error);
      throw new Error(
        error.response?.data?.message || "Failed to convert guest session"
      );
    }
  }

  /**
   * Add guest session headers to API requests
   */
  getGuestSessionHeaders(): Record<string, string> {
    const token = this.getStoredToken();
    return token ? { "X-Guest-Session": token } : {};
  }

  /**
   * Check if user has guest session
   */
  hasGuestSession(): boolean {
    const token = this.getStoredToken();
    const session = this.getStoredSessionInfo();
    return !!(token && session && !this.isSessionExpired(session));
  }

  /**
   * Get guest session stats for UI display
   */
  getGuestSessionStats(): {
    hasSession: boolean;
    planLevel: number;
    totalPlans: number;
    daysRemaining: number;
    canUpgrade: boolean;
  } {
    const session = this.getStoredSessionInfo();

    if (!session || this.isSessionExpired(session)) {
      return {
        hasSession: false,
        planLevel: 0,
        totalPlans: 0,
        daysRemaining: 0,
        canUpgrade: false,
      };
    }

    const daysRemaining = Math.ceil(
      (new Date(session.expiresAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      hasSession: true,
      planLevel: session.planLevel,
      totalPlans: session.totalPlansGenerated,
      daysRemaining: Math.max(0, daysRemaining),
      canUpgrade: session.totalPlansGenerated >= 3,
    };
  }

  /**
   * Store plan result locally for guest sessions
   */
  storePlanResult(planData: any): void {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(this.PLANS_STORAGE_KEY);
    const plans = stored ? JSON.parse(stored) : [];

    const planSummary: GuestSessionPlan = {
      sessionToken: planData.sessionToken || planData.resultId,
      title: `${
        planData.eventType || "Event"
      } Plan - ${new Date().toLocaleDateString()}`,
      eventType: planData.eventType || "event",
      createdAt: new Date().toISOString(),
      guestCount: planData.guestCount,
      budget: planData.budget?.amount,
      location: planData.location?.city || planData.location,
    };

    // Add to beginning of array (most recent first)
    plans.unshift(planSummary);

    // Keep only last 10 plans
    const recentPlans = plans.slice(0, 10);

    localStorage.setItem(this.PLANS_STORAGE_KEY, JSON.stringify(recentPlans));
  }

  /**
   * Get stored guest plans
   */
  getStoredPlans(): GuestSessionPlan[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.PLANS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export const guestSessionService = new GuestSessionService();
export default guestSessionService;
