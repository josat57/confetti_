/**
 * Mobile utilities for device detection and optimization
 */

/**
 * Detect if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if device is iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detect if device is Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * Detect if device is tablet
 */
export const isTablet = (): boolean => {
  if (typeof window === "undefined") return false;
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
};

/**
 * Get device type
 */
export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (isTablet()) return "tablet";
  if (isMobile()) return "mobile";
  return "desktop";
};

/**
 * Check if touch device
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * Get viewport dimensions
 */
export const getViewportDimensions = () => {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Check if device supports PWA
 */
export const supportsPWA = (): boolean => {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
};

/**
 * Check if app is installed as PWA
 */
export const isInstalledPWA = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

/**
 * Prompt PWA installation
 */
let deferredPrompt: any = null;

export const initPWAInstallPrompt = () => {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
};

export const showPWAInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === "accepted";
};

export const canShowPWAPrompt = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * Optimize image for mobile
 */
export const getOptimizedImageUrl = (url: string, width?: number): string => {
  if (!url) return "";

  // If using a CDN like Cloudinary, add transformation parameters
  // This is a placeholder - adjust based on your CDN
  const deviceWidth = width || getViewportDimensions().width;
  const optimizedWidth = Math.min(deviceWidth * 2, 1920); // 2x for retina

  // Example for Cloudinary
  if (url.includes("cloudinary.com")) {
    return url.replace(
      "/upload/",
      `/upload/w_${optimizedWidth},f_auto,q_auto/`
    );
  }

  return url;
};

/**
 * Check network connection type
 */
export const getConnectionType = (): string => {
  if (typeof navigator === "undefined" || !(navigator as any).connection) {
    return "unknown";
  }
  return (navigator as any).connection.effectiveType || "unknown";
};

/**
 * Check if on slow connection
 */
export const isSlowConnection = (): boolean => {
  const connectionType = getConnectionType();
  return ["slow-2g", "2g"].includes(connectionType);
};

/**
 * Vibrate device (if supported)
 */
export const vibrate = (pattern: number | number[]): boolean => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return false;
  return navigator.vibrate(pattern);
};

/**
 * Request camera access
 */
export const requestCameraAccess = async (): Promise<MediaStream | null> => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return null;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    return stream;
  } catch (error) {
    console.error("Camera access denied:", error);
    return null;
  }
};

/**
 * Stop camera stream
 */
export const stopCameraStream = (stream: MediaStream): void => {
  stream.getTracks().forEach((track) => track.stop());
};

/**
 * Capture photo from camera
 */
export const capturePhoto = (
  videoElement: HTMLVideoElement,
  canvas: HTMLCanvasElement
): string | null => {
  if (!videoElement || !canvas) return null;

  const context = canvas.getContext("2d");
  if (!context) return null;

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  context.drawImage(videoElement, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.8);
};

/**
 * Check if device has camera
 */
export const hasCamera = async (): Promise<boolean> => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === "videoinput");
  } catch {
    return false;
  }
};

/**
 * Get safe area insets for notched devices
 */
export const getSafeAreaInsets = () => {
  if (typeof window === "undefined")
    return { top: 0, right: 0, bottom: 0, left: 0 };

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top)") || "0"),
    right: parseInt(
      style.getPropertyValue("env(safe-area-inset-right)") || "0"
    ),
    bottom: parseInt(
      style.getPropertyValue("env(safe-area-inset-bottom)") || "0"
    ),
    left: parseInt(style.getPropertyValue("env(safe-area-inset-left)") || "0"),
  };
};
