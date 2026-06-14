'use client'

/**
 * MonitorPanelRegistry - Placeholder for monitoring panels
 * 
 * Monitoring panels are currently disabled to prevent OOM during compilation.
 * The core map features work fine with the 5 main panel groups.
 * 
 * To add monitoring panels back:
 * 1. Use `next/dynamic` with `ssr: false` for each panel
 * 2. Only render the dynamic component when the store state is open
 * 3. Add them gradually to avoid OOM
 * 
 * The toolbar buttons for monitoring panels still exist and update store state.
 * When we have enough memory or use production builds, panels will auto-render.
 */

export function MonitorPanelRegistry() {
  // Monitoring panels are disabled to prevent OOM during dev server compilation
  // They will be re-enabled once we optimize the compilation or use production builds
  return null
}
