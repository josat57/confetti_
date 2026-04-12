"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import contentManagementService, {
  ContentItem,
  ContentCategory,
  CreateContentInput,
} from "@/services/admin/content-management.service";

interface ContentFormProps {
  content?: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContentForm({
  content,
  isOpen,
  onClose,
  onSuccess,
}: ContentFormProps) {
  const [formData, setFormData] = useState<CreateContentInput>({
    type: "announcement",
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featured: false,
    status: "draft",
    metadata: {
      seoTitle: "",
      seoDescription: "",
      slug: "",
    },
  });

  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (content) {
        setFormData({
          type: content.type,
          title: content.title,
          content: content.content,
          excerpt: content.excerpt || "",
          category: content.category || "",
          tags: content.tags,
          featured: content.featured,
          status:
            content.status === "archived"
              ? "draft"
              : (content.status as "draft" | "published"),
          metadata: {
            seoTitle: content.metadata?.seoTitle || "",
            seoDescription: content.metadata?.seoDescription || "",
            slug: content.metadata?.slug || "",
          },
        });
      } else {
        // Reset form for new content
        setFormData({
          type: "announcement",
          title: "",
          content: "",
          excerpt: "",
          category: "",
          tags: [],
          featured: false,
          status: "draft",
          metadata: {
            seoTitle: "",
            seoDescription: "",
            slug: "",
          },
        });
      }
    }
  }, [isOpen, content]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (content) {
        await contentManagementService.updateContent(content._id, formData);
      } else {
        await contentManagementService.createContent(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save content:", error);
      setErrors({ submit: "Failed to save content. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      metadata: {
        ...formData.metadata,
        slug: formData.metadata?.slug || generateSlug(title),
        seoTitle: formData.metadata?.seoTitle || title,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {content ? "Edit Content" : "Create New Content"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as ContentItem["type"],
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="announcement">Announcement</option>
                  <option value="blog_post">Blog Post</option>
                  <option value="help_article">Help Article</option>
                  <option value="policy">Policy</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter content title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description or excerpt"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={12}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.content ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter content body (supports HTML)"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "draft" | "published",
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Featured Content
                </label>
              </div>
            </div>

            {/* SEO Metadata */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.metadata?.seoTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          seoTitle: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.metadata?.seoDescription || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          seoDescription: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.metadata?.slug || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          slug: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : content
                ? "Update Content"
                : "Create Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
