"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuotes, useSendQuote, useDuplicateQuote } from "@/hooks/useQuotes";
import type { QuoteStatus, QuoteFilters } from "@/types/quote.types";
import { FileText, Plus, Search, Eye, Send } from "lucide-react";
import Link from "next/link";

export default function QuotesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuoteFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");

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

  // Calculate stats from data
  const stats = {
    total: data?.quotes?.length || 0,
    draft: data?.quotes?.filter((q) => q.status === "draft").length || 0,
    sent: data?.quotes?.filter((q) => q.status === "sent").length || 0,
    accepted: data?.quotes?.filter((q) => q.status === "accepted").length || 0,
    totalValue:
      data?.quotes
        ?.filter((q) => q.status === "accepted")
        .reduce((sum, q) => sum + q.total, 0) || 0,
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
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quotes & Proposals
          </h1>
          <p className="text-gray-600 mt-1">Create and manage client quotes</p>
        </div>
        <Link
          href="/vendor/dashboard/quotes/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Quote</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Quotes</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">
            ₦{stats.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => handleFilterChange("status", undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                !filters.status
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {["draft", "sent", "viewed", "accepted", "rejected", "expired"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange("status", status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filters.status === status
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Quotes List */}
      {!data?.quotes || data.quotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quotes found
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.status
              ? "Try adjusting your filters"
              : "Create your first quote to get started"}
          </p>
          {!filters.status && (
            <Link
              href="/vendor/dashboard/quotes/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Quote</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data.quotes.map((quote) => (
            <div
              key={quote._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {quote.customer.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quote #{quote.quoteNumber}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    quote.status
                  )}`}
                >
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${quote.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(quote.createdAt).toLocaleDateString()}
                    {quote.sentAt &&
                      ` • Sent ${new Date(quote.sentAt).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/vendor/dashboard/quotes/${quote._id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                  {quote.status === "draft" && (
                    <button
                      onClick={() => handleSendQuote(quote._id)}
                      disabled={sendQuote.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
