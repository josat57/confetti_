# Map Implementation Guide - AI Event Planner

## Overview

The AI Event Planner uses **Leaflet** with **react-leaflet** for the interactive map functionality. This guide explains what's required for the map to work properly.

## ✅ What's Already Implemented

1. **Leaflet & React-Leaflet** - Already installed in package.json
2. **MapPicker Component** - Located at `src/components/ai-planner/MapPicker.tsx`
3. **OpenStreetMap Integration** - Free tile provider (no API key needed)
4. **Geocoding** - Using Nominatim (OpenStreetMap's geocoding service)
5. **Reverse Geocoding** - Converts coordinates to addresses
6. **Search Functionality** - Search for locations by name or address
7. **Click-to-Select** - Click anywhere on the map to select a location

## 🔧 Recent Fixes Applied

### 1. Global CSS Import

**File:** `src/app/globals.css`

Added Leaflet CSS import at the top:

```css
@import "leaflet/dist/leaflet.css";
```

### 2. Leaflet Icon Configuration

**File:** `src/lib/utils/leafletConfig.ts`

Created a utility to properly configure Leaflet icons for Next.js:

- Fixes default marker icon paths
- Provides custom purple marker option
- Ensures icons display correctly in production

### 3. Component Updates

**File:** `src/components/ai-planner/MapPicker.tsx`

Updated to use the new configuration utility instead of inline icon setup.

## 🚀 How to Test the Map

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to the AI Event Planner

Go to: `http://localhost:3000/ai-event-planner`

### 3. Test Map Functionality

**Search Test:**

1. Enter a location in the search box (e.g., "San Francisco, CA")
2. Click "Search"
3. Map should zoom to that location
4. A marker should appear

**Click Test:**

1. Click anywhere on the map
2. A marker should appear at that location
3. Location details should show in the info box at the bottom

**Confirm Test:**

1. After selecting a location, click "Confirm Location"
2. The location should be saved to the form

## 🐛 Troubleshooting

### Issue: Map Not Displaying (Gray Box)

**Symptoms:**

- Gray box instead of map
- Console error: "Map container not found"

**Solutions:**

1. **Clear Next.js Cache:**

   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Verify Leaflet CSS Import:**
   Check `src/app/globals.css` has:

   ```css
   @import "leaflet/dist/leaflet.css";
   ```

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any Leaflet-related errors
   - Common error: "Unexpected token '<'" means CSS isn't loading

### Issue: Markers Not Showing

**Symptoms:**

- Map displays but no markers appear
- Console error about marker icons

**Solutions:**

1. **Verify Icon Configuration:**
   The `leafletConfig.ts` utility should be imported in MapPicker

2. **Check Network Tab:**

   - Open DevTools → Network tab
   - Look for marker-icon.png requests
   - Should load from unpkg.com CDN

3. **Use Custom Icon:**
   If default icons fail, the component can use the custom purple marker:

   ```typescript
   import { createCustomIcon } from "@/lib/utils/leafletConfig";

   <Marker position={position} icon={createCustomIcon()} />;
   ```

### Issue: Search Not Working

**Symptoms:**

- Search returns no results
- Console error about Nominatim

**Solutions:**

1. **Check Internet Connection:**
   Nominatim requires internet access

2. **Rate Limiting:**
   Nominatim has rate limits (1 request/second)

   - Wait a few seconds between searches
   - For production, consider using a paid geocoding service

3. **CORS Issues:**
   If you see CORS errors:
   - This is normal in development
   - Nominatim allows CORS from all origins
   - If issues persist, consider using a proxy

### Issue: Map Tiles Not Loading

**Symptoms:**

- Map shows but tiles are gray/missing
- Console errors about tile loading

**Solutions:**

1. **Check Internet Connection:**
   OpenStreetMap tiles require internet access

2. **Try Alternative Tile Provider:**
   Update the TileLayer URL in MapPicker.tsx:

   ```tsx
   <TileLayer
     attribution='&copy; <a href="https://carto.com/">CARTO</a>'
     url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
   />
   ```

3. **Check Browser Console:**
   Look for 404 errors on tile requests

## 🔑 No API Keys Required!

The current implementation uses **free services**:

- **Map Tiles:** OpenStreetMap (free, no API key)
- **Geocoding:** Nominatim (free, no API key)
- **Reverse Geocoding:** Nominatim (free, no API key)

### Rate Limits (Free Tier)

**Nominatim:**

- 1 request per second
- Must include User-Agent header (already configured)
- For production, consider:
  - Self-hosting Nominatim
  - Using paid services (Google Maps, Mapbox)

## 🎨 Customization Options

### Change Map Style

Replace the TileLayer URL with different providers:

**Dark Mode:**

```tsx
url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
```

**Satellite:**

```tsx
url =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
```

**Watercolor (Stamen):**

```tsx
url = "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg";
```

### Custom Marker Icon

Use the purple custom marker:

```typescript
import { createCustomIcon } from "@/lib/utils/leafletConfig";

<Marker position={position} icon={createCustomIcon()} />;
```

### Change Default Location

Update the initial map position in MapPicker.tsx:

```typescript
const [mapPosition, setMapPosition] = useState<[number, number]>(
  [40.7128, -74.006] // New York City
);
```

## 🚀 Production Considerations

### 1. Geocoding Service

For production, consider upgrading to a paid service:

**Google Maps Geocoding API:**

- More accurate results
- Better address parsing
- Requires API key and billing

**Mapbox Geocoding API:**

- Good accuracy
- Generous free tier (100,000 requests/month)
- Requires API key

### 2. Map Tiles

Consider using a CDN or paid tile service:

**Mapbox:**

- Custom styles
- Better performance
- Requires API key

**Google Maps:**

- Familiar interface
- Excellent coverage
- Requires API key and billing

### 3. Caching

Implement geocoding result caching:

```typescript
// Cache geocoding results in localStorage
const cacheKey = `geocode_${searchQuery}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

## 📚 Additional Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap Tile Servers](https://wiki.openstreetmap.org/wiki/Tile_servers)
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)

## 🆘 Still Having Issues?

If the map still doesn't work after trying these solutions:

1. **Check Package Versions:**

   ```bash
   npm list leaflet react-leaflet
   ```

   Should show:

   - leaflet: ^1.9.4
   - react-leaflet: ^4.2.1

2. **Reinstall Dependencies:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Next.js Version:**
   The implementation is tested with Next.js 14.1.0

4. **Browser Compatibility:**
   - Chrome/Edge: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ✅ Full support
   - Mobile browsers: ✅ Full support

## ✨ Features Working

- ✅ Interactive map with zoom and pan
- ✅ Location search by name/address
- ✅ Click-to-select location
- ✅ Reverse geocoding (coordinates → address)
- ✅ Location confirmation
- ✅ Manual entry fallback
- ✅ Mobile responsive
- ✅ Touch-friendly on tablets/phones
- ✅ Loading states
- ✅ Error handling

The map should now be fully functional! 🎉
