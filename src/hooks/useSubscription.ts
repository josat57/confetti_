/**
 * Subscription Hooks
 * React Query hooks for subscription management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { toast } from "react-toastify";

/**
 * Get current user's subscription
 */
export function useMySubscription() {
  return useQuery({
    queryKey: ["subscription", "my"],
    queryFn: subscriptionService.getMySubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get available subscription plans
 */
export function useSubscriptionPlans(params?: {
  planType?: "vendor" | "planner";
  currency?: string;
}) {
  return useQuery({
    queryKey: ["subscription", "plans", params],
    queryFn: () => subscriptionService.getPlans(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Get specific plan details
 */
export function useSubscriptionPlan(planId: string) {
  return useQuery({
    queryKey: ["subscription", "plan", planId],
    queryFn: () => subscriptionService.getPlanById(planId),
    enabled: !!planId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Upgrade subscription
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      newPlanId: string;
      paymentMethod: "flutterwave" | "paystack";
    }) => subscriptionService.upgrade(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      // If payment URL is provided, redirect to payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.success("Subscription upgraded successfully");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to upgrade subscription"
      );
    },
  });
}

/**
 * Downgrade subscription
 */
export function useDowngradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { newPlanId: string; reason?: string }) =>
      subscriptionService.downgrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription downgraded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to downgrade subscription"
      );
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { reason: string; feedback?: string }) =>
      subscriptionService.cancel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    },
  });
}

/**
 * Reactivate subscription
 */
export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionService.reactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription reactivated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to reactivate subscription"
      );
    },
  });
}

/**
 * Get subscription usage
 */
export function useSubscriptionUsage() {
  return useQuery({
    queryKey: ["subscription", "usage"],
    queryFn: subscriptionService.getUsage,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Get subscription history
 */
export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ["subscription", "history"],
    queryFn: subscriptionService.getHistory,
  });
}

/**
 * Verify payment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      paymentReference: string;
      provider: "flutterwave" | "paystack";
    }) => subscriptionService.verifyPayment(data),
    onSuccess: (data) => {
      if (data.verified) {
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        toast.success("Payment verified successfully");
      } else {
        toast.error("Payment verification failed");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify payment");
    },
  });
}
