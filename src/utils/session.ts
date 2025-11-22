/**
 * Session management utilities
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const WARNING_TIME = 5 * 60 * 1000; // Warn 5 minutes before timeout

let lastActivityTime = Date.now();
let sessionTimer: NodeJS.Timeout | null = null;
let warningTimer: NodeJS.Timeout | null = null;
let onSessionExpire: (() => void) | null = null;
let onSessionWarning: ((remainingTime: number) => void) | null = null;

/**
 * Update last activity time
 */
export const updateActivity = (): void => {
  lastActivityTime = Date.now();

  // Store in localStorage for cross-tab sync
  if (typeof window !== "undefined") {
    localStorage.setItem("lastActivity", lastActivityTime.toString());
  }
};

/**
 * Get time since last activity
 */
export const getTimeSinceLastActivity = (): number => {
  return Date.now() - lastActivityTime;
};

/**
 * Get remaining session time
 */
export const getRemainingSessionTime = (): number => {
  const elapsed = getTimeSinceLastActivity();
  return Math.max(0, SESSION_TIMEOUT - elapsed);
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (): boolean => {
  return getTimeSinceLastActivity() >= SESSION_TIMEOUT;
};

/**
 * Initialize session monitoring
 */
export const initSessionMonitoring = (
  onExpire: () => void,
  onWarning?: (remainingTime: number) => void
): void => {
  if (typeof window === "undefined") return;

  onSessionExpire = onExpire;
  onSessionWarning = onWarning || null;

  // Track user activity
  const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
  activityEvents.forEach((event) => {
    window.addEventListener(event, updateActivity);
  });

  // Check session periodically
  sessionTimer = setInterval(() => {
    const remaining = getRemainingSessionTime();

    if (remaining === 0) {
      handleSessionExpire();
    } else if (remaining <= WARNING_TIME && onSessionWarning) {
      onSessionWarning(remaining);
    }
  }, ACTIVITY_CHECK_INTERVAL);

  // Sync activity across tabs
  window.addEventListener("storage", (e) => {
    if (e.key === "lastActivity" && e.newValue) {
      lastActivityTime = parseInt(e.newValue, 10);
    }
  });

  // Initialize last activity
  updateActivity();
};

/**
 * Handle session expiration
 */
const handleSessionExpire = (): void => {
  if (onSessionExpire) {
    onSessionExpire();
  }
  cleanupSessionMonitoring();
};

/**
 * Cleanup session monitoring
 */
export const cleanupSessionMonitoring = (): void => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
};

/**
 * Extend session
 */
export const extendSession = (): void => {
  updateActivity();
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Store sensitive operation timestamp
 */
export const storeSensitiveOperationTime = (): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("lastSensitiveOp", Date.now().toString());
  }
};

/**
 * Check if re-authentication is required for sensitive operation
 */
export const requiresReAuthentication = (
  timeoutMinutes: number = 15
): boolean => {
  if (typeof window === "undefined") return true;

  const lastOpTime = localStorage.getItem("lastSensitiveOp");
  if (!lastOpTime) return true;

  const elapsed = Date.now() - parseInt(lastOpTime, 10);
  return elapsed >= timeoutMinutes * 60 * 1000;
};
