"use client";

import { Vendor } from "@/types/planner";
import { X, Star, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";

interface VendorComparisonProps {
  vendors: Vendor[];
  onClose: () => void;
  onBook: (vendor: Vendor) => void;
}

export default function VendorComparison({
  vendors,
  onClose,
  onBook,
}: VendorComparisonProps) {
  if (vendors.length === 0) return null;

  const comparisonRows = [
    {
      label: "Business Name",
      getValue: (v: Vendor) => v.businessName,
      icon: null,
    },
    {
      label: "Category",
      getValue: (v: Vendor) => v.category,
      icon: null,
    },
    {
      label: "Rating",
      getValue: (v: Vendor) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium">{v.rating.toFixed(1)}</span>
          <span className="text-gray-500 text-sm">({v.reviewCount})</span>
        </div>
      ),
      icon: Star,
    },
    {
      label: "Starting Price",
      getValue: (v: Vendor) => (
        <div>
          <p className="font-semibold">
            {v.pricing.currency} {v.pricing.startingPrice.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">{v.pricing.priceRange}</p>
        </div>
      ),
      icon: DollarSign,
    },
    {
      label: "Location",
      getValue: (v: Vendor) => `${v.location.city}, ${v.location.state}`,
      icon: MapPin,
    },
    {
      label: "Response Time",
      getValue: (v: Vendor) => v.responseTime,
      icon: Clock,
    },
    {
      label: "Availability",
      getValue: (v: Vendor) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            v.availability === "Available"
              ? "bg-green-100 text-green-800"
              : v.availability === "Limited"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {v.availability}
        </span>
      ),
      icon: CheckCircle,
    },
    {
      label: "Services",
      getValue: (v: Vendor) => (
        <div className="flex flex-wrap gap-1">
          {v.services.slice(0, 3).map((service, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              {service}
            </span>
          ))}
          {v.services.length > 3 && (
            <span className="text-xs text-gray-500">
              +{v.services.length - 3} more
            </span>
          )}
        </div>
      ),
      icon: null,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">
            Compare Vendors ({vendors.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-gray-50 border-b-2 border-gray-200 font-semibold text-gray-700 sticky left-0 z-10">
                  Feature
                </th>
                {vendors.map((vendor) => (
                  <th
                    key={vendor._id}
                    className="p-4 bg-gray-50 border-b-2 border-gray-200 min-w-[250px]"
                  >
                    <div className="text-center">
                      {vendor.portfolio.length > 0 && (
                        <img
                          src={vendor.portfolio[0].url}
                          alt={vendor.businessName}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <p className="font-semibold text-gray-900">
                        {vendor.businessName}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-4 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      {row.icon && (
                        <row.icon className="w-4 h-4 text-gray-400" />
                      )}
                      {row.label}
                    </div>
                  </td>
                  {vendors.map((vendor) => (
                    <td key={vendor._id} className="p-4 text-center">
                      {typeof row.getValue(vendor) === "string" ? (
                        <span className="text-gray-900">
                          {row.getValue(vendor)}
                        </span>
                      ) : (
                        row.getValue(vendor)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Action Row */}
              <tr>
                <td className="p-4 bg-gray-50 sticky left-0 z-10"></td>
                {vendors.map((vendor) => (
                  <td key={vendor._id} className="p-4">
                    <button
                      onClick={() => onBook(vendor)}
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Book This Vendor
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Compare features side-by-side to make the best decision for your
            event
          </p>
        </div>
      </div>
    </div>
  );
}
