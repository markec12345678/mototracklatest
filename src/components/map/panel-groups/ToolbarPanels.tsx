'use client'

import { useMapStore } from '@/lib/map-store'
import { LazyPanel } from '@/components/LazyPanel'

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
      {/* Tool toolbar - left side (desktop only) - always loaded */}
      <div className="hidden md:block absolute left-4 z-10 transition-all duration-300" style={{ top: '80px' }}>
        <LazyPanel
          importFn={() => import('@/components/map/MapToolbar')}
          exportName="MapToolbar"
          shouldLoad={true}
          props={{ aiSuggestionsOpen, setAiSuggestionsOpen }}
        />
      </div>

      {/* Drawing Toolbar - appears when draw tool is active - always loaded */}
      <LazyPanel
        importFn={() => import('@/components/map/DrawingToolbar')}
        exportName="DrawingToolbar"
        shouldLoad={true}
      />

      {/* AI Suggestions Panel - left side below toolbar (desktop only) */}
      {aiSuggestionsOpen && (
        <div className="hidden md:block absolute z-10" style={{ left: '80px', top: '80px' }}>
          <LazyPanel
            importFn={() => import('@/components/map/AISuggestionsPanel')}
            exportName="AISuggestionsPanel"
            shouldLoad={aiSuggestionsOpen}
          />
        </div>
      )}

      {/* Route Analytics Panel - left side below AI suggestions (desktop only) - always loaded */}
      <div className="hidden md:block absolute z-10" style={{ left: aiSuggestionsOpen ? '400px' : '80px', top: '80px', transition: 'left 0.3s ease-in-out' }}>
        <LazyPanel
          importFn={() => import('@/components/map/RouteAnalyticsPanel')}
          exportName="RouteAnalyticsPanel"
          shouldLoad={true}
        />
      </div>

      {/* Route Comparison Panel - right side below search bar (desktop only) */}
      {comparedRoutes.length > 0 && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <LazyPanel
            importFn={() => import('@/components/map/RouteComparisonPanel')}
            exportName="RouteComparisonPanel"
            shouldLoad={comparedRoutes.length > 0}
          />
        </div>
      )}

      {/* Terrain Analysis Panel - right side below comparison (desktop only) */}
      {terrainAnalysisRouteId && (
        <div className="hidden md:block absolute z-10" style={{ right: comparedRoutes.length > 0 ? '560px' : '20px', top: '80px', transition: 'right 0.3s ease-in-out' }}>
          <LazyPanel
            importFn={() => import('@/components/map/TerrainAnalysisPanel')}
            exportName="TerrainAnalysisPanel"
            shouldLoad={!!terrainAnalysisRouteId}
          />
        </div>
      )}

      {/* Accessibility Panel - right side (desktop only) */}
      {accessibilityPanelOpen && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <LazyPanel
            importFn={() => import('@/components/map/AccessibilityPanel')}
            exportName="AccessibilityPanel"
            shouldLoad={accessibilityPanelOpen}
          />
        </div>
      )}

      {/* Quick Jump Panel - left side below toolbar (desktop only) - always loaded */}
      <div className="hidden md:block absolute z-10 transition-all duration-300" style={{ left: sidebarOpen ? '332px' : '16px', top: '140px' }}>
        <LazyPanel
          importFn={() => import('@/components/map/QuickJumpPanel')}
          exportName="QuickJumpPanel"
          shouldLoad={true}
          props={{ onOpenBookmarkManager: () => setBookmarkManagerOpen(true) }}
        />
      </div>

      {/* Map Stats Panel - right side above footer (desktop only) - always loaded */}
      <div className="hidden md:block absolute bottom-12 right-5 z-10">
        <LazyPanel
          importFn={() => import('@/components/map/MapStatsPanel')}
          exportName="MapStatsPanel"
          shouldLoad={true}
        />
      </div>

      {/* Weather Panel - left side above footer (desktop only) - always loaded */}
      <div className="hidden md:block absolute bottom-12 z-10" style={{ left: sidebarOpen ? '332px' : '20px', transition: 'left 0.3s ease-in-out' }}>
        <LazyPanel
          importFn={() => import('@/components/map/WeatherPanel')}
          exportName="WeatherPanel"
          shouldLoad={true}
        />
      </div>

      {/* Elevation Profile Panel - always loaded */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) && weatherEnabled ? '260px' : '12px',
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <LazyPanel
          importFn={() => import('@/components/map/ElevationProfile')}
          exportName="ElevationProfile"
          shouldLoad={true}
        />
      </div>

      {/* Heatmap Controls - bottom-left above coordinates (desktop only) - always loaded */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) ? (weatherEnabled ? '360px' : '120px') : (weatherEnabled ? '260px' : '12px'),
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <LazyPanel
          importFn={() => import('@/components/map/HeatmapControls')}
          exportName="HeatmapControls"
          shouldLoad={true}
        />
      </div>

      {/* Sun Info Panel - right side above map stats (desktop only) - always loaded */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          right: '20px',
          bottom: sunPositionEnabled ? '100px' : '12px',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        <LazyPanel
          importFn={() => import('@/components/map/SunInfoPanel')}
          exportName="SunInfoPanel"
          shouldLoad={true}
        />
      </div>

      {/* Sun Info Panel - mobile version, bottom-left - always loaded */}
      <div className="md:hidden absolute bottom-20 left-3 z-10">
        <LazyPanel
          importFn={() => import('@/components/map/SunInfoPanel')}
          exportName="SunInfoPanel"
          shouldLoad={true}
        />
      </div>
    </>
  )
}
