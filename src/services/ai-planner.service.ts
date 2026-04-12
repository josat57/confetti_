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

export interface AIEventPlan {
  id: string;
  planId?: string;
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
    duration: number;
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
      name: string;
      rating: number;
      estimatedCost: number;
      description: string;
      contact?: string;
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

  sustainability: {
    score: number;
    recommendations: string[];
    carbonFootprint: number;
    ecoFriendlyOptions: string[];
  };

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
  createdAt: string;
  updatedAt: string;
}

export const aiPlannerService = {
  /**
   * Generate comprehensive mock plan data
   */
  generateMockPlan(request: EventPlanningRequest): AIEventPlan {
    const eventType = request.eventType;
    const budget = request.budget;
    const guestCount = request.guestCount;

    // Generate timeline based on event type and duration
    const timeline = this.generateMockTimeline(eventType, request.duration);

    // Generate budget breakdown
    const budgetBreakdown = this.generateMockBudgetBreakdown(eventType, budget);

    // Generate vendor recommendations
    const vendorRecommendations = this.generateMockVendorRecommendations(
      eventType,
      request.location
    );

    // Generate checklist
    const checklist = this.generateMockChecklist(eventType);

    // Generate risk assessment
    const riskAssessment = this.generateMockRiskAssessment(eventType);

    // Generate alternatives
    const alternatives = this.generateMockAlternatives(eventType, budget);

    // Generate sustainability info
    const sustainability = this.generateMockSustainability(eventType);

    return {
      id: Date.now().toString(),
      eventType: request.eventType,
      budget: request.budget,
      guestCount: request.guestCount,
      date: request.date,
      location: request.location,
      timeline,
      budgetBreakdown,
      vendorRecommendations,
      checklist,
      riskAssessment,
      alternatives,
      sustainability,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Enhance existing plan with mock data for empty fields
   */
  enhancePlanWithMockData(
    plan: AIEventPlan,
    request: EventPlanningRequest
  ): AIEventPlan {
    return {
      ...plan,
      timeline:
        plan.timeline.length > 0
          ? plan.timeline
          : this.generateMockTimeline(request.eventType, request.duration),
      budgetBreakdown:
        plan.budgetBreakdown.length > 0
          ? plan.budgetBreakdown
          : this.generateMockBudgetBreakdown(request.eventType, request.budget),
      vendorRecommendations:
        plan.vendorRecommendations.length > 0
          ? plan.vendorRecommendations
          : this.generateMockVendorRecommendations(
              request.eventType,
              request.location
            ),
      checklist:
        plan.checklist.length > 0
          ? plan.checklist
          : this.generateMockChecklist(request.eventType),
      riskAssessment:
        plan.riskAssessment.length > 0
          ? plan.riskAssessment
          : this.generateMockRiskAssessment(request.eventType),
      alternatives:
        plan.alternatives.length > 0
          ? plan.alternatives
          : this.generateMockAlternatives(request.eventType, request.budget),
      sustainability:
        plan.sustainability.score > 0
          ? plan.sustainability
          : this.generateMockSustainability(request.eventType),
    };
  },

  /**
   * Generate mock timeline based on event type
   */
  generateMockTimeline(eventType: string, duration: number) {
    const timelineTemplates = {
      wedding: [
        {
          time: "14:00",
          activity: "Guest Arrival & Welcome Drinks",
          duration: 1,
          notes: "Cocktail reception with light refreshments",
        },
        {
          time: "15:00",
          activity: "Wedding Ceremony",
          duration: 1,
          notes: "Exchange of vows and rings",
        },
        {
          time: "16:00",
          activity: "Photo Session & Cocktail Hour",
          duration: 1,
          notes: "Professional photography and mingling",
        },
        {
          time: "17:00",
          activity: "Reception Dinner",
          duration: 2,
          notes: "Three-course meal with speeches",
        },
        {
          time: "19:00",
          activity: "First Dance & Entertainment",
          duration: 2,
          notes: "Dancing and live entertainment",
        },
        {
          time: "21:00",
          activity: "Cake Cutting & Celebration",
          duration: 1,
          notes: "Traditional cake cutting ceremony",
        },
      ],
      corporate: [
        {
          time: "09:00",
          activity: "Registration & Welcome Coffee",
          duration: 1,
          notes: "Check-in and networking breakfast",
        },
        {
          time: "10:00",
          activity: "Opening Keynote",
          duration: 1,
          notes: "Welcome address and company updates",
        },
        {
          time: "11:00",
          activity: "Coffee Break & Networking",
          duration: 0.5,
          notes: "Refreshments and informal discussions",
        },
        {
          time: "11:30",
          activity: "Panel Discussion",
          duration: 1.5,
          notes: "Industry experts panel",
        },
        {
          time: "13:00",
          activity: "Lunch & Networking",
          duration: 1,
          notes: "Catered lunch with networking opportunities",
        },
        {
          time: "14:00",
          activity: "Workshops & Breakout Sessions",
          duration: 2,
          notes: "Interactive learning sessions",
        },
        {
          time: "16:00",
          activity: "Closing Remarks & Awards",
          duration: 1,
          notes: "Summary and recognition ceremony",
        },
      ],
      birthday: [
        {
          time: "15:00",
          activity: "Guest Arrival & Welcome",
          duration: 0.5,
          notes: "Welcome drinks and mingling",
        },
        {
          time: "15:30",
          activity: "Games & Activities",
          duration: 1.5,
          notes: "Fun activities and entertainment",
        },
        {
          time: "17:00",
          activity: "Birthday Cake & Celebration",
          duration: 0.5,
          notes: "Cake cutting and birthday song",
        },
        {
          time: "17:30",
          activity: "Dinner & Refreshments",
          duration: 1.5,
          notes: "Birthday feast and refreshments",
        },
        {
          time: "19:00",
          activity: "Dancing & Music",
          duration: 2,
          notes: "DJ and dancing",
        },
        {
          time: "21:00",
          activity: "Gift Opening & Thank You",
          duration: 0.5,
          notes: "Gift appreciation and farewell",
        },
      ],
    };

    const defaultTimeline = [
      {
        time: "10:00",
        activity: "Event Setup & Preparation",
        duration: 1,
        notes: "Final preparations and setup",
      },
      {
        time: "11:00",
        activity: "Guest Arrival",
        duration: 0.5,
        notes: "Welcome and registration",
      },
      {
        time: "11:30",
        activity: "Main Event Activities",
        duration: duration - 2,
        notes: "Core event programming",
      },
      {
        time: `${11 + duration - 1}:30`,
        activity: "Closing & Farewell",
        duration: 0.5,
        notes: "Thank you and goodbye",
      },
    ];

    return (
      timelineTemplates[eventType as keyof typeof timelineTemplates] ||
      defaultTimeline
    );
  },

  /**
   * Generate mock budget breakdown
   */
  generateMockBudgetBreakdown(eventType: string, totalBudget: number) {
    const budgetTemplates = {
      wedding: [
        {
          category: "Venue & Catering",
          percentage: 45,
          items: [
            {
              item: "Venue Rental",
              cost: Math.round(totalBudget * 0.25),
              quantity: 1,
              notes: "Reception hall rental",
            },
            {
              item: "Catering Services",
              cost: Math.round(totalBudget * 0.2),
              quantity: 1,
              notes: "Food and beverage service",
            },
          ],
        },
        {
          category: "Photography & Videography",
          percentage: 15,
          items: [
            {
              item: "Wedding Photographer",
              cost: Math.round(totalBudget * 0.1),
              quantity: 1,
              notes: "Professional photography",
            },
            {
              item: "Videographer",
              cost: Math.round(totalBudget * 0.05),
              quantity: 1,
              notes: "Wedding video production",
            },
          ],
        },
        {
          category: "Decorations & Flowers",
          percentage: 20,
          items: [
            {
              item: "Floral Arrangements",
              cost: Math.round(totalBudget * 0.12),
              quantity: 1,
              notes: "Bridal bouquet and centerpieces",
            },
            {
              item: "Venue Decoration",
              cost: Math.round(totalBudget * 0.08),
              quantity: 1,
              notes: "Lighting and decor setup",
            },
          ],
        },
        {
          category: "Entertainment & Music",
          percentage: 10,
          items: [
            {
              item: "DJ Services",
              cost: Math.round(totalBudget * 0.06),
              quantity: 1,
              notes: "Music and sound system",
            },
            {
              item: "Live Band",
              cost: Math.round(totalBudget * 0.04),
              quantity: 1,
              notes: "Live musical entertainment",
            },
          ],
        },
        {
          category: "Miscellaneous",
          percentage: 10,
          items: [
            {
              item: "Transportation",
              cost: Math.round(totalBudget * 0.05),
              quantity: 1,
              notes: "Bridal car and guest transport",
            },
            {
              item: "Wedding Favors",
              cost: Math.round(totalBudget * 0.03),
              quantity: 1,
              notes: "Guest gifts and favors",
            },
            {
              item: "Contingency",
              cost: Math.round(totalBudget * 0.02),
              quantity: 1,
              notes: "Emergency fund",
            },
          ],
        },
      ],
      corporate: [
        {
          category: "Venue & Equipment",
          percentage: 40,
          items: [
            {
              item: "Conference Venue",
              cost: Math.round(totalBudget * 0.25),
              quantity: 1,
              notes: "Meeting space rental",
            },
            {
              item: "AV Equipment",
              cost: Math.round(totalBudget * 0.15),
              quantity: 1,
              notes: "Sound, lighting, and projection",
            },
          ],
        },
        {
          category: "Catering",
          percentage: 25,
          items: [
            {
              item: "Breakfast & Coffee",
              cost: Math.round(totalBudget * 0.08),
              quantity: 1,
              notes: "Morning refreshments",
            },
            {
              item: "Lunch Catering",
              cost: Math.round(totalBudget * 0.12),
              quantity: 1,
              notes: "Full lunch service",
            },
            {
              item: "Coffee Breaks",
              cost: Math.round(totalBudget * 0.05),
              quantity: 1,
              notes: "Afternoon refreshments",
            },
          ],
        },
        {
          category: "Speakers & Entertainment",
          percentage: 20,
          items: [
            {
              item: "Keynote Speaker",
              cost: Math.round(totalBudget * 0.15),
              quantity: 1,
              notes: "Professional speaker fee",
            },
            {
              item: "Panel Moderator",
              cost: Math.round(totalBudget * 0.05),
              quantity: 1,
              notes: "Discussion facilitator",
            },
          ],
        },
        {
          category: "Materials & Swag",
          percentage: 10,
          items: [
            {
              item: "Welcome Bags",
              cost: Math.round(totalBudget * 0.06),
              quantity: 1,
              notes: "Branded merchandise",
            },
            {
              item: "Printed Materials",
              cost: Math.round(totalBudget * 0.04),
              quantity: 1,
              notes: "Programs and handouts",
            },
          ],
        },
        {
          category: "Logistics",
          percentage: 5,
          items: [
            {
              item: "Registration Setup",
              cost: Math.round(totalBudget * 0.03),
              quantity: 1,
              notes: "Check-in management",
            },
            {
              item: "Staff Coordination",
              cost: Math.round(totalBudget * 0.02),
              quantity: 1,
              notes: "Event management",
            },
          ],
        },
      ],
    };

    const defaultBudget = [
      {
        category: "Venue",
        percentage: 40,
        items: [
          {
            item: "Venue Rental",
            cost: Math.round(totalBudget * 0.4),
            quantity: 1,
            notes: "Event space rental",
          },
        ],
      },
      {
        category: "Catering",
        percentage: 30,
        items: [
          {
            item: "Food & Beverages",
            cost: Math.round(totalBudget * 0.3),
            quantity: 1,
            notes: "Catering services",
          },
        ],
      },
      {
        category: "Entertainment",
        percentage: 15,
        items: [
          {
            item: "Entertainment Services",
            cost: Math.round(totalBudget * 0.15),
            quantity: 1,
            notes: "Music and activities",
          },
        ],
      },
      {
        category: "Decorations",
        percentage: 10,
        items: [
          {
            item: "Decorations & Setup",
            cost: Math.round(totalBudget * 0.1),
            quantity: 1,
            notes: "Event decoration",
          },
        ],
      },
      {
        category: "Miscellaneous",
        percentage: 5,
        items: [
          {
            item: "Contingency & Extras",
            cost: Math.round(totalBudget * 0.05),
            quantity: 1,
            notes: "Emergency fund",
          },
        ],
      },
    ];

    const template =
      budgetTemplates[eventType as keyof typeof budgetTemplates] ||
      defaultBudget;

    return template.map((category) => ({
      ...category,
      amount: category.items.reduce((sum, item) => sum + item.cost, 0),
    }));
  },

  /**
   * Generate mock vendor recommendations
   */
  generateMockVendorRecommendations(eventType: string, location: string) {
    const city = location.split(",")[0]?.trim() || "Lagos";

    return [
      {
        category: "Catering",
        vendors: [
          {
            name: `${city} Premium Catering`,
            rating: 4.8,
            estimatedCost: 150000,
            description:
              "Award-winning catering service specializing in Nigerian and international cuisine",
            contact: "+234 801 234 5678",
          },
          {
            name: "Gourmet Events Co.",
            rating: 4.6,
            estimatedCost: 120000,
            description: "Professional catering with customizable menu options",
            contact: "+234 802 345 6789",
          },
          {
            name: "Royal Feast Catering",
            rating: 4.7,
            estimatedCost: 180000,
            description: "Luxury catering service for high-end events",
            contact: "+234 803 456 7890",
          },
        ],
      },
      {
        category: "Photography",
        vendors: [
          {
            name: "Moments Photography",
            rating: 4.9,
            estimatedCost: 80000,
            description:
              "Creative wedding and event photography with artistic flair",
            contact: "+234 804 567 8901",
          },
          {
            name: `${city} Photo Studio`,
            rating: 4.5,
            estimatedCost: 60000,
            description:
              "Professional event photography and videography services",
            contact: "+234 805 678 9012",
          },
          {
            name: "Elite Captures",
            rating: 4.7,
            estimatedCost: 100000,
            description: "Premium photography with same-day editing",
            contact: "+234 806 789 0123",
          },
        ],
      },
      {
        category: "Entertainment",
        vendors: [
          {
            name: "Soundwave Entertainment",
            rating: 4.6,
            estimatedCost: 45000,
            description:
              "Professional DJ services with extensive music library",
            contact: "+234 807 890 1234",
          },
          {
            name: "Live Music Collective",
            rating: 4.8,
            estimatedCost: 75000,
            description: "Live band performances for all event types",
            contact: "+234 808 901 2345",
          },
          {
            name: "Party Vibes DJ",
            rating: 4.4,
            estimatedCost: 35000,
            description: "Energetic DJ services with lighting effects",
            contact: "+234 809 012 3456",
          },
        ],
      },
      {
        category: "Decoration",
        vendors: [
          {
            name: "Elegant Decor Solutions",
            rating: 4.7,
            estimatedCost: 65000,
            description: "Creative event decoration and floral arrangements",
            contact: "+234 810 123 4567",
          },
          {
            name: `${city} Event Styling`,
            rating: 4.5,
            estimatedCost: 50000,
            description: "Complete event styling and setup services",
            contact: "+234 811 234 5678",
          },
          {
            name: "Luxury Events Decor",
            rating: 4.9,
            estimatedCost: 90000,
            description: "High-end decoration with premium materials",
            contact: "+234 812 345 6789",
          },
        ],
      },
    ];
  },

  /**
   * Generate mock checklist
   */
  generateMockChecklist(eventType: string) {
    const checklistTemplates = {
      wedding: [
        {
          category: "Pre-Event (8 weeks before)",
          tasks: [
            {
              task: "Book venue and confirm date",
              deadline: "8 weeks before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Send save-the-date cards",
              deadline: "8 weeks before",
              priority: "medium" as const,
              completed: false,
            },
            {
              task: "Book photographer and videographer",
              deadline: "6 weeks before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Order wedding cake",
              deadline: "4 weeks before",
              priority: "medium" as const,
              completed: false,
            },
          ],
        },
        {
          category: "Final Preparations (1 week before)",
          tasks: [
            {
              task: "Confirm final guest count",
              deadline: "1 week before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Prepare seating arrangements",
              deadline: "3 days before",
              priority: "medium" as const,
              completed: false,
            },
            {
              task: "Final venue walkthrough",
              deadline: "2 days before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Prepare emergency kit",
              deadline: "1 day before",
              priority: "low" as const,
              completed: false,
            },
          ],
        },
      ],
      corporate: [
        {
          category: "Planning Phase (4 weeks before)",
          tasks: [
            {
              task: "Confirm venue and AV requirements",
              deadline: "4 weeks before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Send invitations to attendees",
              deadline: "3 weeks before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Book keynote speakers",
              deadline: "3 weeks before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Arrange catering services",
              deadline: "2 weeks before",
              priority: "medium" as const,
              completed: false,
            },
          ],
        },
        {
          category: "Final Week",
          tasks: [
            {
              task: "Test all AV equipment",
              deadline: "2 days before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Prepare welcome materials",
              deadline: "2 days before",
              priority: "medium" as const,
              completed: false,
            },
            {
              task: "Brief all staff members",
              deadline: "1 day before",
              priority: "high" as const,
              completed: false,
            },
            {
              task: "Set up registration area",
              deadline: "Event day",
              priority: "medium" as const,
              completed: false,
            },
          ],
        },
      ],
    };

    const defaultChecklist = [
      {
        category: "Pre-Event Planning",
        tasks: [
          {
            task: "Confirm venue booking",
            deadline: "2 weeks before",
            priority: "high" as const,
            completed: false,
          },
          {
            task: "Send invitations",
            deadline: "2 weeks before",
            priority: "high" as const,
            completed: false,
          },
          {
            task: "Arrange catering",
            deadline: "1 week before",
            priority: "medium" as const,
            completed: false,
          },
          {
            task: "Confirm entertainment",
            deadline: "1 week before",
            priority: "medium" as const,
            completed: false,
          },
        ],
      },
      {
        category: "Event Day",
        tasks: [
          {
            task: "Set up decorations",
            deadline: "Event day",
            priority: "high" as const,
            completed: false,
          },
          {
            task: "Brief service staff",
            deadline: "Event day",
            priority: "medium" as const,
            completed: false,
          },
          {
            task: "Final sound check",
            deadline: "Event day",
            priority: "high" as const,
            completed: false,
          },
          {
            task: "Welcome guests",
            deadline: "Event day",
            priority: "low" as const,
            completed: false,
          },
        ],
      },
    ];

    return (
      checklistTemplates[eventType as keyof typeof checklistTemplates] ||
      defaultChecklist
    );
  },

  /**
   * Generate mock risk assessment
   */
  generateMockRiskAssessment(eventType: string) {
    return [
      {
        risk: "Weather-related disruptions",
        probability: "medium" as const,
        impact: "high" as const,
        mitigation:
          "Secure indoor backup venue and monitor weather forecasts closely",
      },
      {
        risk: "Vendor no-show or cancellation",
        probability: "low" as const,
        impact: "high" as const,
        mitigation:
          "Maintain backup vendor list and confirm all bookings 48 hours prior",
      },
      {
        risk: "Technical equipment failure",
        probability: "medium" as const,
        impact: "medium" as const,
        mitigation:
          "Test all equipment beforehand and have backup systems ready",
      },
      {
        risk: "Lower than expected attendance",
        probability: "low" as const,
        impact: "medium" as const,
        mitigation:
          "Send reminder notifications and have flexible catering arrangements",
      },
      {
        risk: "Budget overrun",
        probability: "medium" as const,
        impact: "medium" as const,
        mitigation: "Maintain 10% contingency fund and track expenses closely",
      },
    ];
  },

  /**
   * Generate mock alternatives
   */
  generateMockAlternatives(eventType: string, budget: number) {
    return [
      {
        scenario: "Budget-Friendly Option",
        budgetImpact: -budget * 0.3,
        description:
          "Reduce costs while maintaining quality through strategic vendor selection",
        pros: [
          "30% cost savings",
          "More intimate atmosphere",
          "Flexible scheduling",
        ],
        cons: [
          "Fewer premium options",
          "Limited guest capacity",
          "Simpler decorations",
        ],
      },
      {
        scenario: "Premium Upgrade",
        budgetImpact: budget * 0.5,
        description:
          "Enhanced experience with luxury vendors and premium services",
        pros: [
          "Premium venue and catering",
          "Professional photography/videography",
          "Enhanced entertainment",
        ],
        cons: [
          "Higher investment required",
          "More complex logistics",
          "Extended planning time",
        ],
      },
      {
        scenario: "Hybrid Format",
        budgetImpact: budget * 0.1,
        description: "Combine in-person and virtual elements for broader reach",
        pros: [
          "Increased accessibility",
          "Cost-effective scaling",
          "Technology integration",
        ],
        cons: [
          "Technical complexity",
          "Reduced personal interaction",
          "Equipment requirements",
        ],
      },
    ];
  },

  /**
   * Generate mock sustainability info
   */
  generateMockSustainability(eventType: string) {
    return {
      score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
      recommendations: [
        "Use locally sourced catering to reduce carbon footprint",
        "Implement digital invitations and programs to reduce paper waste",
        "Choose venues with renewable energy sources",
        "Provide recycling stations throughout the event space",
        "Use reusable or biodegradable serving materials",
        "Donate leftover food to local charities",
      ],
      carbonFootprint: Math.floor(Math.random() * 500) + 200, // kg CO2
      ecoFriendlyOptions: [
        "Solar-powered lighting systems",
        "Organic and locally-sourced menu options",
        "Digital check-in and registration",
        "Carpooling coordination for guests",
        "Waste reduction and recycling program",
      ],
    };
  },

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
      const responseData = response.data;

      console.log("Backend response:", responseData);

      // Handle the actual backend response structure
      const eventPlan = responseData.data?.eventPlan;

      if (!eventPlan) {
        console.log("No eventPlan in response, using mock data");
        return this.generateMockPlan(request);
      }

      // Transform backend response to our expected format
      const basePlan = {
        id: eventPlan.sessionToken || Date.now().toString(),
        eventType: request.eventType,
        budget: request.budget,
        guestCount: request.guestCount,
        date: request.date,
        location: request.location,
        timeline: this.transformIntelligentTimeline(
          eventPlan.intelligentTimeline,
          request
        ),
        budgetBreakdown: this.transformBudgetOptimization(
          eventPlan.budgetOptimization,
          request.budget
        ),
        vendorRecommendations: this.transformVendorRecommendations(
          eventPlan.vendorRecommendations
        ),
        checklist: this.generateChecklistFromBackendData(eventPlan, request),
        riskAssessment: this.transformRiskAnalysis(eventPlan.riskAnalysis),
        alternatives: this.generateAlternativesFromBackendData(
          eventPlan,
          request.budget
        ),
        sustainability: this.transformSustainabilityData(eventPlan),
        createdAt: eventPlan.generatedAt || new Date().toISOString(),
        updatedAt: eventPlan.generatedAt || new Date().toISOString(),
      };

      // Enhance with mock data for missing sections
      const enhancedPlan = this.enhancePlanWithMockData(basePlan, request);

      return enhancedPlan;
    } catch (error) {
      console.error("AI Planner API error, using mock data:", error);
      // Return complete mock data if API fails
      return this.generateMockPlan(request);
    }
  },

  /**
   * Transform backend risk analysis to our format
   */
  transformRiskAnalysis(riskAnalysis: any) {
    if (!riskAnalysis || !riskAnalysis.riskCategories) {
      return [];
    }

    const risks = [];
    const categories = riskAnalysis.riskCategories;

    if (categories.financial) {
      risks.push({
        risk: "Financial budget overrun",
        probability: categories.financial.level as "low" | "medium" | "high",
        impact:
          categories.financial.score > 0.5
            ? "high"
            : ("medium" as "low" | "medium" | "high"),
        mitigation: "Monitor expenses closely and maintain contingency fund",
      });
    }

    if (categories.operational) {
      risks.push({
        risk: "Operational challenges",
        probability: categories.operational.level as "low" | "medium" | "high",
        impact:
          categories.operational.score > 0.5
            ? "high"
            : ("medium" as "low" | "medium" | "high"),
        mitigation: "Ensure proper coordination and backup plans",
      });
    }

    // Add default risks if none from backend
    if (risks.length === 0) {
      return this.generateMockRiskAssessment("");
    }

    return risks;
  },

  /**
   * Transform backend intelligent timeline to our format
   */
  transformIntelligentTimeline(
    timelineData: any,
    request: EventPlanningRequest
  ) {
    // Backend doesn't provide detailed timeline yet, return empty for mock data enhancement
    if (
      !timelineData ||
      !timelineData.phases ||
      timelineData.phases.length === 0
    ) {
      return [];
    }

    // Transform backend timeline phases to our timeline format
    return timelineData.phases.map((phase: any, index: number) => ({
      time: `${10 + index}:00`,
      activity: phase.name || `Phase ${index + 1}`,
      duration: phase.duration || 1,
      notes: phase.description || "",
    }));
  },

  /**
   * Transform backend budget optimization to our budget breakdown format
   */
  transformBudgetOptimization(budgetData: any, totalBudget: number) {
    // Backend doesn't provide detailed budget breakdown yet
    if (!budgetData || !budgetData.recommendations) {
      return [];
    }

    // Create a simple budget breakdown based on backend recommendations
    return [
      {
        category: "Optimized Planning",
        percentage: 100,
        amount: totalBudget,
        items: budgetData.recommendations.map((rec: string, index: number) => ({
          item: rec,
          cost: Math.round(totalBudget * 0.1),
          quantity: 1,
          notes: `Feasibility score: ${budgetData.feasibility_score}%`,
        })),
      },
    ];
  },

  /**
   * Generate checklist from backend data
   */
  generateChecklistFromBackendData(
    eventPlan: any,
    request: EventPlanningRequest
  ) {
    const clientAnalysis = eventPlan.clientAnalysis;
    const tasks = [];

    if (clientAnalysis?.culturalConsiderations) {
      tasks.push({
        task: `Address cultural considerations: ${clientAnalysis.culturalConsiderations.join(
          ", "
        )}`,
        deadline: "2 weeks before",
        priority: "high" as const,
        completed: false,
      });
    }

    if (clientAnalysis?.hiddenNeeds) {
      clientAnalysis.hiddenNeeds.forEach((need: string) => {
        tasks.push({
          task: `Ensure ${need.toLowerCase()}`,
          deadline: "1 week before",
          priority: "medium" as const,
          completed: false,
        });
      });
    }

    if (clientAnalysis?.personalizationOpportunities) {
      clientAnalysis.personalizationOpportunities.forEach(
        (opportunity: string) => {
          tasks.push({
            task: `Implement ${opportunity.toLowerCase()}`,
            deadline: "3 days before",
            priority: "low" as const,
            completed: false,
          });
        }
      );
    }

    // If no backend tasks, return empty for mock data
    if (tasks.length === 0) {
      return [];
    }

    return [
      {
        category: "AI-Recommended Tasks",
        tasks: tasks,
      },
    ];
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

    // Return empty if no alternatives for mock data enhancement
    return alternatives.length > 0 ? alternatives : [];
  },

  /**
   * Transform backend vendor recommendations to our format
   */
  transformVendorRecommendations(vendorData: any) {
    // Backend currently returns empty recommendations array
    // Return empty array so mock data will be used
    if (
      !vendorData ||
      !vendorData.recommendations ||
      vendorData.recommendations.length === 0
    ) {
      return [];
    }

    // If backend provides vendor data, transform it to our format
    // This is a placeholder for when backend provides actual vendor data
    return vendorData.recommendations.map((vendor: any) => ({
      category: vendor.category || "General",
      vendors: vendor.vendors || [],
    }));
  },

  /**
   * Transform backend sustainability data to our format
   */
  transformSustainabilityData(eventPlan: any) {
    const visualSuggestions = eventPlan.visualSuggestions;
    const budgetOptimization = eventPlan.budgetOptimization;

    return {
      score: budgetOptimization?.feasibility_score || 75,
      recommendations: budgetOptimization?.recommendations || [
        "Consider eco-friendly venue options",
        "Use digital invitations to reduce paper waste",
        "Choose local vendors to reduce transportation impact",
      ],
      carbonFootprint: Math.floor(Math.random() * 500) + 200,
      ecoFriendlyOptions: visualSuggestions?.moodBoardConcepts || [
        "Sustainable decorations",
        "Organic catering options",
        "Renewable energy venues",
      ],
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
   * Get mock saved plans for development
   */
  getMockSavedPlans(params?: any): {
    plans: AIEventPlan[];
    total: number;
    totalPages: number;
  } {
    const mockPlans: AIEventPlan[] = [
      {
        id: "plan_001",
        eventType: "wedding",
        budget: 2500000,
        guestCount: 150,
        date: "2024-06-15T00:00:00.000Z",
        location: "Lagos, Nigeria",
        timeline: this.generateMockTimeline("wedding", 8),
        budgetBreakdown: this.generateMockBudgetBreakdown("wedding", 2500000),
        vendorRecommendations: this.generateMockVendorRecommendations(
          "wedding",
          "Lagos"
        ),
        checklist: this.generateMockChecklist("wedding"),
        riskAssessment: this.generateMockRiskAssessment("wedding"),
        alternatives: this.generateMockAlternatives("wedding", 2500000),
        sustainability: this.generateMockSustainability("wedding"),
        createdAt: "2024-01-15T10:30:00.000Z",
        updatedAt: "2024-01-16T14:20:00.000Z",
      },
      {
        id: "plan_002",
        eventType: "corporate",
        budget: 1800000,
        guestCount: 200,
        date: "2024-07-20T00:00:00.000Z",
        location: "Abuja, Nigeria",
        timeline: this.generateMockTimeline("corporate", 6),
        budgetBreakdown: this.generateMockBudgetBreakdown("corporate", 1800000),
        vendorRecommendations: this.generateMockVendorRecommendations(
          "corporate",
          "Abuja"
        ),
        checklist: this.generateMockChecklist("corporate"),
        riskAssessment: this.generateMockRiskAssessment("corporate"),
        alternatives: this.generateMockAlternatives("corporate", 1800000),
        sustainability: this.generateMockSustainability("corporate"),
        createdAt: "2024-01-10T09:15:00.000Z",
        updatedAt: "2024-01-12T16:45:00.000Z",
      },
      {
        id: "plan_003",
        eventType: "birthday",
        budget: 850000,
        guestCount: 80,
        date: "2024-05-25T00:00:00.000Z",
        location: "Port Harcourt, Nigeria",
        timeline: this.generateMockTimeline("birthday", 5),
        budgetBreakdown: this.generateMockBudgetBreakdown("birthday", 850000),
        vendorRecommendations: this.generateMockVendorRecommendations(
          "birthday",
          "Port Harcourt"
        ),
        checklist: this.generateMockChecklist("birthday"),
        riskAssessment: this.generateMockRiskAssessment("birthday"),
        alternatives: this.generateMockAlternatives("birthday", 850000),
        sustainability: this.generateMockSustainability("birthday"),
        createdAt: "2024-01-08T11:20:00.000Z",
        updatedAt: "2024-01-08T11:20:00.000Z",
      },
    ];

    const limit = params?.limit || 10;
    const page = params?.page || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      plans: mockPlans.slice(startIndex, endIndex),
      total: mockPlans.length,
      totalPages: Math.ceil(mockPlans.length / limit),
    };
  },

  /**
   * Get a specific event plan by session token or plan ID (Backend Integration)
   */
  async getEventPlan(id: string): Promise<AIEventPlan> {
    try {
      const response = await api.get(`/ai-planner/result/${id}`);

      if (response.data?.status === "success" && response.data?.data) {
        return this.transformSavedPlan(response.data.data);
      }

      throw new Error("Plan not found");
    } catch (error: any) {
      console.error("Failed to fetch event plan:", error);

      // Handle specific error cases
      if (error?.response?.status === 404) {
        throw new Error("Plan not found");
      }

      if (error?.response?.status === 401) {
        throw new Error("Authentication required");
      }

      throw new Error("Failed to fetch event plan");
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
   * Refine an existing plan with AI prompting (Backend Integration)
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
        enhancementType: enhancementType || "general",
        refinementDetails: {
          type: enhancementType || "general",
          userRequest: prompt,
          timestamp: new Date().toISOString(),
        },
      });

      if (response.data?.status === "success" && response.data?.data?.plan) {
        return this.transformSavedPlan(response.data.data.plan);
      }

      throw new Error("Failed to refine plan");
    } catch (error: any) {
      console.error("Failed to refine plan:", error);

      // Handle specific error cases
      if (error?.response?.status === 404) {
        throw new Error("Plan not found");
      }

      if (error?.response?.status === 401) {
        throw new Error("Authentication required");
      }

      throw new Error("Failed to refine plan. Please try again.");
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
   * Simulate plan enhancement for development
   */
  simulateEnhancement(
    plan: AIEventPlan,
    prompt: string,
    enhancementType?: string
  ): AIEventPlan {
    const enhancedPlan = { ...plan };

    // Simulate AI enhancement based on prompt and type
    if (
      enhancementType === "timeline" ||
      prompt.toLowerCase().includes("timeline") ||
      prompt.toLowerCase().includes("schedule")
    ) {
      enhancedPlan.timeline = [
        ...plan.timeline,
        {
          time: "21:30",
          activity: `Enhanced Activity: ${prompt.slice(0, 50)}...`,
          duration: 0.5,
          notes: "AI-enhanced based on your request",
        },
      ];
    }

    if (
      enhancementType === "budget" ||
      prompt.toLowerCase().includes("budget") ||
      prompt.toLowerCase().includes("cost")
    ) {
      enhancedPlan.budgetBreakdown = plan.budgetBreakdown.map((category) => ({
        ...category,
        items: [
          ...category.items,
          {
            item: `AI Suggestion: ${prompt.slice(0, 30)}...`,
            cost: Math.round(plan.budget * 0.05),
            quantity: 1,
            notes: "AI-recommended enhancement",
          },
        ],
      }));
    }

    if (
      enhancementType === "vendors" ||
      prompt.toLowerCase().includes("vendor") ||
      prompt.toLowerCase().includes("supplier")
    ) {
      enhancedPlan.vendorRecommendations = [
        ...plan.vendorRecommendations,
        {
          category: "AI-Enhanced Recommendations",
          vendors: [
            {
              name: "Premium AI-Suggested Vendor",
              rating: 4.9,
              estimatedCost: Math.round(plan.budget * 0.15),
              description: `Specialized service based on your request: ${prompt.slice(
                0,
                100
              )}...`,
              contact: "+234 800 AI MAGIC",
            },
          ],
        },
      ];
    }

    enhancedPlan.updatedAt = new Date().toISOString();
    return enhancedPlan;
  },

  /**
   * Chat with AI about a specific plan (Backend Integration)
   */
  async chatWithAI(
    planId: string,
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<{ response: string; updatedPlan?: AIEventPlan }> {
    try {
      const response = await api.post(`/ai-planner/plans/${planId}/chat`, {
        message,
        conversationHistory: conversationHistory || [],
      });

      if (response.data?.status === "success") {
        return {
          response:
            response.data.data.response ||
            "I understand your request. Let me help you with that.",
          updatedPlan: response.data.data.updatedPlan
            ? this.transformSavedPlan(response.data.data.updatedPlan)
            : undefined,
        };
      }

      throw new Error("Failed to get AI response");
    } catch (error: any) {
      console.error("Failed to chat with AI:", error);

      // Return a fallback response instead of simulation
      return {
        response:
          "I'm currently experiencing some technical difficulties. Please try again in a moment.",
        updatedPlan: undefined,
      };
    }
  },

  /**
   * Simulate AI chat for development
   */
  async simulateAIChat(
    planId: string,
    message: string
  ): Promise<{ response: string; updatedPlan?: AIEventPlan }> {
    const responses = [
      "That's a great idea! I can help you incorporate that into your event plan. Let me suggest some specific ways to implement this.",
      "Based on your event details, I recommend considering the cultural significance and guest preferences. Here are some tailored suggestions.",
      "I understand your concern. Let me analyze your current plan and provide some optimization recommendations.",
      "Excellent question! For your event type and budget, I suggest focusing on these key areas for maximum impact.",
      "That's an interesting enhancement request. I can help you refine this aspect while maintaining your overall event vision.",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    // Simulate plan update if message suggests changes
    let updatedPlan;
    if (
      message.toLowerCase().includes("add") ||
      message.toLowerCase().includes("change") ||
      message.toLowerCase().includes("update")
    ) {
      const existingPlan = await this.getEventPlan(planId);
      updatedPlan = this.simulateEnhancement(existingPlan, message);
    }

    return {
      response: `${randomResponse} ${
        message.includes("?")
          ? "What specific aspects would you like me to focus on?"
          : "Would you like me to update your plan with these suggestions?"
      }`,
      updatedPlan,
    };
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
   * Start a new planning session (mock implementation for now)
   */
  async startPlanningSession(title: string): Promise<PlanningSession> {
    const sessionId = Date.now().toString();
    return {
      id: sessionId,
      title,
      status: "active",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Get all planning sessions (mock implementation for now)
   */
  async getPlanningSessions(): Promise<PlanningSession[]> {
    return [];
  },

  /**
   * Get a specific planning session (mock implementation for now)
   */
  async getPlanningSession(id: string): Promise<PlanningSession> {
    return {
      id,
      title: "Planning Session",
      status: "active",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Send a message in a planning session (mock implementation for now)
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    return {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Generate plan from chat session (mock implementation for now)
   */
  async generatePlanFromChat(sessionId: string): Promise<AIEventPlan> {
    return {
      id: Date.now().toString(),
      eventType: "Wedding",
      budget: 1000000,
      guestCount: 100,
      date: new Date().toISOString(),
      location: "Lagos, Nigeria",
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
   * Export plan to different formats (mock implementation for now)
   */
  async exportPlan(
    planId: string,
    format: "pdf" | "docx" | "json"
  ): Promise<Blob> {
    return new Blob(["Mock export data"], { type: "text/plain" });
  },

  /**
   * Share plan with client (mock implementation for now)
   */
  async sharePlan(
    planId: string,
    clientEmail: string,
    message?: string
  ): Promise<void> {
    console.log(`Sharing plan ${planId} with ${clientEmail}`);
  },

  /**
   * Convert plan to quote (mock implementation for now)
   */
  async convertToQuote(planId: string): Promise<{ quoteId: string }> {
    return { quoteId: Date.now().toString() };
  },

  /**
   * Get AI analytics and insights (mock implementation for now)
   */
  async getAIInsights(): Promise<{
    totalPlansGenerated: number;
    averagePlanningTime: number;
    mostPopularEventTypes: string[];
    budgetTrends: {
      eventType: string;
      averageBudget: number;
      trend: "up" | "down" | "stable";
    }[];
    clientSatisfactionScore: number;
    timesSaved: number; // in hours
  }> {
    return {
      totalPlansGenerated: 1247,
      averagePlanningTime: 12,
      mostPopularEventTypes: ["wedding", "corporate", "birthday", "conference"],
      budgetTrends: [
        { eventType: "wedding", averageBudget: 2500000, trend: "up" },
        { eventType: "corporate", averageBudget: 1800000, trend: "stable" },
        { eventType: "birthday", averageBudget: 850000, trend: "up" },
      ],
      clientSatisfactionScore: 94,
      timesSaved: 3741,
    };
  },
};

export default aiPlannerService;
