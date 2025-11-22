"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuotes, useSendQuote, useDuplicateQuote } from "@/hooks/useQuotes";
import type { QuoteStatus, QuoteFilters } from "@/types/quote.types";

export default function QuotesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuoteFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useQuotes(filters);
  const sendQuote = useSendQuote();
  const duplicateQuote = useDuplicateQuote();

  const handleFilterChange = (key: keyof QuoteFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSendQuote = async (quoteId: string) => {
    if (confirm("Are you sure you want to send this quote?")) {
      await sendQuote.mutateAsync(quoteId);
    }
  };

  const handleDuplicateQuote = async (quoteId: string) => {
    await duplicateQuote.mutateAsync(quoteId);
  };

  const getStatusColor = (status: QuoteStatus) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      viewed: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-orange-100 text-orange-800",
    };
    return colors[status] || colors.draft;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quotes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">
          Error loading quotes. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <button
          onClick={() => router.push("/dashboard/quotes/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Quote
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.status || ""}
          onChange={(e) =>
            handleFilterChange("status", e.target.value || undefined)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={filters.sortBy || ""}
          onChange={(e) =>
            handleFilterChange("sortBy", e.target.value || undefined)
          }
          className="px-4 py-2 border rounded"
        >
          <option value="">Sort By</option>
          <option value="createdAt">Date Created</option>
          <option value="validUntil">Valid Until</option>
          <option value="total">Total Amount</option>
        </select>

        <select
          value={filters.sortOrder || "desc"}
          onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {data?.quotes?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-500 mb-4">No quotes found</p>
            <button
              onClick={() => router.push("/dashboard/quotes/new")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Your First Quote
            </button>
          </div>
        ) : (
          data?.quotes?.map((quote) => (
            <div
              key={quote._id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      Quote #{quote.quoteNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                        quote.status
                      )}`}
                    >
                      {quote.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold">Customer:</span>{" "}
                      {quote.customer.name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {quote.customer.email}
                    </p>
                    <p>
                      <span className="font-semibold">Total:</span> $
                      {quote.total.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Valid Until:</span>{" "}
                      {new Date(quote.validUntil).toLocaleDateString()}
                    </p>
                    {quote.sentAt && (
                      <p>
                        <span className="font-semibold">Sent:</span>{" "}
                        {new Date(quote.sentAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${quote.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {quote.items.length} item
                    {quote.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push(`/dashboard/quotes/${quote._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Details
                </button>

                {quote.status === "draft" && (
                  <button
                    onClick={() => handleSendQuote(quote._id)}
                    disabled={sendQuote.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Send Quote
                  </button>
                )}

                <button
                  onClick={() => handleDuplicateQuote(quote._id)}
                  disabled={duplicateQuote.isPending}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  Duplicate
                </button>

                {quote.status === "draft" && (
                  <button
                    onClick={() =>
                      router.push(`/dashboard/quotes/${quote._id}/edit`)
                    }
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            disabled={filters.page === 1}
            onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <button
            disabled={filters.page === data.pagination.pages}
            onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
