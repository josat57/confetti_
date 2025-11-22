"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import searchService from "@/services/planner/search.service";

interface SearchInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showRecent?: boolean;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = "Search events, clients, vendors, tasks...",
  showRecent = true,
  autoFocus = false,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (showRecent) {
      loadRecentSearches();
    }
  }, [showRecent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await searchService.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce autocomplete
    if (value.length >= 2) {
      setLoading(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await searchService.autocomplete(value);
          setSuggestions(results);
          setShowDropdown(true);
        } catch (error) {
          console.error("Autocomplete failed:", error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(value.length === 0 && recentSearches.length > 0);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setShowDropdown(false);

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(
        `/planner/dashboard/search?q=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            setShowDropdown(query.length === 0 && recentSearches.length > 0)
          }
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : (
            <>
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 mr-3 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ClockIcon className="h-4 w-4 mr-3 text-gray-400" />
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {suggestions.length === 0 && query.length >= 2 && !loading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No suggestions found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
