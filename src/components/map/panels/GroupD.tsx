'use client'

import dynamic from 'next/dynamic'

const OceanCurrentMapper = dynamic(() => import('@/components/map/OceanCurrentMapper').then((m) => ({ default: m.OceanCurrentMapper })), { ssr: false })
const DeepOceanCurrentMonitor = dynamic(() => import('@/components/map/DeepOceanCurrentMonitor').then((m) => ({ default: m.DeepOceanCurrentMonitor })), { ssr: false })
const OceanCurrentTrackerPanel = dynamic(() => import('@/components/map/OceanCurrentTrackerPanel').then((m) => ({ default: m.OceanCurrentTrackerPanel })), { ssr: false })
const OceanAcidificationMonitor = dynamic(() => import('@/components/map/OceanAcidificationMonitor').then((m) => ({ default: m.OceanAcidificationMonitor })), { ssr: false })
const OceanAlkalinityMapper = dynamic(() => import('@/components/map/OceanAlkalinityMapper').then((m) => ({ default: m.OceanAlkalinityMapper })), { ssr: false })
const SeaSurfaceTemperatureMapper = dynamic(() => import('@/components/map/SeaSurfaceTemperatureMapper').then((m) => ({ default: m.SeaSurfaceTemperatureMapper })), { ssr: false })
const MarineHeatwaveTracker = dynamic(() => import('@/components/map/MarineHeatwaveTracker').then((m) => ({ default: m.MarineHeatwaveTracker })), { ssr: false })
const ThermoclineMapper = dynamic(() => import('@/components/map/ThermoclineMapper').then((m) => ({ default: m.ThermoclineMapper })), { ssr: false })
const SalinityGradientMapper = dynamic(() => import('@/components/map/SalinityGradientMapper').then((m) => ({ default: m.SalinityGradientMapper })), { ssr: false })
const CoastalUpwellingMonitor = dynamic(() => import('@/components/map/CoastalUpwellingMonitor').then((m) => ({ default: m.CoastalUpwellingMonitor })), { ssr: false })
const TidalPredictor = dynamic(() => import('@/components/map/TidalPredictor').then((m) => ({ default: m.TidalPredictor })), { ssr: false })
const TidalEnergyAssessor = dynamic(() => import('@/components/map/TidalEnergyAssessor').then((m) => ({ default: m.TidalEnergyAssessor })), { ssr: false })
const DeepSeaVentMonitor = dynamic(() => import('@/components/map/DeepSeaVentMonitor').then((m) => ({ default: m.DeepSeaVentMonitor })), { ssr: false })
const HydrothermalVentTracker = dynamic(() => import('@/components/map/HydrothermalVentTracker').then((m) => ({ default: m.HydrothermalVentTracker })), { ssr: false })
const HydrothermalPlumeTracker = dynamic(() => import('@/components/map/HydrothermalPlumeTracker').then((m) => ({ default: m.HydrothermalPlumeTracker })), { ssr: false })
const SeafloorMappingPanel = dynamic(() => import('@/components/map/SeafloorMappingPanel').then((m) => ({ default: m.SeafloorMappingPanel })), { ssr: false })
const AbyssalPlainMapper = dynamic(() => import('@/components/map/AbyssalPlainMapper').then((m) => ({ default: m.AbyssalPlainMapper })), { ssr: false })
const FjordEcosystemMonitor = dynamic(() => import('@/components/map/FjordEcosystemMonitor').then((m) => ({ default: m.FjordEcosystemMonitor })), { ssr: false })
const EstuaryHealthMonitor = dynamic(() => import('@/components/map/EstuaryHealthMonitor').then((m) => ({ default: m.EstuaryHealthMonitor })), { ssr: false })
const SubmarineCanyonExplorer = dynamic(() => import('@/components/map/SubmarineCanyonExplorer').then((m) => ({ default: m.SubmarineCanyonExplorer })), { ssr: false })

export function GroupD() {
  return (
    <>
      <OceanCurrentMapper />
      <DeepOceanCurrentMonitor />
      <OceanCurrentTrackerPanel />
      <OceanAcidificationMonitor />
      <OceanAlkalinityMapper />
      <SeaSurfaceTemperatureMapper />
      <MarineHeatwaveTracker />
      <ThermoclineMapper />
      <SalinityGradientMapper />
      <CoastalUpwellingMonitor />
      <TidalPredictor />
      <TidalEnergyAssessor />
      <DeepSeaVentMonitor />
      <HydrothermalVentTracker />
      <HydrothermalPlumeTracker />
      <SeafloorMappingPanel />
      <AbyssalPlainMapper />
      <FjordEcosystemMonitor />
      <EstuaryHealthMonitor />
      <SubmarineCanyonExplorer />
    </>
  )
}
