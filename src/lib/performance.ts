/**
 * Performance optimization utilities for the vendor dashboard
 */

import { ComponentType, lazy } from "react";

/**
 * Lazy load a component with a custom loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return lazy(importFunc);
}

/**
 * Preload a route for faster navigation
 */
export function preloadRoute(href: string) {
  if (typeof window !== "undefined") {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if an image should be lazy loaded
 */
export function shouldLazyLoad(index: number, threshold: number = 3): boolean {
  return index >= threshold;
}

/**
 * Optimize image loading with intersection observer
 */
export function observeImage(
  element: HTMLImageElement,
  callback: () => void
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    callback();
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: "50px",
    }
  );

  observer.observe(element);
  return observer;
}

/**
 * Cache data in memory with expiration
 */
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number = 300000) {
    // Default 5 minutes
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const memoryCache = new MemoryCache();

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch multiple API calls
 */
export class RequestBatcher {
  private queue: Array<{
    key: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchFn: (keys: string[]) => Promise<any[]>;

  constructor(batchFn: (keys: string[]) => Promise<any[]>, delay: number = 50) {
    this.batchFn = batchFn;
  }

  request(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => this.flush(), 50);
    });
  }

  private async flush() {
    const queue = this.queue.slice();
    this.queue = [];

    try {
      const keys = queue.map((item) => item.key);
      const results = await this.batchFn(keys);

      queue.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      queue.forEach((item) => {
        item.reject(error);
      });
    }
  }
}
