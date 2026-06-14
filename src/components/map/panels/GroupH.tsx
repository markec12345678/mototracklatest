'use client'

import dynamic from 'next/dynamic'

const SpaceWeatherMonitor = dynamic(() => import('@/components/map/SpaceWeatherMonitor').then((m) => ({ default: m.SpaceWeatherMonitor })), { ssr: false })
const SpaceDebrisTracker = dynamic(() => import('@/components/map/SpaceDebrisTracker').then((m) => ({ default: m.SpaceDebrisTracker })), { ssr: false })
const SpaceTrackViewer = dynamic(() => import('@/components/map/SpaceTrackViewer').then((m) => ({ default: m.SpaceTrackViewer })), { ssr: false })
const SolarFlareMonitor = dynamic(() => import('@/components/map/SolarFlareMonitor').then((m) => ({ default: m.SolarFlareMonitor })), { ssr: false })
const SolarPowerPlanner = dynamic(() => import('@/components/map/SolarPowerPlanner').then((m) => ({ default: m.SolarPowerPlanner })), { ssr: false })
const SolarExposureAnalyzer = dynamic(() => import('@/components/map/SolarExposureAnalyzer').then((m) => ({ default: m.SolarExposureAnalyzer })), { ssr: false })
const SolarIrradianceMapper = dynamic(() => import('@/components/map/SolarIrradianceMapper').then((m) => ({ default: m.SolarIrradianceMapper })), { ssr: false })
const SolarWindMonitor = dynamic(() => import('@/components/map/SolarWindMonitor').then((m) => ({ default: m.SolarWindMonitor })), { ssr: false })
const SpaceWeatherAlertPanel = dynamic(() => import('@/components/map/SpaceWeatherAlertPanel').then((m) => ({ default: m.SpaceWeatherAlertPanel })), { ssr: false })
const SpaceWeatherImpactAssessor = dynamic(() => import('@/components/map/SpaceWeatherImpactAssessor').then((m) => ({ default: m.SpaceWeatherImpactAssessor })), { ssr: false })
const MagnetosphereMonitor = dynamic(() => import('@/components/map/MagnetosphereMonitor').then((m) => ({ default: m.MagnetosphereMonitor })), { ssr: false })
const CosmicRayMonitor = dynamic(() => import('@/components/map/CosmicRayMonitor').then((m) => ({ default: m.CosmicRayMonitor })), { ssr: false })
const RadiationExposureMonitor = dynamic(() => import('@/components/map/RadiationExposureMonitor').then((m) => ({ default: m.RadiationExposureMonitor })), { ssr: false })
const MagneticFieldMapper = dynamic(() => import('@/components/map/MagneticFieldMapper').then((m) => ({ default: m.MagneticFieldMapper })), { ssr: false })
const MagneticAnomalyDetector = dynamic(() => import('@/components/map/MagneticAnomalyDetector').then((m) => ({ default: m.MagneticAnomalyDetector })), { ssr: false })
const ElectromagneticFieldMapper = dynamic(() => import('@/components/map/ElectromagneticFieldMapper').then((m) => ({ default: m.ElectromagneticFieldMapper })), { ssr: false })
const RadioSignalMapper = dynamic(() => import('@/components/map/RadioSignalMapper').then((m) => ({ default: m.RadioSignalMapper })), { ssr: false })
const IonosphereMonitor = dynamic(() => import('@/components/map/IonosphereMonitor').then((m) => ({ default: m.IonosphereMonitor })), { ssr: false })
const AuroraForecaster = dynamic(() => import('@/components/map/AuroraForecaster').then((m) => ({ default: m.AuroraForecaster })), { ssr: false })
const MeteorShowerTracker = dynamic(() => import('@/components/map/MeteorShowerTracker').then((m) => ({ default: m.MeteorShowerTracker })), { ssr: false })

export function GroupH() {
  return (
    <>
      <SpaceWeatherMonitor />
      <SpaceDebrisTracker />
      <SpaceTrackViewer />
      <SolarFlareMonitor />
      <SolarPowerPlanner />
      <SolarExposureAnalyzer />
      <SolarIrradianceMapper />
      <SolarWindMonitor />
      <SpaceWeatherAlertPanel />
      <SpaceWeatherImpactAssessor />
      <MagnetosphereMonitor />
      <CosmicRayMonitor />
      <RadiationExposureMonitor />
      <MagneticFieldMapper />
      <MagneticAnomalyDetector />
      <ElectromagneticFieldMapper />
      <RadioSignalMapper />
      <IonosphereMonitor />
      <AuroraForecaster />
      <MeteorShowerTracker />
    </>
  )
}
