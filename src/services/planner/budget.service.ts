import api from "@/api/api";
import {
  EventBudget,
  CreateExpenseInput,
  UpdateExpenseInput,
  Expense,
} from "@/types/planner";

class BudgetService {
  /**
   * Get budget for an event
   */
  async getEventBudget(eventId: string): Promise<{ budget: EventBudget }> {
    const response = await api.get(`/events/${eventId}/budget`);
    return response.data;
  }

  /**
   * Update event budget
   */
  async updateEventBudget(
    eventId: string,
    data: {
      total: number;
      categories: Array<{
        category: string;
        allocated: number;
        percentage: number;
      }>;
      contingency?: number;
    }
  ): Promise<{ budget: EventBudget }> {
    const response = await api.put(
      `/events/${eventId}/budget`,
      data
    );
    return response.data;
  }

  /**
   * Add expense to event
   */
  async addExpense(
    eventId: string,
    data: CreateExpenseInput
  ): Promise<{ expense: Expense }> {
    const response = await api.post(
      `/events/${eventId}/expenses`,
      data
    );
    return response.data;
  }

  /**
   * Update expense
   */
  async updateExpense(
    expenseId: string,
    data: UpdateExpenseInput
  ): Promise<{ expense: Expense }> {
    const response = await api.put(
      `/planner/expenses/${expenseId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/planner/expenses/${expenseId}`);
    return response.data;
  }

  /**
   * Get budget overview across all events
   */
  async getBudgetOverview(): Promise<{
    totalBudget: number;
    totalSpent: number;
    byEvent: Array<{
      eventId: string;
      eventName: string;
      budget: number;
      spent: number;
    }>;
  }> {
    const response = await api.get("/planner/budget/overview");
    return response.data;
  }
}

export const budgetService = new BudgetService();
