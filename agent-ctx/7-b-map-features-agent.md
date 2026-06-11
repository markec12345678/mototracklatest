# Task 7-b: Measurement Distance Tooltip & Route Point Numbering

## Summary
Added two map visualization features to MapView.tsx:

1. **Measurement Distance Tooltip**: A symbol layer (`measure-distance-label`) that displays the total measured distance at the midpoint of measurement lines. Uses Haversine formula for distance calculation and formats output as km or meters. Syncs distance to the Zustand store via `setMeasureDistance()`.

2. **Route Point Numbering**: A symbol layer (`route-numbers`) that overlays sequence numbers on route point circles, using the existing `index` property on route point features.

## Files Modified
- `/home/z/my-project/src/components/map/MapView.tsx`

## Key Implementation Details
- Measure distance text appears on the middle point of measurement markers
- Distance formatting: `X.XX km` for ≥1km, `X m` for sub-kilometer
- Route numbers displayed in white 11px bold font over colored circle markers
- Both layers added with existence checks to avoid duplicate layer errors
- Store's `measureDistance` state is kept in sync for sidebar display
