"use client";

import { useState } from "react";
import { Plus, Search, Filter, X } from "lucide-react";
import ClientCard from "@/components/planner/clients/ClientCard";
import ClientForm from "@/components/planner/clients/ClientForm";
import { CreateClientInput, UpdateClientInput } from "@/types/planner";
import {
  usePlannerClients,
  useCreatePlannerClient,
  useUpdatePlannerClient,
  useDeletePlannerClient,
} from "@/hooks/usePlannerClients";
import { toast } from "react-toastify";

type StatusFilter = "Active" | "Inactive" | "";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const filters: Record<string, string> = {};
  if (searchQuery) filters.search = searchQuery;
  if (statusFilter) filters.status = statusFilter;

  const { data, isLoading } = usePlannerClients(filters);
  const createClient = useCreatePlannerClient();
  const updateClient = useUpdatePlannerClient();
  const deleteClient = useDeletePlannerClient();

  const clients = data?.clients || [];

  const handleFormSubmit = async (formData: CreateClientInput | UpdateClientInput) => {
    try {
      if (selectedClient) {
        await updateClient.mutateAsync({ id: selectedClient._id, data: formData as UpdateClientInput });
        toast.success("Client updated");
      } else {
        await createClient.mutateAsync(formData as CreateClientInput);
        toast.success("Client added");
      }
      setShowClientForm(false);
      setSelectedClient(null);
    } catch {
      toast.error("Failed to save client");
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient.mutateAsync(clientId);
      toast.success("Client deleted");
    } catch {
      toast.error("Failed to delete client");
    }
  };

  const inputCls = "w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none text-sm";
  const selectCls = "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none text-sm";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your client relationships and track event history
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={selectCls}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => { setSelectedClient(null); setShowClientForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Client Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No clients yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start building your client base by adding your first client
            </p>
            <button
              onClick={() => { setSelectedClient(null); setShowClientForm(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={(c) => { setSelectedClient(c); setShowClientForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Client Form Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg max-w-4xl w-full my-8">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button
                onClick={() => { setShowClientForm(false); setSelectedClient(null); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ClientForm
                initialData={selectedClient || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowClientForm(false); setSelectedClient(null); }}
                isEdit={!!selectedClient}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
