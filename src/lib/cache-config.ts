/**
 * Caching configuration for the vendor dashboard
 * Implements various caching strategies for optimal performance
 */

/**
 * Cache durations in milliseconds
 */
export const CACHE_DURATIONS = {
  // Short-lived cache (1 minute)
  SHORT: 60 * 1000,

  // Medium-lived cache (5 minutes)
  MEDIUM: 5 * 60 * 1000,

  // Long-lived cache (30 minutes)
  LONG: 30 * 60 * 1000,

  // Very long-lived cache (1 hour)
  VERY_LONG: 60 * 60 * 1000,

  // Static data cache (24 hours)
  STATIC: 24 * 60 * 60 * 1000,
};

/**
 * Cache keys for different data types
 */
export const CACHE_KEYS = {
  // User data
  USER_PROFILE: "user:profile",
  USER_SUBSCRIPTION: "user:subscription",

  // Dashboard data
  DASHBOARD_STATS: "dashboard:stats",
  DASHBOARD_ACTIVITY: "dashboard:activity",

  // Events
  EVENT_LISTINGS: "events:listings",
  EVENT_DETAILS: (id: string) => `events:details:${id}`,

  // Analytics
  ANALYTICS_VIEWS: "analytics:views",
  ANALYTICS_RATINGS: "analytics:ratings",

  // Reviews
  REVIEWS_LIST: "reviews:list",
  REVIEWS_STATS: "reviews:stats",

  // Leads
  LEADS_LIST: "leads:list",
  LEAD_DETAILS: (id: string) => `leads:details:${id}`,

  // Quotes
  QUOTES_LIST: "quotes:list",
  QUOTE_DETAILS: (id: string) => `quotes:details:${id}`,

  // Team
  TEAM_MEMBERS: "team:members",

  // Payments
  PAYMENTS_LIST: "payments:list",
  INVOICE_DETAILS: (id: string) => `payments:invoice:${id}`,

  // Clients
  CLIENTS_LIST: "clients:list",
  CLIENT_DETAILS: (id: string) => `clients:details:${id}`,

  // Calendar
  CALENDAR_EVENTS: "calendar:events",
};

/**
 * Cache invalidation patterns
 */
export const CACHE_INVALIDATION = {
  // Invalidate all user-related caches
  invalidateUser: () => [CACHE_KEYS.USER_PROFILE, CACHE_KEYS.USER_SUBSCRIPTION],

  // Invalidate dashboard caches
  invalidateDashboard: () => [
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_KEYS.DASHBOARD_ACTIVITY,
  ],

  // Invalidate event-related caches
  invalidateEvents: () => [CACHE_KEYS.EVENT_LISTINGS],

  // Invalidate analytics caches
  invalidateAnalytics: () => [
    CACHE_KEYS.ANALYTICS_VIEWS,
    CACHE_KEYS.ANALYTICS_RATINGS,
  ],
};

/**
 * Stale-while-revalidate configuration
 */
export const SWR_CONFIG = {
  // Revalidate on focus
  revalidateOnFocus: true,

  // Revalidate on reconnect
  revalidateOnReconnect: true,

  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Retry on error
  shouldRetryOnError: true,

  // Error retry count
  errorRetryCount: 3,

  // Error retry interval
  errorRetryInterval: 5000,

  // Focus throttle interval
  focusThrottleInterval: 5000,
};

/**
 * Local storage cache helper
 */
export const localStorageCache = {
  set: (key: string, data: any, ttl?: number) => {
    if (typeof window === "undefined") return;

    const item = {
      data,
      expiry: ttl ? Date.now() + ttl : null,
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Failed to set localStorage cache:", error);
    }
  },

  get: (key: string): any | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error("Failed to get localStorage cache:", error);
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },

  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

/**
 * Session storage cache helper (for temporary data)
 */
export const sessionStorageCache = {
  set: (key: string, data: any) => {
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to set sessionStorage cache:", error);
    }
  },

  get: (key: string): any | null => {
    if (typeof window === "undefined") return null;

    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to get sessionStorage cache:", error);
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  },

  clear: () => {
    if (typeof window === "undefined") return;
    sessionStorage.clear();
  },
};
