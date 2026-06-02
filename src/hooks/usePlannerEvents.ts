import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { eventsService } from "@/services/planner/events.service";
import { EventFilters, EventSortOption } from "@/types/planner";

export const plannerEventKeys = {
  all: ["planner-events"] as const,
  list: (filters: EventFilters, sortBy: EventSortOption, page: number) =>
    ["planner-events", "list", filters, sortBy, page] as const,
};

export function usePlannerEvents(
  filters: EventFilters & { search?: string },
  sortBy: EventSortOption,
  page: number,
  limit = 12
) {
  return useQuery({
    queryKey: plannerEventKeys.list(filters, sortBy, page),
    queryFn: () => eventsService.getEvents(filters, sortBy, page, limit),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDeletePlannerEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: plannerEventKeys.all }),
  });
}

export function useBulkDeletePlannerEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => eventsService.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: plannerEventKeys.all }),
  });
}
