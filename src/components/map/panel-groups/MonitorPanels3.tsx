'use client'

import { SpaceTrackViewer } from '@/components/map/SpaceTrackViewer'
import { ArchaeologyMap } from '@/components/map/ArchaeologyMap'
import { PollutionTracker } from '@/components/map/PollutionTracker'
import { TidalPredictor } from '@/components/map/TidalPredictor'
import { WindFarmOptimizer } from '@/components/map/WindFarmOptimizer'
import { DesertificationMonitor } from '@/components/map/DesertificationMonitor'
import { MineralExploration } from '@/components/map/MineralExploration'
import { OceanCurrentMapper } from '@/components/map/OceanCurrentMapper'
import { PermafrostThawTracker } from '@/components/map/PermafrostThawTracker'
import { LightningStrikeMap } from '@/components/map/LightningStrikeMap'
import { BiomeClassifier } from '@/components/map/BiomeClassifier'
import { GroundwaterExplorer } from '@/components/map/GroundwaterExplorer'
import { SolarPowerPlanner } from '@/components/map/SolarPowerPlanner'
import { VolcanicAshTracker } from '@/components/map/VolcanicAshTracker'
import { CoastalErosionMonitor } from '@/components/map/CoastalErosionMonitor'
import { CarbonFootprintMapper } from '@/components/map/CarbonFootprintMapper'
import { WildlifeMigrationTracker } from '@/components/map/WildlifeMigrationTracker'
import { IceSheetMonitor } from '@/components/map/IceSheetMonitor'
import { DroughtMonitorPanel } from '@/components/map/DroughtMonitorPanel'
import { LandSubsidenceTracker } from '@/components/map/LandSubsidenceTracker'
import { CoralBleachingAlert } from '@/components/map/CoralBleachingAlert'
import { TsunamiAlertSystem } from '@/components/map/TsunamiAlertSystem'
import { SoilErosionMonitor } from '@/components/map/SoilErosionMonitor'
import { WatershedManagerPanel } from '@/components/map/WatershedManagerPanel'
import { TectonicPlateViewer } from '@/components/map/TectonicPlateViewer'
import { AirQualityForecaster } from '@/components/map/AirQualityForecaster'
import { GlacialLakeMonitor } from '@/components/map/GlacialLakeMonitor'

export function MonitorPanels3() {
  return (
    <>
      <SpaceTrackViewer />
      <ArchaeologyMap />
      <PollutionTracker />
      <TidalPredictor />
      <WindFarmOptimizer />
      <DesertificationMonitor />
      <MineralExploration />
      <OceanCurrentMapper />
      <PermafrostThawTracker />
      <LightningStrikeMap />
      <BiomeClassifier />
      <GroundwaterExplorer />
      <SolarPowerPlanner />
      <VolcanicAshTracker />
      <CoastalErosionMonitor />
      <CarbonFootprintMapper />
      <WildlifeMigrationTracker />
      <IceSheetMonitor />
      <DroughtMonitorPanel />
      <LandSubsidenceTracker />
      <CoralBleachingAlert />
      <TsunamiAlertSystem />
      <SoilErosionMonitor />
      <WatershedManagerPanel />
      <TectonicPlateViewer />
      <AirQualityForecaster />
      <GlacialLakeMonitor />
    </>
  )
}
