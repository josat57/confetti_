import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userBookingService, UserBookingStatus } from "@/services/user-booking.service";

export const bookingKeys = {
  all: ["user-bookings"] as const,
  list: (params: Record<string, unknown>) => ["user-bookings", "list", params] as const,
  detail: (id: string) => ["user-bookings", "detail", id] as const,
};

export function useUserBookings(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: bookingKeys.list(params as Record<string, unknown>),
    queryFn: () => userBookingService.getMyBookings(params),
    placeholderData: (prev) => prev,
    staleTime: 60 * 1000,
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => userBookingService.getBookingById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      userBookingService.cancelBooking(id, reason),
    onSuccess: (_data, { id }) => {
      // Optimistically update detail cache
      queryClient.setQueryData(
        bookingKeys.detail(id),
        (old: any) => old ? { ...old, status: "Cancelled" as UserBookingStatus } : old
      );
      // Invalidate list so it refetches
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}
