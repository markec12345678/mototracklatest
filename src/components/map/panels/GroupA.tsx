'use client'

import dynamic from 'next/dynamic'

const WeatherPanel = dynamic(() => import('@/components/map/WeatherPanel').then((m) => ({ default: m.WeatherPanel })), { ssr: false })
const ElevationProfile = dynamic(() => import('@/components/map/ElevationProfile').then((m) => ({ default: m.ElevationProfile })), { ssr: false })
const SunPositionOverlay = dynamic(() => import('@/components/map/SunPositionOverlay').then((m) => ({ default: m.SunPositionOverlay })), { ssr: false })
const SunInfoPanel = dynamic(() => import('@/components/map/SunInfoPanel').then((m) => ({ default: m.SunInfoPanel })), { ssr: false })
const HeatmapLayer = dynamic(() => import('@/components/map/HeatmapLayer').then((m) => ({ default: m.HeatmapLayer })), { ssr: false })
const HeatmapControls = dynamic(() => import('@/components/map/HeatmapControls').then((m) => ({ default: m.HeatmapControls })), { ssr: false })
const MapComparison = dynamic(() => import('@/components/map/MapComparison').then((m) => ({ default: m.MapComparison })), { ssr: false })
const WeatherComparison = dynamic(() => import('@/components/map/WeatherComparison').then((m) => ({ default: m.WeatherComparison })), { ssr: false })
const EnhancedWeatherDashboard = dynamic(() => import('@/components/map/EnhancedWeatherDashboard').then((m) => ({ default: m.EnhancedWeatherDashboard })), { ssr: false })
const SunShadowCalculator = dynamic(() => import('@/components/map/SunShadowCalculator').then((m) => ({ default: m.SunShadowCalculator })), { ssr: false })
const CloudCoverAnalyzer = dynamic(() => import('@/components/map/CloudCoverAnalyzer').then((m) => ({ default: m.CloudCoverAnalyzer })), { ssr: false })
const AtmosphericDashboard = dynamic(() => import('@/components/map/AtmosphericDashboard').then((m) => ({ default: m.AtmosphericDashboard })), { ssr: false })
const AtmosphericRiverTracker = dynamic(() => import('@/components/map/AtmosphericRiverTracker').then((m) => ({ default: m.AtmosphericRiverTracker })), { ssr: false })
const AirQualityPanel = dynamic(() => import('@/components/map/AirQualityPanel').then((m) => ({ default: m.AirQualityPanel })), { ssr: false })
const AirQualityForecaster = dynamic(() => import('@/components/map/AirQualityForecaster').then((m) => ({ default: m.AirQualityForecaster })), { ssr: false })
const AirQualityMonitor = dynamic(() => import('@/components/map/AirQualityMonitor').then((m) => ({ default: m.AirQualityMonitor })), { ssr: false })
const PrecipitationAnalyzer = dynamic(() => import('@/components/map/PrecipitationAnalyzer').then((m) => ({ default: m.PrecipitationAnalyzer })), { ssr: false })
const RainfallPatternAnalyzer = dynamic(() => import('@/components/map/RainfallPatternAnalyzer').then((m) => ({ default: m.RainfallPatternAnalyzer })), { ssr: false })
const StratosphericWindMonitor = dynamic(() => import('@/components/map/StratosphericWindMonitor').then((m) => ({ default: m.StratosphericWindMonitor })), { ssr: false })
const FogDensityMapper = dynamic(() => import('@/components/map/FogDensityMapper').then((m) => ({ default: m.FogDensityMapper })), { ssr: false })

export function GroupA() {
  return (
    <>
      <WeatherPanel />
      <ElevationProfile />
      <SunPositionOverlay />
      <SunInfoPanel />
      <HeatmapLayer />
      <HeatmapControls />
      <MapComparison />
      <WeatherComparison />
      <EnhancedWeatherDashboard />
      <SunShadowCalculator />
      <CloudCoverAnalyzer />
      <AtmosphericDashboard />
      <AtmosphericRiverTracker />
      <AirQualityPanel />
      <AirQualityForecaster />
      <AirQualityMonitor />
      <PrecipitationAnalyzer />
      <RainfallPatternAnalyzer />
      <StratosphericWindMonitor />
      <FogDensityMapper />
    </>
  )
}
