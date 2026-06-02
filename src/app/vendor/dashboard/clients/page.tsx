"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Tag,
  Bell,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { clientsService, Client } from "@/services/clients.service";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:9601/api/v1"
          }/subscriptions/current`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setUserSubscription(data.data?.subscription || data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Check if user has Business+ tier
  const userPlan = userSubscription?.planName?.toLowerCase() || "";
  const hasAccess = userPlan === "business" || userPlan === "enterprise";

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await clientsService.getClients({
          search: searchQuery || undefined,
          tag: selectedTag || undefined,
        });

        // Map backend response to frontend format
        const mappedClients = response.clients.map((client) => ({
          ...client,
          id: client._id,
          lastContact: new Date(client.updatedAt),
          nextFollowUp: client.nextFollowUp
            ? new Date(client.nextFollowUp)
            : undefined,
          createdAt: new Date(client.createdAt),
        }));

        setClients(mappedClients);
      } catch (error: any) {
        console.error("Error fetching clients:", error);
        toast.error(error.response?.data?.message || "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [hasAccess, searchQuery, selectedTag]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(clients.flatMap((client) => client.tags || []))
  ).sort();

  // Clients are already filtered by the API, so just use them directly
  const filteredClients = clients;

  // Calculate stats
  const stats = {
    totalClients: clients.length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    avgSpent:
      clients.length > 0
        ? clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0) /
          clients.length
        : 0,
    upcomingFollowUps: clients.filter((c) => c.nextFollowUp).length,
  };

  if (!hasAccess) {
    return (
      <div className="max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to Business
          </h2>
          <p className="text-gray-600 mb-6">
            CRM system is available for Business tier and above. Manage your
            client relationships and track interactions effectively.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl">
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
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Client Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your client relationships</p>
        </div>
        <Link
          href="/vendor/dashboard/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalClients}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ₦{stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Avg. Spent</p>
          <p className="text-2xl font-bold text-purple-600">
            ₦{Math.round(stats.avgSpent).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Follow-ups</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.upcomingFollowUps}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Tag Filter Pills */}
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedTag
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Tags
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTag === tag
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedTag
              ? "Try adjusting your filters"
              : "Add your first client to get started"}
          </p>
          {!searchQuery && !selectedTag && (
            <Link
              href="/vendor/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Client</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/vendor/dashboard/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Client Header with Avatar */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate mb-1">
                    {client.name.length > 15
                      ? client.name.substring(0, 15) + "..."
                      : client.name}
                  </h3>
                  {client.company && (
                    <p className="text-sm text-gray-500 truncate">
                      {client.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {client.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₦{(client.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Events</p>
                  <p className="text-lg font-bold text-gray-900">
                    {client.eventsCount || 0}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              </div>

              {/* Follow-up Reminder */}
              {client.nextFollowUp && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Bell className="w-4 h-4" />
                    <span>
                      Follow-up:{" "}
                      {new Date(client.nextFollowUp).toLocaleDateString(
                        "en-US",
                        { month: "2-digit", day: "2-digit", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
