'use client'

import { useMapStore } from '@/lib/map-store'
import { LazyPanel } from '@/components/LazyPanel'

export function MapOverlayPanels() {
  // Read store state to determine which overlay components should load
  const drawingTool = useMapStore((s) => s.drawingTool)
  const comparisonEnabled = useMapStore((s) => s.comparisonEnabled)
  const sunPositionEnabled = useMapStore((s) => s.sunPositionEnabled)
  const heatmapEnabled = useMapStore((s) => s.heatmapEnabled)
  const sidebarOpen = useMapStore((s) => s.sidebarOpen)
  const buildings3DEnabled = useMapStore((s) => s.buildings3DEnabled)
  const voiceNavigationEnabled = useMapStore((s) => s.voiceNavigationEnabled)
  const collaborationOpen = useMapStore((s) => s.collaborationOpen)
  const miniMapEnabled = useMapStore((s) => s.miniMapEnabled)
  const legendOpen = useMapStore((s) => s.legendOpen)
  const annotations = useMapStore((s) => s.annotations)
  const gpsSimulation = useMapStore((s) => s.gpsSimulation)
  const batchOperation = useMapStore((s) => s.batchOperation)
  const noiseHeatmap = useMapStore((s) => s.noiseHeatmap)
  const comparisonSlider = useMapStore((s) => s.comparisonSlider)

  // Derive boolean conditions for each overlay
  const drawingEnabled = drawingTool !== 'none'
  const annotationsVisible = annotations.length > 0
  const gpsSimulatorActive = gpsSimulation.active
  const batchModeActive = batchOperation.isSelectMode
  const noiseHeatmapEnabled = noiseHeatmap.enabled
  const comparisonSliderEnabled = comparisonSlider.enabled

  return (
    <>
      {/* Core overlays - always loaded (lightweight indicators) */}
      <LazyPanel
        importFn={() => import('@/components/map/OfflineIndicator')}
        exportName="OfflineIndicator"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/CompassIndicator')}
        exportName="CompassIndicator"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/CustomCompassRose')}
        exportName="CustomCompassRose"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/MapNotifications')}
        exportName="MapNotifications"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/PWAInstallBanner')}
        exportName="PWAInstallBanner"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/CoordinateGridOverlay')}
        exportName="CoordinateGridOverlay"
        shouldLoad={true}
      />
      <LazyPanel
        importFn={() => import('@/components/map/BuildingInfoPanel')}
        exportName="BuildingInfoPanel"
        shouldLoad={true}
      />

      {/* Conditional overlays - only loaded when their feature is active */}
      {drawingEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/DrawingLayer')}
          exportName="DrawingLayer"
          shouldLoad={drawingEnabled}
        />
      )}
      {drawingEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/BufferZoneLayer')}
          exportName="BufferZoneLayer"
          shouldLoad={drawingEnabled}
        />
      )}
      {collaborationOpen && (
        <LazyPanel
          importFn={() => import('@/components/map/CollaboratorCursors')}
          exportName="CollaboratorCursors"
          shouldLoad={collaborationOpen}
        />
      )}
      {sunPositionEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/SunPositionOverlay')}
          exportName="SunPositionOverlay"
          shouldLoad={sunPositionEnabled}
        />
      )}
      {heatmapEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/HeatmapLayer')}
          exportName="HeatmapLayer"
          shouldLoad={heatmapEnabled}
        />
      )}
      {annotationsVisible && (
        <LazyPanel
          importFn={() => import('@/components/map/MapAnnotationsLayer')}
          exportName="MapAnnotationsLayer"
          shouldLoad={annotationsVisible}
        />
      )}
      {comparisonEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/MapComparison')}
          exportName="MapComparison"
          shouldLoad={comparisonEnabled}
        />
      )}
      {sidebarOpen && (
        <LazyPanel
          importFn={() => import('@/components/map/MapSidebar')}
          exportName="MapSidebar"
          shouldLoad={sidebarOpen}
        />
      )}
      {voiceNavigationEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/VoiceNavigator')}
          exportName="VoiceNavigator"
          shouldLoad={voiceNavigationEnabled}
        />
      )}
      {buildings3DEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/Buildings3DLayer')}
          exportName="Buildings3DLayer"
          shouldLoad={buildings3DEnabled}
        />
      )}
      {gpsSimulatorActive && (
        <LazyPanel
          importFn={() => import('@/components/map/GPSSimulator')}
          exportName="GPSSimulator"
          shouldLoad={gpsSimulatorActive}
        />
      )}
      <LazyPanel
        importFn={() => import('@/components/map/MapNotes')}
        exportName="MapNotesLayer"
        shouldLoad={true}
      />
      {batchModeActive && (
        <LazyPanel
          importFn={() => import('@/components/map/BatchOperations')}
          exportName="BatchActionBar"
          shouldLoad={batchModeActive}
        />
      )}
      {heatmapEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/POIDensityHeatmap')}
          exportName="POIDensityHeatmap"
          shouldLoad={heatmapEnabled}
        />
      )}
      {comparisonSliderEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/MapComparisonSlider')}
          exportName="MapComparisonSlider"
          shouldLoad={comparisonSliderEnabled}
        />
      )}
      {noiseHeatmapEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/NoiseHeatmapOverlay')}
          exportName="NoiseHeatmapOverlay"
          shouldLoad={noiseHeatmapEnabled}
        />
      )}
      {miniMapEnabled && (
        <LazyPanel
          importFn={() => import('@/components/map/MiniMap')}
          exportName="MiniMap"
          shouldLoad={miniMapEnabled}
        />
      )}
      {legendOpen && (
        <LazyPanel
          importFn={() => import('@/components/map/MapLegend')}
          exportName="MapLegend"
          shouldLoad={legendOpen}
        />
      )}
    </>
  )
}
