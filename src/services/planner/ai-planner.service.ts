import api from "@/api/api";

export interface AIPlanRequest {
  eventType: string;
  eventDate: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  guestCount: number;
  budget: {
    amount: number;
    currency: string;
  };
  eventDescription: string;
  guestClass: {
    formality: string;
    ageGroups: string[];
    socialStatus: string[];
    specialRequirements: string[];
    additionalDetails: string;
  };
}

export interface EventSummary {
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  formality: string;
}

export interface BudgetCategory {
  name: string;
  percentage: number;
  amount: number;
  confidence?: number;
  description: string;
}

export interface BudgetBreakdown {
  categories: BudgetCategory[];
  totalAllocated: number;
  contingency: number;
  feasibilityScore?: number;
}

export interface VendorCategory {
  name: string;
  category: string;
  description: string;
  estimatedCost: {
    min: number;
    max: number;
  };
  allocatedAmount?: number;
  priority: string;
  locked: boolean;
  vendorCount: number;
}

export interface TimelineMilestone {
  title: string;
  timeframe: string;
  description: string;
  status?: string;
}

export interface EventDayHighlight {
  time: string;
  activity: string;
}

export interface Timeline {
  planningMilestones: TimelineMilestone[];
  eventDayHighlights: EventDayHighlight[];
  detailedTimelineLocked: boolean;
  metadata?: {
    generatedAt: string;
    processingTime: number;
    daysUntilEvent: number;
  };
}

export interface AIPlanResult {
  eventSummary: EventSummary;
  budgetBreakdown: BudgetBreakdown;
  vendorCategories: VendorCategory[];
  timeline: Timeline;
  recommendations: string[];
  aiInsights?: {
    sentiment?: {
      score: number;
      label: string;
    };
    keywords?: string[];
    feasibilityScore?: number;
    budgetLevel?: string;
  };
}

export interface AIPlanResponse {
  plan: AIPlanResult;
  sessionId: string;
}

class AIPlannerService {
  private baseUrl = "/ai-planner";

  /**
   * Generate AI event plan
   */
  async generatePlan(request: AIPlanRequest): Promise<AIPlanResponse> {
    const response = await api.post(`${this.baseUrl}/generate`, request);

    // Map backend response to expected format
    return {
      plan: response.data.data.eventPlan,
      sessionId: response.data.data.sessionToken,
    };
  }

  /**
   * Suggest vendors for specific category
   */
  async suggestVendors(
    eventId: string,
    category: string,
    budget: number,
    location: string
  ): Promise<{ vendors: any[] }> {
    const response = await api.post(`${this.baseUrl}/recommend-vendors`, {
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
   * Get user's AI plans
   */
  async getMyPlans(): Promise<{ plans: any[] }> {
    const response = await api.get(`${this.baseUrl}/my-plans`);
    return response.data;
  }
}

export const aiPlannerService = new AIPlannerService();
