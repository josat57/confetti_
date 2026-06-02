import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

export const userKeys = {
  dashboardStats: ["user", "dashboard", "stats"] as const,
  upcomingEvents: (limit: number) => ["user", "upcoming-events", limit] as const,
  activity: (limit: number) => ["user", "activity", limit] as const,
  events: (params: Record<string, unknown>) => ["user", "events", params] as const,
};

export function useUserDashboardStats() {
  return useQuery({
    queryKey: userKeys.dashboardStats,
    queryFn: () => userService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: userKeys.upcomingEvents(limit),
    queryFn: () => userService.getUpcomingEvents(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserRecentActivity(limit = 6) {
  return useQuery({
    queryKey: userKeys.activity(limit),
    queryFn: () => userService.getRecentActivity(limit),
    staleTime: 60 * 1000,
  });
}

export function useUserEvents(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: userKeys.events(params as Record<string, unknown>),
    queryFn: () => userService.getMyEvents(params),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
