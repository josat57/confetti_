import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calendarService } from "@/services/calendar.service";
import type { BlockDatesRequest, BusinessHours } from "@/types/calendar.types";
import { toast } from "react-toastify";

const CALENDAR_KEY = "calendar";
const AVAILABILITY_KEY = "availability";

export function useCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [CALENDAR_KEY, startDate, endDate],
    queryFn: () => calendarService.getCalendar({ startDate, endDate }),
    staleTime: 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
}

export function useAvailability(date: string) {
  return useQuery({
    queryKey: [AVAILABILITY_KEY, date],
    queryFn: () => calendarService.checkAvailability(date),
    staleTime: 60 * 1000,
    enabled: !!date,
  });
}

export function useBlockDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockDatesRequest) => calendarService.blockDates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABILITY_KEY] });
      toast.success("Dates blocked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to block dates");
    },
  });
}

export function useUnblockDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) => calendarService.unblockDates(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] });
      queryClient.invalidateQueries({ queryKey: [AVAILABILITY_KEY] });
      toast.success("Dates unblocked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unblock dates");
    },
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hours: BusinessHours[]) => calendarService.updateHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALENDAR_KEY] });
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Business hours updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update business hours"
      );
    },
  });
}
