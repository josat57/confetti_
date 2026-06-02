import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationsService,
  NotificationType,
} from "@/services/planner/notifications.service";

export const notificationKeys = {
  all: ["planner-notifications"] as const,
  list: (filter?: NotificationType | "all") =>
    ["planner-notifications", "list", filter] as const,
};

export function usePlannerNotifications(filter?: NotificationType | "all") {
  return useQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: () =>
      notificationsService.getNotifications(
        undefined,
        filter === "all" ? undefined : filter,
        1,
        50
      ),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
