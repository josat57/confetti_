/**
 * Utility functions for handling event images from different sources
 * Supports base64-encoded images, GridFS file references, and legacy photo URLs
 */

interface MediaItem {
  _id?: string;
  type?: string;
  fileId?: string;
  url: string;
  caption?: string;
  isGridFS?: boolean;
  uploadedBy?: string;
  uploadedAt?: string;
}

interface PhotoItem {
  _id: string;
  url: string;
  caption?: string;
  order?: number;
}

interface Event {
  media?: MediaItem[];
  photos?: PhotoItem[];
  eventType?: string;
}

/**
 * Get the image URL for an event, handling different image storage formats
 * @param event - Event object containing media or photos
 * @returns Image URL string or placeholder path
 */
export function getEventImageUrl(event: Event): string {
  // Check for media array first (new format with base64 or GridFS)
  if (event.media && event.media.length > 0) {
    const firstMedia = event.media[0];

    // Handle base64 images
    if (firstMedia.url && firstMedia.url.startsWith("data:image")) {
      return firstMedia.url;
    }

    // Handle GridFS images
    if (firstMedia.isGridFS && firstMedia.fileId) {
      return `/api/v1/files/${firstMedia.fileId}`;
    }

    // Return URL as-is if it's a regular URL
    if (firstMedia.url) {
      return firstMedia.url;
    }
  }

  // Fallback to photos array (old format)
  if (event.photos && event.photos.length > 0) {
    return event.photos[0].url;
  }

  // Return placeholder based on event type
  return getPlaceholderImage(event.eventType);
}

/**
 * Get all image URLs from an event
 * @param event - Event object containing media or photos
 * @returns Array of image URL strings
 */
export function getEventImageUrls(event: Event): string[] {
  const urls: string[] = [];

  // Check for media array first
  if (event.media && event.media.length > 0) {
    event.media.forEach((media) => {
      // Handle base64 images
      if (media.url && media.url.startsWith("data:image")) {
        urls.push(media.url);
      }
      // Handle GridFS images
      else if (media.isGridFS && media.fileId) {
        urls.push(`/api/v1/files/${media.fileId}`);
      }
      // Regular URLs
      else if (media.url) {
        urls.push(media.url);
      }
    });
  }
  // Fallback to photos array
  else if (event.photos && event.photos.length > 0) {
    urls.push(...event.photos.map((p) => p.url));
  }

  return urls;
}

/**
 * Get placeholder image based on event type
 * @param eventType - Type of event
 * @returns Path to placeholder image
 */
function getPlaceholderImage(eventType?: string): string {
  const placeholders: Record<string, string> = {
    wedding: "/images/placeholders/wedding.jpg",
    corporate: "/images/placeholders/corporate.jpg",
    birthday: "/images/placeholders/birthday.jpg",
    graduation: "/images/placeholders/graduation.jpg",
    conference: "/images/placeholders/conference.jpg",
  };

  return (
    placeholders[eventType || ""] || "/images/placeholders/default-event.jpg"
  );
}

/**
 * Check if an event has any images
 * @param event - Event object
 * @returns Boolean indicating if event has images
 */
export function hasEventImages(event: Event): boolean {
  return !!(
    (event.media && event.media.length > 0) ||
    (event.photos && event.photos.length > 0)
  );
}
