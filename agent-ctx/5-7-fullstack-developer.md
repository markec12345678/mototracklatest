# Task 5-7: POI Map Markers + Tile Loading Indicator + Route Elevation

## Summary
Implemented three features for the MapLibre GL Explorer project:

### Feature 1: POI Map Markers (Task 5)
- Added `POIMarker` interface to `src/lib/map-store.ts`
- Added `poiMarkers` state, `setPoiMarkers`, and `clearPoiMarkers` actions (not persisted)
- Updated `NearbyPanel.tsx` to set POI markers after fetching and clear on unmount/close
- Added POI marker rendering `useEffect` in `MapView.tsx` with green circle + emoji style

### Feature 2: Tile Loading Indicator (Task 6)
- Added `tilesLoading` state in `MapView.tsx`
- Added `dataloading`/`idle` event listeners on the map
- Rendered subtle animated loading bar at top of map

### Feature 3: Route Elevation Profile (Task 7)
- Updated `ElevationProfile.tsx` to support `routePoints` in directions mode
- Changed visibility condition to include directions mode
- Updated `page.tsx` elevation panel positioning for both measure and directions

## Files Modified
- `src/lib/map-store.ts` - POIMarker interface, state, actions
- `src/components/map/NearbyPanel.tsx` - POI marker sync
- `src/components/map/MapView.tsx` - POI markers, tile loading indicator
- `src/components/map/ElevationProfile.tsx` - directions mode support
- `src/app/page.tsx` - elevation panel positioning
- `src/app/globals.css` - CSS animations

## Status
All features implemented and lint clean.
