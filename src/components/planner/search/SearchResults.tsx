"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { SearchResult } from "@/services/planner/search.service";

interface SearchResultsProps {
  results: SearchResult[];
  categories: {
    events: number;
    clients: number;
    vendors: number;
    tasks: number;
    documents: number;
  };
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  loading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  categories,
  selectedCategory = "all",
  onCategoryChange,
  loading = false,
}) => {
  const router = useRouter();

  const categoryIcons = {
    events: CalendarIcon,
    clients: UserGroupIcon,
    vendors: BuildingStorefrontIcon,
    tasks: CheckCircleIcon,
    documents: DocumentTextIcon,
  };

  const categoryLabels = {
    events: "Events",
    clients: "Clients",
    vendors: "Vendors",
    tasks: "Tasks",
    documents: "Documents",
  };

  const handleResultClick = (result: SearchResult) => {
    const routes = {
      event: `/planner/dashboard/events/${result.id}`,
      client: `/planner/dashboard/clients/${result.id}`,
      vendor: `/planner/dashboard/vendors/${result.id}`,
      task: `/planner/dashboard/tasks/${result.id}`,
      document: `/planner/dashboard/documents/${result.id}`,
    };
    router.push(routes[result.type]);
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights || highlights.length === 0) return text;

    let highlightedText = text;
    highlights.forEach((highlight) => {
      const regex = new RegExp(`(${highlight})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200">$1</mark>'
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No results found</p>
        <p className="text-sm text-gray-400 mt-2">
          Try adjusting your search terms or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange?.("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({Object.values(categories).reduce((a, b) => a + b, 0)})
        </button>
        {Object.entries(categories).map(([category, count]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                selectedCategory === category
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {categoryLabels[category as keyof typeof categoryLabels]} ({count}
              )
            </button>
          );
        })}
      </div>

      {/* Results by Category */}
      {Object.entries(groupedResults).map(([type, categoryResults]) => {
        const Icon = categoryIcons[type as keyof typeof categoryIcons];
        const label = categoryLabels[type as keyof typeof categoryLabels];

        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <Icon className="h-5 w-5 mr-2 text-gray-400" />
              {label} ({categoryResults.length})
            </div>
            <div className="space-y-2">
              {categoryResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-md transition-all"
                >
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {highlightText(result.title, result.highlights)}
                  </h3>
                  {result.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {highlightText(result.description, result.highlights)}
                    </p>
                  )}
                  {result.snippet && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      ...{highlightText(result.snippet, result.highlights)}...
                    </p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <span className="capitalize">{result.type}</span>
                    <span className="mx-2">•</span>
                    <span>
                      Updated {new Date(result.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
