// next/image loader. The built-in optimizer runs out of memory on Render's
// free instance and answers 502, so resizing happens elsewhere: Unsplash
// (an imgix CDN) resizes from URL params, and everything else is served as-is.
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 75));
    url.searchParams.set("auto", "format");
    return url.toString();
  }
  return src;
}
