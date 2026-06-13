'use client'

import { SpaceWeatherMonitor } from '@/components/map/SpaceWeatherMonitor'
import { PeatlandMonitorPanel } from '@/components/map/PeatlandMonitorPanel'
import { MangroveMonitor } from '@/components/map/MangroveMonitor'
import { SandstormTracker } from '@/components/map/SandstormTracker'
import { WetlandMapper } from '@/components/map/WetlandMapper'
import { UrbanHeatIsland } from '@/components/map/UrbanHeatIsland'
import { WildfireRiskAssessor } from '@/components/map/WildfireRiskAssessor'
import { AlgalBloomTracker } from '@/components/map/AlgalBloomTracker'
import { LandslidePredictor } from '@/components/map/LandslidePredictor'
import { SeaIceNavigator } from '@/components/map/SeaIceNavigator'
import { CloudCoverAnalyzer } from '@/components/map/CloudCoverAnalyzer'
import { SoilMoistureMonitor } from '@/components/map/SoilMoistureMonitor'
import { LightPollutionMap } from '@/components/map/LightPollutionMap'
import { RiverFlowMonitor } from '@/components/map/RiverFlowMonitor'
import { VolcanoSeismicMonitor } from '@/components/map/VolcanoSeismicMonitor'
import { WhaleMigrationTracker } from '@/components/map/WhaleMigrationTracker'
import { AvalancheForecaster } from '@/components/map/AvalancheForecaster'
import { AuroraForecaster } from '@/components/map/AuroraForecaster'
import { OzoneLayerMonitor } from '@/components/map/OzoneLayerMonitor'
import { DeforestationTracker } from '@/components/map/DeforestationTracker'
import { MethaneEmissionsTracker } from '@/components/map/MethaneEmissionsTracker'
import { OceanAcidificationMonitor } from '@/components/map/OceanAcidificationMonitor'
import { SpaceDebrisTracker } from '@/components/map/SpaceDebrisTracker'
import { TectonicStrainMonitor } from '@/components/map/TectonicStrainMonitor'
import { PhytoBloomMonitor } from '@/components/map/PhytoBloomMonitor'
import { SnowCoverMonitor } from '@/components/map/SnowCoverMonitor'
import { GeomagneticStormTracker } from '@/components/map/GeomagneticStormTracker'

export function MonitorPanels4() {
  return (
    <>
      <SpaceWeatherMonitor />
      <PeatlandMonitorPanel />
      <MangroveMonitor />
      <SandstormTracker />
      <WetlandMapper />
      <UrbanHeatIsland />
      <WildfireRiskAssessor />
      <AlgalBloomTracker />
      <LandslidePredictor />
      <SeaIceNavigator />
      <CloudCoverAnalyzer />
      <SoilMoistureMonitor />
      <LightPollutionMap />
      <RiverFlowMonitor />
      <VolcanoSeismicMonitor />
      <WhaleMigrationTracker />
      <AvalancheForecaster />
      <AuroraForecaster />
      <OzoneLayerMonitor />
      <DeforestationTracker />
      <MethaneEmissionsTracker />
      <OceanAcidificationMonitor />
      <SpaceDebrisTracker />
      <TectonicStrainMonitor />
      <PhytoBloomMonitor />
      <SnowCoverMonitor />
      <GeomagneticStormTracker />
    </>
  )
}
