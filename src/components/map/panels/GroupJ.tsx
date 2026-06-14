'use client'

import dynamic from 'next/dynamic'

const UrbanGrowthSimulator = dynamic(() => import('@/components/map/UrbanGrowthSimulator').then((m) => ({ default: m.UrbanGrowthSimulator })), { ssr: false })
const UrbanSprawlMonitor = dynamic(() => import('@/components/map/UrbanSprawlMonitor').then((m) => ({ default: m.UrbanSprawlMonitor })), { ssr: false })
const UrbanHeatIsland = dynamic(() => import('@/components/map/UrbanHeatIsland').then((m) => ({ default: m.UrbanHeatIsland })), { ssr: false })
const UrbanHeatIslandProfiler = dynamic(() => import('@/components/map/UrbanHeatIslandProfiler').then((m) => ({ default: m.UrbanHeatIslandProfiler })), { ssr: false })
const UrbanTreeCanopyAnalyzer = dynamic(() => import('@/components/map/UrbanTreeCanopyAnalyzer').then((m) => ({ default: m.UrbanTreeCanopyAnalyzer })), { ssr: false })
const UrbanMicroclimateAnalyzer = dynamic(() => import('@/components/map/UrbanMicroclimateAnalyzer').then((m) => ({ default: m.UrbanMicroclimateAnalyzer })), { ssr: false })
const PollutionTracker = dynamic(() => import('@/components/map/PollutionTracker').then((m) => ({ default: m.PollutionTracker })), { ssr: false })
const AirPollutionDispersion = dynamic(() => import('@/components/map/AirPollutionDispersion').then((m) => ({ default: m.AirPollutionDispersion })), { ssr: false })
const NoisePollutionMapper = dynamic(() => import('@/components/map/NoisePollutionMapper').then((m) => ({ default: m.NoisePollutionMapper })), { ssr: false })
const NoiseHeatmapOverlay = dynamic(() => import('@/components/map/NoiseHeatmapOverlay').then((m) => ({ default: m.NoiseHeatmapOverlay })), { ssr: false })
const LightPollutionMap = dynamic(() => import('@/components/map/LightPollutionMap').then((m) => ({ default: m.LightPollutionMap })), { ssr: false })
const LightPollutionMapper = dynamic(() => import('@/components/map/LightPollutionMapper').then((m) => ({ default: m.LightPollutionMapper })), { ssr: false })
const MicroplasticsTracker = dynamic(() => import('@/components/map/MicroplasticsTracker').then((m) => ({ default: m.MicroplasticsTracker })), { ssr: false })
const LandfillMonitor = dynamic(() => import('@/components/map/LandfillMonitor').then((m) => ({ default: m.LandfillMonitor })), { ssr: false })
const CropHealthAnalyzer = dynamic(() => import('@/components/map/CropHealthAnalyzer').then((m) => ({ default: m.CropHealthAnalyzer })), { ssr: false })
const CropYieldPredictor = dynamic(() => import('@/components/map/CropYieldPredictor').then((m) => ({ default: m.CropYieldPredictor })), { ssr: false })
const AquacultureMonitor = dynamic(() => import('@/components/map/AquacultureMonitor').then((m) => ({ default: m.AquacultureMonitor })), { ssr: false })
const ViralOutbreakMapper = dynamic(() => import('@/components/map/ViralOutbreakMapper').then((m) => ({ default: m.ViralOutbreakMapper })), { ssr: false })
const DeepBiosphereExplorer = dynamic(() => import('@/components/map/DeepBiosphereExplorer').then((m) => ({ default: m.DeepBiosphereExplorer })), { ssr: false })
const GeomagneticallyInducedCurrentMonitor = dynamic(() => import('@/components/map/GeomagneticallyInducedCurrentMonitor').then((m) => ({ default: m.GeomagneticallyInducedCurrentMonitor })), { ssr: false })

export function GroupJ() {
  return (
    <>
      <UrbanGrowthSimulator />
      <UrbanSprawlMonitor />
      <UrbanHeatIsland />
      <UrbanHeatIslandProfiler />
      <UrbanTreeCanopyAnalyzer />
      <UrbanMicroclimateAnalyzer />
      <PollutionTracker />
      <AirPollutionDispersion />
      <NoisePollutionMapper />
      <NoiseHeatmapOverlay />
      <LightPollutionMap />
      <LightPollutionMapper />
      <MicroplasticsTracker />
      <LandfillMonitor />
      <CropHealthAnalyzer />
      <CropYieldPredictor />
      <AquacultureMonitor />
      <ViralOutbreakMapper />
      <DeepBiosphereExplorer />
      <GeomagneticallyInducedCurrentMonitor />
    </>
  )
}
