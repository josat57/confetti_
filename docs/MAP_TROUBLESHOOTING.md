# Map Not Loading - Troubleshooting Guide

## Current Status

The map implementation uses:

- ✅ Leaflet 1.9.4
- ✅ React-Leaflet 4.2.1
- ✅ OpenStreetMap tiles (free, no API key)
- ✅ Nominatim geocoding (free, no API key)

## What I Just Fixed

### 1. Moved Leaflet CSS Import to Layout

**File:** `src/app/layout.tsx`

```typescript
import "leaflet/dist/leaflet.css";
```

This is the correct way to import CSS in Next.js App Router.

### 2. Updated Global CSS

**File:** `src/app/globals.css`

- Removed incorrect `@import` statement
- Added proper Leaflet container styling
- Added z-index fix

### 3. Added Error Handling

**File:** `src/components/ai-planner/MapPicker.tsx`

- Added catch block for config loading
- Better error messages

## Steps to Fix

### Step 1: Stop the Dev Server

```bash
# Press Ctrl+C in your terminal
```

### Step 2: Clear Next.js Cache

```bash
rm -rf .next
```

### Step 3: Clear Node Modules Cache (if needed)

```bash
rm -rf node_modules/.cache
```

### Step 4: Restart Dev Server

```bash
npm run dev
```

### Step 5: Hard Refresh Browser

- **Chrome/Edge:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox:** `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- **Safari:** `Cmd + Option + R`

## What to Check

### 1. Browser Console (F12)

**Open DevTools and check for errors:**

✅ **Good Signs:**

```
No errors about Leaflet
No 404 errors for CSS files
No "Map container not found" errors
```

❌ **Bad Signs and Fixes:**

**Error: "Map container not found"**

- The map div isn't rendering
- Check if `isMounted` is true
- Verify the component is rendering

**Error: "Unexpected token '<'"**

- CSS file not loading correctly
- Verify `import "leaflet/dist/leaflet.css"` is in layout.tsx
- Clear cache and restart

**Error: "Cannot read property '\_getIconUrl'"**

- Icon configuration failed
- Check if leafletConfig.ts exists
- Verify the import path is correct

### 2. Network Tab

**Check these requests:**

✅ **Should See:**

```
✓ leaflet.css - Status 200
✓ tile.openstreetmap.org - Status 200 (map tiles)
✓ marker-icon.png - Status 200 (from unpkg.com)
```

❌ **Problems:**

**404 on leaflet.css:**

```bash
# Reinstall leaflet
npm install leaflet@1.9.4 --save
```

**404 on map tiles:**

- Check internet connection
- OpenStreetMap might be down (rare)
- Try alternative tile provider (see below)

### 3. Visual Check

**What you should see:**

✅ **Working Map:**

- Gray/white map tiles with streets
- Search box at top
- "Confirm Location" button at bottom
- Can zoom with mouse wheel
- Can pan by dragging

❌ **Not Working:**

- Gray box (no tiles)
- No search box
- Console errors

## Alternative Solutions

### Solution 1: Use Different Tile Provider

If OpenStreetMap tiles aren't loading, try CartoDB:

**File:** `src/components/ai-planner/MapPicker.tsx`

Replace the TileLayer:

```tsx
<TileLayer
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
/>
```

### Solution 2: Add Timeout to Icon Config

If icons aren't loading, add a timeout:

**File:** `src/components/ai-planner/MapPicker.tsx`

```typescript
useEffect(() => {
  setIsMounted(true);

  // Wait for DOM to be ready
  setTimeout(() => {
    import("@/lib/utils/leafletConfig")
      .then((module) => {
        module.configureLeafletIcons();
      })
      .catch((error) => {
        console.error("Failed to load Leaflet config:", error);
      });
  }, 100);
}, []);
```

### Solution 3: Reinstall Dependencies

If nothing works:

```bash
# Remove everything
rm -rf node_modules package-lock.json .next

# Reinstall
npm install

# Start fresh
npm run dev
```

## Testing Checklist

After restarting, test these:

- [ ] Navigate to `/ai-event-planner`
- [ ] Map displays with tiles
- [ ] Search box is visible
- [ ] Type "New York" and click Search
- [ ] Map zooms to New York
- [ ] Click anywhere on the map
- [ ] Blue marker appears
- [ ] Location info shows at bottom
- [ ] Click "Confirm Location"
- [ ] Location is saved to form

## Common Issues

### Issue: Map is Gray Box

**Cause:** CSS not loaded or tiles not loading

**Fix:**

1. Check browser console for errors
2. Verify `import "leaflet/dist/leaflet.css"` in layout.tsx
3. Check internet connection
4. Try alternative tile provider

### Issue: No Marker When Clicking

**Cause:** Icon configuration failed

**Fix:**

1. Check if leafletConfig.ts exists
2. Verify import path: `@/lib/utils/leafletConfig`
3. Check browser console for icon errors
4. Try using custom icon (see below)

### Issue: Search Not Working

**Cause:** Nominatim API issue or rate limiting

**Fix:**

1. Wait 2-3 seconds between searches
2. Check internet connection
3. Try different search terms
4. Check browser console for API errors

## Using Custom Purple Marker

If default markers don't work, use the custom icon:

**File:** `src/components/ai-planner/MapPicker.tsx`

```typescript
import { createCustomIcon } from "@/lib/utils/leafletConfig";

// In LocationMarker component:
return position === null ? null : (
  <Marker position={position} icon={createCustomIcon()} />
);
```

## Still Not Working?

### Check Package Versions

```bash
npm list leaflet react-leaflet
```

Should show:

```
├── leaflet@1.9.4
└── react-leaflet@4.2.1
```

If different versions:

```bash
npm install leaflet@1.9.4 react-leaflet@4.2.1 --save
```

### Check Next.js Version

```bash
npm list next
```

Should show: `next@14.1.0`

### Check TypeScript

```bash
npm list typescript
```

Should show: `typescript@5.3.3`

### Verify File Structure

```
src/
├── app/
│   ├── layout.tsx (has leaflet CSS import)
│   ├── globals.css (has leaflet styles)
│   └── ai-event-planner/
│       └── page.tsx
├── components/
│   └── ai-planner/
│       └── MapPicker.tsx
└── lib/
    └── utils/
        └── leafletConfig.ts
```

## Environment Check

### Node Version

```bash
node --version
```

Should be: v18+ or v20+

### NPM Version

```bash
npm --version
```

Should be: v9+ or v10+

## Last Resort

If absolutely nothing works:

1. **Create a minimal test:**

```tsx
// src/app/test-map/page.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

export default function TestMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
}
```

2. **Visit:** `http://localhost:3000/test-map`

3. **If this works:** The issue is in MapPicker component
4. **If this doesn't work:** The issue is with Leaflet installation

## Get Help

If you've tried everything:

1. Share browser console errors
2. Share network tab screenshot
3. Share package.json versions
4. Describe what you see vs. what you expect

The map should work with these fixes! 🗺️
