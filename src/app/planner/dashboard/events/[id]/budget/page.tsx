"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { budgetService } from "@/services/planner/budget.service";
import Link from "next/link";

interface BudgetCategory {
  _id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetExpense {
  _id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
}

interface EventBudgetData {
  eventId: string;
  eventName: string;
  totalBudget: number;
  totalSpent: number;
  categories: BudgetCategory[];
  recentExpenses: BudgetExpense[];
}

export default function EventBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [data, setData] = useState<EventBudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventBudget();
    }
  }, [eventId]);

  const fetchEventBudget = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getEventBudget(eventId);
      const budgetData = response.budget;

      // Transform the budget data to match our component's expected structure
      setData({
        eventId,
        eventName: "Event", // We'll need to fetch event details separately if needed
        totalBudget: budgetData.total || 0,
        totalSpent: budgetData.totalSpent || 0,
        categories:
          budgetData.categories?.map((cat) => ({
            _id: cat.category,
            name: cat.category,
            allocated: cat.allocated || 0,
            spent: cat.spent || 0,
          })) || [],
        recentExpenses: budgetData.expenses || [],
      });
    } catch (error) {
      console.error("Error fetching event budget:", error);
      setData({
        eventId,
        eventName: "Event",
        totalBudget: 0,
        totalSpent: 0,
        categories: [],
        recentExpenses: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    const value = amount || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculatePercentage = (spent: number, budget: number) => {
    if (!budget || budget === 0) return 0;
    return (spent / budget) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Budget data not available
          </h3>
          <p className="text-gray-600 mb-6">
            Unable to load budget information for this event
          </p>
          <Link
            href="/planner/dashboard/budget"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Budget Overview
          </Link>
        </div>
      </div>
    );
  }

  const totalBudget = data.totalBudget || 0;
  const totalSpent = data.totalSpent || 0;
  const remaining = totalBudget - totalSpent;
  const spentPercentage = calculatePercentage(totalSpent, totalBudget);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/planner/dashboard/budget"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Budget Overview
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{data.eventName}</h1>
        <p className="text-gray-600 mt-1">Manage budget and track expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Budget Used</p>
              <p className="text-xl font-bold text-gray-900">
                {isFinite(spentPercentage) ? spentPercentage.toFixed(1) : "0.0"}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Budget Progress
          </h2>
          <span className="text-sm text-gray-600">
            {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              spentPercentage > 100
                ? "bg-red-600"
                : spentPercentage > 80
                ? "bg-yellow-500"
                : "bg-teal-600"
            }`}
            style={{
              width: `${Math.min(
                isFinite(spentPercentage) ? spentPercentage : 0,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Categories */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Budget Categories
            </h2>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {data.categories?.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No budget categories yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add categories to organize your budget
                </p>
              </div>
            ) : (
              data.categories?.map((category) => {
                const categoryAllocated = category.allocated || 0;
                const categorySpent = category.spent || 0;
                const categoryPercentage = calculatePercentage(
                  categorySpent,
                  categoryAllocated
                );
                const categoryRemaining = categoryAllocated - categorySpent;

                return (
                  <div key={category._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(categorySpent)} of{" "}
                          {formatCurrency(categoryAllocated)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(categoryRemaining)}
                        </p>
                        <p className="text-xs text-gray-500">remaining</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          categoryPercentage > 100
                            ? "bg-red-600"
                            : categoryPercentage > 80
                            ? "bg-yellow-500"
                            : "bg-teal-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            isFinite(categoryPercentage)
                              ? categoryPercentage
                              : 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h2>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {data.recentExpenses?.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No expenses recorded yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start tracking your event expenses
                </p>
              </div>
            ) : (
              data.recentExpenses?.map((expense) => (
                <div
                  key={expense._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {expense.description || "Expense"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {expense.category}
                        {expense.vendor && ` • ${expense.vendor}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </p>
                      <div className="flex items-center gap-1">
                        <button className="p-1 text-gray-400 hover:text-teal-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
