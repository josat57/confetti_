"use client";

import { Vendor } from "@/types/planner";
import { MapPin, Star, Heart, ExternalLink, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface VendorCardProps {
  vendor: Vendor;
  isFavorite?: boolean;
  onToggleFavorite?: (vendorId: string) => void;
  onBook?: (vendor: Vendor) => void;
  isSelected?: boolean;
  onToggleSelect?: (vendorId: string) => void;
}

export default function VendorCard({
  vendor,
  isFavorite = false,
  onToggleFavorite,
  onBook,
  isSelected = false,
  onToggleSelect,
}: VendorCardProps) {
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onToggleFavorite) return;

    setFavoriteLoading(true);
    try {
      await onToggleFavorite(vendor._id);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBook) {
      onBook(vendor);
    }
  };

  const availabilityColors = {
    Available: "bg-green-100 text-green-800",
    Limited: "bg-yellow-100 text-yellow-800",
    Booked: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {vendor.portfolio.length > 0 ? (
          <img
            src={vendor.portfolio[0].url}
            alt={vendor.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <DollarSign className="w-16 h-16" />
          </div>
        )}
        {vendor.featured && (
          <div className="absolute top-2 left-2 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {onToggleSelect && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSelect(vendor._id);
              }}
              className={`p-2 rounded-lg shadow-md transition-colors ${
                isSelected
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-5 h-5 pointer-events-none"
              />
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <Link
            href={`/planner/dashboard/vendors/${vendor._id}`}
            className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors line-clamp-1"
          >
            {vendor.businessName}
          </Link>
          <p className="text-sm text-gray-600 mt-1">{vendor.category}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-900">
              {vendor.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({vendor.reviewCount} reviews)
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {vendor.location.city}, {vendor.location.state}
          </span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-sm text-gray-600">Starting from</p>
          <p className="text-lg font-bold text-gray-900">
            {vendor.pricing.currency}{" "}
            {vendor.pricing.startingPrice.toLocaleString()}
          </p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-1">
            {vendor.pricing.priceRange}
          </span>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              availabilityColors[vendor.availability]
            }`}
          >
            {vendor.availability}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/planner/dashboard/vendors/${vendor._id}`}
            className="flex-1 px-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors text-center"
          >
            View Profile
          </Link>
          {onBook && (
            <button
              onClick={handleBook}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Book
            </button>
          )}
        </div>

        {/* Response Time */}
        {vendor.responseTime && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            Response time: {vendor.responseTime}
          </p>
        )}
      </div>
    </div>
  );
}
