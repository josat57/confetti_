"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Star,
  Heart,
  Briefcase,
  Filter,
  Phone,
  ExternalLink,
  Loader2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { vendorsService } from "@/services/planner/vendors.service";
import type { Vendor } from "@/types/planner";
import { toast } from "react-toastify";
import QuoteRequestModal from "@/components/user/booking/QuoteRequestModal";
import SmartMatchPanel from "@/components/user/vendors/SmartMatchPanel";
import { useVendors, useFavoriteVendors } from "@/hooks/useVendors";
import { scoreVendors, MatchCriteria, MatchedVendor } from "@/services/smart-match.service";
import { useQueryClient } from "@tanstack/react-query";
import { vendorKeys } from "@/hooks/useVendors";

const CATEGORIES = [
  "All", "Photography", "Catering", "Decoration", "Music & Entertainment",
  "Venue", "Makeup & Beauty", "MC / Host", "Videography", "Event Planning", "Other",
];

function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 bg-gray-200 rounded-lg flex-1" />
          <div className="h-9 w-9 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 75 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>
      <Trophy className="w-2.5 h-2.5" />
      {score}% match
    </span>
  );
}

const formatPrice = (vendor: Vendor) => {
  if (!vendor.pricing?.startingPrice) return null;
  return `From ${new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: vendor.pricing.currency || "NGN",
    minimumFractionDigits: 0,
  }).format(vendor.pricing.startingPrice)}`;
};

export default function UserVendorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [quoteVendor, setQuoteVendor] = useState<Vendor | null>(null);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);

  // Smart match state
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria | null>(null);
  const [matchedVendors, setMatchedVendors] = useState<MatchedVendor[] | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    search: debouncedSearch || undefined,
    category: category !== "All" ? category : undefined,
    page,
    limit: matchCriteria ? 50 : 12, // fetch more when smart matching
  };

  const { data, isLoading, isFetching } = useVendors(filters);
  const { data: favorites = new Set<string>() } = useFavoriteVendors();

  const vendors = data?.vendors ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  // Run smart matching whenever vendors or criteria change
  useEffect(() => {
    if (!matchCriteria || vendors.length === 0) return;
    setMatchedVendors(scoreVendors(vendors, matchCriteria));
    setIsMatching(false);
  }, [vendors, matchCriteria]);

  const handleSmartMatch = useCallback(async (criteria: MatchCriteria) => {
    setIsMatching(true);
    setMatchCriteria(criteria);
    setCategory("All"); // reset category filter so we fetch all
    setPage(1);
    // scoreVendors runs in the useEffect above once data loads
  }, []);

  const clearMatch = () => {
    setMatchCriteria(null);
    setMatchedVendors(null);
    setShowMatchPanel(false);
  };

  const displayVendors = matchedVendors ?? vendors;

  async function toggleFavorite(vendorId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setTogglingFav(vendorId);
    try {
      if (favorites.has(vendorId)) {
        await vendorsService.removeFromFavorites(vendorId);
        toast.info("Removed from saved vendors");
      } else {
        await vendorsService.addToFavorites(vendorId);
        toast.success("Saved to your vendors");
      }
      queryClient.invalidateQueries({ queryKey: vendorKeys.favorites });
    } catch {
      toast.error("Couldn't update favorites");
    } finally {
      setTogglingFav(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">Discover and save vetted event professionals</p>
        </div>
        <button
          onClick={() => { setShowMatchPanel((v) => !v); if (matchedVendors) clearMatch(); }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl shadow-sm transition-colors ${
            matchCriteria
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {matchCriteria ? "Matched for you" : "Smart Match"}
        </button>
      </div>

      {/* Smart match panel */}
      {showMatchPanel && !matchCriteria && (
        <SmartMatchPanel
          onMatch={handleSmartMatch}
          onClose={() => setShowMatchPanel(false)}
          isMatching={isMatching}
        />
      )}

      {/* Active match banner */}
      {matchCriteria && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Showing best matches for your <strong>{matchCriteria.eventType}</strong> in {matchCriteria.location}
            </span>
          </div>
          <button onClick={clearMatch} className="text-xs text-green-700 hover:underline font-medium">
            Clear
          </button>
        </div>
      )}

      {/* Search + category filter (hidden in match mode) */}
      {!matchCriteria && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          {matchedVendors
            ? `${matchedVendors.length} vendors matched and ranked for your event`
            : total > 0
            ? `${total} vendor${total !== 1 ? "s" : ""} found${isFetching ? " · Refreshing…" : ""}`
            : ""}
        </p>
      )}

      {/* Grid */}
      {isLoading || (isMatching && !matchedVendors) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <VendorCardSkeleton key={i} />)}
        </div>
      ) : displayVendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5">
            <Briefcase className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No vendors found</h3>
          <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayVendors.map((vendor) => {
              const isFav = favorites.has(vendor._id);
              const priceLabel = formatPrice(vendor);
              const matchScore = (vendor as MatchedVendor).matchScore;
              const matchReasons = (vendor as MatchedVendor).matchReasons;

              return (
                <div
                  key={vendor._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Cover image */}
                  <div className="relative h-44 bg-gradient-to-br from-purple-100 to-indigo-100">
                    {vendor.portfolio?.[0]?.url ? (
                      <img
                        src={vendor.portfolio[0].url}
                        alt={vendor.businessName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleFavorite(vendor._id, e)}
                      disabled={togglingFav === vendor._id}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                      {togglingFav === vendor._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <Heart className={`w-4 h-4 ${isFav ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                      )}
                    </button>
                    {vendor.featured && (
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                        {vendor.businessName}
                      </h3>
                      {matchScore !== undefined && <MatchBadge score={matchScore} />}
                    </div>

                    <p className="text-xs font-medium text-purple-600 mb-2">{vendor.category}</p>

                    {/* Match reasons */}
                    {matchReasons?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {matchReasons.map((r, i) => (
                          <span key={i} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {vendor.rating > 0 && (
                      <div className="mb-2 flex items-center gap-1">
                        <StarRating rating={vendor.rating} />
                        <span className="text-xs text-gray-400">({vendor.reviewCount})</span>
                      </div>
                    )}

                    {vendor.location?.city && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {vendor.location.city}, {vendor.location.state}
                      </div>
                    )}

                    {priceLabel && (
                      <p className="text-sm font-semibold text-gray-900 mb-3">{priceLabel}</p>
                    )}

                    {vendor.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{vendor.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {vendor.contactInfo?.phone && (
                        <a
                          href={`tel:${vendor.contactInfo.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      {vendor.contactInfo?.website && (
                        <a
                          href={vendor.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Website
                        </a>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(vendor._id, e)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isFav ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
                        {isFav ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuoteVendor(vendor); }}
                        className="ml-auto flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination — hidden in smart match mode since all results shown */}
          {!matchCriteria && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Quote request modal */}
      {quoteVendor && (
        <QuoteRequestModal
          vendor={{
            _id: quoteVendor._id,
            businessName: quoteVendor.businessName,
            category: quoteVendor.category,
            pricing: {
              startingPrice: quoteVendor.pricing?.startingPrice,
              currency: quoteVendor.pricing?.currency,
            },
          }}
          onClose={() => setQuoteVendor(null)}
          onSuccess={() => setQuoteVendor(null)}
        />
      )}
    </div>
  );
}
