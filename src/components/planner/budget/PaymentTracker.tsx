"use client";

import { Expense } from "@/types/planner";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

interface PaymentTrackerProps {
  expenses: Expense[];
  currency: string;
  onMarkAsPaid: (expenseId: string) => void;
}

export default function PaymentTracker({
  expenses,
  currency,
  onMarkAsPaid,
}: PaymentTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter pending and overdue payments
  const pendingPayments = expenses.filter(
    (e) => e.paymentStatus === "Pending" && e.paymentDueDate
  );

  const overduePayments = expenses.filter((e) => e.paymentStatus === "Overdue");

  // Sort by due date
  const sortedPending = [...pendingPayments].sort((a, b) => {
    if (!a.paymentDueDate || !b.paymentDueDate) return 0;
    return (
      new Date(a.paymentDueDate).getTime() -
      new Date(b.paymentDueDate).getTime()
    );
  });

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const isUpcoming = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    return days <= 7 && days >= 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Tracker
      </h3>

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-semibold text-red-900">
              Overdue Payments ({overduePayments.length})
            </h4>
          </div>
          <div className="space-y-3">
            {overduePayments.map((expense) => (
              <div
                key={expense._id}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-red-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {expense.category}
                      {expense.vendor && ` • ${expense.vendor}`}
                    </p>
                    {expense.paymentDueDate && (
                      <p className="text-xs text-red-600 mt-1">
                        Due:{" "}
                        {format(
                          new Date(expense.paymentDueDate),
                          "MMM d, yyyy"
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-red-900">
                      {formatCurrency(expense.amount)}
                    </p>
                    <button
                      onClick={() => onMarkAsPaid(expense._id)}
                      className="mt-2 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {sortedPending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              Upcoming Payments ({sortedPending.length})
            </h4>
          </div>
          <div className="space-y-3">
            {sortedPending.map((expense) => {
              const daysUntil = expense.paymentDueDate
                ? getDaysUntilDue(expense.paymentDueDate)
                : null;
              const isUrgent =
                expense.paymentDueDate && isUpcoming(expense.paymentDueDate);

              return (
                <div
                  key={expense._id}
                  className={`border rounded-lg p-4 ${
                    isUrgent
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isUrgent ? "text-yellow-900" : "text-gray-900"
                        }`}
                      >
                        {expense.description}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          isUrgent ? "text-yellow-700" : "text-gray-600"
                        }`}
                      >
                        {expense.category}
                        {expense.vendor && ` • ${expense.vendor}`}
                      </p>
                      {expense.paymentDueDate && (
                        <div className="flex items-center gap-2 mt-2">
                          <p
                            className={`text-xs ${
                              isUrgent ? "text-yellow-600" : "text-gray-500"
                            }`}
                          >
                            Due:{" "}
                            {format(
                              new Date(expense.paymentDueDate),
                              "MMM d, yyyy"
                            )}
                          </p>
                          {daysUntil !== null && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isUrgent
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {daysUntil === 0
                                ? "Due today"
                                : daysUntil === 1
                                ? "Due tomorrow"
                                : `${daysUntil} days`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`font-bold ${
                          isUrgent ? "text-yellow-900" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => onMarkAsPaid(expense._id)}
                        className={`mt-2 px-3 py-1 text-xs font-medium rounded transition-colors ${
                          isUrgent
                            ? "text-yellow-700 bg-yellow-200 hover:bg-yellow-300"
                            : "text-gray-700 bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {overduePayments.length === 0 && sortedPending.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            All caught up!
          </p>
          <p className="text-sm text-gray-600">
            No pending or overdue payments at the moment
          </p>
        </div>
      )}

      {/* Summary */}
      {(overduePayments.length > 0 || sortedPending.length > 0) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Pending</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(
                [...overduePayments, ...sortedPending].reduce(
                  (sum, e) => sum + e.amount,
                  0
                )
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
