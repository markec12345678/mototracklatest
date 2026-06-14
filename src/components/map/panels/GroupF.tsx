'use client'

import dynamic from 'next/dynamic'

const HydrologyAnalyzer = dynamic(() => import('@/components/map/HydrologyAnalyzer').then((m) => ({ default: m.HydrologyAnalyzer })), { ssr: false })
const RiverFlowMonitor = dynamic(() => import('@/components/map/RiverFlowMonitor').then((m) => ({ default: m.RiverFlowMonitor })), { ssr: false })
const RiverDeltaMonitor = dynamic(() => import('@/components/map/RiverDeltaMonitor').then((m) => ({ default: m.RiverDeltaMonitor })), { ssr: false })
const GroundwaterExplorer = dynamic(() => import('@/components/map/GroundwaterExplorer').then((m) => ({ default: m.GroundwaterExplorer })), { ssr: false })
const GroundwaterRechargeTracker = dynamic(() => import('@/components/map/GroundwaterRechargeTracker').then((m) => ({ default: m.GroundwaterRechargeTracker })), { ssr: false })
const KarstGroundwaterMonitor = dynamic(() => import('@/components/map/KarstGroundwaterMonitor').then((m) => ({ default: m.KarstGroundwaterMonitor })), { ssr: false })
const AquiferDepletionMonitor = dynamic(() => import('@/components/map/AquiferDepletionMonitor').then((m) => ({ default: m.AquiferDepletionMonitor })), { ssr: false })
const SaltwaterIntrusionMonitor = dynamic(() => import('@/components/map/SaltwaterIntrusionMonitor').then((m) => ({ default: m.SaltwaterIntrusionMonitor })), { ssr: false })
const UndergroundWaterwayMapper = dynamic(() => import('@/components/map/UndergroundWaterwayMapper').then((m) => ({ default: m.UndergroundWaterwayMapper })), { ssr: false })
const SubsurfaceFluidFlowMonitor = dynamic(() => import('@/components/map/SubsurfaceFluidFlowMonitor').then((m) => ({ default: m.SubsurfaceFluidFlowMonitor })), { ssr: false })
const WatershedManagerPanel = dynamic(() => import('@/components/map/WatershedManagerPanel').then((m) => ({ default: m.WatershedManagerPanel })), { ssr: false })
const FloodRiskAnalyzer = dynamic(() => import('@/components/map/FloodRiskAnalyzer').then((m) => ({ default: m.FloodRiskAnalyzer })), { ssr: false })
const UrbanFloodRiskMapper = dynamic(() => import('@/components/map/UrbanFloodRiskMapper').then((m) => ({ default: m.UrbanFloodRiskMapper })), { ssr: false })
const StormSurgePredictor = dynamic(() => import('@/components/map/StormSurgePredictor').then((m) => ({ default: m.StormSurgePredictor })), { ssr: false })
const SoilMoistureMonitor = dynamic(() => import('@/components/map/SoilMoistureMonitor').then((m) => ({ default: m.SoilMoistureMonitor })), { ssr: false })
const SoilMoistureMapper = dynamic(() => import('@/components/map/SoilMoistureMapper').then((m) => ({ default: m.SoilMoistureMapper })), { ssr: false })
const WetlandMapper = dynamic(() => import('@/components/map/WetlandMapper').then((m) => ({ default: m.WetlandMapper })), { ssr: false })
const HydroelectricPotentialMapper = dynamic(() => import('@/components/map/HydroelectricPotentialMapper').then((m) => ({ default: m.HydroelectricPotentialMapper })), { ssr: false })
const SoilErosionMonitor = dynamic(() => import('@/components/map/SoilErosionMonitor').then((m) => ({ default: m.SoilErosionMonitor })), { ssr: false })
const LunarTideCorrelator = dynamic(() => import('@/components/map/LunarTideCorrelator').then((m) => ({ default: m.LunarTideCorrelator })), { ssr: false })

export function GroupF() {
  return (
    <>
      <HydrologyAnalyzer />
      <RiverFlowMonitor />
      <RiverDeltaMonitor />
      <GroundwaterExplorer />
      <GroundwaterRechargeTracker />
      <KarstGroundwaterMonitor />
      <AquiferDepletionMonitor />
      <SaltwaterIntrusionMonitor />
      <UndergroundWaterwayMapper />
      <SubsurfaceFluidFlowMonitor />
      <WatershedManagerPanel />
      <FloodRiskAnalyzer />
      <UrbanFloodRiskMapper />
      <StormSurgePredictor />
      <SoilMoistureMonitor />
      <SoilMoistureMapper />
      <WetlandMapper />
      <HydroelectricPotentialMapper />
      <SoilErosionMonitor />
      <LunarTideCorrelator />
    </>
  )
}
