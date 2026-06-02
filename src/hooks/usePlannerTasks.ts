import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/services/planner/tasks.service";
import { CreateTaskInput, TaskStatus, TaskPriority } from "@/types/planner";

export interface TaskFilters {
  event?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
}

export const taskKeys = {
  all: ["planner-tasks"] as const,
  list: (filters: TaskFilters) => ["planner-tasks", "list", filters] as const,
};

export function usePlannerTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () =>
      tasksService.getTasks({
        event: filters.event || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      }),
    staleTime: 30_000,
  });
}

export function useCreatePlannerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksService.createTask(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdatePlannerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTaskInput }) =>
      tasksService.updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeletePlannerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useCompletePlannerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksService.completeTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
