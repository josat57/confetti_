// Analytics Types for Admin Dashboard

export interface DateRange {
  start: Date;
  end: Date;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowthRate: number;
  retentionRate: number;
  churnRate: number;
  usersByRole: {
    planner: number;
    vendor: number;
    user: number;
  };
  userGrowthData: {
    date: string;
    total: number;
    new: number;
    active: number;
  }[];
  retentionData: {
    cohort: string;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  }[];
  topUsers: {
    userId: string;
    name: string;
    email: string;
    eventsCreated: number;
    totalSpent: number;
  }[];
}

export interface EventAnalytics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  completionRate: number;
  averageBudget: number;
  totalBudget: number;
  eventsByCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  eventsByMonth: {
    month: string;
    created: number;
    completed: number;
    cancelled: number;
  }[];
  averageGuestsPerEvent: number;
  averageVendorsPerEvent: number;
  popularEventTypes: {
    type: string;
    count: number;
  }[];
}

export interface FinancialAnalytics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  revenueBySource: {
    source: string;
    amount: number;
    percentage: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  topRevenueGenerators: {
    id: string;
    name: string;
    revenue: number;
    type: string;
  }[];
  averageTransactionValue: number;
  totalTransactions: number;
}

export interface EngagementAnalytics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  averagePageViews: number;
  bounceRate: number;
  engagementByFeature: {
    feature: string;
    users: number;
    sessions: number;
    avgDuration: number;
  }[];
  engagementTrend: {
    date: string;
    dau: number;
    wau: number;
    mau: number;
  }[];
  topFeatures: {
    feature: string;
    usage: number;
    growth: number;
  }[];
}

export interface DashboardMetrics {
  users: {
    total: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  events: {
    total: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  revenue: {
    total: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
  engagement: {
    rate: number;
    change: number;
    trend: "up" | "down" | "stable";
  };
}

export interface CustomReport {
  _id: string;
  name: string;
  description: string;
  metrics: string[];
  filters: {
    dateRange?: DateRange;
    userRole?: string;
    eventType?: string;
    [key: string]: any;
  };
  groupBy?: "day" | "week" | "month" | "year";
  chartType?: "line" | "bar" | "pie" | "area";
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  lastRun?: Date;
}

export interface ScheduledReport {
  _id: string;
  reportId: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  format: "pdf" | "excel" | "csv";
  nextRun: Date;
  lastRun?: Date;
  active: boolean;
  createdAt: Date;
}

export interface ReportExportOptions {
  format: "pdf" | "excel" | "csv";
  includeCharts: boolean;
  dateRange: DateRange;
  metrics: string[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
  userRole?: string;
  eventType?: string;
  category?: string;
}
