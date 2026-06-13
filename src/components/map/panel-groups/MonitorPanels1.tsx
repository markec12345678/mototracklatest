'use client'

import { MultiStopRoutePlanner } from '@/components/map/MultiStopRoutePlanner'
import { EnhancedWeatherDashboard } from '@/components/map/EnhancedWeatherDashboard'
import { SunShadowCalculator } from '@/components/map/SunShadowCalculator'
import { SVGMarkerDesigner } from '@/components/map/SVGMarkerDesigner'
import { MapLabelsOverlay } from '@/components/map/MapLabelsOverlay'
import { ContourGenerator } from '@/components/map/ContourGenerator'
import { LocationClusterMap } from '@/components/map/LocationClusterMap'
import { MapStoryCreator } from '@/components/map/MapStoryCreator'
import { TerrainProfile3D } from '@/components/map/TerrainProfile3D'
import { DataImportExport } from '@/components/map/DataImportExport'
import { AdvancedMarkerManager } from '@/components/map/AdvancedMarkerManager'
import { GeofenceAlertHistory } from '@/components/map/GeofenceAlertHistory'
import { MapOverlayGallery } from '@/components/map/MapOverlayGallery'
import { LocationVisitTimeline } from '@/components/map/LocationVisitTimeline'
import { WeatherComparison } from '@/components/map/WeatherComparison'
import { MeasurementSuite } from '@/components/map/MeasurementSuite'
import { TrailFinder } from '@/components/map/TrailFinder'
import { MapTimeline } from '@/components/map/MapTimeline'
import { MapAnalyticsDashboard } from '@/components/map/MapAnalyticsDashboard'
import { AirQualityPanel } from '@/components/map/AirQualityPanel'
import { TrackStatsPanel } from '@/components/map/TrackStatsPanel'
import { PedometerWidget } from '@/components/map/PedometerWidget'
import { MapUsageStats } from '@/components/map/MapUsageStats'
import { ScreenshotManager } from '@/components/map/ScreenshotManager'
import { RouteDifficultyAnalyzer } from '@/components/map/RouteDifficultyAnalyzer'
import { MapCollageCreator } from '@/components/map/MapCollageCreator'
import { NearbyEventsFinder } from '@/components/map/NearbyEventsFinder'
import { CoordinateShareCard } from '@/components/map/CoordinateShareCard'

export function MonitorPanels1() {
  return (
    <>
      <MultiStopRoutePlanner />
      <EnhancedWeatherDashboard />
      <SunShadowCalculator />
      <SVGMarkerDesigner />
      <MapLabelsOverlay />
      <ContourGenerator />
      <LocationClusterMap />
      <MapStoryCreator />
      <TerrainProfile3D />
      <DataImportExport />
      <AdvancedMarkerManager />
      <GeofenceAlertHistory />
      <MapOverlayGallery />
      <LocationVisitTimeline />
      <WeatherComparison />
      <MeasurementSuite />
      <TrailFinder />
      <MapTimeline />
      <MapAnalyticsDashboard />
      <AirQualityPanel />
      <TrackStatsPanel />
      <PedometerWidget />
      <MapUsageStats />
      <ScreenshotManager />
      <RouteDifficultyAnalyzer />
      <MapCollageCreator />
      <NearbyEventsFinder />
      <CoordinateShareCard />
    </>
  )
}
