'use client'

import { useMapStore } from '@/lib/map-store'
import { LazyPanel } from '@/components/LazyPanel'

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
  // Task 68
  const supervolcano = useMapStore((s) => s.supervolcano)
  const polarVortex = useMapStore((s) => s.polarVortex)
  const karstAquifer = useMapStore((s) => s.karstAquifer)
  const subductionZone = useMapStore((s) => s.subductionZone)
  const tropopause = useMapStore((s) => s.tropopause)
  const invasiveSpecies = useMapStore((s) => s.invasiveSpecies)
  const tundraCarbon = useMapStore((s) => s.tundraCarbon)
  const monsoon = useMapStore((s) => s.monsoon)

  return (
    <>
      {/* Task 68: New Monitoring Panels - loaded via LazyPanel for true lazy loading */}
      {supervolcano.open && (
        <LazyPanel importFn={() => import('@/components/map/SupervolcanoMonitor')} exportName="SupervolcanoMonitor" shouldLoad={true} />
      )}
      {polarVortex.open && (
        <LazyPanel importFn={() => import('@/components/map/PolarVortexMonitor')} exportName="PolarVortexMonitor" shouldLoad={true} />
      )}
      {karstAquifer.open && (
        <LazyPanel importFn={() => import('@/components/map/KarstAquiferMonitor')} exportName="KarstAquiferMonitor" shouldLoad={true} />
      )}
      {subductionZone.open && (
        <LazyPanel importFn={() => import('@/components/map/SubductionZoneMonitor')} exportName="SubductionZoneMonitor" shouldLoad={true} />
      )}
      {tropopause.open && (
        <LazyPanel importFn={() => import('@/components/map/TropopauseMonitor')} exportName="TropopauseMonitor" shouldLoad={true} />
      )}
      {invasiveSpecies.open && (
        <LazyPanel importFn={() => import('@/components/map/InvasiveSpeciesTracker')} exportName="InvasiveSpeciesTracker" shouldLoad={true} />
      )}
      {tundraCarbon.open && (
        <LazyPanel importFn={() => import('@/components/map/TundraCarbonMonitor')} exportName="TundraCarbonMonitor" shouldLoad={true} />
      )}
      {monsoon.open && (
        <LazyPanel importFn={() => import('@/components/map/MonsoonTracker')} exportName="MonsoonTracker" shouldLoad={true} />
      )}

      {/* Task 67: Monitoring Panels */}
      {geothermalSpring.open && (
        <LazyPanel importFn={() => import('@/components/map/GeothermalSpringMonitor')} exportName="GeothermalSpringMonitor" shouldLoad={true} />
      )}
      {asteroidImpact.open && (
        <LazyPanel importFn={() => import('@/components/map/AsteroidImpactRiskMapper')} exportName="AsteroidImpactRiskMapper" shouldLoad={true} />
      )}
      {desertOasis.open && (
        <LazyPanel importFn={() => import('@/components/map/DesertOasisMonitor')} exportName="DesertOasisMonitor" shouldLoad={true} />
      )}
      {volcanicLightning.open && (
        <LazyPanel importFn={() => import('@/components/map/VolcanicLightningTracker')} exportName="VolcanicLightningTracker" shouldLoad={true} />
      )}
      {iceCoreData.open && (
        <LazyPanel importFn={() => import('@/components/map/IceCoreDataExplorer')} exportName="IceCoreDataExplorer" shouldLoad={true} />
      )}
      {stratosphericAerosol.open && (
        <LazyPanel importFn={() => import('@/components/map/StratosphericAerosolMonitor')} exportName="StratosphericAerosolMonitor" shouldLoad={true} />
      )}
      {megacityCarbon.open && (
        <LazyPanel importFn={() => import('@/components/map/MegacityCarbonFootprint')} exportName="MegacityCarbonFootprint" shouldLoad={true} />
      )}
      {oceanEddy.open && (
        <LazyPanel importFn={() => import('@/components/map/OceanMesoscaleEddyTracker')} exportName="OceanMesoscaleEddyTracker" shouldLoad={true} />
      )}

      {/* Task 65: Monitoring Panels */}
      {subglacialLake.open && (
        <LazyPanel importFn={() => import('@/components/map/SubglacialLakeExplorer')} exportName="SubglacialLakeExplorer" shouldLoad={true} />
      )}
      {thermokarstLake.open && (
        <LazyPanel importFn={() => import('@/components/map/ThermokarstLakeMonitor')} exportName="ThermokarstLakeMonitor" shouldLoad={true} />
      )}
      {paleoclimateProxy.open && (
        <LazyPanel importFn={() => import('@/components/map/PaleoclimateProxyExplorer')} exportName="PaleoclimateProxyExplorer" shouldLoad={true} />
      )}
      {gicMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/GeomagneticallyInducedCurrentMonitor')} exportName="GeomagneticallyInducedCurrentMonitor" shouldLoad={true} />
      )}
      {sabkhaEnvironment.open && (
        <LazyPanel importFn={() => import('@/components/map/SabkhaEnvironmentMonitor')} exportName="SabkhaEnvironmentMonitor" shouldLoad={true} />
      )}
      {cryosphereChange.open && (
        <LazyPanel importFn={() => import('@/components/map/CryosphereChangeTracker')} exportName="CryosphereChangeTracker" shouldLoad={true} />
      )}
      {abyssalPlain.open && (
        <LazyPanel importFn={() => import('@/components/map/AbyssalPlainMapper')} exportName="AbyssalPlainMapper" shouldLoad={true} />
      )}
      {fjordEcosystem.open && (
        <LazyPanel importFn={() => import('@/components/map/FjordEcosystemMonitor')} exportName="FjordEcosystemMonitor" shouldLoad={true} />
      )}
    </>
  )
}
