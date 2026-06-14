'use client'

import dynamic from 'next/dynamic'
import { useMapStore } from '@/lib/map-store'

// Lazy-loaded monitoring panels - only import when open
const GeothermalSpringMonitor = dynamic(() => import('@/components/map/GeothermalSpringMonitor').then(m => ({ default: m.GeothermalSpringMonitor })), { ssr: false, loading: () => null })
const AsteroidImpactRiskMapper = dynamic(() => import('@/components/map/AsteroidImpactRiskMapper').then(m => ({ default: m.AsteroidImpactRiskMapper })), { ssr: false, loading: () => null })
const DesertOasisMonitor = dynamic(() => import('@/components/map/DesertOasisMonitor').then(m => ({ default: m.DesertOasisMonitor })), { ssr: false, loading: () => null })
const VolcanicLightningTracker = dynamic(() => import('@/components/map/VolcanicLightningTracker').then(m => ({ default: m.VolcanicLightningTracker })), { ssr: false, loading: () => null })
const IceCoreDataExplorer = dynamic(() => import('@/components/map/IceCoreDataExplorer').then(m => ({ default: m.IceCoreDataExplorer })), { ssr: false, loading: () => null })
const StratosphericAerosolMonitor = dynamic(() => import('@/components/map/StratosphericAerosolMonitor').then(m => ({ default: m.StratosphericAerosolMonitor })), { ssr: false, loading: () => null })
const MegacityCarbonFootprint = dynamic(() => import('@/components/map/MegacityCarbonFootprint').then(m => ({ default: m.MegacityCarbonFootprint })), { ssr: false, loading: () => null })
const OceanMesoscaleEddyTracker = dynamic(() => import('@/components/map/OceanMesoscaleEddyTracker').then(m => ({ default: m.OceanMesoscaleEddyTracker })), { ssr: false, loading: () => null })

// Task 65 components
const SubglacialLakeExplorer = dynamic(() => import('@/components/map/SubglacialLakeExplorer').then(m => ({ default: m.SubglacialLakeExplorer })), { ssr: false, loading: () => null })
const ThermokarstLakeMonitor = dynamic(() => import('@/components/map/ThermokarstLakeMonitor').then(m => ({ default: m.ThermokarstLakeMonitor })), { ssr: false, loading: () => null })
const PaleoclimateProxyExplorer = dynamic(() => import('@/components/map/PaleoclimateProxyExplorer').then(m => ({ default: m.PaleoclimateProxyExplorer })), { ssr: false, loading: () => null })
const GeomagneticallyInducedCurrentMonitor = dynamic(() => import('@/components/map/GeomagneticallyInducedCurrentMonitor').then(m => ({ default: m.GeomagneticallyInducedCurrentMonitor })), { ssr: false, loading: () => null })
const SabkhaEnvironmentMonitor = dynamic(() => import('@/components/map/SabkhaEnvironmentMonitor').then(m => ({ default: m.SabkhaEnvironmentMonitor })), { ssr: false, loading: () => null })
const CryosphereChangeTracker = dynamic(() => import('@/components/map/CryosphereChangeTracker').then(m => ({ default: m.CryosphereChangeTracker })), { ssr: false, loading: () => null })
const AbyssalPlainMapper = dynamic(() => import('@/components/map/AbyssalPlainMapper').then(m => ({ default: m.AbyssalPlainMapper })), { ssr: false, loading: () => null })
const FjordEcosystemMonitor = dynamic(() => import('@/components/map/FjordEcosystemMonitor').then(m => ({ default: m.FjordEcosystemMonitor })), { ssr: false, loading: () => null })

export function MonitorPanelRegistry() {
  const geothermalSpring = useMapStore((s) => s.geothermalSpring)
  const asteroidImpact = useMapStore((s) => s.asteroidImpact)
  const desertOasis = useMapStore((s) => s.desertOasis)
  const volcanicLightning = useMapStore((s) => s.volcanicLightning)
  const iceCoreData = useMapStore((s) => s.iceCoreData)
  const stratosphericAerosol = useMapStore((s) => s.stratosphericAerosol)
  const megacityCarbon = useMapStore((s) => s.megacityCarbon)
  const oceanEddy = useMapStore((s) => s.oceanEddy)
  const subglacialLake = useMapStore((s) => s.subglacialLake)
  const thermokarstLake = useMapStore((s) => s.thermokarstLake)
  const paleoclimateProxy = useMapStore((s) => s.paleoclimateProxy)
  const gicMonitor = useMapStore((s) => s.gicMonitor)
  const sabkhaEnvironment = useMapStore((s) => s.sabkhaEnvironment)
  const cryosphereChange = useMapStore((s) => s.cryosphereChange)
  const abyssalPlain = useMapStore((s) => s.abyssalPlain)
  const fjordEcosystem = useMapStore((s) => s.fjordEcosystem)

  return (
    <>
      {/* Task 67: New Monitoring Panels */}
      {geothermalSpring.open && <GeothermalSpringMonitor />}
      {asteroidImpact.open && <AsteroidImpactRiskMapper />}
      {desertOasis.open && <DesertOasisMonitor />}
      {volcanicLightning.open && <VolcanicLightningTracker />}
      {iceCoreData.open && <IceCoreDataExplorer />}
      {stratosphericAerosol.open && <StratosphericAerosolMonitor />}
      {megacityCarbon.open && <MegacityCarbonFootprint />}
      {oceanEddy.open && <OceanMesoscaleEddyTracker />}

      {/* Task 65: Monitoring Panels */}
      {subglacialLake.open && <SubglacialLakeExplorer />}
      {thermokarstLake.open && <ThermokarstLakeMonitor />}
      {paleoclimateProxy.open && <PaleoclimateProxyExplorer />}
      {gicMonitor.open && <GeomagneticallyInducedCurrentMonitor />}
      {sabkhaEnvironment.open && <SabkhaEnvironmentMonitor />}
      {cryosphereChange.open && <CryosphereChangeTracker />}
      {abyssalPlain.open && <AbyssalPlainMapper />}
      {fjordEcosystem.open && <FjordEcosystemMonitor />}
    </>
  )
}
