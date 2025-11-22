"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MessageSquare, Filter, Search } from "lucide-react";
import { toast } from "react-toastify";

interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  eventType: string;
  eventDate: Date;
  createdAt: Date;
  response?: {
    text: string;
    createdAt: Date;
  };
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockReviews: Review[] = [
          {
            id: "1",
            clientName: "Sarah Johnson",
            rating: 5,
            comment:
              "Absolutely amazing service! The photography was stunning and captured every special moment perfectly. Highly recommend!",
            eventType: "Wedding",
            eventDate: new Date("2024-06-15"),
            createdAt: new Date("2024-06-20"),
          },
          {
            id: "2",
            clientName: "Michael Brown",
            rating: 5,
            comment:
              "Professional, creative, and a pleasure to work with. The photos exceeded our expectations!",
            eventType: "Corporate Event",
            eventDate: new Date("2024-05-20"),
            createdAt: new Date("2024-05-25"),
            response: {
              text: "Thank you so much for your kind words! It was a pleasure working with you.",
              createdAt: new Date("2024-05-26"),
            },
          },
          {
            id: "3",
            clientName: "Emma Davis",
            rating: 4,
            comment:
              "Great service overall. Very professional and delivered on time. Would recommend!",
            eventType: "Birthday Party",
            eventDate: new Date("2024-04-10"),
            createdAt: new Date("2024-04-15"),
          },
          {
            id: "4",
            clientName: "James Wilson",
            rating: 5,
            comment:
              "Outstanding work! The attention to detail was incredible. Thank you for making our day special.",
            eventType: "Wedding",
            eventDate: new Date("2024-03-25"),
            createdAt: new Date("2024-03-30"),
          },
        ];

        setReviews(mockReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmitResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      // TODO: Call API to submit response
      await new Promise((resolve) => setTimeout(resolve, 500));

      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                response: {
                  text: responseText,
                  createdAt: new Date(),
                },
              }
            : review
        )
      );

      toast.success("Response posted successfully");
      setRespondingTo(null);
      setResponseText("");
    } catch (error) {
      console.error("Error posting response:", error);
      toast.error("Failed to post response");
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesFilter =
      filter === "all" || review.rating === parseInt(filter);
    const matchesSearch =
      searchQuery === "" ||
      review.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-1">
          Manage and respond to customer reviews
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600">Average Rating</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Based on {reviews.length} reviews
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600">Total Reviews</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <span className="text-sm text-gray-600">Response Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reviews.length > 0
              ? Math.round(
                  (reviews.filter((r) => r.response).length / reviews.length) *
                    100
                )
              : 0}
            %
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
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString() as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  filter === rating.toString()
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating}
                <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">
            {searchQuery || filter !== "all"
              ? "Try adjusting your filters"
              : "Reviews from your clients will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-lg">
                    {review.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {review.clientName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {review.eventType} •{" "}
                      {review.eventDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  <p className="text-xs text-gray-500 mt-1">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Vendor Response */}
              {review.response ? (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-600">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Your Response
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.response.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {review.response.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ) : respondingTo === review.id ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmitResponse(review.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Post Response
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Respond to review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
