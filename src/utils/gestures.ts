/**
 * Touch gesture utilities
 */

export interface SwipeEvent {
  direction: "left" | "right" | "up" | "down";
  distance: number;
  duration: number;
}

export interface PinchEvent {
  scale: number;
  center: { x: number; y: number };
}

/**
 * Detect swipe gesture
 */
export const detectSwipe = (
  element: HTMLElement,
  onSwipe: (event: SwipeEvent) => void,
  threshold: number = 50
): (() => void) => {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const duration = touchEndTime - touchStartTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if it's a swipe
    if (Math.max(absX, absY) < threshold) return;

    let direction: SwipeEvent["direction"];
    let distance: number;

    if (absX > absY) {
      direction = deltaX > 0 ? "right" : "left";
      distance = absX;
    } else {
      direction = deltaY > 0 ? "down" : "up";
      distance = absY;
    }

    onSwipe({ direction, distance, duration });
  };

  element.addEventListener("touchstart", handleTouchStart);
  element.addEventListener("touchend", handleTouchEnd);

  return () => {
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchend", handleTouchEnd);
  };
};

/**
 * Detect pinch gesture
 */
export const detectPinch = (
  element: HTMLElement,
  onPinch: (event: PinchEvent) => void
): (() => void) => {
  let initialDistance = 0;
  let initialScale = 1;

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;
      const center = getCenter(e.touches[0], e.touches[1]);

      onPinch({ scale: scale * initialScale, center });
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      initialScale = 1;
    }
  };

  element.addEventListener("touchstart", handleTouchStart);
  element.addEventListener("touchmove", handleTouchMove, { passive: false });
  element.addEventListener("touchend", handleTouchEnd);

  return () => {
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchmove", handleTouchMove);
    element.removeEventListener("touchend", handleTouchEnd);
  };
};

/**
 * Detect long press
 */
export const detectLongPress = (
  element: HTMLElement,
  onLongPress: () => void,
  duration: number = 500
): (() => void) => {
  let timer: NodeJS.Timeout | null = null;

  const handleTouchStart = () => {
    timer = setTimeout(() => {
      onLongPress();
    }, duration);
  };

  const handleTouchEnd = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  element.addEventListener("touchstart", handleTouchStart);
  element.addEventListener("touchend", handleTouchEnd);
  element.addEventListener("touchcancel", handleTouchEnd);

  return () => {
    if (timer) clearTimeout(timer);
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchend", handleTouchEnd);
    element.removeEventListener("touchcancel", handleTouchEnd);
  };
};

/**
 * Prevent default touch behavior
 */
export const preventDefaultTouch = (element: HTMLElement): (() => void) => {
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
  };

  element.addEventListener("touchmove", handleTouchMove, { passive: false });

  return () => {
    element.removeEventListener("touchmove", handleTouchMove);
  };
};

/**
 * Enable pull-to-refresh
 */
export const enablePullToRefresh = (
  onRefresh: () => Promise<void>,
  threshold: number = 80
): (() => void) => {
  let touchStartY = 0;
  let isPulling = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY;

      if (pullDistance > threshold && !isPulling) {
        isPulling = true;
        // Visual feedback could be added here
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling) {
      isPulling = false;
      await onRefresh();
    }
  };

  document.addEventListener("touchstart", handleTouchStart);
  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", handleTouchEnd);

  return () => {
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };
};
