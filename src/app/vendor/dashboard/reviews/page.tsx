"use client";

import { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { reviewsService } from "@/services/reviews.service";
import type { Review, ReviewStats } from "@/types/review.types";
import Link from "next/link";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Review["status"]>("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter, ratingFilter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewsService.getAll({
          status: filter !== "all" ? filter : undefined,
          rating: ratingFilter !== "all" ? ratingFilter : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        }),
        reviewsService.getStats(),
      ]);

      setReviews(reviewsData.reviews);
      setTotalPages(reviewsData.totalPages);
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
      toast.error(error.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.response?.text || "");
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setSubmitting(true);
    try {
      if (selectedReview.response) {
        await reviewsService.updateResponse(selectedReview._id, {
          text: responseText,
        });
        toast.success("Response updated successfully");
      } else {
        await reviewsService.respond(selectedReview._id, {
          text: responseText,
        });
        toast.success("Response submitted successfully");
      }
      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText("");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      await reviewsService.deleteResponse(reviewId);
      toast.success("Response deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete response");
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewsService.approve(reviewId);
      toast.success("Review approved");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve review");
    }
  };

  const handleReject = async (reviewId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await reviewsService.reject(reviewId, reason);
      toast.success("Review rejected");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject review");
    }
  };

  const handleFlag = async (reviewId: string) => {
    const reason = prompt("Please provide a reason for flagging:");
    if (!reason) return;

    try {
      await reviewsService.flag(reviewId, reason);
      toast.success("Review flagged");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to flag review");
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const blob = await reviewsService.export(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reviews.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Reviews exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error("Failed to export reviews");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "flagged":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to customer reviews
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="relative">
            <button
              onClick={() => {}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
              <button
                onClick={() => handleExport("csv")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </p>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Needs Response</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.withoutResponse}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Verified</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.verified}
            </p>
          </div>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Rating Distribution</h2>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                stats.ratingDistribution[
                  rating as keyof typeof stats.ratingDistribution
                ];
              const percentage =
                stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reviews by author or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => {
            setRatingFilter(
              e.target.value === "all" ? "all" : parseInt(e.target.value)
            );
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({stats?.total || 0})
        </button>
        {[
          { key: "approved", label: "Approved", count: stats?.approved },
          { key: "pending", label: "Pending", count: stats?.pending },
          { key: "flagged", label: "Flagged", count: stats?.flagged },
          { key: "rejected", label: "Rejected", count: stats?.rejected },
        ].map((status) => (
          <button
            key={status.key}
            onClick={() => {
              setFilter(status.key as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === status.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label} ({status.count || 0})
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-600">
              {filter !== "all"
                ? "Try adjusting your filters"
                : "Your reviews will appear here"}
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {review.author.avatar ? (
                        <img
                          src={review.author.avatar}
                          alt={review.author.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-gray-600">
                          {review.author.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {review.author.name}
                        </h3>
                        {review.verified && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      {renderStars(review.rating)}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.title}
                  </h4>
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {/* Review Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    {review.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Review photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Votes */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpful} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="w-4 h-4" />
                    <span>{review.notHelpful} not helpful</span>
                  </div>
                </div>

                {/* Vendor Response */}
                {review.response && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        Response from {review.response.respondedByName}
                      </span>
                      <span className="text-sm text-blue-700">
                        {new Date(
                          review.response.respondedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-900">{review.response.text}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!review.response ? (
                    <button
                      onClick={() => handleRespond(review)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Respond
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRespond(review)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Edit Response
                      </button>
                      <button
                        onClick={() => handleDeleteResponse(review._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Delete Response
                      </button>
                    </>
                  )}

                  {review.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(review._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(review._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}

                  {review.status !== "flagged" && (
                    <button
                      onClick={() => handleFlag(review._id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Flag
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedReview.response ? "Edit Response" : "Respond to Review"}
            </h2>

            {/* Review Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {selectedReview.author.name}
                </span>
                {renderStars(selectedReview.rating)}
              </div>
              <p className="text-sm text-gray-700">{selectedReview.comment}</p>
            </div>

            {/* Response Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                {responseText.length} characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitResponse}
                disabled={submitting || !responseText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting..."
                  : selectedReview.response
                  ? "Update Response"
                  : "Submit Response"}
              </button>
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedReview(null);
                  setResponseText("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
