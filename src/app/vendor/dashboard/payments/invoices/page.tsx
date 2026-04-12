"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  Eye,
  Edit,
  Copy,
  Trash2,
  DollarSign,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { invoicesService } from "@/services/invoices.service";
import type { Invoice, InvoiceStats } from "@/types/invoice.types";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Invoice["status"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [filter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesData, statsData] = await Promise.all([
        invoicesService.getAll({
          status: filter !== "all" ? filter : undefined,
          search: searchQuery || undefined,
          page,
          limit: 10,
        }),
        invoicesService.getStats(),
      ]);

      setInvoices(invoicesData.invoices);
      setTotalPages(invoicesData.totalPages);
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading invoices:", error);
      toast.error(error.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadData();
  };

  const handleSend = async (id: string) => {
    try {
      await invoicesService.send(id);
      toast.success("Invoice sent successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invoice");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await invoicesService.markAsPaid(id);
      toast.success("Invoice marked as paid");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark as paid");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newInvoice = await invoicesService.duplicate(id);
      toast.success("Invoice duplicated successfully");
      window.location.href = `/vendor/dashboard/payments/invoices/${newInvoice._id}`;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to duplicate invoice"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      await invoicesService.delete(id);
      toast.success("Invoice deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  const handleDownloadPDF = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesService.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded");
    } catch (error: any) {
      toast.error("Failed to download invoice");
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const blob = await invoicesService.export(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Invoices exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error("Failed to export invoices");
    }
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-purple-100 text-purple-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status !== "paid" &&
      invoice.status !== "cancelled" &&
      new Date(invoice.dueDate) < new Date()
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 mt-1">Create and manage your invoices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
              <button
                onClick={() => handleExport("csv")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
              >
                PDF
              </button>
            </div>
          </div>
          <Link
            href="/vendor/dashboard/payments/invoices/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.totalOutstanding)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Search
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === "all"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({stats?.total || 0})
        </button>
        {[
          { key: "draft", label: "Draft", count: stats?.draft },
          { key: "sent", label: "Sent", count: stats?.sent },
          { key: "paid", label: "Paid", count: stats?.paid },
          { key: "overdue", label: "Overdue", count: stats?.overdue },
        ].map((status) => (
          <button
            key={status.key}
            onClick={() => {
              setFilter(status.key as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === status.key
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label} ({status.count || 0})
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter !== "all"
                ? "Try adjusting your filters"
                : "Create your first invoice to get started"}
            </p>
            <Link
              href="/vendor/dashboard/payments/invoices/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Create First Invoice
            </Link>
          </div>
        ) : (
          <>
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status.replace("_", " ").toUpperCase()}
                      </span>
                      {isOverdue(invoice) && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{invoice.client.name}</p>
                    <p className="text-sm text-gray-500">
                      {invoice.client.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </p>
                    {invoice.amountDue > 0 && (
                      <p className="text-sm text-orange-600">
                        Due:{" "}
                        {formatCurrency(invoice.amountDue, invoice.currency)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Issue Date</p>
                    <p className="font-medium">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-medium">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium">{invoice.items.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount Paid</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/vendor/dashboard/payments/invoices/${invoice._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>

                  {invoice.status === "draft" && (
                    <>
                      <Link
                        href={`/vendor/dashboard/payments/invoices/${invoice._id}/edit`}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleSend(invoice._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </>
                  )}

                  {(invoice.status === "sent" ||
                    invoice.status === "viewed" ||
                    invoice.status === "overdue") && (
                    <button
                      onClick={() => handleMarkAsPaid(invoice._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Mark Paid
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleDownloadPDF(invoice._id, invoice.invoiceNumber)
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>

                  <button
                    onClick={() => handleDuplicate(invoice._id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>

                  {invoice.status === "draft" && (
                    <button
                      onClick={() => handleDelete(invoice._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
