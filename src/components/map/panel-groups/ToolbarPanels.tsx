'use client'

import { useMapStore } from '@/lib/map-store'
import { MapToolbar } from '@/components/map/MapToolbar'
import { DrawingToolbar } from '@/components/map/DrawingToolbar'
import { AISuggestionsPanel } from '@/components/map/AISuggestionsPanel'
import { RouteAnalyticsPanel } from '@/components/map/RouteAnalyticsPanel'
import { RouteComparisonPanel } from '@/components/map/RouteComparisonPanel'
import { TerrainAnalysisPanel } from '@/components/map/TerrainAnalysisPanel'
import { AccessibilityPanel } from '@/components/map/AccessibilityPanel'
import { QuickJumpPanel } from '@/components/map/QuickJumpPanel'
import { MapStatsPanel } from '@/components/map/MapStatsPanel'
import { WeatherPanel } from '@/components/map/WeatherPanel'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { HeatmapControls } from '@/components/map/HeatmapControls'
import { SunInfoPanel } from '@/components/map/SunInfoPanel'

export function ToolbarPanels() {
  const aiSuggestionsOpen = useMapStore((s) => s.aiSuggestionsOpen)
  const setAiSuggestionsOpen = useMapStore((s) => s.setAiSuggestionsOpen)
  const comparedRoutes = useMapStore((s) => s.comparedRoutes)
  const terrainAnalysisRouteId = useMapStore((s) => s.terrainAnalysisRouteId)
  const accessibilityPanelOpen = useMapStore((s) => s.accessibilityPanelOpen)
  const sidebarOpen = useMapStore((s) => s.sidebarOpen)
  const toolMode = useMapStore((s) => s.toolMode)
  const elevationRouteId = useMapStore((s) => s.elevationRouteId)
  const weatherEnabled = useMapStore((s) => s.weatherEnabled)
  const sunPositionEnabled = useMapStore((s) => s.sunPositionEnabled)
  const setBookmarkManagerOpen = useMapStore((s) => s.setBookmarkManagerOpen)

  return (
    <>
      {/* Tool toolbar - left side (desktop only) */}
      <div className="hidden md:block absolute left-4 z-10 transition-all duration-300" style={{ top: '80px' }}>
        <MapToolbar aiSuggestionsOpen={aiSuggestionsOpen} setAiSuggestionsOpen={setAiSuggestionsOpen} />
      </div>

      {/* Drawing Toolbar - appears when draw tool is active */}
      <DrawingToolbar />

      {/* AI Suggestions Panel - left side below toolbar (desktop only) */}
      {aiSuggestionsOpen && (
        <div className="hidden md:block absolute z-10" style={{ left: '80px', top: '80px' }}>
          <AISuggestionsPanel />
        </div>
      )}

      {/* Route Analytics Panel - left side below AI suggestions (desktop only) */}
      <div className="hidden md:block absolute z-10" style={{ left: aiSuggestionsOpen ? '400px' : '80px', top: '80px', transition: 'left 0.3s ease-in-out' }}>
        <RouteAnalyticsPanel />
      </div>

      {/* Route Comparison Panel - right side below search bar (desktop only) */}
      {comparedRoutes.length > 0 && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <RouteComparisonPanel />
        </div>
      )}

      {/* Terrain Analysis Panel - right side below comparison (desktop only) */}
      {terrainAnalysisRouteId && (
        <div className="hidden md:block absolute z-10" style={{ right: comparedRoutes.length > 0 ? '560px' : '20px', top: '80px', transition: 'right 0.3s ease-in-out' }}>
          <TerrainAnalysisPanel />
        </div>
      )}

      {/* Accessibility Panel - right side (desktop only) */}
      {accessibilityPanelOpen && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <AccessibilityPanel />
        </div>
      )}

      {/* Quick Jump Panel - left side below toolbar (desktop only) */}
      <div className="hidden md:block absolute z-10 transition-all duration-300" style={{ left: sidebarOpen ? '332px' : '16px', top: '140px' }}>
        <QuickJumpPanel onOpenBookmarkManager={() => setBookmarkManagerOpen(true)} />
      </div>

      {/* Map Stats Panel - right side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 right-5 z-10">
        <MapStatsPanel />
      </div>

      {/* Weather Panel - left side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 z-10" style={{ left: sidebarOpen ? '332px' : '20px', transition: 'left 0.3s ease-in-out' }}>
        <WeatherPanel />
      </div>

      {/* Elevation Profile Panel - above weather panel when measuring, routing, or viewing route elevation (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) && weatherEnabled ? '260px' : '12px',
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <ElevationProfile />
      </div>

      {/* Heatmap Controls - bottom-left above coordinates (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) ? (weatherEnabled ? '360px' : '120px') : (weatherEnabled ? '260px' : '12px'),
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <HeatmapControls />
      </div>

      {/* Sun Info Panel - right side above map stats (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          right: '20px',
          bottom: sunPositionEnabled ? '100px' : '12px',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        <SunInfoPanel />
      </div>

      {/* Sun Info Panel - mobile version, bottom-left */}
      <div className="md:hidden absolute bottom-20 left-3 z-10">
        <SunInfoPanel />
      </div>
    </>
  )
}
