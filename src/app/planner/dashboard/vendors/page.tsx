"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, GitCompare, Search } from "lucide-react";
import VendorSearch from "@/components/planner/vendors/VendorSearch";
import VendorCard from "@/components/planner/vendors/VendorCard";
import VendorComparison from "@/components/planner/vendors/VendorComparison";
import VendorBookingForm from "@/components/planner/vendors/VendorBookingForm";
import { vendorsService } from "@/services/planner/vendors.service";
import {
  Vendor,
  VendorSearchFilters,
  CreateBookingInput,
} from "@/types/planner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<VendorSearchFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [selectedForComparison, setSelectedForComparison] = useState<
    Set<string>
  >(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [vendorToBook, setVendorToBook] = useState<Vendor | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchVendors(currentFilters);
  }, [currentFilters]);

  const fetchCategories = async () => {
    try {
      const response = await vendorsService.getCategories();
      if (response?.categories && Array.isArray(response.categories)) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await vendorsService.getFavorites();
      if (response?.vendors && Array.isArray(response.vendors)) {
        const favoriteIds = new Set(response.vendors.map((v) => v._id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites(new Set());
    }
  };

  const fetchVendors = async (filters: VendorSearchFilters) => {
    try {
      setLoading(true);
      const response = await vendorsService.searchVendors(filters);
      if (response?.vendors && Array.isArray(response.vendors)) {
        setVendors(response.vendors);
        setPagination({
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          total: response.total || 0,
        });
      } else {
        setVendors([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: VendorSearchFilters) => {
    setCurrentFilters({ ...filters, page: 1 });
  };

  const handleToggleFavorite = async (vendorId: string) => {
    try {
      if (favorites.has(vendorId)) {
        await vendorsService.removeFromFavorites(vendorId);
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(vendorId);
          return newSet;
        });
      } else {
        await vendorsService.addToFavorites(vendorId);
        setFavorites((prev) => new Set(prev).add(vendorId));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorites");
    }
  };

  const handleBook = (vendor: Vendor) => {
    setVendorToBook(vendor);
  };

  const handleBookingSubmit = async (data: CreateBookingInput) => {
    try {
      await vendorsService.createBooking(data);
      setVendorToBook(null);
      alert("Booking request sent successfully!");
      router.push("/planner/dashboard/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to send booking request");
    }
  };

  const handleToggleCompareSelection = (vendorId: string) => {
    setSelectedForComparison((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        if (newSet.size >= 4) {
          alert("You can compare up to 4 vendors at a time");
          return prev;
        }
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  const handleShowComparison = () => {
    if (selectedForComparison.size < 2) {
      alert("Please select at least 2 vendors to compare");
      return;
    }
    setShowComparison(true);
  };

  const getSelectedVendors = () => {
    return vendors.filter((v) => selectedForComparison.has(v._id));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentFilters({ ...currentFilters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vendor Directory
            </h1>
            <p className="text-gray-600 mt-1">
              Discover and connect with top-rated vendors for your events
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedForComparison.size > 0 && (
              <button
                onClick={handleShowComparison}
                className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <GitCompare className="w-5 h-5" />
                Compare ({selectedForComparison.size})
              </button>
            )}
            <Link
              href="/planner/dashboard/vendors/favorites"
              className="flex items-center gap-2 px-4 py-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Heart className="w-5 h-5" />
              My Favorites ({favorites.size})
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6">
        <VendorSearch onSearch={handleSearch} categories={categories} />
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {vendors.length} of {pagination.total} vendors
          </p>
        </div>
      )}

      {/* Vendor Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vendors found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more vendors
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                isFavorite={favorites.has(vendor._id)}
                onToggleFavorite={handleToggleFavorite}
                onBook={handleBook}
                isSelected={selectedForComparison.has(vendor._id)}
                onToggleSelect={handleToggleCompareSelection}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === page
                            ? "bg-teal-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <VendorComparison
          vendors={getSelectedVendors()}
          onClose={() => setShowComparison(false)}
          onBook={(vendor) => {
            setShowComparison(false);
            handleBook(vendor);
          }}
        />
      )}

      {/* Booking Form Modal */}
      {vendorToBook && (
        <VendorBookingForm
          vendor={vendorToBook}
          onSubmit={handleBookingSubmit}
          onCancel={() => setVendorToBook(null)}
        />
      )}
    </div>
  );
}
