import api from "@/api/api";

export interface SearchResult {
  id: string;
  type: "event" | "client" | "vendor" | "task" | "document";
  title: string;
  description: string;
  snippet: string;
  highlights: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  categories: {
    events: number;
    clients: number;
    vendors: number;
    tasks: number;
    documents: number;
  };
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

const searchService = {
  // Global search
  search: async (
    query: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> => {
    const response = await api.get("/planner/search", {
      params: { query, ...filters, page, limit },
    });
    return response.data;
  },

  // Autocomplete suggestions
  autocomplete: async (query: string): Promise<string[]> => {
    const response = await api.get("/planner/search/autocomplete", {
      params: { query },
    });
    return response.data.suggestions;
  },

  // Recent searches
  getRecentSearches: async (): Promise<string[]> => {
    const response = await api.get("/planner/search/recent");
    return response.data.searches;
  },

  // Saved searches
  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await api.get("/planner/search/saved");
    return response.data;
  },

  saveSearch: async (
    name: string,
    query: string,
    filters: SearchFilters
  ): Promise<SavedSearch> => {
    const response = await api.post("/planner/search/saved", {
      name,
      query,
      filters,
    });
    return response.data;
  },

  deleteSavedSearch: async (id: string): Promise<void> => {
    await api.delete(`/planner/search/saved/${id}`);
  },
};

export default searchService;
