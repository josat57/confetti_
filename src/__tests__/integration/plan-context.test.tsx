/**
 * Integration Tests for Plan Context
 * Tests plan selection persistence and expiration logic
 */

import { renderHook, act } from "@testing-library/react";
import { PlanProvider, usePlan } from "@/contexts/PlanContext";
import { ReactNode } from "react";

describe("Plan Context - Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <PlanProvider>{children}</PlanProvider>
  );

  it("should store and retrieve plan data", () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    const planData = {
      planId: "vendor-pro",
      planName: "Professional",
      planType: "vendor" as const,
      amount: 49,
      period: "/month",
    };

    act(() => {
      result.current.setSelectedPlan(planData);
    });

    expect(result.current.selectedPlan).toMatchObject(planData);
    expect(result.current.selectedPlan?.timestamp).toBeDefined();
  });

  it("should persist plan to localStorage", () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    const planData = {
      planId: "planner-basic",
      planName: "Starter",
      planType: "event_planner" as const,
      amount: 0,
      period: "/month",
    };

    act(() => {
      result.current.setSelectedPlan(planData);
    });

    const stored = localStorage.getItem("confetti_selected_plan");
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.planId).toBe("planner-basic");
    expect(parsed.timestamp).toBeDefined();
  });

  it("should load plan from localStorage on mount", () => {
    const planData = {
      planId: "vendor-enterprise",
      planName: "Enterprise",
      planType: "vendor",
      amount: 99,
      period: "/month",
      timestamp: Date.now(),
    };

    localStorage.setItem("confetti_selected_plan", JSON.stringify(planData));

    const { result } = renderHook(() => usePlan(), { wrapper });

    expect(result.current.selectedPlan).toMatchObject({
      planId: "vendor-enterprise",
      planName: "Enterprise",
      amount: 99,
    });
  });

  it("should clear expired plans on mount", () => {
    const expiredPlan = {
      planId: "vendor-basic",
      planName: "Basic",
      planType: "vendor",
      amount: 0,
      period: "/month",
      timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
    };

    localStorage.setItem("confetti_selected_plan", JSON.stringify(expiredPlan));

    const { result } = renderHook(() => usePlan(), { wrapper });

    expect(result.current.selectedPlan).toBeNull();
    expect(localStorage.getItem("confetti_selected_plan")).toBeNull();
  });

  it("should clear plan data", () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    act(() => {
      result.current.setSelectedPlan({
        planId: "test-plan",
        planName: "Test",
        planType: "vendor",
        amount: 10,
        period: "/month",
      });
    });

    expect(result.current.selectedPlan).not.toBeNull();

    act(() => {
      result.current.clearSelectedPlan();
    });

    expect(result.current.selectedPlan).toBeNull();
    expect(localStorage.getItem("confetti_selected_plan")).toBeNull();
  });

  it("should handle plan expiration check", () => {
    const { result } = renderHook(() => usePlan(), { wrapper });

    // Set a valid plan first
    act(() => {
      result.current.setSelectedPlan({
        planId: "test-plan",
        planName: "Test",
        planType: "vendor",
        amount: 10,
        period: "/month",
      });
    });

    // Verify plan is valid
    expect(result.current.getSelectedPlan()).not.toBeNull();
  });
});
