"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import contentManagementService, {
  ContentCategory,
} from "@/services/admin/content-management.service";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryManager({
  isOpen,
  onClose,
  onSuccess,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ContentCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await contentManagementService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Provide empty categories when API is not available
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingCategory) {
        await contentManagementService.updateCategory(
          editingCategory._id,
          formData
        );
      } else {
        await contentManagementService.createCategory(formData);
      }

      setFormData({ name: "", description: "", slug: "" });
      setEditingCategory(null);
      setShowForm(false);
      loadCategories();
      onSuccess();
    } catch (error) {
      console.error("Failed to save category:", error);
      setErrors({ submit: "Failed to save category. Please try again." });
    }
  };

  const handleEdit = (category: ContentCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
    });
    setShowForm(true);
  };

  const handleDelete = async (category: ContentCategory) => {
    if (category.contentCount > 0) {
      alert(
        `Cannot delete category "${category.name}" because it has ${category.contentCount} content items. Please move or delete the content first.`
      );
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      try {
        await contentManagementService.deleteCategory(category._id);
        loadCategories();
        onSuccess();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", slug: "" });
    setEditingCategory(null);
    setShowForm(false);
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Add Category Button */}
            {!showForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Category
                </button>
              </div>
            )}

            {/* Category Form */}
            {showForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter category name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.slug ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="category-slug"
                      />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.description
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter category description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {editingCategory ? "Update Category" : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">
                  Categories
                </h3>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-500">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No categories found. Create your first category to get
                  started.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <div key={category._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {category.name}
                            </h4>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {category.contentCount} items
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">
                            {category.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Slug: {category.slug}</span>
                            <span>
                              Created:{" "}
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-purple-600"
                            title="Edit category"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete category"
                            disabled={category.contentCount > 0}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
