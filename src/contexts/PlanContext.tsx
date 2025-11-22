"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// PlanData interface
export interface PlanData {
  planId: string;
  planName: string;
  planType: "vendor" | "event_planner";
  amount: number;
  currency: "NGN" | "USD";
  period: string;
  timestamp: number;
}

interface PlanContextType {
  selectedPlan: PlanData | null;
  setSelectedPlan: (plan: Omit<PlanData, "timestamp"> | null) => void;
  clearSelectedPlan: () => void;
  getSelectedPlan: () => PlanData | null;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// localStorage key
const PLAN_STORAGE_KEY = "confetti_selected_plan";

// Plan expiration time (30 minutes)
const PLAN_EXPIRATION_TIME = 30 * 60 * 1000;

// Helper function to check if plan is expired
const isPlanExpired = (timestamp: number): boolean => {
  return Date.now() - timestamp > PLAN_EXPIRATION_TIME;
};

// Helper function to check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlanState] = useState<PlanData | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    // Check if localStorage is available
    if (!isLocalStorageAvailable()) {
      console.warn(
        "localStorage is not available. Plan data will not persist."
      );
      return;
    }

    try {
      const stored = localStorage.getItem(PLAN_STORAGE_KEY);
      if (stored) {
        try {
          const planData: PlanData = JSON.parse(stored);

          // Check if plan is expired
          if (isPlanExpired(planData.timestamp)) {
            localStorage.removeItem(PLAN_STORAGE_KEY);
            setSelectedPlanState(null);
          } else {
            setSelectedPlanState(planData);
          }
        } catch (error) {
          console.error("Error parsing stored plan data:", error);
          localStorage.removeItem(PLAN_STORAGE_KEY);
          setSelectedPlanState(null);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  // Set selected plan with timestamp and sync to localStorage
  const setSelectedPlan = (plan: Omit<PlanData, "timestamp"> | null) => {
    if (plan === null) {
      setSelectedPlanState(null);
      try {
        localStorage.removeItem(PLAN_STORAGE_KEY);
      } catch (error) {
        console.error("Error removing plan from localStorage:", error);
      }
    } else {
      const planWithTimestamp: PlanData = {
        ...plan,
        timestamp: Date.now(),
      };
      setSelectedPlanState(planWithTimestamp);
      try {
        localStorage.setItem(
          PLAN_STORAGE_KEY,
          JSON.stringify(planWithTimestamp)
        );
      } catch (error) {
        console.error("Error saving plan to localStorage:", error);
        // Still update state even if localStorage fails
      }
    }
  };

  // Clear selected plan
  const clearSelectedPlan = () => {
    setSelectedPlanState(null);
    try {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing plan from localStorage:", error);
    }
  };

  // Get selected plan (returns null if expired)
  const getSelectedPlan = (): PlanData | null => {
    if (selectedPlan && isPlanExpired(selectedPlan.timestamp)) {
      clearSelectedPlan();
      return null;
    }
    return selectedPlan;
  };

  const value = {
    selectedPlan,
    setSelectedPlan,
    clearSelectedPlan,
    getSelectedPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}
