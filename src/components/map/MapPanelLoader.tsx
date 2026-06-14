'use client'

import React, { useState, useEffect, useMemo, ComponentType } from 'react'
import dynamic from 'next/dynamic'
import { useMapStore } from '@/lib/map-store'

// === Essential Core Components (always visible) ===
const MapView = dynamic(() => import('@/components/map/MapView').then((m) => ({ default: m.MapView })), { ssr: false })
const MapSidebar = dynamic(() => import('@/components/map/MapSidebar').then((m) => ({ default: m.MapSidebar })), { ssr: false })
const SearchBar = dynamic(() => import('@/components/map/SearchBar').then((m) => ({ default: m.SearchBar })), { ssr: false })
const StyleSwitcher = dynamic(() => import('@/components/map/StyleSwitcher').then((m) => ({ default: m.StyleSwitcher })), { ssr: false })
const CoordinatesDisplay = dynamic(() => import('@/components/map/CoordinatesDisplay').then((m) => ({ default: m.CoordinatesDisplay })), { ssr: false })
const MapToolbar = dynamic(() => import('@/components/map/MapToolbar').then((m) => ({ default: m.MapToolbar })), { ssr: false })
const ThemeToggle = dynamic(() => import('@/components/map/ThemeToggle').then((m) => ({ default: m.ThemeToggle })), { ssr: false })
const MapStatsPanel = dynamic(() => import('@/components/map/MapStatsPanel').then((m) => ({ default: m.MapStatsPanel })), { ssr: false })
const CompassIndicator = dynamic(() => import('@/components/map/CompassIndicator').then((m) => ({ default: m.CompassIndicator })), { ssr: false })
const MiniMap = dynamic(() => import('@/components/map/MiniMap').then((m) => ({ default: m.MiniMap })), { ssr: false })
const MapLegend = dynamic(() => import('@/components/map/MapLegend').then((m) => ({ default: m.MapLegend })), { ssr: false })
const MapNotifications = dynamic(() => import('@/components/map/MapNotifications').then((m) => ({ default: m.MapNotifications })), { ssr: false })
const PWAInstallBanner = dynamic(() => import('@/components/map/PWAInstallBanner').then((m) => ({ default: m.PWAInstallBanner })), { ssr: false })
const OfflineIndicator = dynamic(() => import('@/components/map/OfflineIndicator').then((m) => ({ default: m.OfflineIndicator })), { ssr: false })
const CustomCompassRose = dynamic(() => import('@/components/map/CustomCompassRose').then((m) => ({ default: m.CustomCompassRose })), { ssr: false })
const TrackRecordButton = dynamic(() => import('@/components/map/TrackRecorder').then((m) => ({ default: m.TrackRecordButton })), { ssr: false })
const MapNotesLayer = dynamic(() => import('@/components/map/MapNotes').then((m) => ({ default: m.MapNotesLayer })), { ssr: false })
const MapAnnotationsLayer = dynamic(() => import('@/components/map/MapAnnotationsLayer').then((m) => ({ default: m.MapAnnotationsLayer })), { ssr: false })

// === On-Demand Panel Loading ===
// Monitoring panels are loaded on demand using a client-side dynamic import mechanism
// that bypasses webpack's static analysis. When a user opens a panel, the corresponding
// group file is fetched and the component is rendered.

const panelCache: Record<string, ComponentType> = {}
const panelLoading: Record<string, Promise<ComponentType>> = {}

async function loadPanelGroup(groupId: string) {
  if (panelCache[groupId]) return panelCache[groupId]
  if (panelLoading[groupId]) return panelLoading[groupId]
  
  const groupMap: Record<string, () => Promise<any>> = {
    'A': () => import('@/components/map/panels/GroupA'),
    'B': () => import('@/components/map/panels/GroupB'),
    'C': () => import('@/components/map/panels/GroupC'),
    'D': () => import('@/components/map/panels/GroupD'),
    'E': () => import('@/components/map/panels/GroupE'),
    'F': () => import('@/components/map/panels/GroupF'),
    'G': () => import('@/components/map/panels/GroupG'),
    'H': () => import('@/components/map/panels/GroupH'),
    'I': () => import('@/components/map/panels/GroupI'),
    'J': () => import('@/components/map/panels/GroupJ'),
    'K': () => import('@/components/map/panels/GroupK'),
    'L': () => import('@/components/map/panels/GroupL'),
    'M': () => import('@/components/map/panels/GroupM'),
    'N': () => import('@/components/map/panels/GroupN'),
    'O': () => import('@/components/map/panels/GroupO'),
  }
  
  const loader = groupMap[groupId]
  if (!loader) return null
  
  panelLoading[groupId] = loader().then((mod) => {
    const Component = mod[`Group${groupId}`]
    if (Component) {
      panelCache[groupId] = Component
    }
    return Component
  })
  
  return panelLoading[groupId]
}

// Panel to group mapping
const panelGroupMap: Record<string, string> = {
  WeatherPanel: 'A', ElevationProfile: 'A', SunPositionOverlay: 'A', SunInfoPanel: 'A',
  HeatmapLayer: 'A', HeatmapControls: 'A', MapComparison: 'A', WeatherComparison: 'A',
  EnhancedWeatherDashboard: 'A', SunShadowCalculator: 'A', CloudCoverAnalyzer: 'A',
  AtmosphericDashboard: 'A', AtmosphericRiverTracker: 'A', AirQualityPanel: 'A',
  AirQualityForecaster: 'A', AirQualityMonitor: 'A', PrecipitationAnalyzer: 'A',
  RainfallPatternAnalyzer: 'A', StratosphericWindMonitor: 'A', FogDensityMapper: 'A',
  TectonicPlateViewer: 'B', TectonicStrainMonitor: 'B', TectonicSubductionMonitor: 'B',
  GeomagneticStormTracker: 'B', GeomagneticReversalTracker: 'B', ContinentalDriftMonitor: 'B',
  SeismicActivityMap: 'B', EarthquakeSwarmMonitor: 'B', SeismicHazardAssessor: 'B',
  VolcanoMonitor: 'B', VolcanoSeismicMonitor: 'B', VolcanoThermalMonitor: 'B',
  VolcanicAshTracker: 'B', VolcanicGasMonitor: 'B', VolcanicPlumeTracker: 'B',
  VolcanicDeformationMapper: 'B', VolcanicGasEmissionMonitor: 'B', VolcanicLavaFlowMonitor: 'B',
  VolcanicIslandMonitor: 'B', VolcanicAshDispersion: 'B',
  GlacierMonitor: 'C', IceSheetMonitor: 'C', GlacierLakeOutburstTracker: 'C',
  GlacialLakeMonitor: 'C', GlacierVelocityTracker: 'C', GlacierMassBalanceMonitor: 'C',
  GlacierRetreatMonitor: 'C', GlacierCalvingMonitor: 'C', GreenlandIceTracker: 'C',
  PolarIceSheetTracker: 'C', IceSheetVelocityMapper: 'C', SnowCoverMonitor: 'C',
  SeaIceNavigator: 'C', ArcticSeaIceMonitor: 'C', PermafrostThawTracker: 'C',
  PermafrostThawMonitor: 'C', PermafrostThawMapper: 'C', SubglacialLakeExplorer: 'C',
  ThermokarstLakeMonitor: 'C', CryosphereChangeTracker: 'C',
  OceanCurrentMapper: 'D', DeepOceanCurrentMonitor: 'D', OceanCurrentTrackerPanel: 'D',
  OceanAcidificationMonitor: 'D', OceanAlkalinityMapper: 'D', SeaSurfaceTemperatureMapper: 'D',
  MarineHeatwaveTracker: 'D', ThermoclineMapper: 'D', SalinityGradientMapper: 'D',
  CoastalUpwellingMonitor: 'D', TidalPredictor: 'D', TidalEnergyAssessor: 'D',
  DeepSeaVentMonitor: 'D', HydrothermalVentTracker: 'D', HydrothermalPlumeTracker: 'D',
  SeafloorMappingPanel: 'D', AbyssalPlainMapper: 'D', FjordEcosystemMonitor: 'D',
  EstuaryHealthMonitor: 'D', SubmarineCanyonExplorer: 'D',
  WildlifeTracker: 'E', WildlifeMigrationTracker: 'E', WhaleMigrationTracker: 'E',
  ReefHealthMonitor: 'E', CoralBleachingAlert: 'E', CoralBleachingMonitor: 'E',
  CoralReefRestorationTracker: 'E', CoralGenomicsTracker: 'E', MangroveMonitor: 'E',
  MangroveRestorationTracker: 'E', MangroveCarbonTracker: 'E', MangroveRestorationProgress: 'E',
  KelpForestMonitor: 'E', SeagrassMeadowMonitor: 'E', SaltMarshMonitor: 'E',
  BiomeClassifier: 'E', BioluminescenceTracker: 'E', PhytoBloomMonitor: 'E',
  AlgalBloomTracker: 'E', InvasiveSpeciesTracker: 'E',
  HydrologyAnalyzer: 'F', RiverFlowMonitor: 'F', RiverDeltaMonitor: 'F',
  GroundwaterExplorer: 'F', GroundwaterRechargeTracker: 'F', KarstGroundwaterMonitor: 'F',
  AquiferDepletionMonitor: 'F', SaltwaterIntrusionMonitor: 'F', UndergroundWaterwayMapper: 'F',
  SubsurfaceFluidFlowMonitor: 'F', WatershedManagerPanel: 'F', FloodRiskAnalyzer: 'F',
  UrbanFloodRiskMapper: 'F', StormSurgePredictor: 'F', SoilMoistureMonitor: 'F',
  SoilMoistureMapper: 'F', WetlandMapper: 'F', HydroelectricPotentialMapper: 'F',
  SoilErosionMonitor: 'F', LunarTideCorrelator: 'F',
  DroughtMonitorPanel: 'G', CarbonFootprintMapper: 'G', CarbonCaptureTracker: 'G',
  MethaneEmissionsTracker: 'G', MethaneEmissionTracker: 'G', MethaneHydrateMonitor: 'G',
  MethaneSeepMapper: 'G', PeatlandMonitorPanel: 'G', PeatlandCarbonTracker: 'G',
  PeatFireTracker: 'G', SoilCarbonSequestrationMonitor: 'G', DeforestationTracker: 'G',
  DesertificationMonitor: 'G', DesertificationRiskAssessor: 'G', SaharaReforestationTracker: 'G',
  VegetationIndexTracker: 'G', SeaLevelRiseProjector: 'G', AcidRainTracker: 'G',
  OzoneLayerMonitor: 'G', StratosphericOzoneMapper: 'G',
  SpaceWeatherMonitor: 'H', SpaceDebrisTracker: 'H', SpaceTrackViewer: 'H',
  SolarFlareMonitor: 'H', SolarPowerPlanner: 'H', SolarExposureAnalyzer: 'H',
  SolarIrradianceMapper: 'H', SolarWindMonitor: 'H', SpaceWeatherAlertPanel: 'H',
  SpaceWeatherImpactAssessor: 'H', MagnetosphereMonitor: 'H', CosmicRayMonitor: 'H',
  RadiationExposureMonitor: 'H', MagneticFieldMapper: 'H', MagneticAnomalyDetector: 'H',
  ElectromagneticFieldMapper: 'H', RadioSignalMapper: 'H', IonosphereMonitor: 'H',
  AuroraForecaster: 'H', MeteorShowerTracker: 'H',
  TopographicProfiler: 'I', TerrainAnalysisPanel: 'I', TerrainProfile3D: 'I',
  ContourGenerator: 'I', AvalancheRiskMap: 'I', AvalancheForecaster: 'I',
  AvalancheTerrainMapper: 'I', LandSubsidenceTracker: 'I', CoastalErosionMonitor: 'I',
  CoastalErosionPredictor: 'I', GeoThermalEnergyMapper: 'I', MineralExploration: 'I',
  CaveSystemExplorer: 'I', SandDuneMigrationTracker: 'I', DustStormTracker: 'I',
  DustAerosolTracker: 'I', SandstormTracker: 'I', DesertMonitorPanel: 'I',
  SabkhaEnvironmentMonitor: 'I', PaleoclimateProxyExplorer: 'I',
  UrbanGrowthSimulator: 'J', UrbanSprawlMonitor: 'J', UrbanHeatIsland: 'J',
  UrbanHeatIslandProfiler: 'J', UrbanTreeCanopyAnalyzer: 'J', UrbanMicroclimateAnalyzer: 'J',
  PollutionTracker: 'J', AirPollutionDispersion: 'J', NoisePollutionMapper: 'J',
  NoiseHeatmapOverlay: 'J', LightPollutionMap: 'J', LightPollutionMapper: 'J',
  MicroplasticsTracker: 'J', LandfillMonitor: 'J', CropHealthAnalyzer: 'J',
  CropYieldPredictor: 'J', AquacultureMonitor: 'J', ViralOutbreakMapper: 'J',
  DeepBiosphereExplorer: 'J', GeomagneticallyInducedCurrentMonitor: 'J',
  SmartRoutePlanner: 'K', EmergencyRoutePlanner: 'K', MultiStopRoutePlanner: 'K',
  MaritimeNavigation: 'K', AirspaceNavigator: 'K', WaypointOptimizer: 'K',
  RouteComparisonPanel: 'K', RouteSharingDialog: 'K', RoutePlayback: 'K',
  RouteDifficultyAnalyzer: 'K', WindPatternAnalyzer: 'K', WindFarmOptimizer: 'K',
  GPSSimulator: 'K', TrackRecorder: 'K', TrailFinder: 'K', PedometerWidget: 'K',
  SpeedAlertSystem: 'K', AltitudeAlertSystem: 'K', GeocachingToolkit: 'K',
  AddLocationDialog: 'L', KeyboardShortcutsDialog: 'L', CoordinateInputDialog: 'L',
  MapExportDialog: 'L', EmbedMapDialog: 'L', BookmarkManager: 'L', ShareDialog: 'L',
  GeofenceDialog: 'L', DistanceMatrix: 'L', StyleGallery: 'L', MapPrintDialog: 'L',
  MarkerCategoriesManager: 'L', StylesMixer: 'L', MapLabelsOverlay: 'L',
  LocationClusterMap: 'L', MapStoryCreator: 'L', DataImportExport: 'L',
  MapOverlayGallery: 'L', AdvancedMarkerManager: 'L', ImageOverlayManager: 'L',
  MapDataVisualizer: 'M', FieldSurveyTool: 'M', MapComparisonSlider: 'M',
  MapTimeline: 'M', MapAnalyticsDashboard: 'M', POIDensityHeatmap: 'M',
  CoordinateShareCard: 'M', MapWallpaperGenerator: 'M', MapAnimationStudio: 'M',
  TrackStatsPanel: 'M', AISuggestionsPanel: 'M', MapChatAssistant: 'M',
  ScreenshotManager: 'M', MapCollageCreator: 'M', NearbyEventsFinder: 'M',
  SVGMarkerDesigner: 'M', MapStyleForge: 'M', MeasurementSuite: 'M',
  GeofenceAlertHistory: 'M', LocationVisitTimeline: 'M',
  TsunamiAlertSystem: 'N', TsunamiBuoyTracker: 'N', WildfireRiskAssessor: 'N',
  WildfireSpreadSimulator: 'N', WildfireSmokeDispersion: 'N', LandslidePredictor: 'N',
  TropicalCycloneTracker: 'N', TornadoActivityTracker: 'N', HailStormTracker: 'N',
  LightningStrikeMap: 'N', BatchActionBar: 'N',
  CulturalHeritageMap: 'O', ArchaeologyMap: 'O', PhenologyTracker: 'O',
  PolynyaMonitor: 'O', PelagicZoneTracker: 'O',
}

// Panel open state checkers - same comprehensive list
const panelOpenCheckers: Record<string, (state: any) => boolean> = {
  WeatherPanel: (s) => s.weatherEnabled, MapComparison: (s) => s.comparisonEnabled,
  SunPositionOverlay: (s) => s.sunPositionEnabled, HeatmapLayer: (s) => s.heatmapEnabled,
  HeatmapControls: (s) => s.heatmapEnabled, TrackRecorder: (s) => s.isRecording,
  Buildings3DLayer: (s) => s.buildings3DEnabled, VoiceNavigator: (s) => s.voiceNavigationEnabled,
  DrawingToolbar: (s) => s.drawingTool !== 'none', DrawingLayer: (s) => s.drawingTool !== 'none',
  ElevationProfile: (s) => s.elevationRouteId !== null, AddLocationDialog: (s) => s.addDialogOpen,
  KeyboardShortcutsDialog: (s) => s.shortcutsOpen, CoordinateInputDialog: (s) => s.coordDialogOpen,
  MapExportDialog: (s) => s.exportDialogOpen, BookmarkManager: (s) => s.bookmarkManagerOpen,
  ShareDialog: (s) => s.shareDialogOpen, GeofenceDialog: (s) => s.geofenceDialogOpen,
  DistanceMatrix: (s) => s.distanceMatrixOpen, StyleGallery: (s) => s.styleGalleryOpen,
  MapPrintDialog: (s) => s.printDialogOpen, WaypointOptimizer: (s) => s.waypointOptimizerOpen,
  StylesMixer: (s) => s.stylesMixerOpen, RouteSharingDialog: (s) => s.routeSharingOpen,
  RoutePlayback: (s) => s.routePlaybackOpen, SpeedAlertSystem: (s) => s.speedAlertOpen,
  MapLabelsOverlay: (s) => s.mapLabelsOpen, ContourGenerator: (s) => s.contourGeneratorOpen,
  LocationClusterMap: (s) => s.clusteringOpen, MapStoryCreator: (s) => s.storyCreatorOpen,
  TerrainProfile3D: (s) => s.terrainProfile3DOpen, DataImportExport: (s) => s.importExportOpen,
  MapOverlayGallery: (s) => s.overlayGalleryOpen, AdvancedMarkerManager: (s) => s.markerManagerOpen,
  GeofenceAlertHistory: (s) => s.geofenceAlertOpen, WeatherComparison: (s) => s.weatherCompareOpen,
  MeasurementSuite: (s) => s.measurementSuiteOpen, TrailFinder: (s) => s.trailFinderOpen,
  PedometerWidget: (s) => s.pedometerVisible, ScreenshotManager: (s) => s.screenshotManagerOpen,
  RouteDifficultyAnalyzer: (s) => s.difficultyAnalyzerOpen, MapCollageCreator: (s) => s.collageCreatorOpen,
  NearbyEventsFinder: (s) => s.eventsFinderOpen, AltitudeAlertSystem: (s) => s.altitudeAlertOpen,
  MultiStopRoutePlanner: (s) => s.multiStopPlannerOpen, EnhancedWeatherDashboard: (s) => s.enhancedWeatherOpen,
  SunShadowCalculator: (s) => s.sunShadowOpen, SVGMarkerDesigner: (s) => s.markerDesignerOpen,
  MapChatAssistant: (s) => s.chatOpen, POIDensityHeatmap: (s) => s.poiHeatmap?.enabled,
  CoordinateShareCard: (s) => s.shareCardOpen, MapWallpaperGenerator: (s) => s.wallpaperOpen,
  MapAnimationStudio: (s) => s.animationStudioOpen, TrackStatsPanel: (s) => s.trackStatsPanelOpen,
  AISuggestionsPanel: (s) => s.aiSuggestionsOpen, AirQualityPanel: (s) => s.aqiPanelOpen,
  MapTimeline: (s) => s.timelineOpen, MapAnalyticsDashboard: (s) => s.analyticsPanelOpen,
  AccessibilityPanel: (s) => s.accessibilityPanelOpen, GPSSimulator: (s) => s.gpsSimulation?.isPlaying,
  BatchActionBar: (s) => s.batchOperation?.isSelectMode,
  // State-object panels
  SmartRoutePlanner: (s) => s.smartRoute?.open, MapDataVisualizer: (s) => s.dataVisualizer?.open,
  FieldSurveyTool: (s) => s.fieldSurvey?.open, EmergencyRoutePlanner: (s) => s.emergencyRoute?.open,
  MapComparisonSlider: (s) => s.comparisonSlider?.enabled, NoiseHeatmapOverlay: (s) => s.noiseHeatmap?.enabled,
  SolarExposureAnalyzer: (s) => s.solarExposure?.open, MapStyleForge: (s) => s.styleForge?.open,
  TopographicProfiler: (s) => s.topoProfiler?.open, MaritimeNavigation: (s) => s.maritimeNav?.open,
  GeocachingToolkit: (s) => s.geocaching?.open, AtmosphericDashboard: (s) => s.atmospheric?.open,
  WildlifeTracker: (s) => s.wildlifeTracker?.open, CulturalHeritageMap: (s) => s.culturalHeritage?.open,
  HydrologyAnalyzer: (s) => s.hydrology?.open, GlacierMonitor: (s) => s.glacierMonitor?.open,
  SeismicActivityMap: (s) => s.seismicActivity?.open, SoilAnalysisPanel: (s) => s.soilAnalysis?.open,
  UrbanGrowthSimulator: (s) => s.urbanGrowth?.open, AirspaceNavigator: (s) => s.airspaceNav?.open,
  ReefHealthMonitor: (s) => s.reefHealth?.open, MagneticFieldMapper: (s) => s.magneticField?.open,
  FloodRiskAnalyzer: (s) => s.floodRisk?.open, VolcanoMonitor: (s) => s.volcanoMonitor?.open,
  AvalancheRiskMap: (s) => s.avalancheRisk?.open, CropHealthAnalyzer: (s) => s.cropHealth?.open,
  SpaceTrackViewer: (s) => s.spaceTrack?.open, ArchaeologyMap: (s) => s.archaeologyMap?.open,
  PollutionTracker: (s) => s.pollutionTracker?.open, TidalPredictor: (s) => s.tidalPredictor?.open,
  WindFarmOptimizer: (s) => s.windFarm?.open, DesertificationMonitor: (s) => s.desertification?.open,
  MineralExploration: (s) => s.mineralExploration?.open, OceanCurrentMapper: (s) => s.oceanCurrent?.open,
  PermafrostThawTracker: (s) => s.permafrost?.open, LightningStrikeMap: (s) => s.lightning?.open,
  BiomeClassifier: (s) => s.biome?.open, GroundwaterExplorer: (s) => s.groundwater?.open,
  SolarPowerPlanner: (s) => s.solarPower?.open, VolcanicAshTracker: (s) => s.volcanicAsh?.open,
  CoastalErosionMonitor: (s) => s.coastalErosion?.open, CarbonFootprintMapper: (s) => s.carbonFootprint?.open,
  WildlifeMigrationTracker: (s) => s.wildlifeMigration?.open, IceSheetMonitor: (s) => s.iceSheet?.open,
  DroughtMonitorPanel: (s) => s.droughtMonitor?.open, LandSubsidenceTracker: (s) => s.landSubsidence?.open,
  CoralBleachingAlert: (s) => s.coralBleaching?.open, TsunamiAlertSystem: (s) => s.tsunamiAlert?.open,
  SoilErosionMonitor: (s) => s.soilErosion?.open, WatershedManagerPanel: (s) => s.watershedManager?.open,
  TectonicPlateViewer: (s) => s.tectonicPlate?.open, AirQualityForecaster: (s) => s.airQualityForecaster?.open,
  GlacialLakeMonitor: (s) => s.glacialLake?.open, SpaceWeatherMonitor: (s) => s.spaceWeather?.open,
  PeatlandMonitorPanel: (s) => s.peatlandMonitor?.open, MangroveMonitor: (s) => s.mangroveMonitor?.open,
  SandstormTracker: (s) => s.sandstormTracker?.open, WetlandMapper: (s) => s.wetlandMapper?.open,
  UrbanHeatIsland: (s) => s.urbanHeatIsland?.open, WildfireRiskAssessor: (s) => s.wildfireRisk?.open,
  AlgalBloomTracker: (s) => s.algalBloom?.open, LandslidePredictor: (s) => s.landslidePredictor?.open,
  SeaIceNavigator: (s) => s.seaIceNavigator?.open, CloudCoverAnalyzer: (s) => s.cloudCover?.open,
  SoilMoistureMonitor: (s) => s.soilMoisture?.open, LightPollutionMap: (s) => s.lightPollution?.open,
  RiverFlowMonitor: (s) => s.riverFlow?.open, VolcanoSeismicMonitor: (s) => s.volcanoSeismic?.open,
  WhaleMigrationTracker: (s) => s.whaleMigration?.open, AvalancheForecaster: (s) => s.avalancheForecaster?.open,
  AuroraForecaster: (s) => s.auroraForecaster?.open, OzoneLayerMonitor: (s) => s.ozoneLayer?.open,
  DeforestationTracker: (s) => s.deforestation?.open, MethaneEmissionsTracker: (s) => s.methaneEmissions?.open,
  OceanAcidificationMonitor: (s) => s.oceanAcidification?.open, SpaceDebrisTracker: (s) => s.spaceDebris?.open,
  TectonicStrainMonitor: (s) => s.tectonicStrain?.open, PhytoBloomMonitor: (s) => s.phytoBloom?.open,
  SnowCoverMonitor: (s) => s.snowCover?.open, GeomagneticStormTracker: (s) => s.geomagneticStorm?.open,
  VolcanicGasMonitor: (s) => s.volcanicGas?.open, AquiferDepletionMonitor: (s) => s.aquiferDepletion?.open,
  StratosphericWindMonitor: (s) => s.stratosphericWind?.open, MarineHeatwaveTracker: (s) => s.marineHeatwave?.open,
  PrecipitationAnalyzer: (s) => s.precipitation?.open, CosmicRayMonitor: (s) => s.cosmicRay?.open,
  GreenlandIceTracker: (s) => s.greenlandIce?.open, RadiationExposureMonitor: (s) => s.radiationExposure?.open,
  PeatFireTracker: (s) => s.peatFire?.open, SeaLevelRiseProjector: (s) => s.seaLevelRise?.open,
  ThermoclineMapper: (s) => s.thermocline?.open, AcidRainTracker: (s) => s.acidRain?.open,
  MethaneHydrateMonitor: (s) => s.methaneHydrate?.open, KelpForestMonitor: (s) => s.kelpForest?.open,
  GlacierLakeOutburstTracker: (s) => s.glof?.open, DustStormTracker: (s) => s.dustStorm?.open,
  BioluminescenceTracker: (s) => s.bioluminescence?.open, UrbanSprawlMonitor: (s) => s.urbanSprawl?.open,
  ViralOutbreakMapper: (s) => s.viralOutbreak?.open, MagnetosphereMonitor: (s) => s.magnetosphere?.open,
  FogDensityMapper: (s) => s.fogDensity?.open, CarbonCaptureTracker: (s) => s.carbonCapture?.open,
  HailStormTracker: (s) => s.hailStorm?.open, SaharaReforestationTracker: (s) => s.saharaReforestation?.open,
  DeepSeaVentMonitor: (s) => s.deepSeaVent?.open, StormSurgePredictor: (s) => s.stormSurge?.open,
  LandfillMonitor: (s) => s.landfillMonitor?.open, SalinityGradientMapper: (s) => s.salinityGradient?.open,
  MicroplasticsTracker: (s) => s.microplastics?.open, RadioSignalMapper: (s) => s.radioSignal?.open,
  VolcanicIslandMonitor: (s) => s.volcanicIsland?.open, PermafrostThawMonitor: (s) => s.permafrostThaw?.open,
  OceanCurrentTrackerPanel: (s) => s.oceanCurrentTracker?.open, SpaceWeatherAlertPanel: (s) => s.spaceWeatherAlert?.open,
  DesertMonitorPanel: (s) => s.desertMonitor?.open, TsunamiBuoyTracker: (s) => s.tsunamiBuoy?.open,
  GlacierVelocityTracker: (s) => s.glacierVelocity?.open, EarthquakeSwarmMonitor: (s) => s.earthquakeSwarm?.open,
  MangroveRestorationTracker: (s) => s.mangroveRestoration?.open, CoralBleachingMonitor: (s) => s.coralBleachingMonitor?.open,
  ArcticSeaIceMonitor: (s) => s.arcticSeaIce?.open, SoilMoistureMapper: (s) => s.soilMoistureAg?.open,
  NoisePollutionMapper: (s) => s.noisePollution?.open, LightPollutionMapper: (s) => s.lightPollutionSky?.open,
  GroundwaterRechargeTracker: (s) => s.groundwaterRecharge?.open, AirQualityMonitor: (s) => s.airQuality?.open,
  TropicalCycloneTracker: (s) => s.tropicalCyclone?.open, VolcanicLavaFlowMonitor: (s) => s.volcanicLavaFlow?.open,
  InvasiveSpeciesTracker: (s) => s.invasiveSpecies?.open, CropYieldPredictor: (s) => s.cropYield?.open,
  TidalEnergyAssessor: (s) => s.tidalEnergy?.open, GlacierCalvingMonitor: (s) => s.glacierCalving?.open,
  UrbanFloodRiskMapper: (s) => s.urbanFloodRisk?.open, SolarFlareMonitor: (s) => s.solarFlare?.open,
  MeteorShowerTracker: (s) => s.meteorShower?.open, AquacultureMonitor: (s) => s.aquaculture?.open,
  WildfireSpreadSimulator: (s) => s.wildfireSpread?.open, VolcanoThermalMonitor: (s) => s.volcanoThermal?.open,
  CaveSystemExplorer: (s) => s.caveSystem?.open, PhenologyTracker: (s) => s.phenology?.open,
  IonosphereMonitor: (s) => s.ionosphere?.open, SeafloorMappingPanel: (s) => s.seafloorMapping?.open,
  HydrothermalVentTracker: (s) => s.hydrothermalVent?.open, SandDuneMigrationTracker: (s) => s.sandDuneMigration?.open,
  CoralReefRestorationTracker: (s) => s.coralRestoration?.open, WindPatternAnalyzer: (s) => s.windPattern?.open,
  GlacierMassBalanceMonitor: (s) => s.glacierMassBalance?.open, SpaceWeatherImpactAssessor: (s) => s.spaceWeatherImpact?.open,
  UndergroundWaterwayMapper: (s) => s.undergroundWaterway?.open, TectonicSubductionMonitor: (s) => s.tectonicSubduction?.open,
  MangroveCarbonTracker: (s) => s.mangroveCarbon?.open, UrbanTreeCanopyAnalyzer: (s) => s.urbanTreeCanopy?.open,
  RiverDeltaMonitor: (s) => s.riverDelta?.open, PolarIceSheetTracker: (s) => s.polarIceSheet?.open,
  GeoThermalEnergyMapper: (s) => s.geoThermalEnergy?.open, SaltwaterIntrusionMonitor: (s) => s.saltwaterIntrusion?.open,
  AvalancheTerrainMapper: (s) => s.avalancheTerrain?.open, DesertificationRiskAssessor: (s) => s.desertificationRisk?.open,
  ElectromagneticFieldMapper: (s) => s.electromagneticField?.open, VolcanicPlumeTracker: (s) => s.volcanicPlume?.open,
  StratosphericOzoneMapper: (s) => s.stratosphericOzone?.open, DeepOceanCurrentMonitor: (s) => s.deepOceanCurrent?.open,
  RainfallPatternAnalyzer: (s) => s.rainfallPattern?.open, GeomagneticReversalTracker: (s) => s.geomagneticReversal?.open,
  WildfireSmokeDispersion: (s) => s.wildfireSmoke?.open, ContinentalDriftMonitor: (s) => s.continentalDrift?.open,
  UrbanHeatIslandProfiler: (s) => s.urbanHeatIslandProfiler?.open, MethaneEmissionTracker: (s) => s.methaneEmission?.open,
  OceanAlkalinityMapper: (s) => s.oceanAlkalinity?.open, TornadoActivityTracker: (s) => s.tornadoActivity?.open,
  GlacierRetreatMonitor: (s) => s.glacierRetreat?.open, SeismicHazardAssessor: (s) => s.seismicHazard?.open,
  AirPollutionDispersion: (s) => s.airPollutionDispersion?.open, SolarIrradianceMapper: (s) => s.solarIrradiance?.open,
  PeatlandCarbonTracker: (s) => s.peatlandCarbon?.open, VolcanicGasEmissionMonitor: (s) => s.volcanicGasEmission?.open,
  SeaSurfaceTemperatureMapper: (s) => s.seaSurfaceTemperature?.open, KarstGroundwaterMonitor: (s) => s.karstGroundwater?.open,
  PermafrostThawMapper: (s) => s.permafrostThaw?.open, DustAerosolTracker: (s) => s.dustAerosol?.open,
  HydroelectricPotentialMapper: (s) => s.hydroelectricPotential?.open, MagneticAnomalyDetector: (s) => s.magneticAnomaly?.open,
  CoastalUpwellingMonitor: (s) => s.coastalUpwelling?.open, VegetationIndexTracker: (s) => s.vegetationIndex?.open,
  LunarTideCorrelator: (s) => s.lunarTide?.open, SubsurfaceFluidFlowMonitor: (s) => s.subsurfaceFluid?.open,
  AtmosphericRiverTracker: (s) => s.atmosphericRiver?.open, SoilCarbonSequestrationMonitor: (s) => s.soilCarbon?.open,
  VolcanicDeformationMapper: (s) => s.volcanicDeformation?.open, SolarWindMonitor: (s) => s.solarWind?.open,
  CoralGenomicsTracker: (s) => s.coralGenomics?.open, IceSheetVelocityMapper: (s) => s.iceSheetVelocity?.open,
  MangroveRestorationProgress: (s) => s.mangroveRestorationProgress?.open, UrbanMicroclimateAnalyzer: (s) => s.urbanMicroclimate?.open,
  DeepBiosphereExplorer: (s) => s.deepBiosphere?.open, CoastalErosionPredictor: (s) => s.coastalErosionPredictor?.open,
  VolcanicAshDispersion: (s) => s.volcanicAshDispersion?.open, SubglacialLakeExplorer: (s) => s.subglacialLake?.open,
  ThermokarstLakeMonitor: (s) => s.thermokarstLake?.open, PaleoclimateProxyExplorer: (s) => s.paleoclimateProxy?.open,
  GeomagneticallyInducedCurrentMonitor: (s) => s.geomagneticallyInducedCurrent?.open,
  SabkhaEnvironmentMonitor: (s) => s.sabkhaEnvironment?.open, CryosphereChangeTracker: (s) => s.cryosphereChange?.open,
  AbyssalPlainMapper: (s) => s.abyssalPlain?.open, FjordEcosystemMonitor: (s) => s.fjordEcosystem?.open,
  HydrothermalPlumeTracker: (s) => s.hydrothermalPlume?.open, EstuaryHealthMonitor: (s) => s.estuaryHealth?.open,
  SubmarineCanyonExplorer: (s) => s.submarineCanyon?.open, SaltMarshMonitor: (s) => s.saltMarsh?.open,
  MethaneSeepMapper: (s) => s.methaneSeep?.open, SeagrassMeadowMonitor: (s) => s.seagrassMeadow?.open,
  PelagicZoneTracker: (s) => s.pelagicZone?.open, PolynyaMonitor: (s) => s.polynya?.open,
  BuildingInfoPanel: (s) => s.selectedBuilding !== null, RouteComparisonPanel: (s) => s.comparedRoutes?.length > 0,
  TerrainAnalysisPanel: (s) => s.terrainAnalysisRouteId !== null, EmbedMapDialog: (s) => s.embedDialogOpen,
  LocationVisitTimeline: (s) => s.visitTimelineOpen, MarkerCategoriesManager: (s) => s.markerCategoriesOpen,
  MapUsageStats: (s) => s.usageStatsOpen, ImageOverlayManager: () => true,
  SpatialAnalysisPanel: () => true, BufferZoneLayer: () => true, RouteAnalyticsPanel: () => true,
  CollaborationPanel: () => true, CollaboratorCursors: () => true, CoordinateConverter: () => true,
  CoordinateGridOverlay: () => true, QuickJumpPanel: () => true, UndoRedoBar: () => true,
  MobileWeatherBar: () => true, LanguageSelector: () => true, VoiceNavigationToggle: () => true,
  SunInfoPanel: (s) => s.sunPositionEnabled, NotificationCenter: () => true,
}

// Lazy group panel component
function LazyGroupPanel({ groupId }: { groupId: string }) {
  const [GroupComponent, setGroupComponent] = useState<ComponentType | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPanelGroup(groupId).then((comp) => {
      if (!cancelled && comp) setGroupComponent(() => comp)
    })
    return () => { cancelled = true }
  }, [groupId])

  if (!GroupComponent) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 pointer-events-none">
        <div className="bg-background rounded-lg p-4 shadow-xl animate-pulse">
          <div className="h-5 w-40 bg-muted rounded mb-3" />
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
      </div>
    )
  }
  return <GroupComponent />
}

export function MapPanelLoader() {
  const state = useMapStore()

  const activeGroups = useMemo(() => {
    const groups = new Set<string>()
    for (const [panelName, checker] of Object.entries(panelOpenCheckers)) {
      try {
        if (checker(state)) {
          const group = panelGroupMap[panelName]
          if (group) groups.add(group)
        }
      } catch { /* skip */ }
    }
    return Array.from(groups)
  }, [state])

  return (
    <>
      {/* Essential core components */}
      <MapView /><MapSidebar /><SearchBar /><StyleSwitcher /><CoordinatesDisplay />
      <MapToolbar /><ThemeToggle /><MapStatsPanel /><CompassIndicator /><MiniMap />
      <MapLegend /><MapNotifications /><PWAInstallBanner /><OfflineIndicator />
      <CustomCompassRose /><TrackRecordButton /><MapNotesLayer /><MapAnnotationsLayer />

      {/* Lazy-loaded panel groups */}
      {activeGroups.map((groupId) => (
        <LazyGroupPanel key={groupId} groupId={groupId} />
      ))}
    </>
  )
}
