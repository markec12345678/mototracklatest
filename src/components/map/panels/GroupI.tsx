'use client'

import dynamic from 'next/dynamic'

const TopographicProfiler = dynamic(() => import('@/components/map/TopographicProfiler').then((m) => ({ default: m.TopographicProfiler })), { ssr: false })
const TerrainAnalysisPanel = dynamic(() => import('@/components/map/TerrainAnalysisPanel').then((m) => ({ default: m.TerrainAnalysisPanel })), { ssr: false })
const TerrainProfile3D = dynamic(() => import('@/components/map/TerrainProfile3D').then((m) => ({ default: m.TerrainProfile3D })), { ssr: false })
const ContourGenerator = dynamic(() => import('@/components/map/ContourGenerator').then((m) => ({ default: m.ContourGenerator })), { ssr: false })
const AvalancheRiskMap = dynamic(() => import('@/components/map/AvalancheRiskMap').then((m) => ({ default: m.AvalancheRiskMap })), { ssr: false })
const AvalancheForecaster = dynamic(() => import('@/components/map/AvalancheForecaster').then((m) => ({ default: m.AvalancheForecaster })), { ssr: false })
const AvalancheTerrainMapper = dynamic(() => import('@/components/map/AvalancheTerrainMapper').then((m) => ({ default: m.AvalancheTerrainMapper })), { ssr: false })
const LandSubsidenceTracker = dynamic(() => import('@/components/map/LandSubsidenceTracker').then((m) => ({ default: m.LandSubsidenceTracker })), { ssr: false })
const CoastalErosionMonitor = dynamic(() => import('@/components/map/CoastalErosionMonitor').then((m) => ({ default: m.CoastalErosionMonitor })), { ssr: false })
const CoastalErosionPredictor = dynamic(() => import('@/components/map/CoastalErosionPredictor').then((m) => ({ default: m.CoastalErosionPredictor })), { ssr: false })
const GeoThermalEnergyMapper = dynamic(() => import('@/components/map/GeoThermalEnergyMapper').then((m) => ({ default: m.GeoThermalEnergyMapper })), { ssr: false })
const MineralExploration = dynamic(() => import('@/components/map/MineralExploration').then((m) => ({ default: m.MineralExploration })), { ssr: false })
const CaveSystemExplorer = dynamic(() => import('@/components/map/CaveSystemExplorer').then((m) => ({ default: m.CaveSystemExplorer })), { ssr: false })
const SandDuneMigrationTracker = dynamic(() => import('@/components/map/SandDuneMigrationTracker').then((m) => ({ default: m.SandDuneMigrationTracker })), { ssr: false })
const DustStormTracker = dynamic(() => import('@/components/map/DustStormTracker').then((m) => ({ default: m.DustStormTracker })), { ssr: false })
const DustAerosolTracker = dynamic(() => import('@/components/map/DustAerosolTracker').then((m) => ({ default: m.DustAerosolTracker })), { ssr: false })
const SandstormTracker = dynamic(() => import('@/components/map/SandstormTracker').then((m) => ({ default: m.SandstormTracker })), { ssr: false })
const DesertMonitorPanel = dynamic(() => import('@/components/map/DesertMonitorPanel').then((m) => ({ default: m.DesertMonitorPanel })), { ssr: false })
const SabkhaEnvironmentMonitor = dynamic(() => import('@/components/map/SabkhaEnvironmentMonitor').then((m) => ({ default: m.SabkhaEnvironmentMonitor })), { ssr: false })
const PaleoclimateProxyExplorer = dynamic(() => import('@/components/map/PaleoclimateProxyExplorer').then((m) => ({ default: m.PaleoclimateProxyExplorer })), { ssr: false })

export function GroupI() {
  return (
    <>
      <TopographicProfiler />
      <TerrainAnalysisPanel />
      <TerrainProfile3D />
      <ContourGenerator />
      <AvalancheRiskMap />
      <AvalancheForecaster />
      <AvalancheTerrainMapper />
      <LandSubsidenceTracker />
      <CoastalErosionMonitor />
      <CoastalErosionPredictor />
      <GeoThermalEnergyMapper />
      <MineralExploration />
      <CaveSystemExplorer />
      <SandDuneMigrationTracker />
      <DustStormTracker />
      <DustAerosolTracker />
      <SandstormTracker />
      <DesertMonitorPanel />
      <SabkhaEnvironmentMonitor />
      <PaleoclimateProxyExplorer />
    </>
  )
}
