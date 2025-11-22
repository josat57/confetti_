"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import VendorCard from "@/components/planner/vendors/VendorCard";
import { vendorsService } from "@/services/planner/vendors.service";
import { Vendor } from "@/types/planner";
import Link from "next/link";

export default function FavoritesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await vendorsService.getFavorites();
      setVendors(response.vendors);
      const favoriteIds = new Set(response.vendors.map((v) => v._id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (vendorId: string) => {
    try {
      await vendorsService.removeFromFavorites(vendorId);
      setVendors(vendors.filter((v) => v._id !== vendorId));
      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(vendorId);
        return newSet;
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites");
    }
  };

  const handleBook = (vendor: Vendor) => {
    // Navigate to booking form or open modal
    console.log("Book vendor:", vendor);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/planner/dashboard/vendors"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendor Directory
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-teal-600 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Favorite Vendors
            </h1>
            <p className="text-gray-600 mt-1">
              {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}{" "}
              saved
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding vendors to your favorites to quickly access them
              later
            </p>
            <Link
              href="/planner/dashboard/vendors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor._id}
              vendor={vendor}
              isFavorite={favorites.has(vendor._id)}
              onToggleFavorite={handleToggleFavorite}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
