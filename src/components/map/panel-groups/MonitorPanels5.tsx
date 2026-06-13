'use client'

import { VolcanicGasMonitor } from '@/components/map/VolcanicGasMonitor'
import { AquiferDepletionMonitor } from '@/components/map/AquiferDepletionMonitor'
import { StratosphericWindMonitor } from '@/components/map/StratosphericWindMonitor'
import { MarineHeatwaveTracker } from '@/components/map/MarineHeatwaveTracker'
import { PrecipitationAnalyzer } from '@/components/map/PrecipitationAnalyzer'
import { CosmicRayMonitor } from '@/components/map/CosmicRayMonitor'
import { GreenlandIceTracker } from '@/components/map/GreenlandIceTracker'
import { RadiationExposureMonitor } from '@/components/map/RadiationExposureMonitor'
import { PeatFireTracker } from '@/components/map/PeatFireTracker'
import { SeaLevelRiseProjector } from '@/components/map/SeaLevelRiseProjector'
import { ThermoclineMapper } from '@/components/map/ThermoclineMapper'
import { AcidRainTracker } from '@/components/map/AcidRainTracker'
import { MethaneHydrateMonitor } from '@/components/map/MethaneHydrateMonitor'
import { KelpForestMonitor } from '@/components/map/KelpForestMonitor'
import { GlacierLakeOutburstTracker } from '@/components/map/GlacierLakeOutburstTracker'
import { DustStormTracker } from '@/components/map/DustStormTracker'
import { BioluminescenceTracker } from '@/components/map/BioluminescenceTracker'
import { UrbanSprawlMonitor } from '@/components/map/UrbanSprawlMonitor'
import { ViralOutbreakMapper } from '@/components/map/ViralOutbreakMapper'
import { MagnetosphereMonitor } from '@/components/map/MagnetosphereMonitor'
import { FogDensityMapper } from '@/components/map/FogDensityMapper'
import { CarbonCaptureTracker } from '@/components/map/CarbonCaptureTracker'
import { HailStormTracker } from '@/components/map/HailStormTracker'
import { SaharaReforestationTracker } from '@/components/map/SaharaReforestationTracker'
import { DeepSeaVentMonitor } from '@/components/map/DeepSeaVentMonitor'
import { StormSurgePredictor } from '@/components/map/StormSurgePredictor'
import { LandfillMonitor } from '@/components/map/LandfillMonitor'

export function MonitorPanels5() {
  return (
    <>
      <VolcanicGasMonitor />
      <AquiferDepletionMonitor />
      <StratosphericWindMonitor />
      <MarineHeatwaveTracker />
      <PrecipitationAnalyzer />
      <CosmicRayMonitor />
      <GreenlandIceTracker />
      <RadiationExposureMonitor />
      <PeatFireTracker />
      <SeaLevelRiseProjector />
      <ThermoclineMapper />
      <AcidRainTracker />
      <MethaneHydrateMonitor />
      <KelpForestMonitor />
      <GlacierLakeOutburstTracker />
      <DustStormTracker />
      <BioluminescenceTracker />
      <UrbanSprawlMonitor />
      <ViralOutbreakMapper />
      <MagnetosphereMonitor />
      <FogDensityMapper />
      <CarbonCaptureTracker />
      <HailStormTracker />
      <SaharaReforestationTracker />
      <DeepSeaVentMonitor />
      <StormSurgePredictor />
      <LandfillMonitor />
    </>
  )
}
