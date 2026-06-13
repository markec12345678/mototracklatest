'use client'

import { DrawingLayer } from '@/components/map/DrawingLayer'
import { BufferZoneLayer } from '@/components/map/BufferZoneLayer'
import { CollaboratorCursors } from '@/components/map/CollaboratorCursors'
import { SunPositionOverlay } from '@/components/map/SunPositionOverlay'
import { HeatmapLayer } from '@/components/map/HeatmapLayer'
import { MapAnnotationsLayer } from '@/components/map/MapAnnotationsLayer'
import { MapComparison } from '@/components/map/MapComparison'
import { MapSidebar } from '@/components/map/MapSidebar'
import { MapNotifications } from '@/components/map/MapNotifications'
import { VoiceNavigator } from '@/components/map/VoiceNavigator'
import { OfflineIndicator } from '@/components/map/OfflineIndicator'
import { CompassIndicator } from '@/components/map/CompassIndicator'
import { CustomCompassRose } from '@/components/map/CustomCompassRose'
import { CoordinateGridOverlay } from '@/components/map/CoordinateGridOverlay'
import { Buildings3DLayer } from '@/components/map/Buildings3DLayer'
import { BuildingInfoPanel } from '@/components/map/BuildingInfoPanel'
import { GPSSimulator } from '@/components/map/GPSSimulator'
import { MapNotesLayer } from '@/components/map/MapNotes'
import { BatchActionBar } from '@/components/map/BatchOperations'
import { POIDensityHeatmap } from '@/components/map/POIDensityHeatmap'
import { MapComparisonSlider } from '@/components/map/MapComparisonSlider'
import { NoiseHeatmapOverlay } from '@/components/map/NoiseHeatmapOverlay'
import { PWAInstallBanner } from '@/components/map/PWAInstallBanner'
import { MiniMap } from '@/components/map/MiniMap'
import { MapLegend } from '@/components/map/MapLegend'

export function MapOverlayPanels() {
  return (
    <>
      <DrawingLayer />
      <BufferZoneLayer />
      <CollaboratorCursors />
      <SunPositionOverlay />
      <HeatmapLayer />
      <MapAnnotationsLayer />
      <MapComparison />
      <MapSidebar />
      <MapNotifications />
      <VoiceNavigator />
      <OfflineIndicator />
      <CompassIndicator />
      <CustomCompassRose />
      <CoordinateGridOverlay />
      <Buildings3DLayer />
      <BuildingInfoPanel />
      <GPSSimulator />
      <MapNotesLayer />
      <BatchActionBar />
      <POIDensityHeatmap />
      <MapComparisonSlider />
      <NoiseHeatmapOverlay />
      <PWAInstallBanner />
      <MiniMap />
      <MapLegend />
    </>
  )
}
