import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "@/services/planner/clients.service";
import { CreateClientInput, UpdateClientInput } from "@/types/planner";

export const clientKeys = {
  all: ["planner-clients"] as const,
  list: (filters: Record<string, string>) => ["planner-clients", "list", filters] as const,
};

export function usePlannerClients(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: () => clientsService.getClients(filters),
    staleTime: 60_000,
  });
}

export function useCreatePlannerClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.createClient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useUpdatePlannerClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) =>
      clientsService.updateClient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useDeletePlannerClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
  });
}
