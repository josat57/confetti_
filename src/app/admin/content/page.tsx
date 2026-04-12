"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  DocumentIcon,
  NewspaperIcon,
  StarIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import contentManagementService, {
  ContentItem,
  ContentStats,
  ContentCategory,
} from "@/services/admin/content-management.service";
import ContentForm from "@/components/admin/content/ContentForm";
import CategoryManager from "@/components/admin/content/CategoryManager";

const contentTypeIcons = {
  announcement: MegaphoneIcon,
  blog_post: NewspaperIcon,
  help_article: QuestionMarkCircleIcon,
  policy: DocumentIcon,
  faq: DocumentTextIcon,
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-yellow-100 text-yellow-800",
};

export default function ContentManagementPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(
    null
  );

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    category: "",
    search: "",
    featured: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadContent();
    loadStats();
    loadCategories();
  }, [currentPage, filters]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.type && { type: filters.type as ContentItem["type"] }),
        ...(filters.status && {
          status: filters.status as ContentItem["status"],
        }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.featured && { featured: filters.featured === "true" }),
      };

      const response = await contentManagementService.getContent(params);
      setContent(response.content);
      setTotal(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error("Failed to load content:", error);
      // Provide empty data when API is not available
      setContent([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await contentManagementService.getContentStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
      // Provide fallback stats when API is not available
      setStats({
        totalContent: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        byType: {
          announcement: 0,
          blog_post: 0,
          help_article: 0,
          policy: 0,
          faq: 0,
        },
        totalViews: 0,
        totalLikes: 0,
        recentActivity: [],
      });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await contentManagementService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Provide empty categories when API is not available
      setCategories([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        await contentManagementService.deleteContent(id);
        loadContent();
        loadStats();
      } catch (error) {
        console.error("Failed to delete content:", error);
        alert("Failed to delete content. Please try again.");
      }
    }
  };

  const handleBulkAction = async (action: "publish" | "archive" | "delete") => {
    if (selectedItems.length === 0) return;

    if (
      confirm(
        `Are you sure you want to ${action} ${selectedItems.length} items?`
      )
    ) {
      try {
        if (action === "delete") {
          await contentManagementService.bulkDelete(selectedItems);
        } else {
          await contentManagementService.bulkUpdateStatus(
            selectedItems,
            action === "publish" ? "published" : "archived"
          );
        }
        setSelectedItems([]);
        loadContent();
        loadStats();
      } catch (error) {
        console.error(`Failed to ${action} content:`, error);
        alert(`Failed to ${action} content. Please try again.`);
      }
    }
  };

  const toggleFeatured = async (id: string) => {
    try {
      await contentManagementService.toggleFeatured(id);
      loadContent();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
      alert("Failed to toggle featured status. Please try again.");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeIcon = (type: ContentItem["type"]) => {
    const Icon = contentTypeIcons[type];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage announcements, articles, policies, and FAQs
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Manage Categories
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Content
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Content
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalContent}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.published}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.drafts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="announcement">Announcements</option>
            <option value="blog_post">Blog Posts</option>
            <option value="help_article">Help Articles</option>
            <option value="policy">Policies</option>
            <option value="faq">FAQs</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories &&
              categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
          <select
            value={filters.featured}
            onChange={(e) =>
              setFilters({ ...filters, featured: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Content</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-800 font-medium">
              {selectedItems.length} items selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction("publish")}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction("archive")}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === content.length &&
                      content.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(content.map((item) => item._id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading content...
                  </td>
                </tr>
              ) : content.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No content found
                  </td>
                </tr>
              ) : (
                content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item._id]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter((id) => id !== item._id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                            {item.featured && (
                              <StarSolidIcon className="h-4 w-4 text-yellow-400 ml-2" />
                            )}
                          </div>
                          {item.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {item.excerpt}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {item.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[item.status]
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.author.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {item.views}
                        </span>
                        <span className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {item.likes}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Created: {formatDate(item.createdAt)}</div>
                        {item.publishedAt && (
                          <div>Published: {formatDate(item.publishedAt)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleFeatured(item._id)}
                          className={`p-1 rounded ${
                            item.featured
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={
                            item.featured
                              ? "Remove from featured"
                              : "Add to featured"
                          }
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingContent(item)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-purple-50 border-purple-500 text-purple-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Form Modal */}
      <ContentForm
        content={editingContent}
        isOpen={showCreateModal || !!editingContent}
        onClose={() => {
          setShowCreateModal(false);
          setEditingContent(null);
        }}
        onSuccess={() => {
          loadContent();
          loadStats();
        }}
      />

      {/* Category Management Modal */}
      <CategoryManager
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          loadCategories();
        }}
      />
    </div>
  );
}
