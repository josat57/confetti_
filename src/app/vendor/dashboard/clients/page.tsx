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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tags: string[];
  totalSpent: number;
  eventsCount: number;
  lastContact: Date;
  nextFollowUp?: Date;
  notes: Array<{
    id: string;
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
}

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
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:9600/api/v1"
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
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockClients: Client[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            phone: "+234 800 123 4567",
            company: "Johnson Events",
            tags: ["VIP", "Wedding"],
            totalSpent: 500000,
            eventsCount: 2,
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
            notes: [
              {
                id: "1",
                text: "Interested in premium package for next event",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              },
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
          },
          {
            id: "2",
            name: "Michael Brown",
            email: "m.brown@company.com",
            phone: "+234 800 234 5678",
            company: "Tech Corp",
            tags: ["Corporate", "Recurring"],
            totalSpent: 800000,
            eventsCount: 4,
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
            notes: [],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
          },
          {
            id: "3",
            name: "Emma Davis",
            email: "emma.davis@email.com",
            phone: "+234 800 345 6789",
            tags: ["Birthday", "Referral"],
            totalSpent: 150000,
            eventsCount: 1,
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            nextFollowUp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            notes: [
              {
                id: "1",
                text: "Referred by Sarah Johnson",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
              },
            ],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
          },
        ];

        setClients(mockClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(clients.flatMap((client) => client.tags))
  ).sort();

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = !selectedTag || client.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  // Calculate stats
  const stats = {
    totalClients: clients.length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    avgSpent:
      clients.length > 0
        ? clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
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
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Client Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {client.name}
                  </h3>
                  {client.company && (
                    <p className="text-sm text-gray-600 truncate">
                      {client.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Spent</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₦{client.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Events</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client.eventsCount}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              </div>

              {/* Follow-up Reminder */}
              {client.nextFollowUp && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Bell className="w-4 h-4" />
                    <span>
                      Follow-up: {client.nextFollowUp.toLocaleDateString()}
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
