'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapView } from '@/components/map/MapView'
import { MapSidebar } from '@/components/map/MapSidebar'
import { SearchBar } from '@/components/map/SearchBar'
import { StyleSwitcher } from '@/components/map/StyleSwitcher'
import { CoordinatesDisplay } from '@/components/map/CoordinatesDisplay'
import { MapToolbar } from '@/components/map/MapToolbar'
import { AddLocationDialog } from '@/components/map/AddLocationDialog'
import { ThemeToggle } from '@/components/map/ThemeToggle'
import { MapStatsPanel } from '@/components/map/MapStatsPanel'
import { CompassIndicator } from '@/components/map/CompassIndicator'
import { KeyboardShortcutsDialog } from '@/components/map/KeyboardShortcutsDialog'
import { MiniMap } from '@/components/map/MiniMap'
import { MapLegend } from '@/components/map/MapLegend'
import { MapNotifications } from '@/components/map/MapNotifications'
import { WeatherPanel } from '@/components/map/WeatherPanel'
import { MobileWeatherBar } from '@/components/map/MobileWeatherBar'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { QuickJumpPanel } from '@/components/map/QuickJumpPanel'
import { UndoRedoBar } from '@/components/map/UndoRedoBar'
import { MapComparison } from '@/components/map/MapComparison'
import { CoordinateInputDialog } from '@/components/map/CoordinateInputDialog'
import { MapExportDialog } from '@/components/map/MapExportDialog'
import { EmbedMapDialog } from '@/components/map/EmbedMapDialog'
import { BookmarkManager } from '@/components/map/BookmarkManager'
import { SunPositionOverlay } from '@/components/map/SunPositionOverlay'
import { SunInfoPanel } from '@/components/map/SunInfoPanel'
import { HeatmapLayer } from '@/components/map/HeatmapLayer'
import { HeatmapControls } from '@/components/map/HeatmapControls'
import { TrackRecorder, TrackRecordButton } from '@/components/map/TrackRecorder'
import { PWAInstallBanner } from '@/components/map/PWAInstallBanner'
import { Buildings3DLayer } from '@/components/map/Buildings3DLayer'
import { BuildingInfoPanel } from '@/components/map/BuildingInfoPanel'
import { GeofenceDialog } from '@/components/map/GeofenceDialog'
import { ShareDialog } from '@/components/map/ShareDialog'
import { LanguageSelector } from '@/components/map/LanguageSelector'
import { NotificationCenter } from '@/components/map/NotificationCenter'
import { AISuggestionsPanel } from '@/components/map/AISuggestionsPanel'
import { RouteAnalyticsPanel } from '@/components/map/RouteAnalyticsPanel'
import { DistanceMatrix } from '@/components/map/DistanceMatrix'
import { StyleGallery } from '@/components/map/StyleGallery'
import { VoiceNavigator } from '@/components/map/VoiceNavigator'
import { VoiceNavigationToggle } from '@/components/map/VoiceNavigationToggle'
import { CollaborationPanel } from '@/components/map/CollaborationPanel'
import { CollaboratorCursors } from '@/components/map/CollaboratorCursors'
import { OfflineIndicator } from '@/components/map/OfflineIndicator'
import { DrawingToolbar } from '@/components/map/DrawingToolbar'
import { DrawingLayer } from '@/components/map/DrawingLayer'
import { RouteComparisonPanel } from '@/components/map/RouteComparisonPanel'
import { TerrainAnalysisPanel } from '@/components/map/TerrainAnalysisPanel'
import { AccessibilityPanel } from '@/components/map/AccessibilityPanel'
import { SpatialAnalysisPanel } from '@/components/map/SpatialAnalysisPanel'
import { BufferZoneLayer } from '@/components/map/BufferZoneLayer'
import { ImageOverlayManager } from '@/components/map/ImageOverlayManager'
import { MapTimeline } from '@/components/map/MapTimeline'
import { MapAnalyticsDashboard } from '@/components/map/MapAnalyticsDashboard'
import { AirQualityPanel } from '@/components/map/AirQualityPanel'
import { MapPrintDialog } from '@/components/map/MapPrintDialog'
import { MarkerCategoriesManager } from '@/components/map/MarkerCategoriesManager'
import { WaypointOptimizer } from '@/components/map/WaypointOptimizer'
import { StylesMixer } from '@/components/map/StylesMixer'
import { CoordinateConverter } from '@/components/map/CoordinateConverter'
import { RouteSharingDialog } from '@/components/map/RouteSharingDialog'
import { RoutePlayback } from '@/components/map/RoutePlayback'
import { SpeedAlertSystem } from '@/components/map/SpeedAlertSystem'
import { MapLabelsOverlay } from '@/components/map/MapLabelsOverlay'
import { ContourGenerator } from '@/components/map/ContourGenerator'
import { LocationClusterMap } from '@/components/map/LocationClusterMap'
import { MapStoryCreator } from '@/components/map/MapStoryCreator'
import { TerrainProfile3D } from '@/components/map/TerrainProfile3D'
import { DataImportExport } from '@/components/map/DataImportExport'
import { CoordinateGridOverlay } from '@/components/map/CoordinateGridOverlay'
import { MapOverlayGallery } from '@/components/map/MapOverlayGallery'
import { AdvancedMarkerManager } from '@/components/map/AdvancedMarkerManager'
import { GeofenceAlertHistory } from '@/components/map/GeofenceAlertHistory'
import { LocationVisitTimeline } from '@/components/map/LocationVisitTimeline'
import { WeatherComparison } from '@/components/map/WeatherComparison'
import { MeasurementSuite } from '@/components/map/MeasurementSuite'
import { TrailFinder } from '@/components/map/TrailFinder'
import { PedometerWidget } from '@/components/map/PedometerWidget'
import { MapUsageStats } from '@/components/map/MapUsageStats'
import { ScreenshotManager } from '@/components/map/ScreenshotManager'
import { RouteDifficultyAnalyzer } from '@/components/map/RouteDifficultyAnalyzer'
import { MapCollageCreator } from '@/components/map/MapCollageCreator'
import { NearbyEventsFinder } from '@/components/map/NearbyEventsFinder'
import { AltitudeAlertSystem } from '@/components/map/AltitudeAlertSystem'
import { CustomCompassRose } from '@/components/map/CustomCompassRose'
import { MultiStopRoutePlanner } from '@/components/map/MultiStopRoutePlanner'
import { EnhancedWeatherDashboard } from '@/components/map/EnhancedWeatherDashboard'
import { SunShadowCalculator } from '@/components/map/SunShadowCalculator'
import { SVGMarkerDesigner } from '@/components/map/SVGMarkerDesigner'
import { MapChatAssistant } from '@/components/map/MapChatAssistant'
import { POIDensityHeatmap } from '@/components/map/POIDensityHeatmap'
import { CoordinateShareCard } from '@/components/map/CoordinateShareCard'
import { MapWallpaperGenerator } from '@/components/map/MapWallpaperGenerator'
import { MapAnimationStudio } from '@/components/map/MapAnimationStudio'
import { SmartRoutePlanner } from '@/components/map/SmartRoutePlanner'
import { MapDataVisualizer } from '@/components/map/MapDataVisualizer'
import { FieldSurveyTool } from '@/components/map/FieldSurveyTool'
import { EmergencyRoutePlanner } from '@/components/map/EmergencyRoutePlanner'
import { MapComparisonSlider } from '@/components/map/MapComparisonSlider'
import { NoiseHeatmapOverlay } from '@/components/map/NoiseHeatmapOverlay'
import { SolarExposureAnalyzer } from '@/components/map/SolarExposureAnalyzer'
import { MapStyleForge } from '@/components/map/MapStyleForge'
import { TopographicProfiler } from '@/components/map/TopographicProfiler'
import { MaritimeNavigation } from '@/components/map/MaritimeNavigation'
import { GeocachingToolkit } from '@/components/map/GeocachingToolkit'
import { AtmosphericDashboard } from '@/components/map/AtmosphericDashboard'
import { WildlifeTracker } from '@/components/map/WildlifeTracker'
import { CulturalHeritageMap } from '@/components/map/CulturalHeritageMap'
import { HydrologyAnalyzer } from '@/components/map/HydrologyAnalyzer'
import { GlacierMonitor } from '@/components/map/GlacierMonitor'
import { SeismicActivityMap } from '@/components/map/SeismicActivityMap'
import { SoilAnalysisPanel } from '@/components/map/SoilAnalysisPanel'
import { UrbanGrowthSimulator } from '@/components/map/UrbanGrowthSimulator'
import { AirspaceNavigator } from '@/components/map/AirspaceNavigator'
import { ReefHealthMonitor } from '@/components/map/ReefHealthMonitor'
import { MagneticFieldMapper } from '@/components/map/MagneticFieldMapper'
import { FloodRiskAnalyzer } from '@/components/map/FloodRiskAnalyzer'
import { VolcanoMonitor } from '@/components/map/VolcanoMonitor'
import { AvalancheRiskMap } from '@/components/map/AvalancheRiskMap'
import { CropHealthAnalyzer } from '@/components/map/CropHealthAnalyzer'
import { SpaceTrackViewer } from '@/components/map/SpaceTrackViewer'
import { ArchaeologyMap } from '@/components/map/ArchaeologyMap'
import { PollutionTracker } from '@/components/map/PollutionTracker'
import { TidalPredictor } from '@/components/map/TidalPredictor'
import { WindFarmOptimizer } from '@/components/map/WindFarmOptimizer'
import { DesertificationMonitor } from '@/components/map/DesertificationMonitor'
import { MineralExploration } from '@/components/map/MineralExploration'
import { OceanCurrentMapper } from '@/components/map/OceanCurrentMapper'
import { PermafrostThawTracker } from '@/components/map/PermafrostThawTracker'
import { LightningStrikeMap } from '@/components/map/LightningStrikeMap'
import { BiomeClassifier } from '@/components/map/BiomeClassifier'
import { GroundwaterExplorer } from '@/components/map/GroundwaterExplorer'
import { SolarPowerPlanner } from '@/components/map/SolarPowerPlanner'
import { VolcanicAshTracker } from '@/components/map/VolcanicAshTracker'
import { CoastalErosionMonitor } from '@/components/map/CoastalErosionMonitor'
import { CarbonFootprintMapper } from '@/components/map/CarbonFootprintMapper'
import { WildlifeMigrationTracker } from '@/components/map/WildlifeMigrationTracker'
import { IceSheetMonitor } from '@/components/map/IceSheetMonitor'
import { DroughtMonitorPanel } from '@/components/map/DroughtMonitorPanel'
import { LandSubsidenceTracker } from '@/components/map/LandSubsidenceTracker'
import { CoralBleachingAlert } from '@/components/map/CoralBleachingAlert'
import { TsunamiAlertSystem } from '@/components/map/TsunamiAlertSystem'
import { SoilErosionMonitor } from '@/components/map/SoilErosionMonitor'
import { WatershedManagerPanel } from '@/components/map/WatershedManagerPanel'
import { TectonicPlateViewer } from '@/components/map/TectonicPlateViewer'
import { AirQualityForecaster } from '@/components/map/AirQualityForecaster'
import { GlacialLakeMonitor } from '@/components/map/GlacialLakeMonitor'
import { SpaceWeatherMonitor } from '@/components/map/SpaceWeatherMonitor'
import { PeatlandMonitorPanel } from '@/components/map/PeatlandMonitorPanel'
import { MangroveMonitor } from '@/components/map/MangroveMonitor'
import { SandstormTracker } from '@/components/map/SandstormTracker'
import { WetlandMapper } from '@/components/map/WetlandMapper'
import { UrbanHeatIsland } from '@/components/map/UrbanHeatIsland'
import { WildfireRiskAssessor } from '@/components/map/WildfireRiskAssessor'
import { AlgalBloomTracker } from '@/components/map/AlgalBloomTracker'
import { LandslidePredictor } from '@/components/map/LandslidePredictor'
import { SeaIceNavigator } from '@/components/map/SeaIceNavigator'
import { CloudCoverAnalyzer } from '@/components/map/CloudCoverAnalyzer'
import { SoilMoistureMonitor } from '@/components/map/SoilMoistureMonitor'
import { LightPollutionMap } from '@/components/map/LightPollutionMap'
import { RiverFlowMonitor } from '@/components/map/RiverFlowMonitor'
import { VolcanoSeismicMonitor } from '@/components/map/VolcanoSeismicMonitor'
import { WhaleMigrationTracker } from '@/components/map/WhaleMigrationTracker'
import { AvalancheForecaster } from '@/components/map/AvalancheForecaster'
import { AuroraForecaster } from '@/components/map/AuroraForecaster'
import { OzoneLayerMonitor } from '@/components/map/OzoneLayerMonitor'
import { DeforestationTracker } from '@/components/map/DeforestationTracker'
import { MethaneEmissionsTracker } from '@/components/map/MethaneEmissionsTracker'
import { OceanAcidificationMonitor } from '@/components/map/OceanAcidificationMonitor'
import { SpaceDebrisTracker } from '@/components/map/SpaceDebrisTracker'
import { TectonicStrainMonitor } from '@/components/map/TectonicStrainMonitor'
import { PhytoBloomMonitor } from '@/components/map/PhytoBloomMonitor'
import { SnowCoverMonitor } from '@/components/map/SnowCoverMonitor'
import { GeomagneticStormTracker } from '@/components/map/GeomagneticStormTracker'
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
import { SalinityGradientMapper } from '@/components/map/SalinityGradientMapper'
import { MicroplasticsTracker } from '@/components/map/MicroplasticsTracker'
import { RadioSignalMapper } from '@/components/map/RadioSignalMapper'
import { VolcanicIslandMonitor } from '@/components/map/VolcanicIslandMonitor'
import { PermafrostThawMonitor } from '@/components/map/PermafrostThawMonitor'
import { OceanCurrentTrackerPanel } from '@/components/map/OceanCurrentTrackerPanel'
import { SpaceWeatherAlertPanel } from '@/components/map/SpaceWeatherAlertPanel'
import { DesertMonitorPanel } from '@/components/map/DesertMonitorPanel'
import { TsunamiBuoyTracker } from '@/components/map/TsunamiBuoyTracker'
import { GlacierVelocityTracker } from '@/components/map/GlacierVelocityTracker'
import { EarthquakeSwarmMonitor } from '@/components/map/EarthquakeSwarmMonitor'
import { MangroveRestorationTracker } from '@/components/map/MangroveRestorationTracker'
import dynamic from 'next/dynamic'

const GPSSimulator = dynamic(() => import('@/components/map/GPSSimulator').then((m) => m.GPSSimulator), { ssr: false })
const MapNotesLayer = dynamic(() => import('@/components/map/MapNotes').then((m) => m.MapNotesLayer), { ssr: false })
const BatchActionBar = dynamic(() => import('@/components/map/BatchOperations').then((m) => m.BatchActionBar), { ssr: false })
const MapAnnotationsLayer = dynamic(() => import('@/components/map/MapAnnotationsLayer').then((m) => m.MapAnnotationsLayer), { ssr: false })
import { TrackStatsPanel } from '@/components/map/TrackStatsPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMapStore, type ToolMode, MAP_STYLES } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { useUndoStore } from '@/lib/use-undo-store'
import { useServiceWorker } from '@/hooks/use-service-worker'
import { toast } from 'sonner'
import {
  Navigation,
  MapPin,
  Ruler,
  Crosshair,
  Pencil,
  Github,
  X,
  Plus,
  LocateFixed,
  Layers,
  Maximize2,
  Minimize2,
  Keyboard,
  Share2,
  Code2,
  Camera,
  GitCompare,
  Globe2,
  Type,
  Activity,
  GitBranch,
  Save,
  BarChart3,
  Wind,
  Printer,
  Tag,
  Palette,
  Share,
  Mountain,
  Gauge,
  Play,
  Boxes,
  BookOpen,
  Database,
  BellRing,
  Grid3x3,
  MapPinned,
  Calendar,
  Thermometer,
  Triangle,
  TreePine,
  PieChart,
  Image as ImageIcon,
  TrendingUp,
  LayoutGrid,
  CalendarDays,
  ArrowUpFromLine,
  Compass,
  SunDim,
  PenTool,
  Waypoints,
  CloudSun,
  MessageCircle,
  QrCode,
  Monitor,
  Clapperboard,
  Route,
  BarChart2,
  ClipboardCheck,
  ShieldAlert,
  SplitSquareHorizontal,
  Volume2,
  Sun,
  Hammer,
  Mountain as MountainIcon,
  Anchor,
  Map,
  CloudCog,
  Bird,
  Landmark,
  Droplets,
  Activity as ActivityIcon,
  Sprout,
  Building2,
  Plane,
  Waves,
  Magnet,
  Droplet,
  Flame,
  Snowflake as SnowflakeIcon,
  Wheat,
  Satellite,
  Pyramid,
  Factory,
  Ship,
  Zap,
  Sun as SunIcon,
  Gem,
  Fish,
  ThermometerSnowflake,
  CloudLightning,
  Leaf,
  Droplet as DropletIcon,
  SunMedium,
  CloudHail,
  Waves as WavesIcon,
  CloudCog as CloudSmoke,
  Bird as BirdIcon,
  MountainSnow,
  ThermometerSun,
  ArrowDownFromLine,
  Shell,
  Siren,
  CloudRain,
  Cloud as CloudIcon,
  Droplets as DropletsIcon,
  Globe as GlobeIcon,
  Wind as WindIcon,
  Snowflake as SnowflakeIcon2,
  Radio,
  TreeDeciduous,
  Flame as FlameIcon,
  Ship as ShipIcon,
  Moon as MoonIcon,
  Sparkles as SparklesIcon,
  Globe2 as Globe2Icon2,
  Wind as WindIcon2,
  Sparkles as SparklesIcon2,
  Building2 as Building2Icon,
  Bug,
  Magnet as MagnetIcon2,
  CloudFog,
  Factory as FactoryIcon2,
  CloudHail as CloudHailIcon,
  TreePine as TreePineIcon2,
  Flame as FlameIcon2,
  Waves as WavesIcon2,
  Trash2,
  Droplets as DropletsIcon2,
  Search as SearchIcon2,
  Radio as RadioIcon2,
  Mountain as MountainIcon2,
  Waves as WavesIcon3,
  Sun as SunIcon2,
  Anchor,
  Activity as ActivityIcon2,
  TreeDeciduous as TreeDeciduousIcon2,
} from 'lucide-react'

export default function Home() {
  const { toolMode, sidebarOpen, center, zoom, currentStyle, weatherEnabled, comparisonEnabled, sunPositionEnabled, heatmapEnabled, elevationRouteId, setSidebarOpen, setToolMode, setCenter, setZoom, setCurrentStyle, setComparisonEnabled } = useMapStore()
  const comparedRoutes = useMapStore((s) => s.comparedRoutes)
  const terrainAnalysisRouteId = useMapStore((s) => s.terrainAnalysisRouteId)
  const accessibilityPanelOpen = useMapStore((s) => s.accessibilityPanelOpen)
  const highContrastMode = useMapStore((s) => s.highContrastMode)
  const largeTextMode = useMapStore((s) => s.largeTextMode)
  const reducedMotionMode = useMapStore((s) => s.reducedMotionMode)
  const pushNotification = useMapStore((s) => s.pushNotification)
  const drawingTool = useMapStore((s) => s.drawingTool)

  // Register service worker for offline tile caching
  useServiceWorker()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [coordDialogOpen, setCoordDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const embedDialogOpen = useMapStore((s) => s.embedDialogOpen)
  const setEmbedDialogOpen = useMapStore((s) => s.setEmbedDialogOpen)
  const markerCategoriesOpen = useMapStore((s) => s.markerCategoriesOpen)
  const setMarkerCategoriesOpen = useMapStore((s) => s.setMarkerCategoriesOpen)
  const waypointOptimizerOpen = useMapStore((s) => s.waypointOptimizerOpen)
  const setWaypointOptimizerOpen = useMapStore((s) => s.setWaypointOptimizerOpen)
  const stylesMixerOpen = useMapStore((s) => s.stylesMixerOpen)
  const setStylesMixerOpen = useMapStore((s) => s.setStylesMixerOpen)
  const routeSharingOpen = useMapStore((s) => s.routeSharingOpen)
  const setRouteSharingOpen = useMapStore((s) => s.setRouteSharingOpen)
  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false)
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false)
  const [distanceMatrixOpen, setDistanceMatrixOpen] = useState(false)
  const [styleGalleryOpen, setStyleGalleryOpen] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotSaveOpen, setSnapshotSaveOpen] = useState(false)
  const [geofenceCoords, setGeofenceCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)
  const compassAnimatingRef = useRef(false)
  const savedLocations = useMapStore((s) => s.savedLocations)

  // Restore map state from URL params on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = params.get('lat')
    const lng = params.get('lng')
    const zoomParam = params.get('zoom')
    const styleParam = params.get('style')

    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setCenter([lngNum, latNum])
        // Fly to the position after map loads
        setTimeout(() => {
          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
          if (flyTo) {
            flyTo(lngNum, latNum, zoomParam ? parseFloat(zoomParam) : undefined)
          }
        }, 500)
      }
    }
    if (zoomParam) {
      const zoomNum = parseFloat(zoomParam)
      if (!isNaN(zoomNum)) {
        setZoom(zoomNum)
      }
    }
    if (styleParam) {
      const found = MAP_STYLES.find((s) => s.id === styleParam)
      if (found) {
        setCurrentStyle(found)
      }
    }
  }, [setCenter, setZoom, setCurrentStyle])

  // Update URL (debounced) when map state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const [lng, lat] = center
      const params = new URLSearchParams({
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        zoom: zoom.toFixed(2),
        style: currentStyle.id,
      })
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }, 500)
    return () => clearTimeout(timer)
  }, [center, zoom, currentStyle])

  // Handle map export - now opens the export dialog
  const handleExportMap = useCallback(() => {
    setExportDialogOpen(true)
  }, [])

  // Handle share URL - now opens the ShareDialog
  const handleShare = useCallback(() => {
    setShareDialogOpen(true)
  }, [])

  // Listen for map initialization
  useEffect(() => {
    const handleMapReady = () => setMapInitialized(true)
    window.addEventListener('map-ready', handleMapReady)
    // Fallback: check if map is already ready after a tick
    const fallbackTimer = setTimeout(() => {
      if ((window as unknown as Record<string, unknown>).__mainMap) {
        setMapInitialized(true)
      }
    }, 0)
    return () => {
      window.removeEventListener('map-ready', handleMapReady)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Welcome back toast for returning users
  useEffect(() => {
    if (savedLocations.length > 0) {
      const timer = setTimeout(() => {
        toast.success(`Welcome back! You have ${savedLocations.length} saved location${savedLocations.length > 1 ? 's' : ''}`)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [savedLocations.length])

  // Dismiss welcome after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleLocateMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords
          const flyTo = (window as unknown as Record<
            string,
            (lng: number, lat: number, z?: number) => void
          >).__mapFlyTo
          if (flyTo) {
            flyTo(longitude, latitude, 14)
          }
          useMapStore.getState().setGeolocation({ longitude, latitude, accuracy })
        },
        () => {
          // Geolocation denied
        }
      )
    }
  }, [])

  // Listen for context menu "Add to Saved Locations" event
  useEffect(() => {
    const handleAddSavedLocation = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lat: number; lng: number }
      if (detail) {
        // Open the Add Location dialog with pre-filled coordinates
        setAddDialogOpen(true)
        // The dialog reads center from store, so temporarily set it
        // We'll use a custom event to pass the coordinates
        window.dispatchEvent(new CustomEvent('add-location-prefill', { detail }))
      }
    }
    window.addEventListener('map-add-saved-location', handleAddSavedLocation)
    return () => window.removeEventListener('map-add-saved-location', handleAddSavedLocation)
  }, [])

  // Listen for context menu "Create Geofence" event
  useEffect(() => {
    const handleCreateGeofence = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lat: number; lng: number }
      if (detail) {
        setGeofenceCoords(detail)
        setGeofenceDialogOpen(true)
      }
    }
    window.addEventListener('map-create-geofence', handleCreateGeofence)
    return () => window.removeEventListener('map-create-geofence', handleCreateGeofence)
  }, [])

  // Geofence monitoring logic
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkGeofences = () => {
      const geolocation = useMapStore.getState().geolocation
      if (!geolocation) return

      const geofences = useMapStore.getState().geofences
      for (const geofence of geofences) {
        if (!geofence.isActive) continue
        if (!geofence.notifyOnEnter && !geofence.notifyOnExit) continue

        const R = 6371000 // meters
        const dLat = ((geolocation.latitude - geofence.latitude) * Math.PI) / 180
        const dLon = ((geolocation.longitude - geofence.longitude) * Math.PI) / 180
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((geofence.latitude * Math.PI) / 180) * Math.cos((geolocation.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        const inside = dist <= geofence.radius
        const key = `geofence-inside-${geofence.id}`
        const wasInside = sessionStorage.getItem(key) === 'true'

        if (inside && !wasInside && geofence.notifyOnEnter) {
          toast.info(`Entered geofence: ${geofence.name}`, { duration: 5000 })
          sessionStorage.setItem(key, 'true')
        } else if (!inside && wasInside && geofence.notifyOnExit) {
          toast.info(`Exited geofence: ${geofence.name}`, { duration: 5000 })
          sessionStorage.setItem(key, 'false')
        }
      }
    }

    // Check periodically
    const interval = setInterval(checkGeofences, 5000)
    // Also check when geolocation changes
    const unsub = useMapStore.subscribe((state, prev) => {
      if (state.geolocation !== prev.geolocation) {
        checkGeofences()
      }
    })

    return () => {
      clearInterval(interval)
      unsub()
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Z / Cmd+Z: Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        useUndoStore.getState().undo()
        return
      }
      // Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z: Redo
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault()
        useUndoStore.getState().redo()
        return
      }
      // Ctrl+G / Cmd+G: Open coordinate dialog
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setCoordDialogOpen(true)
        return
      }

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape from inputs
        if (e.key === 'Escape') {
          target.blur()
        }
        return
      }

      switch (e.key) {
        case '1':
          setToolMode('navigate')
          break
        case '2':
          setToolMode('mark')
          break
        case '3':
          setToolMode('measure')
          break
        case '4':
          setToolMode('directions')
          break
        case '5':
          setToolMode('draw')
          break
        case '6':
          setToolMode('area')
          break
        case '8':
          setToolMode('annotate')
          break
        case '0': {
          const streets = MAP_STYLES.find((s) => s.id === 'streets')
          if (streets) useMapStore.getState().setCurrentStyle(streets)
          break
        }
        case '7': {
          const satellite = MAP_STYLES.find((s) => s.id === 'satellite')
          if (satellite) useMapStore.getState().setCurrentStyle(satellite)
          break
        }
        case '9': {
          const currentIdx = MAP_STYLES.findIndex((s) => s.id === useMapStore.getState().currentStyle.id)
          const nextIdx = (currentIdx + 1) % MAP_STYLES.length
          useMapStore.getState().setCurrentStyle(MAP_STYLES[nextIdx])
          break
        }
        case '/':
          e.preventDefault()
          document.getElementById('map-search-input')?.focus()
          break
        case 'b':
          if (e.shiftKey) {
            // Shift+B: same as B
          }
          setSidebarOpen(!useMapStore.getState().sidebarOpen)
          break
        case 'B':
          setSidebarOpen(!useMapStore.getState().sidebarOpen)
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'l':
        case 'L':
          handleLocateMe()
          break
        case 'h':
        case 'H':
          useMapStore.getState().setHeatmapEnabled(!useMapStore.getState().heatmapEnabled)
          break
        case 'v':
        case 'V': {
          const voiceEnabled = useMapStore.getState().voiceNavigationEnabled
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            if (voiceEnabled) {
              window.speechSynthesis.cancel()
            } else {
              const u = new SpeechSynthesisUtterance('')
              u.volume = 0
              window.speechSynthesis.speak(u)
            }
          }
          useMapStore.getState().setVoiceNavigationEnabled(!voiceEnabled)
          break
        }
        case 't':
        case 'T':
          useMapStore.getState().setSidebarTab('layers')
          useMapStore.getState().toggleSection('section-layers-theme')
          if (!useMapStore.getState().sidebarOpen) {
            useMapStore.getState().setSidebarOpen(true)
          }
          break
        case 'd':
        case 'D': {
          const currentDrawing = useMapStore.getState().drawingTool
          useMapStore.getState().setDrawingTool(currentDrawing === 'none' ? 'line' : 'none')
          setToolMode('draw')
          break
        }
        case 'c': {
          // Cycle coordinate format
          toast.info('Coordinate format cycled')
          break
        }
        case 'C': {
          // Shift+C: Copy coordinates
          const [lng, lat] = useMapStore.getState().center
          const zoom = useMapStore.getState().zoom
          const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)} (z${zoom.toFixed(1)})`
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(coords)
            toast.success(`Copied: ${coords}`)
          }
          break
        }
        case 'r':
        case 'R': {
          const { isRecording, startRecording, stopRecording } = useMapStore.getState()
          if (isRecording) {
            stopRecording()
            toast.success('Track recording stopped')
          } else {
            if (typeof navigator !== 'undefined' && navigator.geolocation) {
              startRecording()
              navigator.geolocation.watchPosition(
                (position) => {
                  useMapStore.getState().addTrackPoint({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    elevation: position.coords.altitude,
                    timestamp: position.timestamp,
                    speed: position.coords.speed,
                    accuracy: position.coords.accuracy,
                  })
                },
                (error) => {
                  toast.error(`GPS Error: ${error.message}`)
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
              )
              toast.success('Track recording started')
            } else {
              toast.error('Geolocation is not supported')
            }
          }
          break
        }
        case 'Escape':
          useMapStore.getState().setSelectedMarker(null)
          useMapStore.getState().setBatchSelectMode(false)
          break
        case 'g':
        case 'G': {
          const sim = useMapStore.getState().gpsSimulation
          if (sim.isPlaying) {
            useMapStore.getState().setGpsSimulation({ isPlaying: false })
          } else {
            useMapStore.getState().setGpsSimulation({ isPlaying: true, progress: 0 })
          }
          break
        }
        case 'n':
        case 'N':
          setToolMode('notes')
          break
        case 'x':
        case 'X': {
          const batch = useMapStore.getState().batchOperation
          useMapStore.getState().setBatchSelectMode(!batch.isSelectMode)
          break
        }
        case '?':
          if (e.shiftKey) {
            setSidebarOpen(!useMapStore.getState().sidebarOpen)
          } else {
            setShortcutsOpen(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setToolMode, setSidebarOpen, toggleFullscreen, handleLocateMe, setShortcutsOpen])

  const toolIndicator: Record<
    ToolMode,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    navigate: {
      label: 'Navigate',
      color: 'from-emerald-500 to-teal-500',
      icon: <Navigation className="h-3 w-3" />,
    },
    mark: {
      label: 'Drop Pin',
      color: 'from-red-500 to-rose-500',
      icon: <MapPin className="h-3 w-3" />,
    },
    measure: {
      label: 'Measure',
      color: 'from-amber-500 to-orange-500',
      icon: <Ruler className="h-3 w-3" />,
    },
    directions: {
      label: 'Directions',
      color: 'from-cyan-500 to-sky-500',
      icon: <Crosshair className="h-3 w-3" />,
    },
    draw: {
      label: 'Draw',
      color: 'from-green-500 to-emerald-500',
      icon: <Pencil className="h-3 w-3" />,
    },
    area: {
      label: 'Area',
      color: 'from-violet-500 to-purple-500',
      icon: <Maximize2 className="h-3 w-3" />,
    },
    annotate: {
      label: 'Label',
      color: 'from-pink-500 to-rose-500',
      icon: <Type className="h-3 w-3" />,
    },
  }

  const currentTool = toolIndicator[toolMode]

  return (
    <div className={cn(
      'relative w-screen h-screen overflow-hidden bg-background',
      highContrastMode && 'accessibility-high-contrast',
      largeTextMode && 'accessibility-large-text',
      reducedMotionMode && 'accessibility-reduced-motion',
    )}>
      {/* Map loading overlay - shows before map initializes */}
      <AnimatePresence>
        {!mapInitialized && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-background"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-foreground">Loading Map…</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <div className="w-48 h-1 rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <MapView />

      {/* Drawing Layer - renders drawn features on the map */}
      <DrawingLayer />

      {/* Buffer Zone Layer - renders spatial analysis buffers */}
      <BufferZoneLayer />

      {/* Collaborator Cursors - shows other users' positions on the map */}
      <CollaboratorCursors />

      {/* Sun Position Overlay - renders terminator and subsolar point on the map */}
      <SunPositionOverlay />

      {/* Heatmap Layer - renders density heatmap from markers */}
      <HeatmapLayer />

      {/* Map Annotations Layer - renders annotations as GeoJSON on the map */}
      <MapAnnotationsLayer />

      {/* Map Comparison / Swipe View */}
      <MapComparison />

      {/* Crosshair overlay for measure/mark/directions mode */}
      {toolMode !== 'navigate' && (
        <div className="absolute inset-0 pointer-events-none z-[15]" aria-hidden="true">
          {/* Horizontal line */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 60,
              height: 2,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.6)' : toolMode === 'measure' ? 'rgba(245,158,11,0.6)' : toolMode === 'draw' ? 'rgba(34,197,94,0.6)' : toolMode === 'area' ? 'rgba(139,92,246,0.6)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.6)' : 'rgba(6,182,212,0.6)',
              borderRadius: 1,
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 2,
              height: 60,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.6)' : toolMode === 'measure' ? 'rgba(245,158,11,0.6)' : toolMode === 'draw' ? 'rgba(34,197,94,0.6)' : toolMode === 'area' ? 'rgba(139,92,246,0.6)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.6)' : 'rgba(6,182,212,0.6)',
              borderRadius: 1,
            }}
          />
          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 8,
              height: 8,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.7)' : toolMode === 'measure' ? 'rgba(245,158,11,0.7)' : toolMode === 'draw' ? 'rgba(34,197,94,0.7)' : toolMode === 'area' ? 'rgba(139,92,246,0.7)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.7)' : 'rgba(6,182,212,0.7)',
            }}
          />
        </div>
      )}

      {/* Sidebar - responsive */}
      <MapSidebar />

      {/* Map Notifications - top right below top bar */}
      <MapNotifications />

      {/* Voice Navigation Indicator */}
      <VoiceNavigator />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Compass indicator (visible when map is rotated) */}
      <CompassIndicator />

      {/* Top bar - Search and controls */}
      <div
        className="absolute top-2 right-2 left-2 sm:top-3 sm:right-3 sm:left-3 z-10 flex items-start gap-1.5 sm:gap-2 transition-all duration-300 md:pl-0"
      >
        {/* Responsive padding for desktop sidebar */}
        <div className="flex-1 md:flex-1 md:max-w-lg md:ml-0" style={{ marginLeft: sidebarOpen ? '0px' : undefined }}>
          <div className={sidebarOpen ? 'md:pl-[332px]' : ''} style={{ transition: 'padding-left 0.3s ease-in-out' }}>
            <div className="w-full md:min-w-[280px]">
              <SearchBar />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <UndoRedoBar />
          <StyleSwitcher onBrowseAll={() => setStyleGalleryOpen(true)} />
          <Button
            variant="outline"
            size="icon"
            className={`map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${comparisonEnabled ? 'bg-primary/20 border-primary/50 text-primary' : ''}`}
            onClick={() => {
              setComparisonEnabled(!comparisonEnabled)
              if (!comparisonEnabled) {
                pushNotification({ type: 'style', icon: 'compare', message: 'Style comparison mode enabled' })
              }
            }}
            title="Compare map styles"
            aria-label="Toggle style comparison"
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setDistanceMatrixOpen(true)}
            title="Distance Matrix"
            aria-label="Distance matrix calculator"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setSnapshotSaveOpen(true)}
            title="Save Map Snapshot"
            aria-label="Save map snapshot"
          >
            <Save className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <LanguageSelector />
          <NotificationCenter />
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleLocateMe}
            title="My Location"
            aria-label="My Location"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={toggleFullscreen}
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setCoordDialogOpen(true)}
            title="Go to Coordinates (Ctrl+G)"
            aria-label="Go to coordinates"
          >
            <Globe2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleExportMap}
            title="Export Map as Image"
            aria-label="Export map as image"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPrintDialogOpen(true)}
            title="Print Map"
            aria-label="Print map"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleShare}
            title="Share Map View"
            aria-label="Share map view"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setRouteSharingOpen(true)}
            title="Share Route"
            aria-label="Share route"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setEmbedDialogOpen(true)}
            title="Embed Map"
            aria-label="Generate embed code"
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <VoiceNavigationToggle />
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRoutePlaybackOpen(true)}
            title="Route Playback"
            aria-label="Open route playback"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpeedAlertOpen(true)}
            title="Speed Alerts"
            aria-label="Open speed alert system"
          >
            <Gauge className="h-4 w-4" />
          </Button>
          <CollaborationPanel />
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnalyticsPanelOpen(true)}
            title="Analytics Dashboard"
            aria-label="Open analytics dashboard"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAqiPanelOpen(true)}
            title="Air Quality Index"
            aria-label="Open air quality panel"
          >
            <Wind className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTrackStatsPanelOpen(true)}
            title="Track Statistics"
            aria-label="Open track statistics"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarkerManagerOpen(true)}
            title="Advanced Marker Manager"
            aria-label="Open advanced marker manager"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeofenceAlertOpen(true)}
            title="Geofence Alert History"
            aria-label="Open geofence alert history"
          >
            <BellRing className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setMarkerCategoriesOpen(true)}
            title="Marker Categories"
            aria-label="Manage marker categories"
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setStylesMixerOpen(true)}
            title="Style Mixer"
            aria-label="Open style mixer"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMapLabelsOpen(true)}
            title="Map Labels"
            aria-label="Open map labels overlay"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setContourGeneratorOpen(true)}
            title="Contour Generator"
            aria-label="Open contour generator"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setClusteringOpen(true)}
            title="Location Clustering"
            aria-label="Open location clustering"
          >
            <Boxes className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStoryCreatorOpen(true)}
            title="Map Story Creator"
            aria-label="Open map story creator"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTerrainProfile3DOpen(true)}
            title="3D Terrain Profile"
            aria-label="Open 3D terrain profile"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setImportExportOpen(true)}
            title="Data Import/Export"
            aria-label="Open data import/export"
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOverlayGalleryOpen(true)}
            title="Map Overlay Gallery"
            aria-label="Open map overlay gallery"
          >
            <MapPinned className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVisitTimelineOpen(true)}
            title="Location Visit Timeline"
            aria-label="Open location visit timeline"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWeatherCompareOpen(true)}
            title="Weather Comparison"
            aria-label="Open weather comparison"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setScreenshotManagerOpen(true)}
            title="Screenshot Manager"
            aria-label="Open screenshot manager"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDifficultyAnalyzerOpen(true)}
            title="Route Difficulty Analyzer"
            aria-label="Open route difficulty analyzer"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAltitudeAlertOpen(true)}
            title="Altitude Alerts"
            aria-label="Open altitude alert system"
          >
            <ArrowUpFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCompassRose({ visible: !useMapStore.getState().compassRose.visible })}
            title="Compass Rose"
            aria-label="Toggle compass rose"
          >
            <Compass className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMultiStopPlannerOpen(true)}
            title="Multi-Stop Route Planner"
            aria-label="Open multi-stop route planner"
          >
            <Waypoints className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEnhancedWeatherOpen(true)}
            title="Enhanced Weather Dashboard"
            aria-label="Open enhanced weather dashboard"
          >
            <CloudSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setChatOpen(!useMapStore.getState().chatOpen)}
            title="Map Chat Assistant"
            aria-label="Open map chat assistant"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setShareCardOpen(true)}
            title="Coordinate Share Card"
            aria-label="Open coordinate share card"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWallpaperOpen(true)}
            title="Map Wallpaper Generator"
            aria-label="Open map wallpaper generator"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnimationStudioOpen(true)}
            title="Animation Studio"
            aria-label="Open map animation studio"
          >
            <Clapperboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSmartRoute({ open: true })}
            title="Smart Route Planner"
            aria-label="Open smart route planner"
          >
            <Route className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDataVisualizer({ open: true })}
            title="Data Visualizer"
            aria-label="Open data visualizer"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFieldSurvey({ open: true })}
            title="Field Survey Tool"
            aria-label="Open field survey tool"
          >
            <ClipboardCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEmergencyRoute({ open: true })}
            title="Emergency Route Planner"
            aria-label="Open emergency route planner"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setComparisonSlider({ enabled: !useMapStore.getState().comparisonSlider.enabled })}
            title="Map Comparison Slider"
            aria-label="Toggle map comparison slider"
          >
            <SplitSquareHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setNoiseHeatmap({ enabled: !useMapStore.getState().noiseHeatmap.enabled })}
            title="Noise Heatmap"
            aria-label="Toggle noise heatmap"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarExposure({ open: true })}
            title="Solar Exposure Analyzer"
            aria-label="Open solar exposure analyzer"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStyleForge({ open: true })}
            title="Style Forge"
            aria-label="Open style forge"
          >
            <Hammer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTopoProfiler({ open: true })}
            title="Topographic Profiler"
            aria-label="Open topographic profiler"
          >
            <MountainIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMaritimeNav({ open: true })}
            title="Maritime Navigation"
            aria-label="Open maritime navigation"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeocaching({ open: true })}
            title="Geocaching Toolkit"
            aria-label="Open geocaching toolkit"
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAtmospheric({ open: true })}
            title="Atmospheric Dashboard"
            aria-label="Open atmospheric dashboard"
          >
            <CloudCog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeTracker({ open: true })}
            title="Wildlife Tracker"
            aria-label="Open wildlife tracker"
          >
            <Bird className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCulturalHeritage({ open: true })}
            title="Cultural Heritage Map"
            aria-label="Open cultural heritage map"
          >
            <Landmark className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHydrology({ open: true })}
            title="Hydrology Analyzer"
            aria-label="Open hydrology analyzer"
          >
            <Droplets className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierMonitor({ open: true })}
            title="Glacier Monitor"
            aria-label="Open glacier monitor"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeismicActivity({ open: true })}
            title="Seismic Activity"
            aria-label="Open seismic activity map"
          >
            <ActivityIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilAnalysis({ open: true })}
            title="Soil Analysis"
            aria-label="Open soil analysis panel"
          >
            <Sprout className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanGrowth({ open: true })}
            title="Urban Growth Simulator"
            aria-label="Open urban growth simulator"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirspaceNav({ open: true })}
            title="Airspace Navigator"
            aria-label="Open airspace navigator"
          >
            <Plane className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setReefHealth({ open: true })}
            title="Reef Health Monitor"
            aria-label="Open reef health monitor"
          >
            <Waves className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagneticField({ open: true })}
            title="Magnetic Field Mapper"
            aria-label="Open magnetic field mapper"
          >
            <Magnet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFloodRisk({ open: true })}
            title="Flood Risk Analyzer"
            aria-label="Open flood risk analyzer"
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoMonitor({ open: true })}
            title="Volcano Monitor"
            aria-label="Open volcano monitor"
          >
            <Flame className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheRisk({ open: true })}
            title="Avalanche Risk Map"
            aria-label="Open avalanche risk map"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCropHealth({ open: true })}
            title="Crop Health Analyzer"
            aria-label="Open crop health analyzer"
          >
            <Wheat className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceTrack({ open: true })}
            title="Space Track Viewer"
            aria-label="Open space track viewer"
          >
            <Satellite className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setArchaeologyMap({ open: true })}
            title="Archaeology Map"
            aria-label="Open archaeology map"
          >
            <Pyramid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPollutionTracker({ open: true })}
            title="Pollution Tracker"
            aria-label="Open pollution tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTidalPredictor({ open: true })}
            title="Tidal Predictor"
            aria-label="Open tidal predictor"
          >
            <Ship className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWindFarm({ open: true })}
            title="Wind Farm Optimizer"
            aria-label="Open wind farm optimizer"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertification({ open: true })}
            title="Desertification Monitor"
            aria-label="Open desertification monitor"
          >
            <SunIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMineralExploration({ open: true })}
            title="Mineral Exploration"
            aria-label="Open mineral exploration"
          >
            <Gem className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrent({ open: true })}
            title="Ocean Current Mapper"
            aria-label="Open ocean current mapper"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrost({ open: true })}
            title="Permafrost Thaw Tracker"
            aria-label="Open permafrost thaw tracker"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightning({ open: true })}
            title="Lightning Strike Map"
            aria-label="Open lightning strike map"
          >
            <CloudLightning className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBiome({ open: true })}
            title="Biome Classifier"
            aria-label="Open biome classifier"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGroundwater({ open: true })}
            title="Groundwater Explorer"
            aria-label="Open groundwater explorer"
          >
            <DropletIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarPower({ open: true })}
            title="Solar Power Planner"
            aria-label="Open solar power planner"
          >
            <SunMedium className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicAsh({ open: true })}
            title="Volcanic Ash Tracker"
            aria-label="Open volcanic ash tracker"
          >
            <CloudHail className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoastalErosion({ open: true })}
            title="Coastal Erosion Monitor"
            aria-label="Open coastal erosion monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonFootprint({ open: true })}
            title="Carbon Footprint Mapper"
            aria-label="Open carbon footprint mapper"
          >
            <CloudSmoke className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeMigration({ open: true })}
            title="Wildlife Migration Tracker"
            aria-label="Open wildlife migration tracker"
          >
            <BirdIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setIceSheet({ open: true })}
            title="Ice Sheet Monitor"
            aria-label="Open ice sheet monitor"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDroughtMonitor({ open: true })}
            title="Drought Monitor"
            aria-label="Open drought monitor"
          >
            <ThermometerSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandSubsidence({ open: true })}
            title="Land Subsidence Tracker"
            aria-label="Open land subsidence tracker"
          >
            <ArrowDownFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralBleaching({ open: true })}
            title="Coral Bleaching Alert"
            aria-label="Open coral bleaching alert"
          >
            <Shell className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiAlert({ open: true })}
            title="Tsunami Alert System"
            aria-label="Open tsunami alert system"
          >
            <Siren className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilErosion({ open: true })}
            title="Soil Erosion Monitor"
            aria-label="Open soil erosion monitor"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWatershedManager({ open: true })}
            title="Watershed Manager"
            aria-label="Open watershed manager"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicPlate({ open: true })}
            title="Tectonic Plate Viewer"
            aria-label="Open tectonic plate viewer"
          >
            <GlobeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirQualityForecaster({ open: true })}
            title="Air Quality Forecaster"
            aria-label="Open air quality forecaster"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacialLake({ open: true })}
            title="Glacial Lake Monitor"
            aria-label="Open glacial lake monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeather({ open: true })}
            title="Space Weather Monitor"
            aria-label="Open space weather monitor"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatlandMonitor({ open: true })}
            title="Peatland Monitor"
            aria-label="Open peatland monitor"
          >
            <TreeDeciduous className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveMonitor({ open: true })}
            title="Mangrove Monitor"
            aria-label="Open mangrove monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSandstormTracker({ open: true })}
            title="Sandstorm Tracker"
            aria-label="Open sandstorm tracker"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWetlandMapper({ open: true })}
            title="Wetland Mapper"
            aria-label="Open wetland mapper"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanHeatIsland({ open: true })}
            title="Urban Heat Island"
            aria-label="Open urban heat island"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildfireRisk({ open: true })}
            title="Wildfire Risk Assessor"
            aria-label="Open wildfire risk assessor"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAlgalBloom({ open: true })}
            title="Algal Bloom Tracker"
            aria-label="Open algal bloom tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandslidePredictor({ open: true })}
            title="Landslide Predictor"
            aria-label="Open landslide predictor"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaIceNavigator({ open: true })}
            title="Sea Ice Navigator"
            aria-label="Open sea ice navigator"
          >
            <ShipIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCloudCover({ open: true })}
            title="Cloud Cover Analyzer"
            aria-label="Open cloud cover analyzer"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilMoisture({ open: true })}
            title="Soil Moisture Monitor"
            aria-label="Open soil moisture monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightPollution({ open: true })}
            title="Light Pollution Map"
            aria-label="Open light pollution map"
          >
            <MoonIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRiverFlow({ open: true })}
            title="River Flow Monitor"
            aria-label="Open river flow monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoSeismic({ open: true })}
            title="Volcano Seismic Monitor"
            aria-label="Open volcano seismic monitor"
          >
            <Triangle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWhaleMigration({ open: true })}
            title="Whale Migration Tracker"
            aria-label="Open whale migration tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheForecaster({ open: true })}
            title="Avalanche Forecaster"
            aria-label="Open avalanche forecaster"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAuroraForecaster({ open: true })}
            title="Aurora Forecaster"
            aria-label="Open aurora forecaster"
          >
            <SparklesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOzoneLayer({ open: true })}
            title="Ozone Layer Monitor"
            aria-label="Open ozone layer monitor"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeforestation({ open: true })}
            title="Deforestation Tracker"
            aria-label="Open deforestation tracker"
          >
            <TreePine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneEmissions({ open: true })}
            title="Methane Emissions Tracker"
            aria-label="Open methane emissions tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanAcidification({ open: true })}
            title="Ocean Acidification Monitor"
            aria-label="Open ocean acidification monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceDebris({ open: true })}
            title="Space Debris Tracker"
            aria-label="Open space debris tracker"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicStrain({ open: true })}
            title="Tectonic Strain Monitor"
            aria-label="Open tectonic strain monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPhytoBloom({ open: true })}
            title="Phytoplankton Bloom Monitor"
            aria-label="Open phytoplankton bloom monitor"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSnowCover({ open: true })}
            title="Snow Cover Monitor"
            aria-label="Open snow cover monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeomagneticStorm({ open: true })}
            title="Geomagnetic Storm Tracker"
            aria-label="Open geomagnetic storm tracker"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicGas({ open: true })}
            title="Volcanic Gas Monitor"
            aria-label="Open volcanic gas monitor"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAquiferDepletion({ open: true })}
            title="Aquifer Depletion Monitor"
            aria-label="Open aquifer depletion monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStratosphericWind({ open: true })}
            title="Stratospheric Wind Monitor"
            aria-label="Open stratospheric wind monitor"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarineHeatwave({ open: true })}
            title="Marine Heatwave Tracker"
            aria-label="Open marine heatwave tracker"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPrecipitation({ open: true })}
            title="Precipitation Analyzer"
            aria-label="Open precipitation analyzer"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCosmicRay({ open: true })}
            title="Cosmic Ray Monitor"
            aria-label="Open cosmic ray monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGreenlandIce({ open: true })}
            title="Greenland Ice Tracker"
            aria-label="Open greenland ice tracker"
          >
            <Globe2Icon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadiationExposure({ open: true })}
            title="Radiation Exposure Monitor"
            aria-label="Open radiation exposure monitor"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatFire({ open: true })}
            title="Peat Fire Tracker"
            aria-label="Open peat fire tracker"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaLevelRise({ open: true })}
            title="Sea Level Rise Projector"
            aria-label="Open sea level rise projector"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setThermocline({ open: true })}
            title="Thermocline Mapper"
            aria-label="Open thermocline mapper"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAcidRain({ open: true })}
            title="Acid Rain Tracker"
            aria-label="Open acid rain tracker"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneHydrate({ open: true })}
            title="Methane Hydrate Monitor"
            aria-label="Open methane hydrate monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setKelpForest({ open: true })}
            title="Kelp Forest Monitor"
            aria-label="Open kelp forest monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGLOF({ open: true })}
            title="Glacier Lake Outburst Tracker"
            aria-label="Open glacier lake outburst tracker"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDustStorm({ open: true })}
            title="Dust Storm Tracker"
            aria-label="Open dust storm tracker"
          >
            <WindIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBioluminescence({ open: true })}
            title="Bioluminescence Tracker"
            aria-label="Open bioluminescence tracker"
          >
            <SparklesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanSprawl({ open: true })}
            title="Urban Sprawl Monitor"
            aria-label="Open urban sprawl monitor"
          >
            <Building2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setViralOutbreak({ open: true })}
            title="Viral Outbreak Mapper"
            aria-label="Open viral outbreak mapper"
          >
            <Bug className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagnetosphere({ open: true })}
            title="Magnetosphere Monitor"
            aria-label="Open magnetosphere monitor"
          >
            <MagnetIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFogDensity({ open: true })}
            title="Fog Density Mapper"
            aria-label="Open fog density mapper"
          >
            <CloudFog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonCapture({ open: true })}
            title="Carbon Capture Tracker"
            aria-label="Open carbon capture tracker"
          >
            <FactoryIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHailStorm({ open: true })}
            title="Hail Storm Tracker"
            aria-label="Open hail storm tracker"
          >
            <CloudHailIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSaharaReforestation({ open: true })}
            title="Sahara Reforestation Tracker"
            aria-label="Open sahara reforestation tracker"
          >
            <TreePineIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeepSeaVent({ open: true })}
            title="Deep Sea Vent Monitor"
            aria-label="Open deep sea vent monitor"
          >
            <FlameIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStormSurge({ open: true })}
            title="Storm Surge Predictor"
            aria-label="Open storm surge predictor"
          >
            <WavesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandfillMonitor({ open: true })}
            title="Landfill Monitor"
            aria-label="Open landfill monitor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSalinityGradient({ open: true })}
            title="Salinity Gradient Mapper"
            aria-label="Open salinity gradient mapper"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMicroplastics({ open: true })}
            title="Microplastics Tracker"
            aria-label="Open microplastics tracker"
          >
            <SearchIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadioSignal({ open: true })}
            title="Radio Signal Mapper"
            aria-label="Open radio signal mapper"
          >
            <RadioIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicIsland({ open: true })}
            title="Volcanic Island Monitor"
            aria-label="Open volcanic island monitor"
          >
            <MountainIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrostThaw({ open: true })}
            title="Permafrost Thaw Monitor"
            aria-label="Open permafrost thaw monitor"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrentTracker({ open: true })}
            title="Ocean Current Tracker"
            aria-label="Open ocean current tracker"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeatherAlert({ open: true })}
            title="Space Weather Alert"
            aria-label="Open space weather alert"
          >
            <SunIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertMonitor({ open: true })}
            title="Desert Monitor"
            aria-label="Open desert monitor"
          >
            <SunDim className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiBuoy({ open: true })}
            title="Tsunami Buoy Tracker"
            aria-label="Open tsunami buoy tracker"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierVelocity({ open: true })}
            title="Glacier Velocity Tracker"
            aria-label="Open glacier velocity tracker"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEarthquakeSwarm({ open: true })}
            title="Earthquake Swarm Monitor"
            aria-label="Open earthquake swarm monitor"
          >
            <ActivityIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveRestoration({ open: true })}
            title="Mangrove Restoration Tracker"
            aria-label="Open mangrove restoration tracker"
          >
            <TreeDeciduousIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() =>
              window.open('https://github.com/maplibre/maplibre-native', '_blank')
            }
            title="GitHub"
            aria-label="View on GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tool toolbar - left side (desktop only) */}
      <div className="hidden md:block absolute left-4 z-10 transition-all duration-300" style={{ top: '80px' }}>
        <MapToolbar aiSuggestionsOpen={aiSuggestionsOpen} setAiSuggestionsOpen={setAiSuggestionsOpen} />
        {/* Track Record Button */}
        <div className="mt-2 flex justify-center">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrackRecordButton
                  onClick={() => {
                    const { isRecording, startRecording, stopRecording } = useMapStore.getState()
                    if (isRecording) {
                      stopRecording()
                    } else {
                      if (typeof navigator !== 'undefined' && navigator.geolocation) {
                        startRecording()
                        navigator.geolocation.watchPosition(
                          (position) => {
                            useMapStore.getState().addTrackPoint({
                              latitude: position.coords.latitude,
                              longitude: position.coords.longitude,
                              elevation: position.coords.altitude,
                              timestamp: position.timestamp,
                              speed: position.coords.speed,
                              accuracy: position.coords.accuracy,
                            })
                          },
                          (error) => {
                            toast.error(`GPS Error: ${error.message}`)
                          },
                          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
                        )
                        toast.success('GPS recording started')
                      } else {
                        toast.error('Geolocation is not supported')
                      }
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                GPS Track Recording
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Measurement Suite & Trail Finder buttons */}
        <div className="mt-2 flex flex-col items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.measurementSuiteOpen)
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setMeasurementSuiteOpen(true)}
                  aria-label="Measurement Suite"
                >
                  <Triangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Measurement Suite
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.trailFinderOpen)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTrailFinderOpen(true)}
                  aria-label="Trail Finder"
                >
                  <TreePine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Trail Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.pedometerVisible)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPedometerVisible(!useMapStore.getState().pedometerVisible)}
                  aria-label="Pedometer"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Pedometer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.usageStatsOpen)
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setUsageStatsOpen(true)}
                  aria-label="Usage Statistics"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Usage Statistics
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.collageCreatorOpen)
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCollageCreatorOpen(true)}
                  aria-label="Map Collage Creator"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Map Collage Creator
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.eventsFinderOpen)
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEventsFinderOpen(true)}
                  aria-label="Nearby Events Finder"
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Nearby Events Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Drawing Toolbar - appears when draw tool is active */}
      <DrawingToolbar />

      {/* AI Suggestions Panel - left side below toolbar (desktop only) */}
      {aiSuggestionsOpen && (
        <div className="hidden md:block absolute z-10" style={{ left: '80px', top: '80px' }}>
          <AISuggestionsPanel />
        </div>
      )}

      {/* Route Analytics Panel - left side below AI suggestions (desktop only) */}
      <div className="hidden md:block absolute z-10" style={{ left: aiSuggestionsOpen ? '400px' : '80px', top: '80px', transition: 'left 0.3s ease-in-out' }}>
        <RouteAnalyticsPanel />
      </div>

      {/* Route Comparison Panel - right side below search bar (desktop only) */}
      {comparedRoutes.length > 0 && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <RouteComparisonPanel />
        </div>
      )}

      {/* Terrain Analysis Panel - right side below comparison (desktop only) */}
      {terrainAnalysisRouteId && (
        <div className="hidden md:block absolute z-10" style={{ right: comparedRoutes.length > 0 ? '560px' : '20px', top: '80px', transition: 'right 0.3s ease-in-out' }}>
          <TerrainAnalysisPanel />
        </div>
      )}

      {/* Accessibility Panel - right side (desktop only) */}
      {accessibilityPanelOpen && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <AccessibilityPanel />
        </div>
      )}

      {/* Quick Jump Panel - left side below toolbar (desktop only) */}
      <div className="hidden md:block absolute z-10 transition-all duration-300" style={{ left: sidebarOpen ? '332px' : '16px', top: '140px' }}>
        <QuickJumpPanel onOpenBookmarkManager={() => setBookmarkManagerOpen(true)} />
      </div>

      {/* Current tool indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={toolMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 hidden md:block transition-all"
          style={{
            left: sidebarOpen ? '332px' : '60px',
            top: '80px',
            transition: 'left 0.3s ease-in-out',
          }}
        >
          <Badge
            className={`bg-gradient-to-r ${currentTool.color} text-white border-0 px-3 py-1.5 gap-1.5 shadow-lg`}
          >
            {currentTool.icon}
            {currentTool.label} Mode
          </Badge>
        </motion.div>
      </AnimatePresence>

      {/* Mobile weather bar - below search on mobile only */}
      <div className="md:hidden absolute top-[52px] sm:top-[58px] left-2 right-2 sm:left-3 sm:right-3 z-10">
        <MobileWeatherBar />
      </div>

      {/* Mobile tool indicator - shows on mobile below search/weather */}
      <div className="md:hidden absolute top-[88px] sm:top-24 left-2 sm:left-3 z-10">
        <Badge
          className={`bg-gradient-to-r ${currentTool.color} text-white border-0 px-2.5 py-1 gap-1 shadow-lg text-xs`}
        >
          {currentTool.icon}
          {currentTool.label}
        </Badge>
      </div>

      {/* Mobile bottom toolbar */}
      <div className="md:hidden absolute bottom-10 left-2 right-2 sm:left-3 sm:right-3 z-10 safe-area-bottom">
        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-1.5 sm:p-2 mobile-toolbar-container">
          {([
            { mode: 'navigate' as ToolMode, icon: <Navigation className="h-4 w-4" />, label: 'Navigate', activeClass: 'bg-emerald-500 text-white' },
            { mode: 'mark' as ToolMode, icon: <MapPin className="h-4 w-4" />, label: 'Pin', activeClass: 'bg-red-500 text-white' },
            { mode: 'measure' as ToolMode, icon: <Ruler className="h-4 w-4" />, label: 'Measure', activeClass: 'bg-amber-500 text-white' },
            { mode: 'directions' as ToolMode, icon: <Crosshair className="h-4 w-4" />, label: 'Route', activeClass: 'bg-cyan-500 text-white' },
            { mode: 'draw' as ToolMode, icon: <Pencil className="h-4 w-4" />, label: 'Draw', activeClass: 'bg-green-500 text-white' },
            { mode: 'area' as ToolMode, icon: <Maximize2 className="h-4 w-4" />, label: 'Area', activeClass: 'bg-violet-500 text-white' },
            { mode: 'annotate' as ToolMode, icon: <Type className="h-4 w-4" />, label: 'Label', activeClass: 'bg-pink-500 text-white' },
          ]).map((tool) => (
            <button
              key={tool.mode}
              onClick={() => setToolMode(tool.mode)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs transition-all min-w-[44px] min-h-[44px] justify-center touch-feedback ${
                toolMode === tool.mode ? tool.activeClass + ' shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              aria-label={`${tool.label} tool`}
            >
              {tool.icon}
              <span className="text-[8px] sm:text-[9px] font-medium">{tool.label}</span>
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-0.5 sm:mx-1" />
          <button
            onClick={handleLocateMe}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all min-w-[44px] min-h-[44px] justify-center touch-feedback"
            aria-label="My location"
          >
            <LocateFixed className="h-4 w-4" />
            <span className="text-[8px] sm:text-[9px] font-medium">Locate</span>
          </button>
        </div>
      </div>

      {/* Map Stats Panel - right side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 right-5 z-10">
        <MapStatsPanel />
      </div>

      {/* Weather Panel - left side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 z-10" style={{ left: sidebarOpen ? '332px' : '20px', transition: 'left 0.3s ease-in-out' }}>
        <WeatherPanel />
      </div>

      {/* Elevation Profile Panel - above weather panel when measuring, routing, or viewing route elevation (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) && weatherEnabled ? '260px' : '12px',
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <ElevationProfile />
      </div>

      {/* Heatmap Controls - bottom-left above coordinates (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) ? (weatherEnabled ? '360px' : '120px') : (weatherEnabled ? '260px' : '12px'),
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <HeatmapControls />
      </div>

      {/* Sun Info Panel - right side above map stats (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          right: '20px',
          bottom: sunPositionEnabled ? '100px' : '12px',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        <SunInfoPanel />
      </div>

      {/* Sun Info Panel - mobile version, bottom-left */}
      <div className="md:hidden absolute bottom-20 left-3 z-10">
        <SunInfoPanel />
      </div>

      {/* Minimap - bottom right above MapStatsPanel (desktop only) */}
      <MiniMap />

      {/* Map Legend - right side below minimap (desktop only) */}
      <MapLegend />

      {/* Coordinates display - bottom center (desktop only) */}
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <CoordinatesDisplay />
      </div>

      {/* Add Location FAB */}
      <motion.div
        className="absolute bottom-16 right-3 sm:bottom-20 sm:right-5 md:bottom-20 md:right-5 z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 h-12 md:h-14 px-4 md:px-5 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 transition-all duration-200 fab-pulse-shadow"
          onClick={() => setAddDialogOpen(true)}
          aria-label="Add new location"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Add Place</span>
        </Button>
      </motion.div>

      {/* Welcome banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4 hidden md:block"
          >
            <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none">
                <div className="absolute inset-0 rounded-2xl animate-gradient-rotate" style={{
                  background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #10b981)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1.5px',
                }} />
              </div>
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-emerald-400"
                    initial={{
                      x: Math.random() * 300,
                      y: Math.random() * 150,
                      opacity: 0,
                    }}
                    animate={{
                      y: [Math.random() * 150, Math.random() * 50, Math.random() * 150],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent z-10"
                aria-label="Dismiss welcome"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="font-bold text-base">
                    Welcome to MapLibre Explorer
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    An interactive map application powered by MapLibre GL JS.
                    Explore the world, drop pins, measure distances, and switch
                    between beautiful map styles.
                  </p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {[
                      { label: '8 Map Styles', emoji: '🗺️', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                      { label: '3D Terrain', emoji: '⛰️', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
                      { label: 'Satellite', emoji: '🛰️', bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
                      { label: 'Weather', emoji: '🌤️', bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400' },
                      { label: 'Save Places', emoji: '📍', bg: 'bg-red-500/10 text-red-700 dark:text-red-400' },
                      { label: 'Measure', emoji: '📏', bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
                      { label: 'Custom Tiles', emoji: '🧩', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
                      { label: 'Shortcuts', emoji: '⌨️', bg: 'bg-violet-500/10 text-violet-700 dark:text-violet-400' },
                    ].map((feature, featureIndex) => (
                      <motion.div
                        key={feature.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + featureIndex * 0.06 }}
                      >
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 gap-1 ${feature.bg}`}
                        >
                          {feature.emoji} {feature.label}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block"
                  >
                    <Button
                      size="sm"
                      className="mt-3 h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25 px-5 font-medium"
                      onClick={() => {
                        setShowWelcome(false)
                        setTimeout(() => {
                          document.getElementById('map-search-input')?.focus()
                        }, 100)
                      }}
                    >
                      Get Started →
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Location Dialog */}
      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Coordinate Input Dialog */}
      <CoordinateInputDialog open={coordDialogOpen} onOpenChange={setCoordDialogOpen} />

      {/* Map Export Dialog */}
      <MapExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />

      {/* Map Print Dialog */}
      <MapPrintDialog />

      {/* Bookmark Manager Dialog */}
      <BookmarkManager open={bookmarkManagerOpen} onOpenChange={setBookmarkManagerOpen} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Share Dialog */}
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />

      {/* Embed Map Dialog */}
      <EmbedMapDialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen} />

      {/* Marker Categories Manager */}
      <MarkerCategoriesManager open={markerCategoriesOpen} onOpenChange={setMarkerCategoriesOpen} />

      {/* Waypoint Optimizer */}
      <WaypointOptimizer open={waypointOptimizerOpen} onOpenChange={setWaypointOptimizerOpen} />

      {/* Styles Mixer */}
      <StylesMixer open={stylesMixerOpen} onOpenChange={setStylesMixerOpen} />

      {/* Route Sharing Dialog */}
      <RouteSharingDialog open={routeSharingOpen} onOpenChange={setRouteSharingOpen} />

      {/* Route Playback Dialog */}
      <RoutePlayback />

      {/* Speed Alert System Dialog */}
      <SpeedAlertSystem />

      {/* Altitude Alert System Dialog */}
      <AltitudeAlertSystem />

      {/* Custom Compass Rose Overlay */}
      <CustomCompassRose />

      {/* Multi-Stop Route Planner */}
      <MultiStopRoutePlanner />

      {/* Enhanced Weather Dashboard */}
      <EnhancedWeatherDashboard />

      {/* Sun Shadow Calculator */}
      <SunShadowCalculator />

      {/* SVG Marker Designer */}
      <SVGMarkerDesigner />

      {/* Map Labels Overlay */}
      <MapLabelsOverlay />

      {/* Contour Generator */}
      <ContourGenerator />

      {/* Location Clustering */}
      <LocationClusterMap />

      {/* Map Story Creator */}
      <MapStoryCreator />

      {/* Terrain Profile 3D */}
      <TerrainProfile3D />

      {/* Data Import/Export */}
      <DataImportExport />

      {/* Advanced Marker Manager */}
      <AdvancedMarkerManager />

      {/* Geofence Alert History */}
      <GeofenceAlertHistory />

      {/* Coordinate Grid Overlay */}
      <CoordinateGridOverlay />

      {/* Map Overlay Gallery */}
      <MapOverlayGallery />

      {/* Location Visit Timeline */}
      <LocationVisitTimeline />

      {/* Weather Comparison */}
      <WeatherComparison />

      {/* Geofence Dialog */}
      <GeofenceDialog
        open={geofenceDialogOpen}
        onOpenChange={setGeofenceDialogOpen}
        latitude={geofenceCoords?.lat}
        longitude={geofenceCoords?.lng}
      />

      {/* Distance Matrix Dialog */}
      <DistanceMatrix open={distanceMatrixOpen} onOpenChange={setDistanceMatrixOpen} />

      {/* Measurement Suite Dialog */}
      <MeasurementSuite />

      {/* Trail Finder Dialog */}
      <TrailFinder />

      {/* Style Gallery Dialog */}
      <StyleGallery open={styleGalleryOpen} onOpenChange={setStyleGalleryOpen} />

      {/* Snapshot Save Dialog */}
      {snapshotSaveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSnapshotSaveOpen(false)}>
          <div
            className="bg-background rounded-2xl shadow-2xl p-6 w-80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-500" />
              Save Map Snapshot
            </h3>
            <p className="text-xs text-muted-foreground">Save the current map view, position, and markers as a snapshot you can restore later.</p>
            <input
              type="text"
              placeholder="Snapshot name..."
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = snapshotName.trim() || `Snapshot ${useMapStore.getState().snapshots.length + 1}`
                  useMapStore.getState().saveSnapshot(name)
                  setSnapshotName('')
                  setSnapshotSaveOpen(false)
                  toast.success(`Snapshot "${name}" saved`)
                }
              }}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setSnapshotSaveOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  const name = snapshotName.trim() || `Snapshot ${useMapStore.getState().snapshots.length + 1}`
                  useMapStore.getState().saveSnapshot(name)
                  setSnapshotName('')
                  setSnapshotSaveOpen(false)
                  toast.success(`Snapshot "${name}" saved`)
                }}
              >
                <Camera className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Track Recorder Panel */}
      <TrackRecorder />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* 3D Buildings Layer */}
      <Buildings3DLayer />

      {/* Building Info Panel */}
      <BuildingInfoPanel />

      {/* Map Timeline */}
      <MapTimeline />

      {/* Analytics Dashboard */}
      <MapAnalyticsDashboard />

      {/* Air Quality Panel */}
      <AirQualityPanel />

      {/* GPS Simulator */}
      <GPSSimulator />

      {/* Map Notes Layer */}
      <MapNotesLayer />

      {/* Batch Operations Action Bar */}
      <BatchActionBar />

      {/* Track Statistics Panel */}
      <TrackStatsPanel />

      {/* Pedometer Widget */}
      <PedometerWidget />

      {/* Map Usage Stats Dialog */}
      <MapUsageStats />

      {/* Screenshot Manager */}
      <ScreenshotManager />

      {/* Route Difficulty Analyzer */}
      <RouteDifficultyAnalyzer />

      {/* Map Collage Creator */}
      <MapCollageCreator />

      {/* Nearby Events Finder */}
      <NearbyEventsFinder />

      {/* Coordinate Share Card */}
      <CoordinateShareCard />

      {/* Map Wallpaper Generator */}
      <MapWallpaperGenerator />

      {/* Chat Assistant */}
      <MapChatAssistant />

      {/* POI Density Heatmap Layer */}
      <POIDensityHeatmap />

      {/* Map Animation Studio */}
      <MapAnimationStudio />

      {/* Smart Route Planner */}
      <SmartRoutePlanner />

      {/* Map Data Visualizer */}
      <MapDataVisualizer />

      {/* Field Survey Tool */}
      <FieldSurveyTool />

      {/* Emergency Route Planner */}
      <EmergencyRoutePlanner />

      {/* Map Comparison Slider */}
      <MapComparisonSlider />

      {/* Noise Heatmap Overlay */}
      <NoiseHeatmapOverlay />

      {/* Solar Exposure Analyzer */}
      <SolarExposureAnalyzer />

      {/* Map Style Forge */}
      <MapStyleForge />

      {/* Topographic Profiler */}
      <TopographicProfiler />

      {/* Maritime Navigation */}
      <MaritimeNavigation />

      {/* Geocaching Toolkit */}
      <GeocachingToolkit />

      {/* Atmospheric Dashboard */}
      <AtmosphericDashboard />

      {/* Wildlife Tracker */}
      <WildlifeTracker />

      {/* Cultural Heritage Map */}
      <CulturalHeritageMap />

      {/* Hydrology Analyzer */}
      <HydrologyAnalyzer />

      {/* Glacier Monitor */}
      <GlacierMonitor />

      {/* Seismic Activity Map */}
      <SeismicActivityMap />

      {/* Soil Analysis Panel */}
      <SoilAnalysisPanel />

      {/* Urban Growth Simulator */}
      <UrbanGrowthSimulator />

      {/* Airspace Navigator */}
      <AirspaceNavigator />

      {/* Reef Health Monitor */}
      <ReefHealthMonitor />

      {/* Magnetic Field Mapper */}
      <MagneticFieldMapper />

      {/* Flood Risk Analyzer */}
      <FloodRiskAnalyzer />

      {/* Volcano Monitor */}
      <VolcanoMonitor />

      {/* Avalanche Risk Map */}
      <AvalancheRiskMap />

      {/* Crop Health Analyzer */}
      <CropHealthAnalyzer />

      {/* Space Track Viewer */}
      <SpaceTrackViewer />

      {/* Archaeology Map */}
      <ArchaeologyMap />

      {/* Pollution Tracker */}
      <PollutionTracker />

      {/* Tidal Predictor */}
      <TidalPredictor />

      {/* Wind Farm Optimizer */}
      <WindFarmOptimizer />

      {/* Desertification Monitor */}
      <DesertificationMonitor />

      {/* Mineral Exploration */}
      <MineralExploration />

      {/* Ocean Current Mapper */}
      <OceanCurrentMapper />

      {/* Permafrost Thaw Tracker */}
      <PermafrostThawTracker />

      {/* Lightning Strike Map */}
      <LightningStrikeMap />

      {/* Biome Classifier */}
      <BiomeClassifier />

      {/* Groundwater Explorer */}
      <GroundwaterExplorer />

      {/* Solar Power Planner */}
      <SolarPowerPlanner />

      {/* Volcanic Ash Tracker */}
      <VolcanicAshTracker />

      {/* Coastal Erosion Monitor */}
      <CoastalErosionMonitor />

      {/* Carbon Footprint Mapper */}
      <CarbonFootprintMapper />

      {/* Wildlife Migration Tracker */}
      <WildlifeMigrationTracker />

      {/* Ice Sheet Monitor */}
      <IceSheetMonitor />

      {/* Drought Monitor Panel */}
      <DroughtMonitorPanel />

      {/* Land Subsidence Tracker */}
      <LandSubsidenceTracker />

      {/* Coral Bleaching Alert */}
      <CoralBleachingAlert />

      {/* Tsunami Alert System */}
      <TsunamiAlertSystem />

      {/* Soil Erosion Monitor */}
      <SoilErosionMonitor />

      {/* Watershed Manager Panel */}
      <WatershedManagerPanel />

      {/* Tectonic Plate Viewer */}
      <TectonicPlateViewer />

      {/* Air Quality Forecaster */}
      <AirQualityForecaster />

      {/* Glacial Lake Monitor */}
      <GlacialLakeMonitor />

      {/* Space Weather Monitor */}
      <SpaceWeatherMonitor />

      {/* Peatland Monitor Panel */}
      <PeatlandMonitorPanel />

      {/* Mangrove Monitor */}
      <MangroveMonitor />

      {/* Sandstorm Tracker */}
      <SandstormTracker />

      {/* Wetland Mapper */}
      <WetlandMapper />

      {/* Urban Heat Island */}
      <UrbanHeatIsland />

      {/* Wildfire Risk Assessor */}
      <WildfireRiskAssessor />

      {/* Algal Bloom Tracker */}
      <AlgalBloomTracker />

      {/* Landslide Predictor */}
      <LandslidePredictor />

      {/* Sea Ice Navigator */}
      <SeaIceNavigator />

      {/* Cloud Cover Analyzer */}
      <CloudCoverAnalyzer />

      {/* Soil Moisture Monitor */}
      <SoilMoistureMonitor />

      {/* Light Pollution Map */}
      <LightPollutionMap />

      {/* River Flow Monitor */}
      <RiverFlowMonitor />

      {/* Volcano Seismic Monitor */}
      <VolcanoSeismicMonitor />

      {/* Whale Migration Tracker */}
      <WhaleMigrationTracker />

      {/* Avalanche Forecaster */}
      <AvalancheForecaster />

      {/* Aurora Forecaster */}
      <AuroraForecaster />

      {/* Ozone Layer Monitor */}
      <OzoneLayerMonitor />

      {/* Deforestation Tracker */}
      <DeforestationTracker />

      {/* Methane Emissions Tracker */}
      <MethaneEmissionsTracker />

      {/* Ocean Acidification Monitor */}
      <OceanAcidificationMonitor />

      {/* Space Debris Tracker */}
      <SpaceDebrisTracker />

      {/* Tectonic Strain Monitor */}
      <TectonicStrainMonitor />

      {/* Phytoplankton Bloom Monitor */}
      <PhytoBloomMonitor />

      {/* Snow Cover Monitor */}
      <SnowCoverMonitor />

      {/* Geomagnetic Storm Tracker */}
      <GeomagneticStormTracker />

      {/* Volcanic Gas Monitor */}
      <VolcanicGasMonitor />

      {/* Aquifer Depletion Monitor */}
      <AquiferDepletionMonitor />

      {/* Stratospheric Wind Monitor */}
      <StratosphericWindMonitor />

      {/* Marine Heatwave Tracker */}
      <MarineHeatwaveTracker />

      {/* Precipitation Analyzer */}
      <PrecipitationAnalyzer />

      {/* Cosmic Ray Monitor */}
      <CosmicRayMonitor />

      {/* Greenland Ice Tracker */}
      <GreenlandIceTracker />

      {/* Radiation Exposure Monitor */}
      <RadiationExposureMonitor />

      {/* Peat Fire Tracker */}
      <PeatFireTracker />

      {/* Sea Level Rise Projector */}
      <SeaLevelRiseProjector />

      {/* Thermocline Mapper */}
      <ThermoclineMapper />

      {/* Acid Rain Tracker */}
      <AcidRainTracker />

      {/* Methane Hydrate Monitor */}
      <MethaneHydrateMonitor />

      {/* Kelp Forest Monitor */}
      <KelpForestMonitor />

      {/* Glacier Lake Outburst Tracker */}
      <GlacierLakeOutburstTracker />

      {/* Dust Storm Tracker */}
      <DustStormTracker />

      {/* Bioluminescence Tracker */}
      <BioluminescenceTracker />

      {/* Urban Sprawl Monitor */}
      <UrbanSprawlMonitor />

      {/* Viral Outbreak Mapper */}
      <ViralOutbreakMapper />

      {/* Magnetosphere Monitor */}
      <MagnetosphereMonitor />

      {/* Fog Density Mapper */}
      <FogDensityMapper />

      {/* Carbon Capture Tracker */}
      <CarbonCaptureTracker />

      {/* Hail Storm Tracker */}
      <HailStormTracker />

      {/* Sahara Reforestation Tracker */}
      <SaharaReforestationTracker />

      {/* Deep Sea Vent Monitor */}
      <DeepSeaVentMonitor />

      {/* Storm Surge Predictor */}
      <StormSurgePredictor />

      {/* Landfill Monitor */}
      <LandfillMonitor />

      {/* Salinity Gradient Mapper */}
      <SalinityGradientMapper />

      {/* Microplastics Tracker */}
      <MicroplasticsTracker />

      {/* Radio Signal Mapper */}
      <RadioSignalMapper />

      {/* Volcanic Island Monitor */}
      <VolcanicIslandMonitor />

      {/* Permafrost Thaw Monitor */}
      <PermafrostThawMonitor />

      {/* Ocean Current Tracker */}
      <OceanCurrentTrackerPanel />

      {/* Space Weather Alert */}
      <SpaceWeatherAlertPanel />

      {/* Desert Monitor */}
      <DesertMonitorPanel />

      {/* Tsunami Buoy Tracker */}
      <TsunamiBuoyTracker />

      {/* Glacier Velocity Tracker */}
      <GlacierVelocityTracker />

      {/* Earthquake Swarm Monitor */}
      <EarthquakeSwarmMonitor />

      {/* Mangrove Restoration Tracker */}
      <MangroveRestorationTracker />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t py-1 px-2 sm:px-3 md:px-4 safe-area-bottom before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-[11px] text-muted-foreground/70">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 text-white" />
            </div>
            <span className="font-medium hidden sm:inline">MapLibre Explorer</span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="hidden md:inline">MapTiler · OpenStreetMap · Open-Meteo</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <a
              href="https://maplibre.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hidden sm:inline"
            >
              maplibre.org
            </a>
            <span className="text-border hidden sm:inline">|</span>
            <a
              href="https://github.com/maplibre/maplibre-native"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hidden md:inline"
            >
              GitHub
            </a>
            <span className="text-border hidden md:inline">|</span>
            <span>© OpenStreetMap</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
