'use client'

import dynamic from 'next/dynamic'

const SmartRoutePlanner = dynamic(() => import('@/components/map/SmartRoutePlanner').then((m) => ({ default: m.SmartRoutePlanner })), { ssr: false })
const EmergencyRoutePlanner = dynamic(() => import('@/components/map/EmergencyRoutePlanner').then((m) => ({ default: m.EmergencyRoutePlanner })), { ssr: false })
const MultiStopRoutePlanner = dynamic(() => import('@/components/map/MultiStopRoutePlanner').then((m) => ({ default: m.MultiStopRoutePlanner })), { ssr: false })
const MaritimeNavigation = dynamic(() => import('@/components/map/MaritimeNavigation').then((m) => ({ default: m.MaritimeNavigation })), { ssr: false })
const AirspaceNavigator = dynamic(() => import('@/components/map/AirspaceNavigator').then((m) => ({ default: m.AirspaceNavigator })), { ssr: false })
const WaypointOptimizer = dynamic(() => import('@/components/map/WaypointOptimizer').then((m) => ({ default: m.WaypointOptimizer })), { ssr: false })
const RouteComparisonPanel = dynamic(() => import('@/components/map/RouteComparisonPanel').then((m) => ({ default: m.RouteComparisonPanel })), { ssr: false })
const RouteSharingDialog = dynamic(() => import('@/components/map/RouteSharingDialog').then((m) => ({ default: m.RouteSharingDialog })), { ssr: false })
const RoutePlayback = dynamic(() => import('@/components/map/RoutePlayback').then((m) => ({ default: m.RoutePlayback })), { ssr: false })
const RouteDifficultyAnalyzer = dynamic(() => import('@/components/map/RouteDifficultyAnalyzer').then((m) => ({ default: m.RouteDifficultyAnalyzer })), { ssr: false })
const WindPatternAnalyzer = dynamic(() => import('@/components/map/WindPatternAnalyzer').then((m) => ({ default: m.WindPatternAnalyzer })), { ssr: false })
const WindFarmOptimizer = dynamic(() => import('@/components/map/WindFarmOptimizer').then((m) => ({ default: m.WindFarmOptimizer })), { ssr: false })
const GPSSimulator = dynamic(() => import('@/components/map/GPSSimulator').then((m) => ({ default: m.GPSSimulator })), { ssr: false })
const TrackRecorder = dynamic(() => import('@/components/map/TrackRecorder').then((m) => ({ default: m.TrackRecorder })), { ssr: false })
const TrailFinder = dynamic(() => import('@/components/map/TrailFinder').then((m) => ({ default: m.TrailFinder })), { ssr: false })
const PedometerWidget = dynamic(() => import('@/components/map/PedometerWidget').then((m) => ({ default: m.PedometerWidget })), { ssr: false })
const SpeedAlertSystem = dynamic(() => import('@/components/map/SpeedAlertSystem').then((m) => ({ default: m.SpeedAlertSystem })), { ssr: false })
const AltitudeAlertSystem = dynamic(() => import('@/components/map/AltitudeAlertSystem').then((m) => ({ default: m.AltitudeAlertSystem })), { ssr: false })
const GeocachingToolkit = dynamic(() => import('@/components/map/GeocachingToolkit').then((m) => ({ default: m.GeocachingToolkit })), { ssr: false })

export function GroupK() {
  return (
    <>
      <SmartRoutePlanner />
      <EmergencyRoutePlanner />
      <MultiStopRoutePlanner />
      <MaritimeNavigation />
      <AirspaceNavigator />
      <WaypointOptimizer />
      <RouteComparisonPanel />
      <RouteSharingDialog />
      <RoutePlayback />
      <RouteDifficultyAnalyzer />
      <WindPatternAnalyzer />
      <WindFarmOptimizer />
      <GPSSimulator />
      <TrackRecorder />
      <TrailFinder />
      <PedometerWidget />
      <SpeedAlertSystem />
      <AltitudeAlertSystem />
      <GeocachingToolkit />
    </>
  )
}
