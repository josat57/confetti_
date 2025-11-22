/**
 * Integration Tests for Subscription Registration Flow
 * Tests complete user journeys from plan selection to registration completion
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";
import { PlanProvider } from "@/contexts/PlanContext";
import { Auth } from "@/api/api";

// Mock dependencies
jest.mock("@/api/api");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Subscription Registration Flow - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("Free Plan Registration Flow", () => {
    beforeEach(() => {
      // Set up free plan in localStorage
      const freePlan = {
        planId: "vendor-basic",
        planName: "Basic",
        planType: "vendor",
        amount: 0,
        period: "/month",
        timestamp: Date.now(),
      };
      localStorage.setItem("confetti_selected_plan", JSON.stringify(freePlan));
    });

    it("should complete free plan registration without payment", async () => {
      const user = userEvent.setup();

      // Mock successful registration
      (Auth.register as jest.Mock).mockResolvedValue({
        status: "success",
        message: "Registration successful",
      });

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Wait for plan details to be displayed
      await waitFor(() => {
        expect(screen.getByText("Basic")).toBeInTheDocument();
        expect(screen.getByText("$0")).toBeInTheDocument();
      });

      // Fill in registration form
      await user.type(screen.getByLabelText(/user name/i), "John Doe");
      await user.type(
        screen.getByLabelText(/email address/i),
        "john@example.com"
      );
      await user.type(screen.getByLabelText(/phone number/i), "+1234567890");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      await user.type(passwordInputs[0], "SecurePass123!");
      await user.type(passwordInputs[1], "SecurePass123!");

      // Accept terms
      const termsCheckbox = screen.getByRole("checkbox", { name: /terms/i });
      await user.click(termsCheckbox);

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(Auth.register).toHaveBeenCalledWith(
          expect.objectContaining({
            userName: "John Doe",
            email: "john@example.com",
            phone: "+1234567890",
            planId: "vendor-basic",
            amount: 0,
          })
        );
      });

      // Verify redirect to success page (no payment modal for free plan)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/register/success")
        );
      });
    });
  });

  describe("Paid Plan Registration Flow", () => {
    beforeEach(() => {
      // Set up paid plan in localStorage
      const paidPlan = {
        planId: "vendor-pro",
        planName: "Professional",
        planType: "vendor",
        amount: 49,
        period: "/month",
        timestamp: Date.now(),
      };
      localStorage.setItem("confetti_selected_plan", JSON.stringify(paidPlan));
    });

    it("should display paid plan details correctly", async () => {
      (Auth.register as jest.Mock).mockResolvedValue({
        status: "success",
        message: "Registration successful",
      });

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Verify paid plan details
      expect(screen.getByText("Professional")).toBeInTheDocument();
      expect(screen.getByText("$49")).toBeInTheDocument();
    });
  });

  describe("Error Scenarios", () => {
    beforeEach(() => {
      const plan = {
        planId: "vendor-basic",
        planName: "Basic",
        planType: "vendor",
        amount: 0,
        period: "/month",
        timestamp: Date.now(),
      };
      localStorage.setItem("confetti_selected_plan", JSON.stringify(plan));
    });

    it("should handle missing plan selection", async () => {
      localStorage.clear();

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Should redirect to pricing section
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/#pricing");
      });
    });

    it("should handle network errors with retry option", async () => {
      const user = userEvent.setup();

      // Mock network error
      (Auth.register as jest.Mock).mockRejectedValue({
        code: "ERR_NETWORK",
        message: "Network error",
      });

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Fill form
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/phone number/i), "+1234567890");
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      await user.type(passwordInputs[0], "TestPass123!");
      await user.type(passwordInputs[1], "TestPass123!");
      await user.click(screen.getByRole("checkbox", { name: /terms/i }));
      await user.click(screen.getByRole("button", { name: /create account/i }));

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry button should be available
      const retryButton = screen.getByRole("button", { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it("should validate password mismatch", async () => {
      const user = userEvent.setup();

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      await user.type(passwordInputs[0], "Password123!");
      await user.type(passwordInputs[1], "DifferentPass123!");
      await user.click(screen.getByRole("checkbox", { name: /terms/i }));
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        const matchStatuses = screen.getAllByText(/passwords do not match/i);
        expect(matchStatuses.length).toBeGreaterThan(0);
      });

      expect(Auth.register).not.toHaveBeenCalled();
    });

    it("should validate weak password", async () => {
      const user = userEvent.setup();

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      const passwordInputs = screen.getAllByPlaceholderText("••••••••");
      await user.type(passwordInputs[0], "weak");
      await user.type(passwordInputs[1], "weak");
      await user.click(screen.getByRole("checkbox", { name: /terms/i }));
      await user.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/stronger password/i)).toBeInTheDocument();
      });

      expect(Auth.register).not.toHaveBeenCalled();
    });

    it("should handle expired plan selection", async () => {
      // Set expired plan (older than 30 minutes)
      const expiredPlan = {
        planId: "vendor-basic",
        planName: "Basic",
        planType: "vendor",
        amount: 0,
        period: "/month",
        timestamp: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      };
      localStorage.setItem(
        "confetti_selected_plan",
        JSON.stringify(expiredPlan)
      );

      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Should redirect due to expired plan
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/#pricing");
      });
    });
  });

  describe("Browser Navigation", () => {
    beforeEach(() => {
      const plan = {
        planId: "vendor-basic",
        planName: "Basic",
        planType: "vendor",
        amount: 0,
        period: "/month",
        timestamp: Date.now(),
      };
      localStorage.setItem("confetti_selected_plan", JSON.stringify(plan));
    });

    it("should handle back button navigation", async () => {
      render(
        <PlanProvider>
          <RegisterPage />
        </PlanProvider>
      );

      // Simulate back button click
      const backButton = screen.getByRole("button", { name: /back to home/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
