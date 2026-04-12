"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "../../../contexts/AdminContext";
import {
  Store,
  Search,
  Filter,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
} from "lucide-react";

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  status: "pending" | "verified" | "rejected" | "suspended";
  rating: number;
  totalEvents: number;
  joinedDate: string;
  verificationDate?: string;
  description: string;
  services: string[];
}

export default function VendorManagement() {
  const {
    getVendors,
    verifyVendor,
    updateVendorStatus,
    deleteVendor,
    loading,
  } = useAdmin();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Map backend vendor data to frontend format
  const mapVendorData = (backendVendor: any): Vendor => {
    const statusMap: Record<
      string,
      "pending" | "verified" | "rejected" | "suspended"
    > = {
      pending: "pending",
      approved: "verified",
      rejected: "rejected",
      suspended: "suspended",
    };

    return {
      id: backendVendor._id,
      businessName: backendVendor.businessName || backendVendor.name,
      ownerName: backendVendor.owner
        ? `${backendVendor.owner.firstName} ${backendVendor.owner.lastName}`
        : "N/A",
      email: backendVendor.email,
      phone: backendVendor.phone,
      category:
        backendVendor.category?.replace(/_/g, " ") ||
        backendVendor.businessType,
      location: backendVendor.address
        ? `${backendVendor.address.city}, ${backendVendor.address.state}`
        : "N/A",
      status: statusMap[backendVendor.status] || "pending",
      rating: backendVendor.rating || 0,
      totalEvents: backendVendor.stats?.totalBookings || 0,
      joinedDate: backendVendor.createdAt,
      verificationDate: backendVendor.isVerified
        ? backendVendor.updatedAt
        : undefined,
      description: backendVendor.description || "",
      services: backendVendor.features || backendVendor.services || [],
    };
  };

  // Fetch vendors from admin API
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await getVendors();
        // Handle different response structures
        const vendorsData = response?.data?.vendors || response?.data || [];
        const mappedVendors = Array.isArray(vendorsData)
          ? vendorsData.map(mapVendorData)
          : [];
        setVendors(mappedVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        // Fallback to mock data if API fails
        const mockVendors: Vendor[] = [
          {
            id: "1",
            businessName: "EventPro Services",
            ownerName: "Jane Smith",
            email: "jane@eventpro.com",
            phone: "+1234567890",
            category: "Event Planning",
            location: "New York, NY",
            status: "verified",
            rating: 4.8,
            totalEvents: 45,
            joinedDate: "2024-01-10",
            verificationDate: "2024-01-15",
            description:
              "Professional event planning services for all occasions",
            services: [
              "Wedding Planning",
              "Corporate Events",
              "Birthday Parties",
            ],
          },
          {
            id: "2",
            businessName: "Catering Delights",
            ownerName: "Mike Johnson",
            email: "mike@cateringdelights.com",
            phone: "+1234567891",
            category: "Catering",
            location: "Los Angeles, CA",
            status: "pending",
            rating: 0,
            totalEvents: 0,
            joinedDate: "2024-01-20",
            description: "Gourmet catering services for special events",
            services: [
              "Wedding Catering",
              "Corporate Catering",
              "Private Parties",
            ],
          },
          {
            id: "3",
            businessName: "Photography Studio",
            ownerName: "Sarah Wilson",
            email: "sarah@photostudio.com",
            phone: "+1234567892",
            category: "Photography",
            location: "Chicago, IL",
            status: "verified",
            rating: 4.9,
            totalEvents: 78,
            joinedDate: "2024-01-05",
            verificationDate: "2024-01-08",
            description: "Professional photography for events and portraits",
            services: [
              "Event Photography",
              "Portrait Photography",
              "Wedding Photography",
            ],
          },
          {
            id: "4",
            businessName: "Music & Entertainment",
            ownerName: "David Brown",
            email: "david@musicent.com",
            phone: "+1234567893",
            category: "Entertainment",
            location: "Miami, FL",
            status: "rejected",
            rating: 0,
            totalEvents: 0,
            joinedDate: "2024-01-15",
            description: "Live music and entertainment services",
            services: ["Live Bands", "DJ Services", "Karaoke"],
          },
        ];
        setVendors(mockVendors);
      }
    };

    fetchVendors();
  }, [getVendors]);

  const filteredVendors = useMemo(() => {
    if (!vendors || !Array.isArray(vendors)) {
      return [];
    }

    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.businessName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        vendor.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || vendor.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || vendor.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vendors, searchQuery, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "suspended":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status === "verified"
      ? "Approved"
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCategory = (category: string) => {
    return category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleVendorAction = async (vendorId: string, action: string) => {
    try {
      if (action === "verify") {
        await verifyVendor(vendorId, { verified: true });
      } else if (action === "reject") {
        await updateVendorStatus(vendorId, "rejected");
      } else if (action === "suspend") {
        await updateVendorStatus(vendorId, "suspended");
      } else if (action === "delete") {
        await deleteVendor(vendorId);
      }

      // Refresh vendors list
      const response = await getVendors();
      const vendorsData = response?.data?.vendors || response?.data || [];
      const mappedVendors = Array.isArray(vendorsData)
        ? vendorsData.map(mapVendorData)
        : [];
      setVendors(mappedVendors);
    } catch (error) {
      console.error(`Error performing ${action} on vendor:`, error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Vendor Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage vendor accounts, verification, and performance
            </p>
          </div>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
            Add New Vendor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Total Vendors
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {vendors.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Pending Verification
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {(vendors || []).filter((v) => v.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Approved Vendors
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {(vendors || []).filter((v) => v.status === "verified").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-100 text-red-600 flex-shrink-0">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Rejected/Suspended
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {
                  (vendors || []).filter(
                    (v) => v.status === "rejected" || v.status === "suspended"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Approved/Verified</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            <option value="all">All Categories</option>
            <option value="event planning">Event Planning</option>
            <option value="catering">Catering</option>
            <option value="photography">Photography</option>
            <option value="venue">Venue</option>
            <option value="entertainment">Entertainment</option>
            <option value="decoration">Decoration</option>
            <option value="other">Other</option>
          </select>

          <button className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Vendors ({filteredVendors.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Loading vendors...
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          {vendor.businessName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {formatCategory(vendor.category)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        vendor.status
                      )} self-start flex-shrink-0`}
                    >
                      {getStatusIcon(vendor.status)}
                      <span className="ml-1">
                        {getStatusLabel(vendor.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>{vendor.location}</span>
                    </div>

                    {vendor.status === "verified" && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                        <div className="flex items-center">
                          {renderStars(vendor.rating)}
                          <span className="ml-1 text-gray-600">
                            ({vendor.rating})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-gray-400" />
                          <span className="text-gray-600">
                            {vendor.totalEvents} events
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>
                        Joined{" "}
                        {new Date(vendor.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowVendorModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVendorAction(vendor.id, "edit")}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit vendor"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>

                      {vendor.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleVendorAction(vendor.id, "verify")
                            }
                            className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium px-2 py-1"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              handleVendorAction(vendor.id, "reject")
                            }
                            className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-2 sm:mt-3">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Vendor Details
                </h3>
                <button
                  onClick={() => setShowVendorModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                      {selectedVendor.businessName}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {formatCategory(selectedVendor.category)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                      {selectedVendor.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {selectedVendor.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {selectedVendor.location}
                    </span>
                  </div>
                </div>

                {selectedVendor.services.length > 0 && (
                  <div>
                    <h5 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      Services
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVendor.description && (
                  <div>
                    <h5 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                      Description
                    </h5>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {selectedVendor.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedVendor.status
                    )}`}
                  >
                    {getStatusLabel(selectedVendor.status)}
                  </span>
                  {selectedVendor.status === "verified" && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {renderStars(selectedVendor.rating)}
                      <span className="ml-1">{selectedVendor.rating}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
