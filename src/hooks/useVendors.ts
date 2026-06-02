import { useQuery } from "@tanstack/react-query";
import { vendorsService } from "@/services/planner/vendors.service";
import type { VendorSearchFilters } from "@/types/planner";

export const vendorKeys = {
  list: (filters: VendorSearchFilters & { page?: number }) =>
    ["vendors", "list", filters] as const,
  favorites: ["vendors", "favorites"] as const,
};

export function useVendors(filters: VendorSearchFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: async () => {
      const res = await vendorsService.searchVendors({
        ...filters,
        limit: filters.limit ?? 12,
      });
      return {
        vendors: res.vendors || [],
        total: res.total || 0,
        totalPages: res.totalPages || 1,
      };
    },
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFavoriteVendors() {
  return useQuery({
    queryKey: vendorKeys.favorites,
    queryFn: async () => {
      const res = await vendorsService.getFavorites();
      return new Set<string>((res.vendors || []).map((v: any) => v._id as string));
    },
    staleTime: 5 * 60 * 1000,
  });
}
