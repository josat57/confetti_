import axios from "axios";
import {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanStats,
} from "@/types/plan-admin";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies for admin authentication
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data?.message);
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

class PlansService {
  private baseUrl = "/admin/subscription-plans";

  /**
   * Get all plans
   */
  async getPlans(params?: {
    planType?: string;
    isActive?: boolean;
  }): Promise<{ plans: Plan[] }> {
    const queryParams = new URLSearchParams();
    if (params?.planType) queryParams.append("planType", params.planType);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    // Backend returns { status, data: { plans } } or { status, plans }
    return {
      plans:
        response.data.data?.plans ||
        response.data.plans ||
        response.data.data ||
        [],
    };
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<{ plan: Plan }> {
    const response = await api.get(`${this.baseUrl}/${planId}`);
    return {
      plan:
        response.data.data?.plan || response.data.plan || response.data.data,
    };
  }

  /**
   * Create a new plan
   */
  async createPlan(planData: CreatePlanRequest): Promise<{
    plan: Plan;
    message: string;
  }> {
    // Add resourceType for audit logging
    const requestData = {
      ...planData,
      resourceType: "subscription-plan",
    };

    const response = await api.post(this.baseUrl, requestData);
    return {
      plan:
        response.data.data?.plan || response.data.plan || response.data.data,
      message: response.data.message || "Plan created successfully",
    };
  }

  /**
   * Update an existing plan
   */
  async updatePlan(
    planId: string,
    planData: Partial<UpdatePlanRequest>
  ): Promise<{
    plan: Plan;
    message: string;
  }> {
    // Add resourceType for audit logging
    const requestData = {
      ...planData,
      resourceType: "subscription-plan",
    };

    const response = await api.put(`${this.baseUrl}/${planId}`, requestData);
    return {
      plan:
        response.data.data?.plan || response.data.plan || response.data.data,
      message: response.data.message || "Plan updated successfully",
    };
  }

  /**
   * Delete a plan
   */
  async deletePlan(planId: string): Promise<{ message: string }> {
    // Add resourceType for audit logging via query param or body
    const response = await api.delete(`${this.baseUrl}/${planId}`, {
      data: { resourceType: "subscription-plan" },
    });
    return {
      message: response.data.message || "Plan deleted successfully",
    };
  }

  /**
   * Toggle plan active status (uses update endpoint)
   */
  async togglePlanStatus(
    planId: string,
    isActive: boolean
  ): Promise<{
    plan: Plan;
    message: string;
  }> {
    // Use the update endpoint to change isActive status
    return await this.updatePlan(planId, { isActive });
  }

  /**
   * Reorder plans (client-side only - updates sortOrder via updatePlan)
   */
  async reorderPlans(
    planOrders: Array<{ planId: string; sortOrder: number }>
  ): Promise<{
    message: string;
  }> {
    // Update each plan's sortOrder individually
    await Promise.all(
      planOrders.map((order) =>
        this.updatePlan(order.planId, { sortOrder: order.sortOrder })
      )
    );
    return {
      message: "Plans reordered successfully",
    };
  }

  /**
   * Get plan statistics (uses subscription statistics endpoint)
   */
  async getPlanStats(): Promise<{ stats: PlanStats }> {
    // Use the subscriptions statistics endpoint which includes plan data
    const response = await api.get("/admin/subscriptions/statistics");
    const backendStats =
      response.data.data?.statistics || response.data.statistics;

    // Transform to PlanStats format
    const stats: PlanStats = {
      totalPlans: backendStats.byPlanName?.length || 0,
      activePlans: 0, // Will be calculated from plans list
      inactivePlans: 0,
      byPlanType: {
        planner:
          backendStats.byPlanType?.find((p: any) => p._id === "planner")
            ?.count || 0,
        vendor:
          backendStats.byPlanType?.find((p: any) => p._id === "vendor")
            ?.count || 0,
      },
      totalSubscribers: backendStats.total || 0,
      subscribersByPlan:
        backendStats.byPlanName?.map((item: any) => ({
          planId: item._id.planName,
          planName: item._id.planName,
          count: item.count,
        })) || [],
    };

    return { stats };
  }

  /**
   * Duplicate a plan (client-side - creates new plan with copied data)
   */
  async duplicatePlan(planId: string): Promise<{
    plan: Plan;
    message: string;
  }> {
    // Get the original plan
    const { plan: originalPlan } = await this.getPlanById(planId);

    // Create a new plan with copied data
    const newPlanData: CreatePlanRequest = {
      planType: originalPlan.planType,
      planName: `${originalPlan.planName} Copy`,
      displayName: `${originalPlan.displayName} (Copy)`,
      description: originalPlan.description,
      billingCycle: originalPlan.billingCycle,
      pricing: originalPlan.pricing.map((p) => ({
        currency: p.currency,
        amount: p.amount,
        amountInMinorUnits: p.amountInMinorUnits,
      })),
      features: [...originalPlan.features],
      limitations: [...originalPlan.limitations],
      isActive: false, // Start as inactive
      isPopular: false,
      sortOrder: originalPlan.sortOrder + 1,
    };

    return await this.createPlan(newPlanData);
  }
}

export default new PlansService();
