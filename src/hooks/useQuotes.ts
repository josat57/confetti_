/**
 * Quote Management Hooks
 * React Query hooks for quote management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quoteService } from "@/services/quote.service";
import type {
  Quote,
  QuoteCreate,
  QuoteFilters,
  QuoteTemplate,
} from "@/types/quote.types";
import { toast } from "react-toastify";

// Cache key constants
const QUOTES_KEY = "quotes";
const QUOTE_TEMPLATES_KEY = "quote-templates";

/**
 * Get all quotes with optional filters
 */
export function useQuotes(filters?: QuoteFilters) {
  return useQuery({
    queryKey: [QUOTES_KEY, filters],
    queryFn: () => quoteService.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get a single quote by ID
 */
export function useQuoteById(id: string) {
  return useQuery({
    queryKey: [QUOTES_KEY, id],
    queryFn: () => quoteService.getById(id),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!id, // Only run if id is provided
  });
}

/**
 * Get quote templates
 */
export function useQuoteTemplates() {
  return useQuery({
    queryKey: [QUOTE_TEMPLATES_KEY],
    queryFn: quoteService.getTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new quote
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuoteCreate) => quoteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
      toast.success("Quote created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create quote");
    },
  });
}

/**
 * Update a quote
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuoteCreate> }) =>
      quoteService.update(id, data),
    onSuccess: (updatedQuote) => {
      queryClient.setQueryData([QUOTES_KEY, updatedQuote._id], updatedQuote);
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
      toast.success("Quote updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update quote");
    },
  });
}

/**
 * Send quote to client
 */
export function useSendQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quoteService.send(id),
    onSuccess: (updatedQuote) => {
      queryClient.setQueryData([QUOTES_KEY, updatedQuote._id], updatedQuote);
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
      toast.success("Quote sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send quote");
    },
  });
}

/**
 * Duplicate a quote
 */
export function useDuplicateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quoteService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTES_KEY] });
      toast.success("Quote duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to duplicate quote");
    },
  });
}

/**
 * Save a quote template
 */
export function useSaveQuoteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuoteTemplate) => quoteService.saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTE_TEMPLATES_KEY] });
      toast.success("Template saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save template");
    },
  });
}
