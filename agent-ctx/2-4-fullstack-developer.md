# Task 2-4: POI Cache Optimization + GPX Import + Isochrone Visualization

## Work Completed

### Feature 1: POI API Cache Optimization
- Added in-memory cache with 10-minute TTL (similar to search route cache pattern)
- Cache key uses rounded coordinates (~111m precision) for better cache hits
- Reduced Overpass timeout from 10 to 6 seconds
- Reduced radius from 5000 to 3000 for faster queries
- Limited results to 15 max (down from 20)
- Added `AbortSignal.timeout(8000)` for hard fetch timeout
- Removed `next: { revalidate: 300 }` from Overpass fetch (causes Next.js cache errors)
- Added proper error handling for Overpass timeouts (429, 504 status codes)
- Also removed `next: { revalidate: 300 }` from MapTiler fallback fetch
- Added cache eviction logic when cache exceeds 100 entries

### Feature 2: GPX Import Feature
- Created `/api/import/gpx/route.ts` API endpoint
  - Accepts POST with FormData containing a .gpx file
  - Parses waypoints (wpt), tracks (trk), and routes (rte) using regex-based XML parsing
  - No external dependencies needed
  - Proper file type validation
- Added GPX Import UI to MapSidebar:
  - "Import GPX File" button in TOOLS tab (Import Data section)
  - "Import GPX Route" button in ROUTES tab
  - Hidden file input elements for file picker
  - Handler function imports waypoints as markers/saved locations with category mapping
  - Handler function imports tracks as routes with green color
  - Toast notifications showing import results
  - Helper functions: mapSymbolToCategory, getCategoryColor, getCategoryIcon

### Feature 3: Isochrone Visualization
- Created `/api/isochrone/route.ts` API endpoint
  - Accepts lat, lng, minutes (5-60), mode (walking/cycling/driving)
  - Generates concentric rings at 25%, 50%, 75%, 100% of max travel distance
  - Uses deterministic variation (sin-based) for natural-looking shapes
  - Returns GeoJSON Polygon geometry for each ring
  - Speed: walking 5km/h, cycling 15km/h, driving 40km/h
- Updated MapStore with isochrone state:
  - `isochroneEnabled`, `isochroneMinutes`, `isochroneMode` state fields
  - `setIsochroneEnabled`, `setIsochroneMinutes`, `setIsochroneMode` actions
  - Added to partialize config for persistence
- Added isochrone visualization in MapView.tsx:
  - Fetches isochrone data from API when enabled
  - Renders fill and line layers with color-coded rings (green→teal→cyan→blue)
  - Proper cleanup when disabled or on unmount
  - Re-fetches when center, minutes, or mode changes
- Added IsochroneControls component in MapSidebar:
  - Switch to enable/disable
  - Slider for travel time (5-60 minutes)
  - Mode buttons (Walking, Cycling, Driving) with icons and speed labels
  - Placed in TOOLS tab

## Files Modified
- `/home/z/my-project/src/app/api/poi/route.ts` - Cache optimization
- `/home/z/my-project/src/app/api/import/gpx/route.ts` - New file
- `/home/z/my-project/src/app/api/isochrone/route.ts` - New file
- `/home/z/my-project/src/lib/map-store.ts` - Isochrone state
- `/home/z/my-project/src/components/map/MapView.tsx` - Isochrone visualization
- `/home/z/my-project/src/components/map/MapSidebar.tsx` - GPX Import UI + Isochrone controls

## Status
All features implemented and passing lint checks. No compilation errors.
