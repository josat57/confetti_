/**
 * AI Event Planner Service
 * Handles all AI-powered event planning API calls
 */

import api from "@/api/api";

export interface EventPlanningRequest {
  eventType: string;
  budget: number;
  guestCount: number;
  date: string;
  location: string;
  duration: number; // in hours
  preferences: {
    theme?: string;
    style?: string;
    dietary?: string[];
    accessibility?: string[];
    entertainment?: string[];
    special_requests?: string;
  };
  clientInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

// Backend API Response Interfaces
export interface BackendPlanResponse {
  id: string;
  planId: string;
  title: string;
  description: string;
  status: "draft" | "active" | "refined" | "finalized" | "archived";
  eventType: string;
  lastModified: string;
  createdAt: string;
  viewCount: number;
  lastAccessed: string;
}

/** AI read of the client, from the backend's clientAnalysis */
export interface ClientAnalysis {
  clientPersonality?: string;
  culturalConsiderations?: string[];
  hiddenNeeds?: string[];
  successMetrics?: string[];
  personalizationOpportunities?: string[];
  confidenceScore?: number;
  aiModelsUsed?: string[];
}

/** What the most recent refinement changed, and why */
export interface PlanRefinement {
  type?: string;
  prompt?: string;
  changes: string[];
  reasoning?: string | null;
  impact?: string | null;
  suggestions: string[];
  refinedAt?: string;
}

export interface AIEventPlan {
  /** Use for refine/chat/result calls: saved planId, or the guest session token */
  id: string;
  planId?: string;
  /** Pass to submitPlanFeedback; null for guests and plan level 1 */
  learningInteractionId?: string | null;
  /** True when the backend already saved this plan to the user's account */
  autoSaved?: boolean;
  clientAnalysis?: ClientAnalysis | null;
  /** Budget advice from the backend (validation + optimization tips) */
  budgetTips?: string[];
  /** General mitigation advice that isn't tied to one risk */
  riskMitigations?: string[];
  /** Model advice about vendors (never fabricated vendor listings) */
  vendorAdvice?: string[];
  latestRefinement?: PlanRefinement | null;
  title?: string;
  description?: string;
  status?: "draft" | "active" | "refined" | "finalized" | "archived";
  eventType: string;
  budget: number;
  guestCount: number;
  date: string;
  location: string;
  viewCount?: number;
  lastAccessed?: string;

  // AI Generated Content
  timeline: {
    time: string;
    activity: string;
    duration?: number;
    notes?: string;
  }[];

  budgetBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    items: {
      item: string;
      cost: number;
      quantity: number;
      notes?: string;
    }[];
  }[];

  vendorRecommendations: {
    category: string;
    vendors: {
      id?: string;
      name: string;
      rating: number;
      reviewCount?: number;
      /** null when the vendor quotes on request */
      estimatedCost: number | null;
      description: string;
      contact?: string;
      /** 0-1; null when the vendor wasn't AI-scored */
      matchScore?: number | null;
      matchReasons?: string[];
    }[];
  }[];

  checklist: {
    category: string;
    tasks: {
      task: string;
      deadline: string;
      priority: "high" | "medium" | "low";
      completed: boolean;
      assignedTo?: string;
    }[];
  }[];

  riskAssessment: {
    risk: string;
    probability: "high" | "medium" | "low";
    impact: "high" | "medium" | "low";
    mitigation: string;
  }[];

  alternatives: {
    scenario: string;
    budgetImpact: number;
    description: string;
    pros: string[];
    cons: string[];
  }[];

  /** null: the backend doesn't assess sustainability yet */
  sustainability: {
    score: number;
    recommendations: string[];
    carbonFootprint: number;
    ecoFriendlyOptions: string[];
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  planId?: string;
}

export interface PlanningSession {
  id: string;
  title: string;
  status: "active" | "completed" | "archived";
  messages: ChatMessage[];
  currentPlan?: AIEventPlan;
  /** Plan created from this conversation (open via getEventPlan) */
  generatedPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

/** "flowers_decor" -> "Flowers Decor" */
const humanize = (key: string) =>
  String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const formatShortDate = (value: string) => {
  const date = new Date(value);
  return isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/** The backend's error message when there is one, otherwise the fallback */
const apiErrorMessage = (error: any, fallback: string) => {
  const status = error?.response?.status;
  if (status === 429) return "You've made too many requests. Please wait a while and try again.";
  if (status === 401) return "Please sign in to continue.";
  return error?.response?.data?.message || (!error?.response && error?.message) || fallback;
};

/** Backend chat session document -> PlanningSession */
const toPlanningSession = (raw: any): PlanningSession => ({
  id: raw._id || raw.id,
  title: raw.title || "Planning Session",
  status: raw.status || "active",
  generatedPlanId: raw.generatedPlanId || undefined,
  messages: (raw.messages || []).map(toChatMessage),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

const toChatMessage = (raw: any): ChatMessage => ({
  id: raw._id || raw.id,
  role: raw.role,
  content: raw.content,
  timestamp: raw.timestamp,
});

export const aiPlannerService = {
  /**
   * Create a new AI event plan using the analyze endpoint
   */
  async createEventPlan(request: EventPlanningRequest): Promise<AIEventPlan> {
    // Transform request to match planner AI backend format
    const payload = {
      eventType: request.eventType,
      eventDate: request.date,
      location: {
        address: request.location,
        city: request.location.split(",")[0]?.trim() || request.location,
        state: request.location.split(",")[1]?.trim() || "",
        country: request.location.split(",")[2]?.trim() || "Nigeria",
      },
      guestCount: request.guestCount,
      budget: {
        amount: request.budget,
        currency: "NGN",
      },
      eventDescription: `${request.eventType} event for ${
        request.guestCount
      } guests. Duration: ${request.duration} hours. ${
        request.preferences.special_requests || ""
      }`,
      guestClass: {
        formality: request.preferences.style || "formal",
        ageGroups: ["adults"],
        socialStatus: ["middle_class"],
        specialRequirements: request.preferences.accessibility || [],
        additionalDetails: request.preferences.special_requests || "",
      },
    };

    try {
      const response = await api.post("/ai-planner/generate", payload);
      const data = response.data?.data;
      if (!data?.eventPlan) {
        throw new Error("The AI planner didn't return a plan. Please try again.");
      }

      const plan = this.transformComprehensivePlan(data.eventPlan, {
        // resultId: saved planId for signed-in users, session token for guests
        id: data.resultId,
        planId: data.planId,
        autoSaved: data.autoSaved,
      });
      // Echo the request's own values for the header/overview
      return {
        ...plan,
        eventType: request.eventType,
        budget: request.budget,
        guestCount: request.guestCount,
        date: request.date,
        location: request.location,
      };
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Failed to generate your event plan"));
    }
  },

  /**
   * Backend riskAnalysis.riskCategories -> risk list (highest score first).
   * Mitigation is only set when the backend tied factors to that risk.
   */
  transformRiskAnalysis(riskAnalysis: any): AIEventPlan["riskAssessment"] {
    const categories = riskAnalysis?.riskCategories;
    if (!categories) return [];

    const labels: Record<string, string> = {
      financial: "Budget overrun",
      operational: "Operational and logistics issues",
      market: "Vendor market conditions",
      seasonal: "Seasonal demand (pricing and availability)",
      vendor: "Vendor reliability",
    };
    const level = (v: any): "low" | "medium" | "high" =>
      v === "high" || v === "medium" || v === "low" ? v : "medium";

    return Object.entries(categories)
      .filter(([, value]: [string, any]) => value && typeof value === "object")
      .sort(([, a]: [string, any], [, b]: [string, any]) => (b.score || 0) - (a.score || 0))
      .map(([key, value]: [string, any]) => ({
        risk: labels[key] || humanize(key),
        probability: level(value.level),
        impact: value.score >= 0.5 ? "high" : value.score >= 0.25 ? "medium" : "low",
        mitigation: Array.isArray(value.factors) ? value.factors.join("; ") : "",
      }));
  },

  /**
   * Backend planning timeline -> timeline rows. Handles the generated shape
   * ({ phases: [{ phase, tasks: [...] }] }) and refined plans, where the AI
   * may return a flat array of items.
   */
  transformIntelligentTimeline(timelineData: any): AIEventPlan["timeline"] {
    const row = (item: any, phase?: string) => {
      const due = item.deadline || item.date || item.dueDate;
      const notes = [
        due ? `Due ${formatShortDate(due)}` : null,
        item.priority ? `${item.priority} priority` : null,
        item.vendor || null,
        item.description || item.notes || null,
      ].filter(Boolean);
      return {
        time: phase || item.phase || item.time || item.timeframe || "",
        activity: item.task || item.activity || item.name || item.title || "",
        notes: notes.join(" · "),
      };
    };

    if (Array.isArray(timelineData?.phases)) {
      return timelineData.phases.flatMap((phase: any) =>
        (phase.tasks || []).map((task: any) => row(task, phase.phase))
      );
    }
    if (Array.isArray(timelineData)) {
      return timelineData
        .flatMap((item: any) =>
          Array.isArray(item?.tasks)
            ? item.tasks.map((task: any) => row(task, item.phase || item.timeframe))
            : [row(item || {})]
        )
        .filter((r: any) => r.activity);
    }
    return [];
  },

  /** Backend budgetBreakdown ({ breakdown: { [category]: {...} } }) -> categories */
  transformBudgetOptimization(budgetData: any): AIEventPlan["budgetBreakdown"] {
    const breakdown = budgetData?.breakdown;
    if (!breakdown || typeof breakdown !== "object") return [];

    return Object.entries(breakdown)
      .filter(([, cat]: [string, any]) => cat && typeof cat.amount === "number")
      // Priority 1 first; contingency (priority 0) last
      .sort(([, a]: [string, any], [, b]: [string, any]) =>
        (a.priority || 99) - (b.priority || 99))
      .map(([key, cat]: [string, any]) => ({
        category: humanize(key),
        amount: cat.amount,
        percentage: cat.percentage ?? 0,
        items: Array.isArray(cat.items) && cat.items.length > 0
          ? cat.items.map((item: any) => ({
              item: item.name || item.item || "",
              cost: item.cost || 0,
              quantity: item.quantity || 1,
              notes: item.notes || undefined,
            }))
          : cat.purpose
            ? [{ item: cat.purpose, cost: cat.amount, quantity: 1 }]
            : [],
      }));
  },

  /** Checklist from the timeline phases, often-missed components and client analysis */
  generateChecklistFromBackendData(eventPlan: any): AIEventPlan["checklist"] {
    const checklist: AIEventPlan["checklist"] = [];
    const priority = (v: any): "high" | "medium" | "low" =>
      v === "critical" || v === "high" ? "high" : v === "low" ? "low" : "medium";

    for (const phase of eventPlan.timeline?.phases || []) {
      const tasks = (phase.tasks || []).map((task: any) => ({
        task: task.task,
        deadline: task.deadline ? formatShortDate(task.deadline) : phase.phase,
        priority: priority(task.priority),
        completed: task.status === "completed",
        assignedTo: task.vendor || undefined,
      }));
      if (tasks.length) checklist.push({ category: phase.phase, tasks });
    }

    const missed = (eventPlan.missedComponents || []).map((c: any) => ({
      task: c.reason ? `${c.component} — ${c.reason}` : c.component,
      deadline: "Before booking vendors",
      priority: priority(c.importance),
      completed: false,
    }));
    if (missed.length) checklist.push({ category: "Often missed", tasks: missed });

    const analysis = eventPlan.clientAnalysis || {};
    const aiTasks = [
      ...(analysis.hiddenNeeds || []).map((need: string) => ({
        task: need, deadline: "1 week before", priority: "medium" as const, completed: false,
      })),
      ...(analysis.personalizationOpportunities || []).map((idea: string) => ({
        task: idea, deadline: "3 days before", priority: "low" as const, completed: false,
      })),
    ];
    if (aiTasks.length) checklist.push({ category: "AI-recommended", tasks: aiTasks });

    return checklist;
  },

  /**
   * Generate alternatives from backend data
   */
  generateAlternativesFromBackendData(eventPlan: any, budget: number) {
    const upgradeRecs = eventPlan.upgradeRecommendations;
    const alternatives = [];

    if (upgradeRecs) {
      alternatives.push({
        scenario: `Upgrade to ${upgradeRecs.suggestedPlan} Plan`,
        budgetImpact: budget * 0.2, // Assume 20% increase for upgrade
        description:
          upgradeRecs.estimatedValue || "Enhanced features and capabilities",
        pros: upgradeRecs.benefits || [
          "Enhanced AI capabilities",
          "More vendor options",
        ],
        cons: ["Additional cost", "More complex features"],
      });

      if (upgradeRecs.newFeatures) {
        alternatives.push({
          scenario: "Current Plan Optimization",
          budgetImpact: 0,
          description: "Maximize current plan capabilities",
          pros: ["No additional cost", "Familiar features"],
          cons: upgradeRecs.newFeatures.map(
            (feature: string) => `Limited: ${feature}`
          ),
        });
      }
    }

    return alternatives.length > 0 ? alternatives : [];
  },

  /**
   * Backend vendorRecommendations.recommendations ([{ vendor, matchScore,
   * matchReasons, estimatedCost }]) -> vendors grouped by category.
   */
  transformVendorRecommendations(vendorData: any): AIEventPlan["vendorRecommendations"] {
    const recommendations = Array.isArray(vendorData?.recommendations)
      ? vendorData.recommendations
      : [];
    const groups = new Map<string, AIEventPlan["vendorRecommendations"][number]["vendors"]>();

    for (const rec of recommendations) {
      const v = rec?.vendor;
      if (!v?.name) continue;
      const category = humanize(v.category || "other");
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push({
        id: v.id,
        name: v.name,
        rating: v.rating || 0,
        reviewCount: v.reviewCount || 0,
        estimatedCost: typeof rec.estimatedCost === "number" && rec.estimatedCost > 0
          ? rec.estimatedCost
          : null,
        description: v.description || "",
        matchScore: typeof rec.matchScore === "number" ? rec.matchScore : null,
        matchReasons: rec.matchReasons || [],
      });
    }
    return Array.from(groups, ([category, vendors]) => ({ category, vendors }));
  },

  /**
   * Map the backend's eventPlan (generate, result and refine responses all
   * use this shape) to AIEventPlan. Sections the backend didn't produce stay
   * empty — nothing is filled with sample data.
   */
  transformComprehensivePlan(
    eventPlan: any,
    ids: { id?: string; planId?: string; autoSaved?: boolean } = {}
  ): AIEventPlan {
    const details = eventPlan.eventDetails || {};
    const loc = details.location || {};
    const location = [loc.city, loc.state, loc.country]
      .filter((part: string) => part && part !== "Not specified")
      .join(", ");
    const budget = details.budget?.amount ?? eventPlan.budgetBreakdown?.totalBudget ?? 0;
    const asText = (items: any[]) =>
      (items || []).map((x) => (typeof x === "string" ? x : x?.advice || x?.note || x?.name || JSON.stringify(x)));

    return {
      id: ids.id || eventPlan.planId || eventPlan.sessionToken,
      planId: ids.planId || eventPlan.planId,
      autoSaved: ids.autoSaved ?? Boolean(eventPlan.autoSaved),
      learningInteractionId: eventPlan.learningInteractionId ?? null,
      eventType: details.eventType || "event",
      budget,
      guestCount: details.guestCount || 0,
      date: details.eventDate || eventPlan.generatedAt || "",
      location,
      clientAnalysis: eventPlan.clientAnalysis || null,
      timeline: this.transformIntelligentTimeline(eventPlan.timeline),
      budgetBreakdown: this.transformBudgetOptimization(eventPlan.budgetBreakdown),
      budgetTips: [
        ...(eventPlan.budgetBreakdown?.validation?.recommendations || []),
        ...(eventPlan.budgetOptimizationTips || []),
      ],
      vendorRecommendations: this.transformVendorRecommendations(eventPlan.vendorRecommendations),
      vendorAdvice: asText(eventPlan.vendorRecommendations?.aiAdvice),
      checklist: this.generateChecklistFromBackendData(eventPlan),
      riskAssessment: this.transformRiskAnalysis(eventPlan.riskAnalysis),
      riskMitigations: eventPlan.riskAnalysis?.mitigationStrategies || [],
      alternatives: this.generateAlternativesFromBackendData(eventPlan, budget),
      sustainability: null,
      latestRefinement: eventPlan.latestRefinement || null,
      createdAt: eventPlan.generatedAt || new Date().toISOString(),
      updatedAt:
        eventPlan.latestRefinement?.refinedAt ||
        eventPlan.savedAt ||
        eventPlan.generatedAt ||
        new Date().toISOString(),
    };
  },

  /**
   * Get recent AI event plans on login (Backend Integration)
   */
  async getRecentPlans(params?: {
    limit?: number;
    includeArchived?: boolean;
  }): Promise<AIEventPlan[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.includeArchived)
        queryParams.append("includeArchived", "true");

      const response = await api.get(`/ai-planner/recent-plans?${queryParams}`);

      if (response.data?.status === "success" && response.data?.data?.plans) {
        return response.data.data.plans.map((plan: BackendPlanResponse) =>
          this.transformBackendPlan(plan)
        );
      }

      // Return empty array if no plans found
      return [];
    } catch (error: any) {
      console.error("Failed to fetch recent plans:", error);

      // If it's an authentication error, don't return mock data
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || "";
        if (
          errorMessage.includes("User no longer exists") ||
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("User not found")
        ) {
          // Let the error propagate to trigger logout
          throw error;
        }
      }

      // Return empty array on error instead of mock data
      return [];
    }
  },

  /**
   * Get all saved AI event plans for authenticated user (Backend Integration)
   */
  async getEventPlans(params?: {
    status?: string;
    eventType?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    plans: AIEventPlan[];
    total: number;
    totalPages: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      // Add query parameters
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.eventType) queryParams.append("eventType", params.eventType);

      const response = await api.get(`/ai-planner/plans?${queryParams}`);

      if (response.data?.status === "success" && response.data?.data) {
        const plans = response.data.data.plans.map(
          (plan: BackendPlanResponse) => this.transformBackendPlan(plan)
        );

        const pagination = response.data.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 9,
          total: plans.length,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        };

        return {
          plans,
          total: pagination.total,
          totalPages: pagination.pages,
          pagination,
        };
      }

      // Return empty result if no data
      return {
        plans: [],
        total: 0,
        totalPages: 0,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 9,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error: any) {
      console.error("Failed to fetch saved plans:", error);

      // If it's an authentication error, don't return mock data
      if (error?.response?.status === 401) {
        const errorMessage = error?.response?.data?.message || "";
        if (
          errorMessage.includes("User no longer exists") ||
          errorMessage.includes("Invalid token") ||
          errorMessage.includes("User not found")
        ) {
          // Let the error propagate to trigger logout
          throw error;
        }
      }

      // Return empty result on error
      return {
        plans: [],
        total: 0,
        totalPages: 0,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 9,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  /**
   * Transform backend plan response to frontend format
   */
  transformBackendPlan(backendPlan: BackendPlanResponse): AIEventPlan {
    // Parse description to extract basic info
    const descriptionParts = (backendPlan.description ?? "").split(" • ");
    let budget = 0;
    let guestCount = 0;
    let location = "";

    descriptionParts.forEach((part) => {
      if (part.includes("guests")) {
        const match = part.match(/(\d+)\s+guests/);
        if (match) guestCount = parseInt(match[1]);
      }
      if (part.includes("Budget:")) {
        const match = part.match(/Budget:\s*\w+\s*([\d,]+)/);
        if (match) budget = parseInt(match[1].replace(/,/g, ""));
      }
      if (part.includes("Location:")) {
        location = part.replace("Location:", "").trim();
      }
    });

    return {
      id: backendPlan.id,
      planId: backendPlan.planId,
      title: backendPlan.title,
      description: backendPlan.description,
      status: backendPlan.status,
      eventType: backendPlan.eventType,
      budget,
      guestCount,
      date: backendPlan.createdAt, // Use createdAt as date for now
      location,
      viewCount: backendPlan.viewCount,
      lastAccessed: backendPlan.lastAccessed,
      timeline: [],
      budgetBreakdown: [],
      vendorRecommendations: [],
      checklist: [],
      riskAssessment: [],
      alternatives: [],
      sustainability: {
        score: 0,
        recommendations: [],
        carbonFootprint: 0,
        ecoFriendlyOptions: [],
      },
      createdAt: backendPlan.createdAt,
      updatedAt: backendPlan.lastModified,
    };
  },

  /**
   * Transform saved plan from backend to frontend format (legacy support)
   */
  transformSavedPlan(backendPlan: any): AIEventPlan {
    // Handle both new backend format and legacy format
    if (backendPlan.planId && backendPlan.title) {
      return this.transformBackendPlan(backendPlan);
    }

    return {
      id: backendPlan._id || backendPlan.sessionToken || backendPlan.id,
      eventType: backendPlan.eventType || "event",
      budget: backendPlan.budget || 0,
      guestCount: backendPlan.guestCount || 0,
      date: backendPlan.eventDate || backendPlan.date,
      location: backendPlan.location || "",
      timeline: backendPlan.timeline || [],
      budgetBreakdown: backendPlan.budgetBreakdown || [],
      vendorRecommendations: backendPlan.vendorRecommendations || [],
      checklist: backendPlan.checklist || [],
      riskAssessment: backendPlan.riskAssessment || [],
      alternatives: backendPlan.alternatives || [],
      sustainability: backendPlan.sustainability || {
        score: 0,
        recommendations: [],
        carbonFootprint: 0,
        ecoFriendlyOptions: [],
      },
      createdAt: backendPlan.createdAt || new Date().toISOString(),
      updatedAt: backendPlan.updatedAt || new Date().toISOString(),
    };
  },

  /**
   * Get a plan by saved planId or guest session token (Backend Integration)
   */
  async getEventPlan(id: string): Promise<AIEventPlan> {
    try {
      const response = await api.get(`/ai-planner/result/${id}`);
      const data = response.data?.data;
      if (response.data?.status === "success" && data?.eventPlan) {
        return this.transformComprehensivePlan(data.eventPlan, {
          id,
          autoSaved: data.metadata?.resultType === "saved",
        });
      }
      throw new Error("Plan not found");
    } catch (error: any) {
      console.error("Failed to fetch event plan:", error);
      if (error?.response?.status === 404) throw new Error("Plan not found or expired");
      throw new Error(apiErrorMessage(error, "Failed to fetch event plan"));
    }
  },

  /**
   * Update an existing event plan (Backend Integration)
   */
  async updateEventPlan(
    id: string,
    updates: Partial<EventPlanningRequest>
  ): Promise<AIEventPlan> {
    try {
      const response = await api.put(`/ai-planner/plans/${id}`, updates);

      if (response.data?.status === "success" && response.data?.data?.plan) {
        return this.transformSavedPlan(response.data.data.plan);
      }

      throw new Error("Failed to update plan");
    } catch (error: any) {
      console.error("Failed to update plan:", error);

      // Handle specific error cases
      if (error?.response?.status === 404) {
        throw new Error("Plan not found");
      }

      if (error?.response?.status === 401) {
        throw new Error("Authentication required");
      }

      throw new Error("Failed to update event plan");
    }
  },

  /**
   * Refine an existing plan with AI (Backend Integration). Returns the full
   * refined plan; its latestRefinement says what changed.
   */
  async refinePlan(
    planId: string,
    prompt: string,
    enhancementType?:
      | "timeline"
      | "budget"
      | "vendors"
      | "risks"
      | "sustainability"
      | "general"
  ): Promise<AIEventPlan> {
    try {
      const response = await api.post(`/ai-planner/refine/${planId}`, {
        refinementPrompt: prompt,
        refinementType: enhancementType || "general",
      });
      const refined = response.data?.data?.refinedPlan;
      if (response.data?.status === "success" && refined) {
        // Saved plans and session plans both carry the plan under aiPlan
        return this.transformComprehensivePlan(refined.aiPlan || refined, {
          id: planId,
          planId: refined.planId,
        });
      }
      throw new Error("Failed to refine plan");
    } catch (error: any) {
      console.error("Failed to refine plan:", error);
      if (error?.response?.status === 404) throw new Error("Plan not found or expired");
      throw new Error(apiErrorMessage(error, "Failed to refine plan. Please try again."));
    }
  },

  /**
   * Get user plans using alternative alias endpoint (Backend Integration)
   */
  async getMyPlans(params?: {
    status?: string;
    eventType?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    plans: AIEventPlan[];
    total: number;
    totalPages: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();

      // Add query parameters
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.eventType) queryParams.append("eventType", params.eventType);

      const response = await api.get(`/ai-planner/my-plans?${queryParams}`);

      if (response.data?.status === "success" && response.data?.data) {
        const plans = response.data.data.plans.map(
          (plan: BackendPlanResponse) => this.transformBackendPlan(plan)
        );

        const pagination = response.data.data.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 9,
          total: plans.length,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        };

        return {
          plans,
          total: pagination.total,
          totalPages: pagination.pages,
          pagination,
        };
      }

      // Return empty result if no data
      return {
        plans: [],
        total: 0,
        totalPages: 0,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 9,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error: any) {
      console.error("Failed to fetch my plans:", error);
      throw error;
    }
  },

  /**
   * Enhance an existing plan with AI prompting (alias for refinePlan)
   */
  async enhancePlan(
    planId: string,
    prompt: string,
    enhancementType?:
      | "timeline"
      | "budget"
      | "vendors"
      | "risks"
      | "sustainability"
      | "general"
  ): Promise<AIEventPlan> {
    return this.refinePlan(planId, prompt, enhancementType);
  },

  /**
   * Chat with AI about a specific plan (Backend Integration). Errors are
   * thrown so the UI can say so — there is no scripted fallback.
   */
  async chatWithAI(
    planId: string,
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<{ response: string; updatedPlan?: AIEventPlan }> {
    const previousMessages = (conversationHistory || [])
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    const response = await api.post(`/ai-planner/plans/${planId}/chat`, {
      message,
      context: { previousMessages },
    });
    const reply = response.data?.data?.response;
    if (response.data?.status !== "success" || typeof reply !== "string") {
      throw new Error("Failed to get AI response");
    }
    return { response: reply };
  },

  /**
   * Rate a generated plan (1-5). interactionId is plan.learningInteractionId;
   * when omitted the backend rates the user's most recent plan.
   */
  async submitPlanFeedback(params: {
    rating: number;
    comments?: string;
    interactionId?: string | null;
  }): Promise<void> {
    try {
      await api.post("/ai-planner/feedback", {
        rating: params.rating,
        comments: params.comments || "",
        ...(params.interactionId && { interactionId: params.interactionId }),
      });
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Couldn't save your rating. Please try again."));
    }
  },

  /**
   * Delete an event plan (Backend Integration)
   */
  async deleteEventPlan(id: string): Promise<void> {
    try {
      const response = await api.delete(`/ai-planner/plans/${id}`);

      if (response.data?.status !== "success") {
        throw new Error("Failed to delete plan");
      }
    } catch (error: any) {
      console.error("Failed to delete plan:", error);

      // Handle specific error cases
      if (error?.response?.status === 404) {
        throw new Error("Plan not found");
      }

      if (error?.response?.status === 401) {
        throw new Error("Authentication required");
      }

      throw new Error("Failed to delete event plan");
    }
  },

  /**
   * Start a saved chat session with the AI planning assistant
   */
  async startPlanningSession(title: string): Promise<PlanningSession> {
    try {
      const response = await api.post("/ai-planner/sessions", { title });
      return toPlanningSession(response.data.data.session);
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Couldn't start a chat session"));
    }
  },

  /**
   * Your chat sessions, most recent first (without messages)
   */
  async getPlanningSessions(): Promise<PlanningSession[]> {
    try {
      const response = await api.get("/ai-planner/sessions");
      return (response.data?.data?.sessions || []).map(toPlanningSession);
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Couldn't load chat sessions"));
    }
  },

  /**
   * A chat session with its messages
   */
  async getPlanningSession(id: string): Promise<PlanningSession> {
    try {
      const response = await api.get(`/ai-planner/sessions/${id}`);
      return toPlanningSession(response.data.data.session);
    } catch (error: any) {
      if (error?.response?.status === 404) throw new Error("Chat session not found");
      throw new Error(apiErrorMessage(error, "Couldn't load the chat session"));
    }
  },

  /**
   * Send a message in a chat session. The server stores both the message and
   * the assistant's reply; returns the reply.
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await api.post(`/ai-planner/sessions/${sessionId}/messages`, {
        message,
      });
      return toChatMessage(response.data.data.assistantMessage);
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Failed to get AI response"));
    }
  },

  /**
   * Generate a full plan from the event details discussed in a chat session
   */
  async generatePlanFromChat(sessionId: string): Promise<AIEventPlan> {
    try {
      const response = await api.post(`/ai-planner/sessions/${sessionId}/generate-plan`);
      const { resultId, autoSaved } = response.data.data;
      const plan = await this.getEventPlan(resultId);
      return { ...plan, autoSaved };
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Failed to generate a plan from this chat"));
    }
  },

  /**
   * Get AI suggestions for improvements (mock implementation for now)
   */
  async getAISuggestions(planId: string): Promise<{
    suggestions: {
      category: string;
      suggestion: string;
      impact: "high" | "medium" | "low";
      effort: "high" | "medium" | "low";
    }[];
  }> {
    return { suggestions: [] };
  },

  /**
   * Download a plan as PDF or JSON (saved planId, session token or share token)
   */
  async exportPlan(planId: string, format: "pdf" | "json"): Promise<Blob> {
    try {
      const response = await api.get(`/ai-planner/plans/${planId}/export`, {
        params: { format },
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      // Error bodies arrive as a Blob when responseType is "blob"
      let message: string | undefined;
      try {
        message = JSON.parse(await error?.response?.data?.text())?.message;
      } catch {
        // not JSON
      }
      throw new Error(message || apiErrorMessage(error, "Failed to export plan"));
    }
  },

  /**
   * Email a read-only link to a saved plan. Returns the link.
   */
  async sharePlan(
    planId: string,
    clientEmail: string,
    message?: string
  ): Promise<{ shareUrl: string }> {
    try {
      const response = await api.post(`/ai-planner/plans/${planId}/share`, {
        email: clientEmail,
        message: message || "",
      });
      return { shareUrl: response.data.data.shareUrl };
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Failed to share plan"));
    }
  },

  /**
   * Draft a quote from a saved plan's budget (vendors). Returns the quote id.
   */
  async convertToQuote(
    planId: string,
    customer: { name: string; email: string; phone?: string }
  ): Promise<{ quoteId: string }> {
    try {
      const response = await api.post(`/ai-planner/plans/${planId}/quote`, {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      });
      return { quoteId: response.data.data.quoteId };
    } catch (error: any) {
      throw new Error(apiErrorMessage(error, "Failed to convert to quote"));
    }
  },

};

export default aiPlannerService;
