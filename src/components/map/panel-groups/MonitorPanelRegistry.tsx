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
  // Task 75
  const mangroveCarbon = useMapStore((s) => s.mangroveCarbon)
  const oceanHeatContent = useMapStore((s) => s.oceanHeatContent)
  const dustStormTracker = useMapStore((s) => s.dustStormTracker)
  const coralDiseaseMonitor = useMapStore((s) => s.coralDiseaseMonitor)
  const iceShelfCollapse = useMapStore((s) => s.iceShelfCollapse)
  const urbanFloodRisk = useMapStore((s) => s.urbanFloodRisk)
  const phytoplanktonBloom = useMapStore((s) => s.phytoplanktonBloom)
  const submarineCanyon = useMapStore((s) => s.submarineCanyon)
  // Task 76
  const kelpForestMonitor = useMapStore((s) => s.kelpForestMonitor)
  const volcanicIslandFormation = useMapStore((s) => s.volcanicIslandFormation)
  const saltwaterIntrusion = useMapStore((s) => s.saltwaterIntrusion)
  const arcticShippingRoute = useMapStore((s) => s.arcticShippingRoute)
  const thermoclineDepth = useMapStore((s) => s.thermoclineDepth)
  const bioluminescentBay = useMapStore((s) => s.bioluminescentBay)
  const orographicRainfall = useMapStore((s) => s.orographicRainfall)
  const hydrothermalPlume = useMapStore((s) => s.hydrothermalPlume)
  // Task 77
  const seamountEcosystem = useMapStore((s) => s.seamountEcosystem)
  const groundSubsidence = useMapStore((s) => s.groundSubsidence)
  const oceanStratification = useMapStore((s) => s.oceanStratification)
  const snowCoverExtent = useMapStore((s) => s.snowCoverExtent)
  const coastalErosionDetail = useMapStore((s) => s.coastalErosionDetail)
  const ecosystemServiceValue = useMapStore((s) => s.ecosystemServiceValue)
  const tidalFlatMonitor = useMapStore((s) => s.tidalFlatMonitor)
  const wildfireRiskAssessment = useMapStore((s) => s.wildfireRiskAssessment)
  // Task 87
  const karstSinkhole = useMapStore((s) => s.karstSinkhole)
  const volcanicSO2 = useMapStore((s) => s.volcanicSO2)
  const icebergTracker = useMapStore((s) => s.icebergTracker)
  const caveMineral = useMapStore((s) => s.caveMineral)
  const seafloorHydrate = useMapStore((s) => s.seafloorHydrate)
  const mangroveLoss = useMapStore((s) => s.mangroveLoss)
  const urbanNoiseCorridor = useMapStore((s) => s.urbanNoiseCorridor)
  const stratosphericWarming = useMapStore((s) => s.stratosphericWarming)
  // Task 88
  const submarineGroundwater = useMapStore((s) => s.submarineGroundwater)
  const hydrothermalSulfide = useMapStore((s) => s.hydrothermalSulfide)
  const lunarTidalForce = useMapStore((s) => s.lunarTidalForce)
  const ripCurrent = useMapStore((s) => s.ripCurrent)
  const avalancheDebrisFlow = useMapStore((s) => s.avalancheDebrisFlow)
  const coastalAcidification = useMapStore((s) => s.coastalAcidification)
  const desertSandSea = useMapStore((s) => s.desertSandSea)
  const subsidenceHazard = useMapStore((s) => s.subsidenceHazard)
  // Task 89
  const volcanicLahar = useMapStore((s) => s.volcanicLahar)
  const deepWaterCoral = useMapStore((s) => s.deepWaterCoral)
  const polarBearHabitat = useMapStore((s) => s.polarBearHabitat)
  const soilSalinization = useMapStore((s) => s.soilSalinization)
  const tsunamiRunup = useMapStore((s) => s.tsunamiRunup)
  const urbanHeatVentilation = useMapStore((s) => s.urbanHeatVentilation)
  const brinePool = useMapStore((s) => s.brinePool)
  const supraglacialStream = useMapStore((s) => s.supraglacialStream)
  // Task 90
  const methaneHydrateStability = useMapStore((s) => s.methaneHydrateStability)
  const volcanicAshCloud = useMapStore((s) => s.volcanicAshCloud)
  const geothermalGradient = useMapStore((s) => s.geothermalGradient)
  const oceanDeoxygenation = useMapStore((s) => s.oceanDeoxygenation)
  const rockGlacier = useMapStore((s) => s.rockGlacier)
  const dustHemisphere = useMapStore((s) => s.dustHemisphere)
  const microplasticOcean = useMapStore((s) => s.microplasticOcean)
  const glacierBasalSlide = useMapStore((s) => s.glacierBasalSlide)
  // Task 90b
  const volcanicFumarole = useMapStore((s) => s.volcanicFumarole)
  const hydroclimateExtremes = useMapStore((s) => s.hydroclimateExtremes)
  const megafaunaTracking = useMapStore((s) => s.megafaunaTracking)
  const cryoconiteHole = useMapStore((s) => s.cryoconiteHole)
  const sapFlow = useMapStore((s) => s.sapFlow)
  const rockfallHazard = useMapStore((s) => s.rockfallHazard)
  const thermohalineCirculation = useMapStore((s) => s.thermohalineCirculation)
  const hydroseismicActivity = useMapStore((s) => s.hydroseismicActivity)
  // Task 91
  const lavaTubeCave = useMapStore((s) => s.lavaTubeCave)
  const submarineCanyonFisheries = useMapStore((s) => s.submarineCanyonFisheries)
  const polynyaIce = useMapStore((s) => s.polynyaIce)
  const volcanicDomeGrowth = useMapStore((s) => s.volcanicDomeGrowth)
  const seamountBiodiversity = useMapStore((s) => s.seamountBiodiversity)
  const estuaryAcidification = useMapStore((s) => s.estuaryAcidification)
  const abyssalSedimentFlux = useMapStore((s) => s.abyssalSedimentFlux)
  const glacialMoulin = useMapStore((s) => s.glacialMoulin)
  // Task 92
  const iceShelfCalving = useMapStore((s) => s.iceShelfCalving)
  const volcanicGasPlume = useMapStore((s) => s.volcanicGasPlume)
  const submarineLandslide = useMapStore((s) => s.submarineLandslide)
  const coastalWetlandLoss = useMapStore((s) => s.coastalWetlandLoss)
  const tundraPermafrostThaw = useMapStore((s) => s.tundraPermafrostThaw)
  const oceanCurrentProfiler = useMapStore((s) => s.oceanCurrentProfiler)
  const desertificationFront = useMapStore((s) => s.desertificationFront)
  const coralReefRecovery = useMapStore((s) => s.coralReefRecovery)
  // Task 93
  const methaneCrater = useMapStore((s) => s.methaneCrater)
  const subglacialVolcano = useMapStore((s) => s.subglacialVolcano)
  const coralSpawnPrediction = useMapStore((s) => s.coralSpawnPrediction)
  const hydrothermalDiffuseFlow = useMapStore((s) => s.hydrothermalDiffuseFlow)
  const permafrostCarbonPipeline = useMapStore((s) => s.permafrostCarbonPipeline)
  const subaqueousLavaFlow = useMapStore((s) => s.subaqueousLavaFlow)
  const intertidalZone = useMapStore((s) => s.intertidalZone)
  const desertFlashFlood = useMapStore((s) => s.desertFlashFlood)
  // Task 94
  const mudVolcanoActivity = useMapStore((s) => s.mudVolcanoActivity)
  const glacierSurgeEvent = useMapStore((s) => s.glacierSurgeEvent)
  const seicheWaveOscillation = useMapStore((s) => s.seicheWaveOscillation)
  const laharFlowTracker = useMapStore((s) => s.laharFlowTracker)
  const icePenitentMonitor = useMapStore((s) => s.icePenitentMonitor)
  const frostHeaveMonitor = useMapStore((s) => s.frostHeaveMonitor)
  const pumiceRaftDrift = useMapStore((s) => s.pumiceRaftDrift)
  const limnicEruptionMonitor = useMapStore((s) => s.limnicEruptionMonitor)
  // Task 95
  const volcanicTremor = useMapStore((s) => s.volcanicTremor)
  const iceWedgePolygon = useMapStore((s) => s.iceWedgePolygon)
  const saltFlatCrust = useMapStore((s) => s.saltFlatCrust)
  const coldWaterCoralReef = useMapStore((s) => s.coldWaterCoralReef)
  const peatlandCarbonSink = useMapStore((s) => s.peatlandCarbonSink)
  const hyporheicZone = useMapStore((s) => s.hyporheicZone)
  const submarineFan = useMapStore((s) => s.submarineFan)
  const coastalDuneSystem = useMapStore((s) => s.coastalDuneSystem)
  // Task 96
  const karstSpringDischarge = useMapStore((s) => s.karstSpringDischarge)
  const caveDripMonitor = useMapStore((s) => s.caveDripMonitor)
  const tidalCreekMonitor = useMapStore((s) => s.tidalCreekMonitor)
  const saltMarshCarbon = useMapStore((s) => s.saltMarshCarbon)
  const opalPaleoMonitor = useMapStore((s) => s.opalPaleoMonitor)
  const aeolianDustDeposition = useMapStore((s) => s.aeolianDustDeposition)
  const katabaticWindMonitor = useMapStore((s) => s.katabaticWindMonitor)
  const snowAvalancheTracker = useMapStore((s) => s.snowAvalancheTracker)
  // Task 97
  const riftValleyVolcano = useMapStore((s) => s.riftValleyVolcano)
  const streamBankErosion = useMapStore((s) => s.streamBankErosion)
  const iceStreamVelocity = useMapStore((s) => s.iceStreamVelocity)
  const coastalAquifer = useMapStore((s) => s.coastalAquifer)
  const mangroveRootSystem = useMapStore((s) => s.mangroveRootSystem)
  const paleoshorelineTracker = useMapStore((s) => s.paleoshorelineTracker)
  const cryoconiteGranule = useMapStore((s) => s.cryoconiteGranule)
  const subglacialWaterSystem = useMapStore((s) => s.subglacialWaterSystem)
  // Task 98
  const landslideVelocity = useMapStore((s) => s.landslideVelocity)
  const debrisFlowSurge = useMapStore((s) => s.debrisFlowSurge)
  const rockfallImpact = useMapStore((s) => s.rockfallImpact)
  const soilCreepRate = useMapStore((s) => s.soilCreepRate)
  const solifluctionLobe = useMapStore((s) => s.solifluctionLobe)
  const earthflowDisplacement = useMapStore((s) => s.earthflowDisplacement)
  const slumpFailure = useMapStore((s) => s.slumpFailure)
  const talusAccumulation = useMapStore((s) => s.talusAccumulation)
  // Task 99
  const breakwaterIntegrity = useMapStore((s) => s.breakwaterIntegrity)
  const seawallErosion = useMapStore((s) => s.seawallErosion)
  const groinSediment = useMapStore((s) => s.groinSediment)
  const revetmentStability = useMapStore((s) => s.revetmentStability)
  const jettyCurrent = useMapStore((s) => s.jettyCurrent)
  const beachNourishment = useMapStore((s) => s.beachNourishment)
  const coastalArmor = useMapStore((s) => s.coastalArmor)
  const shorelineRetreat = useMapStore((s) => s.shorelineRetreat)
  // Task 100
  const soilOrganicCarbon = useMapStore((s) => s.soilOrganicCarbon)
  const cationExchange = useMapStore((s) => s.cationExchange)
  const soilPhosphorus = useMapStore((s) => s.soilPhosphorus)
  const soilCompaction = useMapStore((s) => s.soilCompaction)
  const clayMineral = useMapStore((s) => s.clayMineral)
  const podzolProfile = useMapStore((s) => s.podzolProfile)
  const gleyRedox = useMapStore((s) => s.gleyRedox)
  const calcicHorizon = useMapStore((s) => s.calcicHorizon)
  // Task 101
  const oreGradeAssay = useMapStore((s) => s.oreGradeAssay)
  const mineTailingsDam = useMapStore((s) => s.mineTailingsDam)
  const mineralVeinThickness = useMapStore((s) => s.mineralVeinThickness)
  const stripMineRatio = useMapStore((s) => s.stripMineRatio)
  const undergroundMineVent = useMapStore((s) => s.undergroundMineVent)
  const acidMineDrainage = useMapStore((s) => s.acidMineDrainage)
  const oreReserveEstimate = useMapStore((s) => s.oreReserveEstimate)
  const mineralDepositGrade = useMapStore((s) => s.mineralDepositGrade)

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

      {/* Task 75: New Monitoring Panels */}
      {mangroveCarbon.open && (<LazyPanel importFn={() => import('@/components/map/MangroveCarbonMonitor')} exportName="MangroveCarbonMonitor" shouldLoad={true} />)}
      {oceanHeatContent.open && (<LazyPanel importFn={() => import('@/components/map/OceanHeatContentMonitor')} exportName="OceanHeatContentMonitor" shouldLoad={true} />)}
      {dustStormTracker.open && (<LazyPanel importFn={() => import('@/components/map/DustStormTrackerMonitor')} exportName="DustStormTrackerMonitor" shouldLoad={true} />)}
      {coralDiseaseMonitor.open && (<LazyPanel importFn={() => import('@/components/map/CoralDiseaseMonitor')} exportName="CoralDiseaseMonitor" shouldLoad={true} />)}
      {iceShelfCollapse.open && (<LazyPanel importFn={() => import('@/components/map/IceShelfCollapseMonitor')} exportName="IceShelfCollapseMonitor" shouldLoad={true} />)}
      {urbanFloodRisk.open && (<LazyPanel importFn={() => import('@/components/map/UrbanFloodRiskMonitor')} exportName="UrbanFloodRiskMonitor" shouldLoad={true} />)}
      {phytoplanktonBloom.open && (<LazyPanel importFn={() => import('@/components/map/PhytoplanktonBloomMonitor')} exportName="PhytoplanktonBloomMonitor" shouldLoad={true} />)}
      {submarineCanyon.open && (<LazyPanel importFn={() => import('@/components/map/SubmarineCanyonMonitor')} exportName="SubmarineCanyonMonitor" shouldLoad={true} />)}

      {/* Task 76: New Monitoring Panels */}
      {kelpForestMonitor.open && (<LazyPanel importFn={() => import('@/components/map/KelpForestMonitor')} exportName="KelpForestMonitor" shouldLoad={true} />)}
      {volcanicIslandFormation.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicIslandFormationMonitor')} exportName="VolcanicIslandFormationMonitor" shouldLoad={true} />)}
      {saltwaterIntrusion.open && (<LazyPanel importFn={() => import('@/components/map/SaltwaterIntrusionMonitor')} exportName="SaltwaterIntrusionMonitor" shouldLoad={true} />)}
      {arcticShippingRoute.open && (<LazyPanel importFn={() => import('@/components/map/ArcticShippingRouteMonitor')} exportName="ArcticShippingRouteMonitor" shouldLoad={true} />)}
      {thermoclineDepth.open && (<LazyPanel importFn={() => import('@/components/map/ThermoclineDepthMonitor')} exportName="ThermoclineDepthMonitor" shouldLoad={true} />)}
      {bioluminescentBay.open && (<LazyPanel importFn={() => import('@/components/map/BioluminescentBayMonitor')} exportName="BioluminescentBayMonitor" shouldLoad={true} />)}
      {orographicRainfall.open && (<LazyPanel importFn={() => import('@/components/map/OrographicRainfallMonitor')} exportName="OrographicRainfallMonitor" shouldLoad={true} />)}
      {hydrothermalPlume.open && (<LazyPanel importFn={() => import('@/components/map/HydrothermalPlumeMonitor')} exportName="HydrothermalPlumeMonitor" shouldLoad={true} />)}

      {/* Task 77: New Monitoring Panels */}
      {seamountEcosystem.open && (<LazyPanel importFn={() => import('@/components/map/SeamountEcosystemMonitor')} exportName="SeamountEcosystemMonitor" shouldLoad={true} />)}
      {groundSubsidence.open && (<LazyPanel importFn={() => import('@/components/map/GroundSubsidenceMonitor')} exportName="GroundSubsidenceMonitor" shouldLoad={true} />)}
      {oceanStratification.open && (<LazyPanel importFn={() => import('@/components/map/OceanStratificationMonitor')} exportName="OceanStratificationMonitor" shouldLoad={true} />)}
      {snowCoverExtent.open && (<LazyPanel importFn={() => import('@/components/map/SnowCoverExtentMonitor')} exportName="SnowCoverExtentMonitor" shouldLoad={true} />)}
      {coastalErosionDetail.open && (<LazyPanel importFn={() => import('@/components/map/CoastalErosionDetailMonitor')} exportName="CoastalErosionDetailMonitor" shouldLoad={true} />)}
      {ecosystemServiceValue.open && (<LazyPanel importFn={() => import('@/components/map/EcosystemServiceValueMonitor')} exportName="EcosystemServiceValueMonitor" shouldLoad={true} />)}
      {tidalFlatMonitor.open && (<LazyPanel importFn={() => import('@/components/map/TidalFlatMonitor')} exportName="TidalFlatMonitor" shouldLoad={true} />)}
      {wildfireRiskAssessment.open && (<LazyPanel importFn={() => import('@/components/map/WildfireRiskAssessmentMonitor')} exportName="WildfireRiskAssessmentMonitor" shouldLoad={true} />)}

      {/* Task 87: New Monitoring Panels */}
      {karstSinkhole.open && (<LazyPanel importFn={() => import('@/components/map/KarstSinkholeMonitor')} exportName="KarstSinkholeMonitor" shouldLoad={true} />)}
      {volcanicSO2.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicSulfurDioxideMonitor')} exportName="VolcanicSulfurDioxideMonitor" shouldLoad={true} />)}
      {icebergTracker.open && (<LazyPanel importFn={() => import('@/components/map/IcebergTrackerMonitor')} exportName="IcebergTrackerMonitor" shouldLoad={true} />)}
      {caveMineral.open && (<LazyPanel importFn={() => import('@/components/map/CaveMineralFormationMonitor')} exportName="CaveMineralFormationMonitor" shouldLoad={true} />)}
      {seafloorHydrate.open && (<LazyPanel importFn={() => import('@/components/map/SeafloorHydrateMonitor')} exportName="SeafloorHydrateMonitor" shouldLoad={true} />)}
      {mangroveLoss.open && (<LazyPanel importFn={() => import('@/components/map/MangroveLossMonitor')} exportName="MangroveLossMonitor" shouldLoad={true} />)}
      {urbanNoiseCorridor.open && (<LazyPanel importFn={() => import('@/components/map/UrbanNoiseCorridorMonitor')} exportName="UrbanNoiseCorridorMonitor" shouldLoad={true} />)}
      {stratosphericWarming.open && (<LazyPanel importFn={() => import('@/components/map/StratosphericWarmingMonitor')} exportName="StratosphericWarmingMonitor" shouldLoad={true} />)}

      {/* Task 88: New Monitoring Panels */}
      {submarineGroundwater.open && (<LazyPanel importFn={() => import('@/components/map/SubmarineGroundwaterMonitor')} exportName="SubmarineGroundwaterMonitor" shouldLoad={true} />)}
      {hydrothermalSulfide.open && (<LazyPanel importFn={() => import('@/components/map/HydrothermalSulfideMonitor')} exportName="HydrothermalSulfideMonitor" shouldLoad={true} />)}
      {lunarTidalForce.open && (<LazyPanel importFn={() => import('@/components/map/LunarTidalForceMonitor')} exportName="LunarTidalForceMonitor" shouldLoad={true} />)}
      {ripCurrent.open && (<LazyPanel importFn={() => import('@/components/map/RipCurrentMonitor')} exportName="RipCurrentMonitor" shouldLoad={true} />)}
      {avalancheDebrisFlow.open && (<LazyPanel importFn={() => import('@/components/map/AvalancheDebrisFlowMonitor')} exportName="AvalancheDebrisFlowMonitor" shouldLoad={true} />)}
      {coastalAcidification.open && (<LazyPanel importFn={() => import('@/components/map/CoastalAcidificationMonitor')} exportName="CoastalAcidificationMonitor" shouldLoad={true} />)}
      {desertSandSea.open && (<LazyPanel importFn={() => import('@/components/map/DesertSandSeaMonitor')} exportName="DesertSandSeaMonitor" shouldLoad={true} />)}
      {subsidenceHazard.open && (<LazyPanel importFn={() => import('@/components/map/SubsidenceHazardMonitor')} exportName="SubsidenceHazardMonitor" shouldLoad={true} />)}

      {/* Task 89: New Monitoring Panels */}
      {volcanicLahar.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicLaharMonitor')} exportName="VolcanicLaharMonitor" shouldLoad={true} />)}
      {deepWaterCoral.open && (<LazyPanel importFn={() => import('@/components/map/DeepWaterCoralMonitor')} exportName="DeepWaterCoralMonitor" shouldLoad={true} />)}
      {polarBearHabitat.open && (<LazyPanel importFn={() => import('@/components/map/PolarBearHabitatMonitor')} exportName="PolarBearHabitatMonitor" shouldLoad={true} />)}
      {soilSalinization.open && (<LazyPanel importFn={() => import('@/components/map/SoilSalinizationMonitor')} exportName="SoilSalinizationMonitor" shouldLoad={true} />)}
      {tsunamiRunup.open && (<LazyPanel importFn={() => import('@/components/map/TsunamiRunupMonitor')} exportName="TsunamiRunupMonitor" shouldLoad={true} />)}
      {urbanHeatVentilation.open && (<LazyPanel importFn={() => import('@/components/map/UrbanHeatVentilationMonitor')} exportName="UrbanHeatVentilationMonitor" shouldLoad={true} />)}
      {brinePool.open && (<LazyPanel importFn={() => import('@/components/map/BrinePoolMonitor')} exportName="BrinePoolMonitor" shouldLoad={true} />)}
      {supraglacialStream.open && (<LazyPanel importFn={() => import('@/components/map/SupraglacialStreamMonitor')} exportName="SupraglacialStreamMonitor" shouldLoad={true} />)}

      {/* Task 90: New Monitoring Panels */}
      {methaneHydrateStability.open && (<LazyPanel importFn={() => import('@/components/map/MethaneHydrateStabilityMonitor')} exportName="MethaneHydrateStabilityMonitor" shouldLoad={true} />)}
      {volcanicAshCloud.open && (<LazyPanel importFn={() => import('@/components/map/VolcanicAshCloudMonitor')} exportName="VolcanicAshCloudMonitor" shouldLoad={true} />)}
      {geothermalGradient.open && (<LazyPanel importFn={() => import('@/components/map/GeothermalGradientMonitor')} exportName="GeothermalGradientMonitor" shouldLoad={true} />)}
      {oceanDeoxygenation.open && (<LazyPanel importFn={() => import('@/components/map/OceanDeoxygenationMonitor')} exportName="OceanDeoxygenationMonitor" shouldLoad={true} />)}
      {rockGlacier.open && (<LazyPanel importFn={() => import('@/components/map/RockGlacierMonitor')} exportName="RockGlacierMonitor" shouldLoad={true} />)}
      {dustHemisphere.open && (<LazyPanel importFn={() => import('@/components/map/DustHemisphereTransportMonitor')} exportName="DustHemisphereTransportMonitor" shouldLoad={true} />)}
      {microplasticOcean.open && (<LazyPanel importFn={() => import('@/components/map/MicroplasticOceanMonitor')} exportName="MicroplasticOceanMonitor" shouldLoad={true} />)}
      {glacierBasalSlide.open && (<LazyPanel importFn={() => import('@/components/map/GlacierBasalSlideMonitor')} exportName="GlacierBasalSlideMonitor" shouldLoad={true} />)}

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
      {/* Task 90b: New Monitoring Panels */}
      {volcanicFumarole.open && (
        <LazyPanel importFn={() => import('@/components/map/VolcanicFumaroleMonitor')} exportName="VolcanicFumaroleMonitor" shouldLoad={true} />
      )}
      {hydroclimateExtremes.open && (
        <LazyPanel importFn={() => import('@/components/map/HydroclimateExtremesMonitor')} exportName="HydroclimateExtremesMonitor" shouldLoad={true} />
      )}
      {megafaunaTracking.open && (
        <LazyPanel importFn={() => import('@/components/map/MegafaunaTracker')} exportName="MegafaunaTracker" shouldLoad={true} />
      )}
      {cryoconiteHole.open && (
        <LazyPanel importFn={() => import('@/components/map/CryoconiteHoleMonitor')} exportName="CryoconiteHoleMonitor" shouldLoad={true} />
      )}
      {sapFlow.open && (
        <LazyPanel importFn={() => import('@/components/map/SapFlowMonitor')} exportName="SapFlowMonitor" shouldLoad={true} />
      )}
      {rockfallHazard.open && (
        <LazyPanel importFn={() => import('@/components/map/RockfallHazardMonitor')} exportName="RockfallHazardMonitor" shouldLoad={true} />
      )}
      {thermohalineCirculation.open && (
        <LazyPanel importFn={() => import('@/components/map/ThermohalineCirculationMonitor')} exportName="ThermohalineCirculationMonitor" shouldLoad={true} />
      )}
      {hydroseismicActivity.open && (
        <LazyPanel importFn={() => import('@/components/map/HydroseismicActivityMonitor')} exportName="HydroseismicActivityMonitor" shouldLoad={true} />
      )}
      {/* Task 91: New Monitoring Panels */}
      {lavaTubeCave.open && (
        <LazyPanel importFn={() => import('@/components/map/LavaTubeCaveMonitor')} exportName="LavaTubeCaveMonitor" shouldLoad={true} />
      )}
      {submarineCanyonFisheries.open && (
        <LazyPanel importFn={() => import('@/components/map/SubmarineCanyonFisheriesMonitor')} exportName="SubmarineCanyonFisheriesMonitor" shouldLoad={true} />
      )}
      {polynyaIce.open && (
        <LazyPanel importFn={() => import('@/components/map/PolynyaIceMonitor')} exportName="PolynyaIceMonitor" shouldLoad={true} />
      )}
      {volcanicDomeGrowth.open && (
        <LazyPanel importFn={() => import('@/components/map/VolcanicDomeGrowthMonitor')} exportName="VolcanicDomeGrowthMonitor" shouldLoad={true} />
      )}
      {seamountBiodiversity.open && (
        <LazyPanel importFn={() => import('@/components/map/SeamountBiodiversityMonitor')} exportName="SeamountBiodiversityMonitor" shouldLoad={true} />
      )}
      {estuaryAcidification.open && (
        <LazyPanel importFn={() => import('@/components/map/EstuaryAcidificationMonitor')} exportName="EstuaryAcidificationMonitor" shouldLoad={true} />
      )}
      {abyssalSedimentFlux.open && (
        <LazyPanel importFn={() => import('@/components/map/AbyssalSedimentFluxMonitor')} exportName="AbyssalSedimentFluxMonitor" shouldLoad={true} />
      )}
      {glacialMoulin.open && (
        <LazyPanel importFn={() => import('@/components/map/GlacialMoulinExplorer')} exportName="GlacialMoulinExplorer" shouldLoad={true} />
      )}
      {/* Task 92: New Monitoring Panels */}
      {iceShelfCalving.open && (
        <LazyPanel importFn={() => import('@/components/map/IceShelfCalvingMonitor')} exportName="IceShelfCalvingMonitor" shouldLoad={true} />
      )}
      {volcanicGasPlume.open && (
        <LazyPanel importFn={() => import('@/components/map/VolcanicGasPlumeTracker')} exportName="VolcanicGasPlumeTracker" shouldLoad={true} />
      )}
      {submarineLandslide.open && (
        <LazyPanel importFn={() => import('@/components/map/SubmarineLandslideMonitor')} exportName="SubmarineLandslideMonitor" shouldLoad={true} />
      )}
      {coastalWetlandLoss.open && (
        <LazyPanel importFn={() => import('@/components/map/CoastalWetlandLossMonitor')} exportName="CoastalWetlandLossMonitor" shouldLoad={true} />
      )}
      {tundraPermafrostThaw.open && (
        <LazyPanel importFn={() => import('@/components/map/TundraPermafrostThawMonitor')} exportName="TundraPermafrostThawMonitor" shouldLoad={true} />
      )}
      {oceanCurrentProfiler.open && (
        <LazyPanel importFn={() => import('@/components/map/OceanCurrentProfilerMonitor')} exportName="OceanCurrentProfilerMonitor" shouldLoad={true} />
      )}
      {desertificationFront.open && (
        <LazyPanel importFn={() => import('@/components/map/DesertificationFrontMonitor')} exportName="DesertificationFrontMonitor" shouldLoad={true} />
      )}
      {coralReefRecovery.open && (
        <LazyPanel importFn={() => import('@/components/map/CoralReefRecoveryMonitor')} exportName="CoralReefRecoveryMonitor" shouldLoad={true} />
      )}
      {/* Task 93: New Monitoring Panels */}
      {methaneCrater.open && (
        <LazyPanel importFn={() => import('@/components/map/MethaneCraterMonitor')} exportName="MethaneCraterMonitor" shouldLoad={true} />
      )}
      {subglacialVolcano.open && (
        <LazyPanel importFn={() => import('@/components/map/SubglacialVolcanoTracker')} exportName="SubglacialVolcanoTracker" shouldLoad={true} />
      )}
      {coralSpawnPrediction.open && (
        <LazyPanel importFn={() => import('@/components/map/CoralSpawnPredictionMonitor')} exportName="CoralSpawnPredictionMonitor" shouldLoad={true} />
      )}
      {hydrothermalDiffuseFlow.open && (
        <LazyPanel importFn={() => import('@/components/map/HydrothermalDiffuseFlowMonitor')} exportName="HydrothermalDiffuseFlowMonitor" shouldLoad={true} />
      )}
      {permafrostCarbonPipeline.open && (
        <LazyPanel importFn={() => import('@/components/map/PermafrostCarbonPipelineMonitor')} exportName="PermafrostCarbonPipelineMonitor" shouldLoad={true} />
      )}
      {subaqueousLavaFlow.open && (
        <LazyPanel importFn={() => import('@/components/map/SubaqueousLavaFlowMonitor')} exportName="SubaqueousLavaFlowMonitor" shouldLoad={true} />
      )}
      {intertidalZone.open && (
        <LazyPanel importFn={() => import('@/components/map/IntertidalZoneMonitor')} exportName="IntertidalZoneMonitor" shouldLoad={true} />
      )}
      {desertFlashFlood.open && (
        <LazyPanel importFn={() => import('@/components/map/DesertFlashFloodMonitor')} exportName="DesertFlashFloodMonitor" shouldLoad={true} />
      )}
      {/* Task 94: New Monitoring Panels */}
      {mudVolcanoActivity.open && (
        <LazyPanel importFn={() => import('@/components/map/MudVolcanoActivityMonitor')} exportName="MudVolcanoActivityMonitor" shouldLoad={true} />
      )}
      {glacierSurgeEvent.open && (
        <LazyPanel importFn={() => import('@/components/map/GlacierSurgeEventMonitor')} exportName="GlacierSurgeEventMonitor" shouldLoad={true} />
      )}
      {seicheWaveOscillation.open && (
        <LazyPanel importFn={() => import('@/components/map/SeicheWaveOscillationMonitor')} exportName="SeicheWaveOscillationMonitor" shouldLoad={true} />
      )}
      {laharFlowTracker.open && (
        <LazyPanel importFn={() => import('@/components/map/LaharFlowTracker')} exportName="LaharFlowTracker" shouldLoad={true} />
      )}
      {icePenitentMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/IcePenitentMonitor')} exportName="IcePenitentMonitor" shouldLoad={true} />
      )}
      {frostHeaveMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/FrostHeaveMonitor')} exportName="FrostHeaveMonitor" shouldLoad={true} />
      )}
      {pumiceRaftDrift.open && (
        <LazyPanel importFn={() => import('@/components/map/PumiceRaftDriftTracker')} exportName="PumiceRaftDriftTracker" shouldLoad={true} />
      )}
      {limnicEruptionMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/LimnicEruptionMonitor')} exportName="LimnicEruptionMonitor" shouldLoad={true} />
      )}
      {/* Task 95: New Monitoring Panels */}
      {volcanicTremor.open && (
        <LazyPanel importFn={() => import('@/components/map/VolcanicTremorMonitor')} exportName="VolcanicTremorMonitor" shouldLoad={true} />
      )}
      {iceWedgePolygon.open && (
        <LazyPanel importFn={() => import('@/components/map/IceWedgePolygonMonitor')} exportName="IceWedgePolygonMonitor" shouldLoad={true} />
      )}
      {saltFlatCrust.open && (
        <LazyPanel importFn={() => import('@/components/map/SaltFlatCrustMonitor')} exportName="SaltFlatCrustMonitor" shouldLoad={true} />
      )}
      {coldWaterCoralReef.open && (
        <LazyPanel importFn={() => import('@/components/map/ColdWaterCoralReefMonitor')} exportName="ColdWaterCoralReefMonitor" shouldLoad={true} />
      )}
      {peatlandCarbonSink.open && (
        <LazyPanel importFn={() => import('@/components/map/PeatlandCarbonSinkMonitor')} exportName="PeatlandCarbonSinkMonitor" shouldLoad={true} />
      )}
      {hyporheicZone.open && (
        <LazyPanel importFn={() => import('@/components/map/HyporheicZoneMonitor')} exportName="HyporheicZoneMonitor" shouldLoad={true} />
      )}
      {submarineFan.open && (
        <LazyPanel importFn={() => import('@/components/map/SubmarineFanMonitor')} exportName="SubmarineFanMonitor" shouldLoad={true} />
      )}
      {coastalDuneSystem.open && (
        <LazyPanel importFn={() => import('@/components/map/CoastalDuneSystemMonitor')} exportName="CoastalDuneSystemMonitor" shouldLoad={true} />
      )}
      {/* Task 96: New Monitoring Panels */}
      {karstSpringDischarge.open && (
        <LazyPanel importFn={() => import('@/components/map/KarstSpringDischargeMonitor')} exportName="KarstSpringDischargeMonitor" shouldLoad={true} />
      )}
      {caveDripMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/CaveDripMonitorPanel')} exportName="CaveDripMonitorPanel" shouldLoad={true} />
      )}
      {tidalCreekMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/TidalCreekMonitor')} exportName="TidalCreekMonitor" shouldLoad={true} />
      )}
      {saltMarshCarbon.open && (
        <LazyPanel importFn={() => import('@/components/map/SaltMarshCarbonMonitor')} exportName="SaltMarshCarbonMonitor" shouldLoad={true} />
      )}
      {opalPaleoMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/OpalPaleoMonitor')} exportName="OpalPaleoMonitor" shouldLoad={true} />
      )}
      {aeolianDustDeposition.open && (
        <LazyPanel importFn={() => import('@/components/map/AeolianDustDepositionMonitor')} exportName="AeolianDustDepositionMonitor" shouldLoad={true} />
      )}
      {katabaticWindMonitor.open && (
        <LazyPanel importFn={() => import('@/components/map/KatabaticWindMonitor')} exportName="KatabaticWindMonitor" shouldLoad={true} />
      )}
      {snowAvalancheTracker.open && (
        <LazyPanel importFn={() => import('@/components/map/SnowAvalancheTracker')} exportName="SnowAvalancheTracker" shouldLoad={true} />
      )}
      {/* Task 97: New Monitoring Panels */}
      {riftValleyVolcano.open && (
        <LazyPanel importFn={() => import('@/components/map/RiftValleyVolcanoMonitor')} exportName="RiftValleyVolcanoMonitor" shouldLoad={true} />
      )}
      {streamBankErosion.open && (
        <LazyPanel importFn={() => import('@/components/map/StreamBankErosionMonitor')} exportName="StreamBankErosionMonitor" shouldLoad={true} />
      )}
      {iceStreamVelocity.open && (
        <LazyPanel importFn={() => import('@/components/map/IceStreamVelocityMonitor')} exportName="IceStreamVelocityMonitor" shouldLoad={true} />
      )}
      {coastalAquifer.open && (
        <LazyPanel importFn={() => import('@/components/map/CoastalAquiferMonitor')} exportName="CoastalAquiferMonitor" shouldLoad={true} />
      )}
      {mangroveRootSystem.open && (
        <LazyPanel importFn={() => import('@/components/map/MangroveRootSystemMonitor')} exportName="MangroveRootSystemMonitor" shouldLoad={true} />
      )}
      {paleoshorelineTracker.open && (
        <LazyPanel importFn={() => import('@/components/map/PaleoshorelineTracker')} exportName="PaleoshorelineTracker" shouldLoad={true} />
      )}
      {cryoconiteGranule.open && (
        <LazyPanel importFn={() => import('@/components/map/CryoconiteGranuleMonitor')} exportName="CryoconiteGranuleMonitor" shouldLoad={true} />
      )}
      {subglacialWaterSystem.open && (
        <LazyPanel importFn={() => import('@/components/map/SubglacialWaterSystemMonitor')} exportName="SubglacialWaterSystemMonitor" shouldLoad={true} />
      )}
      {/* Task 98: Mass Wasting and Slope Processes */}
      {landslideVelocity.open && (
        <LazyPanel importFn={() => import('@/components/map/LandslideVelocityMonitor')} exportName="LandslideVelocityMonitor" shouldLoad={true} />
      )}
      {debrisFlowSurge.open && (
        <LazyPanel importFn={() => import('@/components/map/DebrisFlowSurgeMonitor')} exportName="DebrisFlowSurgeMonitor" shouldLoad={true} />
      )}
      {rockfallImpact.open && (
        <LazyPanel importFn={() => import('@/components/map/RockfallImpactMonitor')} exportName="RockfallImpactMonitor" shouldLoad={true} />
      )}
      {soilCreepRate.open && (
        <LazyPanel importFn={() => import('@/components/map/SoilCreepRateMonitor')} exportName="SoilCreepRateMonitor" shouldLoad={true} />
      )}
      {solifluctionLobe.open && (
        <LazyPanel importFn={() => import('@/components/map/SolifluctionLobeMonitor')} exportName="SolifluctionLobeMonitor" shouldLoad={true} />
      )}
      {earthflowDisplacement.open && (
        <LazyPanel importFn={() => import('@/components/map/EarthflowDisplacementMonitor')} exportName="EarthflowDisplacementMonitor" shouldLoad={true} />
      )}
      {slumpFailure.open && (
        <LazyPanel importFn={() => import('@/components/map/SlumpFailureMonitor')} exportName="SlumpFailureMonitor" shouldLoad={true} />
      )}
      {talusAccumulation.open && (
        <LazyPanel importFn={() => import('@/components/map/TalusAccumulationMonitor')} exportName="TalusAccumulationMonitor" shouldLoad={true} />
      )}
      {/* Task 99: Coastal Engineering and Shore Protection */}
      {breakwaterIntegrity.open && (
        <LazyPanel importFn={() => import('@/components/map/BreakwaterIntegrityMonitor')} exportName="BreakwaterIntegrityMonitor" shouldLoad={true} />
      )}
      {seawallErosion.open && (
        <LazyPanel importFn={() => import('@/components/map/SeawallErosionMonitor')} exportName="SeawallErosionMonitor" shouldLoad={true} />
      )}
      {groinSediment.open && (
        <LazyPanel importFn={() => import('@/components/map/GroinSedimentMonitor')} exportName="GroinSedimentMonitor" shouldLoad={true} />
      )}
      {revetmentStability.open && (
        <LazyPanel importFn={() => import('@/components/map/RevetmentStabilityMonitor')} exportName="RevetmentStabilityMonitor" shouldLoad={true} />
      )}
      {jettyCurrent.open && (
        <LazyPanel importFn={() => import('@/components/map/JettyCurrentMonitor')} exportName="JettyCurrentMonitor" shouldLoad={true} />
      )}
      {beachNourishment.open && (
        <LazyPanel importFn={() => import('@/components/map/BeachNourishmentMonitor')} exportName="BeachNourishmentMonitor" shouldLoad={true} />
      )}
      {coastalArmor.open && (
        <LazyPanel importFn={() => import('@/components/map/CoastalArmorMonitor')} exportName="CoastalArmorMonitor" shouldLoad={true} />
      )}
      {shorelineRetreat.open && (
        <LazyPanel importFn={() => import('@/components/map/ShorelineRetreatMonitor')} exportName="ShorelineRetreatMonitor" shouldLoad={true} />
      )}
      {/* Task 100: Soil Science and Pedology */}
      {soilOrganicCarbon.open && (
        <LazyPanel importFn={() => import('@/components/map/SoilOrganicCarbonMonitor')} exportName="SoilOrganicCarbonMonitor" shouldLoad={true} />
      )}
      {cationExchange.open && (
        <LazyPanel importFn={() => import('@/components/map/CationExchangeMonitor')} exportName="CationExchangeMonitor" shouldLoad={true} />
      )}
      {soilPhosphorus.open && (
        <LazyPanel importFn={() => import('@/components/map/SoilPhosphorusMonitor')} exportName="SoilPhosphorusMonitor" shouldLoad={true} />
      )}
      {soilCompaction.open && (
        <LazyPanel importFn={() => import('@/components/map/SoilCompactionMonitor')} exportName="SoilCompactionMonitor" shouldLoad={true} />
      )}
      {clayMineral.open && (
        <LazyPanel importFn={() => import('@/components/map/ClayMineralMonitor')} exportName="ClayMineralMonitor" shouldLoad={true} />
      )}
      {podzolProfile.open && (
        <LazyPanel importFn={() => import('@/components/map/PodzolProfileMonitor')} exportName="PodzolProfileMonitor" shouldLoad={true} />
      )}
      {gleyRedox.open && (
        <LazyPanel importFn={() => import('@/components/map/GleyRedoxMonitor')} exportName="GleyRedoxMonitor" shouldLoad={true} />
      )}
      {calcicHorizon.open && (
        <LazyPanel importFn={() => import('@/components/map/CalcicHorizonMonitor')} exportName="CalcicHorizonMonitor" shouldLoad={true} />
      )}
      {/* Task 101: Mineral Resources and Mining */}
      {oreGradeAssay.open && (
        <LazyPanel importFn={() => import('@/components/map/OreGradeAssayMonitor')} exportName="OreGradeAssayMonitor" shouldLoad={true} />
      )}
      {mineTailingsDam.open && (
        <LazyPanel importFn={() => import('@/components/map/MineTailingsDamMonitor')} exportName="MineTailingsDamMonitor" shouldLoad={true} />
      )}
      {mineralVeinThickness.open && (
        <LazyPanel importFn={() => import('@/components/map/MineralVeinThicknessMonitor')} exportName="MineralVeinThicknessMonitor" shouldLoad={true} />
      )}
      {stripMineRatio.open && (
        <LazyPanel importFn={() => import('@/components/map/StripMineRatioMonitor')} exportName="StripMineRatioMonitor" shouldLoad={true} />
      )}
      {undergroundMineVent.open && (
        <LazyPanel importFn={() => import('@/components/map/UndergroundMineVentMonitor')} exportName="UndergroundMineVentMonitor" shouldLoad={true} />
      )}
      {acidMineDrainage.open && (
        <LazyPanel importFn={() => import('@/components/map/AcidMineDrainageMonitor')} exportName="AcidMineDrainageMonitor" shouldLoad={true} />
      )}
      {oreReserveEstimate.open && (
        <LazyPanel importFn={() => import('@/components/map/OreReserveEstimateMonitor')} exportName="OreReserveEstimateMonitor" shouldLoad={true} />
      )}
      {mineralDepositGrade.open && (
        <LazyPanel importFn={() => import('@/components/map/MineralDepositGradeMonitor')} exportName="MineralDepositGradeMonitor" shouldLoad={true} />
      )}
    </>
  )
}
