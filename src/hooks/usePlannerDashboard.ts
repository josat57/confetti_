import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/planner/dashboard.service";
import { budgetService } from "@/services/planner/budget.service";

export const plannerKeys = {
  metrics: ["planner", "metrics"] as const,
  activity: ["planner", "activity"] as const,
  deadlines: ["planner", "deadlines"] as const,
};

export function usePlannerMetrics() {
  return useQuery({
    queryKey: plannerKeys.metrics,
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePlannerActivity() {
  return useQuery({
    queryKey: plannerKeys.activity,
    queryFn: () => dashboardService.getRecentActivity(),
    staleTime: 60 * 1000,
  });
}

export function usePlannerDeadlines() {
  return useQuery({
    queryKey: plannerKeys.deadlines,
    queryFn: () => dashboardService.getUpcomingDeadlines(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBudgetOverview() {
  return useQuery({
    queryKey: ["planner-budget-overview"] as const,
    queryFn: () => budgetService.getBudgetOverview(),
    staleTime: 2 * 60 * 1000,
  });
}
