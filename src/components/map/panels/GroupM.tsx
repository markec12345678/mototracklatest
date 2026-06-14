'use client'

import dynamic from 'next/dynamic'

const MapDataVisualizer = dynamic(() => import('@/components/map/MapDataVisualizer').then((m) => ({ default: m.MapDataVisualizer })), { ssr: false })
const FieldSurveyTool = dynamic(() => import('@/components/map/FieldSurveyTool').then((m) => ({ default: m.FieldSurveyTool })), { ssr: false })
const MapComparisonSlider = dynamic(() => import('@/components/map/MapComparisonSlider').then((m) => ({ default: m.MapComparisonSlider })), { ssr: false })
const MapTimeline = dynamic(() => import('@/components/map/MapTimeline').then((m) => ({ default: m.MapTimeline })), { ssr: false })
const MapAnalyticsDashboard = dynamic(() => import('@/components/map/MapAnalyticsDashboard').then((m) => ({ default: m.MapAnalyticsDashboard })), { ssr: false })
const POIDensityHeatmap = dynamic(() => import('@/components/map/POIDensityHeatmap').then((m) => ({ default: m.POIDensityHeatmap })), { ssr: false })
const CoordinateShareCard = dynamic(() => import('@/components/map/CoordinateShareCard').then((m) => ({ default: m.CoordinateShareCard })), { ssr: false })
const MapWallpaperGenerator = dynamic(() => import('@/components/map/MapWallpaperGenerator').then((m) => ({ default: m.MapWallpaperGenerator })), { ssr: false })
const MapAnimationStudio = dynamic(() => import('@/components/map/MapAnimationStudio').then((m) => ({ default: m.MapAnimationStudio })), { ssr: false })
const TrackStatsPanel = dynamic(() => import('@/components/map/TrackStatsPanel').then((m) => ({ default: m.TrackStatsPanel })), { ssr: false })
const AISuggestionsPanel = dynamic(() => import('@/components/map/AISuggestionsPanel').then((m) => ({ default: m.AISuggestionsPanel })), { ssr: false })
const MapChatAssistant = dynamic(() => import('@/components/map/MapChatAssistant').then((m) => ({ default: m.MapChatAssistant })), { ssr: false })
const ScreenshotManager = dynamic(() => import('@/components/map/ScreenshotManager').then((m) => ({ default: m.ScreenshotManager })), { ssr: false })
const MapCollageCreator = dynamic(() => import('@/components/map/MapCollageCreator').then((m) => ({ default: m.MapCollageCreator })), { ssr: false })
const NearbyEventsFinder = dynamic(() => import('@/components/map/NearbyEventsFinder').then((m) => ({ default: m.NearbyEventsFinder })), { ssr: false })
const SVGMarkerDesigner = dynamic(() => import('@/components/map/SVGMarkerDesigner').then((m) => ({ default: m.SVGMarkerDesigner })), { ssr: false })
const MapStyleForge = dynamic(() => import('@/components/map/MapStyleForge').then((m) => ({ default: m.MapStyleForge })), { ssr: false })
const MeasurementSuite = dynamic(() => import('@/components/map/MeasurementSuite').then((m) => ({ default: m.MeasurementSuite })), { ssr: false })
const GeofenceAlertHistory = dynamic(() => import('@/components/map/GeofenceAlertHistory').then((m) => ({ default: m.GeofenceAlertHistory })), { ssr: false })
const LocationVisitTimeline = dynamic(() => import('@/components/map/LocationVisitTimeline').then((m) => ({ default: m.LocationVisitTimeline })), { ssr: false })

export function GroupM() {
  return (
    <>
      <MapDataVisualizer />
      <FieldSurveyTool />
      <MapComparisonSlider />
      <MapTimeline />
      <MapAnalyticsDashboard />
      <POIDensityHeatmap />
      <CoordinateShareCard />
      <MapWallpaperGenerator />
      <MapAnimationStudio />
      <TrackStatsPanel />
      <AISuggestionsPanel />
      <MapChatAssistant />
      <ScreenshotManager />
      <MapCollageCreator />
      <NearbyEventsFinder />
      <SVGMarkerDesigner />
      <MapStyleForge />
      <MeasurementSuite />
      <GeofenceAlertHistory />
      <LocationVisitTimeline />
    </>
  )
}
