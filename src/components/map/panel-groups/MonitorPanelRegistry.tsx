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
  // Task 69
  const lavaFlow = useMapStore((s) => s.lavaFlow)
  const tidalEnergy = useMapStore((s) => s.tidalEnergy)
  const peatFire = useMapStore((s) => s.peatFire)
  const coralSpawn = useMapStore((s) => s.coralSpawn)
  const glacierCalving = useMapStore((s) => s.glacierCalving)
  const soilCarbon = useMapStore((s) => s.soilCarbon)
  const urbanTreeCanopy = useMapStore((s) => s.urbanTreeCanopy)
  const geomagneticPole = useMapStore((s) => s.geomagneticPole)
  // Task 70
  const hydrothermalVent = useMapStore((s) => s.hydrothermalVent)
  const watershedHealth = useMapStore((s) => s.watershedHealth)
  const migratoryFlyway = useMapStore((s) => s.migratoryFlyway)
  const seagrassMeadow = useMapStore((s) => s.seagrassMeadow)
  const urbanHeatIslandDetail = useMapStore((s) => s.urbanHeatIslandDetail)
  const oceanAcidificationDetail = useMapStore((s) => s.oceanAcidificationDetail)
  const desertificationDetail = useMapStore((s) => s.desertificationDetail)
  const volcanicGasTracker = useMapStore((s) => s.volcanicGasTracker)
  // Task 71
  const deepOceanCurrent = useMapStore((s) => s.deepOceanCurrent)
  const stratosphericOzone = useMapStore((s) => s.stratosphericOzone)
  const seismicHarmonic = useMapStore((s) => s.seismicHarmonic)
  const wildfireSmoke = useMapStore((s) => s.wildfireSmoke)
  const estuaryHealth = useMapStore((s) => s.estuaryHealth)
  const alpineGlacier = useMapStore((s) => s.alpineGlacier)
  const oceanAnoxicZone = useMapStore((s) => s.oceanAnoxicZone)
  const permafrostCarbonFeedback = useMapStore((s) => s.permafrostCarbonFeedback)
  // Task 72
  const tropicalCyclone = useMapStore((s) => s.tropicalCyclone)
  const volcanicDeformation = useMapStore((s) => s.volcanicDeformation)
  const coralReefBleachingDetail = useMapStore((s) => s.coralReefBleachingDetail)
  const arcticPermafrostLakes = useMapStore((s) => s.arcticPermafrostLakes)
  const methaneEmissionHotspot = useMapStore((s) => s.methaneEmissionHotspot)
  const coastalUpwelling = useMapStore((s) => s.coastalUpwelling)
  const spaceDebrisOrbit = useMapStore((s) => s.spaceDebrisOrbit)
  const tectonicPlateBoundary = useMapStore((s) => s.tectonicPlateBoundary)
  // Task 73
  const landslideSusceptibility = useMapStore((s) => s.landslideSusceptibility)
  const solarFlareActivity = useMapStore((s) => s.solarFlareActivity)
  const riverDeltaErosion = useMapStore((s) => s.riverDeltaErosion)
  const seaIceThickness = useMapStore((s) => s.seaIceThickness)
  const urbanAirQuality = useMapStore((s) => s.urbanAirQuality)
  const geothermalEnergy = useMapStore((s) => s.geothermalEnergy)
  const aquiferSalinization = useMapStore((s) => s.aquiferSalinization)
  const biomassBurning = useMapStore((s) => s.biomassBurning)
  // Task 74
  const glacialLakeOutburst = useMapStore((s) => s.glacialLakeOutburst)
  const oceanMicroplastic = useMapStore((s) => s.oceanMicroplastic)
  const volcanicAshDispersion = useMapStore((s) => s.volcanicAshDispersion)
  const droughtSeverity = useMapStore((s) => s.droughtSeverity)
  const tsunamiWaveHeight = useMapStore((s) => s.tsunamiWaveHeight)
  const caveEcosystem = useMapStore((s) => s.caveEcosystem)
  const solarIrradiance = useMapStore((s) => s.solarIrradiance)
  const peatlandRestoration = useMapStore((s) => s.peatlandRestoration)

  return (
    <>
      {/* Task 70: New Monitoring Panels */}
      {hydrothermalVent.open && (<LazyPanel importFn={() => import('@/components/map/HydrothermalVentMonitor')} exportName="HydrothermalVentMonitor" shouldLoad={true} />)}
      {watershedHealth.open && (<LazyPanel importFn={() => import('@/components/map/WatershedHealthMonitor')} exportName="WatershedHealthMonitor" shouldLoad={true} />)}
      {migratoryFlyway.open && (<LazyPanel importFn={() => import('@/components/map/MigratoryFlywayMonitor')} exportName="MigratoryFlywayMonitor" shouldLoad={true} />)}
      {seagrassMeadow.open && (<LazyPanel importFn={() => import('@/components/map/SeagrassMeadowDetailMonitor')} exportName="SeagrassMeadowDetailMonitor" shouldLoad={true} />)}
      {urbanHeatIslandDetail.open && (<LazyPanel importFn={() => import('@/components/map/UrbanHeatIslandDetailMonitor')} exportName="UrbanHeatIslandDetailMonitor" shouldLoad={true} />)}
      {oceanAcidificationDetail.open && (<LazyPanel importFn={() => import('@/components/map/OceanAcidificationDetailMonitor')} exportName="OceanAcidificationDetailMonitor" shouldLoad={true} />)}
      {desertificationDetail.open && (<LazyPanel importFn={() => import('@/components/map/DesertificationDetailMonitor')} exportName="DesertificationDetailMonitor" shouldLoad={true} />)}
      {volcanicGasTracker.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicGasTrackerMonitor')} exportName="VolcanicGasTrackerMonitor" shouldLoad={true} />)}

      {/* Task 71: New Monitoring Panels */}
      {deepOceanCurrent.open && (<LazyPanel importFn={() => import('@/components/map/DeepOceanCurrentMonitor')} exportName="DeepOceanCurrentMonitor" shouldLoad={true} />)}
      {stratosphericOzone.open && (<LazyPanel importFn={() => import('@/components/map/StratosphericOzoneMonitor')} exportName="StratosphericOzoneMonitor" shouldLoad={true} />)}
      {seismicHarmonic.open && (<LazyPanel importFn={() => import('@/components/map/SeismicHarmonicMonitor')} exportName="SeismicHarmonicMonitor" shouldLoad={true} />)}
      {wildfireSmoke.open && (<LazyPanel importFn={() => import('@/components/map/WildfireSmokeTracker')} exportName="WildfireSmokeTracker" shouldLoad={true} />)}
      {estuaryHealth.open && (<LazyPanel importFn={() => import('@/components/map/EstuaryHealthMonitor')} exportName="EstuaryHealthMonitor" shouldLoad={true} />)}
      {alpineGlacier.open && (<LazyPanel importFn={() => import('@/components/map/AlpineGlacierMonitor')} exportName="AlpineGlacierMonitor" shouldLoad={true} />)}
      {oceanAnoxicZone.open && (<LazyPanel importFn={() => import('@/components/map/OceanAnoxicZoneMonitor')} exportName="OceanAnoxicZoneMonitor" shouldLoad={true} />)}
      {permafrostCarbonFeedback.open && (<LazyPanel importFn={() => import('@/components/map/PermafrostCarbonFeedbackMonitor')} exportName="PermafrostCarbonFeedbackMonitor" shouldLoad={true} />)}

      {/* Task 72: New Monitoring Panels */}
      {tropicalCyclone.open && (<LazyPanel importFn={() => import('@/components/map/TropicalCycloneTracker')} exportName="TropicalCycloneTracker" shouldLoad={true} />)}
      {volcanicDeformation.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicDeformationMonitor')} exportName="VolcanicDeformationMonitor" shouldLoad={true} />)}
      {coralReefBleachingDetail.open && (<LazyPanel importFn={() => import('@/components/map/CoralReefBleachingDetailMonitor')} exportName="CoralReefBleachingDetailMonitor" shouldLoad={true} />)}
      {arcticPermafrostLakes.open && (<LazyPanel importFn={() => import('@/components/map/ArcticPermafrostLakesMonitor')} exportName="ArcticPermafrostLakesMonitor" shouldLoad={true} />)}
      {methaneEmissionHotspot.open && (<LazyPanel importFn={() => import('@/components/map/MethaneEmissionHotspotMonitor')} exportName="MethaneEmissionHotspotMonitor" shouldLoad={true} />)}
      {coastalUpwelling.open && (<LazyPanel importFn={() => import('@/components/map/CoastalUpwellingMonitor')} exportName="CoastalUpwellingMonitor" shouldLoad={true} />)}
      {spaceDebrisOrbit.open && (<LazyPanel importFn={() => import('@/components/map/SpaceDebrisOrbitTracker')} exportName="SpaceDebrisOrbitTracker" shouldLoad={true} />)}
      {tectonicPlateBoundary.open && (<LazyPanel importFn={() => import('@/components/map/TectonicPlateBoundaryMonitor')} exportName="TectonicPlateBoundaryMonitor" shouldLoad={true} />)}

      {/* Task 73: New Monitoring Panels */}
      {landslideSusceptibility.open && (<LazyPanel importFn={() => import('@/components/map/LandslideSusceptibilityMonitor')} exportName="LandslideSusceptibilityMonitor" shouldLoad={true} />)}
      {solarFlareActivity.open && (<LazyPanel importFn={() => import('@/components/map/SolarFlareActivityMonitor')} exportName="SolarFlareActivityMonitor" shouldLoad={true} />)}
      {riverDeltaErosion.open && (<LazyPanel importFn={() => import('@/components/map/RiverDeltaErosionMonitor')} exportName="RiverDeltaErosionMonitor" shouldLoad={true} />)}
      {seaIceThickness.open && (<LazyPanel importFn={() => import('@/components/map/SeaIceThicknessMonitor')} exportName="SeaIceThicknessMonitor" shouldLoad={true} />)}
      {urbanAirQuality.open && (<LazyPanel importFn={() => import('@/components/map/UrbanAirQualityMonitor')} exportName="UrbanAirQualityMonitor" shouldLoad={true} />)}
      {geothermalEnergy.open && (<LazyPanel importFn={() => import('@/components/map/GeothermalEnergyMonitor')} exportName="GeothermalEnergyMonitor" shouldLoad={true} />)}
      {aquiferSalinization.open && (<LazyPanel importFn={() => import('@/components/map/AquiferSalinizationMonitor')} exportName="AquiferSalinizationMonitor" shouldLoad={true} />)}
      {biomassBurning.open && (<LazyPanel importFn={() => import('@/components/map/BiomassBurningMonitor')} exportName="BiomassBurningMonitor" shouldLoad={true} />)}

      {/* Task 74: New Monitoring Panels */}
      {glacialLakeOutburst.open && (<LazyPanel importFn={() => import('@/components/map/GlacialLakeOutburstMonitor')} exportName="GlacialLakeOutburstMonitor" shouldLoad={true} />)}
      {oceanMicroplastic.open && (<LazyPanel importFn={() => import('@/components/map/OceanMicroplasticTracker')} exportName="OceanMicroplasticTracker" shouldLoad={true} />)}
      {volcanicAshDispersion.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicAshDispersionMonitor')} exportName="VolcanicAshDispersionMonitor" shouldLoad={true} />)}
      {droughtSeverity.open && (<LazyPanel importFn={() => import('@/components/map/DroughtSeverityMonitor')} exportName="DroughtSeverityMonitor" shouldLoad={true} />)}
      {tsunamiWaveHeight.open && (<LazyPanel importFn={() => import('@/components/map/TsunamiWaveHeightMonitor')} exportName="TsunamiWaveHeightMonitor" shouldLoad={true} />)}
      {caveEcosystem.open && (<LazyPanel importFn={() => import('@/components/map/CaveEcosystemMonitor')} exportName="CaveEcosystemMonitor" shouldLoad={true} />)}
      {solarIrradiance.open && (<LazyPanel importFn={() => import('@/components/map/SolarIrradianceMonitor')} exportName="SolarIrradianceMonitor" shouldLoad={true} />)}
      {peatlandRestoration.open && (<LazyPanel importFn={() => import('@/components/map/PeatlandRestorationTracker')} exportName="PeatlandRestorationTracker" shouldLoad={true} />)}

      {/* Task 69: New Monitoring Panels */}
      {lavaFlow.open && (
        <LazyPanel importFn={() => import('@/components/map/LavaFlowTracker')} exportName="LavaFlowTracker" shouldLoad={true} />
      )}
      {tidalEnergy.open && (
        <LazyPanel importFn={() => import('@/components/map/TidalEnergyMonitor')} exportName="TidalEnergyMonitor" shouldLoad={true} />
      )}
      {peatFire.open && (
        <LazyPanel importFn={() => import('@/components/map/PeatFireMonitor')} exportName="PeatFireMonitor" shouldLoad={true} />
      )}
      {coralSpawn.open && (
        <LazyPanel importFn={() => import('@/components/map/CoralSpawnTracker')} exportName="CoralSpawnTracker" shouldLoad={true} />
      )}
      {glacierCalving.open && (
        <LazyPanel importFn={() => import('@/components/map/GlacierCalvingMonitor')} exportName="GlacierCalvingMonitor" shouldLoad={true} />
      )}
      {soilCarbon.open && (
        <LazyPanel importFn={() => import('@/components/map/SoilCarbonMonitor')} exportName="SoilCarbonMonitor" shouldLoad={true} />
      )}
      {urbanTreeCanopy.open && (
        <LazyPanel importFn={() => import('@/components/map/UrbanTreeCanopy')} exportName="UrbanTreeCanopy" shouldLoad={true} />
      )}
      {geomagneticPole.open && (
        <LazyPanel importFn={() => import('@/components/map/GeomagneticPoleTracker')} exportName="GeomagneticPoleTracker" shouldLoad={true} />
      )}

      {/* Task 68: Monitoring Panels */}
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
