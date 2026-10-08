"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import supportTicketsService from "@/services/admin/support-tickets.service";
import {
  SupportTicket,
  TicketAnalytics,
  CannedResponse,
} from "@/types/support-ticket";
import {
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Send,
  Eye,
  UserPlus,
  Tag,
  ArrowUp,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<
    "tickets" | "canned" | "analytics"
  >("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null);

  const [cannedFormData, setCannedFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filterStatus, filterPriority, filterCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "tickets") {
        const [ticketsData, analyticsData] = await Promise.all([
          supportTicketsService.getTickets({
            status: (filterStatus as any) || undefined,
            priority: (filterPriority as any) || undefined,
            category: (filterCategory as any) || undefined,
            search: searchQuery || undefined,
          }),
          supportTicketsService.getTicketStatistics(),
        ]);
        setTickets(ticketsData.tickets || []);
        setAnalytics(analyticsData.statistics);
      } else if (activeTab === "canned") {
        const responsesData = await supportTicketsService.getCannedResponses();
        setCannedResponses(responsesData.responses || []);
      } else if (activeTab === "analytics") {
        const analyticsData = await supportTicketsService.getTicketStatistics();
        setAnalytics(analyticsData.statistics);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      const response = await supportTicketsService.getTicketById(ticket._id);
      setSelectedTicket(response.ticket);
      setShowTicketModal(true);
    } catch (error: any) {
      toast.error("Failed to load ticket details");
    }
  };

  const handleAssignTicket = async (ticketId: string, adminId: string) => {
    try {
      const response = await supportTicketsService.assignTicket(
        ticketId,
        adminId
      );
      toast.success(response.message || "Ticket assigned successfully");
      loadData();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(response.ticket);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign ticket");
    }
  };

  const handleRespondToTicket = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    try {
      const response = await supportTicketsService.respondToTicket(
        selectedTicket._id,
        responseMessage,
        isInternalNote
      );
      toast.success("Response sent successfully");
      setResponseMessage("");
      setIsInternalNote(false);
      setSelectedTicket(response.ticket);
      setShowResponseModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send response");
    }
  };

  const handleCloseTicket = async (ticketId: string, resolution: string) => {
    try {
      const response = await supportTicketsService.closeTicket(
        ticketId,
        resolution
      );
      toast.success(response.message || "Ticket closed successfully");
      setShowTicketModal(false);
      setSelectedTicket(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to close ticket");
    }
  };

  const handleEscalateTicket = async (
    ticketId: string,
    reason: string,
    newPriority: any
  ) => {
    try {
      const response = await supportTicketsService.escalateTicket(
        ticketId,
        reason,
        newPriority
      );
      toast.success(response.message || "Ticket escalated successfully");
      loadData();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(response.ticket);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to escalate ticket");
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: any) => {
    try {
      const response = await supportTicketsService.updateTicketStatus(
        ticketId,
        status
      );
      toast.success(response.message || "Status updated successfully");
      loadData();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(response.ticket);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleUpdatePriority = async (ticketId: string, priority: any) => {
    try {
      const response = await supportTicketsService.updateTicketPriority(
        ticketId,
        priority
      );
      toast.success(response.message || "Priority updated successfully");
      loadData();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(response.ticket);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update priority");
    }
  };

  const handleCreateCannedResponse = async () => {
    try {
      const response = await supportTicketsService.createCannedResponse({
        ...cannedFormData,
        category: cannedFormData.category as any,
      });
      toast.success(response.message || "Canned response created");
      setShowCannedModal(false);
      setCannedFormData({ title: "", content: "", category: "", tags: [] });
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create canned response"
      );
    }
  };

  const handleDeleteCannedResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this canned response?"))
      return;
    try {
      const response = await supportTicketsService.deleteCannedResponse(
        responseId
      );
      toast.success(response.message || "Canned response deleted");
      loadData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete canned response"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Support System</h1>
        <p className="text-gray-600 mt-2">
          Manage support tickets and customer inquiries
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "tickets", label: "Tickets", icon: MessageSquare },
            { id: "canned", label: "Canned Responses", icon: FileText },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Statistics */}
      {activeTab === "tickets" && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Tickets</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalTickets || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.openTickets || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">
              {analytics.inProgressTickets || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics.resolvedTickets || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold text-purple-600">
              {analytics.averageResponseTime || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                        {(ticket as any).isPriority && (
                          <span
                            className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded"
                            title={(ticket as any).prioritySource ? `Priority support: ${(ticket as any).prioritySource}` : "Priority support"}
                          >
                            Priority support
                          </span>
                        )}
                        {ticket.category && (
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                            {ticket.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        #{ticket.ticketNumber} - {ticket.subject}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ticket.user?.name || ticket.user?.email || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.assignedTo && (
                          <span className="flex items-center gap-1">
                            <UserPlus className="w-4 h-4" />
                            Assigned to {ticket.assignedTo.name}
                          </span>
                        )}
                        {ticket.messages && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {ticket.messages.length} messages
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTicket(ticket);
                      }}
                      className="ml-4 p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Canned Responses Tab */}
      {activeTab === "canned" && (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCannedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              New Canned Response
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading responses...</p>
            </div>
          ) : cannedResponses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No canned responses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cannedResponses.map((response) => (
                <div
                  key={response._id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {response.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteCannedResponse(response._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {response.content}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    {response.category && (
                      <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                        {response.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Used {response.usageCount || 0} times
                    </span>
                  </div>
                  {response.tags && response.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {response.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resolution Rate</h3>
              <div className="text-4xl font-bold text-green-600">
                {analytics.totalTickets > 0
                  ? Math.round(
                      (analytics.resolvedTickets / analytics.totalTickets) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analytics.resolvedTickets || 0} of{" "}
                {analytics.totalTickets || 0} resolved
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Avg Response Time</h3>
              <div className="text-4xl font-bold text-blue-600">
                {analytics.averageResponseTime || "N/A"}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Time to first response
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Customer Satisfaction
              </h3>
              <div className="text-4xl font-bold text-purple-600">
                {analytics.averageSatisfactionRating || "N/A"}
              </div>
              <p className="text-sm text-gray-600 mt-2">Average rating</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tickets by Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Open</span>
                  <span>{analytics.openTickets || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        ((analytics.openTickets || 0) /
                          (analytics.totalTickets || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>In Progress</span>
                  <span>{analytics.inProgressTickets || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${
                        ((analytics.inProgressTickets || 0) /
                          (analytics.totalTickets || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resolved</span>
                  <span>{analytics.resolvedTickets || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        ((analytics.resolvedTickets || 0) /
                          (analytics.totalTickets || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ticket #{selectedTicket.ticketNumber}
                </h2>
                <p className="text-gray-600">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedTicket._id, e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) =>
                      handleUpdatePriority(selectedTicket._id, e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Ticket Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <p className="font-medium">
                      {selectedTicket.user?.name || selectedTicket.user?.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <p className="font-medium">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium">
                      {new Date(selectedTicket.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Messages */}
              {selectedTicket.messages &&
                selectedTicket.messages.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Conversation</h3>
                    <div className="space-y-4">
                      {selectedTicket.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            message.isInternal
                              ? "bg-yellow-50 border border-yellow-200"
                              : message.sender?.role === "admin"
                              ? "bg-purple-50"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {message.sender?.name || "Unknown"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                          {message.isInternal && (
                            <span className="text-xs text-yellow-700 mt-2 inline-block">
                              Internal Note
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowResponseModal(true)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Respond
                </button>
                {selectedTicket.status !== "closed" && (
                  <button
                    onClick={() => {
                      const resolution = prompt("Enter resolution notes:");
                      if (resolution) {
                        handleCloseTicket(selectedTicket._id, resolution);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Close Ticket
                  </button>
                )}
                <button
                  onClick={() => {
                    const reason = prompt("Enter escalation reason:");
                    if (reason) {
                      handleEscalateTicket(
                        selectedTicket._id,
                        reason,
                        "urgent"
                      );
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <ArrowUp className="w-4 h-4 inline mr-2" />
                  Escalate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Respond to Ticket
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Type your response..."
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Internal note (not visible to customer)
                  </span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRespondToTicket}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send Response
                </button>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseMessage("");
                    setIsInternalNote(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canned Response Modal */}
      {showCannedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                New Canned Response
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={cannedFormData.title}
                  onChange={(e) =>
                    setCannedFormData({
                      ...cannedFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Response title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  rows={6}
                  value={cannedFormData.content}
                  onChange={(e) =>
                    setCannedFormData({
                      ...cannedFormData,
                      content: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Response content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={cannedFormData.category}
                  onChange={(e) =>
                    setCannedFormData({
                      ...cannedFormData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Technical, Billing"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateCannedResponse}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Response
                </button>
                <button
                  onClick={() => {
                    setShowCannedModal(false);
                    setCannedFormData({
                      title: "",
                      content: "",
                      category: "",
                      tags: [],
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
