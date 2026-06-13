'use client'

import { SalinityGradientMapper } from '@/components/map/SalinityGradientMapper'
import { MicroplasticsTracker } from '@/components/map/MicroplasticsTracker'
import { RadioSignalMapper } from '@/components/map/RadioSignalMapper'
import { VolcanicIslandMonitor } from '@/components/map/VolcanicIslandMonitor'
import { PermafrostThawMonitor } from '@/components/map/PermafrostThawMonitor'
import { OceanCurrentTrackerPanel } from '@/components/map/OceanCurrentTrackerPanel'
import { SpaceWeatherAlertPanel } from '@/components/map/SpaceWeatherAlertPanel'
import { DesertMonitorPanel } from '@/components/map/DesertMonitorPanel'
import { TsunamiBuoyTracker } from '@/components/map/TsunamiBuoyTracker'
import { GlacierVelocityTracker } from '@/components/map/GlacierVelocityTracker'
import { EarthquakeSwarmMonitor } from '@/components/map/EarthquakeSwarmMonitor'
import { MangroveRestorationTracker } from '@/components/map/MangroveRestorationTracker'
import { CoralBleachingMonitor } from '@/components/map/CoralBleachingMonitor'
import { ArcticSeaIceMonitor } from '@/components/map/ArcticSeaIceMonitor'
import { SoilMoistureMapper } from '@/components/map/SoilMoistureMapper'
import { NoisePollutionMapper } from '@/components/map/NoisePollutionMapper'
import { LightPollutionMapper } from '@/components/map/LightPollutionMapper'
import { GroundwaterRechargeTracker } from '@/components/map/GroundwaterRechargeTracker'
import { AirQualityMonitor } from '@/components/map/AirQualityMonitor'
import { SubglacialLakeExplorer } from '@/components/map/SubglacialLakeExplorer'
import { ThermokarstLakeMonitor } from '@/components/map/ThermokarstLakeMonitor'
import { PaleoclimateProxyExplorer } from '@/components/map/PaleoclimateProxyExplorer'
import { GeomagneticallyInducedCurrentMonitor } from '@/components/map/GeomagneticallyInducedCurrentMonitor'
import { SabkhaEnvironmentMonitor } from '@/components/map/SabkhaEnvironmentMonitor'
import { CryosphereChangeTracker } from '@/components/map/CryosphereChangeTracker'
import { AbyssalPlainMapper } from '@/components/map/AbyssalPlainMapper'
import { FjordEcosystemMonitor } from '@/components/map/FjordEcosystemMonitor'

export function MonitorPanels6() {
  return (
    <>
      <SalinityGradientMapper />
      <MicroplasticsTracker />
      <RadioSignalMapper />
      <VolcanicIslandMonitor />
      <PermafrostThawMonitor />
      <OceanCurrentTrackerPanel />
      <SpaceWeatherAlertPanel />
      <DesertMonitorPanel />
      <TsunamiBuoyTracker />
      <GlacierVelocityTracker />
      <EarthquakeSwarmMonitor />
      <MangroveRestorationTracker />
      <CoralBleachingMonitor />
      <ArcticSeaIceMonitor />
      <SoilMoistureMapper />
      <NoisePollutionMapper />
      <LightPollutionMapper />
      <GroundwaterRechargeTracker />
      <AirQualityMonitor />
      <SubglacialLakeExplorer />
      <ThermokarstLakeMonitor />
      <PaleoclimateProxyExplorer />
      <GeomagneticallyInducedCurrentMonitor />
      <SabkhaEnvironmentMonitor />
      <CryosphereChangeTracker />
      <AbyssalPlainMapper />
      <FjordEcosystemMonitor />
    </>
  )
}
