/**
 * Lead Management Hooks
 * React Query hooks for lead management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/lead.service";
import type {
  Lead,
  LeadCreate,
  LeadFilters,
  LeadStatus,
} from "@/types/lead.types";
import { toast } from "react-toastify";

// Cache key constants
const LEADS_KEY = "leads";
const LEAD_STATS_KEY = "lead-stats";

/**
 * Get all leads with optional filters
 */
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadService.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get a single lead by ID
 */
export function useLeadById(id: string) {
  return useQuery({
    queryKey: [LEADS_KEY, id],
    queryFn: () => leadService.getById(id),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Get lead statistics
 */
export function useLeadStats() {
  return useQuery({
    queryKey: [LEAD_STATS_KEY],
    queryFn: leadService.getStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeadCreate) => leadService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEAD_STATS_KEY] });
      toast.success("Lead created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create lead");
    },
  });
}

/**
 * Update a lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadCreate> }) =>
      leadService.update(id, data),
    onSuccess: (updatedLead) => {
      queryClient.setQueryData([LEADS_KEY, updatedLead._id], updatedLead);
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success("Lead updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update lead");
    },
  });
}

/**
 * Update lead status
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      leadService.updateStatus(id, status),
    onSuccess: (updatedLead) => {
      queryClient.setQueryData([LEADS_KEY, updatedLead._id], updatedLead);
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      queryClient.invalidateQueries({ queryKey: [LEAD_STATS_KEY] });
      toast.success("Lead status updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update lead status"
      );
    },
  });
}

/**
 * Add a note to a lead
 */
export function useAddLeadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      leadService.addNote(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success("Note added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add note");
    },
  });
}

/**
 * Send a quote to a lead
 */
export function useSendQuoteToLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quoteId }: { id: string; quoteId: string }) =>
      leadService.sendQuote(id, quoteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success("Quote sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send quote");
    },
  });
}
