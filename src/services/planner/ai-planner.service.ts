import api from "@/api/api";

export interface AIPlanRequest {
  eventType: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  guestClass?: string;
  preferences?: string[];
}

export interface TimelineItem {
  task: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  category: string;
  description?: string;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  description?: string;
}

export interface VendorRecommendation {
  category: string;
  vendors: Array<{
    name: string;
    rating: number;
    priceRange: string;
    estimatedCost?: number;
  }>;
}

export interface AIPlanResult {
  timeline: TimelineItem[];
  budgetBreakdown: BudgetCategory[];
  vendorRecommendations: VendorRecommendation[];
  tips: string[];
  estimatedTotalCost?: number;
}

export interface AIPlanResponse {
  plan: AIPlanResult;
  sessionId: string;
}

class AIPlannerService {
  private baseUrl = "/planner/ai";

  /**
   * Generate AI event plan
   */
  async generatePlan(request: AIPlanRequest): Promise<AIPlanResponse> {
    const response = await api.post(`${this.baseUrl}/generate-plan`, request);
    return response.data;
  }

  /**
   * Suggest vendors for specific category
   */
  async suggestVendors(
    eventId: string,
    category: string,
    budget: number,
    location: string
  ): Promise<{ vendors: VendorRecommendation[] }> {
    const response = await api.post(`${this.baseUrl}/suggest-vendors`, {
      eventId,
      category,
      budget,
      location,
    });
    return response.data;
  }

  /**
   * Optimize budget allocation
   */
  async optimizeBudget(
    eventId: string,
    currentBudget: any,
    constraints?: any
  ): Promise<{ optimizedBudget: BudgetCategory[]; savings: number }> {
    const response = await api.post(`${this.baseUrl}/optimize-budget`, {
      eventId,
      currentBudget,
      constraints,
    });
    return response.data;
  }

  /**
   * Save AI generated plan as event
   */
  async savePlan(sessionId: string, eventData: any): Promise<{ event: any }> {
    const response = await api.post(`${this.baseUrl}/save-plan`, {
      sessionId,
      eventData,
    });
    return response.data;
  }

  /**
   * Get AI usage statistics
   */
  async getUsage(): Promise<{ usage: any }> {
    const response = await api.get(`${this.baseUrl}/usage`);
    return response.data;
  }
}

export const aiPlannerService = new AIPlannerService();
