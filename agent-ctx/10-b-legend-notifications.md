---
Task ID: 10-b
Agent: Legend & Notifications Agent
Task: Add Map Legend Component, Notification System, and Enhanced CoordinatesDisplay

Work Completed:

1. Map Store Enhancements (map-store.ts)
   - Added `MapNotification` interface with type, icon, message, timestamp fields
   - Added `notifications` array state to the store
   - Added `pushNotification()` action that prepends new notifications (max 10 stored)
   - Added `dismissNotification()` action to remove individual notifications
   - Notification types: style, location, route, drawing, measurement, weather, terrain, general

2. MapLegend Component (MapLegend.tsx - NEW)
   - Floating legend panel on the right side of the map (desktop only)
   - Toggle visibility with a book/info icon button with chevron indicator
   - When open, shows:
     - Current map style name, emoji, and provider
     - Active tool mode with icon and description
     - Active overlays (3D terrain, weather, clustering status - only when enabled)
     - Layer visibility status with Eye/EyeOff icons (on/off state for water, roads, buildings, parks, labels)
     - Mini color legend for markers (saved=blue, measure=amber, routes=cyan, drawings=green) with count badges
   - Uses `glass-card` CSS class for styling
   - Smooth framer-motion AnimatePresence for open/close animation
   - Reads state from `useMapStore`
   - Position: `absolute bottom-[220px] right-5 z-10` on desktop, hidden on mobile
   - Max height with scroll overflow for the content panel

3. MapNotifications Component (MapNotifications.tsx - NEW)
   - Toast-like notifications at top-right corner below top bar buttons
   - Positioned at `absolute top-[52px] right-3 z-10`
   - Shows transient notifications for:
     - Style changed (e.g., "Switched to Satellite view")
     - Location added (e.g., "Paris added to saved locations")
     - Location deleted (e.g., "Paris removed from saved locations")
     - Route saved (e.g., `Route "My Route" saved`)
     - Drawing saved ("Drawing saved")
     - Measurement completed (with distance value)
     - Weather data loaded / disabled
     - 3D terrain enabled / disabled
   - Each notification: colored icon + message, auto-dismisses after 3s
   - Slides in from right using framer-motion
   - Glass-card styling
   - Max 3 notifications visible at once (AnimatePresence with popLayout)
   - Color-coded by type (violet=style, blue=location, cyan=route, green=drawing, amber=measurement, sky=weather, orange=terrain)

4. Enhanced CoordinatesDisplay (CoordinatesDisplay.tsx)
   - Added UTM zone display: zone = Math.floor((lng + 180) / 6) + 1
   - Shows UTM zone number (e.g., "UTM 33") when zoom >= 10
   - UTM zone styled with amber color for visibility
   - Added "Copy as DMS" button with Crosshair icon
   - DMS format: degrees, minutes, seconds with N/S/E/W direction
   - Both copy buttons show green checkmark confirmation for 1.5s
   - Existing copy-as-decimal functionality preserved

5. Notification Integration (wired into existing components)
   - StyleSwitcher.tsx: pushes style notification on style change
   - AddLocationDialog.tsx: pushes location-added notification
   - MapSidebar.tsx: pushes location-deleted, route-saved, measurement-completed, weather-toggle, terrain-toggle notifications
   - MapView.tsx: pushes drawing-saved notification on mouseup

6. Page Integration (page.tsx)
   - Imported MapLegend and MapNotifications
   - MapNotifications placed at top-right below top bar (all screen sizes)
   - MapLegend placed at bottom-right above MiniMap (desktop only)

7. CSS Additions (globals.css)
   - Added notification-enter and notification-exit keyframe animations
   - Glass-card class already existed, reused for new components

Verification:
- Lint passes with zero errors/warnings
- Dev server running and responding with 200 status
- No compilation errors in dev.log
