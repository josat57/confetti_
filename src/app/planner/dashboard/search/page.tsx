"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FunnelIcon,
  BookmarkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import SearchInput from "@/components/planner/search/SearchInput";
import SearchResults from "@/components/planner/search/SearchResults";
import searchService, {
  SearchFilters,
  SavedSearch,
} from "@/services/planner/search.service";

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState({
    events: 0,
    clients: 0,
    vendors: 0,
    tasks: 0,
    documents: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const searches = await searchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      console.error("Failed to load saved searches:", error);
    }
  };

  const performSearch = async (searchQuery: string, newPage: number = 1) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setQuery(searchQuery);

      const response = await searchService.search(
        searchQuery,
        selectedCategory !== "all"
          ? { category: selectedCategory, ...filters }
          : filters,
        newPage
      );

      if (newPage === 1) {
        setResults(response.results);
      } else {
        setResults([...results, ...response.results]);
      }

      setCategories(response.categories);
      setPage(newPage);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    performSearch(query, 1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setPage(1);
    performSearch(query, 1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    performSearch(query, 1);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast.error("Please enter a name for this search");
      return;
    }

    try {
      await searchService.saveSearch(searchName, query, filters);
      toast.success("Search saved successfully");
      setShowSaveModal(false);
      setSearchName("");
      loadSavedSearches();
    } catch (error) {
      console.error("Failed to save search:", error);
      toast.error("Failed to save search");
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    performSearch(savedSearch.query, 1);
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      await searchService.deleteSavedSearch(id);
      toast.success("Saved search deleted");
      loadSavedSearches();
    } catch (error) {
      console.error("Failed to delete saved search:", error);
      toast.error("Failed to delete saved search");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      performSearch(query, page + 1);
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search across events, clients, vendors, tasks, and documents
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg shadow p-6">
        <SearchInput
          onSearch={(q) => performSearch(q, 1)}
          autoFocus={!initialQuery}
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
              showFilters || hasActiveFilters
                ? "border-teal-600 text-teal-600 bg-teal-50"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-teal-600 text-white rounded-full text-xs">
                {Object.values(filters).filter((v) => v).length}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          )}
        </div>
        {query && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Save Search
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Advanced Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Saved Searches
          </h3>
          <div className="space-y-2">
            {savedSearches.map((savedSearch) => (
              <div
                key={savedSearch.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <button
                  onClick={() => handleLoadSavedSearch(savedSearch)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {savedSearch.name}
                  </p>
                  <p className="text-xs text-gray-500">{savedSearch.query}</p>
                </button>
                <button
                  onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                  className="ml-3 text-gray-400 hover:text-red-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="bg-white rounded-lg shadow p-6">
          <SearchResults
            results={results}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            loading={loading}
          />

          {/* Load More */}
          {hasMore && !loading && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save Search
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g., Upcoming Events"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Query:</span> {query}
                </p>
                {hasActiveFilters && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Filters:</span>{" "}
                    {Object.entries(filters)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSearchName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
