import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { undoManager } from '@/lib/undo-manager'

export interface SavedLocation {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  category: string
  color: string
  icon: string
  createdAt: string
  updatedAt: string
  photos?: string[]
}

export interface MapMarker {
  id: string
  longitude: number
  latitude: number
  name: string
  description?: string
  color: string
  category: string
  icon?: string
}

export interface MeasurePoint {
  longitude: number
  latitude: number
}

export interface RoutePoint {
  longitude: number
  latitude: number
  name?: string
}

export interface MapRoute {
  id: string
  name: string
  color: string
  points: RoutePoint[]
  distance: number | null
  duration: number | null
}

export type RouteProfile = 'driving' | 'cycling' | 'walking'

export interface RouteStep {
  maneuver: {
    type: string
    modifier?: string
    location: [number, number]
  }
  name: string
  distance: number // meters
  duration: number // seconds
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
}

export interface POIMarker {
  id: string
  longitude: number
  latitude: number
  name: string
  category: string
  icon: string
  distance: number | null
}

export interface BookmarkFolder {
  id: string
  name: string
  color: string
  emoji: string
  locationIds: string[]
}

export interface MapAnnotation {
  id: string
  longitude: number
  latitude: number
  text: string
  fontSize: number
  color: string
  rotation: number
  createdAt: string
}

export interface TrackPoint {
  latitude: number
  longitude: number
  elevation: number | null
  timestamp: number
  speed: number | null
  accuracy: number | null
}

export interface TrackRecording {
  id: string
  name: string
  color: string
  points: TrackPoint[]
  distance: number
  duration: number
  startedAt: string
  stoppedAt: string | null
}

export interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  color: string
  notifyOnEnter: boolean
  notifyOnExit: boolean
  isActive: boolean
  createdAt: string
}

// Map Collage types
export interface CollageTile {
  id: string
  dataUrl: string
  title: string
  style: string
}

export interface MapCollage {
  id: string
  name: string
  layout: string
  tiles: CollageTile[]
  bgColor: string
  spacing: number
  borderRadius: number
  title: string
  subtitle: string
}

// Nearby Events types
export interface NearbyEvent {
  id: string
  name: string
  venue: string
  category: string
  date: string
  description: string
  latitude: number
  longitude: number
  distance: number
}

export type MapStyleOption = {
  id: string
  name: string
  url: string
  fallbackUrl?: string
  category: 'standard' | 'dark' | 'satellite' | 'terrain' | 'custom'
  preview: { gradient: string; emoji: string }
  provider: 'maptiler' | 'carto' | 'osm'
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || ''

function maptilerUrl(styleId: string): string {
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${MAPTILER_KEY}`
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: maptilerUrl('streets-v2'),
    fallbackUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    category: 'standard',
    preview: { gradient: 'from-emerald-400 to-cyan-400', emoji: '🏙️' },
    provider: 'maptiler',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: maptilerUrl('satellite'),
    category: 'satellite',
    preview: { gradient: 'from-green-800 to-teal-900', emoji: '🛰️' },
    provider: 'maptiler',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    url: maptilerUrl('hybrid'),
    category: 'satellite',
    preview: { gradient: 'from-teal-600 to-emerald-800', emoji: '🌐' },
    provider: 'maptiler',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: maptilerUrl('terrain'),
    fallbackUrl: 'https://tiles.openfreemap.org/styles/liberty',
    category: 'terrain',
    preview: { gradient: 'from-amber-500 to-orange-600', emoji: '⛰️' },
    provider: 'maptiler',
  },
  {
    id: 'topo',
    name: 'Topographic',
    url: maptilerUrl('topo-v2'),
    fallbackUrl: 'https://tiles.openfreemap.org/styles/liberty',
    category: 'terrain',
    preview: { gradient: 'from-yellow-500 to-amber-600', emoji: '🗺️' },
    provider: 'maptiler',
  },
  {
    id: 'dark',
    name: 'Dark',
    url: maptilerUrl('dark'),
    fallbackUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    category: 'dark',
    preview: { gradient: 'from-gray-700 to-gray-900', emoji: '🌙' },
    provider: 'maptiler',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    url: maptilerUrl('outdoor-v2'),
    fallbackUrl: 'https://tiles.openfreemap.org/styles/liberty',
    category: 'terrain',
    preview: { gradient: 'from-lime-500 to-green-600', emoji: '🏕️' },
    provider: 'maptiler',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    category: 'standard',
    preview: { gradient: 'from-green-400 to-emerald-400', emoji: '🌍' },
    provider: 'osm',
  },
]

/** Get the effective URL for a style (uses fallback if MapTiler key is not available) */
export function getStyleUrl(style: MapStyleOption): string {
  if (!MAPTILER_KEY && style.provider === 'maptiler' && style.fallbackUrl) {
    return style.fallbackUrl
  }
  return style.url
}

/** Get a lightweight minimap style URL based on current theme */
export function getMinimapStyleUrl(isDark: boolean): string {
  return isDark
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
}

export interface MapDrawing {
  id: string
  points: number[][]
  color: string
  width: number
  name: string
}

export interface MarkerIconPreset {
  id: string
  name: string
  icon: string
  color: string
}

export const MARKER_ICON_PRESETS: MarkerIconPreset[] = [
  { id: 'map-pin', name: 'Map Pin', icon: 'MapPin', color: '#ef4444' },
  { id: 'star', name: 'Star', icon: 'Star', color: '#f59e0b' },
  { id: 'heart', name: 'Heart', icon: 'Heart', color: '#ec4899' },
  { id: 'flag', name: 'Flag', icon: 'Flag', color: '#3b82f6' },
  { id: 'home', name: 'Home', icon: 'Home', color: '#22c55e' },
  { id: 'camera', name: 'Camera', icon: 'Camera', color: '#8b5cf6' },
  { id: 'coffee', name: 'Coffee', icon: 'Coffee', color: '#f59e0b' },
  { id: 'music', name: 'Music', icon: 'Music', color: '#6366f1' },
]

export interface SelectedBuilding {
  id: string
  name: string
  height: number
  coordinates: [number, number]
  type: string
  levels: number
}

export interface MapSnapshot {
  id: string
  name: string
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
  style: string
  markers: MapMarker[]
  timestamp: number
  thumbnail?: string
}

export type ToolMode = 'navigate' | 'mark' | 'measure' | 'directions' | 'draw' | 'area' | 'annotate' | 'notes'

// Trip Planner types
export interface TripStop {
  id: string
  name: string
  latitude: number
  longitude: number
  arrivalTime: string | null // HH:mm format
  departureTime: string | null // HH:mm format
  notes: string
  order: number
}

export interface TripDay {
  id: string
  date: string // YYYY-MM-DD
  stops: TripStop[]
}

export interface TripPlan {
  id: string
  name: string
  days: TripDay[]
  createdAt: string
}

// GPS Simulation types
export interface GPSSimulationState {
  isPlaying: boolean
  speedMultiplier: number // 1, 2, 5, 10
  progress: number // 0-1
  currentPosition: { longitude: number; latitude: number; heading: number } | null
  distanceRemaining: number
  eta: number // seconds
  routeId: string | null
}

// Map Notes types
export type NotePriority = 'low' | 'medium' | 'high'

export interface MapNote {
  id: string
  title: string
  content: string
  latitude: number
  longitude: number
  color: string
  icon: string
  priority: NotePriority
  createdAt: string
  updatedAt: string
}

// Batch Operations types
export interface BatchOperationState {
  isSelectMode: boolean
  selectedMarkerIds: string[]
}

// Marker Category types
export interface MarkerCategory {
  id: string
  name: string
  emoji: string
  color: string
  icon: string // lucide icon name
  isDefault: boolean
}

// Map Styles Mixer types
export interface StyleMixLayer {
  id: string
  sourceStyle: string // style ID to take layer from
  layerId: string // the specific layer ID from that style
  opacity: number
  visible: boolean
}

// POI Filter types
export interface POIFilters {
  categories: string[]
  radiusKm: number
  openNowOnly: boolean
  keyword: string
  minRating: number
}

export interface POIFilterPreset {
  id: string
  name: string
  filters: POIFilters
}

export type AppLanguage = 'en' | 'sl' | 'de' | 'hr' | 'it' | 'fr' | 'es'

export interface AppNotification {
  id: string
  type: 'geofence' | 'track' | 'weather' | 'location' | 'general'
  message: string
  timestamp: number
  read: boolean
  icon?: string
}

export interface CustomTileSource {
  id: string
  name: string
  url: string
  type: 'raster' | 'vector'
  attribution?: string
  minZoom?: number
  maxZoom?: number
  visible: boolean
}

export interface ImageOverlay {
  id: string
  name: string
  url: string
  bounds: [[number, number], [number, number]] // [[swLng, swLat], [neLng, neLat]]
  opacity: number
  visible: boolean
}

// Map Label types
export interface MapLabel {
  id: string
  text: string
  longitude: number
  latitude: number
  fontSize: number
  color: string
  bold: boolean
  italic: boolean
  bgColor: string
  bgOpacity: number
}

// Contour / Isoline types
export interface ContourLine {
  elevation: number
  coordinates: [number, number][]
}

export interface ContourData {
  center: [number, number]
  lines: ContourLine[]
  visible: boolean
}

// Terrain Profile 3D types
export interface TerrainProfile3DState {
  waterLevel: number // meters above sea level
  rotationX: number
  rotationY: number
  zoom: number
}

// Pedometer types
export interface PedometerState {
  isTracking: boolean
  steps: number
  distance: number // meters
  startTime: number | null
  lastPosition: [number, number] | null
  dailyGoal: number // steps
  distanceGoal: number // meters
  history: { date: string; steps: number; distance: number }[]
}

// Usage Stats types
export interface UsageStats {
  sessionCount: number
  totalSessionTime: number // ms
  totalSearches: number
  totalLocationsAdded: number
  totalRoutesCreated: number
  totalMeasurements: number
  totalScreenshots: number
  totalStyleSwitches: number
  searchTerms: Record<string, number>
  dailyUsage: Record<string, number> // date -> minutes
  toolUsage: Record<string, number>
  achievementsUnlocked: string[]
}

// Data Import/Export types
export interface ImportExportState {
  lastImportAt: string | null
  lastExportAt: string | null
  importCount: number
  exportCount: number
}

// Chat Assistant types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  actions?: { label: string; command: string }[]
}

// POI Density Heatmap types
export interface POIHeatmapState {
  enabled: boolean
  radius: number
  intensity: number
  colorScheme: 'thermal' | 'ocean' | 'forest' | 'purple'
  categoryFilter: string | null
}

export interface WMSTileSource {
  id: string
  name: string
  url: string
  serviceType: 'wms' | 'wmts' | 'tms'
  layerName: string
  opacity: number
  format: string
  tileSize: number
  customParams: Record<string, string>
  isVisible: boolean
}

export interface SpatialAnalysisResult {
  id: string
  type: 'buffer' | 'intersection' | 'area' | 'centroid' | 'distance-from-line'
  label: string
  value: string
  geometry?: GeoJSON.Geometry
  color: string
}

export interface Geolocation {
  longitude: number
  latitude: number
  accuracy: number
}

export interface LayerVisibility {
  water: boolean
  roads: boolean
  buildings: boolean
  parks: boolean
  labels: boolean
}

export interface MapNotification {
  id: string
  type: 'style' | 'location' | 'route' | 'drawing' | 'measurement' | 'weather' | 'terrain' | 'general'
  icon: string
  message: string
  timestamp: number
}

const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  water: true,
  roads: true,
  buildings: true,
  parks: true,
  labels: true,
}

// Multi-Stop Route Planner types
export interface MultiStop {
  id: string
  name: string
  longitude: number
  latitude: number
  type: 'start' | 'waypoint' | 'end' | 'fuel' | 'food' | 'rest' | 'scenic'
  duration: number // minutes to spend
}

export interface MultiStopRoute {
  id: string
  name: string
  stops: MultiStop[]
  mode: 'driving' | 'cycling' | 'walking'
  optimized: boolean
}

// Enhanced Weather Dashboard types
export interface WeatherData {
  temperature: number | null
  feelsLike: number | null
  humidity: number | null
  windSpeed: number | null
  windDirection: number | null
  pressure: number | null
  uvIndex: number | null
  visibility: number | null
  cloudCover: number | null
  precipitation: number | null
  weatherCode: number | null
  lastUpdated: number | null
}

// Map Animation Studio types
export interface AnimationKeyframe {
  id: string
  longitude: number
  latitude: number
  zoom: number
  bearing: number
  pitch: number
  duration: number // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'fly'
  label: string
}

export interface MapAnimation {
  id: string
  name: string
  keyframes: AnimationKeyframe[]
  loop: boolean
  speed: number // 0.5x to 3x
}

export interface AnimationStudioState {
  animations: MapAnimation[]
  activeAnimationId: string | null
  isPlaying: boolean
  currentKeyframeIndex: number
  playbackSpeed: number
}

// Smart Route Planner types
export interface SmartRoutePreferences {
  mode: 'scenic' | 'fastest' | 'safest' | 'eco' | 'balanced'
  avoidHighways: boolean
  avoidTolls: boolean
  avoidFerries: boolean
  preferBikeLanes: boolean
  maxIncline: number // percent
  minScenicScore: number // 1-10
  departureTime: string
  arrivalTime: string
}

export interface SmartRouteState {
  preferences: SmartRoutePreferences
  routeOptions: Array<{
    id: string
    name: string
    distance: number
    duration: number
    scenicScore: number
    safetyScore: number
    ecoScore: number
    color: string
  }>
  selectedRouteId: string | null
  open: boolean
}

// Map Data Visualizer types
export interface DataVisualization {
  id: string
  name: string
  type: 'choropleth' | 'proportional' | 'heatmap' | 'graduated' | 'categorical'
  dataSource: string
  field: string
  colorRamp: string[]
  classBreaks: number[]
  visible: boolean
  opacity: number
}

export interface DataVisualizerState {
  visualizations: DataVisualization[]
  activeVizId: string | null
  open: boolean
  importFormat: 'geojson' | 'csv' | 'kml'
  importedData: Record<string, unknown> | null
}

// Field Survey Tool types
export interface SurveyField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'photo' | 'date' | 'rating'
  options?: string[]
  required: boolean
  defaultValue: string
}

export interface SurveyForm {
  id: string
  name: string
  description: string
  fields: SurveyField[]
  color: string
  icon: string
}

export interface SurveyResponse {
  id: string
  formId: string
  latitude: number
  longitude: number
  values: Record<string, string>
  timestamp: number
}

export interface FieldSurveyState {
  forms: SurveyForm[]
  responses: SurveyResponse[]
  activeFormId: string | null
  open: boolean
  collectMode: boolean
}

// Emergency Route Planner types
export interface EmergencyZone {
  id: string
  name: string
  type: 'fire' | 'flood' | 'earthquake' | 'chemical' | 'storm' | 'general'
  latitude: number
  longitude: number
  radius: number // meters
  severity: 'low' | 'medium' | 'high' | 'critical'
  color: string
}

export interface EvacuationPoint {
  id: string
  name: string
  latitude: number
  longitude: number
  capacity: number
  type: 'shelter' | 'hospital' | 'assembly' | 'staging'
}

export interface EmergencyRouteState {
  zones: EmergencyZone[]
  evacuationPoints: EvacuationPoint[]
  activeRouteId: string | null
  open: boolean
  showZones: boolean
  showEvacuationPoints: boolean
}

// Map Comparison Slider types
export interface ComparisonSliderState {
  enabled: boolean
  leftStyle: string
  rightStyle: string
  position: number // 0-100 percentage
  orientation: 'horizontal' | 'vertical'
  lockedZoom: boolean
  lockedCenter: boolean
  leftTimestamp: number | null
  rightTimestamp: number | null
}

// Noise Heatmap Overlay types
export interface NoiseHeatmapState {
  enabled: boolean
  opacity: number
  showLabels: boolean
  dataSource: 'estimated' | 'measured'
  colorScheme: 'traffic' | 'industrial' | 'ambient'
  threshold: number // dB level
}

// Solar Exposure Analyzer types
export interface SolarData {
  latitude: number
  longitude: number
  date: string
  sunrise: string
  sunset: string
  solarNoon: string
  dayLength: number // hours
  maxElevation: number // degrees
  totalRadiation: number // kWh/m2
  monthlyAverages: number[] // 12 months
  shadowLengths: Array<{ hour: number; length: number; direction: number }>
}

export interface SolarExposureState {
  open: boolean
  analyzerPoint: { latitude: number; longitude: number } | null
  data: SolarData | null
  date: string
  buildingHeight: number
  showShadowPath: boolean
  showRadiationMap: boolean
}

// Map Style Forge types
export interface StyleLayer {
  id: string
  type: 'background' | 'fill' | 'line' | 'symbol' | 'raster' | 'circle' | 'fill-extrusion' | 'heatmap'
  source: string
  paint: Record<string, unknown>
  layout: Record<string, unknown>
  visible: boolean
  opacity: number
}

export interface StyleForgeState {
  customLayers: StyleLayer[]
  activeLayerId: string | null
  baseStyle: string
  open: boolean
  exportFormat: 'maplibre-style' | 'tilejson' | 'pmtiles'
}

// Topographic Profiler types
export interface TopoProfilePoint {
  distance: number
  elevation: number
  lat: number
  lng: number
}

export interface TopoProfilerState {
  profilePoints: TopoProfilePoint[]
  isDrawing: boolean
  showGrid: boolean
  showLabels: boolean
  verticalExaggeration: number
  open: boolean
  totalDistance: number
  totalAscent: number
  totalDescent: number
  maxElevation: number
  minElevation: number
}

// Maritime Navigation types
export interface MaritimeWaypoint {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'port' | 'anchorage' | 'lighthouse' | 'buoy' | 'danger' | 'waypoint'
  depth: number | null
  notes: string
}

export interface MaritimeRoute {
  id: string
  name: string
  waypoints: MaritimeWaypoint[]
  totalDistance: number
  estimatedTime: number
}

export interface MaritimeNavState {
  waypoints: MaritimeWaypoint[]
  routes: MaritimeRoute[]
  activeRouteId: string | null
  showDepthContours: boolean
  showNavigationAids: boolean
  showShippingLanes: boolean
  depthUnit: 'meters' | 'feet' | 'fathoms'
  open: boolean
}

// Geocaching Toolkit types
export interface Geocache {
  id: string
  name: string
  code: string
  latitude: number
  longitude: number
  type: 'traditional' | 'multi' | 'mystery' | 'earthcache' | 'letterbox' | 'event'
  difficulty: number // 1-5
  terrain: number // 1-5
  size: 'micro' | 'small' | 'regular' | 'large' | 'other'
  status: 'active' | 'found' | 'dnf' | 'archived'
  hint: string
  description: string
  foundDate: string | null
}

export interface GeocachingState {
  caches: Geocache[]
  activeCacheId: string | null
  showCaches: boolean
  filterType: string[]
  filterDifficulty: [number, number]
  filterTerrain: [number, number]
  open: boolean
  foundCount: number
  totalSearched: number
}

// Atmospheric Dashboard types
export interface AtmosphericData {
  temperature: number | null
  humidity: number | null
  pressure: number | null
  windSpeed: number | null
  windDirection: number | null
  windGust: number | null
  visibility: number | null
  cloudCover: number | null
  precipitation: number | null
  dewPoint: number | null
  frostPoint: number | null
  heatIndex: number | null
  windChill: number | null
  uvIndex: number | null
  airDensity: number | null
  lastUpdated: number | null
}

export interface AtmosphericState {
  data: AtmosphericData
  open: boolean
  showWindBarb: boolean
  showPressureIsobars: boolean
  showCloudCover: boolean
  showTemperatureGradient: boolean
  unitSystem: 'metric' | 'imperial'
  historyData: Array<{ time: number; temperature: number | null; humidity: number | null; pressure: number | null }>
}

// Wildlife Tracker types
export interface WildlifeObservation {
  id: string
  species: string
  commonName: string
  latitude: number
  longitude: number
  count: number
  date: string
  time: string
  habitat: string
  behavior: string
  notes: string
  photo: string | null
}

export interface WildlifeTrackerState {
  observations: WildlifeObservation[]
  activeObservationId: string | null
  showObservations: boolean
  showHeatmap: boolean
  showMigrationPaths: boolean
  filterSpecies: string[]
  open: boolean
  totalSpecies: number
  totalObservations: number
}

// Cultural Heritage Map types
export interface HeritageSite {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'unesco' | 'national' | 'local' | 'archaeological' | 'monument' | 'museum' | 'religious'
  era: string
  description: string
  protectionLevel: 'high' | 'medium' | 'low'
  visitInfo: string
  rating: number
  photos: string[]
}

export interface CulturalHeritageState {
  sites: HeritageSite[]
  activeSiteId: string | null
  showSites: boolean
  filterType: string[]
  filterEra: string[]
  open: boolean
  showProtectionZones: boolean
}

// Hydrology Analyzer types
export interface HydrologyPoint {
  id: string
  latitude: number
  longitude: number
  type: 'spring' | 'well' | 'river' | 'lake' | 'dam' | 'gauge' | 'outlet'
  name: string
  flowRate: number | null
  waterLevel: number | null
  quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'bad'
  lastReading: string | null
}

export interface WatershedData {
  area: number
  perimeter: number
  outletPoint: { latitude: number; longitude: number } | null
  flowDirection: number[][] // grid of flow directions
  accumulation: number[][] // flow accumulation grid
}

export interface HydrologyState {
  points: HydrologyPoint[]
  watershed: WatershedData | null
  activePointId: string | null
  showFlowPaths: boolean
  showWatersheds: boolean
  showWaterBodies: boolean
  showQualityOverlay: boolean
  open: boolean
  analysisMode: 'flow' | 'watershed' | 'quality' | 'flood'
}


// Glacier Monitor types
export interface GlacierData {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number // km2
  length: number // km
  elevation: number // meters
  massBalance: number // meters water equivalent per year
  velocity: number // meters per year
  retreatRate: number // meters per year
  type: 'valley' | 'icecap' | 'piedmont' | 'cirque' | 'tidewater'
  status: 'advancing' | 'stable' | 'retreating' | 'surging'
  lastSurvey: string
}

export interface GlacierMonitorState {
  glaciers: GlacierData[]
  activeGlacierId: string | null
  showGlaciers: boolean
  showRetreatOverlay: boolean
  showMassBalance: boolean
  showVelocityVectors: boolean
  filterType: string[]
  filterStatus: string[]
  open: boolean
  timelineYear: number
  comparisonMode: boolean
}

// Seismic Activity types
export interface SeismicEvent {
  id: string
  latitude: number
  longitude: number
  magnitude: number
  depth: number // km
  time: string
  location: string
  type: 'earthquake' | 'explosion' | 'quarry' | 'volcanic'
  felt: boolean
  tsunami: boolean
  significance: number // 0-1000
}

export interface SeismicActivityState {
  events: SeismicEvent[]
  activeEventId: string | null
  showEvents: boolean
  showShakeMap: boolean
  showFaultLines: boolean
  showPlateBoundaries: boolean
  filterMinMagnitude: number
  filterTimeRange: 'hour' | 'day' | 'week' | 'month' | 'year'
  filterType: string[]
  open: boolean
  autoRefresh: boolean
  lastFetchTime: number | null
}

// Soil Analysis types
export interface SoilSample {
  id: string
  latitude: number
  longitude: number
  soilType: 'clay' | 'sand' | 'silt' | 'loam' | 'peat' | 'chalk' | 'gravel'
  ph: number
  moisture: number // percentage
  organicMatter: number // percentage
  nitrogen: number // mg/kg
  phosphorus: number // mg/kg
  potassium: number // mg/kg
  erosionRisk: 'none' | 'low' | 'medium' | 'high' | 'severe'
  agriculturalSuitability: 'excellent' | 'good' | 'moderate' | 'poor' | 'unsuitable'
  depth: number // cm
  color: string
  lastTested: string
}

export interface SoilAnalysisState {
  samples: SoilSample[]
  activeSampleId: string | null
  showSamples: boolean
  showTypeOverlay: boolean
  showMoistureOverlay: boolean
  showPHOverlay: boolean
  showErosionRisk: boolean
  showAgricultureSuitability: boolean
  open: boolean
  analysisMode: 'type' | 'moisture' | 'ph' | 'nutrients' | 'erosion'
}

// Urban Growth types
export interface UrbanArea {
  id: string
  name: string
  latitude: number
  longitude: number
  currentArea: number // km2
  population: number
  density: number // per km2
  growthRate: number // percentage per year
  yearEstablished: number
  historicalBoundaries: Array<{ year: number; area: number; boundary: [number, number][] }>
  landUseBreakdown: { residential: number; commercial: number; industrial: number; green: number; other: number }
  prediction2030: number
  prediction2050: number
}

export interface UrbanGrowthState {
  areas: UrbanArea[]
  activeAreaId: string | null
  showAreas: boolean
  showHistoricalBoundaries: boolean
  showPredictions: boolean
  showDensityHeatmap: boolean
  showLandUse: boolean
  timelineYear: number
  open: boolean
  comparisonMode: boolean
  animationSpeed: number
}

// Airspace Navigation types
export interface AirspaceZone {
  id: string
  name: string
  type: 'classA' | 'classB' | 'classC' | 'classD' | 'classE' | 'classG' | 'restricted' | 'prohibited' | 'military' | 'tma' | 'ctr'
  ceiling: number // feet
  floor: number // feet
  coordinates: [number, number][]
  activeTimes: string
  controllingAuthority: string
  frequency: string | null
}

export interface AirportData {
  id: string
  icao: string
  name: string
  latitude: number
  longitude: number
  elevation: number
  runways: Array<{ name: string; length: number; surface: string; heading: number }>
  frequencies: Array<{ type: string; freq: string }>
  type: 'international' | 'regional' | 'private' | 'military' | 'heliport'
}

export interface AirspaceNavState {
  airspaces: AirspaceZone[]
  airports: AirportData[]
  activeAirspaceId: string | null
  showAirspaces: boolean
  showAirports: boolean
  showFlightPaths: boolean
  showSIDs: boolean // Standard Instrument Departures
  showSTARs: boolean // Standard Terminal Arrival Routes
  altitudeFilter: [number, number] // feet range
  open: boolean
  flightPlan: Array<{ lat: number; lng: number; alt: number; speed: number }> | null
}

// Reef Health Monitor types
export interface ReefSite {
  id: string
  name: string
  latitude: number
  longitude: number
  healthIndex: number // 0-100
  bleachingLevel: 'none' | 'low' | 'moderate' | 'severe' | 'extreme'
  waterTemp: number // Celsius
  salinity: number // PSU
  turbidity: number // NTU
  dissolvedOxygen: number // mg/L
  coralCover: number // percentage
  fishSpecies: number
  lastSurvey: string
  depth: number // meters
  type: 'fringing' | 'barrier' | 'atoll' | 'patch' | 'deep'
}

export interface ReefHealthState {
  sites: ReefSite[]
  activeSiteId: string | null
  showSites: boolean
  showHealthOverlay: boolean
  showBleachingAlert: boolean
  showTemperature: boolean
  showWaterQuality: boolean
  filterType: string[]
  filterBleaching: string[]
  open: boolean
  timelineDate: string
}

// Magnetic Field types
export interface MagneticStation {
  id: string
  name: string
  latitude: number
  longitude: number
  declination: number // degrees
  inclination: number // degrees
  totalField: number // nanoTesla
  horizontalField: number
  verticalField: number
  annualChange: number // arc-minutes per year
  lastMeasurement: string
}

export interface MagneticFieldState {
  stations: MagneticStation[]
  activeStationId: string | null
  showStations: boolean
  showDeclinationLines: boolean
  showInclinationMap: boolean
  showFieldIntensity: boolean
  showAnomalies: boolean
  showGridLines: boolean
  open: boolean
  fieldComponent: 'declination' | 'inclination' | 'total' | 'horizontal' | 'vertical'
  modelYear: number
}

// Flood Risk types
export interface FloodZone {
  id: string
  name: string
  latitude: number
  longitude: number
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'very_high'
  floodDepth100yr: number // meters for 100-year flood
  floodDepth500yr: number // meters for 500-year flood
  area: number // km2
  population: number
  infrastructure: number // count of critical infrastructure
  elevation: number // meters
  drainageClass: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor'
  historicalFloods: Array<{ year: number; depth: number; duration: number }>
  coordinates: [number, number][]
}

export interface FloodRiskState {
  zones: FloodZone[]
  activeZoneId: string | null
  showZones: boolean
  showRiskOverlay: boolean
  showDepthOverlay: boolean
  showDrainageMap: boolean
  showHistoricalFloods: boolean
  showEvacuationRoutes: boolean
  open: boolean
  scenarioYear: 100 | 500
  animationPlaying: boolean
}

// Volcano Monitor types
export interface VolcanoData {
  id: string
  name: string
  latitude: number
  longitude: number
  elevation: number // meters
  type: 'stratovolcano' | 'shield' | 'caldera' | 'cinder_cone' | 'fissure' | 'submarine' | 'lava_dome'
  status: 'extinct' | 'dormant' | 'active' | 'erupting'
  lastEruption: string
  vei: number // Volcanic Explosivity Index 0-8
  alertLevel: 'normal' | 'advisory' | 'watch' | 'warning'
  seismicActivity: number // events per day
  gasEmission: number // tonnes/day SO2
  deformation: number // mm/year
  population5km: number
  population10km: number
  country: string
}

export interface VolcanoMonitorState {
  volcanoes: VolcanoData[]
  activeVolcanoId: string | null
  showVolcanoes: boolean
  showAlertZones: boolean
  showSeismicOverlay: boolean
  showGasPlumes: boolean
  showDeformation: boolean
  filterType: string[]
  filterStatus: string[]
  filterAlertLevel: string[]
  open: boolean
  autoRefresh: boolean
  lastFetchTime: number | null
}

// Avalanche Risk types
export interface AvalancheZone {
  id: string
  name: string
  latitude: number
  longitude: number
  riskLevel: 'low' | 'moderate' | 'considerable' | 'high' | 'extreme'
  elevation: number
  aspect: string // N, NE, E, SE, S, SW, W, NW
  slopeAngle: number
  snowDepth: number // cm
  snowStability: 'good' | 'fair' | 'poor' | 'very_poor'
  recentAvalanches: number
  temperature: number
  windSpeed: number
  windDirection: number
  lastAssessment: string
  coordinates: [number, number][]
}

export interface AvalancheRiskState {
  zones: AvalancheZone[]
  activeZoneId: string | null
  showZones: boolean
  showRiskOverlay: boolean
  showAspectMap: boolean
  showSlopeAngles: boolean
  showWindRose: boolean
  open: boolean
  forecastDate: string
  comparisonMode: boolean
}

// Crop Health Analyzer types
export interface CropField {
  id: string
  name: string
  latitude: number
  longitude: number
  cropType: 'wheat' | 'corn' | 'rice' | 'soybean' | 'cotton' | 'barley' | 'sugarcane' | 'potato' | 'tomato' | 'grape'
  area: number // hectares
  healthIndex: number // 0-100
  ndvi: number // -1 to 1
  growthStage: 'emergence' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvest' | 'dormant'
  moistureStress: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  pestRisk: 'none' | 'low' | 'moderate' | 'high'
  diseaseRisk: 'none' | 'low' | 'moderate' | 'high'
  yieldPrediction: number // tonnes/hectare
  plantingDate: string
  harvestDate: string
  lastSatellitePass: string
}

export interface CropHealthState {
  fields: CropField[]
  activeFieldId: string | null
  showFields: boolean
  showHealthOverlay: boolean
  showNDVI: boolean
  showMoistureStress: boolean
  showYieldPrediction: boolean
  filterCropType: string[]
  filterGrowthStage: string[]
  open: boolean
  timelineDate: string
  comparisonMode: boolean
}

// Space Track Viewer types
export interface SpaceObject {
  id: string
  name: string
  noradId: string
  type: 'satellite' | 'debris' | 'rocket_body' | 'space_station' | 'probe'
  latitude: number
  longitude: number
  altitude: number // km
  velocity: number // km/s
  inclination: number
  period: number // minutes
  launchDate: string
  country: string
  status: 'operational' | 'non_operational' | 'decaying'
  visibility: 'visible' | 'shadowed' | 'daylight'
}

export interface SpaceTrackState {
  objects: SpaceObject[]
  activeObjectId: string | null
  showObjects: boolean
  showOrbits: boolean
  showGroundTracks: boolean
  showFootprints: boolean
  showDebris: boolean
  filterType: string[]
  filterCountry: string[]
  altitudeRange: [number, number] // km
  open: boolean
  autoRefresh: boolean
  selectedPassTime: string | null
}

// Archaeology Map types
export interface ArchaeologicalSite {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'settlement' | 'burial' | 'temple' | 'fortification' | 'cave' | 'petroglyph' | 'megalith' | 'shipwreck' | 'industrial'
  period: string
  dating: string
  culture: string
  description: string
  preservation: 'excellent' | 'good' | 'fair' | 'poor' | 'endangered'
  excavationStatus: 'unexcavated' | 'partial' | 'ongoing' | 'completed'
  significance: 'local' | 'regional' | 'national' | 'international'
  area: number // hectares
  depth: number | null // meters
  artifacts: number
  unescoListed: boolean
  coordinates: [number, number][]
}

export interface ArchaeologyMapState {
  sites: ArchaeologicalSite[]
  activeSiteId: string | null
  showSites: boolean
  showPeriodOverlay: boolean
  showSignificance: boolean
  showExcavationStatus: boolean
  showProtectionZones: boolean
  filterType: string[]
  filterPeriod: string[]
  filterSignificance: string[]
  open: boolean
  timelinePeriod: string
}

// Pollution Tracker types
export interface PollutionSource {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'industrial' | 'vehicle' | 'agricultural' | 'residential' | 'natural' | 'maritime' | 'energy'
  pollutants: string[]
  aqi: number // 0-500
  aqiLevel: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  pm25: number // μg/m3
  pm10: number
  no2: number
  so2: number
  co: number
  o3: number
  emissionRate: number // tonnes/year
  radius: number // meters - affected area
  lastReading: string
  trend: 'improving' | 'stable' | 'worsening'
}

export interface PollutionTrackerState {
  sources: PollutionSource[]
  activeSourceId: string | null
  showSources: boolean
  showAQIOverlay: boolean
  showPM25: boolean
  showDispersion: boolean
  showTrends: boolean
  filterType: string[]
  filterAQILevel: string[]
  open: boolean
  autoRefresh: boolean
  timelineDate: string
}

// Tidal Predictor types
export interface TidalStation {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'primary' | 'secondary' | 'harmonic'
  currentHeight: number // meters
  nextHigh: string
  nextLow: string
  tidalRange: number
  springRange: number
  neapRange: number
  harmonicConstants: Array<{ constituent: string; amplitude: number; phase: number }>
  maxCurrent: number // knots
  currentDirection: number
  moonPhase: string
  sunrise: string
  sunset: string
}

export interface TidalPredictorState {
  stations: TidalStation[]
  activeStationId: string | null
  showStations: boolean
  showCurrentHeight: boolean
  showTidalFlow: boolean
  showMoonPhase: boolean
  showCurrentVectors: boolean
  open: boolean
  predictionDate: string
  predictionHours: number
}

// Wind Farm Optimizer types
export interface WindTurbine {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'onshore' | 'offshore'
  capacity: number // MW
  hubHeight: number // meters
  rotorDiameter: number // meters
  windSpeed: number // m/s
  windDirection: number
  powerOutput: number // MW
  capacityFactor: number // percentage
  availability: number // percentage
  wakeLoss: number // percentage
  status: 'operational' | 'maintenance' | 'faulted' | 'curtailed'
  commissioning: string
}

export interface WindFarmState {
  turbines: WindTurbine[]
  activeTurbineId: string | null
  showTurbines: boolean
  showWindRose: boolean
  showWakeEffects: boolean
  showPowerOutput: boolean
  showOptimization: boolean
  open: boolean
  windScenario: 'current' | 'optimal' | 'conservative'
  optimizationTarget: 'power' | 'cost' | 'lifetime'
}

export interface DesertificationState {
  zones: DesertZone[]
  activeZoneId: string | null
  showDesertExpansion: boolean
  showVegetationLoss: boolean
  showSandDunes: boolean
  showDroughtIndex: boolean
  open: boolean
  timelineYear: number
  severityFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface DesertZone {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  severity: 'low' | 'moderate' | 'high' | 'extreme'
  expansionRate: number
  vegetationIndex: number
  droughtIndex: number
}

export interface MineralExplorationState {
  deposits: MineralDeposit[]
  activeDepositId: string | null
  showDeposits: boolean
  showGeologicalMap: boolean
  showMiningClaims: boolean
  showGeochemistry: boolean
  open: boolean
  mineralFilter: 'all' | 'gold' | 'copper' | 'iron' | 'rare_earth' | 'diamond'
  surveyMode: 'surface' | 'subsurface' | 'geochemical' | 'geophysical'
}

export interface MineralDeposit {
  id: string
  name: string
  latitude: number
  longitude: number
  mineralType: string
  estimatedTonnage: number
  grade: number
  depth: number
  status: 'prospect' | 'exploration' | 'development' | 'production'
}

export interface OceanCurrentState {
  currents: OceanCurrent[]
  activeCurrentId: string | null
  showCurrents: boolean
  showSST: boolean
  showThermohaline: boolean
  showSalinity: boolean
  open: boolean
  depthLayer: 'surface' | '100m' | '500m' | '1000m' | 'deep'
  season: 'winter' | 'spring' | 'summer' | 'autumn'
}

export interface OceanCurrent {
  id: string
  name: string
  coordinates: [number, number][]
  speed: number
  temperature: number
  direction: number
  type: 'warm' | 'cold' | 'mixed'
}

export interface PermafrostState {
  zones: PermafrostZone[]
  activeZoneId: string | null
  showPermafrostExtent: boolean
  showActiveLayer: boolean
  showThawRate: boolean
  showGroundIce: boolean
  open: boolean
  yearFilter: number
  temperatureScenario: 'rcp26' | 'rcp45' | 'rcp85'
}

export interface PermafrostZone {
  id: string
  name: string
  latitude: number
  longitude: number
  extent: number
  activeLayerDepth: number
  thawRate: number
  groundIceContent: number
  type: 'continuous' | 'discontinuous' | 'sporadic' | 'isolated'
}

export interface LightningState {
  strikes: LightningStrike[]
  showStrikes: boolean
  showDensityMap: boolean
  showStormTracks: boolean
  showAlertZones: boolean
  open: boolean
  timeRange: '1h' | '6h' | '24h' | '7d'
  intensityFilter: 'all' | 'cloud_to_ground' | 'cloud_to_cloud' | 'positive'
}

export interface LightningStrike {
  id: string
  latitude: number
  longitude: number
  timestamp: number
  intensity: number
  type: 'cloud_to_ground' | 'cloud_to_cloud' | 'positive'
  peakCurrent: number
}

export interface BiomeState {
  biomes: BiomeRegion[]
  activeBiomeId: string | null
  showBiomes: boolean
  showBiodiversity: boolean
  showTransitions: boolean
  showEndangered: boolean
  open: boolean
  classification: 'whittaker' | 'holdridge' | 'olson'
  focusRealm: 'all' | 'terrestrial' | 'aquatic' | 'transitional'
}

export interface BiomeRegion {
  id: string
  name: string
  latitude: number
  longitude: number
  type: string
  biodiversityIndex: number
  speciesCount: number
  endangeredSpecies: number
  area: number
}

export interface GroundwaterState {
  aquifers: Aquifer[]
  activeAquiferId: string | null
  showAquifers: boolean
  showWells: boolean
  showRechargeZones: boolean
  showFlowDirection: boolean
  open: boolean
  depthFilter: 'all' | 'shallow' | 'intermediate' | 'deep' | 'very_deep'
  qualityFilter: 'all' | 'excellent' | 'good' | 'moderate' | 'poor'
}

export interface Aquifer {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'unconfined' | 'confined' | 'semi_confined' | 'karst'
  depth: number
  waterLevel: number
  quality: 'excellent' | 'good' | 'moderate' | 'poor'
  rechargeRate: number
}

export interface SolarPowerState {
  sites: SolarSite[]
  activeSiteId: string | null
  showIrradiance: boolean
  showOptimalZones: boolean
  showExistingPlants: boolean
  showGridConnection: boolean
  open: boolean
  panelType: 'monocrystalline' | 'polycrystalline' | 'thin_film' | 'bifacial'
  calculationMode: 'annual' | 'monthly' | 'seasonal'
}

export interface SolarSite {
  id: string
  name: string
  latitude: number
  longitude: number
  irradiance: number
  sunshineHours: number
  optimalTilt: number
  estimatedYield: number
  area: number
}

export interface VolcanicAshState {
  eruptions: VolcanicEruption[]
  activeEruptionId: string | null
  showAshClouds: boolean
  showNoFlyZones: boolean
  showDispersionModel: boolean
  showHealthAdvisory: boolean
  open: boolean
  alertLevel: 'normal' | 'advisory' | 'watch' | 'warning'
  dispersionModel: 'vaac' | 'hysplit' | 'fall3d'
}

export interface VolcanicEruption {
  id: string
  volcanoName: string
  latitude: number
  longitude: number
  ashHeight: number
  vei: number
  startTime: string
  status: 'ongoing' | 'declining' | 'ended'
}

export interface CoastalErosionState {
  segments: CoastalSegment[]
  activeSegmentId: string | null
  showErosionZones: boolean
  showShorelineChange: boolean
  showSeaLevelRise: boolean
  showProtection: boolean
  open: boolean
  timeHorizon: 'current' | '2050' | '2100'
  scenario: 'rcp26' | 'rcp45' | 'rcp85'
}

export interface CoastalSegment {
  id: string
  name: string
  latitude: number
  longitude: number
  erosionRate: number
  seaLevelEffect: number
  vulnerability: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  protectionType: string
}

export interface CarbonFootprintState {
  sources: CarbonSource[]
  activeSourceId: string | null
  showEmissions: boolean
  showHeatmap: boolean
  showOffsetProjects: boolean
  showTrends: boolean
  open: boolean
  gasType: 'co2' | 'methane' | 'n2o' | 'all'
  sector: 'all' | 'energy' | 'transport' | 'industry' | 'agriculture'
}

export interface CarbonSource {
  id: string
  name: string
  latitude: number
  longitude: number
  emissions: number
  sector: string
  trend: 'increasing' | 'stable' | 'decreasing'
  offsetAvailable: boolean
}

export interface WildlifeMigrationState {
  routes: MigrationRoute[]
  activeRouteId: string | null
  showRoutes: boolean
  showCorridors: boolean
  showStopPoints: boolean
  showBarriers: boolean
  open: boolean
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  species: 'all' | 'birds' | 'mammals' | 'fish' | 'insects'
}

export interface MigrationRoute {
  id: string
  species: string
  name: string
  coordinates: [number, number][]
  distance: number
  duration: number
  status: 'active' | 'delayed' | 'blocked'
}

export interface IceSheetState {
  sheets: IceSheet[]
  activeSheetId: string | null
  showIceExtent: boolean
  showFlowVelocity: boolean
  showMeltRate: boolean
  showCalvingEvents: boolean
  open: boolean
  yearFilter: number
  scenario: 'historical' | 'rcp26' | 'rcp45' | 'rcp85'
}

export interface IceSheet {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  volume: number
  meltRate: number
  flowVelocity: number
  calvingRate: number
}

export interface DroughtMonitorState {
  regions: DroughtRegion[]
  activeRegionId: string | null
  showDroughtZones: boolean
  showSoilMoisture: boolean
  showPrecipitationDeficit: boolean
  showCropImpact: boolean
  open: boolean
  index: 'spi' | 'spei' | 'pdsi' | 'eddi'
  timeScale: '1m' | '3m' | '6m' | '12m' | '24m'
}

export interface DroughtRegion {
  id: string
  name: string
  latitude: number
  longitude: number
  droughtLevel: 'none' | 'd0' | 'd1' | 'd2' | 'd3' | 'd4'
  soilMoisture: number
  precipitationDeficit: number
  cropImpact: number
}

export interface LandSubsidenceState {
  zones: SubsidenceZone[]
  activeZoneId: string | null
  showSubsidence: boolean
  showGroundwaterDecline: boolean
  showInfrastructure: boolean
  showMonitoring: boolean
  open: boolean
  causeFilter: 'all' | 'groundwater' | 'mining' | 'oil_gas' | 'natural'
  rateFilter: 'all' | 'minor' | 'moderate' | 'severe' | 'extreme'
}

export interface SubsidenceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  subsidenceRate: number
  totalSubsidence: number
  cause: 'groundwater' | 'mining' | 'oil_gas' | 'natural'
  severity: 'minor' | 'moderate' | 'severe' | 'extreme'
}

export interface CoralBleachingState {
  sites: CoralSite[]
  activeSiteId: string | null
  showBleachingAlert: boolean
  showSSTAnomaly: boolean
  showReefExtent: boolean
  showRecovery: boolean
  open: boolean
  alertLevel: 'all' | 'watch' | 'warning' | 'alert_level_1' | 'alert_level_2'
  region: 'all' | 'pacific' | 'atlantic' | 'indian' | 'red_sea'
}

export interface CoralSite {
  id: string
  name: string
  latitude: number
  longitude: number
  bleachingLevel: 'none' | 'mild' | 'moderate' | 'severe' | 'extreme'
  sstAnomaly: number
  reefArea: number
  recoveryPotential: number
}

export interface TsunamiAlertState {
  alerts: TsunamiAlert[]
  activeAlertId: string | null
  showWavePropagation: boolean
  showEvacuationZones: boolean
  showBuoyData: boolean
  showHistoricalEvents: boolean
  open: boolean
  alertLevel: 'all' | 'information' | 'advisory' | 'watch' | 'warning'
  basin: 'all' | 'pacific' | 'atlantic' | 'indian' | 'mediterranean'
}

export interface TsunamiAlert {
  id: string
  sourceName: string
  latitude: number
  longitude: number
  magnitude: number
  waveHeight: number
  arrivalTime: string
  alertLevel: 'information' | 'advisory' | 'watch' | 'warning'
  status: 'active' | 'expired' | 'canceled'
}

export interface SoilErosionState {
  zones: SoilErosionZone[]
  activeZoneId: string | null
  showErosionRisk: boolean
  showSedimentYield: boolean
  showConservation: boolean
  showRainfallIntensity: boolean
  open: boolean
  erosionType: 'all' | 'water' | 'wind' | 'tillage'
  severityFilter: 'all' | 'low' | 'moderate' | 'high' | 'severe'
}

export interface SoilErosionZone {
  id: string
  name: string
  latitude: number
  longitude: number
  erosionRate: number
  sedimentYield: number
  type: 'water' | 'wind' | 'tillage'
  severity: 'low' | 'moderate' | 'high' | 'severe'
  conservationPractice: string
}

export interface WatershedManagerState {
  watersheds: Watershed[]
  activeWatershedId: string | null
  showBoundaries: boolean
  showFlowAccumulation: boolean
  showDrainageNetwork: boolean
  showWaterQuality: boolean
  open: boolean
  sizeFilter: 'all' | 'small' | 'medium' | 'large' | 'major'
  qualityFilter: 'all' | 'good' | 'moderate' | 'poor'
}

export interface Watershed {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  streamOrder: number
  discharge: number
  waterQuality: 'good' | 'moderate' | 'poor'
  landUse: string
}

export interface TectonicPlateState {
  plates: TectonicPlate[]
  activePlateId: string | null
  showPlateBoundaries: boolean
  showFaultLines: boolean
  showEpicenters: boolean
  showMovementVectors: boolean
  open: boolean
  boundaryType: 'all' | 'convergent' | 'divergent' | 'transform'
  timeRange: 'recent' | 'historical' | 'all'
}

export interface TectonicPlate {
  id: string
  name: string
  centerLat: number
  centerLng: number
  movementRate: number
  direction: number
  boundaryType: 'convergent' | 'divergent' | 'transform'
  earthquakeCount: number
}

export interface AirQualityForecasterState {
  stations: AQStation[]
  activeStationId: string | null
  showAQI: boolean
  showPM25: boolean
  showPM10: boolean
  showOzone: boolean
  open: boolean
  pollutant: 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2'
  forecast: 'current' | '24h' | '48h' | '7d'
}

export interface AQStation {
  id: string
  name: string
  latitude: number
  longitude: number
  aqi: number
  pm25: number
  pm10: number
  o3: number
  category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
}

export interface GlacialLakeState {
  lakes: GlacialLake[]
  activeLakeId: string | null
  showLakeExtent: boolean
  showGLOFRisk: boolean
  showDamType: boolean
  showMonitoring: boolean
  open: boolean
  riskLevel: 'all' | 'low' | 'medium' | 'high' | 'very_high'
  region: 'all' | 'himalaya' | 'andes' | 'alps' | 'rockies' | 'iceland'
}

export interface GlacialLake {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  depth: number
  damType: 'moraine' | 'ice' | 'bedrock'
  glofRisk: 'low' | 'medium' | 'high' | 'very_high'
  expansionRate: number
}

export interface SpaceWeatherState {
  events: SpaceWeatherEvent[]
  activeEventId: string | null
  showSolarWind: boolean
  showMagneticField: boolean
  showAuroraForecast: boolean
  showRadiationBelt: boolean
  open: boolean
  eventType: 'all' | 'cme' | 'flare' | 'geomagnetic_storm' | 'radiation'
  alertLevel: 'all' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme'
}

export interface SpaceWeatherEvent {
  id: string
  type: 'cme' | 'flare' | 'geomagnetic_storm' | 'radiation'
  startTime: string
  magnitude: number
  kpIndex: number
  alertLevel: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme'
  description: string
}

export interface PeatlandMonitorState {
  peatlands: Peatland[]
  activePeatlandId: string | null
  showPeatExtent: boolean
  showCarbonStock: boolean
  showDegradation: boolean
  showRestoration: boolean
  open: boolean
  statusFilter: 'all' | 'intact' | 'degraded' | 'restoring'
  depthFilter: 'all' | 'shallow' | 'medium' | 'deep'
}

export interface Peatland {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  carbonStock: number
  depth: number
  status: 'intact' | 'degraded' | 'restoring'
  waterTable: number
}

// Task 49: Mangrove Monitor
export interface MangroveForest {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  carbonSequestration: number
  species: string[]
  healthIndex: number
  restorationStatus: 'pristine' | 'degraded' | 'restoring' | 'lost'
  tidalRange: number
}

export interface MangroveMonitorState {
  mangroves: MangroveForest[]
  activeMangroveId: string | null
  showExtent: boolean
  showCarbon: boolean
  showRestoration: boolean
  showSpecies: boolean
  open: boolean
  healthFilter: 'all' | 'pristine' | 'degraded' | 'restoring' | 'lost'
}

// Task 49: Sandstorm Tracker
export interface SandstormEvent {
  id: string
  name: string
  latitude: number
  longitude: number
  intensity: 'minor' | 'moderate' | 'severe' | 'extreme'
  pm10: number
  pm25: number
  visibility: number
  windSpeed: number
  direction: number
  startTime: string
  affectedArea: number
}

export interface SandstormTrackerState {
  storms: SandstormEvent[]
  activeStormId: string | null
  showPlumes: boolean
  showPM: boolean
  showVisibility: boolean
  showWind: boolean
  open: boolean
  intensityFilter: 'all' | 'minor' | 'moderate' | 'severe' | 'extreme'
}

// Task 49: Wetland Mapper
export interface WetlandZone {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  type: 'marsh' | 'swamp' | 'bog' | 'fen' | 'estuary'
  waterLevel: number
  biodiversityIndex: number
  plantSpecies: number
  animalSpecies: number
  protectionStatus: 'protected' | 'unprotected' | 'partial'
}

export interface WetlandMapperState {
  wetlands: WetlandZone[]
  activeWetlandId: string | null
  showBoundaries: boolean
  showWaterLevel: boolean
  showBiodiversity: boolean
  showProtection: boolean
  open: boolean
  typeFilter: 'all' | 'marsh' | 'swamp' | 'bog' | 'fen' | 'estuary'
}

// Task 49: Urban Heat Island
export interface HeatZone {
  id: string
  name: string
  latitude: number
  longitude: number
  temperature: number
  heatIndex: number
  vegetationCover: number
  albedo: number
  population: number
  coolZoneNearby: boolean
}

export interface UrbanHeatIslandState {
  heatZones: HeatZone[]
  activeHeatZoneId: string | null
  showTemperature: boolean
  showVegetation: boolean
  showCoolZones: boolean
  showPopulation: boolean
  open: boolean
  tempUnit: 'celsius' | 'fahrenheit'
}

// Task 49: Wildfire Risk Assessor
export interface FireRiskZone {
  id: string
  name: string
  latitude: number
  longitude: number
  fireDangerRating: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'
  fuelMoisture: number
  windSpeed: number
  temperature: number
  humidity: number
  vegetationType: string
  lastFireDate: string | null
}

export interface WildfireRiskState {
  fireZones: FireRiskZone[]
  activeFireZoneId: string | null
  showDangerRating: boolean
  showFuelMoisture: boolean
  showWind: boolean
  showHistory: boolean
  open: boolean
  dangerFilter: 'all' | 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'
}

// Task 49: Algal Bloom Tracker
export interface AlgalBloomSite {
  id: string
  name: string
  latitude: number
  longitude: number
  bloomIntensity: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  chlorophyllA: number
  waterTemperature: number
  dissolvedOxygen: number
  toxicity: boolean
  species: string
  detectedDate: string
}

export interface AlgalBloomState {
  blooms: AlgalBloomSite[]
  activeBloomId: string | null
  showBloomExtent: boolean
  showChlorophyll: boolean
  showToxicity: boolean
  showTemperature: boolean
  open: boolean
  intensityFilter: 'all' | 'none' | 'low' | 'moderate' | 'high' | 'severe'
}

// Task 49: Landslide Predictor
export interface LandslideZone {
  id: string
  name: string
  latitude: number
  longitude: number
  susceptibility: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  slope: number
  rainfallThreshold: number
  currentRainfall: number
  soilType: string
  vegetationCover: number
  recentActivity: boolean
}

export interface LandslidePredictorState {
  landslideZones: LandslideZone[]
  activeLandslideId: string | null
  showSusceptibility: boolean
  showSlope: boolean
  showRainfall: boolean
  showActivity: boolean
  open: boolean
  susceptibilityFilter: 'all' | 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
}

// Task 49: Sea Ice Navigator
export interface SeaIceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  iceConcentration: number
  iceThickness: number
  iceType: 'new' | 'first_year' | 'multi_year' | 'fast_ice'
  driftSpeed: number
  driftDirection: number
  navigable: boolean
}

export interface SeaIceNavigatorState {
  iceZones: SeaIceZone[]
  activeIceZoneId: string | null
  showConcentration: boolean
  showThickness: boolean
  showDrift: boolean
  showRoutes: boolean
  open: boolean
  iceTypeFilter: 'all' | 'new' | 'first_year' | 'multi_year' | 'fast_ice'
}

// Task 50: Cloud Cover Analyzer
export interface CloudLayer {
  id: string
  name: string
  latitude: number
  longitude: number
  coverage: number
  cloudType: 'cirrus' | 'cumulus' | 'stratus' | 'nimbus' | 'cumulonimbus'
  altitude: number
  temperature: number
  precipitation: boolean
}

export interface CloudCoverState {
  cloudLayers: CloudLayer[]
  activeCloudId: string | null
  showCoverage: boolean
  showAltitude: boolean
  showPrecipitation: boolean
  showTemperature: boolean
  open: boolean
  cloudTypeFilter: 'all' | 'cirrus' | 'cumulus' | 'stratus' | 'nimbus' | 'cumulonimbus'
}

// Task 50: Soil Moisture Monitor
export interface SoilMoistureZone {
  id: string
  name: string
  latitude: number
  longitude: number
  moistureLevel: number
  fieldCapacity: number
  wiltingPoint: number
  soilType: string
  depth: number
  irrigationNeeded: boolean
}

export interface SoilMoistureState {
  soilZones: SoilMoistureZone[]
  activeSoilZoneId: string | null
  showMoisture: boolean
  showDepth: boolean
  showIrrigation: boolean
  showSoilType: boolean
  open: boolean
  moistureFilter: 'all' | 'dry' | 'moderate' | 'wet' | 'saturated'
}

// Task 50: Night Sky Light Pollution
export interface LightPollutionZone {
  id: string
  name: string
  latitude: number
  longitude: number
  brightness: number
  bortleClass: number
  limitingMagnitude: number
  lightSource: string
  visibleStars: number
  milkyWayVisible: boolean
}

export interface LightPollutionState {
  lightZones: LightPollutionZone[]
  activeLightZoneId: string | null
  showBrightness: boolean
  showBortle: boolean
  showStars: boolean
  showMilkyWay: boolean
  open: boolean
  bortleFilter: 'all' | 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor'
}

// Task 50: River Flow Monitor
export interface RiverStation {
  id: string
  name: string
  latitude: number
  longitude: number
  flowRate: number
  waterLevel: number
  floodStage: number
  floodStatus: 'normal' | 'watch' | 'warning' | 'flood'
  temperature: number
  dissolvedOxygen: number
}

export interface RiverFlowState {
  stations: RiverStation[]
  activeStationId: string | null
  showFlowRate: boolean
  showWaterLevel: boolean
  showFloodStatus: boolean
  showQuality: boolean
  open: boolean
  floodFilter: 'all' | 'normal' | 'watch' | 'warning' | 'flood'
}

// Task 50: Volcano Seismic Monitor
export interface VolcanoSeismicStation {
  id: string
  name: string
  latitude: number
  longitude: number
  volcano: string
  alertLevel: 'normal' | 'advisory' | 'watch' | 'warning'
  seismicActivity: number
  deformation: number
  gasEmission: number
  lastEruption: string | null
  proximity: number
}

export interface VolcanoSeismicState {
  seismicStations: VolcanoSeismicStation[]
  activeStationId: string | null
  showAlertLevel: boolean
  showSeismic: boolean
  showDeformation: boolean
  showGas: boolean
  open: boolean
  alertFilter: 'all' | 'normal' | 'advisory' | 'watch' | 'warning'
}

// Task 50: Whale Migration Tracker
export interface WhalePod {
  id: string
  name: string
  latitude: number
  longitude: number
  species: string
  podSize: number
  heading: number
  speed: number
  depth: number
  vocalizing: boolean
  lastSighting: string
}

export interface WhaleMigrationState {
  whalePods: WhalePod[]
  activePodId: string | null
  showTracks: boolean
  showDepth: boolean
  showVocalization: boolean
  showSpeed: boolean
  open: boolean
  speciesFilter: 'all' | string
}

// Task 50: Avalanche Forecaster
export interface AvalancheZone {
  id: string
  name: string
  latitude: number
  longitude: number
  dangerLevel: 'low' | 'moderate' | 'considerable' | 'high' | 'extreme'
  snowStability: number
  recentSnowfall: number
  windLoading: boolean
  temperature: number
  aspect: string
  elevation: number
}

export interface AvalancheForecasterState {
  avalancheZones: AvalancheZone[]
  activeZoneId: string | null
  showDanger: boolean
  showStability: boolean
  showSnowfall: boolean
  showAspect: boolean
  open: boolean
  dangerFilter: 'all' | 'low' | 'moderate' | 'considerable' | 'high' | 'extreme'
}

// Task 50: Aurora Forecaster
export interface AuroraViewingSite {
  id: string
  name: string
  latitude: number
  longitude: number
  kpIndex: number
  cloudCover: number
  lightPollution: number
  visibility: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
  predictedIntensity: number
  bestViewingTime: string
}

export interface AuroraForecasterState {
  auroraSites: AuroraViewingSite[]
  activeSiteId: string | null
  showKpIndex: boolean
  showCloudCover: boolean
  showIntensity: boolean
  showViewingTime: boolean
  open: boolean
  visibilityFilter: 'all' | 'excellent' | 'good' | 'fair' | 'poor' | 'none'
}

// Task 51: Ozone Layer Monitor
export interface OzoneZone {
  id: string
  name: string
  latitude: number
  longitude: number
  ozoneDobson: number
  trend: 'increasing' | 'stable' | 'decreasing'
  uvIndex: number
  season: string
  satelliteSource: string
}

export interface OzoneLayerState {
  ozoneZones: OzoneZone[]
  activeOzoneId: string | null
  showDobson: boolean
  showTrend: boolean
  showUV: boolean
  showSeason: boolean
  open: boolean
  trendFilter: 'all' | 'increasing' | 'stable' | 'decreasing'
}

// Task 51: Deforestation Tracker
export interface DeforestationZone {
  id: string
  name: string
  latitude: number
  longitude: number
  treeCoverLoss: number
  remainingForest: number
  rate: number
  driver: string
  protectedArea: boolean
  restorationPotential: number
}

export interface DeforestationState {
  deforestationZones: DeforestationZone[]
  activeZoneId: string | null
  showLoss: boolean
  showRemaining: boolean
  showRate: boolean
  showDrivers: boolean
  open: boolean
  driverFilter: 'all' | string
}

// Task 51: Methane Emissions Tracker
export interface MethaneSource {
  id: string
  name: string
  latitude: number
  longitude: number
  emissionRate: number
  sourceType: 'agriculture' | 'energy' | 'waste' | 'natural' | 'industrial'
  concentration: number
  trend: 'rising' | 'stable' | 'falling'
  verified: boolean
}

export interface MethaneEmissionsState {
  methaneSources: MethaneSource[]
  activeSourceId: string | null
  showEmissionRate: boolean
  showConcentration: boolean
  showTrend: boolean
  showVerified: boolean
  open: boolean
  sourceTypeFilter: 'all' | 'agriculture' | 'energy' | 'waste' | 'natural' | 'industrial'
}

// Task 51: Ocean Acidification Monitor
export interface OceanAcidSite {
  id: string
  name: string
  latitude: number
  longitude: number
  ph: number
  pCO2: number
  aragoniteSaturation: number
  coralImpact: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  trend: 'improving' | 'stable' | 'declining'
  samplingDepth: number
}

export interface OceanAcidificationState {
  acidSites: OceanAcidSite[]
  activeSiteId: string | null
  showPH: boolean
  showCO2: boolean
  showAragonite: boolean
  showImpact: boolean
  open: boolean
  impactFilter: 'all' | 'none' | 'low' | 'moderate' | 'high' | 'severe'
}

// Task 51: Space Debris Tracker
export interface DebrisObject {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  objectType: 'satellite' | 'debris' | 'rocket_body' | 'unknown'
  size: number
  velocity: number
  inclination: number
  decayRate: number
}

export interface SpaceDebrisState {
  debrisObjects: DebrisObject[]
  activeDebrisId: string | null
  showAltitude: boolean
  showVelocity: boolean
  showDecay: boolean
  showType: boolean
  open: boolean
  typeFilter: 'all' | 'satellite' | 'debris' | 'rocket_body' | 'unknown'
}

// Task 51: Tectonic Strain Monitor
export interface StrainStation {
  id: string
  name: string
  latitude: number
  longitude: number
  strainRate: number
  stressAccumulation: number
  faultType: string
  lastEvent: string | null
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  displacement: number
}

export interface TectonicStrainState {
  strainStations: StrainStation[]
  activeStationId: string | null
  showStrain: boolean
  showStress: boolean
  showFaults: boolean
  showRisk: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

// Task 51: Phytoplankton Bloom Monitor
export interface PhytoBloomSite {
  id: string
  name: string
  latitude: number
  longitude: number
  chlorophyllConc: number
  bloomArea: number
  dominantSpecies: string
  toxicityRisk: boolean
  seaSurfaceTemp: number
  nutrientLevel: number
}

export interface PhytoBloomState {
  bloomSites: PhytoBloomSite[]
  activeBloomId: string | null
  showChlorophyll: boolean
  showArea: boolean
  showToxicity: boolean
  showNutrients: boolean
  open: boolean
  toxicityFilter: 'all' | 'toxic' | 'nontoxic'
}

// Task 51: Snow Cover Monitor
export interface SnowCoverZone {
  id: string
  name: string
  latitude: number
  longitude: number
  snowDepth: number
  snowWaterEquiv: number
  coverage: number
  meltRate: number
  snowLine: number
  seasonOnset: string
}

export interface SnowCoverState {
  snowZones: SnowCoverZone[]
  activeSnowZoneId: string | null
  showDepth: boolean
  showWaterEquiv: boolean
  showCoverage: boolean
  showMeltRate: boolean
  open: boolean
  depthFilter: 'all' | 'shallow' | 'moderate' | 'deep' | 'very_deep'
}

// Task 52: Geomagnetic Storm Tracker
export interface GeomagneticStorm {
  id: string
  name: string
  latitude: number
  longitude: number
  kpIndex: number
  gScale: 'G1' | 'G2' | 'G3' | 'G4' | 'G5'
  powerGridImpact: 'none' | 'minor' | 'moderate' | 'severe' | 'extreme'
  auroraVisibility: number
  startTime: string
  duration: number
}

export interface GeomagneticStormState {
  storms: GeomagneticStorm[]
  activeStormId: string | null
  showKpIndex: boolean
  showGScale: boolean
  showGridImpact: boolean
  showAurora: boolean
  open: boolean
  gScaleFilter: 'all' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5'
}

// Task 52: Volcanic Gas Monitor
export interface VolcanicGasSite {
  id: string
  name: string
  latitude: number
  longitude: number
  volcano: string
  so2Emission: number
  co2Emission: number
  h2sEmission: number
  hazardLevel: 'normal' | 'elevated' | 'high' | 'critical'
  windDirection: number
  affectedPopulation: number
}

export interface VolcanicGasState {
  gasSites: VolcanicGasSite[]
  activeSiteId: string | null
  showSO2: boolean
  showCO2: boolean
  showHazard: boolean
  showPopulation: boolean
  open: boolean
  hazardFilter: 'all' | 'normal' | 'elevated' | 'high' | 'critical'
}

// Task 52: Aquifer Depletion Monitor
export interface AquiferSite {
  id: string
  name: string
  latitude: number
  longitude: number
  waterLevel: number
  depletionRate: number
  rechargeRate: number
  storageVolume: number
  wellDepth: number
  status: 'stable' | 'declining' | 'critical' | 'recovering'
}

export interface AquiferDepletionState {
  aquiferSites: AquiferSite[]
  activeAquiferId: string | null
  showWaterLevel: boolean
  showDepletion: boolean
  showRecharge: boolean
  showStatus: boolean
  open: boolean
  statusFilter: 'all' | 'stable' | 'declining' | 'critical' | 'recovering'
}

// Task 52: Stratospheric Wind Monitor
export interface StratosphericWindZone {
  id: string
  name: string
  latitude: number
  longitude: number
  windSpeed: number
  windDirection: number
  altitude: number
  qboPhase: 'easterly' | 'westerly' | 'transition'
  polarVortexStatus: 'strong' | 'normal' | 'weak' | 'disrupted'
  temperature: number
}

export interface StratosphericWindState {
  windZones: StratosphericWindZone[]
  activeZoneId: string | null
  showWindSpeed: boolean
  showQBO: boolean
  showPolarVortex: boolean
  showTemperature: boolean
  open: boolean
  vortexFilter: 'all' | 'strong' | 'normal' | 'weak' | 'disrupted'
}

// Task 52: Marine Heatwave Tracker
export interface MarineHeatwaveZone {
  id: string
  name: string
  latitude: number
  longitude: number
  sstAnomaly: number
  intensity: 'moderate' | 'strong' | 'severe' | 'extreme'
  duration: number
  area: number
  ecosystemImpact: 'low' | 'moderate' | 'high' | 'severe'
  coralBleachingRisk: boolean
}

export interface MarineHeatwaveState {
  heatwaveZones: MarineHeatwaveZone[]
  activeZoneId: string | null
  showSSTAnomaly: boolean
  showIntensity: boolean
  showEcosystem: boolean
  showBleaching: boolean
  open: boolean
  intensityFilter: 'all' | 'moderate' | 'strong' | 'severe' | 'extreme'
}

// Task 52: Precipitation Analyzer
export interface PrecipZone {
  id: string
  name: string
  latitude: number
  longitude: number
  annualPrecip: number
  monthlyAverage: number
  extremeEvents: number
  droughtIndex: number
  floodRisk: 'low' | 'moderate' | 'high' | 'very_high'
  trend: 'increasing' | 'stable' | 'decreasing'
}

export interface PrecipitationState {
  precipZones: PrecipZone[]
  activeZoneId: string | null
  showAnnual: boolean
  showExtremes: boolean
  showDrought: boolean
  showFloodRisk: boolean
  open: boolean
  floodFilter: 'all' | 'low' | 'moderate' | 'high' | 'very_high'
}

// Task 52: Cosmic Ray Monitor
export interface CosmicRayStation {
  id: string
  name: string
  latitude: number
  longitude: number
  neutronCount: number
  fluxVariation: number
  solarModulation: number
  cutoffRigidity: number
  altitude: number
  status: 'normal' | 'forbush_decrease' | 'ground_level_enhancement'
}

export interface CosmicRayState {
  stations: CosmicRayStation[]
  activeStationId: string | null
  showNeutronCount: boolean
  showFluxVariation: boolean
  showSolarModulation: boolean
  showStatus: boolean
  open: boolean
  statusFilter: 'all' | 'normal' | 'forbush_decrease' | 'ground_level_enhancement'
}

// Task 52: Greenland Ice Tracker
export interface GreenlandIceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  iceThickness: number
  massBalance: number
  meltRate: number
  surfaceVelocity: number
  elevationChange: number
  zone: 'accumulation' | 'percolation' | 'wet_snow' | 'bare_ice' | 'outlet_glacier'
}

export interface GreenlandIceState {
  iceZones: GreenlandIceZone[]
  activeZoneId: string | null
  showThickness: boolean
  showMassBalance: boolean
  showMeltRate: boolean
  showVelocity: boolean
  open: boolean
  zoneFilter: 'all' | 'accumulation' | 'percolation' | 'wet_snow' | 'bare_ice' | 'outlet_glacier'
}

// Task 53: Radiation Exposure Monitor
export interface RadiationStation {
  id: string
  name: string
  latitude: number
  longitude: number
  doseRate: number
  gammaRate: number
  betaRate: number
  alertLevel: 'normal' | 'elevated' | 'high' | 'critical'
  source: string
  lastReading: string
}

export interface RadiationExposureState {
  stations: RadiationStation[]
  activeStationId: string | null
  showDoseRate: boolean
  showGamma: boolean
  showBeta: boolean
  showAlert: boolean
  open: boolean
  alertFilter: 'all' | 'normal' | 'elevated' | 'high' | 'critical'
}

// Task 53: Peat Fire Tracker
export interface PeatFireZone {
  id: string
  name: string
  latitude: number
  longitude: number
  fireStatus: 'active' | 'smoldering' | 'extinguished' | 'at_risk'
  area: number
  depth: number
  carbonEmission: number
  peatType: string
  containmentProgress: number
}

export interface PeatFireState {
  peatFires: PeatFireZone[]
  activeFireId: string | null
  showStatus: boolean
  showArea: boolean
  showCarbon: boolean
  showContainment: boolean
  open: boolean
  statusFilter: 'all' | 'active' | 'smoldering' | 'extinguished' | 'at_risk'
}

// Task 53: Sea Level Rise Projector
export interface SeaLevelStation {
  id: string
  name: string
  latitude: number
  longitude: number
  currentRise: number
  projected2050: number
  projected2100: number
  trend: number
  coastalImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
  population: number
}

export interface SeaLevelRiseState {
  stations: SeaLevelStation[]
  activeStationId: string | null
  showCurrent: boolean
  showProjection: boolean
  showImpact: boolean
  showPopulation: boolean
  open: boolean
  impactFilter: 'all' | 'minimal' | 'moderate' | 'significant' | 'severe'
}

// Task 53: Thermocline Mapper
export interface ThermoclineProfile {
  id: string
  name: string
  latitude: number
  longitude: number
  thermoclineDepth: number
  gradientStrength: number
  sstSurface: number
  sstDeep: number
  season: string
  elNinoPhase: 'neutral' | 'el_nino' | 'la_nina'
}

export interface ThermoclineState {
  profiles: ThermoclineProfile[]
  activeProfileId: string | null
  showDepth: boolean
  showGradient: boolean
  showSST: boolean
  showENSO: boolean
  open: boolean
  ensoFilter: 'all' | 'neutral' | 'el_nino' | 'la_nina'
}

// Task 53: Acid Rain Tracker
export interface AcidRainStation {
  id: string
  name: string
  latitude: number
  longitude: number
  precipPH: number
  sulfateConc: number
  nitrateConc: number
  ammoniumConc: number
  severity: 'normal' | 'mild' | 'moderate' | 'severe'
  trend: 'improving' | 'stable' | 'worsening'
}

export interface AcidRainState {
  stations: AcidRainStation[]
  activeStationId: string | null
  showPH: boolean
  showSulfate: boolean
  showSeverity: boolean
  showTrend: boolean
  open: boolean
  severityFilter: 'all' | 'normal' | 'mild' | 'moderate' | 'severe'
}

// Task 53: Methane Hydrate Monitor
export interface HydrateZone {
  id: string
  name: string
  latitude: number
  longitude: number
  stabilityZone: 'stable' | 'marginal' | 'unstable' | 'dissociating'
  depth: number
  temperature: number
  pressure: number
  methaneConcentration: number
  seafloorType: string
}

export interface MethaneHydrateState {
  hydrateZones: HydrateZone[]
  activeZoneId: string | null
  showStability: boolean
  showDepth: boolean
  showTemperature: boolean
  showConcentration: boolean
  open: boolean
  stabilityFilter: 'all' | 'stable' | 'marginal' | 'unstable' | 'dissociating'
}

// Task 53: Kelp Forest Monitor
export interface KelpForestSite {
  id: string
  name: string
  latitude: number
  longitude: number
  canopyCoverage: number
  healthIndex: number
  species: string
  waterTemp: number
  nutrientLevel: number
  urchinDensity: number
  restorationStatus: 'pristine' | 'healthy' | 'declining' | 'barren'
}

export interface KelpForestState {
  kelpSites: KelpForestSite[]
  activeSiteId: string | null
  showCoverage: boolean
  showHealth: boolean
  showSpecies: boolean
  showRestoration: boolean
  open: boolean
  statusFilter: 'all' | 'pristine' | 'healthy' | 'declining' | 'barren'
}

// Task 53: Glacier Lake Outburst Tracker
export interface GLOFSite {
  id: string
  name: string
  latitude: number
  longitude: number
  lakeVolume: number
  damType: 'moraine' | 'ice' | 'bedrock'
  damStability: 'stable' | 'weakening' | 'critical' | 'breached'
  downstreamPopulation: number
  lastOutburst: string | null
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high'
}

export interface GLOFState {
  glofSites: GLOFSite[]
  activeSiteId: string | null
  showVolume: boolean
  showStability: boolean
  showRisk: boolean
  showPopulation: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'very_high'
}

// Task 54: Dust Storm Tracker
export interface DustStormEvent {
  id: string
  name: string
  latitude: number
  longitude: number
  severity: 'minor' | 'moderate' | 'major' | 'extreme'
  windSpeed: number
  visibility: number
  dustConcentration: number
  direction: number
  area: number
  origin: string
  duration: string
}

export interface DustStormState {
  storms: DustStormEvent[]
  activeStormId: string | null
  showSeverity: boolean
  showWindSpeed: boolean
  showVisibility: boolean
  showConcentration: boolean
  open: boolean
  severityFilter: 'all' | 'minor' | 'moderate' | 'major' | 'extreme'
}

// Task 54: Bioluminescence Tracker
export interface BioluminescenceSite {
  id: string
  name: string
  latitude: number
  longitude: number
  intensity: 'dim' | 'moderate' | 'bright' | 'spectacular'
  organismType: string
  waterTemp: number
  lastObserved: string
  area: number
  seasonalPeak: string
}

export interface BioluminescenceState {
  sites: BioluminescenceSite[]
  activeSiteId: string | null
  showIntensity: boolean
  showOrganismType: boolean
  showWaterTemp: boolean
  showSeasonalPeak: boolean
  open: boolean
  intensityFilter: 'all' | 'dim' | 'moderate' | 'bright' | 'spectacular'
}

// Task 54: Urban Sprawl Monitor
export interface UrbanSprawlZone {
  id: string
  name: string
  latitude: number
  longitude: number
  growthRate: number
  populationDensity: number
  landUseChange: number
  greenSpaceLoss: number
  infraStrain: 'low' | 'moderate' | 'high' | 'critical'
  yearEstablished: number
  sprawlArea: number
}

export interface UrbanSprawlState {
  zones: UrbanSprawlZone[]
  activeZoneId: string | null
  showGrowthRate: boolean
  showDensity: boolean
  showGreenSpace: boolean
  showInfraStrain: boolean
  open: boolean
  strainFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

// Task 54: Viral Outbreak Mapper
export interface ViralOutbreakZone {
  id: string
  name: string
  latitude: number
  longitude: number
  pathogen: string
  caseCount: number
  r0Value: number
  severity: 'contained' | 'spreading' | 'epidemic' | 'pandemic'
  vaccinationRate: number
  mortalityRate: number
  lastUpdated: string
}

export interface ViralOutbreakState {
  outbreaks: ViralOutbreakZone[]
  activeOutbreakId: string | null
  showCaseCount: boolean
  showR0: boolean
  showVaccination: boolean
  showMortality: boolean
  open: boolean
  severityFilter: 'all' | 'contained' | 'spreading' | 'epidemic' | 'pandemic'
}

// Task 54: Magnetosphere Monitor
export interface MagnetosphereReading {
  id: string
  name: string
  latitude: number
  longitude: number
  bzComponent: number
  solarWindSpeed: number
  kpIndex: number
  dstIndex: number
  auroraProbability: number
  status: 'quiet' | 'unsettled' | 'active' | 'storm' | 'severe_storm'
}

export interface MagnetosphereState {
  readings: MagnetosphereReading[]
  activeReadingId: string | null
  showBz: boolean
  showSolarWind: boolean
  showKp: boolean
  showAurora: boolean
  open: boolean
  statusFilter: 'all' | 'quiet' | 'unsettled' | 'active' | 'storm' | 'severe_storm'
}

// Task 54: Fog Density Mapper
export interface FogDensityZone {
  id: string
  name: string
  latitude: number
  longitude: number
  density: 'light' | 'moderate' | 'dense' | 'super_dense'
  visibility: number
  humidity: number
  duration: string
  fogType: string
  aviationImpact: 'none' | 'minor' | 'moderate' | 'severe'
}

export interface FogDensityState {
  zones: FogDensityZone[]
  activeZoneId: string | null
  showDensity: boolean
  showVisibility: boolean
  showHumidity: boolean
  showAviationImpact: boolean
  open: boolean
  densityFilter: 'all' | 'light' | 'moderate' | 'dense' | 'super_dense'
}

// Task 54: Carbon Capture Tracker
export interface CarbonCaptureFacility {
  id: string
  name: string
  latitude: number
  longitude: number
  captureCapacity: number
  currentCapture: number
  technology: string
  status: 'planned' | 'construction' | 'operational' | 'paused'
  storageType: string
  co2Stored: number
}

export interface CarbonCaptureState {
  facilities: CarbonCaptureFacility[]
  activeFacilityId: string | null
  showCapacity: boolean
  showTechnology: boolean
  showStatus: boolean
  showStorage: boolean
  open: boolean
  statusFilter: 'all' | 'planned' | 'construction' | 'operational' | 'paused'
}

// Task 54: Hail Storm Tracker
export interface HailStormEvent {
  id: string
  name: string
  latitude: number
  longitude: number
  maxHailSize: number
  windSpeed: number
  duration: string
  damage: 'none' | 'minor' | 'moderate' | 'severe' | 'catastrophic'
  area: number
  supercellType: string
}

export interface HailStormState {
  events: HailStormEvent[]
  activeEventId: string | null
  showHailSize: boolean
  showWindSpeed: boolean
  showDamage: boolean
  showArea: boolean
  open: boolean
  damageFilter: 'all' | 'none' | 'minor' | 'moderate' | 'severe' | 'catastrophic'
}

// Task 55: Sahara Reforestation Tracker
export interface SaharaReforestationProject {
  id: string
  name: string
  latitude: number
  longitude: number
  areaRestored: number
  treeCount: number
  speciesDiversity: number
  waterUsage: number
  survivalRate: number
  status: 'planned' | 'planting' | 'growing' | 'established' | 'threatened'
  yearStarted: number
}

export interface SaharaReforestationState {
  projects: SaharaReforestationProject[]
  activeProjectId: string | null
  showArea: boolean
  showTreeCount: boolean
  showSurvivalRate: boolean
  showStatus: boolean
  open: boolean
  statusFilter: 'all' | 'planned' | 'planting' | 'growing' | 'established' | 'threatened'
}

// Task 55: Deep Sea Vents Monitor
export interface DeepSeaVent {
  id: string
  name: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  ventType: 'black_smoker' | 'white_smoker' | 'diffuse_flow'
  mineralType: string
  biologicalActivity: 'low' | 'moderate' | 'high' | 'extreme'
  discoveryYear: number
}

export interface DeepSeaVentState {
  vents: DeepSeaVent[]
  activeVentId: string | null
  showTemperature: boolean
  showDepth: boolean
  showVentType: boolean
  showBiology: boolean
  open: boolean
  biologyFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

// Task 55: Storm Surge Predictor
export interface StormSurgeZone {
  id: string
  name: string
  latitude: number
  longitude: number
  surgeHeight: number
  windSpeed: number
  pressureDrop: number
  coastalPopulation: number
  evacuationLevel: 'none' | 'advisory' | 'watch' | 'warning' | 'emergency'
  historicalMax: number
}

export interface StormSurgeState {
  zones: StormSurgeZone[]
  activeZoneId: string | null
  showSurgeHeight: boolean
  showWindSpeed: boolean
  showPopulation: boolean
  showEvacuation: boolean
  open: boolean
  evacuationFilter: 'all' | 'none' | 'advisory' | 'watch' | 'warning' | 'emergency'
}

// Task 55: Landfill Monitor
export interface LandfillSite {
  id: string
  name: string
  latitude: number
  longitude: number
  capacity: number
  currentFill: number
  methaneOutput: number
  leachateRisk: 'low' | 'moderate' | 'high' | 'critical'
  wasteType: string
  yearsRemaining: number
  recyclingRate: number
}

export interface LandfillMonitorState {
  sites: LandfillSite[]
  activeSiteId: string | null
  showFill: boolean
  showMethane: boolean
  showLeachate: boolean
  showRecycling: boolean
  open: boolean
  leachateFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

// Task 55: Salinity Gradient Mapper
export interface SalinityGradientZone {
  id: string
  name: string
  latitude: number
  longitude: number
  salinity: number
  depth: number
  temperature: number
  gradientType: 'estuary' | 'halocline' | 'salt_wedge' | 'hypersaline'
  marineImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
  oxygenLevel: number
}

export interface SalinityGradientState {
  zones: SalinityGradientZone[]
  activeZoneId: string | null
  showSalinity: boolean
  showDepth: boolean
  showGradientType: boolean
  showOxygen: boolean
  open: boolean
  impactFilter: 'all' | 'minimal' | 'moderate' | 'significant' | 'severe'
}

// Task 55: Microplastics Tracker
export interface MicroplasticsSample {
  id: string
  name: string
  latitude: number
  longitude: number
  concentration: number
  particleSize: string
  polymerType: string
  source: string
  severity: 'low' | 'moderate' | 'high' | 'extreme'
  waterDepth: number
}

export interface MicroplasticsState {
  samples: MicroplasticsSample[]
  activeSampleId: string | null
  showConcentration: boolean
  showPolymerType: boolean
  showSource: boolean
  showSeverity: boolean
  open: boolean
  severityFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

// Task 55: Radio Signal Mapper
export interface RadioSignalStation {
  id: string
  name: string
  latitude: number
  longitude: number
  frequency: number
  signalStrength: number
  modulationType: string
  coverageRadius: number
  interferenceLevel: 'none' | 'low' | 'moderate' | 'high'
  bandType: string
}

export interface RadioSignalState {
  stations: RadioSignalStation[]
  activeStationId: string | null
  showStrength: boolean
  showFrequency: boolean
  showCoverage: boolean
  showInterference: boolean
  open: boolean
  interferenceFilter: 'all' | 'none' | 'low' | 'moderate' | 'high'
}

// Task 55: Volcanic Island Monitor
export interface VolcanicIsland {
  id: string
  name: string
  latitude: number
  longitude: number
  islandAge: number
  lastEruption: string
  eruptionType: 'effusive' | 'explosive' | 'phreatomagmatic' | 'strombolian'
  area: number
  elevation: number
  activityLevel: 'dormant' | 'fumarolic' | 'unrest' | 'erupting'
  population: number
}

export interface VolcanicIslandState {
  islands: VolcanicIsland[]
  activeIslandId: string | null
  showActivity: boolean
  showEruptionType: boolean
  showElevation: boolean
  showPopulation: boolean
  open: boolean
  activityFilter: 'all' | 'dormant' | 'fumarolic' | 'unrest' | 'erupting'
}

// Task 56: Permafrost Thaw Monitor
export interface PermafrostThawZone {
  id: string
  name: string
  latitude: number
  longitude: number
  thawRate: number
  activeLayerDepth: number
  groundTemp: number
  carbonRelease: number
  infrastructure: 'none' | 'minor' | 'moderate' | 'severe'
  permafrostType: string
}

export interface PermafrostThawState {
  zones: PermafrostThawZone[]
  activeZoneId: string | null
  showThawRate: boolean
  showActiveLayer: boolean
  showGroundTemp: boolean
  showInfrastructure: boolean
  open: boolean
  infrastructureFilter: 'all' | 'none' | 'minor' | 'moderate' | 'severe'
}

// Task 56: Ocean Current Tracker
export interface OceanCurrentZone {
  id: string
  name: string
  latitude: number
  longitude: number
  speed: number
  direction: number
  temperature: number
  salinity: number
  currentType: 'surface' | 'deep' | 'thermohaline' | 'coastal'
  ecosystemImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
}

export interface OceanCurrentTrackerState {
  currents: OceanCurrentZone[]
  activeCurrentId: string | null
  showSpeed: boolean
  showTemperature: boolean
  showSalinity: boolean
  showImpact: boolean
  open: boolean
  impactFilter: 'all' | 'minimal' | 'moderate' | 'significant' | 'severe'
}

// Task 56: Space Weather Alert
export interface SpaceWeatherAlert {
  id: string
  name: string
  latitude: number
  longitude: number
  alertType: 'solar_flare' | 'cme' | 'radiation_storm' | 'geomagnetic'
  severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme'
  kpIndex: number
  hfAbsorption: number
  gnssImpact: 'none' | 'minor' | 'moderate' | 'severe'
  startTime: string
}

export interface SpaceWeatherAlertState {
  alerts: SpaceWeatherAlert[]
  activeAlertId: string | null
  showSeverity: boolean
  showKpIndex: boolean
  showHfImpact: boolean
  showGnssImpact: boolean
  open: boolean
  severityFilter: 'all' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme'
}

// Task 56: Desert Monitor
export interface DesertZone {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  expansionRate: number
  avgTemperature: number
  rainfall: number
  vegetationIndex: number
  status: 'stable' | 'expanding' | 'recovering' | 'critical'
}

export interface DesertMonitorState {
  zones: DesertZone[]
  activeZoneId: string | null
  showExpansion: boolean
  showTemperature: boolean
  showRainfall: boolean
  showVegetation: boolean
  open: boolean
  statusFilter: 'all' | 'stable' | 'expanding' | 'recovering' | 'critical'
}

// Task 56: Tsunami Buoy Tracker
export interface TsunamiBuoy {
  id: string
  name: string
  latitude: number
  longitude: number
  waterHeight: number
  pressure: number
  wavePeriod: number
  status: 'normal' | 'watch' | 'advisory' | 'warning'
  detectionType: 'dart' | 'coastal' | 'tide_gauge'
  lastReading: string
}

export interface TsunamiBuoyState {
  buoys: TsunamiBuoy[]
  activeBuoyId: string | null
  showWaterHeight: boolean
  showPressure: boolean
  showWavePeriod: boolean
  showStatus: boolean
  open: boolean
  statusFilter: 'all' | 'normal' | 'watch' | 'advisory' | 'warning'
}

// Task 56: Glacier Velocity Tracker
export interface GlacierVelocityZone {
  id: string
  name: string
  latitude: number
  longitude: number
  velocity: number
  thickness: number
  massBalance: number
  calvingRate: number
  flowDirection: number
  status: 'stable' | 'accelerating' | 'surging' | 'retreating'
}

export interface GlacierVelocityState {
  zones: GlacierVelocityZone[]
  activeZoneId: string | null
  showVelocity: boolean
  showThickness: boolean
  showMassBalance: boolean
  showCalving: boolean
  open: boolean
  statusFilter: 'all' | 'stable' | 'accelerating' | 'surging' | 'retreating'
}

// Task 56: Earthquake Swarm Monitor
export interface EarthquakeSwarmEvent {
  id: string
  name: string
  latitude: number
  longitude: number
  magnitude: number
  depth: number
  frequency: number
  swarmSize: number
  faultType: string
  alertLevel: 'background' | 'advisory' | 'watch' | 'warning'
}

export interface EarthquakeSwarmState {
  events: EarthquakeSwarmEvent[]
  activeEventId: string | null
  showMagnitude: boolean
  showDepth: boolean
  showFrequency: boolean
  showAlertLevel: boolean
  open: boolean
  alertFilter: 'all' | 'background' | 'advisory' | 'watch' | 'warning'
}

// Task 56: Mangrove Restoration Tracker
export interface MangroveRestorationSite {
  id: string
  name: string
  latitude: number
  longitude: number
  area: number
  speciesCount: number
  carbonSequestration: number
  coastalProtection: number
  fisheryBoost: number
  restorationStage: 'planned' | 'nursery' | 'planting' | 'established' | 'mature'
}

export interface MangroveRestorationState {
  sites: MangroveRestorationSite[]
  activeSiteId: string | null
  showArea: boolean
  showCarbon: boolean
  showCoastalProtection: boolean
  showFishery: boolean
  open: boolean
  stageFilter: 'all' | 'planned' | 'nursery' | 'planting' | 'established' | 'mature'
}

// Task 57: Coral Bleaching Monitor
export interface CoralBleachingEvent {
  id: string
  name: string
  latitude: number
  longitude: number
  bleachingPercent: number
  seaSurfaceTemp: number
  heatStress: number
  recoveryPotential: 'high' | 'moderate' | 'low' | 'none'
  reefType: 'fringing' | 'barrier' | 'atoll' | 'patch'
  lastSurveyed: string
}

export interface CoralBleachingMonitorState {
  events: CoralBleachingEvent[]
  activeEventId: string | null
  showBleachingPercent: boolean
  showHeatStress: boolean
  showSeaTemp: boolean
  showRecoveryPotential: boolean
  open: boolean
  reefFilter: 'all' | 'fringing' | 'barrier' | 'atoll' | 'patch'
}

// Task 57: Arctic Sea Ice Monitor
export interface ArcticSeaIceZone {
  id: string
  name: string
  latitude: number
  longitude: number
  iceExtent: number
  iceThickness: number
  iceConcentration: number
  trend: 'growing' | 'stable' | 'declining' | 'rapid_decline'
  iceType: 'multiyear' | 'firstyear' | 'newice' | 'mixed'
}

export interface ArcticSeaIceState {
  zones: ArcticSeaIceZone[]
  activeZoneId: string | null
  showExtent: boolean
  showThickness: boolean
  showConcentration: boolean
  showTrend: boolean
  open: boolean
  iceFilter: 'all' | 'multiyear' | 'firstyear' | 'newice' | 'mixed'
}

// Task 57: Landslide Predictor
export interface LandslideRiskZone {
  id: string
  name: string
  latitude: number
  longitude: number
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  slopeAngle: number
  soilMoisture: number
  rainfallRate: number
  vegetationCover: number
  triggerType: 'rainfall' | 'earthquake' | 'erosion' | 'human_activity'
}

export interface LandslideRiskState {
  zones: LandslideRiskZone[]
  activeZoneId: string | null
  showRiskLevel: boolean
  showSlope: boolean
  showMoisture: boolean
  showVegetation: boolean
  open: boolean
  riskFilter: 'all' | 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
}

// Task 57: Air Quality Monitor
export interface AirQualityStation {
  id: string
  name: string
  latitude: number
  longitude: number
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  dominantPollutant: string
}

export interface AirQualityState {
  stations: AirQualityStation[]
  activeStationId: string | null
  showAQI: boolean
  showPM25: boolean
  showO3: boolean
  showDominantPollutant: boolean
  open: boolean
  categoryFilter: 'all' | 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
}

// Task 57: Soil Moisture Mapper (Agricultural)
export interface SoilMoistureAgZone {
  id: string
  name: string
  latitude: number
  longitude: number
  moisturePercent: number
  soilType: 'clay' | 'silt' | 'sand' | 'loam' | 'peat'
  temperature: number
  precipitation: number
  droughtIndex: number
  landUse: 'agriculture' | 'forest' | 'urban' | 'grassland' | 'wetland'
}

export interface SoilMoistureAgState {
  zones: SoilMoistureAgZone[]
  activeZoneId: string | null
  showMoisture: boolean
  showTemperature: boolean
  showDroughtIndex: boolean
  showSoilType: boolean
  open: boolean
  landUseFilter: 'all' | 'agriculture' | 'forest' | 'urban' | 'grassland' | 'wetland'
}

// Task 57: Noise Pollution Mapper
export interface NoisePollutionZone {
  id: string
  name: string
  latitude: number
  longitude: number
  decibels: number
  noiseType: 'traffic' | 'industrial' | 'construction' | 'aircraft' | 'entertainment' | 'mixed'
  timeOfDay: 'day' | 'evening' | 'night'
  affectedPopulation: number
  compliance: 'compliant' | 'marginal' | 'non_compliant'
}

export interface NoisePollutionState {
  zones: NoisePollutionZone[]
  activeZoneId: string | null
  showDecibels: boolean
  showNoiseType: boolean
  showAffectedPopulation: boolean
  showCompliance: boolean
  open: boolean
  typeFilter: 'all' | 'traffic' | 'industrial' | 'construction' | 'aircraft' | 'entertainment' | 'mixed'
}

// Task 57: Light Pollution Mapper (Sky Quality)
export interface LightPollutionSkyZone {
  id: string
  name: string
  latitude: number
  longitude: number
  skyBrightness: number
  bortleScale: number
  lightSourceType: 'urban' | 'industrial' | 'commercial' | 'residential' | 'mixed'
  visibleStars: number
  impactRadius: number
  energyWaste: number
}

export interface LightPollutionSkyState {
  zones: LightPollutionSkyZone[]
  activeZoneId: string | null
  showBortleScale: boolean
  showSkyBrightness: boolean
  showVisibleStars: boolean
  showEnergyWaste: boolean
  open: boolean
  sourceFilter: 'all' | 'urban' | 'industrial' | 'commercial' | 'residential' | 'mixed'
}

// Task 57: Groundwater Recharge Tracker
export interface GroundwaterRechargeZone {
  id: string
  name: string
  latitude: number
  longitude: number
  rechargeRate: number
  waterTableDepth: number
  aquiferType: 'unconfined' | 'confined' | 'semi_confined' | 'karst'
  extractionRate: number
  sustainability: 'sustainable' | 'marginal' | 'overexploited' | 'critical'
  qualityIndex: number
}

export interface GroundwaterRechargeState {
  zones: GroundwaterRechargeZone[]
  activeZoneId: string | null
  showRechargeRate: boolean
  showWaterTable: boolean
  showSustainability: boolean
  showQuality: boolean
  open: boolean
  aquiferFilter: 'all' | 'unconfined' | 'confined' | 'semi_confined' | 'karst'
}

// Task 65: Subglacial Lake Explorer
export interface SubglacialLake {
  id: string
  name: string
  depth: number
  waterTemp: number
  iceThickness: number
  dissolvedOxygen: number
  status: 'active_research' | 'dormant' | 'unexplored'
  latitude: number
  longitude: number
}

export interface SubglacialLakeState {
  lakes: SubglacialLake[]
  activeLakeId: string | null
  showDepth: boolean
  showWaterTemp: boolean
  showIceThickness: boolean
  showDissolvedOxygen: boolean
  open: boolean
  statusFilter: 'all' | 'active_research' | 'dormant' | 'unexplored'
}

// Task 65: Thermokarst Lake Monitor
export interface ThermokarstLake {
  id: string
  name: string
  expansionRate: number
  methaneEmission: number
  shorelineErosion: number
  area: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  latitude: number
  longitude: number
}

export interface ThermokarstLakeState {
  lakes: ThermokarstLake[]
  activeLakeId: string | null
  showExpansionRate: boolean
  showMethaneEmission: boolean
  showShorelineErosion: boolean
  showArea: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'medium' | 'high' | 'critical'
}

// Task 65: Paleoclimate Proxy Explorer
export interface PaleoclimateProxy {
  id: string
  type: 'ice_core' | 'tree_ring' | 'sediment' | 'coral' | 'speleothem'
  ageRange: string
  resolution: string
  tempReconstruction: number
  latitude: number
  longitude: number
}

export interface PaleoclimateProxyState {
  proxies: PaleoclimateProxy[]
  activeProxyId: string | null
  showAgeRange: boolean
  showResolution: boolean
  showTempReconstruction: boolean
  open: boolean
  typeFilter: 'all' | 'ice_core' | 'tree_ring' | 'sediment' | 'coral' | 'speleothem'
}

// Task 65: Geomagnetically Induced Current Monitor
export interface GICReading {
  id: string
  transformer: string
  intensity: number
  voltage: number
  riskLevel: 'normal' | 'elevated' | 'high' | 'critical'
  timestamp: string
}

export interface GICMonitorState {
  readings: GICReading[]
  activeReadingId: string | null
  showIntensity: boolean
  showVoltage: boolean
  showRiskLevel: boolean
  open: boolean
  riskFilter: 'all' | 'normal' | 'elevated' | 'high' | 'critical'
}

// Task 65: Sabkha Environment Monitor
export interface SabkhaZone {
  id: string
  name: string
  salinity: number
  evaporationRate: number
  crustThickness: number
  mineralType: string
  latitude: number
  longitude: number
}

export interface SabkhaEnvironmentState {
  zones: SabkhaZone[]
  activeZoneId: string | null
  showSalinity: boolean
  showEvaporationRate: boolean
  showCrustThickness: boolean
  showMineralType: boolean
  open: boolean
  mineralFilter: 'all' | 'halite' | 'gypsum' | 'anhydrite' | 'dolomite'
}

// Task 65: Cryosphere Change Tracker
export interface CryosphereRegion {
  id: string
  name: string
  type: 'ice_sheet' | 'glacier' | 'sea_ice' | 'permafrost' | 'snow'
  massBalance: number
  extentChange: number
  albedoShift: number
  seaLevelContribution: number
}

export interface CryosphereChangeState {
  regions: CryosphereRegion[]
  activeRegionId: string | null
  showMassBalance: boolean
  showExtentChange: boolean
  showAlbedoShift: boolean
  showSeaLevelContribution: boolean
  open: boolean
  typeFilter: 'all' | 'ice_sheet' | 'glacier' | 'sea_ice' | 'permafrost' | 'snow'
}

// Task 65: Abyssal Plain Mapper
export interface AbyssalFeature {
  id: string
  name: string
  depth: number
  sedimentType: string
  noduleDensity: number
  biodiversityIndex: number
  latitude: number
  longitude: number
}

export interface AbyssalPlainState {
  features: AbyssalFeature[]
  activeFeatureId: string | null
  showDepth: boolean
  showSedimentType: boolean
  showNoduleDensity: boolean
  showBiodiversityIndex: boolean
  open: boolean
  sedimentFilter: 'all' | 'clay' | 'ooze' | 'turbidite' | 'diatomaceous'
}

// Task 65: Fjord Ecosystem Monitor
export interface FjordSystem {
  id: string
  name: string
  stratification: number
  oxygenLevel: number
  biodiversity: number
  glacialInput: number
  healthScore: number
  latitude: number
  longitude: number
}

export interface FjordEcosystemState {
  fjords: FjordSystem[]
  activeFjordId: string | null
  showStratification: boolean
  showOxygenLevel: boolean
  showBiodiversity: boolean
  showGlacialInput: boolean
  showHealthScore: boolean
  open: boolean
  healthFilter: 'all' | 'excellent' | 'good' | 'moderate' | 'poor'
}

// Task 67: Geothermal Spring Monitor
export interface GeothermalSpring {
  id: string
  name: string
  temperature: number
  ph: number
  flowRate: number
  mineralContent: number
  seismicActivity: number
  latitude: number
  longitude: number
}

export interface GeothermalSpringState {
  springs: GeothermalSpring[]
  activeSpringId: string | null
  showTemperature: boolean
  showFlowRate: boolean
  showMineralContent: boolean
  showSeismicActivity: boolean
  open: boolean
  tempFilter: 'all' | 'low' | 'medium' | 'high' | 'extreme'
}

// Task 67: Asteroid Impact Risk Mapper
export interface NearEarthObject {
  id: string
  name: string
  diameter: number
  velocity: number
  missDistance: number
  hazardScore: number
  approachDate: string
  latitude: number
  longitude: number
}

export interface AsteroidImpactState {
  objects: NearEarthObject[]
  activeObjectId: string | null
  showTrajectory: boolean
  showHazardScore: boolean
  showSizeComparison: boolean
  open: boolean
  hazardFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

// Task 67: Desert Oasis Monitor
export interface DesertOasis {
  id: string
  name: string
  waterLevel: number
  salinity: number
  vegetationIndex: number
  areaChange: number
  temperature: number
  latitude: number
  longitude: number
}

export interface DesertOasisState {
  oases: DesertOasis[]
  activeOasisId: string | null
  showWaterLevel: boolean
  showSalinity: boolean
  showVegetation: boolean
  showAreaChange: boolean
  open: boolean
  healthFilter: 'all' | 'thriving' | 'stable' | 'declining' | 'critical'
}

// Task 67: Volcanic Lightning Tracker
export interface VolcanicLightning {
  id: string
  volcanoName: string
  strikeCount: number
  frequency: number
  ashCloudHeight: number
  eruptionIntensity: number
  lastStrike: string
  latitude: number
  longitude: number
}

export interface VolcanicLightningState {
  strikes: VolcanicLightning[]
  activeStrikeId: string | null
  showFrequency: boolean
  showAshHeight: boolean
  showEruptionIntensity: boolean
  showStrikeCount: boolean
  open: boolean
  intensityFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

// Task 67: Ice Core Data Explorer
export interface IceCoreSample {
  id: string
  name: string
  depth: number
  age: number
  co2Level: number
  temperature: number
  dustConcentration: number
  latitude: number
  longitude: number
}

export interface IceCoreDataState {
  samples: IceCoreSample[]
  activeSampleId: string | null
  showCO2: boolean
  showTemperature: boolean
  showDust: boolean
  showDepth: boolean
  open: boolean
  ageFilter: 'all' | 'holocene' | 'pleistocene' | 'pliocene' | 'miocene'
}

// Task 67: Stratospheric Aerosol Monitor
export interface AerosolLayer {
  id: string
  name: string
  altitude: number
  opticalDepth: number
  composition: string
  coverage: number
  radiativeEffect: number
  latitude: number
  longitude: number
}

export interface StratosphericAerosolState {
  layers: AerosolLayer[]
  activeLayerId: string | null
  showOpticalDepth: boolean
  showAltitude: boolean
  showCoverage: boolean
  showRadiativeEffect: boolean
  open: boolean
  compositionFilter: 'all' | 'sulfate' | 'volcanic' | 'dust' | 'biomass'
}

// Task 67: Megacity Carbon Footprint
export interface MegacityEmission {
  id: string
  name: string
  population: number
  co2Emissions: number
  methaneEmissions: number
  transportShare: number
  energyShare: number
  industrialShare: number
  latitude: number
  longitude: number
}

export interface MegacityCarbonState {
  cities: MegacityEmission[]
  activeCityId: string | null
  showCO2: boolean
  showMethane: boolean
  showTransportShare: boolean
  showEnergyShare: boolean
  open: boolean
  emissionFilter: 'all' | 'low' | 'moderate' | 'high' | 'very-high'
}

// Task 67: Ocean Mesoscale Eddy Tracker
export interface MesoscaleEddy {
  id: string
  name: string
  eddyType: 'cyclonic' | 'anticyclonic'
  radius: number
  maxVelocity: number
  temperatureAnomaly: number
  lifetime: number
  latitude: number
  longitude: number
}

export interface OceanEddyState {
  eddies: MesoscaleEddy[]
  activeEddyId: string | null
  showRadius: boolean
  showVelocity: boolean
  showTempAnomaly: boolean
  showLifetime: boolean
  open: boolean
  typeFilter: 'all' | 'cyclonic' | 'anticyclonic'
}

// Task 68: New monitoring interfaces
export interface SupervolcanoState {
  volcanoes: SupervolcanoData[]
  activeVolcanoId: string | null
  showCaldera: boolean
  showMagmaChamber: boolean
  showGroundDeformation: boolean
  showThermalAnomaly: boolean
  open: boolean
  statusFilter: 'all' | 'dormant' | 'unrest' | 'elevated' | 'critical'
}

export interface SupervolcanoData {
  id: string
  name: string
  lat: number
  lng: number
  calderaDiameter: number
  magmaChamberDepth: number
  groundDeformation: number
  thermalAnomaly: number
  lastEruption: string
  vei: number
  status: 'dormant' | 'unrest' | 'elevated' | 'critical'
  description: string
}

export interface PolarVortexState {
  vortices: PolarVortexData[]
  activeVortexId: string | null
  showWindSpeed: boolean
  showTemperature: boolean
  showOzoneLevel: boolean
  showJetStream: boolean
  open: boolean
  hemisphereFilter: 'all' | 'arctic' | 'antarctic'
}

export interface PolarVortexData {
  id: string
  name: string
  lat: number
  lng: number
  windSpeed: number
  temperature: number
  ozoneLevel: number
  jetStreamSpeed: number
  vortexStrength: number
  displacement: number
  status: 'stable' | 'weakening' | 'displaced' | 'split' | 'collapsed'
  description: string
}

export interface KarstAquiferState {
  aquifers: KarstAquiferData[]
  activeAquiferId: string | null
  showWaterTable: boolean
  showConduitFlow: boolean
  showRechargeZone: boolean
  showWaterQuality: boolean
  open: boolean
  typeFilter: 'all' | 'carbonate' | 'evaporite' | 'volcanic' | 'silicate'
}

export interface KarstAquiferData {
  id: string
  name: string
  lat: number
  lng: number
  waterTableDepth: number
  conduitFlowRate: number
  rechargeRate: number
  waterQualityIndex: number
  saturationIndex: number
  status: 'pristine' | 'good' | 'moderate' | 'degraded' | 'critical'
  description: string
}

export interface SubductionZoneState {
  zones: SubductionZoneData[]
  activeZoneId: string | null
  showSeismicity: boolean
  showSlipRate: boolean
  showCoupling: boolean
  showTremorActivity: boolean
  open: boolean
  typeFilter: 'all' | 'oceanic_oceanic' | 'oceanic_continental' | 'continental_continental'
}

export interface SubductionZoneData {
  id: string
  name: string
  lat: number
  lng: number
  seismicity: number
  slipRate: number
  couplingRatio: number
  tremorCount: number
  maxDepth: number
  convergenceRate: number
  status: 'locked' | 'creeping' | 'partial_lock' | 'tremor_swarm' | 'megathrust'
  description: string
}

export interface TropopauseState {
  stations: TropopauseData[]
  activeStationId: string | null
  showHeight: boolean
  showTemperature: boolean
  showOzoneConcentration: boolean
  showPressure: boolean
  open: boolean
  regionFilter: 'all' | 'tropical' | 'midlatitude' | 'polar'
}

export interface TropopauseData {
  id: string
  name: string
  lat: number
  lng: number
  height: number
  temperature: number
  ozoneConcentration: number
  pressure: number
  lapseRateTropopause: number
  status: 'normal' | 'elevated' | 'depressed' | 'fold' | 'double'
  description: string
}

export interface InvasiveSpeciesState {
  species: InvasiveSpeciesData[]
  activeSpeciesId: string | null
  showSpread: boolean
  showImpact: boolean
  showControlEffort: boolean
  showNativeDecline: boolean
  open: boolean
  categoryFilter: 'all' | 'plant' | 'animal' | 'aquatic' | 'insect' | 'pathogen'
}

export interface InvasiveSpeciesData {
  id: string
  name: string
  lat: number
  lng: number
  spreadRate: number
  impactScore: number
  controlEffort: number
  nativeDecline: number
  introductionYear: number
  status: 'contained' | 'spreading' | 'established' | 'widespread' | 'intractable'
  description: string
}

export interface TundraCarbonState {
  sites: TundraCarbonData[]
  activeSiteId: string | null
  showCarbonFlux: boolean
  showPermafrostDepth: boolean
  showVegetationIndex: boolean
  showMethaneRelease: boolean
  open: boolean
  regionFilter: 'all' | 'arctic' | 'alpine' | 'antarctic'
}

export interface TundraCarbonData {
  id: string
  name: string
  lat: number
  lng: number
  carbonFlux: number
  permafrostDepth: number
  vegetationIndex: number
  methaneRelease: number
  soilTemperature: number
  status: 'sink' | 'neutral' | 'source' | 'accelerating' | 'runaway'
  description: string
}

export interface MonsoonState {
  systems: MonsoonData[]
  activeSystemId: string | null
  showPrecipitation: boolean
  showWindPattern: boolean
  showHumidity: boolean
  showCloudCover: boolean
  open: boolean
  regionFilter: 'all' | 'asian' | 'african' | 'american' | 'australian'
}

export interface MonsoonData {
  id: string
  name: string
  lat: number
  lng: number
  precipitation: number
  windSpeed: number
  humidity: number
  cloudCover: number
  onsetDate: string
  status: 'pre_onset' | 'onset' | 'active' | 'break' | 'withdrawal'
  description: string
}

// Task 69: New monitoring interfaces
export interface LavaFlowState {
  flows: LavaFlowData[]
  activeFlowId: string | null
  showFlowArea: boolean
  showTemperature: boolean
  showVelocity: boolean
  showEffusionRate: boolean
  open: boolean
  typeFilter: 'all' | 'pahoehoe' | 'aa' | 'block' | 'pillow'
}

export interface LavaFlowData {
  id: string
  name: string
  lat: number
  lng: number
  flowArea: number
  temperature: number
  velocity: number
  effusionRate: number
  viscosity: number
  status: 'active' | 'creeping' | 'stalled' | 'cooling' | 'dormant'
  description: string
}

export interface TidalEnergyState {
  sites: TidalEnergyData[]
  activeSiteId: string | null
  showTidalRange: boolean
  showCurrentSpeed: boolean
  showPowerPotential: boolean
  showEnvironmentalImpact: boolean
  open: boolean
  typeFilter: 'all' | 'barrage' | 'stream' | 'lagoon' | 'dynamic'
}

export interface TidalEnergyData {
  id: string
  name: string
  lat: number
  lng: number
  tidalRange: number
  currentSpeed: number
  powerPotential: number
  environmentalImpact: number
  capacityFactor: number
  status: 'operational' | 'pilot' | 'planned' | 'potential' | 'unsuitable'
  description: string
}

export interface PeatFireState {
  fires: PeatFireData[]
  activeFireId: string | null
  showBurnArea: boolean
  showFireDepth: boolean
  showEmissionRate: boolean
  showSoilMoisture: boolean
  open: boolean
  typeFilter: 'all' | 'surface' | 'ground' | 'deep' | 'smoldering'
}

export interface PeatFireData {
  id: string
  name: string
  lat: number
  lng: number
  burnArea: number
  fireDepth: number
  emissionRate: number
  soilMoisture: number
  peatDepth: number
  status: 'active' | 'smoldering' | 'suppressed' | 'monitoring' | 'extinguished'
  description: string
}

export interface CoralSpawnState {
  reefs: CoralSpawnData[]
  activeReefId: string | null
  showSpawnIntensity: boolean
  showWaterTemp: boolean
  showLunarPhase: boolean
  showLarvalDispersion: boolean
  open: boolean
  regionFilter: 'all' | 'pacific' | 'atlantic' | 'indian' | 'red_sea'
}

export interface CoralSpawnData {
  id: string
  name: string
  lat: number
  lng: number
  spawnIntensity: number
  waterTemp: number
  lunarPhase: number
  larvalDispersion: number
  syncIndex: number
  status: 'peak_spawn' | 'spawning' | 'pre_spawn' | 'post_spawn' | 'failed'
  description: string
}

export interface GlacierCalvingState {
  glaciers: GlacierCalvingData[]
  activeGlacierId: string | null
  showCalvingRate: boolean
  showIceVelocity: boolean
  showIceThickness: boolean
  showSeismicActivity: boolean
  open: boolean
  typeFilter: 'all' | 'tidewater' | 'lake_terminating' | 'ice_shelf' | 'grounding_line'
}

export interface GlacierCalvingData {
  id: string
  name: string
  lat: number
  lng: number
  calvingRate: number
  iceVelocity: number
  iceThickness: number
  seismicActivity: number
  retreatRate: number
  status: 'advancing' | 'stable' | 'retreating' | 'rapid_retreat' | 'collapsing'
  description: string
}

export interface SoilCarbonState {
  sites: SoilCarbonData[]
  activeSiteId: string | null
  showCarbonStock: boolean
  showOrganicMatter: boolean
  showMicrobialActivity: boolean
  showSequestrationRate: boolean
  open: boolean
  typeFilter: 'all' | 'agricultural' | 'forest' | 'grassland' | 'wetland'
}

export interface SoilCarbonData {
  id: string
  name: string
  lat: number
  lng: number
  carbonStock: number
  organicMatter: number
  microbialActivity: number
  sequestrationRate: number
  bulkDensity: number
  status: 'high_sequestration' | 'stable' | 'depleting' | 'degraded' | 'critical'
  description: string
}

export interface UrbanTreeCanopyState {
  zones: UrbanTreeCanopyData[]
  activeZoneId: string | null
  showCanopyCoverage: boolean
  showTreeDensity: boolean
  showAirQualityBenefit: boolean
  showHeatReduction: boolean
  open: boolean
  typeFilter: 'all' | 'park' | 'street' | 'residential' | 'industrial'
}

export interface UrbanTreeCanopyData {
  id: string
  name: string
  lat: number
  lng: number
  canopyCoverage: number
  treeDensity: number
  airQualityBenefit: number
  heatReduction: number
  biodiversityIndex: number
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical'
  description: string
}

export interface GeomagneticPoleState {
  poles: GeomagneticPoleData[]
  activePoleId: string | null
  showDriftRate: boolean
  showFieldStrength: boolean
  showInclination: boolean
  showDeclination: boolean
  open: boolean
  poleFilter: 'all' | 'north' | 'south'
}

export interface GeomagneticPoleData {
  id: string
  name: string
  lat: number
  lng: number
  driftRate: number
  fieldStrength: number
  inclination: number
  declination: number
  historicalShift: number
  status: 'stable' | 'shifting' | 'accelerating' | 'excursion' | 'reversal'
  description: string
}

// Task 70: New monitoring interfaces
export interface HydrothermalVentState {
  vents: HydrothermalVentData[]
  activeVentId: string | null
  showTemperature: boolean
  showFlowRate: boolean
  showMineralDeposit: boolean
  showBiodiversity: boolean
  open: boolean
  typeFilter: 'all' | 'black_smoker' | 'white_smoker' | 'diffuse' | 'shallow'
}

export interface HydrothermalVentData {
  id: string
  name: string
  lat: number
  lng: number
  temperature: number
  flowRate: number
  mineralDeposit: number
  biodiversity: number
  depth: number
  status: 'active' | 'waning' | 'dormant' | 'eruptive' | 'extinct'
  description: string
}

export interface WatershedHealthState {
  basins: WatershedHealthData[]
  activeBasinId: string | null
  showWaterQuality: boolean
  showFlowRate: boolean
  showSedimentLoad: boolean
  showEcologicalHealth: boolean
  open: boolean
  typeFilter: 'all' | 'mountain' | 'plain' | 'coastal' | 'urban'
}

export interface WatershedHealthData {
  id: string
  name: string
  lat: number
  lng: number
  waterQuality: number
  flowRate: number
  sedimentLoad: number
  ecologicalHealth: number
  drainageArea: number
  status: 'pristine' | 'good' | 'moderate' | 'degraded' | 'critical'
  description: string
}

export interface MigratoryFlywayState {
  flyways: MigratoryFlywayData[]
  activeFlywayId: string | null
  showPopulation: boolean
  showArrivalDate: boolean
  showThreatLevel: boolean
  showHabitatQuality: boolean
  open: boolean
  typeFilter: 'all' | 'land_bird' | 'waterfowl' | 'shorebird' | 'raptor'
}

export interface MigratoryFlywayData {
  id: string
  name: string
  lat: number
  lng: number
  population: number
  arrivalDate: string
  threatLevel: number
  habitatQuality: number
  migrationDistance: number
  status: 'peak' | 'active' | 'arriving' | 'departing' | 'declining'
  description: string
}

export interface SeagrassMeadowState {
  meadows: SeagrassMeadowData[]
  activeMeadowId: string | null
  showCoverage: boolean
  showCarbonStock: boolean
  showWaterClarity: boolean
  showHealthStatus: boolean
  open: boolean
  speciesFilter: 'all' | 'posidonia' | 'zostera' | 'thalassia' | 'cymodocea'
}

export interface SeagrassMeadowData {
  id: string
  name: string
  lat: number
  lng: number
  coverage: number
  carbonStock: number
  waterClarity: number
  shootDensity: number
  depthRange: number
  status: 'excellent' | 'good' | 'moderate' | 'declining' | 'critical'
  description: string
}

export interface UrbanHeatIslandDetailState {
  zones: UrbanHeatIslandDetailData[]
  activeZoneId: string | null
  showTemperatureDelta: boolean
  showVegetationCover: boolean
  showAlbedo: boolean
  showVulnerability: boolean
  open: boolean
  zoneFilter: 'all' | 'downtown' | 'industrial' | 'residential' | 'suburban'
}

export interface UrbanHeatIslandDetailData {
  id: string
  name: string
  lat: number
  lng: number
  temperatureDelta: number
  vegetationCover: number
  albedo: number
  vulnerability: number
  populationDensity: number
  status: 'severe' | 'high' | 'moderate' | 'low' | 'minimal'
  description: string
}

export interface OceanAcidificationDetailState {
  stations: OceanAcidificationDetailData[]
  activeStationId: string | null
  showPH: boolean
  showAragonite: boolean
  showPCO2: boolean
  showSaturationState: boolean
  open: boolean
  regionFilter: 'all' | 'pacific' | 'atlantic' | 'arctic' | 'coastal'
}

export interface OceanAcidificationDetailData {
  id: string
  name: string
  lat: number
  lng: number
  ph: number
  aragonite: number
  pco2: number
  saturationState: number
  shellGrowthRate: number
  status: 'critical' | 'severe' | 'elevated' | 'moderate' | 'normal'
  description: string
}

export interface DesertificationDetailState {
  regions: DesertificationDetailData[]
  activeRegionId: string | null
  showVegetationIndex: boolean
  showSoilMoisture: boolean
  showWindErosion: boolean
  showDroughtIndex: boolean
  open: boolean
  severityFilter: 'all' | 'slight' | 'moderate' | 'severe' | 'very_severe'
}

export interface DesertificationDetailData {
  id: string
  name: string
  lat: number
  lng: number
  vegetationIndex: number
  soilMoisture: number
  windErosion: number
  droughtIndex: number
  landDegradation: number
  status: 'slight' | 'moderate' | 'severe' | 'very_severe' | 'extreme'
  description: string
}

export interface VolcanicGasTrackerState {
  volcanoes: VolcanicGasTrackerData[]
  activeVolcanoId: string | null
  showSO2: boolean
  showCO2: boolean
  showH2S: boolean
  showPlumeHeight: boolean
  open: boolean
  gasFilter: 'all' | 'so2_dominated' | 'co2_dominated' | 'h2s_dominated' | 'mixed'
}

export interface VolcanicGasTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  so2: number
  co2: number
  h2s: number
  plumeHeight: number
  hazardLevel: number
  status: 'normal' | 'elevated' | 'high' | 'critical' | 'eruptive'
  description: string
}

// Task 71: New monitoring interfaces

export interface DeepOceanCurrentState {
  currents: DeepOceanCurrentData[]
  activeCurrentId: string | null
  showTemperature: boolean
  showSalinity: boolean
  showVelocity: boolean
  showVolume: boolean
  open: boolean
  typeFilter: 'all' | 'thermohaline' | 'wind_driven' | 'tidal' | 'boundary'
}

export interface DeepOceanCurrentData {
  id: string
  name: string
  lat: number
  lng: number
  temperature: number
  salinity: number
  velocity: number
  volume: number
  depth: number
  status: 'strong' | 'moderate' | 'weakening' | 'slowing' | 'collapsed'
  description: string
}

export interface StratosphericOzoneState {
  regions: StratosphericOzoneData[]
  activeRegionId: string | null
  showOzoneColumn: boolean
  showUVIndex: boolean
  showTemperature: boolean
  showTrend: boolean
  open: boolean
  regionFilter: 'all' | 'polar' | 'mid_latitude' | 'tropical' | 'subpolar'
}

export interface StratosphericOzoneData {
  id: string
  name: string
  lat: number
  lng: number
  ozoneColumn: number
  uvIndex: number
  temperature: number
  trend: number
  chlorofluorocarbon: number
  status: 'recovering' | 'stable' | 'declining' | 'severe' | 'critical'
  description: string
}

export interface SeismicHarmonicState {
  stations: SeismicHarmonicData[]
  activeStationId: string | null
  showAmplitude: boolean
  showFrequency: boolean
  showDuration: boolean
  showDepth: boolean
  open: boolean
  typeFilter: 'all' | 'volcanic' | 'tectonic' | 'hydrothermal' | 'induced'
}

export interface SeismicHarmonicData {
  id: string
  name: string
  lat: number
  lng: number
  amplitude: number
  frequency: number
  duration: number
  depth: number
  eventCount: number
  status: 'quiet' | 'low' | 'elevated' | 'harmonic' | 'eruptive'
  description: string
}

export interface WildfireSmokeState {
  plumes: WildfireSmokeData[]
  activePlumeId: string | null
  showAOD: boolean
  showPM25: boolean
  showPlumeHeight: boolean
  showDispersion: boolean
  open: boolean
  severityFilter: 'all' | 'clear' | 'light' | 'moderate' | 'heavy' | 'hazardous'
}

export interface WildfireSmokeData {
  id: string
  name: string
  lat: number
  lng: number
  aod: number
  pm25: number
  plumeHeight: number
  dispersion: number
  fireArea: number
  status: 'clear' | 'light' | 'moderate' | 'heavy' | 'hazardous'
  description: string
}

export interface EstuaryHealthState {
  estuaries: EstuaryHealthData[]
  activeEstuaryId: string | null
  showWaterQuality: boolean
  showBiodiversity: boolean
  showSediment: boolean
  showNutrientLoad: boolean
  open: boolean
  typeFilter: 'all' | 'drowned_valley' | 'bar_built' | 'tectonic' | 'fjord'
}

export interface EstuaryHealthData {
  id: string
  name: string
  lat: number
  lng: number
  waterQuality: number
  biodiversity: number
  sediment: number
  nutrientLoad: number
  tidalRange: number
  status: 'pristine' | 'good' | 'moderate' | 'degraded' | 'critical'
  description: string
}

export interface AlpineGlacierState {
  glaciers: AlpineGlacierData[]
  activeGlacierId: string | null
  showMassBalance: boolean
  showVelocity: boolean
  showArea: boolean
  showLength: boolean
  open: boolean
  typeFilter: 'all' | 'valley' | 'cirque' | 'hanging' | 'piedmont'
}

export interface AlpineGlacierData {
  id: string
  name: string
  lat: number
  lng: number
  massBalance: number
  velocity: number
  area: number
  length: number
  elevation: number
  status: 'advancing' | 'stable' | 'retreating' | 'rapid_retreat' | 'gone'
  description: string
}

export interface OceanAnoxicZoneState {
  zones: OceanAnoxicZoneData[]
  activeZoneId: string | null
  showOxygenLevel: boolean
  showNitrate: boolean
  showSulfide: boolean
  showThickness: boolean
  open: boolean
  severityFilter: 'all' | 'healthy' | 'mild_depletion' | 'moderate' | 'severe' | 'anoxic'
}

export interface OceanAnoxicZoneData {
  id: string
  name: string
  lat: number
  lng: number
  oxygenLevel: number
  nitrate: number
  sulfide: number
  thickness: number
  depth: number
  status: 'healthy' | 'mild_depletion' | 'moderate' | 'severe' | 'anoxic'
  description: string
}

export interface PermafrostCarbonFeedbackState {
  sites: PermafrostCarbonFeedbackData[]
  activeSiteId: string | null
  showThawDepth: boolean
  showCarbonStock: boolean
  showMethaneRelease: boolean
  showTemperature: boolean
  open: boolean
  severityFilter: 'all' | 'frozen' | 'thawing' | 'active_thaw' | 'accelerating' | 'runaway'
}

export interface PermafrostCarbonFeedbackData {
  id: string
  name: string
  lat: number
  lng: number
  thawDepth: number
  carbonStock: number
  methaneRelease: number
  temperature: number
  iceContent: number
  status: 'frozen' | 'thawing' | 'active_thaw' | 'accelerating' | 'runaway'
  description: string
}

// Task 72: New monitoring interfaces

export interface TropicalCycloneState {
  cyclones: TropicalCycloneData[]
  activeCycloneId: string | null
  showWindSpeed: boolean
  showPressure: boolean
  showRainfall: boolean
  showStormSurge: boolean
  open: boolean
  categoryFilter: 'all' | 'tropical_depression' | 'tropical_storm' | 'category_1_2' | 'category_3_5'
}

export interface TropicalCycloneData {
  id: string
  name: string
  lat: number
  lng: number
  windSpeed: number
  pressure: number
  rainfall: number
  stormSurge: number
  forwardSpeed: number
  status: 'forming' | 'strengthening' | 'peak' | 'weakening' | 'dissipating'
  description: string
}

export interface VolcanicDeformationState {
  volcanoes: VolcanicDeformationData[]
  activeVolcanoId: string | null
  showUplift: boolean
  showHorizontal: boolean
  showTilt: boolean
  showStrainRate: boolean
  open: boolean
  typeFilter: 'all' | 'inflation' | 'deflation' | 'complex' | 'stable'
}

export interface VolcanicDeformationData {
  id: string
  name: string
  lat: number
  lng: number
  uplift: number
  horizontal: number
  tilt: number
  strainRate: number
  magmaDepth: number
  status: 'inflating' | 'deflating' | 'complex' | 'stable' | 'erupting'
  description: string
}

export interface CoralReefBleachingDetailState {
  reefs: CoralReefBleachingDetailData[]
  activeReefId: string | null
  showBleachingPercent: boolean
  showSST: boolean
  showRecovery: boolean
  showStressLevel: boolean
  open: boolean
  severityFilter: 'all' | 'mild' | 'moderate' | 'severe' | 'extreme'
}

export interface CoralReefBleachingDetailData {
  id: string
  name: string
  lat: number
  lng: number
  bleachingPercent: number
  sst: number
  recovery: number
  stressLevel: number
  diversity: number
  status: 'healthy' | 'mild' | 'moderate' | 'severe' | 'extreme'
  description: string
}

export interface ArcticPermafrostLakesState {
  lakes: ArcticPermafrostLakesData[]
  activeLakeId: string | null
  showArea: boolean
  showDepth: boolean
  showThawRate: boolean
  showMethane: boolean
  open: boolean
  typeFilter: 'all' | 'thermokarst' | 'ice_wedge' | 'oriented' | 'drained'
}

export interface ArcticPermafrostLakesData {
  id: string
  name: string
  lat: number
  lng: number
  area: number
  depth: number
  thawRate: number
  methane: number
  iceContent: number
  status: 'stable' | 'expanding' | 'draining' | 'shrinking' | 'collapsed'
  description: string
}

export interface MethaneEmissionHotspotState {
  hotspots: MethaneEmissionHotspotData[]
  activeHotspotId: string | null
  showEmissionRate: boolean
  showConcentration: boolean
  showSource: boolean
  showTrend: boolean
  open: boolean
  sourceFilter: 'all' | 'wetland' | 'fossil_fuel' | 'agriculture' | 'landfill'
}

export interface MethaneEmissionHotspotData {
  id: string
  name: string
  lat: number
  lng: number
  emissionRate: number
  concentration: number
  source: number
  trend: number
  uncertainty: number
  status: 'low' | 'moderate' | 'elevated' | 'high' | 'critical'
  description: string
}

export interface CoastalUpwellingState {
  zones: CoastalUpwellingData[]
  activeZoneId: string | null
  showSST: boolean
  showNutrientLevel: boolean
  showProductivity: boolean
  showWindStress: boolean
  open: boolean
  typeFilter: 'all' | 'eastern_boundary' | 'equatorial' | 'coastal_jet' | 'wind_driven'
}

export interface CoastalUpwellingData {
  id: string
  name: string
  lat: number
  lng: number
  sst: number
  nutrientLevel: number
  productivity: number
  windStress: number
  chlorophyll: number
  status: 'strong' | 'moderate' | 'weak' | 'fading' | 'absent'
  description: string
}

export interface SpaceDebrisOrbitState {
  objects: SpaceDebrisOrbitData[]
  activeObjectId: string | null
  showAltitude: boolean
  showVelocity: boolean
  showCollisionRisk: boolean
  showDecayRate: boolean
  open: boolean
  typeFilter: 'all' | 'debris' | 'defunct_satellite' | 'rocket_body' | 'fragment'
}

export interface SpaceDebrisOrbitData {
  id: string
  name: string
  lat: number
  lng: number
  altitude: number
  velocity: number
  collisionRisk: number
  decayRate: number
  size: number
  status: 'stable' | 'drifting' | 'decaying' | 'high_risk' | 'reentry_imminent'
  description: string
}

export interface TectonicPlateBoundaryState {
  boundaries: TectonicPlateBoundaryData[]
  activeBoundaryId: string | null
  showVelocity: boolean
  showStress: boolean
  showSeismicity: boolean
  showSlipRate: boolean
  open: boolean
  typeFilter: 'all' | 'convergent' | 'divergent' | 'transform' | 'complex'
}

export interface TectonicPlateBoundaryData {
  id: string
  name: string
  lat: number
  lng: number
  velocity: number
  stress: number
  seismicity: number
  slipRate: number
  maxDepth: number
  status: 'locked' | 'creeping' | 'partial_lock' | 'tremor_swarm' | 'rupturing'
  description: string
}

// Task 73: New monitoring interfaces

export interface LandslideSusceptibilityState {
  zones: LandslideSusceptibilityData[]
  activeZoneId: string | null
  showSlopeAngle: boolean
  showSoilMoisture: boolean
  showVegetation: boolean
  showRainfall: boolean
  open: boolean
  riskFilter: 'all' | 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
}

export interface LandslideSusceptibilityData {
  id: string
  name: string
  lat: number
  lng: number
  slopeAngle: number
  soilMoisture: number
  vegetation: number
  rainfall: number
  population: number
  status: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  description: string
}

export interface SolarFlareActivityState {
  events: SolarFlareActivityData[]
  activeEventId: string | null
  showXRay: boolean
  showProton: boolean
  showRadio: boolean
  showCoronalMass: boolean
  open: boolean
  classFilter: 'all' | 'A_B' | 'C' | 'M' | 'X'
}

export interface SolarFlareActivityData {
  id: string
  name: string
  lat: number
  lng: number
  xRay: number
  proton: number
  radio: number
  coronalMass: number
  sunspotArea: number
  status: 'quiet' | 'minor' | 'moderate' | 'strong' | 'extreme'
  description: string
}

export interface RiverDeltaErosionState {
  deltas: RiverDeltaErosionData[]
  activeDeltaId: string | null
  showErosionRate: boolean
  showSedimentSupply: boolean
  showSeaLevel: boolean
  showLandLoss: boolean
  open: boolean
  severityFilter: 'all' | 'stable' | 'slow' | 'moderate' | 'rapid' | 'critical'
}

export interface RiverDeltaErosionData {
  id: string
  name: string
  lat: number
  lng: number
  erosionRate: number
  sedimentSupply: number
  seaLevel: number
  landLoss: number
  subsidence: number
  status: 'stable' | 'slow' | 'moderate' | 'rapid' | 'critical'
  description: string
}

export interface SeaIceThicknessState {
  regions: SeaIceThicknessData[]
  activeRegionId: string | null
  showThickness: boolean
  showConcentration: boolean
  showExtent: boolean
  showAge: boolean
  open: boolean
  typeFilter: 'all' | 'first_year' | 'multi_year' | 'fast_ice' | 'pack_ice'
}

export interface SeaIceThicknessData {
  id: string
  name: string
  lat: number
  lng: number
  thickness: number
  concentration: number
  extent: number
  age: number
  snowDepth: number
  status: 'growing' | 'stable' | 'thinning' | 'rapid_thinning' | 'gone'
  description: string
}

export interface UrbanAirQualityState {
  cities: UrbanAirQualityData[]
  activeCityId: string | null
  showAQI: boolean
  showPM25: boolean
  showNO2: boolean
  showO3: boolean
  open: boolean
  qualityFilter: 'all' | 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
}

export interface UrbanAirQualityData {
  id: string
  name: string
  lat: number
  lng: number
  aqi: number
  pm25: number
  no2: number
  o3: number
  so2: number
  status: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  description: string
}

export interface GeothermalEnergyState {
  plants: GeothermalEnergyData[]
  activePlantId: string | null
  showOutput: boolean
  showTemperature: boolean
  showFlowRate: boolean
  showEfficiency: boolean
  open: boolean
  typeFilter: 'all' | 'dry_steam' | 'flash' | 'binary' | 'enhanced'
}

export interface GeothermalEnergyData {
  id: string
  name: string
  lat: number
  lng: number
  output: number
  temperature: number
  flowRate: number
  efficiency: number
  reservoirDepth: number
  status: 'optimal' | 'good' | 'moderate' | 'declining' | 'depleted'
  description: string
}

export interface AquiferSalinizationState {
  aquifers: AquiferSalinizationData[]
  activeAquiferId: string | null
  showSalinity: boolean
  showChloride: boolean
  showWaterLevel: boolean
  showIntrusion: boolean
  open: boolean
  severityFilter: 'all' | 'fresh' | 'slight' | 'moderate' | 'severe' | 'hypersaline'
}

export interface AquiferSalinizationData {
  id: string
  name: string
  lat: number
  lng: number
  salinity: number
  chloride: number
  waterLevel: number
  intrusion: number
  depth: number
  status: 'fresh' | 'slight' | 'moderate' | 'severe' | 'hypersaline'
  description: string
}

export interface BiomassBurningState {
  regions: BiomassBurningData[]
  activeRegionId: string | null
  showFireCount: boolean
  showBurnedArea: boolean
  showEmissions: boolean
  showSmoke: boolean
  open: boolean
  typeFilter: 'all' | 'forest' | 'savanna' | 'agricultural' | 'peat'
}

export interface BiomassBurningData {
  id: string
  name: string
  lat: number
  lng: number
  fireCount: number
  burnedArea: number
  emissions: number
  smoke: number
  intensity: number
  status: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme'
  description: string
}

// Task 74: New monitoring interfaces

export interface GlacialLakeOutburstState {
  lakes: GlacialLakeOutburstData[]
  activeLakeId: string | null
  showWaterLevel: boolean
  showDamStability: boolean
  showFloodPotential: boolean
  showDownstreamRisk: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'very_high' | 'imminent'
}

export interface GlacialLakeOutburstData {
  id: string
  name: string
  lat: number
  lng: number
  waterLevel: number
  damStability: number
  floodPotential: number
  downstreamRisk: number
  lakeArea: number
  status: 'low' | 'moderate' | 'high' | 'very_high' | 'imminent'
  description: string
}

export interface OceanMicroplasticState {
  zones: OceanMicroplasticData[]
  activeZoneId: string | null
  showConcentration: boolean
  showParticleSize: boolean
  showDepth: boolean
  showAccumulation: boolean
  open: boolean
  typeFilter: 'all' | 'gyre' | 'coastal' | 'river_mouth' | 'deep_ocean'
}

export interface OceanMicroplasticData {
  id: string
  name: string
  lat: number
  lng: number
  concentration: number
  particleSize: number
  depth: number
  accumulation: number
  sourceDistance: number
  status: 'low' | 'moderate' | 'elevated' | 'high' | 'extreme'
  description: string
}

export interface VolcanicAshDispersionState {
  clouds: VolcanicAshDispersionData[]
  activeCloudId: string | null
  showAshColumn: boolean
  showDispersion: boolean
  showAviationRisk: boolean
  showFallout: boolean
  open: boolean
  severityFilter: 'all' | 'advisory' | 'warning' | 'critical' | 'catastrophic'
}

export interface VolcanicAshDispersionData {
  id: string
  name: string
  lat: number
  lng: number
  ashColumn: number
  dispersion: number
  aviationRisk: number
  fallout: number
  so2Mass: number
  status: 'advisory' | 'warning' | 'critical' | 'catastrophic'
  description: string
}

export interface DroughtSeverityState {
  regions: DroughtSeverityData[]
  activeRegionId: string | null
  showSPI: boolean
  showSoilMoisture: boolean
  showVegetation: boolean
  showWaterStress: boolean
  open: boolean
  severityFilter: 'all' | 'abnormally_dry' | 'moderate' | 'severe' | 'extreme' | 'exceptional'
}

export interface DroughtSeverityData {
  id: string
  name: string
  lat: number
  lng: number
  spi: number
  soilMoisture: number
  vegetation: number
  waterStress: number
  reservoirLevel: number
  status: 'abnormally_dry' | 'moderate' | 'severe' | 'extreme' | 'exceptional'
  description: string
}

export interface TsunamiWaveHeightState {
  events: TsunamiWaveHeightData[]
  activeEventId: string | null
  showWaveHeight: boolean
  showArrivalTime: boolean
  showInundation: boolean
  showCurrentSpeed: boolean
  open: boolean
  severityFilter: 'all' | 'advisory' | 'watch' | 'warning' | 'major'
}

export interface TsunamiWaveHeightData {
  id: string
  name: string
  lat: number
  lng: number
  waveHeight: number
  arrivalTime: number
  inundation: number
  currentSpeed: number
  magnitude: number
  status: 'advisory' | 'watch' | 'warning' | 'major'
  description: string
}

export interface CaveEcosystemState {
  caves: CaveEcosystemData[]
  activeCaveId: string | null
  showBiodiversity: boolean
  showTemperature: boolean
  showHumidity: boolean
  showWaterQuality: boolean
  open: boolean
  typeFilter: 'all' | 'limestone' | 'lava_tube' | 'ice' | 'sea'
}

export interface CaveEcosystemData {
  id: string
  name: string
  lat: number
  lng: number
  biodiversity: number
  temperature: number
  humidity: number
  waterQuality: number
  depth: number
  status: 'pristine' | 'good' | 'moderate' | 'degraded' | 'critical'
  description: string
}

export interface SolarIrradianceState {
  stations: SolarIrradianceData[]
  activeStationId: string | null
  showGHI: boolean
  showDNI: boolean
  showDHI: boolean
  showUVIndex: boolean
  open: boolean
  regionFilter: 'all' | 'desert' | 'tropical' | 'temperate' | 'polar'
}

export interface SolarIrradianceData {
  id: string
  name: string
  lat: number
  lng: number
  ghi: number
  dni: number
  dhi: number
  uvIndex: number
  cloudCover: number
  status: 'excellent' | 'good' | 'moderate' | 'low' | 'minimal'
  description: string
}

export interface PeatlandRestorationState {
  sites: PeatlandRestorationData[]
  activeSiteId: string | null
  showWaterTable: boolean
  showVegetation: boolean
  showCarbonStock: boolean
  showRestorationProgress: boolean
  open: boolean
  statusFilter: 'all' | 'pristine' | 'degraded' | 'restoring' | 'restored' | 'failed'
}

export interface PeatlandRestorationData {
  id: string
  name: string
  lat: number
  lng: number
  waterTable: number
  vegetation: number
  carbonStock: number
  restorationProgress: number
  area: number
  status: 'pristine' | 'degraded' | 'restoring' | 'restored' | 'failed'
  description: string
}

// Task 75: New monitoring interfaces

export interface MangroveCarbonState {
  forests: MangroveCarbonData[]
  activeForestId: string | null
  showCarbonStock: boolean
  showArea: boolean
  showDegradation: boolean
  showRestoration: boolean
  open: boolean
  speciesFilter: 'all' | 'rhizophora' | 'avicennia' | 'sonneratia' | 'mixed'
}

export interface MangroveCarbonData {
  id: string
  name: string
  lat: number
  lng: number
  carbonStock: number
  area: number
  degradation: number
  restoration: number
  biodiversity: number
  status: 'excellent' | 'good' | 'moderate' | 'degraded' | 'critical'
  description: string
}

export interface OceanHeatContentState {
  basins: OceanHeatContentData[]
  activeBasinId: string | null
  showHeatContent: boolean
  showTemperature: boolean
  showSalinity: boolean
  showTrend: boolean
  open: boolean
  depthFilter: 'all' | 'surface' | 'thermocline' | 'intermediate' | 'deep'
}

export interface OceanHeatContentData {
  id: string
  name: string
  lat: number
  lng: number
  heatContent: number
  temperature: number
  salinity: number
  trend: number
  stratification: number
  status: 'cooling' | 'stable' | 'warming' | 'rapid_warming' | 'extreme_warming'
  description: string
}

export interface DustStormTrackerState {
  storms: DustStormTrackerData[]
  activeStormId: string | null
  showAOD: boolean
  showWindSpeed: boolean
  showVisibility: boolean
  showPM10: boolean
  open: boolean
  severityFilter: 'all' | 'light' | 'moderate' | 'heavy' | 'severe' | 'catastrophic'
}

export interface DustStormTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  aod: number
  windSpeed: number
  visibility: number
  pm10: number
  duration: number
  status: 'light' | 'moderate' | 'heavy' | 'severe' | 'catastrophic'
  description: string
}

export interface CoralDiseaseMonitorState {
  reefs: CoralDiseaseMonitorData[]
  activeReefId: string | null
  showPrevalence: boolean
  showWhiteSyndrome: boolean
  showBlackBand: boolean
  showRecoveryRate: boolean
  open: boolean
  diseaseFilter: 'all' | 'white_syndrome' | 'black_band' | 'yellow_band' | 'tumor'
}

export interface CoralDiseaseMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  prevalence: number
  whiteSyndrome: number
  blackBand: number
  recoveryRate: number
  waterTemp: number
  status: 'healthy' | 'low' | 'moderate' | 'high' | 'epidemic'
  description: string
}

export interface IceShelfCollapseState {
  shelves: IceShelfCollapseData[]
  activeShelfId: string | null
  showArea: boolean
  showThickness: boolean
  showFracture: boolean
  showMeltRate: boolean
  open: boolean
  stabilityFilter: 'all' | 'stable' | 'weakening' | 'fracturing' | 'collapsing' | 'collapsed'
}

export interface IceShelfCollapseData {
  id: string
  name: string
  lat: number
  lng: number
  area: number
  thickness: number
  fracture: number
  meltRate: number
  buttressing: number
  status: 'stable' | 'weakening' | 'fracturing' | 'collapsing' | 'collapsed'
  description: string
}

export interface UrbanFloodRiskState {
  zones: UrbanFloodRiskData[]
  activeZoneId: string | null
  showImpervious: boolean
  showDrainage: boolean
  showElevation: boolean
  showHistorical: boolean
  open: boolean
  riskFilter: 'all' | 'minimal' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface UrbanFloodRiskData {
  id: string
  name: string
  lat: number
  lng: number
  impervious: number
  drainage: number
  elevation: number
  historical: number
  population: number
  status: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme'
  description: string
}

export interface PhytoplanktonBloomState {
  blooms: PhytoplanktonBloomData[]
  activeBloomId: string | null
  showChlorophyll: boolean
  showToxicity: boolean
  showExtent: boolean
  showDuration: boolean
  open: boolean
  speciesFilter: 'all' | 'karenia' | 'alexandrium' | 'pseudo_nitzschia' | 'microcystis'
}

export interface PhytoplanktonBloomData {
  id: string
  name: string
  lat: number
  lng: number
  chlorophyll: number
  toxicity: number
  extent: number
  duration: number
  species: number
  status: 'background' | 'bloom' | 'dense_bloom' | 'harmful' | 'severe_hab'
  description: string
}

export interface SubmarineCanyonState {
  canyons: SubmarineCanyonData[]
  activeCanyonId: string | null
  showDepth: boolean
  showCurrentSpeed: boolean
  showSediment: boolean
  showBiodiversity: boolean
  open: boolean
  typeFilter: 'all' | 'river_originated' | 'shelf_incised' | 'slope' | 'blind'
}

export interface SubmarineCanyonData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  currentSpeed: number
  sediment: number
  biodiversity: number
  length: number
  status: 'active' | 'moderate' | 'quiet' | 'dormant' | 'buried'
  description: string
}

// Task 76: New monitoring interfaces

export interface KelpForestMonitorState {
  forests: KelpForestMonitorData[]
  activeForestId: string | null
  showCoverage: boolean
  showBiomass: boolean
  showWaterTemp: boolean
  showBiodiversity: boolean
  open: boolean
  speciesFilter: 'all' | 'macrocystis' | 'laminaria' | 'ecklonia' | 'saccharina'
}

export interface KelpForestMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  coverage: number
  biomass: number
  waterTemp: number
  biodiversity: number
  depth: number
  status: 'thriving' | 'stable' | 'declining' | 'severely_declining' | 'collapsed'
  description: string
}

export interface VolcanicIslandFormationState {
  islands: VolcanicIslandFormationData[]
  activeIslandId: string | null
  showElevation: boolean
  showEruptionRate: boolean
  showArea: boolean
  showSubsidence: boolean
  open: boolean
  stageFilter: 'all' | 'emerging' | 'growing' | 'mature' | 'eroding' | 'submerged'
}

export interface VolcanicIslandFormationData {
  id: string
  name: string
  lat: number
  lng: number
  elevation: number
  eruptionRate: number
  area: number
  subsidence: number
  age: number
  status: 'emerging' | 'growing' | 'mature' | 'eroding' | 'submerged'
  description: string
}

export interface SaltwaterIntrusionState {
  zones: SaltwaterIntrusionData[]
  activeZoneId: string | null
  showChloride: boolean
  showConductivity: boolean
  showWaterTable: boolean
  showIntrusionRate: boolean
  open: boolean
  severityFilter: 'all' | 'fresh' | 'slight' | 'moderate' | 'severe' | 'extreme'
}

export interface SaltwaterIntrusionData {
  id: string
  name: string
  lat: number
  lng: number
  chloride: number
  conductivity: number
  waterTable: number
  intrusionRate: number
  pumpingRate: number
  status: 'fresh' | 'slight' | 'moderate' | 'severe' | 'extreme'
  description: string
}

export interface ArcticShippingRouteState {
  routes: ArcticShippingRouteData[]
  activeRouteId: string | null
  showIceThickness: boolean
  showNavigability: boolean
  showTransitTime: boolean
  showTraffic: boolean
  open: boolean
  routeFilter: 'all' | 'northern_sea' | 'northwest_passage' | 'transpolar' | 'coastal'
}

export interface ArcticShippingRouteData {
  id: string
  name: string
  lat: number
  lng: number
  iceThickness: number
  navigability: number
  transitTime: number
  traffic: number
  iceFreeDays: number
  status: 'closed' | 'restricted' | 'partial' | 'open' | 'increasing'
  description: string
}

export interface ThermoclineDepthState {
  stations: ThermoclineDepthData[]
  activeStationId: string | null
  showDepth: boolean
  showGradient: boolean
  showSST: boolean
  showTrend: boolean
  open: boolean
  regionFilter: 'all' | 'tropical' | 'subtropical' | 'temperate' | 'polar'
}

export interface ThermoclineDepthData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  gradient: number
  sst: number
  trend: number
  stratification: number
  status: 'deepening' | 'stable' | 'shallowing' | 'rapid_shallowing' | 'eroded'
  description: string
}

export interface BioluminescentBayState {
  bays: BioluminescentBayData[]
  activeBayId: string | null
  showBrightness: boolean
  showDinoflagellate: boolean
  showWaterQuality: boolean
  showTourism: boolean
  open: boolean
  qualityFilter: 'all' | 'spectacular' | 'excellent' | 'good' | 'fading' | 'lost'
}

export interface BioluminescentBayData {
  id: string
  name: string
  lat: number
  lng: number
  brightness: number
  dinoflagellate: number
  waterQuality: number
  tourism: number
  area: number
  status: 'spectacular' | 'excellent' | 'good' | 'fading' | 'lost'
  description: string
}

export interface OrographicRainfallState {
  regions: OrographicRainfallData[]
  activeRegionId: string | null
  showRainfall: boolean
  showElevation: boolean
  showWindSpeed: boolean
  showRunoff: boolean
  open: boolean
  typeFilter: 'all' | 'windward' | 'leeward' | 'valley' | 'peak'
}

export interface OrographicRainfallData {
  id: string
  name: string
  lat: number
  lng: number
  rainfall: number
  elevation: number
  windSpeed: number
  runoff: number
  landslideRisk: number
  status: 'light' | 'moderate' | 'heavy' | 'extreme' | 'catastrophic'
  description: string
}

export interface HydrothermalPlumeState {
  vents: HydrothermalPlumeData[]
  activeVentId: string | null
  showPlumeHeight: boolean
  showTemperature: boolean
  showChemical: boolean
  showDispersion: boolean
  open: boolean
  typeFilter: 'all' | 'black_smoker' | 'white_smoker' | 'diffuse' | 'megaplume'
}

export interface HydrothermalPlumeData {
  id: string
  name: string
  lat: number
  lng: number
  plumeHeight: number
  temperature: number
  chemical: number
  dispersion: number
  particleDensity: number
  status: 'dormant' | 'low' | 'moderate' | 'active' | 'eruptive'
  description: string
}

// Task 77: New monitoring interfaces

export interface SeamountEcosystemState {
  seamounts: SeamountEcosystemData[]
  activeSeamountId: string | null
  showElevation: boolean
  showBiodiversity: boolean
  showCurrentSpeed: boolean
  showFishingPressure: boolean
  open: boolean
  typeFilter: 'all' | 'guyot' | 'conical' | 'rift_zone' | 'caldera'
}

export interface SeamountEcosystemData {
  id: string
  name: string
  lat: number
  lng: number
  elevation: number
  biodiversity: number
  currentSpeed: number
  fishingPressure: number
  depth: number
  status: 'pristine' | 'good' | 'moderate' | 'degraded' | 'heavily_fished'
  description: string
}

export interface GroundSubsidenceState {
  zones: GroundSubsidenceData[]
  activeZoneId: string | null
  showSubsidenceRate: boolean
  showGroundwater: boolean
  showInfrastructure: boolean
  showRisk: boolean
  open: boolean
  causeFilter: 'all' | 'groundwater_extraction' | 'mining' | 'oil_gas' | 'natural'
}

export interface GroundSubsidenceData {
  id: string
  name: string
  lat: number
  lng: number
  subsidenceRate: number
  groundwater: number
  infrastructure: number
  risk: number
  totalSubsidence: number
  status: 'stable' | 'slow' | 'moderate' | 'rapid' | 'catastrophic'
  description: string
}

export interface OceanStratificationState {
  basins: OceanStratificationData[]
  activeBasinId: string | null
  showPycnocline: boolean
  showTemperature: boolean
  showSalinity: boolean
  showMixing: boolean
  open: boolean
  regionFilter: 'all' | 'tropical' | 'subtropical' | 'temperate' | 'high_latitude'
}

export interface OceanStratificationData {
  id: string
  name: string
  lat: number
  lng: number
  pycnocline: number
  temperature: number
  salinity: number
  mixing: number
  oxygen: number
  status: 'weak' | 'moderate' | 'strong' | 'very_strong' | 'extreme'
  description: string
}

export interface SnowCoverExtentState {
  regions: SnowCoverExtentData[]
  activeRegionId: string | null
  showExtent: boolean
  showDepth: boolean
  showWaterEquivalent: boolean
  showMeltRate: boolean
  open: boolean
  seasonFilter: 'all' | 'early_winter' | 'mid_winter' | 'late_winter' | 'spring_melt'
}

export interface SnowCoverExtentData {
  id: string
  name: string
  lat: number
  lng: number
  extent: number
  depth: number
  waterEquivalent: number
  meltRate: number
  albedo: number
  status: 'expanding' | 'stable' | 'declining' | 'rapid_decline' | 'minimal'
  description: string
}

export interface CoastalErosionDetailState {
  segments: CoastalErosionDetailData[]
  activeSegmentId: string | null
  showErosionRate: boolean
  showSeaLevel: boolean
  showSediment: boolean
  showProtection: boolean
  open: boolean
  severityFilter: 'all' | 'accretion' | 'stable' | 'slow_erosion' | 'rapid_erosion' | 'critical'
}

export interface CoastalErosionDetailData {
  id: string
  name: string
  lat: number
  lng: number
  erosionRate: number
  seaLevel: number
  sediment: number
  protection: number
  population: number
  status: 'accretion' | 'stable' | 'slow_erosion' | 'rapid_erosion' | 'critical'
  description: string
}

export interface EcosystemServiceValueState {
  ecosystems: EcosystemServiceValueData[]
  activeEcosystemId: string | null
  showCarbonValue: boolean
  showWaterValue: boolean
  showBiodiversityValue: boolean
  showRecreationValue: boolean
  open: boolean
  typeFilter: 'all' | 'forest' | 'wetland' | 'coral_reef' | 'grassland'
}

export interface EcosystemServiceValueData {
  id: string
  name: string
  lat: number
  lng: number
  carbonValue: number
  waterValue: number
  biodiversityValue: number
  recreationValue: number
  totalValue: number
  status: 'intact' | 'good' | 'degraded' | 'heavily_degraded' | 'lost'
  description: string
}

export interface TidalFlatMonitorState {
  flats: TidalFlatMonitorData[]
  activeFlatId: string | null
  showArea: boolean
  showBiodiversity: boolean
  showSedimentQuality: boolean
  showBirdPopulation: boolean
  open: boolean
  typeFilter: 'all' | 'mudflat' | 'sandflat' | 'salt_marsh' | 'seagrass'
}

export interface TidalFlatMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  area: number
  biodiversity: number
  sedimentQuality: number
  birdPopulation: number
  tidalRange: number
  status: 'expanding' | 'stable' | 'shrinking' | 'rapid_loss' | 'critical'
  description: string
}

export interface WildfireRiskAssessmentState {
  zones: WildfireRiskAssessmentData[]
  activeZoneId: string | null
  showFireWeather: boolean
  showFuelLoad: boolean
  showTerrain: boolean
  showExposure: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'
}

export interface WildfireRiskAssessmentData {
  id: string
  name: string
  lat: number
  lng: number
  fireWeather: number
  fuelLoad: number
  terrain: number
  exposure: number
  population: number
  status: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'
  description: string
}

export interface KarstSinkholeState {
  sinkholes: KarstSinkholeData[]
  activeSinkholeId: string | null
  showDepth: boolean
  showRisk: boolean
  showSubsidence: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

export interface KarstSinkholeData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  diameter: number
  subsidenceRate: number
  waterTableDepth: number
  risk: 'low' | 'moderate' | 'high' | 'critical'
  description: string
}

export interface VolcanicSO2State {
  sources: VolcanicSO2Data[]
  activeSourceId: string | null
  showConcentration: boolean
  showPlume: boolean
  showAlerts: boolean
  open: boolean
  alertFilter: 'all' | 'low' | 'moderate' | 'high' | 'severe'
}

export interface VolcanicSO2Data {
  id: string
  name: string
  lat: number
  lng: number
  so2Concentration: number
  plumeHeight: number
  emissionRate: number
  alertLevel: 'low' | 'moderate' | 'high' | 'severe'
  description: string
}

export interface IcebergTrackerState {
  icebergs: IcebergTrackerData[]
  activeIcebergId: string | null
  showTrajectory: boolean
  showSize: boolean
  showDrift: boolean
  open: boolean
  sizeFilter: 'all' | 'small' | 'medium' | 'large' | 'giant'
}

export interface IcebergTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  length: number
  width: number
  driftSpeed: number
  thickness: number
  size: 'small' | 'medium' | 'large' | 'giant'
  description: string
}

export interface CaveMineralState {
  formations: CaveMineralData[]
  activeFormationId: string | null
  showMineralType: boolean
  showAge: boolean
  showPurity: boolean
  open: boolean
  typeFilter: 'all' | 'stalactite' | 'stalagmite' | 'flowstone' | 'crystal'
}

export interface CaveMineralData {
  id: string
  name: string
  lat: number
  lng: number
  mineralType: 'stalactite' | 'stalagmite' | 'flowstone' | 'crystal'
  growthRate: number
  age: number
  purity: number
  description: string
}

export interface SeafloorHydrateState {
  deposits: SeafloorHydrateData[]
  activeDepositId: string | null
  showVolume: boolean
  showStability: boolean
  showDepth: boolean
  open: boolean
  stabilityFilter: 'all' | 'stable' | 'unstable' | 'dissociating' | 'critical'
}

export interface SeafloorHydrateData {
  id: string
  name: string
  lat: number
  lng: number
  volume: number
  stability: 'stable' | 'unstable' | 'dissociating' | 'critical'
  seafloorDepth: number
  temperature: number
  description: string
}

export interface MangroveLossState {
  regions: MangroveLossData[]
  activeRegionId: string | null
  showLossRate: boolean
  showRecovery: boolean
  showBiodiversity: boolean
  open: boolean
  lossFilter: 'all' | 'stable' | 'declining' | 'rapid_loss' | 'critical'
}

export interface MangroveLossData {
  id: string
  name: string
  lat: number
  lng: number
  lossRate: number
  recoveryRate: number
  biodiversityIndex: number
  area: number
  status: 'stable' | 'declining' | 'rapid_loss' | 'critical'
  description: string
}

export interface UrbanNoiseCorridorState {
  corridors: UrbanNoiseCorridorData[]
  activeCorridorId: string | null
  showLevel: boolean
  showSources: boolean
  showHealthImpact: boolean
  open: boolean
  levelFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface UrbanNoiseCorridorData {
  id: string
  name: string
  lat: number
  lng: number
  noiseLevel: number
  population: number
  healthImpact: number
  sourceType: 'traffic' | 'industrial' | 'aircraft' | 'railway'
  level: 'low' | 'moderate' | 'high' | 'extreme'
  description: string
}

export interface StratosphericWarmingState {
  events: StratosphericWarmingData[]
  activeEventId: string | null
  showTemperature: boolean
  showWindReversal: boolean
  showImpact: boolean
  open: boolean
  intensityFilter: 'all' | 'minor' | 'moderate' | 'major' | 'extreme'
}

export interface StratosphericWarmingData {
  id: string
  name: string
  lat: number
  lng: number
  temperatureRise: number
  windSpeed: number
  altitude: number
  surfaceImpact: number
  intensity: 'minor' | 'moderate' | 'major' | 'extreme'
  description: string
}

export interface SubmarineGroundwaterState {
  discharges: SubmarineGroundwaterData[]
  activeDischargeId: string | null
  showFlowRate: boolean
  showSalinity: boolean
  showNutrients: boolean
  open: boolean
  typeFilter: 'all' | 'coastal' | 'offshore' | 'volcanic' | 'karst'
}

export interface SubmarineGroundwaterData {
  id: string
  name: string
  lat: number
  lng: number
  flowRate: number
  salinity: number
  nutrientLoad: number
  dischargeType: 'coastal' | 'offshore' | 'volcanic' | 'karst'
  temperature: number
  description: string
}

export interface HydrothermalSulfideState {
  vents: HydrothermalSulfideData[]
  activeVentId: string | null
  showMineralContent: boolean
  showTemperature: boolean
  showActivity: boolean
  open: boolean
  activityFilter: 'all' | 'active' | 'dormant' | 'extinct' | 'pulsing'
}

export interface HydrothermalSulfideData {
  id: string
  name: string
  lat: number
  lng: number
  mineralContent: number
  temperature: number
  activity: 'active' | 'dormant' | 'extinct' | 'pulsing'
  sulfideDeposit: number
  depth: number
  description: string
}

export interface LunarTidalForceState {
  stations: LunarTidalForceData[]
  activeStationId: string | null
  showTidalRange: boolean
  showLunarPhase: boolean
  showCurrentSpeed: boolean
  open: boolean
  phaseFilter: 'all' | 'spring' | 'neap' | 'perigee' | 'apogee'
}

export interface LunarTidalForceData {
  id: string
  name: string
  lat: number
  lng: number
  tidalRange: number
  lunarPhase: 'spring' | 'neap' | 'perigee' | 'apogee'
  currentSpeed: number
  gravitationalPull: number
  description: string
}

export interface RipCurrentState {
  zones: RipCurrentData[]
  activeZoneId: string | null
  showRisk: boolean
  showSpeed: boolean
  showFrequency: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface RipCurrentData {
  id: string
  name: string
  lat: number
  lng: number
  risk: 'low' | 'moderate' | 'high' | 'extreme'
  speed: number
  frequency: number
  beachType: 'sandy' | 'rocky' | 'barred' | 'headland'
  description: string
}

export interface AvalancheDebrisFlowState {
  events: AvalancheDebrisFlowData[]
  activeEventId: string | null
  showVolume: boolean
  showVelocity: boolean
  showRunout: boolean
  open: boolean
  typeFilter: 'all' | 'snow_avalanche' | 'debris_flow' | 'rockfall' | 'mudslide'
}

export interface AvalancheDebrisFlowData {
  id: string
  name: string
  lat: number
  lng: number
  volume: number
  velocity: number
  runoutDistance: number
  eventType: 'snow_avalanche' | 'debris_flow' | 'rockfall' | 'mudslide'
  slope: number
  description: string
}

export interface CoastalAcidificationState {
  sites: CoastalAcidificationData[]
  activeSiteId: string | null
  showPH: boolean
  showCarbonDioxide: boolean
  showSaturation: boolean
  open: boolean
  severityFilter: 'all' | 'mild' | 'moderate' | 'severe' | 'extreme'
}

export interface CoastalAcidificationData {
  id: string
  name: string
  lat: number
  lng: number
  ph: number
  carbonDioxide: number
  aragoniteSaturation: number
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  shellfishImpact: number
  description: string
}

export interface DesertSandSeaState {
  regions: DesertSandSeaData[]
  activeRegionId: string | null
  showDuneHeight: boolean
  showMigration: boolean
  showArea: boolean
  open: boolean
  typeFilter: 'all' | 'barchan' | 'seif' | 'star' | 'transverse'
}

export interface DesertSandSeaData {
  id: string
  name: string
  lat: number
  lng: number
  duneHeight: number
  migrationRate: number
  area: number
  duneType: 'barchan' | 'seif' | 'star' | 'transverse'
  windDirection: string
  description: string
}

export interface SubsidenceHazardState {
  zones: SubsidenceHazardData[]
  activeZoneId: string | null
  showRate: boolean
  showRisk: boolean
  showInfrastructure: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

export interface SubsidenceHazardData {
  id: string
  name: string
  lat: number
  lng: number
  subsidenceRate: number
  totalSubsidence: number
  infrastructureRisk: number
  cause: 'groundwater' | 'mining' | 'oil_extraction' | 'natural_compaction'
  risk: 'low' | 'moderate' | 'high' | 'critical'
  description: string
}

export interface VolcanicLaharState {
  flows: VolcanicLaharData[]
  activeFlowId: string | null
  showVolume: boolean
  showVelocity: boolean
  showRisk: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface VolcanicLaharData {
  id: string
  name: string
  lat: number
  lng: number
  volume: number
  velocity: number
  reachDistance: number
  triggerType: 'rainfall' | 'glacial_melt' | 'pyroclastic' | 'dam_break'
  risk: 'low' | 'moderate' | 'high' | 'extreme'
  description: string
}

export interface DeepWaterCoralState {
  reefs: DeepWaterCoralData[]
  activeReefId: string | null
  showDepth: boolean
  showHealth: boolean
  showSpecies: boolean
  open: boolean
  healthFilter: 'all' | 'pristine' | 'good' | 'stressed' | 'degraded'
}

export interface DeepWaterCoralData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  healthIndex: number
  speciesCount: number
  status: 'pristine' | 'good' | 'stressed' | 'degraded'
  area: number
  description: string
}

export interface PolarBearHabitatState {
  regions: PolarBearHabitatData[]
  activeRegionId: string | null
  showIceCover: boolean
  showPopulation: boolean
  showMigration: boolean
  open: boolean
  statusFilter: 'all' | 'stable' | 'declining' | 'critical' | 'recovering'
}

export interface PolarBearHabitatData {
  id: string
  name: string
  lat: number
  lng: number
  iceCoverPercent: number
  population: number
  migrationDistance: number
  status: 'stable' | 'declining' | 'critical' | 'recovering'
  seaIceLoss: number
  description: string
}

export interface SoilSalinizationState {
  zones: SoilSalinizationData[]
  activeZoneId: string | null
  showSalinity: boolean
  showCropImpact: boolean
  showArea: boolean
  open: boolean
  severityFilter: 'all' | 'slight' | 'moderate' | 'severe' | 'very_severe'
}

export interface SoilSalinizationData {
  id: string
  name: string
  lat: number
  lng: number
  salinityLevel: number
  cropYieldLoss: number
  affectedArea: number
  severity: 'slight' | 'moderate' | 'severe' | 'very_severe'
  irrigationType: 'flood' | 'drip' | 'sprinkler' | 'rainfed'
  description: string
}

export interface TsunamiRunupState {
  sites: TsunamiRunupData[]
  activeSiteId: string | null
  showRunup: boolean
  showInundation: boolean
  showRisk: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface TsunamiRunupData {
  id: string
  name: string
  lat: number
  lng: number
  maxRunup: number
  inundationDistance: number
  recurrenceInterval: number
  risk: 'low' | 'moderate' | 'high' | 'extreme'
  lastEvent: string
  description: string
}

export interface UrbanHeatVentilationState {
  corridors: UrbanHeatVentilationData[]
  activeCorridorId: string | null
  showAirflow: boolean
  showTemperature: boolean
  showPollution: boolean
  open: boolean
  efficiencyFilter: 'all' | 'excellent' | 'good' | 'poor' | 'stagnant'
}

export interface UrbanHeatVentilationData {
  id: string
  name: string
  lat: number
  lng: number
  airflowRate: number
  temperatureReduction: number
  pollutionRemoval: number
  efficiency: 'excellent' | 'good' | 'poor' | 'stagnant'
  buildingHeight: number
  description: string
}

export interface BrinePoolState {
  pools: BrinePoolData[]
  activePoolId: string | null
  showSalinity: boolean
  showDepth: boolean
  showBiology: boolean
  open: boolean
  activityFilter: 'all' | 'active' | 'dormant' | 'fossil' | 'forming'
}

export interface BrinePoolData {
  id: string
  name: string
  lat: number
  lng: number
  salinity: number
  poolDepth: number
  biodiversityIndex: number
  activity: 'active' | 'dormant' | 'fossil' | 'forming'
  seafloorDepth: number
  description: string
}

export interface SupraglacialStreamState {
  streams: SupraglacialStreamData[]
  activeStreamId: string | null
  showFlowRate: boolean
  showTemperature: boolean
  showMeltRate: boolean
  open: boolean
  statusFilter: 'all' | 'flowing' | 'seasonal' | 'frozen' | 'draining'
}

export interface SupraglacialStreamData {
  id: string
  name: string
  lat: number
  lng: number
  flowRate: number
  waterTemperature: number
  meltRate: number
  status: 'flowing' | 'seasonal' | 'frozen' | 'draining'
  channelWidth: number
  description: string
}

export interface MethaneHydrateStabilityState {
  zones: MethaneHydrateStabilityData[]
  activeZoneId: string | null
  showStability: boolean
  showTemperature: boolean
  showPressure: boolean
  open: boolean
  stabilityFilter: 'all' | 'stable' | 'transitional' | 'unstable' | 'dissociating'
}

export interface MethaneHydrateStabilityData {
  id: string
  name: string
  lat: number
  lng: number
  stability: 'stable' | 'transitional' | 'unstable' | 'dissociating'
  temperature: number
  pressure: number
  depth: number
  methaneConcentration: number
  description: string
}

export interface VolcanicAshCloudState {
  clouds: VolcanicAshCloudData[]
  activeCloudId: string | null
  showAltitude: boolean
  showDispersion: boolean
  showConcentration: boolean
  open: boolean
  alertFilter: 'all' | 'advisory' | 'warning' | 'critical' | 'severe'
}

export interface VolcanicAshCloudData {
  id: string
  name: string
  lat: number
  lng: number
  altitude: number
  dispersionRadius: number
  concentration: number
  alertLevel: 'advisory' | 'warning' | 'critical' | 'severe'
  windDirection: string
  description: string
}

export interface GeothermalGradientState {
  sites: GeothermalGradientData[]
  activeSiteId: string | null
  showGradient: boolean
  showTemperature: boolean
  showFlow: boolean
  open: boolean
  potentialFilter: 'all' | 'low' | 'moderate' | 'high' | 'exceptional'
}

export interface GeothermalGradientData {
  id: string
  name: string
  lat: number
  lng: number
  gradient: number
  temperature: number
  flowRate: number
  potential: 'low' | 'moderate' | 'high' | 'exceptional'
  depth: number
  description: string
}

export interface OceanDeoxygenationState {
  zones: OceanDeoxygenationData[]
  activeZoneId: string | null
  showOxygen: boolean
  showArea: boolean
  showImpact: boolean
  open: boolean
  severityFilter: 'all' | 'mild' | 'moderate' | 'severe' | 'anoxic'
}

export interface OceanDeoxygenationData {
  id: string
  name: string
  lat: number
  lng: number
  oxygenLevel: number
  affectedArea: number
  marineImpact: number
  severity: 'mild' | 'moderate' | 'severe' | 'anoxic'
  depthRange: string
  description: string
}

export interface RockGlacierState {
  glaciers: RockGlacierData[]
  activeGlacierId: string | null
  showVelocity: boolean
  showTemperature: boolean
  showIceContent: boolean
  open: boolean
  activityFilter: 'all' | 'active' | 'transitional' | 'inactive' | 'relict'
}

export interface RockGlacierData {
  id: string
  name: string
  lat: number
  lng: number
  velocity: number
  temperature: number
  iceContent: number
  activity: 'active' | 'transitional' | 'inactive' | 'relict'
  area: number
  description: string
}

export interface DustHemisphereState {
  events: DustHemisphereData[]
  activeEventId: string | null
  showConcentration: boolean
  showTransport: boolean
  showDeposition: boolean
  open: boolean
  intensityFilter: 'all' | 'minor' | 'moderate' | 'major' | 'extreme'
}

export interface DustHemisphereData {
  id: string
  name: string
  lat: number
  lng: number
  concentration: number
  transportDistance: number
  depositionRate: number
  intensity: 'minor' | 'moderate' | 'major' | 'extreme'
  sourceRegion: string
  description: string
}

export interface MicroplasticOceanState {
  zones: MicroplasticOceanData[]
  activeZoneId: string | null
  showConcentration: boolean
  showSize: boolean
  showSourceType: boolean
  open: boolean
  densityFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
}

export interface MicroplasticOceanData {
  id: string
  name: string
  lat: number
  lng: number
  concentration: number
  avgSize: number
  sourceType: 'river_input' | 'coastal_runoff' | 'fishing_debris' | 'atmospheric'
  density: 'low' | 'moderate' | 'high' | 'extreme'
  depth: number
  description: string
}

export interface GlacierBasalSlideState {
  glaciers: GlacierBasalSlideData[]
  activeGlacierId: string | null
  showVelocity: boolean
  showBasalTemp: boolean
  showSlideRisk: boolean
  open: boolean
  riskFilter: 'all' | 'low' | 'moderate' | 'high' | 'critical'
}

export interface GlacierBasalSlideData {
  id: string
  name: string
  lat: number
  lng: number
  velocity: number
  basalTemperature: number
  slideRisk: number
  risk: 'low' | 'moderate' | 'high' | 'critical'
  iceThickness: number
  description: string
}

interface MapState {
  // Map view state
  center: [number, number]
  zoom: number
  currentStyle: MapStyleOption
  bearing: number
  pitch: number

  // UI state
  sidebarOpen: boolean
  sidebarTab: 'locations' | 'layers' | 'tools' | 'routes'
  searchQuery: string

  // Markers & locations
  markers: MapMarker[]
  savedLocations: SavedLocation[]
  selectedMarker: string | null

  // Geolocation
  geolocation: Geolocation | null

  // Layer visibility
  layerVisibility: LayerVisibility

  // Tools
  toolMode: ToolMode
  measurePoints: MeasurePoint[]
  measureDistance: number | null

  // Route drawing
  routePoints: RoutePoint[]
  currentRouteColor: string
  routes: MapRoute[]
  osrmDistance: number | null
  osrmDuration: number | null
  routeProfile: RouteProfile
  routeSteps: RouteStep[]
  highlightedStepIndex: number | null

  // Drawing / annotations
  drawings: MapDrawing[]
  currentDrawing: number[][] | null
  drawColor: string
  drawWidth: number
  isDrawing: boolean

  // Clustering
  clusteringEnabled: boolean

  // 3D Building extrusion
  buildingExtrusion: boolean

  // 3D Buildings Explorer
  buildings3DEnabled: boolean
  selectedBuilding: SelectedBuilding | null

  // Marker icon system
  markerIconPresets: MarkerIconPreset[]
  selectedMarkerIcon: string

  // 3D Terrain
  terrainEnabled: boolean

  // 3D Terrain exaggeration
  terrainExaggeration: number

  // Weather overlay
  weatherEnabled: boolean

  // Traffic overlay
  trafficEnabled: boolean

  // Earthquakes overlay
  earthquakesEnabled: boolean

  // Sun position & day/night overlay
  sunPositionEnabled: boolean

  // Isochrone visualization
  isochroneEnabled: boolean
  isochroneMinutes: number
  isochroneMode: 'walking' | 'cycling' | 'driving'

  // Area measurement
  areaPoints: MeasurePoint[]
  areaResult: number | null

  // POI Markers (temporary, for nearby search)
  poiMarkers: POIMarker[]

  // POI Filters
  poiFilters: POIFilters
  poiFilterPresets: POIFilterPreset[]

  // Heatmap visualization
  heatmapEnabled: boolean
  heatmapIntensity: number
  heatmapRadius: number

  // Map comparison / swipe view
  comparisonEnabled: boolean
  comparisonStyle: MapStyleOption

  // Bookmark folders
  bookmarkFolders: BookmarkFolder[]

  // Annotations
  annotations: MapAnnotation[]

  // Elevation route ID - which route to show elevation profile for
  elevationRouteId: string | null

  // Track recording
  isRecording: boolean
  currentTrack: TrackPoint[]
  savedTracks: TrackRecording[]
  recordingStats: {
    distance: number
    duration: number
    currentSpeed: number | null
    maxSpeed: number
    avgSpeed: number
    elevationGain: number
    elevationLoss: number
  }

  // Geofences
  geofences: Geofence[]

  // Offline mode
  offlineModeEnabled: boolean
  setOfflineModeEnabled: (enabled: boolean) => void

  // Voice navigation
  voiceNavigationEnabled: boolean
  setVoiceNavigationEnabled: (enabled: boolean) => void
  voiceLanguage: string
  setVoiceLanguage: (lang: string) => void
  voiceCurrentStepIndex: number
  setVoiceCurrentStepIndex: (index: number) => void

  // Enhanced drawing tools
  drawingTool: 'none' | 'point' | 'line' | 'polygon' | 'circle' | 'rectangle' | 'freehand'
  setDrawingTool: (tool: 'none' | 'point' | 'line' | 'polygon' | 'circle' | 'rectangle' | 'freehand') => void
  drawingColor: string
  setDrawingColor: (color: string) => void
  drawingLineWidth: number
  setDrawingLineWidth: (width: number) => void
  drawnFeatures: { id: string; type: string; coordinates: number[][] | number[][][]; color: string; lineWidth: number; name?: string }[]
  addDrawnFeature: (feature: { id: string; type: string; coordinates: number[][] | number[][][]; color: string; lineWidth: number; name?: string }) => void
  removeDrawnFeature: (id: string) => void
  clearDrawnFeatures: () => void

  // Custom tile sources
  customTileSources: CustomTileSource[]
  addCustomTileSource: (source: CustomTileSource) => void
  removeCustomTileSource: (id: string) => void
  toggleCustomTileSource: (id: string) => void

  // WMS/WMTS tile sources
  wmsTileSources: WMSTileSource[]
  addWMSTileSource: (source: WMSTileSource) => void
  removeWMSTileSource: (id: string) => void
  toggleWMSTileSourceVisibility: (id: string) => void
  updateWMSTileSourceOpacity: (id: string, opacity: number) => void

  // Track stats panel
  trackStatsPanelOpen: boolean
  setTrackStatsPanelOpen: (open: boolean) => void

  // Notifications
  notifications: MapNotification[]

  // Language
  language: AppLanguage
  setLanguage: (lang: AppLanguage) => void

  // App notifications (notification center)
  appNotifications: AppNotification[]
  addAppNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markAllNotificationsRead: () => void
  clearAppNotifications: () => void

  // Map snapshots
  snapshots: MapSnapshot[]
  saveSnapshot: (name: string) => void
  loadSnapshot: (id: string) => void
  deleteSnapshot: (id: string) => void

  // Actions
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setCurrentStyle: (style: MapStyleOption) => void
  setBearing: (bearing: number) => void
  setPitch: (pitch: number) => void
  setSidebarOpen: (open: boolean) => void
  setSidebarTab: (tab: 'locations' | 'layers' | 'tools' | 'routes') => void
  setSearchQuery: (query: string) => void
  addMarker: (marker: MapMarker) => void
  removeMarker: (id: string) => void
  setMarkers: (markers: MapMarker[]) => void
  setSavedLocations: (locations: SavedLocation[]) => void
  addSavedLocation: (location: SavedLocation) => void
  removeSavedLocation: (id: string) => void
  setSelectedMarker: (id: string | null) => void
  setGeolocation: (geo: Geolocation | null) => void
  setLayerVisibility: (layers: Partial<LayerVisibility>) => void
  setToolMode: (mode: ToolMode) => void
  addMeasurePoint: (point: MeasurePoint) => void
  clearMeasurePoints: () => void
  setMeasureDistance: (distance: number | null) => void
  addAreaPoint: (point: MeasurePoint) => void
  clearAreaPoints: () => void
  setAreaResult: (area: number | null) => void
  addRoutePoint: (point: RoutePoint) => void
  removeRoutePoint: (index: number) => void
  clearRoutePoints: () => void
  setCurrentRouteColor: (color: string) => void
  saveRoute: (name: string) => void
  setOsmrData: (distance: number | null, duration: number | null) => void
  deleteRoute: (id: string) => void
  setRoutes: (routes: MapRoute[]) => void
  setRouteProfile: (profile: RouteProfile) => void
  setRouteSteps: (steps: RouteStep[]) => void
  setHighlightedStepIndex: (index: number | null) => void
  insertRoutePoint: (index: number, point: RoutePoint) => void
  updateRoutePoint: (index: number, point: RoutePoint) => void
  setCurrentDrawing: (points: number[][] | null) => void
  addDrawingPoint: (point: number[]) => void
  finishDrawing: () => void
  setDrawColor: (color: string) => void
  setDrawWidth: (width: number) => void
  deleteDrawing: (id: string) => void
  setClusteringEnabled: (enabled: boolean) => void
  setBuildingExtrusion: (enabled: boolean) => void
  setBuildings3DEnabled: (enabled: boolean) => void
  setSelectedBuilding: (building: SelectedBuilding | null) => void
  setMarkerIconPresets: (presets: MarkerIconPreset[]) => void
  setSelectedMarkerIcon: (icon: string) => void
  setTerrainEnabled: (enabled: boolean) => void
  setTerrainExaggeration: (exaggeration: number) => void
  setWeatherEnabled: (enabled: boolean) => void
  setEarthquakesEnabled: (enabled: boolean) => void
  setSunPositionEnabled: (enabled: boolean) => void
  setTrafficEnabled: (enabled: boolean) => void
  setIsochroneEnabled: (enabled: boolean) => void
  setIsochroneMinutes: (minutes: number) => void
  setIsochroneMode: (mode: 'walking' | 'cycling' | 'driving') => void
  pushNotification: (notification: Omit<MapNotification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  setPoiMarkers: (poiMarkers: POIMarker[]) => void
  clearPoiMarkers: () => void
  setPOIFilters: (filters: Partial<POIFilters>) => void
  resetPOIFilters: () => void
  addPOIFilterPreset: (preset: POIFilterPreset) => void
  deletePOIFilterPreset: (id: string) => void
  loadPOIFilterPreset: (id: string) => void
  setHeatmapEnabled: (enabled: boolean) => void
  setHeatmapIntensity: (intensity: number) => void
  setHeatmapRadius: (radius: number) => void
  setComparisonEnabled: (enabled: boolean) => void
  setComparisonStyle: (style: MapStyleOption) => void
  addBookmarkFolder: (folder: BookmarkFolder) => void
  deleteBookmarkFolder: (id: string) => void
  renameBookmarkFolder: (id: string, name: string) => void
  updateBookmarkFolder: (id: string, updates: Partial<Omit<BookmarkFolder, 'id'>>) => void
  addLocationToFolder: (folderId: string, locationId: string) => void
  removeLocationFromFolder: (folderId: string, locationId: string) => void

  // Elevation route actions
  setElevationRouteId: (id: string | null) => void

  // Annotation actions
  addAnnotation: (annotation: MapAnnotation) => void
  updateAnnotation: (id: string, updates: Partial<Omit<MapAnnotation, 'id' | 'createdAt'>>) => void
  deleteAnnotation: (id: string) => void

  // Track recording actions
  startRecording: () => void
  stopRecording: () => void
  addTrackPoint: (point: TrackPoint) => void
  clearCurrentTrack: () => void
  saveCurrentTrack: (name: string) => void
  deleteTrack: (id: string) => void

  // Geofence actions
  addGeofence: (geofence: Geofence) => void
  removeGeofence: (id: string) => void
  updateGeofence: (id: string, updates: Partial<Geofence>) => void
  toggleGeofence: (id: string) => void

  // Multi-route comparison
  comparedRoutes: string[]
  addComparedRoute: (routeId: string) => void
  removeComparedRoute: (routeId: string) => void
  clearComparedRoutes: () => void

  // Accessibility settings
  highContrastMode: boolean
  largeTextMode: boolean
  reducedMotionMode: boolean
  screenReaderMode: boolean
  colorBlindMode: boolean
  setHighContrastMode: (enabled: boolean) => void
  setLargeTextMode: (enabled: boolean) => void
  setReducedMotionMode: (enabled: boolean) => void
  setScreenReaderMode: (enabled: boolean) => void
  setColorBlindMode: (enabled: boolean) => void

  // Map theme customization
  mapThemeOverrides: { water?: string; land?: string; roads?: string; buildings?: string; parks?: string; labels?: string }
  setMapThemeOverrides: (overrides: { water?: string; land?: string; roads?: string; buildings?: string; parks?: string; labels?: string }) => void
  mapThemePreset: string
  setMapThemePreset: (preset: string) => void

  // Accessibility panel visibility
  accessibilityPanelOpen: boolean
  setAccessibilityPanelOpen: (open: boolean) => void

  // Terrain analysis panel visibility
  terrainAnalysisRouteId: string | null
  setTerrainAnalysisRouteId: (id: string | null) => void

  // Image overlays
  imageOverlays: ImageOverlay[]
  addImageOverlay: (overlay: ImageOverlay) => void
  removeImageOverlay: (id: string) => void
  toggleImageOverlay: (id: string) => void
  updateImageOverlayOpacity: (id: string, opacity: number) => void

  // Spatial analysis
  spatialResults: SpatialAnalysisResult[]
  addSpatialResult: (result: SpatialAnalysisResult) => void
  clearSpatialResults: () => void
  removeSpatialResult: (id: string) => void

  // Collapsed sidebar sections
  collapsedSections: Record<string, boolean>
  toggleSection: (sectionId: string) => void

  // Map history / timeline
  mapHistory: { center: [number, number]; zoom: number; timestamp: number; style: string }[]
  addToHistory: () => void
  goToHistory: (index: number) => void
  clearHistory: () => void
  timelineOpen: boolean
  setTimelineOpen: (open: boolean) => void

  // Search history
  searchHistory: string[]
  addSearchHistory: (query: string) => void
  clearSearchHistory: () => void

  // Route optimization
  routeOptimized: boolean
  setRouteOptimized: (optimized: boolean) => void
  originalRoutePoints: RoutePoint[]
  setOriginalRoutePoints: (points: RoutePoint[]) => void

  // Analytics panel
  analyticsPanelOpen: boolean
  setAnalyticsPanelOpen: (open: boolean) => void

  // AQI panel
  aqiPanelOpen: boolean
  setAqiPanelOpen: (open: boolean) => void

  // Print dialog
  printDialogOpen: boolean
  setPrintDialogOpen: (open: boolean) => void

  // Location photos
  updateLocationPhotos: (locationId: string, photos: string[]) => void

  // Tool usage history
  toolUsageHistory: { tool: string; timestamp: number }[]
  addToolUsage: (tool: string) => void

  // Session start time
  sessionStartTime: number

  // Trip Planner
  tripPlans: TripPlan[]
  addTripPlan: (plan: TripPlan) => void
  deleteTripPlan: (id: string) => void
  updateTripPlan: (id: string, updates: Partial<Omit<TripPlan, 'id'>>) => void
  addTripStop: (planId: string, dayId: string, stop: TripStop) => void
  removeTripStop: (planId: string, dayId: string, stopId: string) => void
  reorderTripStops: (planId: string, dayId: string, stops: TripStop[]) => void
  updateTripStop: (planId: string, dayId: string, stopId: string, updates: Partial<Omit<TripStop, 'id'>>) => void
  addTripDay: (planId: string, day: TripDay) => void
  removeTripDay: (planId: string, dayId: string) => void

  // GPS Simulation
  gpsSimulation: GPSSimulationState
  setGpsSimulation: (state: Partial<GPSSimulationState>) => void
  resetGpsSimulation: () => void

  // Map Notes
  mapNotes: MapNote[]
  addMapNote: (note: MapNote) => void
  updateMapNote: (id: string, updates: Partial<Omit<MapNote, 'id' | 'createdAt'>>) => void
  deleteMapNote: (id: string) => void
  setMapNotes: (notes: MapNote[]) => void

  // Batch Operations
  batchOperation: BatchOperationState
  setBatchSelectMode: (enabled: boolean) => void
  toggleMarkerSelection: (id: string) => void
  selectAllMarkers: () => void
  deselectAllMarkers: () => void
  batchDeleteMarkers: () => void
  batchChangeCategory: (category: string, color: string) => void
  batchExportGeoJSON: () => string

  // Embed Map Dialog
  embedDialogOpen: boolean
  setEmbedDialogOpen: (open: boolean) => void

  // GeoJSON Editor
  geoJsonEditorOpen: boolean
  setGeoJsonEditorOpen: (open: boolean) => void
  customGeoJson: string | null
  setCustomGeoJson: (geojson: string | null) => void

  // Marker Categories
  markerCategories: MarkerCategory[]
  markerCategoriesOpen: boolean
  setMarkerCategoriesOpen: (open: boolean) => void
  addMarkerCategory: (category: Omit<MarkerCategory, 'id' | 'isDefault'>) => void
  updateMarkerCategory: (id: string, updates: Partial<Omit<MarkerCategory, 'id' | 'isDefault'>>) => void
  deleteMarkerCategory: (id: string) => void

  // Map Styles Mixer
  stylesMixerOpen: boolean
  setStylesMixerOpen: (open: boolean) => void
  styleMixLayers: StyleMixLayer[]
  addStyleMixLayer: (layer: StyleMixLayer) => void
  removeStyleMixLayer: (id: string) => void
  toggleStyleMixLayerVisibility: (id: string) => void
  updateStyleMixLayerOpacity: (id: string, opacity: number) => void
  clearStyleMixLayers: () => void

  // Route Waypoint Optimizer
  waypointOptimizerOpen: boolean
  setWaypointOptimizerOpen: (open: boolean) => void
  optimizedWaypointOrder: number[] | null
  setOptimizedWaypointOrder: (order: number[] | null) => void

  // Route Sharing
  routeSharingOpen: boolean
  setRouteSharingOpen: (open: boolean) => void

  // Route Playback
  routePlayback: RoutePlaybackState
  setRoutePlayback: (state: Partial<RoutePlaybackState>) => void
  routePlaybackOpen: boolean
  setRoutePlaybackOpen: (open: boolean) => void

  // Speed Alert System
  speedZones: SpeedZone[]
  addSpeedZone: (zone: SpeedZone) => void
  removeSpeedZone: (id: string) => void
  clearSpeedZones: () => void
  speedAlertLog: SpeedAlertEntry[]
  addSpeedAlert: (entry: Omit<SpeedAlertEntry, 'timestamp'>) => void
  speedAlertOpen: boolean
  setSpeedAlertOpen: (open: boolean) => void
  speedLimit: number
  setSpeedLimit: (limit: number) => void
  currentSpeed: number
  setCurrentSpeed: (speed: number) => void

  // Map Labels
  mapLabels: MapLabel[]
  addMapLabel: (label: MapLabel) => void
  updateMapLabel: (id: string, updates: Partial<Omit<MapLabel, 'id'>>) => void
  removeMapLabel: (id: string) => void
  clearMapLabels: () => void
  mapLabelsOpen: boolean
  setMapLabelsOpen: (open: boolean) => void

  // Contour Generator
  contourData: ContourData | null
  setContourData: (data: ContourData | null) => void
  clearContourData: () => void
  contourGeneratorOpen: boolean
  setContourGeneratorOpen: (open: boolean) => void

  // Location Clustering
  clusteringState: ClusteringState
  setClusteringState: (state: Partial<ClusteringState>) => void
  clusteringOpen: boolean
  setClusteringOpen: (open: boolean) => void

  // Map Story Creator
  mapStories: MapStory[]
  addMapStory: (story: MapStory) => void
  updateMapStory: (id: string, updates: Partial<Omit<MapStory, 'id'>>) => void
  removeMapStory: (id: string) => void
  activeStoryId: string | null
  setActiveStoryId: (id: string | null) => void
  storyPlayback: { isPlaying: boolean; currentStopIndex: number }
  setStoryPlayback: (playback: Partial<{ isPlaying: boolean; currentStopIndex: number }>) => void
  storyCreatorOpen: boolean
  setStoryCreatorOpen: (open: boolean) => void

  // Terrain Profile 3D
  terrainProfile3D: TerrainProfile3DState
  setTerrainProfile3D: (state: Partial<TerrainProfile3DState>) => void
  terrainProfile3DOpen: boolean
  setTerrainProfile3DOpen: (open: boolean) => void

  // Data Import/Export
  importExportState: ImportExportState
  setImportExportState: (state: Partial<ImportExportState>) => void
  importExportOpen: boolean
  setImportExportOpen: (open: boolean) => void

  // Advanced Marker Manager
  markerManagerState: MarkerManagerState
  setMarkerManagerState: (state: Partial<MarkerManagerState>) => void
  markerManagerOpen: boolean
  setMarkerManagerOpen: (open: boolean) => void

  // Geofence Alert History
  geofenceEvents: GeofenceEvent[]
  addGeofenceEvent: (event: Omit<GeofenceEvent, 'id'>) => void
  clearGeofenceEvents: () => void
  geofenceAlertOpen: boolean
  setGeofenceAlertOpen: (open: boolean) => void
  geofenceAlertsEnabled: boolean
  setGeofenceAlertsEnabled: (enabled: boolean) => void

  // Coordinate Grid Overlay
  coordinateGrid: CoordinateGridState
  setCoordinateGrid: (state: Partial<CoordinateGridState>) => void

  // Map Overlay Gallery
  mapOverlays: MapOverlay[]
  setMapOverlay: (id: string, updates: Partial<MapOverlay>) => void
  addMapOverlay: (overlay: MapOverlay) => void
  removeMapOverlay: (id: string) => void
  overlayGalleryOpen: boolean
  setOverlayGalleryOpen: (open: boolean) => void

  // Location Visit Timeline
  timelineEvents: TimelineEvent[]
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void
  visitTimelineOpen: boolean
  setVisitTimelineOpen: (open: boolean) => void

  // Weather Comparison
  weatherCompareLocations: WeatherComparisonLocation[]
  addWeatherCompareLocation: (location: WeatherComparisonLocation) => void
  removeWeatherCompareLocation: (locationId: string) => void
  clearWeatherCompareLocations: () => void
  weatherCompareOpen: boolean
  setWeatherCompareOpen: (open: boolean) => void

  // Measurement Suite
  measurementSuite: MeasurementSuiteState
  setMeasurementSuite: (state: Partial<MeasurementSuiteState>) => void
  addMeasurementResult: (result: MeasurementResult) => void
  clearMeasurementResults: () => void
  measurementSuiteOpen: boolean
  setMeasurementSuiteOpen: (open: boolean) => void

  // Trail Finder
  foundTrails: TrailInfo[]
  setFoundTrails: (trails: TrailInfo[]) => void
  trailFinderOpen: boolean
  setTrailFinderOpen: (open: boolean) => void
  selectedTrailId: string | null
  setSelectedTrailId: (id: string | null) => void

  // Screenshot Manager
  savedScreenshots: ScreenshotEntry[]
  addScreenshot: (screenshot: ScreenshotEntry) => void
  removeScreenshot: (id: string) => void
  clearScreenshots: () => void
  screenshotManagerOpen: boolean
  setScreenshotManagerOpen: (open: boolean) => void

  // Route Difficulty Analyzer
  difficultyAnalysis: DifficultyAnalysis | null
  setDifficultyAnalysis: (analysis: DifficultyAnalysis | null) => void
  difficultyAnalyzerOpen: boolean
  setDifficultyAnalyzerOpen: (open: boolean) => void

  // Pedometer
  pedometer: PedometerState
  setPedometer: (state: Partial<PedometerState>) => void
  pedometerVisible: boolean
  setPedometerVisible: (visible: boolean) => void

  // Usage Stats
  usageStats: UsageStats
  setUsageStats: (stats: Partial<UsageStats>) => void
  incrementStat: (key: keyof Pick<UsageStats, 'totalSearches' | 'totalLocationsAdded' | 'totalRoutesCreated' | 'totalMeasurements' | 'totalScreenshots' | 'totalStyleSwitches'>) => void
  usageStatsOpen: boolean
  setUsageStatsOpen: (open: boolean) => void

  // Map Collage Creator
  mapCollage: MapCollage | null
  setMapCollage: (collage: MapCollage | null) => void
  collageCreatorOpen: boolean
  setCollageCreatorOpen: (open: boolean) => void

  // Nearby Events Finder
  nearbyEvents: NearbyEvent[]
  setNearbyEvents: (events: NearbyEvent[]) => void
  eventsFinderOpen: boolean
  setEventsFinderOpen: (open: boolean) => void
  eventSearchRadius: number
  setEventSearchRadius: (radius: number) => void

  // Altitude Alert System
  altitudeState: AltitudeState
  setAltitudeState: (state: Partial<AltitudeState>) => void
  altitudeAlertOpen: boolean
  setAltitudeAlertOpen: (open: boolean) => void

  // Custom Compass Rose
  compassRose: CompassRoseState
  setCompassRose: (state: Partial<CompassRoseState>) => void

  // Multi-Stop Route Planner
  multiStopRoute: MultiStopRoute | null
  setMultiStopRoute: (route: MultiStopRoute | null) => void
  multiStopPlannerOpen: boolean
  setMultiStopPlannerOpen: (open: boolean) => void

  // Enhanced Weather Dashboard
  enhancedWeather: WeatherData
  setEnhancedWeather: (data: Partial<WeatherData>) => void
  enhancedWeatherOpen: boolean
  setEnhancedWeatherOpen: (open: boolean) => void
  temperatureUnit: 'celsius' | 'fahrenheit'
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void

  // Sun Shadow Calculator
  sunShadowState: SunShadowState
  setSunShadowState: (state: Partial<SunShadowState>) => void
  sunShadowOpen: boolean
  setSunShadowOpen: (open: boolean) => void

  // SVG Marker Designer
  svgMarkerDesigns: SVGMarkerDesign[]
  addSVGMarkerDesign: (design: SVGMarkerDesign) => void
  updateSVGMarkerDesign: (id: string, updates: Partial<Omit<SVGMarkerDesign, 'id'>>) => void
  removeSVGMarkerDesign: (id: string) => void
  activeMarkerDesign: string | null
  setActiveMarkerDesign: (id: string | null) => void
  markerDesignerOpen: boolean
  setMarkerDesignerOpen: (open: boolean) => void

  // Coordinate Share Card
  shareCardState: ShareCardState
  setShareCardState: (state: Partial<ShareCardState>) => void
  shareCardOpen: boolean
  setShareCardOpen: (open: boolean) => void

  // Map Wallpaper Generator
  wallpaperState: WallpaperState
  setWallpaperState: (state: Partial<WallpaperState>) => void
  wallpaperOpen: boolean
  setWallpaperOpen: (open: boolean) => void

  // Chat Assistant
  chatMessages: ChatMessage[]
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChatMessages: () => void
  chatOpen: boolean
  setChatOpen: (open: boolean) => void

  // POI Density Heatmap
  poiHeatmap: POIHeatmapState
  setPOIHeatmap: (state: Partial<POIHeatmapState>) => void

  // Map Animation Studio
  animationStudio: AnimationStudioState
  setAnimationStudio: (state: Partial<AnimationStudioState>) => void
  animationStudioOpen: boolean
  setAnimationStudioOpen: (open: boolean) => void

  // Smart Route Planner
  smartRoute: SmartRouteState
  setSmartRoute: (state: Partial<SmartRouteState>) => void

  // Map Data Visualizer
  dataVisualizer: DataVisualizerState
  setDataVisualizer: (state: Partial<DataVisualizerState>) => void

  // Field Survey Tool
  fieldSurvey: FieldSurveyState
  setFieldSurvey: (state: Partial<FieldSurveyState>) => void

  // Emergency Route Planner
  emergencyRoute: EmergencyRouteState
  setEmergencyRoute: (state: Partial<EmergencyRouteState>) => void

  // Map Comparison Slider
  comparisonSlider: ComparisonSliderState
  setComparisonSlider: (state: Partial<ComparisonSliderState>) => void

  // Noise Heatmap Overlay
  noiseHeatmap: NoiseHeatmapState
  setNoiseHeatmap: (state: Partial<NoiseHeatmapState>) => void

  // Solar Exposure Analyzer
  solarExposure: SolarExposureState
  setSolarExposure: (state: Partial<SolarExposureState>) => void

  // Map Style Forge
  styleForge: StyleForgeState
  setStyleForge: (state: Partial<StyleForgeState>) => void

  // Topographic Profiler
  topoProfiler: TopoProfilerState
  setTopoProfiler: (state: Partial<TopoProfilerState>) => void

  // Maritime Navigation
  maritimeNav: MaritimeNavState
  setMaritimeNav: (state: Partial<MaritimeNavState>) => void

  // Geocaching Toolkit
  geocaching: GeocachingState
  setGeocaching: (state: Partial<GeocachingState>) => void

  // Atmospheric Dashboard
  atmospheric: AtmosphericState
  setAtmospheric: (state: Partial<AtmosphericState>) => void

  // Wildlife Tracker
  wildlifeTracker: WildlifeTrackerState
  setWildlifeTracker: (state: Partial<WildlifeTrackerState>) => void

  // Cultural Heritage Map
  culturalHeritage: CulturalHeritageState
  setCulturalHeritage: (state: Partial<CulturalHeritageState>) => void

  // Hydrology Analyzer
  hydrology: HydrologyState
  setHydrology: (state: Partial<HydrologyState>) => void

  // Glacier Monitor
  glacierMonitor: GlacierMonitorState
  setGlacierMonitor: (state: Partial<GlacierMonitorState>) => void

  // Seismic Activity
  seismicActivity: SeismicActivityState
  setSeismicActivity: (state: Partial<SeismicActivityState>) => void

  // Soil Analysis
  soilAnalysis: SoilAnalysisState
  setSoilAnalysis: (state: Partial<SoilAnalysisState>) => void

  // Urban Growth
  urbanGrowth: UrbanGrowthState
  setUrbanGrowth: (state: Partial<UrbanGrowthState>) => void

  // Airspace Navigation
  airspaceNav: AirspaceNavState
  setAirspaceNav: (state: Partial<AirspaceNavState>) => void

  // Reef Health Monitor
  reefHealth: ReefHealthState
  setReefHealth: (state: Partial<ReefHealthState>) => void

  // Magnetic Field Mapper
  magneticField: MagneticFieldState
  setMagneticField: (state: Partial<MagneticFieldState>) => void

  // Flood Risk Analyzer
  floodRisk: FloodRiskState
  setFloodRisk: (state: Partial<FloodRiskState>) => void

  // Volcano Monitor
  volcanoMonitor: VolcanoMonitorState
  setVolcanoMonitor: (state: Partial<VolcanoMonitorState>) => void

  // Avalanche Risk
  avalancheRisk: AvalancheRiskState
  setAvalancheRisk: (state: Partial<AvalancheRiskState>) => void

  // Crop Health
  cropHealth: CropHealthState
  setCropHealth: (state: Partial<CropHealthState>) => void

  // Space Track
  spaceTrack: SpaceTrackState
  setSpaceTrack: (state: Partial<SpaceTrackState>) => void

  // Archaeology Map
  archaeologyMap: ArchaeologyMapState
  setArchaeologyMap: (state: Partial<ArchaeologyMapState>) => void

  // Pollution Tracker
  pollutionTracker: PollutionTrackerState
  setPollutionTracker: (state: Partial<PollutionTrackerState>) => void

  // Tidal Predictor
  tidalPredictor: TidalPredictorState
  setTidalPredictor: (state: Partial<TidalPredictorState>) => void

  // Wind Farm Optimizer
  windFarm: WindFarmState
  setWindFarm: (state: Partial<WindFarmState>) => void

  // Desertification Monitor
  desertification: DesertificationState
  setDesertification: (state: Partial<DesertificationState>) => void

  // Mineral Exploration
  mineralExploration: MineralExplorationState
  setMineralExploration: (state: Partial<MineralExplorationState>) => void

  // Ocean Current Mapper
  oceanCurrent: OceanCurrentState
  setOceanCurrent: (state: Partial<OceanCurrentState>) => void

  // Permafrost Thaw Tracker
  permafrost: PermafrostState
  setPermafrost: (state: Partial<PermafrostState>) => void

  // Lightning Strike Map
  lightning: LightningState
  setLightning: (state: Partial<LightningState>) => void

  // Biome Classifier
  biome: BiomeState
  setBiome: (state: Partial<BiomeState>) => void

  // Groundwater Explorer
  groundwater: GroundwaterState
  setGroundwater: (state: Partial<GroundwaterState>) => void

  // Solar Power Planner
  solarPower: SolarPowerState
  setSolarPower: (state: Partial<SolarPowerState>) => void

  // Volcanic Ash Tracker
  volcanicAsh: VolcanicAshState
  setVolcanicAsh: (state: Partial<VolcanicAshState>) => void

  // Coastal Erosion Monitor
  coastalErosion: CoastalErosionState
  setCoastalErosion: (state: Partial<CoastalErosionState>) => void

  // Carbon Footprint Mapper
  carbonFootprint: CarbonFootprintState
  setCarbonFootprint: (state: Partial<CarbonFootprintState>) => void

  // Wildlife Migration Tracker
  wildlifeMigration: WildlifeMigrationState
  setWildlifeMigration: (state: Partial<WildlifeMigrationState>) => void

  // Ice Sheet Monitor
  iceSheet: IceSheetState
  setIceSheet: (state: Partial<IceSheetState>) => void

  // Drought Monitor
  droughtMonitor: DroughtMonitorState
  setDroughtMonitor: (state: Partial<DroughtMonitorState>) => void

  // Land Subsidence Tracker
  landSubsidence: LandSubsidenceState
  setLandSubsidence: (state: Partial<LandSubsidenceState>) => void

  // Coral Bleaching Alert
  coralBleaching: CoralBleachingState
  setCoralBleaching: (state: Partial<CoralBleachingState>) => void

  // Tsunami Alert System
  tsunamiAlert: TsunamiAlertState
  setTsunamiAlert: (state: Partial<TsunamiAlertState>) => void

  // Soil Erosion Monitor
  soilErosion: SoilErosionState
  setSoilErosion: (state: Partial<SoilErosionState>) => void

  // Watershed Manager
  watershedManager: WatershedManagerState
  setWatershedManager: (state: Partial<WatershedManagerState>) => void

  // Tectonic Plate Viewer
  tectonicPlate: TectonicPlateState
  setTectonicPlate: (state: Partial<TectonicPlateState>) => void

  // Air Quality Forecaster
  airQualityForecaster: AirQualityForecasterState
  setAirQualityForecaster: (state: Partial<AirQualityForecasterState>) => void

  // Glacial Lake Monitor
  glacialLake: GlacialLakeState
  setGlacialLake: (state: Partial<GlacialLakeState>) => void

  // Space Weather Monitor
  spaceWeather: SpaceWeatherState
  setSpaceWeather: (state: Partial<SpaceWeatherState>) => void

  // Peatland Monitor
  peatlandMonitor: PeatlandMonitorState
  setPeatlandMonitor: (state: Partial<PeatlandMonitorState>) => void

  // Mangrove Monitor
  mangroveMonitor: MangroveMonitorState
  setMangroveMonitor: (state: Partial<MangroveMonitorState>) => void

  // Sandstorm Tracker
  sandstormTracker: SandstormTrackerState
  setSandstormTracker: (state: Partial<SandstormTrackerState>) => void

  // Wetland Mapper
  wetlandMapper: WetlandMapperState
  setWetlandMapper: (state: Partial<WetlandMapperState>) => void

  // Urban Heat Island
  urbanHeatIsland: UrbanHeatIslandState
  setUrbanHeatIsland: (state: Partial<UrbanHeatIslandState>) => void

  // Wildfire Risk Assessor
  wildfireRisk: WildfireRiskState
  setWildfireRisk: (state: Partial<WildfireRiskState>) => void

  // Algal Bloom Tracker
  algalBloom: AlgalBloomState
  setAlgalBloom: (state: Partial<AlgalBloomState>) => void

  // Landslide Predictor
  landslidePredictor: LandslidePredictorState
  setLandslidePredictor: (state: Partial<LandslidePredictorState>) => void

  // Sea Ice Navigator
  seaIceNavigator: SeaIceNavigatorState
  setSeaIceNavigator: (state: Partial<SeaIceNavigatorState>) => void

  // Cloud Cover Analyzer
  cloudCover: CloudCoverState
  setCloudCover: (state: Partial<CloudCoverState>) => void

  // Soil Moisture Monitor
  soilMoisture: SoilMoistureState
  setSoilMoisture: (state: Partial<SoilMoistureState>) => void

  // Light Pollution Monitor
  lightPollution: LightPollutionState
  setLightPollution: (state: Partial<LightPollutionState>) => void

  // River Flow Monitor
  riverFlow: RiverFlowState
  setRiverFlow: (state: Partial<RiverFlowState>) => void

  // Volcano Seismic Monitor
  volcanoSeismic: VolcanoSeismicState
  setVolcanoSeismic: (state: Partial<VolcanoSeismicState>) => void

  // Whale Migration Tracker
  whaleMigration: WhaleMigrationState
  setWhaleMigration: (state: Partial<WhaleMigrationState>) => void

  // Avalanche Forecaster
  avalancheForecaster: AvalancheForecasterState
  setAvalancheForecaster: (state: Partial<AvalancheForecasterState>) => void

  // Aurora Forecaster
  auroraForecaster: AuroraForecasterState
  setAuroraForecaster: (state: Partial<AuroraForecasterState>) => void

  // Ozone Layer Monitor
  ozoneLayer: OzoneLayerState
  setOzoneLayer: (state: Partial<OzoneLayerState>) => void

  // Deforestation Tracker
  deforestation: DeforestationState
  setDeforestation: (state: Partial<DeforestationState>) => void

  // Methane Emissions Tracker
  methaneEmissions: MethaneEmissionsState
  setMethaneEmissions: (state: Partial<MethaneEmissionsState>) => void

  // Ocean Acidification Monitor
  oceanAcidification: OceanAcidificationState
  setOceanAcidification: (state: Partial<OceanAcidificationState>) => void

  // Space Debris Tracker
  spaceDebris: SpaceDebrisState
  setSpaceDebris: (state: Partial<SpaceDebrisState>) => void

  // Tectonic Strain Monitor
  tectonicStrain: TectonicStrainState
  setTectonicStrain: (state: Partial<TectonicStrainState>) => void

  // Phytoplankton Bloom Monitor
  phytoBloom: PhytoBloomState
  setPhytoBloom: (state: Partial<PhytoBloomState>) => void

  // Snow Cover Monitor
  snowCover: SnowCoverState
  setSnowCover: (state: Partial<SnowCoverState>) => void

  // Geomagnetic Storm Tracker
  geomagneticStorm: GeomagneticStormState
  setGeomagneticStorm: (state: Partial<GeomagneticStormState>) => void

  // Volcanic Gas Monitor
  volcanicGas: VolcanicGasState
  setVolcanicGas: (state: Partial<VolcanicGasState>) => void

  // Aquifer Depletion Monitor
  aquiferDepletion: AquiferDepletionState
  setAquiferDepletion: (state: Partial<AquiferDepletionState>) => void

  // Stratospheric Wind Monitor
  stratosphericWind: StratosphericWindState
  setStratosphericWind: (state: Partial<StratosphericWindState>) => void

  // Marine Heatwave Tracker
  marineHeatwave: MarineHeatwaveState
  setMarineHeatwave: (state: Partial<MarineHeatwaveState>) => void

  // Precipitation Analyzer
  precipitation: PrecipitationState
  setPrecipitation: (state: Partial<PrecipitationState>) => void

  // Cosmic Ray Monitor
  cosmicRay: CosmicRayState
  setCosmicRay: (state: Partial<CosmicRayState>) => void

  // Greenland Ice Tracker
  greenlandIce: GreenlandIceState
  setGreenlandIce: (state: Partial<GreenlandIceState>) => void

  // Radiation Exposure Monitor
  radiationExposure: RadiationExposureState
  setRadiationExposure: (state: Partial<RadiationExposureState>) => void

  // Peat Fire Tracker
  peatFire: PeatFireState
  setPeatFire: (state: Partial<PeatFireState>) => void

  // Sea Level Rise Projector
  seaLevelRise: SeaLevelRiseState
  setSeaLevelRise: (state: Partial<SeaLevelRiseState>) => void

  // Thermocline Mapper
  thermocline: ThermoclineState
  setThermocline: (state: Partial<ThermoclineState>) => void

  // Acid Rain Tracker
  acidRain: AcidRainState
  setAcidRain: (state: Partial<AcidRainState>) => void

  // Methane Hydrate Monitor
  methaneHydrate: MethaneHydrateState
  setMethaneHydrate: (state: Partial<MethaneHydrateState>) => void

  // Kelp Forest Monitor
  kelpForest: KelpForestState
  setKelpForest: (state: Partial<KelpForestState>) => void

  // Glacier Lake Outburst Tracker
  glof: GLOFState
  setGLOF: (state: Partial<GLOFState>) => void

  // Dust Storm Tracker
  dustStorm: DustStormState
  setDustStorm: (state: Partial<DustStormState>) => void

  // Bioluminescence Tracker
  bioluminescence: BioluminescenceState
  setBioluminescence: (state: Partial<BioluminescenceState>) => void

  // Urban Sprawl Monitor
  urbanSprawl: UrbanSprawlState
  setUrbanSprawl: (state: Partial<UrbanSprawlState>) => void

  // Viral Outbreak Mapper
  viralOutbreak: ViralOutbreakState
  setViralOutbreak: (state: Partial<ViralOutbreakState>) => void

  // Magnetosphere Monitor
  magnetosphere: MagnetosphereState
  setMagnetosphere: (state: Partial<MagnetosphereState>) => void

  // Fog Density Mapper
  fogDensity: FogDensityState
  setFogDensity: (state: Partial<FogDensityState>) => void

  // Carbon Capture Tracker
  carbonCapture: CarbonCaptureState
  setCarbonCapture: (state: Partial<CarbonCaptureState>) => void

  // Hail Storm Tracker
  hailStorm: HailStormState
  setHailStorm: (state: Partial<HailStormState>) => void

  // Sahara Reforestation Tracker
  saharaReforestation: SaharaReforestationState
  setSaharaReforestation: (state: Partial<SaharaReforestationState>) => void

  // Deep Sea Vents Monitor
  deepSeaVent: DeepSeaVentState
  setDeepSeaVent: (state: Partial<DeepSeaVentState>) => void

  // Storm Surge Predictor
  stormSurge: StormSurgeState
  setStormSurge: (state: Partial<StormSurgeState>) => void

  // Landfill Monitor
  landfillMonitor: LandfillMonitorState
  setLandfillMonitor: (state: Partial<LandfillMonitorState>) => void

  // Salinity Gradient Mapper
  salinityGradient: SalinityGradientState
  setSalinityGradient: (state: Partial<SalinityGradientState>) => void

  // Microplastics Tracker
  microplastics: MicroplasticsState
  setMicroplastics: (state: Partial<MicroplasticsState>) => void

  // Radio Signal Mapper
  radioSignal: RadioSignalState
  setRadioSignal: (state: Partial<RadioSignalState>) => void

  // Volcanic Island Monitor
  volcanicIsland: VolcanicIslandState
  setVolcanicIsland: (state: Partial<VolcanicIslandState>) => void

  // Permafrost Thaw Monitor
  permafrostThaw: PermafrostThawState
  setPermafrostThaw: (state: Partial<PermafrostThawState>) => void

  // Ocean Current Tracker
  oceanCurrentTracker: OceanCurrentTrackerState
  setOceanCurrentTracker: (state: Partial<OceanCurrentTrackerState>) => void

  // Space Weather Alert
  spaceWeatherAlert: SpaceWeatherAlertState
  setSpaceWeatherAlert: (state: Partial<SpaceWeatherAlertState>) => void

  // Desert Monitor
  desertMonitor: DesertMonitorState
  setDesertMonitor: (state: Partial<DesertMonitorState>) => void

  // Tsunami Buoy Tracker
  tsunamiBuoy: TsunamiBuoyState
  setTsunamiBuoy: (state: Partial<TsunamiBuoyState>) => void

  // Glacier Velocity Tracker
  glacierVelocity: GlacierVelocityState
  setGlacierVelocity: (state: Partial<GlacierVelocityState>) => void

  // Earthquake Swarm Monitor
  earthquakeSwarm: EarthquakeSwarmState
  setEarthquakeSwarm: (state: Partial<EarthquakeSwarmState>) => void

  // Mangrove Restoration Tracker
  mangroveRestoration: MangroveRestorationState
  setMangroveRestoration: (state: Partial<MangroveRestorationState>) => void

  // Task 57: Coral Bleaching Monitor
  coralBleachingMonitor: CoralBleachingMonitorState
  setCoralBleachingMonitor: (state: Partial<CoralBleachingMonitorState>) => void

  // Task 57: Arctic Sea Ice Monitor
  arcticSeaIce: ArcticSeaIceState
  setArcticSeaIce: (state: Partial<ArcticSeaIceState>) => void

  // Task 57: Landslide Risk Monitor
  landslideRisk: LandslideRiskState
  setLandslideRisk: (state: Partial<LandslideRiskState>) => void

  // Task 57: Air Quality Monitor
  airQuality: AirQualityState
  setAirQuality: (state: Partial<AirQualityState>) => void

  // Task 57: Soil Moisture Ag Mapper
  soilMoistureAg: SoilMoistureAgState
  setSoilMoistureAg: (state: Partial<SoilMoistureAgState>) => void

  // Task 57: Noise Pollution Mapper
  noisePollution: NoisePollutionState
  setNoisePollution: (state: Partial<NoisePollutionState>) => void

  // Task 57: Light Pollution Sky Mapper
  lightPollutionSky: LightPollutionSkyState
  setLightPollutionSky: (state: Partial<LightPollutionSkyState>) => void

  // Task 57: Groundwater Recharge Tracker
  groundwaterRecharge: GroundwaterRechargeState
  setGroundwaterRecharge: (state: Partial<GroundwaterRechargeState>) => void

  // Task 65: Subglacial Lake Explorer
  subglacialLake: SubglacialLakeState
  setSubglacialLake: (state: Partial<SubglacialLakeState>) => void

  // Task 65: Thermokarst Lake Monitor
  thermokarstLake: ThermokarstLakeState
  setThermokarstLake: (state: Partial<ThermokarstLakeState>) => void

  // Task 65: Paleoclimate Proxy Explorer
  paleoclimateProxy: PaleoclimateProxyState
  setPaleoclimateProxy: (state: Partial<PaleoclimateProxyState>) => void

  // Task 65: Geomagnetically Induced Current Monitor
  gicMonitor: GICMonitorState
  setGicMonitor: (state: Partial<GICMonitorState>) => void

  // Task 65: Sabkha Environment Monitor
  sabkhaEnvironment: SabkhaEnvironmentState
  setSabkhaEnvironment: (state: Partial<SabkhaEnvironmentState>) => void

  // Task 65: Cryosphere Change Tracker
  cryosphereChange: CryosphereChangeState
  setCryosphereChange: (state: Partial<CryosphereChangeState>) => void

  // Task 65: Abyssal Plain Mapper
  abyssalPlain: AbyssalPlainState
  setAbyssalPlain: (state: Partial<AbyssalPlainState>) => void

  // Task 65: Fjord Ecosystem Monitor
  fjordEcosystem: FjordEcosystemState
  setFjordEcosystem: (state: Partial<FjordEcosystemState>) => void

  // Task 67: Geothermal Spring Monitor
  geothermalSpring: GeothermalSpringState
  setGeothermalSpring: (state: Partial<GeothermalSpringState>) => void

  // Task 67: Asteroid Impact Risk Mapper
  asteroidImpact: AsteroidImpactState
  setAsteroidImpact: (state: Partial<AsteroidImpactState>) => void

  // Task 67: Desert Oasis Monitor
  desertOasis: DesertOasisState
  setDesertOasis: (state: Partial<DesertOasisState>) => void

  // Task 67: Volcanic Lightning Tracker
  volcanicLightning: VolcanicLightningState
  setVolcanicLightning: (state: Partial<VolcanicLightningState>) => void

  // Task 67: Ice Core Data Explorer
  iceCoreData: IceCoreDataState
  setIceCoreData: (state: Partial<IceCoreDataState>) => void

  // Task 67: Stratospheric Aerosol Monitor
  stratosphericAerosol: StratosphericAerosolState
  setStratosphericAerosol: (state: Partial<StratosphericAerosolState>) => void

  // Task 67: Megacity Carbon Footprint
  megacityCarbon: MegacityCarbonState
  setMegacityCarbon: (state: Partial<MegacityCarbonState>) => void

  // Task 67: Ocean Mesoscale Eddy Tracker
  oceanEddy: OceanEddyState
  setOceanEddy: (state: Partial<OceanEddyState>) => void

  // Task 68: New monitoring states
  supervolcano: SupervolcanoState
  setSupervolcano: (state: Partial<SupervolcanoState>) => void
  polarVortex: PolarVortexState
  setPolarVortex: (state: Partial<PolarVortexState>) => void
  karstAquifer: KarstAquiferState
  setKarstAquifer: (state: Partial<KarstAquiferState>) => void
  subductionZone: SubductionZoneState
  setSubductionZone: (state: Partial<SubductionZoneState>) => void
  tropopause: TropopauseState
  setTropopause: (state: Partial<TropopauseState>) => void
  invasiveSpecies: InvasiveSpeciesState
  setInvasiveSpecies: (state: Partial<InvasiveSpeciesState>) => void
  tundraCarbon: TundraCarbonState
  setTundraCarbon: (state: Partial<TundraCarbonState>) => void
  monsoon: MonsoonState
  setMonsoon: (state: Partial<MonsoonState>) => void

  // Task 69: New monitoring states
  lavaFlow: LavaFlowState
  setLavaFlow: (state: Partial<LavaFlowState>) => void
  tidalEnergy: TidalEnergyState
  setTidalEnergy: (state: Partial<TidalEnergyState>) => void
  peatFire: PeatFireState
  setPeatFire: (state: Partial<PeatFireState>) => void
  coralSpawn: CoralSpawnState
  setCoralSpawn: (state: Partial<CoralSpawnState>) => void
  glacierCalving: GlacierCalvingState
  setGlacierCalving: (state: Partial<GlacierCalvingState>) => void
  soilCarbon: SoilCarbonState
  setSoilCarbon: (state: Partial<SoilCarbonState>) => void
  urbanTreeCanopy: UrbanTreeCanopyState
  setUrbanTreeCanopy: (state: Partial<UrbanTreeCanopyState>) => void
  geomagneticPole: GeomagneticPoleState
  setGeomagneticPole: (state: Partial<GeomagneticPoleState>) => void

  // Task 70: New monitoring states
  hydrothermalVent: HydrothermalVentState
  setHydrothermalVent: (state: Partial<HydrothermalVentState>) => void
  watershedHealth: WatershedHealthState
  setWatershedHealth: (state: Partial<WatershedHealthState>) => void
  migratoryFlyway: MigratoryFlywayState
  setMigratoryFlyway: (state: Partial<MigratoryFlywayState>) => void
  seagrassMeadow: SeagrassMeadowState
  setSeagrassMeadow: (state: Partial<SeagrassMeadowState>) => void
  urbanHeatIslandDetail: UrbanHeatIslandDetailState
  setUrbanHeatIslandDetail: (state: Partial<UrbanHeatIslandDetailState>) => void
  oceanAcidificationDetail: OceanAcidificationDetailState
  setOceanAcidificationDetail: (state: Partial<OceanAcidificationDetailState>) => void
  desertificationDetail: DesertificationDetailState
  setDesertificationDetail: (state: Partial<DesertificationDetailState>) => void
  volcanicGasTracker: VolcanicGasTrackerState
  setVolcanicGasTracker: (state: Partial<VolcanicGasTrackerState>) => void
  // Task 71: New monitoring states
  deepOceanCurrent: DeepOceanCurrentState
  setDeepOceanCurrent: (state: Partial<DeepOceanCurrentState>) => void
  stratosphericOzone: StratosphericOzoneState
  setStratosphericOzone: (state: Partial<StratosphericOzoneState>) => void
  seismicHarmonic: SeismicHarmonicState
  setSeismicHarmonic: (state: Partial<SeismicHarmonicState>) => void
  wildfireSmoke: WildfireSmokeState
  setWildfireSmoke: (state: Partial<WildfireSmokeState>) => void
  estuaryHealth: EstuaryHealthState
  setEstuaryHealth: (state: Partial<EstuaryHealthState>) => void
  alpineGlacier: AlpineGlacierState
  setAlpineGlacier: (state: Partial<AlpineGlacierState>) => void
  oceanAnoxicZone: OceanAnoxicZoneState
  setOceanAnoxicZone: (state: Partial<OceanAnoxicZoneState>) => void
  permafrostCarbonFeedback: PermafrostCarbonFeedbackState
  setPermafrostCarbonFeedback: (state: Partial<PermafrostCarbonFeedbackState>) => void

  // Task 72: New monitoring states
  tropicalCyclone: TropicalCycloneState
  setTropicalCyclone: (state: Partial<TropicalCycloneState>) => void
  volcanicDeformation: VolcanicDeformationState
  setVolcanicDeformation: (state: Partial<VolcanicDeformationState>) => void
  coralReefBleachingDetail: CoralReefBleachingDetailState
  setCoralReefBleachingDetail: (state: Partial<CoralReefBleachingDetailState>) => void
  arcticPermafrostLakes: ArcticPermafrostLakesState
  setArcticPermafrostLakes: (state: Partial<ArcticPermafrostLakesState>) => void
  methaneEmissionHotspot: MethaneEmissionHotspotState
  setMethaneEmissionHotspot: (state: Partial<MethaneEmissionHotspotState>) => void
  coastalUpwelling: CoastalUpwellingState
  setCoastalUpwelling: (state: Partial<CoastalUpwellingState>) => void
  spaceDebrisOrbit: SpaceDebrisOrbitState
  setSpaceDebrisOrbit: (state: Partial<SpaceDebrisOrbitState>) => void
  tectonicPlateBoundary: TectonicPlateBoundaryState
  setTectonicPlateBoundary: (state: Partial<TectonicPlateBoundaryState>) => void

  // Task 73: New monitoring states
  landslideSusceptibility: LandslideSusceptibilityState
  setLandslideSusceptibility: (state: Partial<LandslideSusceptibilityState>) => void
  solarFlareActivity: SolarFlareActivityState
  setSolarFlareActivity: (state: Partial<SolarFlareActivityState>) => void
  riverDeltaErosion: RiverDeltaErosionState
  setRiverDeltaErosion: (state: Partial<RiverDeltaErosionState>) => void
  seaIceThickness: SeaIceThicknessState
  setSeaIceThickness: (state: Partial<SeaIceThicknessState>) => void
  urbanAirQuality: UrbanAirQualityState
  setUrbanAirQuality: (state: Partial<UrbanAirQualityState>) => void
  geothermalEnergy: GeothermalEnergyState
  setGeothermalEnergy: (state: Partial<GeothermalEnergyState>) => void
  aquiferSalinization: AquiferSalinizationState
  setAquiferSalinization: (state: Partial<AquiferSalinizationState>) => void
  biomassBurning: BiomassBurningState
  setBiomassBurning: (state: Partial<BiomassBurningState>) => void

  // Task 74: New monitoring states
  glacialLakeOutburst: GlacialLakeOutburstState
  setGlacialLakeOutburst: (state: Partial<GlacialLakeOutburstState>) => void
  oceanMicroplastic: OceanMicroplasticState
  setOceanMicroplastic: (state: Partial<OceanMicroplasticState>) => void
  volcanicAshDispersion: VolcanicAshDispersionState
  setVolcanicAshDispersion: (state: Partial<VolcanicAshDispersionState>) => void
  droughtSeverity: DroughtSeverityState
  setDroughtSeverity: (state: Partial<DroughtSeverityState>) => void
  tsunamiWaveHeight: TsunamiWaveHeightState
  setTsunamiWaveHeight: (state: Partial<TsunamiWaveHeightState>) => void
  caveEcosystem: CaveEcosystemState
  setCaveEcosystem: (state: Partial<CaveEcosystemState>) => void
  solarIrradiance: SolarIrradianceState
  setSolarIrradiance: (state: Partial<SolarIrradianceState>) => void
  peatlandRestoration: PeatlandRestorationState
  setPeatlandRestoration: (state: Partial<PeatlandRestorationState>) => void

  // Task 75: New monitoring states
  mangroveCarbon: MangroveCarbonState
  setMangroveCarbon: (state: Partial<MangroveCarbonState>) => void
  oceanHeatContent: OceanHeatContentState
  setOceanHeatContent: (state: Partial<OceanHeatContentState>) => void
  dustStormTracker: DustStormTrackerState
  setDustStormTracker: (state: Partial<DustStormTrackerState>) => void
  coralDiseaseMonitor: CoralDiseaseMonitorState
  setCoralDiseaseMonitor: (state: Partial<CoralDiseaseMonitorState>) => void
  iceShelfCollapse: IceShelfCollapseState
  setIceShelfCollapse: (state: Partial<IceShelfCollapseState>) => void
  urbanFloodRisk: UrbanFloodRiskState
  setUrbanFloodRisk: (state: Partial<UrbanFloodRiskState>) => void
  phytoplanktonBloom: PhytoplanktonBloomState
  setPhytoplanktonBloom: (state: Partial<PhytoplanktonBloomState>) => void
  submarineCanyon: SubmarineCanyonState
  setSubmarineCanyon: (state: Partial<SubmarineCanyonState>) => void
  // Task 76: New monitoring states
  kelpForestMonitor: KelpForestMonitorState
  setKelpForestMonitor: (state: Partial<KelpForestMonitorState>) => void
  volcanicIslandFormation: VolcanicIslandFormationState
  setVolcanicIslandFormation: (state: Partial<VolcanicIslandFormationState>) => void
  saltwaterIntrusion: SaltwaterIntrusionState
  setSaltwaterIntrusion: (state: Partial<SaltwaterIntrusionState>) => void
  arcticShippingRoute: ArcticShippingRouteState
  setArcticShippingRoute: (state: Partial<ArcticShippingRouteState>) => void
  thermoclineDepth: ThermoclineDepthState
  setThermoclineDepth: (state: Partial<ThermoclineDepthState>) => void
  bioluminescentBay: BioluminescentBayState
  setBioluminescentBay: (state: Partial<BioluminescentBayState>) => void
  orographicRainfall: OrographicRainfallState
  setOrographicRainfall: (state: Partial<OrographicRainfallState>) => void
  hydrothermalPlume: HydrothermalPlumeState
  setHydrothermalPlume: (state: Partial<HydrothermalPlumeState>) => void
  // Task 77: New monitoring states
  seamountEcosystem: SeamountEcosystemState
  setSeamountEcosystem: (state: Partial<SeamountEcosystemState>) => void
  groundSubsidence: GroundSubsidenceState
  setGroundSubsidence: (state: Partial<GroundSubsidenceState>) => void
  oceanStratification: OceanStratificationState
  setOceanStratification: (state: Partial<OceanStratificationState>) => void
  snowCoverExtent: SnowCoverExtentState
  setSnowCoverExtent: (state: Partial<SnowCoverExtentState>) => void
  coastalErosionDetail: CoastalErosionDetailState
  setCoastalErosionDetail: (state: Partial<CoastalErosionDetailState>) => void
  ecosystemServiceValue: EcosystemServiceValueState
  setEcosystemServiceValue: (state: Partial<EcosystemServiceValueState>) => void
  tidalFlatMonitor: TidalFlatMonitorState
  setTidalFlatMonitor: (state: Partial<TidalFlatMonitorState>) => void
  wildfireRiskAssessment: WildfireRiskAssessmentState
  setWildfireRiskAssessment: (state: Partial<WildfireRiskAssessmentState>) => void
  karstSinkhole: KarstSinkholeState
  setKarstSinkhole: (state: Partial<KarstSinkholeState>) => void
  volcanicSO2: VolcanicSO2State
  setVolcanicSO2: (state: Partial<VolcanicSO2State>) => void
  icebergTracker: IcebergTrackerState
  setIcebergTracker: (state: Partial<IcebergTrackerState>) => void
  caveMineral: CaveMineralState
  setCaveMineral: (state: Partial<CaveMineralState>) => void
  seafloorHydrate: SeafloorHydrateState
  setSeafloorHydrate: (state: Partial<SeafloorHydrateState>) => void
  mangroveLoss: MangroveLossState
  setMangroveLoss: (state: Partial<MangroveLossState>) => void
  urbanNoiseCorridor: UrbanNoiseCorridorState
  setUrbanNoiseCorridor: (state: Partial<UrbanNoiseCorridorState>) => void
  stratosphericWarming: StratosphericWarmingState
  setStratosphericWarming: (state: Partial<StratosphericWarmingState>) => void
  submarineGroundwater: SubmarineGroundwaterState
  setSubmarineGroundwater: (state: Partial<SubmarineGroundwaterState>) => void
  hydrothermalSulfide: HydrothermalSulfideState
  setHydrothermalSulfide: (state: Partial<HydrothermalSulfideState>) => void
  lunarTidalForce: LunarTidalForceState
  setLunarTidalForce: (state: Partial<LunarTidalForceState>) => void
  ripCurrent: RipCurrentState
  setRipCurrent: (state: Partial<RipCurrentState>) => void
  avalancheDebrisFlow: AvalancheDebrisFlowState
  setAvalancheDebrisFlow: (state: Partial<AvalancheDebrisFlowState>) => void
  coastalAcidification: CoastalAcidificationState
  setCoastalAcidification: (state: Partial<CoastalAcidificationState>) => void
  desertSandSea: DesertSandSeaState
  setDesertSandSea: (state: Partial<DesertSandSeaState>) => void
  subsidenceHazard: SubsidenceHazardState
  setSubsidenceHazard: (state: Partial<SubsidenceHazardState>) => void
  volcanicLahar: VolcanicLaharState
  setVolcanicLahar: (state: Partial<VolcanicLaharState>) => void
  deepWaterCoral: DeepWaterCoralState
  setDeepWaterCoral: (state: Partial<DeepWaterCoralState>) => void
  polarBearHabitat: PolarBearHabitatState
  setPolarBearHabitat: (state: Partial<PolarBearHabitatState>) => void
  soilSalinization: SoilSalinizationState
  setSoilSalinization: (state: Partial<SoilSalinizationState>) => void
  tsunamiRunup: TsunamiRunupState
  setTsunamiRunup: (state: Partial<TsunamiRunupState>) => void
  urbanHeatVentilation: UrbanHeatVentilationState
  setUrbanHeatVentilation: (state: Partial<UrbanHeatVentilationState>) => void
  brinePool: BrinePoolState
  setBrinePool: (state: Partial<BrinePoolState>) => void
  supraglacialStream: SupraglacialStreamState
  setSupraglacialStream: (state: Partial<SupraglacialStreamState>) => void
  methaneHydrateStability: MethaneHydrateStabilityState
  setMethaneHydrateStability: (state: Partial<MethaneHydrateStabilityState>) => void
  volcanicAshCloud: VolcanicAshCloudState
  setVolcanicAshCloud: (state: Partial<VolcanicAshCloudState>) => void
  geothermalGradient: GeothermalGradientState
  setGeothermalGradient: (state: Partial<GeothermalGradientState>) => void
  oceanDeoxygenation: OceanDeoxygenationState
  setOceanDeoxygenation: (state: Partial<OceanDeoxygenationState>) => void
  rockGlacier: RockGlacierState
  setRockGlacier: (state: Partial<RockGlacierState>) => void
  dustHemisphere: DustHemisphereState
  setDustHemisphere: (state: Partial<DustHemisphereState>) => void
  microplasticOcean: MicroplasticOceanState
  setMicroplasticOcean: (state: Partial<MicroplasticOceanState>) => void
  glacierBasalSlide: GlacierBasalSlideState
  setGlacierBasalSlide: (state: Partial<GlacierBasalSlideState>) => void
  volcanicFumarole: VolcanicFumaroleState
  setVolcanicFumarole: (state: Partial<VolcanicFumaroleState>) => void
  hydroclimateExtremes: HydroclimateExtremesState
  setHydroclimateExtremes: (state: Partial<HydroclimateExtremesState>) => void
  megafaunaTracking: MegafaunaTrackingState
  setMegafaunaTracking: (state: Partial<MegafaunaTrackingState>) => void
  cryoconiteHole: CryoconiteHoleState
  setCryoconiteHole: (state: Partial<CryoconiteHoleState>) => void
  sapFlow: SapFlowState
  setSapFlow: (state: Partial<SapFlowState>) => void
  rockfallHazard: RockfallHazardState
  setRockfallHazard: (state: Partial<RockfallHazardState>) => void
  thermohalineCirculation: ThermohalineCirculationState
  setThermohalineCirculation: (state: Partial<ThermohalineCirculationState>) => void
  hydroseismicActivity: HydroseismicActivityState
  setHydroseismicActivity: (state: Partial<HydroseismicActivityState>) => void
  lavaTubeCave: LavaTubeCaveState
  setLavaTubeCave: (state: Partial<LavaTubeCaveState>) => void
  submarineCanyonFisheries: SubmarineCanyonFisheriesState
  setSubmarineCanyonFisheries: (state: Partial<SubmarineCanyonFisheriesState>) => void
  polynyaIce: PolynyaIceState
  setPolynyaIce: (state: Partial<PolynyaIceState>) => void
  volcanicDomeGrowth: VolcanicDomeGrowthState
  setVolcanicDomeGrowth: (state: Partial<VolcanicDomeGrowthState>) => void
  seamountBiodiversity: SeamountBiodiversityState
  setSeamountBiodiversity: (state: Partial<SeamountBiodiversityState>) => void
  estuaryAcidification: EstuaryAcidificationState
  setEstuaryAcidification: (state: Partial<EstuaryAcidificationState>) => void
  abyssalSedimentFlux: AbyssalSedimentFluxState
  setAbyssalSedimentFlux: (state: Partial<AbyssalSedimentFluxState>) => void
  glacialMoulin: GlacialMoulinState
  setGlacialMoulin: (state: Partial<GlacialMoulinState>) => void
  iceShelfCalving: IceShelfCalvingState
  setIceShelfCalving: (state: Partial<IceShelfCalvingState>) => void
  volcanicGasPlume: VolcanicGasPlumeState
  setVolcanicGasPlume: (state: Partial<VolcanicGasPlumeState>) => void
  submarineLandslide: SubmarineLandslideState
  setSubmarineLandslide: (state: Partial<SubmarineLandslideState>) => void
  coastalWetlandLoss: CoastalWetlandLossState
  setCoastalWetlandLoss: (state: Partial<CoastalWetlandLossState>) => void
  tundraPermafrostThaw: TundraPermafrostThawState
  setTundraPermafrostThaw: (state: Partial<TundraPermafrostThawState>) => void
  oceanCurrentProfiler: OceanCurrentProfilerState
  setOceanCurrentProfiler: (state: Partial<OceanCurrentProfilerState>) => void
  desertificationFront: DesertificationFrontState
  setDesertificationFront: (state: Partial<DesertificationFrontState>) => void
  coralReefRecovery: CoralReefRecoveryState
  setCoralReefRecovery: (state: Partial<CoralReefRecoveryState>) => void
  methaneCrater: MethaneCraterState
  setMethaneCrater: (state: Partial<MethaneCraterState>) => void
  subglacialVolcano: SubglacialVolcanoState
  setSubglacialVolcano: (state: Partial<SubglacialVolcanoState>) => void
  coralSpawnPrediction: CoralSpawnPredictionState
  setCoralSpawnPrediction: (state: Partial<CoralSpawnPredictionState>) => void
  hydrothermalDiffuseFlow: HydrothermalDiffuseFlowState
  setHydrothermalDiffuseFlow: (state: Partial<HydrothermalDiffuseFlowState>) => void
  permafrostCarbonPipeline: PermafrostCarbonPipelineState
  setPermafrostCarbonPipeline: (state: Partial<PermafrostCarbonPipelineState>) => void
  subaqueousLavaFlow: SubaqueousLavaFlowState
  setSubaqueousLavaFlow: (state: Partial<SubaqueousLavaFlowState>) => void
  intertidalZone: IntertidalZoneState
  setIntertidalZone: (state: Partial<IntertidalZoneState>) => void
  desertFlashFlood: DesertFlashFloodState
  setDesertFlashFlood: (state: Partial<DesertFlashFloodState>) => void
  mudVolcanoActivity: MudVolcanoActivityState
  setMudVolcanoActivity: (state: Partial<MudVolcanoActivityState>) => void
  glacierSurgeEvent: GlacierSurgeEventState
  setGlacierSurgeEvent: (state: Partial<GlacierSurgeEventState>) => void
  seicheWaveOscillation: SeicheWaveOscillationState
  setSeicheWaveOscillation: (state: Partial<SeicheWaveOscillationState>) => void
  laharFlowTracker: LaharFlowTrackerState
  setLaharFlowTracker: (state: Partial<LaharFlowTrackerState>) => void
  icePenitentMonitor: IcePenitentMonitorState
  setIcePenitentMonitor: (state: Partial<IcePenitentMonitorState>) => void
  frostHeaveMonitor: FrostHeaveMonitorState
  setFrostHeaveMonitor: (state: Partial<FrostHeaveMonitorState>) => void
  pumiceRaftDrift: PumiceRaftDriftState
  setPumiceRaftDrift: (state: Partial<PumiceRaftDriftState>) => void
  limnicEruptionMonitor: LimnicEruptionMonitorState
  setLimnicEruptionMonitor: (state: Partial<LimnicEruptionMonitorState>) => void

  // Task 95: Volcanic Tremor Monitor
  volcanicTremor: VolcanicTremorState
  setVolcanicTremor: (state: Partial<VolcanicTremorState>) => void

  // Task 95: Ice Wedge Polygon Monitor
  iceWedgePolygon: IceWedgePolygonState
  setIceWedgePolygon: (state: Partial<IceWedgePolygonState>) => void

  // Task 95: Salt Flat Crust Monitor
  saltFlatCrust: SaltFlatCrustState
  setSaltFlatCrust: (state: Partial<SaltFlatCrustState>) => void

  // Task 95: Cold Water Coral Reef Monitor
  coldWaterCoralReef: ColdWaterCoralReefState
  setColdWaterCoralReef: (state: Partial<ColdWaterCoralReefState>) => void

  // Task 95: Peatland Carbon Sink Monitor
  peatlandCarbonSink: PeatlandCarbonSinkState
  setPeatlandCarbonSink: (state: Partial<PeatlandCarbonSinkState>) => void

  // Task 95: Hyporheic Zone Monitor
  hyporheicZone: HyporheicZoneState
  setHyporheicZone: (state: Partial<HyporheicZoneState>) => void

  // Task 95: Submarine Fan Monitor
  submarineFan: SubmarineFanState
  setSubmarineFan: (state: Partial<SubmarineFanState>) => void

  // Task 95: Coastal Dune System Monitor
  coastalDuneSystem: CoastalDuneSystemState
  setCoastalDuneSystem: (state: Partial<CoastalDuneSystemState>) => void

  // Task 96: New Monitors
  karstSpringDischarge: KarstSpringDischargeState
  setKarstSpringDischarge: (state: Partial<KarstSpringDischargeState>) => void
  caveDripMonitor: CaveDripMonitorState
  setCaveDripMonitor: (state: Partial<CaveDripMonitorState>) => void
  tidalCreekMonitor: TidalCreekMonitorState
  setTidalCreekMonitor: (state: Partial<TidalCreekMonitorState>) => void
  saltMarshCarbon: SaltMarshCarbonState
  setSaltMarshCarbon: (state: Partial<SaltMarshCarbonState>) => void
  opalPaleoMonitor: OpalPaleoMonitorState
  setOpalPaleoMonitor: (state: Partial<OpalPaleoMonitorState>) => void
  aeolianDustDeposition: AeolianDustDepositionState
  setAeolianDustDeposition: (state: Partial<AeolianDustDepositionState>) => void
  katabaticWindMonitor: KatabaticWindMonitorState
  setKatabaticWindMonitor: (state: Partial<KatabaticWindMonitorState>) => void
  snowAvalancheTracker: SnowAvalancheTrackerState
  setSnowAvalancheTracker: (state: Partial<SnowAvalancheTrackerState>) => void
  riftValleyVolcano: RiftValleyVolcanoState
  setRiftValleyVolcano: (state: Partial<RiftValleyVolcanoState>) => void
  streamBankErosion: StreamBankErosionState
  setStreamBankErosion: (state: Partial<StreamBankErosionState>) => void
  iceStreamVelocity: IceStreamVelocityState
  setIceStreamVelocity: (state: Partial<IceStreamVelocityState>) => void
  coastalAquifer: CoastalAquiferState
  setCoastalAquifer: (state: Partial<CoastalAquiferState>) => void
  mangroveRootSystem: MangroveRootSystemState
  setMangroveRootSystem: (state: Partial<MangroveRootSystemState>) => void
  paleoshorelineTracker: PaleoshorelineTrackerState
  setPaleoshorelineTracker: (state: Partial<PaleoshorelineTrackerState>) => void
  cryoconiteGranule: CryoconiteGranuleState
  setCryoconiteGranule: (state: Partial<CryoconiteGranuleState>) => void
  subglacialWaterSystem: SubglacialWaterSystemState
  setSubglacialWaterSystem: (state: Partial<SubglacialWaterSystemState>) => void

  // Task 98: Mass Wasting and Slope Processes
  landslideVelocity: LandslideVelocityState
  setLandslideVelocity: (state: Partial<LandslideVelocityState>) => void
  debrisFlowSurge: DebrisFlowSurgeState
  setDebrisFlowSurge: (state: Partial<DebrisFlowSurgeState>) => void
  rockfallImpact: RockfallImpactState
  setRockfallImpact: (state: Partial<RockfallImpactState>) => void
  soilCreepRate: SoilCreepRateState
  setSoilCreepRate: (state: Partial<SoilCreepRateState>) => void
  solifluctionLobe: SolifluctionLobeState
  setSolifluctionLobe: (state: Partial<SolifluctionLobeState>) => void
  earthflowDisplacement: EarthflowDisplacementState
  setEarthflowDisplacement: (state: Partial<EarthflowDisplacementState>) => void
  slumpFailure: SlumpFailureState
  setSlumpFailure: (state: Partial<SlumpFailureState>) => void
  talusAccumulation: TalusAccumulationState
  setTalusAccumulation: (state: Partial<TalusAccumulationState>) => void

  // Task 99: Coastal Engineering and Shore Protection
  breakwaterIntegrity: BreakwaterIntegrityState
  setBreakwaterIntegrity: (state: Partial<BreakwaterIntegrityState>) => void
  seawallErosion: SeawallErosionState
  setSeawallErosion: (state: Partial<SeawallErosionState>) => void
  groinSediment: GroinSedimentState
  setGroinSediment: (state: Partial<GroinSedimentState>) => void
  revetmentStability: RevetmentStabilityState
  setRevetmentStability: (state: Partial<RevetmentStabilityState>) => void
  jettyCurrent: JettyCurrentState
  setJettyCurrent: (state: Partial<JettyCurrentState>) => void
  beachNourishment: BeachNourishmentState
  setBeachNourishment: (state: Partial<BeachNourishmentState>) => void
  coastalArmor: CoastalArmorState
  setCoastalArmor: (state: Partial<CoastalArmorState>) => void
  shorelineRetreat: ShorelineRetreatState
  setShorelineRetreat: (state: Partial<ShorelineRetreatState>) => void

  // Task 100: Soil Science and Pedology
  soilOrganicCarbon: SoilOrganicCarbonState
  setSoilOrganicCarbon: (state: Partial<SoilOrganicCarbonState>) => void
  cationExchange: CationExchangeState
  setCationExchange: (state: Partial<CationExchangeState>) => void
  soilPhosphorus: SoilPhosphorusState
  setSoilPhosphorus: (state: Partial<SoilPhosphorusState>) => void
  soilCompaction: SoilCompactionState
  setSoilCompaction: (state: Partial<SoilCompactionState>) => void
  clayMineral: ClayMineralState
  setClayMineral: (state: Partial<ClayMineralState>) => void
  podzolProfile: PodzolProfileState
  setPodzolProfile: (state: Partial<PodzolProfileState>) => void
  gleyRedox: GleyRedoxState
  setGleyRedox: (state: Partial<GleyRedoxState>) => void
  calcicHorizon: CalcicHorizonState
  setCalcicHorizon: (state: Partial<CalcicHorizonState>) => void

  // Task 101: Mineral Resources and Mining
  oreGradeAssay: OreGradeAssayState
  setOreGradeAssay: (state: Partial<OreGradeAssayState>) => void
  mineTailingsDam: MineTailingsDamState
  setMineTailingsDam: (state: Partial<MineTailingsDamState>) => void
  mineralVeinThickness: MineralVeinThicknessState
  setMineralVeinThickness: (state: Partial<MineralVeinThicknessState>) => void
  stripMineRatio: StripMineRatioState
  setStripMineRatio: (state: Partial<StripMineRatioState>) => void
  undergroundMineVent: UndergroundMineVentState
  setUndergroundMineVent: (state: Partial<UndergroundMineVentState>) => void
  acidMineDrainage: AcidMineDrainageState
  setAcidMineDrainage: (state: Partial<AcidMineDrainageState>) => void
  oreReserveEstimate: OreReserveEstimateState
  setOreReserveEstimate: (state: Partial<OreReserveEstimateState>) => void
  mineralDepositGrade: MineralDepositGradeState
  setMineralDepositGrade: (state: Partial<MineralDepositGradeState>) => void

  // Task 102: Ocean Circulation and Currents
  thermohalineCell: ThermohalineCellState
  setThermohalineCell: (state: Partial<ThermohalineCellState>) => void
  ekmanTransport: EkmanTransportState
  setEkmanTransport: (state: Partial<EkmanTransportState>) => void
  geostrophicCurrent: GeostrophicCurrentState
  setGeostrophicCurrent: (state: Partial<GeostrophicCurrentState>) => void
  upwellingIntensity: UpwellingIntensityState
  setUpwellingIntensity: (state: Partial<UpwellingIntensityState>) => void
  westernBoundary: WesternBoundaryState
  setWesternBoundary: (state: Partial<WesternBoundaryState>) => void
  deepWaterFormation: DeepWaterFormationState
  setDeepWaterFormation: (state: Partial<DeepWaterFormationState>) => void
  oceanGyre: OceanGyreState
  setOceanGyre: (state: Partial<OceanGyreState>) => void
  tropicalCurrent: TropicalCurrentState
  setTropicalCurrent: (state: Partial<TropicalCurrentState>) => void

  // Task 103: Atmospheric Dynamics and Weather
  jetStreamPosition: JetStreamPositionState
  setJetStreamPosition: (state: Partial<JetStreamPositionState>) => void
  atmosphericPressureCell: AtmosphericPressureCellState
  setAtmosphericPressureCell: (state: Partial<AtmosphericPressureCellState>) => void
  tropopauseHeight: TropopauseHeightState
  setTropopauseHeight: (state: Partial<TropopauseHeightState>) => void
  rossbyWaveAmplitude: RossbyWaveAmplitudeState
  setRossbyWaveAmplitude: (state: Partial<RossbyWaveAmplitudeState>) => void
  hadleyCellCirculation: HadleyCellCirculationState
  setHadleyCellCirculation: (state: Partial<HadleyCellCirculationState>) => void
  atmosphericRiverFlow: AtmosphericRiverFlowState
  setAtmosphericRiverFlow: (state: Partial<AtmosphericRiverFlowState>) => void
  polarFrontJet: PolarFrontJetState
  setPolarFrontJet: (state: Partial<PolarFrontJetState>) => void
  tradeWindBelt: TradeWindBeltState
  setTradeWindBelt: (state: Partial<TradeWindBeltState>) => void

  // Task 104: Biogeography and Ecosystem
  speciesMigrationRoute: SpeciesMigrationRouteState
  setSpeciesMigrationRoute: (state: Partial<SpeciesMigrationRouteState>) => void
  habitatCorridor: HabitatCorridorState
  setHabitatCorridor: (state: Partial<HabitatCorridorState>) => void
  endemicHotspot: EndemicHotspotState
  setEndemicHotspot: (state: Partial<EndemicHotspotState>) => void
  keystonePopulation: KeystonePopulationState
  setKeystonePopulation: (state: Partial<KeystonePopulationState>) => void
  wildlifeCorridor: WildlifeCorridorState
  setWildlifeCorridor: (state: Partial<WildlifeCorridorState>) => void
  biomeTransition: BiomeTransitionState
  setBiomeTransition: (state: Partial<BiomeTransitionState>) => void
  forestCanopyCover: ForestCanopyCoverState
  setForestCanopyCover: (state: Partial<ForestCanopyCoverState>) => void
  wetlandBiodiversityIndex: WetlandBiodiversityIndexState
  setWetlandBiodiversityIndex: (state: Partial<WetlandBiodiversityIndexState>) => void

  // Task 105: Hydrology and Watershed
  watershedDischarge: WatershedDischargeState
  setWatershedDischarge: (state: Partial<WatershedDischargeState>) => void
  aquiferRechargeRate: AquiferRechargeRateState
  setAquiferRechargeRate: (state: Partial<AquiferRechargeRateState>) => void
  floodInundationMap: FloodInundationMapState
  setFloodInundationMap: (state: Partial<FloodInundationMapState>) => void
  riverSedimentLoad: RiverSedimentLoadState
  setRiverSedimentLoad: (state: Partial<RiverSedimentLoadState>) => void
  groundwaterTableLevel: GroundwaterTableLevelState
  setGroundwaterTableLevel: (state: Partial<GroundwaterTableLevelState>) => void
  snowpackWaterEquivalent: SnowpackWaterEquivalentState
  setSnowpackWaterEquivalent: (state: Partial<SnowpackWaterEquivalentState>) => void
  reservoirStorageLevel: ReservoirStorageLevelState
  setReservoirStorageLevel: (state: Partial<ReservoirStorageLevelState>) => void
  baseflowIndex: BaseflowIndexState
  setBaseflowIndex: (state: Partial<BaseflowIndexState>) => void

  // Task 106: Cryosphere Dynamics
  iceShelfThickness: IceShelfThicknessState
  setIceShelfThickness: (state: Partial<IceShelfThicknessState>) => void
  seaIceExtent: SeaIceExtentState
  setSeaIceExtent: (state: Partial<SeaIceExtentState>) => void
  glacierMassBalance: GlacierMassBalanceState
  setGlacierMassBalance: (state: Partial<GlacierMassBalanceState>) => void
  permafrostActiveLayer: PermafrostActiveLayerState
  setPermafrostActiveLayer: (state: Partial<PermafrostActiveLayerState>) => void
  iceCoreRecord: IceCoreRecordState
  setIceCoreRecord: (state: Partial<IceCoreRecordState>) => void
  snowCoverDuration: SnowCoverDurationState
  setSnowCoverDuration: (state: Partial<SnowCoverDurationState>) => void
  frostThawCycle: FrostThawCycleState
  setFrostThawCycle: (state: Partial<FrostThawCycleState>) => void
  icebergCalving: IcebergCalvingState
  setIcebergCalving: (state: Partial<IcebergCalvingState>) => void

  // Task 107: Space Weather and Geomagnetism
  magnetopauseStandoff: MagnetopauseStandoffState
  setMagnetopauseStandoff: (state: Partial<MagnetopauseStandoffState>) => void
  auroraOvalPosition: AuroraOvalPositionState
  setAuroraOvalPosition: (state: Partial<AuroraOvalPositionState>) => void
  vanAllenRadiation: VanAllenRadiationState
  setVanAllenRadiation: (state: Partial<VanAllenRadiationState>) => void
  ionosphericDisturbance: IonosphericDisturbanceState
  setIonosphericDisturbance: (state: Partial<IonosphericDisturbanceState>) => void
  cosmicRayFlux: CosmicRayFluxState
  setCosmicRayFlux: (state: Partial<CosmicRayFluxState>) => void
  solarFluxIndex: SolarFluxIndexState
  setSolarFluxIndex: (state: Partial<SolarFluxIndexState>) => void
  spaceRadiationDose: SpaceRadiationDoseState
  setSpaceRadiationDose: (state: Partial<SpaceRadiationDoseState>) => void
  satelliteDrag: SatelliteDragState
  setSatelliteDrag: (state: Partial<SatelliteDragState>) => void

  // Task 108: Urban Infrastructure & Smart City
  trafficFlowMonitor: TrafficFlowState
  setTrafficFlowMonitor: (state: Partial<TrafficFlowState>) => void
  bridgeStructuralHealth: BridgeStructuralHealthState
  setBridgeStructuralHealth: (state: Partial<BridgeStructuralHealthState>) => void
  waterPipeNetwork: WaterPipeNetworkState
  setWaterPipeNetwork: (state: Partial<WaterPipeNetworkState>) => void
  powerGridLoad: PowerGridLoadState
  setPowerGridLoad: (state: Partial<PowerGridLoadState>) => void
  wasteCollectionRoute: WasteCollectionRouteState
  setWasteCollectionRoute: (state: Partial<WasteCollectionRouteState>) => void
  airQualityUrban: AirQualityUrbanState
  setAirQualityUrban: (state: Partial<AirQualityUrbanState>) => void
  noiseLevelMapper: NoiseLevelMapperState
  setNoiseLevelMapper: (state: Partial<NoiseLevelMapperState>) => void
  smartParkingCapacity: SmartParkingCapacityState
  setSmartParkingCapacity: (state: Partial<SmartParkingCapacityState>) => void

  // Task 109: Agricultural Monitoring & Precision Farming
  cropHealthIndex: CropHealthIndexState
  setCropHealthIndex: (state: Partial<CropHealthIndexState>) => void
  soilMoistureField: SoilMoistureFieldState
  setSoilMoistureField: (state: Partial<SoilMoistureFieldState>) => void
  irrigationEfficiency: IrrigationEfficiencyState
  setIrrigationEfficiency: (state: Partial<IrrigationEfficiencyState>) => void
  pestOutbreakTracker: PestOutbreakTrackerState
  setPestOutbreakTracker: (state: Partial<PestOutbreakTrackerState>) => void
  fertilizerRunoff: FertilizerRunoffState
  setFertilizerRunoff: (state: Partial<FertilizerRunoffState>) => void
  harvestYieldPredict: HarvestYieldPredictState
  setHarvestYieldPredict: (state: Partial<HarvestYieldPredictState>) => void
  greenhouseClimate: GreenhouseClimateState
  setGreenhouseClimate: (state: Partial<GreenhouseClimateState>) => void
  livestockMovement: LivestockMovementState
  setLivestockMovement: (state: Partial<LivestockMovementState>) => void

  // Dialog states (moved from local useState in page.tsx for lazy loading)
  addLocationDialogOpen: boolean
  setAddLocationDialogOpen: (open: boolean) => void
  shortcutsDialogOpen: boolean
  setShortcutsDialogOpen: (open: boolean) => void
  coordInputDialogOpen: boolean
  setCoordInputDialogOpen: (open: boolean) => void
  exportDialogOpen: boolean
  setExportDialogOpen: (open: boolean) => void
  bookmarkManagerOpen: boolean
  setBookmarkManagerOpen: (open: boolean) => void
  shareDialogOpen: boolean
  setShareDialogOpen: (open: boolean) => void
  geofenceDialogOpen: boolean
  setGeofenceDialogOpen: (open: boolean) => void
  aiSuggestionsOpen: boolean
  setAiSuggestionsOpen: (open: boolean) => void
  distanceMatrixOpen: boolean
  setDistanceMatrixOpen: (open: boolean) => void
  styleGalleryOpen: boolean
  setStyleGalleryOpen: (open: boolean) => void

  // Style Switcher open state
  styleSwitcherOpen: boolean
  setStyleSwitcherOpen: (open: boolean) => void

  // Language Selector open state
  languageSelectorOpen: boolean
  setLanguageSelectorOpen: (open: boolean) => void

  // Notification Center open state
  notificationCenterOpen: boolean
  setNotificationCenterOpen: (open: boolean) => void

  // Route Analytics open state
  routeAnalyticsOpen: boolean
  setRouteAnalyticsOpen: (open: boolean) => void

  // Collaboration open state
  collaborationOpen: boolean
  setCollaborationOpen: (open: boolean) => void

  // Coordinate Converter open state
  coordinateConverterOpen: boolean
  setCoordinateConverterOpen: (open: boolean) => void

  // Map Overlay Gallery dialog state (already has overlayGalleryOpen)
  // Spatial Analysis panel state
  spatialAnalysisOpen: boolean
  setSpatialAnalysisOpen: (open: boolean) => void

  // Map Stats Panel open state
  statsPanelOpen: boolean
  setStatsPanelOpen: (open: boolean) => void

  // Map Legend open state
  legendOpen: boolean
  setLegendOpen: (open: boolean) => void

  // Mini Map enabled state
  miniMapEnabled: boolean
  setMiniMapEnabled: (enabled: boolean) => void

  // Geofence Alert History open state (already has geofenceAlertOpen)
  // Contour Generator open state (already has contourGeneratorOpen)
  // MapLabels open state (already has mapLabelsOpen)
}

// Coordinate Share Card types
export interface ShareCardState {
  style: 'modern' | 'minimalist' | 'dark' | 'vintage'
  size: 'square' | 'landscape' | 'portrait'
  showQR: boolean
  showCoords: boolean
  showMap: boolean
  accentColor: string
  message: string
}

// Map Wallpaper Generator types
export interface WallpaperState {
  filter: 'vintage' | 'noir' | 'vibrant' | 'dreamy' | 'minimal' | 'custom'
  customFilter: { brightness: number; contrast: number; saturation: number; hue: number }
  resolution: string
  customWidth: number
  customHeight: number
  showClock: boolean
  showWeather: boolean
  showText: boolean
  textContent: string
  textPosition: string
  textFont: string
  textSize: string
  textColor: string
  textShadow: boolean
  vignette: boolean
  darkGradient: boolean
}

// Geofence Alert History types
export interface GeofenceEvent {
  id: string
  geofenceId: string
  geofenceName: string
  type: 'enter' | 'exit'
  timestamp: number
  latitude: number
  longitude: number
}

// Location Visit Timeline types
export interface TimelineEvent {
  id: string
  type: 'added' | 'visited' | 'edited' | 'deleted'
  locationId: string
  locationName: string
  timestamp: number
  latitude: number
  longitude: number
}

// Weather Comparison types
export interface WeatherComparisonLocation {
  locationId: string
  name: string
  latitude: number
  longitude: number
}

// Advanced Marker Manager types
export interface MarkerManagerState {
  selectedMarkerIds: string[]
  searchQuery: string
  filterCategory: string
  sortBy: 'name' | 'date' | 'distance'
  areaSelectMode: boolean
}

// Location Clustering types
export interface ClusterInfo {
  id: number
  center: [number, number]
  pointCount: number
  color: string
  locationIds: string[]
  radius: number
}

export interface ClusteringState {
  algorithm: 'kmeans' | 'dbscan'
  k: number
  epsilon: number
  minPoints: number
  clusters: ClusterInfo[]
  silhouetteScore: number | null
}

// Map Story types
export interface StoryStop {
  id: string
  title: string
  description: string
  longitude: number
  latitude: number
  zoom: number
  style?: string
  duration: number
  transition: 'flyTo' | 'jumpTo' | 'easeTo'
}

export interface MapStory {
  id: string
  name: string
  stops: StoryStop[]
  createdAt: string
}

// Route Playback types
export interface RoutePlaybackState {
  routeId: string | null
  isPlaying: boolean
  progress: number // 0-1
  speed: number // multiplier
  followCamera: boolean
}

// Speed Alert types
export interface SpeedZone {
  id: string
  longitude: number
  latitude: number
  radius: number // meters
  speedLimit: number // km/h
  label: string
}

export interface SpeedAlertEntry {
  timestamp: number
  speed: number
  limit: number
  zoneName?: string
}

// Altitude Alert System types
export interface AltitudeZone {
  id: string
  name: string
  minAlt: number
  maxAlt: number
  color: string
}

export interface AltitudeAlert {
  id: string
  type: 'target' | 'rate' | 'zone'
  value: number
  triggered: boolean
  timestamp: number | null
}

export interface AltitudeState {
  currentAltitude: number | null
  minAltitude: number | null
  maxAltitude: number | null
  targetAltitude: number | null
  zones: AltitudeZone[]
  alerts: AltitudeAlert[]
  history: { timestamp: number; altitude: number }[]
}

// Sun Shadow Calculator types
export interface ShadowBuilding {
  id: string
  longitude: number
  latitude: number
  height: number // meters
  name: string
}

export interface SunShadowState {
  buildings: ShadowBuilding[]
  selectedTime: number // hours (0-24)
  selectedDate: string // YYYY-MM-DD
  isAnimating: boolean
  animationSpeed: number
}

// SVG Marker Designer types
export interface SVGMarkerDesign {
  id: string
  name: string
  template: string
  fillColor: string
  strokeColor: string
  strokeWidth: number
  size: string
  opacity: number
  rotation: number
  innerIcon: string
  iconColor: string
  labelText: string
  labelFontSize: number
}

// Custom Compass Rose types
export interface CompassRoseState {
  style: 'classic' | 'modern' | 'nautical' | 'custom'
  points: number
  primaryColor: string
  secondaryColor: string
  size: 'small' | 'medium' | 'large'
  opacity: number
  showDegrees: boolean
  showLabels: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  visible: boolean
}

// Measurement Suite types
export interface MeasurementResult {
  id: string
  type: 'distance' | 'area' | 'angle' | 'circle' | 'perimeter'
  value: number
  unit: string
  points: [number, number][]
  timestamp: number
}

export interface MeasurementSuiteState {
  mode: 'distance' | 'area' | 'angle' | 'circle' | 'perimeter'
  unitSystem: 'metric' | 'imperial'
  results: MeasurementResult[]
  activeMode: boolean
}

// Trail Finder types
export interface TrailInfo {
  id: string
  name: string
  type: 'hiking' | 'cycling' | 'horse' | 'walking'
  difficulty: 'easy' | 'moderate' | 'hard'
  distance: number // meters
  elevationGain: number // meters
  surface: string
  coordinates: [number, number][]
}

// Screenshot Manager types
export interface ScreenshotEntry {
  id: string
  title: string
  description: string
  dataUrl: string
  format: 'png' | 'jpeg'
  quality: number
  timestamp: number
  center: [number, number]
  zoom: number
  style: string
}

// Route Difficulty Analyzer types
export interface RouteSegment {
  startIndex: number
  endIndex: number
  distance: number
  elevationChange: number
  grade: number
  difficulty: string
}

export interface DifficultyAnalysis {
  routeId: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard' | 'expert'
  score: number // 1-100
  totalGain: number
  totalLoss: number
  maxGrade: number
  avgGrade: number
  estimatedTime: number // minutes
  segments: RouteSegment[]
}

// Coordinate Grid Overlay types
export interface CoordinateGridState {
  enabled: boolean
  interval: number // degrees
  showLabels: boolean
  showMinorGrid: boolean
  latColor: string
  lngColor: string
}

// Map Overlay Gallery types
export interface MapOverlay {
  id: string
  name: string
  type: 'sea-level' | 'population' | 'light-pollution' | 'land-cover' | 'temperature' | 'wind' | 'precipitation' | 'custom'
  enabled: boolean
  opacity: number
  tileUrl?: string
  attribution?: string
  minZoom?: number
  maxZoom?: number
  isTms?: boolean
  description?: string
}

// Task 91: Volcanic Fumarole Monitor
export interface VolcanicFumaroleData {
  id: string
  name: string
  lat: number
  lng: number
  temperature: number
  gasComposition: string
  pressure: number
  status: 'active' | 'dormant' | 'intensifying'
  description: string
}

export interface VolcanicFumaroleState {
  open: boolean
  fumaroles: VolcanicFumaroleData[]
  activeFumaroleId: string | null
  statusFilter: 'all' | 'active' | 'dormant' | 'intensifying'
  showTemperature: boolean
  showGasComposition: boolean
  showPressure: boolean
}

// Task 91: Hydroclimate Extremes Monitor
export interface HydroclimateExtremesData {
  id: string
  name: string
  lat: number
  lng: number
  eventType: 'drought' | 'flood' | 'heatwave' | 'coldwave'
  severity: number
  duration: number
  description: string
}

export interface HydroclimateExtremesState {
  open: boolean
  events: HydroclimateExtremesData[]
  activeEventId: string | null
  typeFilter: 'all' | 'drought' | 'flood' | 'heatwave' | 'coldwave'
  showSeverity: boolean
  showDuration: boolean
  showTrend: boolean
}

// Task 91: Megafauna Tracker
export interface MegafaunaTrackingData {
  id: string
  name: string
  lat: number
  lng: number
  species: string
  population: number
  trend: 'increasing' | 'stable' | 'declining'
  habitatStatus: 'optimal' | 'stressed' | 'critical'
  description: string
}

export interface MegafaunaTrackingState {
  open: boolean
  animals: MegafaunaTrackingData[]
  activeAnimalId: string | null
  speciesFilter: 'all' | string
  showPopulation: boolean
  showTrend: boolean
  showHabitat: boolean
}

// Task 91: Cryoconite Hole Monitor
export interface CryoconiteHoleData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  diameter: number
  organicContent: number
  status: 'active' | 'frozen' | 'draining'
  description: string
}

export interface CryoconiteHoleState {
  open: boolean
  holes: CryoconiteHoleData[]
  activeHoleId: string | null
  statusFilter: 'all' | 'active' | 'frozen' | 'draining'
  showDepth: boolean
  showOrganicContent: boolean
  showDiameter: boolean
}

// Task 91: Sap Flow Monitor
export interface SapFlowData {
  id: string
  name: string
  lat: number
  lng: number
  species: string
  flowRate: number
  treeDiameter: number
  status: 'normal' | 'stress' | 'dormant'
  description: string
}

export interface SapFlowState {
  open: boolean
  sensors: SapFlowData[]
  activeSensorId: string | null
  statusFilter: 'all' | 'normal' | 'stress' | 'dormant'
  showFlowRate: boolean
  showTreeDiameter: boolean
  showTrend: boolean
}

// Task 91: Rockfall Hazard Monitor
export interface RockfallHazardData {
  id: string
  name: string
  lat: number
  lng: number
  hazardLevel: 'low' | 'moderate' | 'high' | 'extreme'
  slopeAngle: number
  rockVolume: number
  triggerType: string
  description: string
}

export interface RockfallHazardState {
  open: boolean
  zones: RockfallHazardData[]
  activeZoneId: string | null
  hazardFilter: 'all' | 'low' | 'moderate' | 'high' | 'extreme'
  showSlopeAngle: boolean
  showRockVolume: boolean
  showTriggerType: boolean
}

// Task 91: Thermohaline Circulation Monitor
export interface ThermohalineCirculationData {
  id: string
  name: string
  lat: number
  lng: number
  waterMass: string
  temperature: number
  salinity: number
  velocity: number
  status: 'strong' | 'weakening' | 'stalled'
  description: string
}

export interface ThermohalineCirculationState {
  open: boolean
  currents: ThermohalineCirculationData[]
  activeCurrentId: string | null
  statusFilter: 'all' | 'strong' | 'weakening' | 'stalled'
  showTemperature: boolean
  showSalinity: boolean
  showVelocity: boolean
}

export interface HydroseismicActivityData {
  id: string
  name: string
  lat: number
  lng: number
  magnitude: number
  depth: number
  waterLevel: number
  activityType: 'reservoir_induced' | 'geothermal' | 'submarine' | 'glacial'
  status: 'active' | 'quiet' | 'swarming'
  description: string
}

export interface HydroseismicActivityState {
  open: boolean
  events: HydroseismicActivityData[]
  activeEventId: string | null
  typeFilter: 'all' | 'reservoir_induced' | 'geothermal' | 'submarine' | 'glacial'
  showMagnitude: boolean
  showDepth: boolean
  showWaterLevel: boolean
}

export interface LavaTubeCaveData {
  id: string
  name: string
  lat: number
  lng: number
  length: number
  temperature: number
  lavaType: string
  status: 'active' | 'cooling' | 'dormant' | 'collapsed'
  description: string
}

export interface LavaTubeCaveState {
  open: boolean
  caves: LavaTubeCaveData[]
  activeCaveId: string | null
  statusFilter: 'all' | 'active' | 'cooling' | 'dormant' | 'collapsed'
  showLength: boolean
  showTemperature: boolean
  showLavaType: boolean
}

export interface SubmarineCanyonFisheriesData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  fishSpecies: string
  catchVolume: number
  status: 'productive' | 'depleted' | 'recovering' | 'protected'
  description: string
}

export interface SubmarineCanyonFisheriesState {
  open: boolean
  fisheries: SubmarineCanyonFisheriesData[]
  activeFisheryId: string | null
  statusFilter: 'all' | 'productive' | 'depleted' | 'recovering' | 'protected'
  showDepth: boolean
  showCatchVolume: boolean
  showFishSpecies: boolean
}

export interface PolynyaIceData {
  id: string
  name: string
  lat: number
  lng: number
  area: number
  iceThickness: number
  waterTemperature: number
  status: 'open' | 'refreezing' | 'seasonal' | 'permanent'
  description: string
}

export interface PolynyaIceState {
  open: boolean
  polynyas: PolynyaIceData[]
  activePolynyaId: string | null
  statusFilter: 'all' | 'open' | 'refreezing' | 'seasonal' | 'permanent'
  showArea: boolean
  showIceThickness: boolean
  showWaterTemperature: boolean
}

export interface VolcanicDomeGrowthData {
  id: string
  name: string
  lat: number
  lng: number
  growthRate: number
  domeVolume: number
  temperature: number
  status: 'growing' | 'stable' | 'collapsing' | 'exploding'
  description: string
}

export interface VolcanicDomeGrowthState {
  open: boolean
  domes: VolcanicDomeGrowthData[]
  activeDomeId: string | null
  statusFilter: 'all' | 'growing' | 'stable' | 'collapsing' | 'exploding'
  showGrowthRate: boolean
  showDomeVolume: boolean
  showTemperature: boolean
}

export interface SeamountBiodiversityData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  speciesCount: number
  endemismRate: number
  status: 'pristine' | 'threatened' | 'impacted' | 'protected'
  description: string
}

export interface SeamountBiodiversityState {
  open: boolean
  seamounts: SeamountBiodiversityData[]
  activeSeamountId: string | null
  statusFilter: 'all' | 'pristine' | 'threatened' | 'impacted' | 'protected'
  showDepth: boolean
  showSpeciesCount: boolean
  showEndemismRate: boolean
}

export interface EstuaryAcidificationData {
  id: string
  name: string
  lat: number
  lng: number
  pH: number
  alkalinity: number
  salinity: number
  status: 'healthy' | 'moderate' | 'acidified' | 'critical'
  description: string
}

export interface EstuaryAcidificationState {
  open: boolean
  estuaries: EstuaryAcidificationData[]
  activeEstuaryId: string | null
  statusFilter: 'all' | 'healthy' | 'moderate' | 'acidified' | 'critical'
  showPH: boolean
  showAlkalinity: boolean
  showSalinity: boolean
}

export interface AbyssalSedimentFluxData {
  id: string
  name: string
  lat: number
  lng: number
  sedimentRate: number
  depth: number
  fluxDirection: string
  status: 'depositing' | 'eroding' | 'stable' | 'turbidite'
  description: string
}

export interface AbyssalSedimentFluxState {
  open: boolean
  sites: AbyssalSedimentFluxData[]
  activeSiteId: string | null
  statusFilter: 'all' | 'depositing' | 'eroding' | 'stable' | 'turbidite'
  showSedimentRate: boolean
  showDepth: boolean
  showFluxDirection: boolean
}

export interface GlacialMoulinData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  flowRate: number
  diameter: number
  status: 'active' | 'seasonal' | 'frozen' | 'draining'
  description: string
}

export interface GlacialMoulinState {
  open: boolean
  moulins: GlacialMoulinData[]
  activeMoulinId: string | null
  statusFilter: 'all' | 'active' | 'seasonal' | 'frozen' | 'draining'
  showDepth: boolean
  showFlowRate: boolean
  showDiameter: boolean
}

export interface IceShelfCalvingData {
  id: string
  name: string
  lat: number
  lng: number
  area: number
  calvingRate: number
  thickness: number
  status: 'stable' | 'retreating' | 'accelerating' | 'collapsing'
  description: string
}

export interface IceShelfCalvingState {
  open: boolean
  shelves: IceShelfCalvingData[]
  activeShelfId: string | null
  statusFilter: 'all' | 'stable' | 'retreating' | 'accelerating' | 'collapsing'
  showArea: boolean
  showCalvingRate: boolean
  showThickness: boolean
}

export interface VolcanicGasPlumeData {
  id: string
  name: string
  lat: number
  lng: number
  so2Concentration: number
  plumeHeight: number
  gasType: string
  status: 'emitting' | 'elevated' | 'declining' | 'quiet'
  description: string
}

export interface VolcanicGasPlumeState {
  open: boolean
  plumes: VolcanicGasPlumeData[]
  activePlumeId: string | null
  statusFilter: 'all' | 'emitting' | 'elevated' | 'declining' | 'quiet'
  showSO2: boolean
  showPlumeHeight: boolean
  showGasType: boolean
}

export interface SubmarineLandslideData {
  id: string
  name: string
  lat: number
  lng: number
  volume: number
  depth: number
  slopeAngle: number
  status: 'susceptible' | 'creeping' | 'triggered' | 'post_failure'
  description: string
}

export interface SubmarineLandslideState {
  open: boolean
  slides: SubmarineLandslideData[]
  activeSlideId: string | null
  statusFilter: 'all' | 'susceptible' | 'creeping' | 'triggered' | 'post_failure'
  showVolume: boolean
  showDepth: boolean
  showSlopeAngle: boolean
}

export interface CoastalWetlandLossData {
  id: string
  name: string
  lat: number
  lng: number
  areaLost: number
  remainingArea: number
  lossRate: number
  status: 'intact' | 'degrading' | 'critical' | 'restored'
  description: string
}

export interface CoastalWetlandLossState {
  open: boolean
  wetlands: CoastalWetlandLossData[]
  activeWetlandId: string | null
  statusFilter: 'all' | 'intact' | 'degrading' | 'critical' | 'restored'
  showAreaLost: boolean
  showRemainingArea: boolean
  showLossRate: boolean
}

export interface TundraPermafrostThawData {
  id: string
  name: string
  lat: number
  lng: number
  activeLayerDepth: number
  groundTemperature: number
  thawRate: number
  status: 'frozen' | 'thawing' | 'degraded' | 'thermokarst'
  description: string
}

export interface TundraPermafrostThawState {
  open: boolean
  sites: TundraPermafrostThawData[]
  activeSiteId: string | null
  statusFilter: 'all' | 'frozen' | 'thawing' | 'degraded' | 'thermokarst'
  showActiveLayerDepth: boolean
  showGroundTemperature: boolean
  showThawRate: boolean
}

export interface OceanCurrentProfilerData {
  id: string
  name: string
  lat: number
  lng: number
  currentSpeed: number
  direction: number
  depth: number
  status: 'strong' | 'moderate' | 'weak' | 'reversed'
  description: string
}

export interface OceanCurrentProfilerState {
  open: boolean
  profiles: OceanCurrentProfilerData[]
  activeProfileId: string | null
  statusFilter: 'all' | 'strong' | 'moderate' | 'weak' | 'reversed'
  showCurrentSpeed: boolean
  showDirection: boolean
  showDepth: boolean
}

export interface DesertificationFrontData {
  id: string
  name: string
  lat: number
  lng: number
  advanceRate: number
  vegetationIndex: number
  soilMoisture: number
  status: 'advancing' | 'stable' | 'retreating' | 'severe'
  description: string
}

export interface DesertificationFrontState {
  open: boolean
  fronts: DesertificationFrontData[]
  activeFrontId: string | null
  statusFilter: 'all' | 'advancing' | 'stable' | 'retreating' | 'severe'
  showAdvanceRate: boolean
  showVegetationIndex: boolean
  showSoilMoisture: boolean
}

export interface CoralReefRecoveryData {
  id: string
  name: string
  lat: number
  lng: number
  liveCoralCover: number
  recoveryRate: number
  bleachingHistory: number
  status: 'recovering' | 'stable' | 'declining' | 'bleached'
  description: string
}

export interface CoralReefRecoveryState {
  open: boolean
  reefs: CoralReefRecoveryData[]
  activeReefId: string | null
  statusFilter: 'all' | 'recovering' | 'stable' | 'declining' | 'bleached'
  showLiveCoralCover: boolean
  showRecoveryRate: boolean
  showBleachingHistory: boolean
}

export interface MethaneCraterData {
  id: string
  name: string
  lat: number
  lng: number
  diameter: number
  depth: number
  methaneConcentration: number
  status: 'growing' | 'stable' | 'erupting' | 'dormant'
  description: string
}

export interface MethaneCraterState {
  open: boolean
  craters: MethaneCraterData[]
  activeCraterId: string | null
  statusFilter: 'all' | 'growing' | 'stable' | 'erupting' | 'dormant'
  showDiameter: boolean
  showDepth: boolean
  showMethaneConcentration: boolean
}

export interface SubglacialVolcanoData {
  id: string
  name: string
  lat: number
  lng: number
  iceThickness: number
  heatFlux: number
  eruptionProbability: number
  status: 'active' | 'unrest' | 'dormant' | 'monitoring'
  description: string
}

export interface SubglacialVolcanoState {
  open: boolean
  volcanoes: SubglacialVolcanoData[]
  activeVolcanoId: string | null
  statusFilter: 'all' | 'active' | 'unrest' | 'dormant' | 'monitoring'
  showIceThickness: boolean
  showHeatFlux: boolean
  showEruptionProbability: boolean
}

export interface CoralSpawnPredictionData {
  id: string
  name: string
  lat: number
  lng: number
  spawnDate: string
  waterTemperature: number
  moonPhase: string
  status: 'predicted' | 'spawning' | 'post_spawn' | 'delayed'
  description: string
}

export interface CoralSpawnPredictionState {
  open: boolean
  predictions: CoralSpawnPredictionData[]
  activePredictionId: string | null
  statusFilter: 'all' | 'predicted' | 'spawning' | 'post_spawn' | 'delayed'
  showSpawnDate: boolean
  showWaterTemperature: boolean
  showMoonPhase: boolean
}

export interface HydrothermalDiffuseFlowData {
  id: string
  name: string
  lat: number
  lng: number
  flowRate: number
  temperature: number
  chemosynthesisRate: number
  status: 'active' | 'waning' | 'pulsing' | 'extinct'
  description: string
}

export interface HydrothermalDiffuseFlowState {
  open: boolean
  flows: HydrothermalDiffuseFlowData[]
  activeFlowId: string | null
  statusFilter: 'all' | 'active' | 'waning' | 'pulsing' | 'extinct'
  showFlowRate: boolean
  showTemperature: boolean
  showChemosynthesisRate: boolean
}

export interface PermafrostCarbonPipelineData {
  id: string
  name: string
  lat: number
  lng: number
  carbonStock: number
  thawDepth: number
  pipelineRisk: number
  status: 'safe' | 'moderate' | 'high_risk' | 'critical'
  description: string
}

export interface PermafrostCarbonPipelineState {
  open: boolean
  segments: PermafrostCarbonPipelineData[]
  activeSegmentId: string | null
  statusFilter: 'all' | 'safe' | 'moderate' | 'high_risk' | 'critical'
  showCarbonStock: boolean
  showThawDepth: boolean
  showPipelineRisk: boolean
}

export interface SubaqueousLavaFlowData {
  id: string
  name: string
  lat: number
  lng: number
  flowLength: number
  depth: number
  lavaTemperature: number
  status: 'active' | 'inflating' | 'cooling' | 'solidified'
  description: string
}

export interface SubaqueousLavaFlowState {
  open: boolean
  flows: SubaqueousLavaFlowData[]
  activeFlowId: string | null
  statusFilter: 'all' | 'active' | 'inflating' | 'cooling' | 'solidified'
  showFlowLength: boolean
  showDepth: boolean
  showLavaTemperature: boolean
}

export interface IntertidalZoneData {
  id: string
  name: string
  lat: number
  lng: number
  tidalRange: number
  biodiversityIndex: number
  seaLevelRise: number
  status: 'healthy' | 'stressed' | 'degraded' | 'restored'
  description: string
}

export interface IntertidalZoneState {
  open: boolean
  zones: IntertidalZoneData[]
  activeZoneId: string | null
  statusFilter: 'all' | 'healthy' | 'stressed' | 'degraded' | 'restored'
  showTidalRange: boolean
  showBiodiversityIndex: boolean
  showSeaLevelRise: boolean
}

export interface DesertFlashFloodData {
  id: string
  name: string
  lat: number
  lng: number
  rainfallIntensity: number
  floodVolume: number
  catchmentArea: number
  status: 'watch' | 'warning' | 'active' | 'receding'
  description: string
}

export interface DesertFlashFloodState {
  open: boolean
  events: DesertFlashFloodData[]
  activeEventId: string | null
  statusFilter: 'all' | 'watch' | 'warning' | 'active' | 'receding'
  showRainfallIntensity: boolean
  showFloodVolume: boolean
  showCatchmentArea: boolean
}

export interface MudVolcanoActivityData {
  id: string
  name: string
  lat: number
  lng: number
  eruptionRate: number
  flowTemperature: number
  mudViscosity: number
  status: 'erupting' | 'flowing' | 'dormant' | 'monitoring'
  description: string
}

export interface MudVolcanoActivityState {
  open: boolean
  volcanoes: MudVolcanoActivityData[]
  activeVolcanoId: string | null
  statusFilter: 'all' | 'erupting' | 'flowing' | 'dormant' | 'monitoring'
  showEruptionRate: boolean
  showFlowTemperature: boolean
  showMudViscosity: boolean
}

export interface GlacierSurgeEventData {
  id: string
  name: string
  lat: number
  lng: number
  surgeVelocity: number
  iceDisplacement: number
  surgeDuration: number
  status: 'surging' | 'slowing' | 'stable' | 'post_surge'
  description: string
}

export interface GlacierSurgeEventState {
  open: boolean
  events: GlacierSurgeEventData[]
  activeEventId: string | null
  statusFilter: 'all' | 'surging' | 'slowing' | 'stable' | 'post_surge'
  showSurgeVelocity: boolean
  showIceDisplacement: boolean
  showSurgeDuration: boolean
}

export interface SeicheWaveOscillationData {
  id: string
  name: string
  lat: number
  lng: number
  waveAmplitude: number
  oscillationPeriod: number
  waterLevelChange: number
  status: 'active' | 'subsiding' | 'standing' | 'calm'
  description: string
}

export interface SeicheWaveOscillationState {
  open: boolean
  oscillations: SeicheWaveOscillationData[]
  activeOscillationId: string | null
  statusFilter: 'all' | 'active' | 'subsiding' | 'standing' | 'calm'
  showWaveAmplitude: boolean
  showOscillationPeriod: boolean
  showWaterLevelChange: boolean
}

export interface LaharFlowTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  flowVelocity: number
  sedimentConcentration: number
  flowVolume: number
  status: 'active' | 'advancing' | 'channelized' | 'deposited'
  description: string
}

export interface LaharFlowTrackerState {
  open: boolean
  flows: LaharFlowTrackerData[]
  activeFlowId: string | null
  statusFilter: 'all' | 'active' | 'advancing' | 'channelized' | 'deposited'
  showFlowVelocity: boolean
  showSedimentConcentration: boolean
  showFlowVolume: boolean
}

export interface IcePenitentMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  spikeHeight: number
  formationDensity: number
  surfaceTemperature: number
  status: 'forming' | 'stable' | 'melting' | 'degraded'
  description: string
}

export interface IcePenitentMonitorState {
  open: boolean
  formations: IcePenitentMonitorData[]
  activeFormationId: string | null
  statusFilter: 'all' | 'forming' | 'stable' | 'melting' | 'degraded'
  showSpikeHeight: boolean
  showFormationDensity: boolean
  showSurfaceTemperature: boolean
}

export interface FrostHeaveMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  heaveAmount: number
  groundTemperature: number
  soilMoistureContent: number
  status: 'heaving' | 'frozen' | 'thawing' | 'stable'
  description: string
}

export interface FrostHeaveMonitorState {
  open: boolean
  sites: FrostHeaveMonitorData[]
  activeSiteId: string | null
  statusFilter: 'all' | 'heaving' | 'frozen' | 'thawing' | 'stable'
  showHeaveAmount: boolean
  showGroundTemperature: boolean
  showSoilMoistureContent: boolean
}

export interface PumiceRaftDriftData {
  id: string
  name: string
  lat: number
  lng: number
  raftArea: number
  driftSpeed: number
  pumiceDensity: number
  status: 'drifting' | 'dispersing' | 'beaching' | 'sinking'
  description: string
}

export interface PumiceRaftDriftState {
  open: boolean
  rafts: PumiceRaftDriftData[]
  activeRaftId: string | null
  statusFilter: 'all' | 'drifting' | 'dispersing' | 'beaching' | 'sinking'
  showRaftArea: boolean
  showDriftSpeed: boolean
  showPumiceDensity: boolean
}

export interface LimnicEruptionMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  co2Concentration: number
  gasReleaseRate: number
  waterDepth: number
  status: 'critical' | 'elevated' | 'monitoring' | 'stable'
  description: string
}

export interface LimnicEruptionMonitorState {
  open: boolean
  lakes: LimnicEruptionMonitorData[]
  activeLakeId: string | null
  statusFilter: 'all' | 'critical' | 'elevated' | 'monitoring' | 'stable'
  showCO2Concentration: boolean
  showGasReleaseRate: boolean
  showWaterDepth: boolean
}

// Task 95: Volcanic Tremor Monitor
export interface VolcanicTremorData {
  id: string
  name: string
  lat: number
  lng: number
  amplitude: number
  frequency: number
  duration: number
  status: 'harmonic' | 'spasmodic' | 'continuous' | 'tremor_free'
  description: string
}

export interface VolcanicTremorState {
  open: boolean
  data: VolcanicTremorData[]
  showAmplitude: boolean
  showFrequency: boolean
  showDuration: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Ice Wedge Polygon Monitor
export interface IceWedgePolygonData {
  id: string
  name: string
  lat: number
  lng: number
  polygonArea: number
  wedgeDepth: number
  degradationRate: number
  status: 'intact' | 'degrading' | 'thawed' | 'thermokarst'
  description: string
}

export interface IceWedgePolygonState {
  open: boolean
  data: IceWedgePolygonData[]
  showPolygonArea: boolean
  showWedgeDepth: boolean
  showDegradationRate: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Salt Flat Crust Monitor
export interface SaltFlatCrustData {
  id: string
  name: string
  lat: number
  lng: number
  crustThickness: number
  salinity: number
  moistureContent: number
  status: 'crystalline' | 'deliquescent' | 'eroding' | 'submerged'
  description: string
}

export interface SaltFlatCrustState {
  open: boolean
  data: SaltFlatCrustData[]
  showCrustThickness: boolean
  showSalinity: boolean
  showMoistureContent: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Cold Water Coral Reef Monitor
export interface ColdWaterCoralReefData {
  id: string
  name: string
  lat: number
  lng: number
  depth: number
  temperature: number
  coralCover: number
  status: 'thriving' | 'stressed' | 'bleached' | 'protected'
  description: string
}

export interface ColdWaterCoralReefState {
  open: boolean
  data: ColdWaterCoralReefData[]
  showDepth: boolean
  showTemperature: boolean
  showCoralCover: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Peatland Carbon Sink Monitor
export interface PeatlandCarbonSinkData {
  id: string
  name: string
  lat: number
  lng: number
  carbonStock: number
  sequestrationRate: number
  waterTableDepth: number
  status: 'accumulating' | 'stable' | 'emitting' | 'degraded'
  description: string
}

export interface PeatlandCarbonSinkState {
  open: boolean
  data: PeatlandCarbonSinkData[]
  showCarbonStock: boolean
  showSequestrationRate: boolean
  showWaterTableDepth: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Hyporheic Zone Monitor
export interface HyporheicZoneData {
  id: string
  name: string
  lat: number
  lng: number
  exchangeRate: number
  residenceTime: number
  temperature: number
  status: 'active' | 'restricted' | 'stagnant' | 'flowing'
  description: string
}

export interface HyporheicZoneState {
  open: boolean
  data: HyporheicZoneData[]
  showExchangeRate: boolean
  showResidenceTime: boolean
  showTemperature: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Submarine Fan Monitor
export interface SubmarineFanData {
  id: string
  name: string
  lat: number
  lng: number
  sedimentationRate: number
  channelDepth: number
  fanArea: number
  status: 'active' | 'abandoned' | 'channelized' | 'hemipelagic'
  description: string
}

export interface SubmarineFanState {
  open: boolean
  data: SubmarineFanData[]
  showSedimentationRate: boolean
  showChannelDepth: boolean
  showFanArea: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 95: Coastal Dune System Monitor
export interface CoastalDuneSystemData {
  id: string
  name: string
  lat: number
  lng: number
  duneHeight: number
  erosionRate: number
  vegetationCover: number
  status: 'accreting' | 'stable' | 'eroding' | 'breached'
  description: string
}

export interface CoastalDuneSystemState {
  open: boolean
  data: CoastalDuneSystemData[]
  showDuneHeight: boolean
  showErosionRate: boolean
  showVegetationCover: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Karst Spring Discharge Monitor
export interface KarstSpringDischargeData {
  id: string
  name: string
  lat: number
  lng: number
  dischargeRate: number
  waterTemperature: number
  conductivity: number
  status: 'flowing' | 'seasonal' | 'dry' | 'flooding'
  description: string
}

export interface KarstSpringDischargeState {
  open: boolean
  data: KarstSpringDischargeData[]
  showDischargeRate: boolean
  showWaterTemperature: boolean
  showConductivity: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Cave Drip Monitor
export interface CaveDripMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  dripRate: number
  calciumConcentration: number
  pHDrip: number
  status: 'active' | 'slow' | 'dry' | 'contaminated'
  description: string
}

export interface CaveDripMonitorState {
  open: boolean
  data: CaveDripMonitorData[]
  showDripRate: boolean
  showCalciumConcentration: boolean
  showPHDrip: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Tidal Creek Monitor
export interface TidalCreekMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  tidalRange: number
  creekDepth: number
  salinity: number
  status: 'flooding' | 'ebbing' | 'neap' | 'spring'
  description: string
}

export interface TidalCreekMonitorState {
  open: boolean
  data: TidalCreekMonitorData[]
  showTidalRange: boolean
  showCreekDepth: boolean
  showSalinity: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Salt Marsh Carbon Monitor
export interface SaltMarshCarbonData {
  id: string
  name: string
  lat: number
  lng: number
  carbonStock: number
  accretionRate: number
  vegetationCover: number
  status: 'sequestering' | 'stable' | 'emitting' | 'eroding'
  description: string
}

export interface SaltMarshCarbonState {
  open: boolean
  data: SaltMarshCarbonData[]
  showCarbonStock: boolean
  showAccretionRate: boolean
  showVegetationCover: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Opal Paleo Monitor
export interface OpalPaleoMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  opalConcentration: number
  diatomCount: number
  sedimentAge: number
  status: 'pristine' | 'processed' | 'degraded' | 'archived'
  description: string
}

export interface OpalPaleoMonitorState {
  open: boolean
  data: OpalPaleoMonitorData[]
  showOpalConcentration: boolean
  showDiatomCount: boolean
  showSedimentAge: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Aeolian Dust Deposition Monitor
export interface AeolianDustDepositionData {
  id: string
  name: string
  lat: number
  lng: number
  depositionRate: number
  particleSize: number
  dustOrigin: number
  status: 'heavy' | 'moderate' | 'light' | 'settled'
  description: string
}

export interface AeolianDustDepositionState {
  open: boolean
  data: AeolianDustDepositionData[]
  showDepositionRate: boolean
  showParticleSize: boolean
  showDustOrigin: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Katabatic Wind Monitor
export interface KatabaticWindMonitorData {
  id: string
  name: string
  lat: number
  lng: number
  windSpeed: number
  temperature: number
  windChill: number
  status: 'gale' | 'strong' | 'moderate' | 'calm'
  description: string
}

export interface KatabaticWindMonitorState {
  open: boolean
  data: KatabaticWindMonitorData[]
  showWindSpeed: boolean
  showTemperature: boolean
  showWindChill: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 96: Snow Avalanche Tracker
export interface SnowAvalancheTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  slopeAngle: number
  snowDepth: number
  avalancheSize: number
  status: 'recent' | 'likely' | 'possible' | 'unlikely'
  description: string
}

export interface SnowAvalancheTrackerState {
  open: boolean
  data: SnowAvalancheTrackerData[]
  showSlopeAngle: boolean
  showSnowDepth: boolean
  showAvalancheSize: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Rift Valley Volcano
export interface RiftValleyVolcanoData {
  id: string
  name: string
  lat: number
  lng: number
  magmaChamberDepth: number
  deformationRate: number
  so2Emission: number
  status: 'active' | 'dormant' | 'fissuring' | 'caldera_formation'
  description: string
}

export interface RiftValleyVolcanoState {
  open: boolean
  data: RiftValleyVolcanoData[]
  showMagmaChamberDepth: boolean
  showDeformationRate: boolean
  showSo2Emission: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Stream Bank Erosion
export interface StreamBankErosionData {
  id: string
  name: string
  lat: number
  lng: number
  erosionRate: number
  bankAngle: number
  vegetationCover: number
  status: 'severe' | 'moderate' | 'minimal' | 'stabilized'
  description: string
}

export interface StreamBankErosionState {
  open: boolean
  data: StreamBankErosionData[]
  showErosionRate: boolean
  showBankAngle: boolean
  showVegetationCover: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Ice Stream Velocity
export interface IceStreamVelocityData {
  id: string
  name: string
  lat: number
  lng: number
  flowVelocity: number
  iceThickness: number
  basalShearStress: number
  status: 'accelerating' | 'stable' | 'decelerating' | 'stagnant'
  description: string
}

export interface IceStreamVelocityState {
  open: boolean
  data: IceStreamVelocityData[]
  showFlowVelocity: boolean
  showIceThickness: boolean
  showBasalShearStress: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Coastal Aquifer
export interface CoastalAquiferData {
  id: string
  name: string
  lat: number
  lng: number
  saltwaterFront: number
  waterTableDepth: number
  chlorideConcentration: number
  status: 'intruded' | 'advancing' | 'stable' | 'protected'
  description: string
}

export interface CoastalAquiferState {
  open: boolean
  data: CoastalAquiferData[]
  showSaltwaterFront: boolean
  showWaterTableDepth: boolean
  showChlorideConcentration: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Mangrove Root System
export interface MangroveRootSystemData {
  id: string
  name: string
  lat: number
  lng: number
  rootDensity: number
  sedimentAccretion: number
  carbonStock: number
  status: 'healthy' | 'stressed' | 'declining' | 'restored'
  description: string
}

export interface MangroveRootSystemState {
  open: boolean
  data: MangroveRootSystemData[]
  showRootDensity: boolean
  showSedimentAccretion: boolean
  showCarbonStock: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Paleoshoreline Tracker
export interface PaleoshorelineTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  shorelineAge: number
  elevation: number
  seaLevelIndicator: number
  status: 'preserved' | 'exposed' | 'eroding' | 'submerged'
  description: string
}

export interface PaleoshorelineTrackerState {
  open: boolean
  data: PaleoshorelineTrackerData[]
  showShorelineAge: boolean
  showElevation: boolean
  showSeaLevelIndicator: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Cryoconite Granule
export interface CryoconiteGranuleData {
  id: string
  name: string
  lat: number
  lng: number
  granuleDiameter: number
  organicContent: number
  albedoEffect: number
  status: 'forming' | 'active' | 'melting' | 'deposited'
  description: string
}

export interface CryoconiteGranuleState {
  open: boolean
  data: CryoconiteGranuleData[]
  showGranuleDiameter: boolean
  showOrganicContent: boolean
  showAlbedoEffect: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 97: Subglacial Water System
export interface SubglacialWaterSystemData {
  id: string
  name: string
  lat: number
  lng: number
  waterPressure: number
  flowRate: number
  channelDiameter: number
  status: 'active' | 'drainage' | 'pressure_building' | 'quiescent'
  description: string
}

export interface SubglacialWaterSystemState {
  open: boolean
  data: SubglacialWaterSystemData[]
  showWaterPressure: boolean
  showFlowRate: boolean
  showChannelDiameter: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 98: Mass Wasting and Slope Processes
export interface LandslideVelocityData {
  id: string
  name: string
  lat: number
  lng: number
  velocity: number        // mm/day
  displacement: number    // mm total
  depth: number           // m (slide surface depth)
  status: 'active' | 'slow' | 'dormant' | 'accelerating'
  description: string
}

export interface LandslideVelocityState {
  open: boolean
  data: LandslideVelocityData[]
  showVelocity: boolean
  showDisplacement: boolean
  showDepth: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface DebrisFlowSurgeData {
  id: string
  name: string
  lat: number
  lng: number
  surgeVolume: number     // m³
  flowVelocity: number    // m/s
  sedimentConcentration: number // %
  status: 'surging' | 'flowing' | 'waning' | 'deposited'
  description: string
}

export interface DebrisFlowSurgeState {
  open: boolean
  data: DebrisFlowSurgeData[]
  showSurgeVolume: boolean
  showFlowVelocity: boolean
  showSedimentConcentration: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface RockfallImpactData {
  id: string
  name: string
  lat: number
  lng: number
  impactEnergy: number    // kJ
  blockVolume: number     // m³
  frequency: number       // events/month
  status: 'frequent' | 'moderate' | 'rare' | 'stable'
  description: string
}

export interface RockfallImpactState {
  open: boolean
  data: RockfallImpactData[]
  showImpactEnergy: boolean
  showBlockVolume: boolean
  showFrequency: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SoilCreepRateData {
  id: string
  name: string
  lat: number
  lng: number
  creepRate: number       // mm/year
  soilMoisture: number    // %
  slopeAngle: number      // degrees
  status: 'rapid' | 'moderate' | 'slow' | 'negligible'
  description: string
}

export interface SoilCreepRateState {
  open: boolean
  data: SoilCreepRateData[]
  showCreepRate: boolean
  showSoilMoisture: boolean
  showSlopeAngle: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SolifluctionLobeData {
  id: string
  name: string
  lat: number
  lng: number
  lobeVelocity: number    // cm/year
  lobeWidth: number       // m
  activeLayerDepth: number // cm
  status: 'active' | 'paused' | 'seasonal' | 'stable'
  description: string
}

export interface SolifluctionLobeState {
  open: boolean
  data: SolifluctionLobeData[]
  showLobeVelocity: boolean
  showLobeWidth: boolean
  showActiveLayerDepth: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface EarthflowDisplacementData {
  id: string
  name: string
  lat: number
  lng: number
  displacement: number    // cm
  flowRate: number        // cm/day
  moistureContent: number // %
  status: 'rapid' | 'moderate' | 'slow' | 'stabilized'
  description: string
}

export interface EarthflowDisplacementState {
  open: boolean
  data: EarthflowDisplacementData[]
  showDisplacement: boolean
  showFlowRate: boolean
  showMoistureContent: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SlumpFailureData {
  id: string
  name: string
  lat: number
  lng: number
  scarpHeight: number     // m
  rotationAngle: number   // degrees
  porePressure: number    // kPa
  status: 'failing' | 'creeping' | 'remodeling' | 'stabilized'
  description: string
}

export interface SlumpFailureState {
  open: boolean
  data: SlumpFailureData[]
  showScarpHeight: boolean
  showRotationAngle: boolean
  showPorePressure: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface TalusAccumulationData {
  id: string
  name: string
  lat: number
  lng: number
  accumulationRate: number // cm/year
  talusVolume: number      // m³
  slopeAngle: number       // degrees
  status: 'accumulating' | 'redistributing' | 'weathering' | 'stable'
  description: string
}

export interface TalusAccumulationState {
  open: boolean
  data: TalusAccumulationData[]
  showAccumulationRate: boolean
  showTalusVolume: boolean
  showSlopeAngle: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 99: Coastal Engineering and Shore Protection
export interface BreakwaterIntegrityData {
  id: string
  name: string
  lat: number
  lng: number
  structuralHealth: number  // %
  waveForce: number         // kN/m
  overtoppingRate: number   // l/s/m
  status: 'critical' | 'degraded' | 'fair' | 'intact'
  description: string
}

export interface BreakwaterIntegrityState {
  open: boolean
  data: BreakwaterIntegrityData[]
  showStructuralHealth: boolean
  showWaveForce: boolean
  showOvertoppingRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SeawallErosionData {
  id: string
  name: string
  lat: number
  lng: number
  erosionRate: number       // mm/year
  scourDepth: number        // m
  wallDisplacement: number  // mm
  status: 'failing' | 'eroding' | 'stable' | 'reinforced'
  description: string
}

export interface SeawallErosionState {
  open: boolean
  data: SeawallErosionData[]
  showErosionRate: boolean
  showScourDepth: boolean
  showWallDisplacement: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GroinSedimentData {
  id: string
  name: string
  lat: number
  lng: number
  accretionRate: number     // m³/year
  bypassRate: number        // m³/year
  updriftWidth: number      // m
  status: 'accreting' | 'bypassing' | 'equilibrium' | 'eroding'
  description: string
}

export interface GroinSedimentState {
  open: boolean
  data: GroinSedimentData[]
  showAccretionRate: boolean
  showBypassRate: boolean
  showUpdriftWidth: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface RevetmentStabilityData {
  id: string
  name: string
  lat: number
  lng: number
  armorIntegrity: number    // %
  slopeDisplacement: number // mm
  underpressure: number     // kPa
  status: 'breached' | 'shifting' | 'settling' | 'stable'
  description: string
}

export interface RevetmentStabilityState {
  open: boolean
  data: RevetmentStabilityData[]
  showArmorIntegrity: boolean
  showSlopeDisplacement: boolean
  showUnderpressure: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface JettyCurrentData {
  id: string
  name: string
  lat: number
  lng: number
  currentSpeed: number      // m/s
  eddyIntensity: number     // %
  sedimentDeposition: number // m³/year
  status: 'dangerous' | 'moderate' | 'calm' | 'navigable'
  description: string
}

export interface JettyCurrentState {
  open: boolean
  data: JettyCurrentData[]
  showCurrentSpeed: boolean
  showEddyIntensity: boolean
  showSedimentDeposition: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface BeachNourishmentData {
  id: string
  name: string
  lat: number
  lng: number
  fillVolume: number        // m³
  retentionRate: number     // %
  shorelineChange: number   // m/year
  status: 'losing' | 'depleting' | 'retaining' | 'gaining'
  description: string
}

export interface BeachNourishmentState {
  open: boolean
  data: BeachNourishmentData[]
  showFillVolume: boolean
  showRetentionRate: boolean
  showShorelineChange: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface CoastalArmorData {
  id: string
  name: string
  lat: number
  lng: number
  armorWeight: number       // tonnes
  displacementRate: number  // m/year
  waveRunup: number         // m
  status: 'displaced' | 'settling' | 'stable' | 'reinforced'
  description: string
}

export interface CoastalArmorState {
  open: boolean
  data: CoastalArmorData[]
  showArmorWeight: boolean
  showDisplacementRate: boolean
  showWaveRunup: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface ShorelineRetreatData {
  id: string
  name: string
  lat: number
  lng: number
  retreatRate: number       // m/year
  cliffHeight: number       // m
  waveEnergy: number        // kJ/m
  status: 'rapid' | 'moderate' | 'slow' | 'accreting'
  description: string
}

export interface ShorelineRetreatState {
  open: boolean
  data: ShorelineRetreatData[]
  showRetreatRate: boolean
  showCliffHeight: boolean
  showWaveEnergy: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 100: Soil Science and Pedology
export interface SoilOrganicCarbonData {
  id: string
  name: string
  lat: number
  lng: number
  carbonContent: number   // g/kg
  bulkDensity: number     // g/cm³
  decompositionRate: number // mg CO2/kg/day
  status: 'rich' | 'moderate' | 'depleted' | 'critical'
  description: string
}

export interface SoilOrganicCarbonState {
  open: boolean
  data: SoilOrganicCarbonData[]
  showCarbonContent: boolean
  showBulkDensity: boolean
  showDecompositionRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface CationExchangeData {
  id: string
  name: string
  lat: number
  lng: number
  cec: number              // cmol/kg
  baseSaturation: number   // %
  phLevel: number
  status: 'fertile' | 'adequate' | 'low' | 'degraded'
  description: string
}

export interface CationExchangeState {
  open: boolean
  data: CationExchangeData[]
  showCec: boolean
  showBaseSaturation: boolean
  showPhLevel: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SoilPhosphorusData {
  id: string
  name: string
  lat: number
  lng: number
  availableP: number      // mg/kg
  totalP: number          // mg/kg
  retentionCapacity: number // %
  status: 'optimal' | 'adequate' | 'deficient' | 'locked'
  description: string
}

export interface SoilPhosphorusState {
  open: boolean
  data: SoilPhosphorusData[]
  showAvailableP: boolean
  showTotalP: boolean
  showRetentionCapacity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SoilCompactionData {
  id: string
  name: string
  lat: number
  lng: number
  penetrationResistance: number // MPa
  bulkDensity: number           // g/cm³
  porosity: number              // %
  status: 'severe' | 'moderate' | 'slight' | 'loose'
  description: string
}

export interface SoilCompactionState {
  open: boolean
  data: SoilCompactionData[]
  showPenetrationResistance: boolean
  showBulkDensity: boolean
  showPorosity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface ClayMineralData {
  id: string
  name: string
  lat: number
  lng: number
  swellPotential: number  // %
  plasticityIndex: number
  shrinkageLimit: number  // %
  status: 'expansive' | 'moderate' | 'low' | 'stable'
  description: string
}

export interface ClayMineralState {
  open: boolean
  data: ClayMineralData[]
  showSwellPotential: boolean
  showPlasticityIndex: boolean
  showShrinkageLimit: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PodzolProfileData {
  id: string
  name: string
  lat: number
  lng: number
  eluviationDepth: number // cm
  illuviationDepth: number // cm
  organicLayer: number    // cm
  status: 'active' | 'developing' | 'degraded' | 'buried'
  description: string
}

export interface PodzolProfileState {
  open: boolean
  data: PodzolProfileData[]
  showEluviationDepth: boolean
  showIlluviationDepth: boolean
  showOrganicLayer: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GleyRedoxData {
  id: string
  name: string
  lat: number
  lng: number
  redoxPotential: number  // mV
  waterTableDepth: number // cm
  ironReduction: number   // %
  status: 'reduced' | 'transitional' | 'oxidized' | 'fluctuating'
  description: string
}

export interface GleyRedoxState {
  open: boolean
  data: GleyRedoxData[]
  showRedoxPotential: boolean
  showWaterTableDepth: boolean
  showIronReduction: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface CalcicHorizonData {
  id: string
  name: string
  lat: number
  lng: number
  caco3Content: number    // %
  horizonDepth: number    // cm
  noduleDensity: number   // per m²
  status: 'indurated' | 'cemented' | 'developing' | 'incipient'
  description: string
}

export interface CalcicHorizonState {
  open: boolean
  data: CalcicHorizonData[]
  showCaco3Content: boolean
  showHorizonDepth: boolean
  showNoduleDensity: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 101: Mineral Resources and Mining
export interface OreGradeAssayData {
  id: string
  name: string
  lat: number
  lng: number
  metalGrade: number        // g/t or %
  cutoffGrade: number       // g/t or %
  recoveryRate: number      // %
  status: 'high_grade' | 'economic' | 'marginal' | 'subeconomic'
  description: string
}

export interface OreGradeAssayState {
  open: boolean
  data: OreGradeAssayData[]
  showMetalGrade: boolean
  showCutoffGrade: boolean
  showRecoveryRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface MineTailingsDamData {
  id: string
  name: string
  lat: number
  lng: number
  damHeight: number         // m
  storageVolume: number     // million m³
  phreaticLevel: number     // m from base
  status: 'critical' | 'elevated' | 'normal' | 'draining'
  description: string
}

export interface MineTailingsDamState {
  open: boolean
  data: MineTailingsDamData[]
  showDamHeight: boolean
  showStorageVolume: boolean
  showPhreaticLevel: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface MineralVeinThicknessData {
  id: string
  name: string
  lat: number
  lng: number
  veinWidth: number         // cm
  oreMineral: number        // %
  depthExtent: number       // m
  status: 'thick' | 'moderate' | 'thin' | 'pinching'
  description: string
}

export interface MineralVeinThicknessState {
  open: boolean
  data: MineralVeinThicknessData[]
  showVeinWidth: boolean
  showOreMineral: boolean
  showDepthExtent: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface StripMineRatioData {
  id: string
  name: string
  lat: number
  lng: number
  stripRatio: number        // waste:ore
  overburdenDepth: number   // m
  oreThickness: number      // m
  status: 'favorable' | 'marginal' | 'high' | 'uneconomic'
  description: string
}

export interface StripMineRatioState {
  open: boolean
  data: StripMineRatioData[]
  showStripRatio: boolean
  showOverburdenDepth: boolean
  showOreThickness: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface UndergroundMineVentData {
  id: string
  name: string
  lat: number
  lng: number
  airflowRate: number       // m³/s
  methaneLevel: number      // %
  temperature: number       // °C
  status: 'dangerous' | 'alert' | 'adequate' | 'optimal'
  description: string
}

export interface UndergroundMineVentState {
  open: boolean
  data: UndergroundMineVentData[]
  showAirflowRate: boolean
  showMethaneLevel: boolean
  showTemperature: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AcidMineDrainageData {
  id: string
  name: string
  lat: number
  lng: number
  pH: number
  ironConcentration: number // mg/L
  sulfateLevel: number      // mg/L
  status: 'severe' | 'moderate' | 'mild' | 'neutral'
  description: string
}

export interface AcidMineDrainageState {
  open: boolean
  data: AcidMineDrainageData[]
  showPH: boolean
  showIronConcentration: boolean
  showSulfateLevel: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface OreReserveEstimateData {
  id: string
  name: string
  lat: number
  lng: number
  provenReserve: number     // Mt
  probableReserve: number   // Mt
  resourceGrade: number     // g/t
  status: 'proven' | 'probable' | 'inferred' | 'exploration'
  description: string
}

export interface OreReserveEstimateState {
  open: boolean
  data: OreReserveEstimateData[]
  showProvenReserve: boolean
  showProbableReserve: boolean
  showResourceGrade: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface MineralDepositGradeData {
  id: string
  name: string
  lat: number
  lng: number
  depositTonnes: number     // Mt
  averageGrade: number      // %
  containedMetal: number    // kt
  status: 'giant' | 'major' | 'moderate' | 'small'
  description: string
}

export interface MineralDepositGradeState {
  open: boolean
  data: MineralDepositGradeData[]
  showDepositTonnes: boolean
  showAverageGrade: boolean
  showContainedMetal: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 102: Ocean Circulation and Currents
export interface ThermohalineCellData {
  id: string
  name: string
  lat: number
  lng: number
  overturningRate: number   // Sv (Sverdrups)
  temperature: number       // °C
  salinity: number          // PSU
  status: 'strong' | 'moderate' | 'weakening' | 'collapsed'
  description: string
}

export interface ThermohalineCellState {
  open: boolean
  data: ThermohalineCellData[]
  showOverturningRate: boolean
  showTemperature: boolean
  showSalinity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface EkmanTransportData {
  id: string
  name: string
  lat: number
  lng: number
  transportAngle: number    // degrees
  windSpeed: number         // m/s
  surfaceVelocity: number   // m/s
  status: 'aligned' | 'deflected' | 'reversed' | 'calm'
  description: string
}

export interface EkmanTransportState {
  open: boolean
  data: EkmanTransportData[]
  showTransportAngle: boolean
  showWindSpeed: boolean
  showSurfaceVelocity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GeostrophicCurrentData {
  id: string
  name: string
  lat: number
  lng: number
  currentSpeed: number      // m/s
  pressureGradient: number  // Pa/km
  coriolisEffect: number    // 10^-4 s^-1
  status: 'intense' | 'moderate' | 'weak' | 'stagnant'
  description: string
}

export interface GeostrophicCurrentState {
  open: boolean
  data: GeostrophicCurrentData[]
  showCurrentSpeed: boolean
  showPressureGradient: boolean
  showCoriolisEffect: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface UpwellingIntensityData {
  id: string
  name: string
  lat: number
  lng: number
  upwellingVelocity: number // m/day
  sstAnomaly: number        // °C
  chlorophyllConcentration: number // mg/m³
  status: 'strong' | 'moderate' | 'weak' | 'suppressed'
  description: string
}

export interface UpwellingIntensityState {
  open: boolean
  data: UpwellingIntensityData[]
  showUpwellingVelocity: boolean
  showSstAnomaly: boolean
  showChlorophyllConcentration: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface WesternBoundaryData {
  id: string
  name: string
  lat: number
  lng: number
  peakVelocity: number      // m/s
  transportVolume: number   // Sv
  meanderAmplitude: number  // km
  status: 'intensified' | 'normal' | 'weakened' | 'detached'
  description: string
}

export interface WesternBoundaryState {
  open: boolean
  data: WesternBoundaryData[]
  showPeakVelocity: boolean
  showTransportVolume: boolean
  showMeanderAmplitude: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface DeepWaterFormationData {
  id: string
  name: string
  lat: number
  lng: number
  convectionDepth: number   // m
  densityAnomaly: number    // kg/m³
  formationRate: number     // Sv
  status: 'active' | 'seasonal' | 'reduced' | 'absent'
  description: string
}

export interface DeepWaterFormationState {
  open: boolean
  data: DeepWaterFormationData[]
  showConvectionDepth: boolean
  showDensityAnomaly: boolean
  showFormationRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface OceanGyreData {
  id: string
  name: string
  lat: number
  lng: number
  rotationPeriod: number    // days
  diameter: number          // km
  eddyKineticEnergy: number // cm²/s²
  status: 'energetic' | 'stable' | 'shrinking' | 'expanding'
  description: string
}

export interface OceanGyreState {
  open: boolean
  data: OceanGyreData[]
  showRotationPeriod: boolean
  showDiameter: boolean
  showEddyKineticEnergy: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface TropicalCurrentData {
  id: string
  name: string
  lat: number
  lng: number
  currentSpeed: number      // m/s
  temperature: number       // °C
  freshwaterFlux: number    // m/year
  status: 'surging' | 'flowing' | 'slack' | 'reversed'
  description: string
}

export interface TropicalCurrentState {
  open: boolean
  data: TropicalCurrentData[]
  showCurrentSpeed: boolean
  showTemperature: boolean
  showFreshwaterFlux: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 103: Atmospheric Dynamics and Weather
export interface JetStreamPositionData {
  id: string
  name: string
  lat: number
  lng: number
  latitudePosition: number  // degrees N/S
  windSpeed: number         // m/s
  meanderIndex: number      // dimensionless
  status: 'amplified' | 'zonal' | 'blocked' | 'split'
  description: string
}

export interface JetStreamPositionState {
  open: boolean
  data: JetStreamPositionData[]
  showLatitudePosition: boolean
  showWindSpeed: boolean
  showMeanderIndex: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AtmosphericPressureCellData {
  id: string
  name: string
  lat: number
  lng: number
  centralPressure: number   // hPa
  cellDiameter: number      // km
  pressureGradient: number  // hPa/1000km
  status: 'intense' | 'moderate' | 'weak' | 'dissipating'
  description: string
}

export interface AtmosphericPressureCellState {
  open: boolean
  data: AtmosphericPressureCellData[]
  showCentralPressure: boolean
  showCellDiameter: boolean
  showPressureGradient: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface TropopauseHeightData {
  id: string
  name: string
  lat: number
  lng: number
  tropopauseHeight: number  // km
  temperatureLapse: number  // C/km
  tropopausePressure: number // hPa
  status: 'elevated' | 'normal' | 'depressed' | 'folded'
  description: string
}

export interface TropopauseHeightState {
  open: boolean
  data: TropopauseHeightData[]
  showTropopauseHeight: boolean
  showTemperatureLapse: boolean
  showTropopausePressure: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface RossbyWaveAmplitudeData {
  id: string
  name: string
  lat: number
  lng: number
  waveAmplitude: number     // degrees latitude
  wavenumber: number        // zonal wavenumber
  phaseSpeed: number        // m/s
  status: 'amplified' | 'propagating' | 'damped' | 'stationary'
  description: string
}

export interface RossbyWaveAmplitudeState {
  open: boolean
  data: RossbyWaveAmplitudeData[]
  showWaveAmplitude: boolean
  showWavenumber: boolean
  showPhaseSpeed: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface HadleyCellCirculationData {
  id: string
  name: string
  lat: number
  lng: number
  circulationStrength: number // Sv (10^9 kg/s)
  updraftVelocity: number    // cm/s
  outflowHeight: number      // km
  status: 'intensified' | 'normal' | 'weakened' | 'expanding'
  description: string
}

export interface HadleyCellCirculationState {
  open: boolean
  data: HadleyCellCirculationData[]
  showCirculationStrength: boolean
  showUpdraftVelocity: boolean
  showOutflowHeight: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AtmosphericRiverFlowData {
  id: string
  name: string
  lat: number
  lng: number
  moistureFlux: number      // kg/m/s
  integratedVapor: number   // cm
  windSpeed: number         // m/s
  status: 'extreme' | 'strong' | 'moderate' | 'weak'
  description: string
}

export interface AtmosphericRiverFlowState {
  open: boolean
  data: AtmosphericRiverFlowData[]
  showMoistureFlux: boolean
  showIntegratedVapor: boolean
  showWindSpeed: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PolarFrontJetData {
  id: string
  name: string
  lat: number
  lng: number
  jetSpeed: number          // m/s
  frontalContrast: number   // C/100km
  baroclinicity: number     // 10^-5 s^-1
  status: 'intense' | 'active' | 'slack' | 'displaced'
  description: string
}

export interface PolarFrontJetState {
  open: boolean
  data: PolarFrontJetData[]
  showJetSpeed: boolean
  showFrontalContrast: boolean
  showBaroclinicity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface TradeWindBeltData {
  id: string
  name: string
  lat: number
  lng: number
  windSpeed: number          // m/s
  convergenceZone: number    // degrees lat
  consistency: number        // %
  status: 'strong' | 'moderate' | 'variable' | 'collapsed'
  description: string
}

export interface TradeWindBeltState {
  open: boolean
  data: TradeWindBeltData[]
  showWindSpeed: boolean
  showConvergenceZone: boolean
  showConsistency: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 104: Biogeography and Ecosystem
export interface SpeciesMigrationRouteData {
  id: string
  name: string
  lat: number
  lng: number
  migratoryDistance: number  // km
  populationSize: number     // individuals
  timingShift: number        // days (deviation from historical)
  status: 'active' | 'delayed' | 'disrupted' | 'collapsed'
  description: string
}

export interface SpeciesMigrationRouteState {
  open: boolean
  data: SpeciesMigrationRouteData[]
  showMigratoryDistance: boolean
  showPopulationSize: boolean
  showTimingShift: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface HabitatCorridorData {
  id: string
  name: string
  lat: number
  lng: number
  corridorWidth: number     // km
  connectivityIndex: number  // 0-1
  barrierCount: number      // count
  status: 'intact' | 'degraded' | 'fragmented' | 'severed'
  description: string
}

export interface HabitatCorridorState {
  open: boolean
  data: HabitatCorridorData[]
  showCorridorWidth: boolean
  showConnectivityIndex: boolean
  showBarrierCount: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface EndemicHotspotData {
  id: string
  name: string
  lat: number
  lng: number
  endemicSpeciesCount: number
  threatLevel: number        // 1-10
  protectionCoverage: number // %
  status: 'protected' | 'vulnerable' | 'threatened' | 'critical'
  description: string
}

export interface EndemicHotspotState {
  open: boolean
  data: EndemicHotspotData[]
  showEndemicSpeciesCount: boolean
  showThreatLevel: boolean
  showProtectionCoverage: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface KeystonePopulationData {
  id: string
  name: string
  lat: number
  lng: number
  populationDensity: number  // per km²
  reproductionRate: number   // offspring/year
  ecosystemImpact: number    // 0-1
  status: 'thriving' | 'stable' | 'declining' | 'critical'
  description: string
}

export interface KeystonePopulationState {
  open: boolean
  data: KeystonePopulationData[]
  showPopulationDensity: boolean
  showReproductionRate: boolean
  showEcosystemImpact: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface WildlifeCorridorData {
  id: string
  name: string
  lat: number
  lng: number
  corridorLength: number    // km
  speciesUsing: number      // count
  crossingEvents: number    // per month
  status: 'functional' | 'partial' | 'bottleneck' | 'blocked'
  description: string
}

export interface WildlifeCorridorState {
  open: boolean
  data: WildlifeCorridorData[]
  showCorridorLength: boolean
  showSpeciesUsing: boolean
  showCrossingEvents: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface BiomeTransitionData {
  id: string
  name: string
  lat: number
  lng: number
  transitionWidth: number   // km
  speciesTurnover: number   // %
  shiftRate: number         // km/decade
  status: 'stable' | 'shifting' | 'expanding' | 'contracting'
  description: string
}

export interface BiomeTransitionState {
  open: boolean
  data: BiomeTransitionData[]
  showTransitionWidth: boolean
  showSpeciesTurnover: boolean
  showShiftRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface ForestCanopyCoverData {
  id: string
  name: string
  lat: number
  lng: number
  canopyDensity: number     // %
  leafAreaIndex: number     // m²/m²
  carbonStock: number       // tonnes/ha
  status: 'dense' | 'moderate' | 'open' | 'degraded'
  description: string
}

export interface ForestCanopyCoverState {
  open: boolean
  data: ForestCanopyCoverData[]
  showCanopyDensity: boolean
  showLeafAreaIndex: boolean
  showCarbonStock: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface WetlandBiodiversityIndexData {
  id: string
  name: string
  lat: number
  lng: number
  speciesRichness: number   // count
  shannonIndex: number      // H
  waterQuality: number      // 0-100
  status: 'pristine' | 'good' | 'moderate' | 'degraded'
  description: string
}

export interface WetlandBiodiversityIndexState {
  open: boolean
  data: WetlandBiodiversityIndexData[]
  showSpeciesRichness: boolean
  showShannonIndex: boolean
  showWaterQuality: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 105: Hydrology and Watershed
export interface WatershedDischargeData {
  id: string
  name: string
  lat: number
  lng: number
  dischargeRate: number     // m³/s
  drainageArea: number      // km²
  runoffCoefficient: number // 0-1
  status: 'flooding' | 'high' | 'normal' | 'low'
  description: string
}

export interface WatershedDischargeState {
  open: boolean
  data: WatershedDischargeData[]
  showDischargeRate: boolean
  showDrainageArea: boolean
  showRunoffCoefficient: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AquiferRechargeRateData {
  id: string
  name: string
  lat: number
  lng: number
  rechargeRate: number      // mm/year
  waterTableDepth: number   // m
  permeability: number      // m/day
  status: 'surplus' | 'balanced' | 'deficit' | 'depleted'
  description: string
}

export interface AquiferRechargeRateState {
  open: boolean
  data: AquiferRechargeRateData[]
  showRechargeRate: boolean
  showWaterTableDepth: boolean
  showPermeability: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface FloodInundationMapData {
  id: string
  name: string
  lat: number
  lng: number
  floodDepth: number        // m
  returnPeriod: number      // years
  affectedArea: number      // km²
  status: 'active' | 'warning' | 'receding' | 'dry'
  description: string
}

export interface FloodInundationMapState {
  open: boolean
  data: FloodInundationMapData[]
  showFloodDepth: boolean
  showReturnPeriod: boolean
  showAffectedArea: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface RiverSedimentLoadData {
  id: string
  name: string
  lat: number
  lng: number
  suspendedLoad: number     // mg/L
  bedloadTransport: number  // kg/s
  turbidity: number         // NTU
  status: 'heavy' | 'elevated' | 'normal' | 'clear'
  description: string
}

export interface RiverSedimentLoadState {
  open: boolean
  data: RiverSedimentLoadData[]
  showSuspendedLoad: boolean
  showBedloadTransport: boolean
  showTurbidity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GroundwaterTableLevelData {
  id: string
  name: string
  lat: number
  lng: number
  waterLevel: number        // m below surface
  trendRate: number         // m/year
  aquiferType: number       // classification code
  status: 'rising' | 'stable' | 'declining' | 'critical'
  description: string
}

export interface GroundwaterTableLevelState {
  open: boolean
  data: GroundwaterTableLevelData[]
  showWaterLevel: boolean
  showTrendRate: boolean
  showAquiferType: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SnowpackWaterEquivalentData {
  id: string
  name: string
  lat: number
  lng: number
  sweValue: number          // mm
  snowDepth: number         // cm
  meltRate: number          // mm/day
  status: 'above_normal' | 'normal' | 'below_normal' | 'deficit'
  description: string
}

export interface SnowpackWaterEquivalentState {
  open: boolean
  data: SnowpackWaterEquivalentData[]
  showSweValue: boolean
  showSnowDepth: boolean
  showMeltRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface ReservoirStorageLevelData {
  id: string
  name: string
  lat: number
  lng: number
  storageLevel: number      // % capacity
  inflowRate: number        // m³/s
  outflowRate: number       // m³/s
  status: 'overflow' | 'full' | 'adequate' | 'low'
  description: string
}

export interface ReservoirStorageLevelState {
  open: boolean
  data: ReservoirStorageLevelData[]
  showStorageLevel: boolean
  showInflowRate: boolean
  showOutflowRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface BaseflowIndexData {
  id: string
  name: string
  lat: number
  lng: number
  baseflowRatio: number     // 0-1
  totalFlow: number         // m³/s
  groundwaterContribution: number // %
  status: 'groundwater_dominated' | 'mixed' | 'runoff_dominated' | 'intermittent'
  description: string
}

export interface BaseflowIndexState {
  open: boolean
  data: BaseflowIndexData[]
  showBaseflowRatio: boolean
  showTotalFlow: boolean
  showGroundwaterContribution: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 106: Cryosphere Dynamics
export interface IceShelfThicknessData {
  id: string
  name: string
  lat: number
  lng: number
  shelfThickness: number   // m
  basalMeltRate: number    // m/year
  riftLength: number       // km
  status: 'thickening' | 'stable' | 'thinning' | 'fracturing'
  description: string
}

export interface IceShelfThicknessState {
  open: boolean
  data: IceShelfThicknessData[]
  showShelfThickness: boolean
  showBasalMeltRate: boolean
  showRiftLength: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SeaIceExtentData {
  id: string
  name: string
  lat: number
  lng: number
  iceConcentration: number // %
  extentAnomaly: number    // million km²
  iceAge: number           // years
  status: 'expanding' | 'stable' | 'declining' | 'record_low'
  description: string
}

export interface SeaIceExtentState {
  open: boolean
  data: SeaIceExtentData[]
  showIceConcentration: boolean
  showExtentAnomaly: boolean
  showIceAge: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GlacierMassBalanceData {
  id: string
  name: string
  lat: number
  lng: number
  massBalance: number      // m w.e./year
  equilibriumLine: number  // m altitude
  accumulationRatio: number // 0-1
  status: 'gaining' | 'stable' | 'losing' | 'collapsing'
  description: string
}

export interface GlacierMassBalanceState {
  open: boolean
  data: GlacierMassBalanceData[]
  showMassBalance: boolean
  showEquilibriumLine: boolean
  showAccumulationRatio: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PermafrostActiveLayerData {
  id: string
  name: string
  lat: number
  lng: number
  activeLayerDepth: number  // cm
  groundTemperature: number // °C
  thawRate: number          // cm/year
  status: 'deepening' | 'stable' | 'shallow' | 'absent'
  description: string
}

export interface PermafrostActiveLayerState {
  open: boolean
  data: PermafrostActiveLayerData[]
  showActiveLayerDepth: boolean
  showGroundTemperature: boolean
  showThawRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface IceCoreRecordData {
  id: string
  name: string
  lat: number
  lng: number
  coreDepth: number        // m
  oldestIceAge: number     // kyr BP
  co2Concentration: number // ppm
  status: 'recovering' | 'drilling' | 'completed' | 'archived'
  description: string
}

export interface IceCoreRecordState {
  open: boolean
  data: IceCoreRecordData[]
  showCoreDepth: boolean
  showOldestIceAge: boolean
  showCo2Concentration: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SnowCoverDurationData {
  id: string
  name: string
  lat: number
  lng: number
  snowDays: number          // days/year
  snowOnsetDate: number     // day of year
  snowMeltDate: number      // day of year
  status: 'prolonged' | 'normal' | 'shortened' | 'absent'
  description: string
}

export interface SnowCoverDurationState {
  open: boolean
  data: SnowCoverDurationData[]
  showSnowDays: boolean
  showSnowOnsetDate: boolean
  showSnowMeltDate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface FrostThawCycleData {
  id: string
  name: string
  lat: number
  lng: number
  freezeThawCycles: number  // per year
  frostDepth: number        // cm
  heaveMagnitude: number    // mm
  status: 'frequent' | 'moderate' | 'rare' | 'permafrost'
  description: string
}

export interface FrostThawCycleState {
  open: boolean
  data: FrostThawCycleData[]
  showFreezeThawCycles: boolean
  showFrostDepth: boolean
  showHeaveMagnitude: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface IcebergCalvingData {
  id: string
  name: string
  lat: number
  lng: number
  calvingRate: number       // km²/year
  icebergSize: number       // km²
  driftSpeed: number        // km/day
  status: 'intense' | 'active' | 'moderate' | 'minimal'
  description: string
}

export interface IcebergCalvingState {
  open: boolean
  data: IcebergCalvingData[]
  showCalvingRate: boolean
  showIcebergSize: boolean
  showDriftSpeed: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 107: Space Weather and Geomagnetism
export interface MagnetopauseStandoffData {
  id: string
  name: string
  lat: number
  lng: number
  standoffDistance: number // Earth radii
  solarWindPressure: number // nPa
  magneticFieldBz: number  // nT
  status: 'compressed' | 'normal' | 'expanded' | 'eroded'
  description: string
}

export interface MagnetopauseStandoffState {
  open: boolean
  data: MagnetopauseStandoffData[]
  showStandoffDistance: boolean
  showSolarWindPressure: boolean
  showMagneticFieldBz: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AuroraOvalPositionData {
  id: string
  name: string
  lat: number
  lng: number
  ovalLatitude: number   // degrees
  kpIndex: number         // 0-9
  visibilityProbability: number // %
  status: 'storm' | 'active' | 'quiet' | 'substorm'
  description: string
}

export interface AuroraOvalPositionState {
  open: boolean
  data: AuroraOvalPositionData[]
  showOvalLatitude: boolean
  showKpIndex: boolean
  showVisibilityProbability: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface VanAllenRadiationData {
  id: string
  name: string
  lat: number
  lng: number
  protonFlux: number     // particles/cm2/s
  electronFlux: number   // particles/cm2/s
  beltAltitude: number   // km
  status: 'enhanced' | 'elevated' | 'normal' | 'depleted'
  description: string
}

export interface VanAllenRadiationState {
  open: boolean
  data: VanAllenRadiationData[]
  showProtonFlux: boolean
  showElectronFlux: boolean
  showBeltAltitude: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface IonosphericDisturbanceData {
  id: string
  name: string
  lat: number
  lng: number
  tecValue: number        // TECU
  scintillationIndex: number // S4
  f2LayerFrequency: number // MHz
  status: 'disturbed' | 'moderate' | 'quiet' | 'blackout'
  description: string
}

export interface IonosphericDisturbanceState {
  open: boolean
  data: IonosphericDisturbanceData[]
  showTecValue: boolean
  showScintillationIndex: boolean
  showF2LayerFrequency: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface CosmicRayFluxData {
  id: string
  name: string
  lat: number
  lng: number
  neutronCount: number    // counts/min
  muonFlux: number        // counts/min
  solarModulation: number // GV
  status: 'forbush_decrease' | 'depressed' | 'normal' | 'ground_level'
  description: string
}

export interface CosmicRayFluxState {
  open: boolean
  data: CosmicRayFluxData[]
  showNeutronCount: boolean
  showMuonFlux: boolean
  showSolarModulation: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SolarFluxIndexData {
  id: string
  name: string
  lat: number
  lng: number
  f107Index: number        // sfu
  sunspotNumber: number
  solarCyclePhase: number  // 0-1
  status: 'solar_max' | 'rising' | 'declining' | 'solar_min'
  description: string
}

export interface SolarFluxIndexState {
  open: boolean
  data: SolarFluxIndexData[]
  showF107Index: boolean
  showSunspotNumber: boolean
  showSolarCyclePhase: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SpaceRadiationDoseData {
  id: string
  name: string
  lat: number
  lng: number
  doseRate: number         // mSv/hr
  particleEnergy: number   // MeV
  shieldingEffectiveness: number // %
  status: 'dangerous' | 'elevated' | 'moderate' | 'safe'
  description: string
}

export interface SpaceRadiationDoseState {
  open: boolean
  data: SpaceRadiationDoseData[]
  showDoseRate: boolean
  showParticleEnergy: boolean
  showShieldingEffectiveness: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SatelliteDragData {
  id: string
  name: string
  lat: number
  lng: number
  orbitalDecay: number    // m/day
  atmosphericDensity: number // kg/m3
  altitude: number        // km
  status: 'critical' | 'elevated' | 'normal' | 'low'
  description: string
}

export interface SatelliteDragState {
  open: boolean
  data: SatelliteDragData[]
  showOrbitalDecay: boolean
  showAtmosphericDensity: boolean
  showAltitude: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 108: Urban Infrastructure & Smart City
export interface TrafficFlowData {
  id: string
  name: string
  lat: number
  lng: number
  averageSpeed: number     // km/h
  congestionIndex: number  // 0-100
  vehicleCount: number     // vehicles/hour
  travelTime: number       // minutes
  status: 'congested' | 'moderate' | 'flowing' | 'clear'
  description: string
}

export interface TrafficFlowState {
  open: boolean
  data: TrafficFlowData[]
  showAverageSpeed: boolean
  showCongestionIndex: boolean
  showVehicleCount: boolean
  showTravelTime: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface BridgeStructuralHealthData {
  id: string
  name: string
  lat: number
  lng: number
  structuralStress: number // MPa
  vibrationLevel: number   // mm/s
  loadCapacity: number     // tonnes
  corrosionIndex: number   // 0-100
  status: 'critical' | 'warning' | 'stable' | 'optimal'
  description: string
}

export interface BridgeStructuralHealthState {
  open: boolean
  data: BridgeStructuralHealthData[]
  showStructuralStress: boolean
  showVibrationLevel: boolean
  showLoadCapacity: boolean
  showCorrosionIndex: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface WaterPipeNetworkData {
  id: string
  name: string
  lat: number
  lng: number
  pressureLevel: number  // bar
  flowRate: number       // L/s
  leakDetection: number  // leaks/km
  waterQuality: number   // 0-100
  status: 'burst' | 'leaking' | 'normal' | 'optimal'
  description: string
}

export interface WaterPipeNetworkState {
  open: boolean
  data: WaterPipeNetworkData[]
  showPressureLevel: boolean
  showFlowRate: boolean
  showLeakDetection: boolean
  showWaterQuality: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PowerGridLoadData {
  id: string
  name: string
  lat: number
  lng: number
  gridLoad: number       // %
  peakDemand: number     // GW
  frequency: number      // Hz
  reserveMargin: number  // %
  status: 'overloaded' | 'high' | 'normal' | 'low'
  description: string
}

export interface PowerGridLoadState {
  open: boolean
  data: PowerGridLoadData[]
  showGridLoad: boolean
  showPeakDemand: boolean
  showFrequency: boolean
  showReserveMargin: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface WasteCollectionRouteData {
  id: string
  name: string
  lat: number
  lng: number
  collectionRate: number   // %
  routeEfficiency: number  // %
  fillLevel: number        // %
  recyclingRate: number    // %
  status: 'overflow' | 'delayed' | 'ontrack' | 'efficient'
  description: string
}

export interface WasteCollectionRouteState {
  open: boolean
  data: WasteCollectionRouteData[]
  showCollectionRate: boolean
  showRouteEfficiency: boolean
  showFillLevel: boolean
  showRecyclingRate: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface AirQualityUrbanData {
  id: string
  name: string
  lat: number
  lng: number
  aqiIndex: number      // 0-500
  pm25Level: number     // ug/m3
  no2Level: number      // ppb
  o3Level: number       // ppb
  status: 'hazardous' | 'unhealthy' | 'moderate' | 'good'
  description: string
}

export interface AirQualityUrbanState {
  open: boolean
  data: AirQualityUrbanData[]
  showAqiIndex: boolean
  showPm25Level: boolean
  showNo2Level: boolean
  showO3Level: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface NoiseLevelMapperData {
  id: string
  name: string
  lat: number
  lng: number
  avgDecibels: number    // dB
  peakLevel: number      // dB
  quietZonePercent: number // %
  nightLevel: number     // dB
  status: 'extreme' | 'high' | 'moderate' | 'quiet'
  description: string
}

export interface NoiseLevelMapperState {
  open: boolean
  data: NoiseLevelMapperData[]
  showAvgDecibels: boolean
  showPeakLevel: boolean
  showQuietZonePercent: boolean
  showNightLevel: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SmartParkingCapacityData {
  id: string
  name: string
  lat: number
  lng: number
  occupancyRate: number  // %
  availableSpots: number // count
  avgDuration: number    // minutes
  turnoverRate: number   // vehicles/spot/day
  status: 'full' | 'crowded' | 'available' | 'empty'
  description: string
}

export interface SmartParkingCapacityState {
  open: boolean
  data: SmartParkingCapacityData[]
  showOccupancyRate: boolean
  showAvailableSpots: boolean
  showAvgDuration: boolean
  showTurnoverRate: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 109: Agricultural Monitoring & Precision Farming
export interface CropHealthIndexData {
  id: string
  name: string
  lat: number
  lng: number
  healthScore: number      // 0-100
  ndvi: number             // -1 to 1
  stressLevel: number      // 0-10
  diseaseRisk: number      // %
  growthStage: string
  status: 'healthy' | 'stressed' | 'diseased' | 'critical'
  description: string
}

export interface CropHealthIndexState {
  open: boolean
  data: CropHealthIndexData[]
  showHealthScore: boolean
  showNdvi: boolean
  showStressLevel: boolean
  showDiseaseRisk: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SoilMoistureFieldData {
  id: string
  name: string
  lat: number
  lng: number
  moisturePercent: number  // %
  depthCm: number          // cm
  fieldCapacity: number    // %
  wiltingPoint: number     // %
  status: 'saturated' | 'optimal' | 'dry' | 'critical'
  description: string
}

export interface SoilMoistureFieldState {
  open: boolean
  data: SoilMoistureFieldData[]
  showMoisturePercent: boolean
  showDepthCm: boolean
  showFieldCapacity: boolean
  showWiltingPoint: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface IrrigationEfficiencyData {
  id: string
  name: string
  lat: number
  lng: number
  efficiency: number       // %
  waterApplied: number     // mm
  waterAbsorbed: number    // mm
  runoffLoss: number       // mm
  status: 'excellent' | 'good' | 'moderate' | 'poor'
  description: string
}

export interface IrrigationEfficiencyState {
  open: boolean
  data: IrrigationEfficiencyData[]
  showEfficiency: boolean
  showWaterApplied: boolean
  showWaterAbsorbed: boolean
  showRunoffLoss: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PestOutbreakTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  pestType: string
  severity: number         // 1-10
  affectedArea: number     // hectares
  spreadRate: number       // km/week
  status: 'monitoring' | 'alert' | 'outbreak' | 'controlled'
  description: string
}

export interface PestOutbreakTrackerState {
  open: boolean
  data: PestOutbreakTrackerData[]
  showSeverity: boolean
  showAffectedArea: boolean
  showSpreadRate: boolean
  showPestType: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface FertilizerRunoffData {
  id: string
  name: string
  lat: number
  lng: number
  nitrogenLevel: number    // mg/L
  phosphorusLevel: number  // mg/L
  runoffVolume: number     // m3
  contaminationIndex: number // 0-100
  status: 'safe' | 'elevated' | 'high' | 'critical'
  description: string
}

export interface FertilizerRunoffState {
  open: boolean
  data: FertilizerRunoffData[]
  showNitrogenLevel: boolean
  showPhosphorusLevel: boolean
  showRunoffVolume: boolean
  showContaminationIndex: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface HarvestYieldPredictData {
  id: string
  name: string
  lat: number
  lng: number
  predictedYield: number   // tonnes/hectare
  confidence: number       // %
  historicalAvg: number    // tonnes/hectare
  variancePercent: number  // %
  status: 'above_average' | 'average' | 'below_average' | 'failed'
  description: string
}

export interface HarvestYieldPredictState {
  open: boolean
  data: HarvestYieldPredictData[]
  showPredictedYield: boolean
  showConfidence: boolean
  showHistoricalAvg: boolean
  showVariancePercent: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GreenhouseClimateData {
  id: string
  name: string
  lat: number
  lng: number
  temperature: number      // C
  humidity: number         // %
  co2Level: number         // ppm
  lightIntensity: number   // lux
  status: 'optimal' | 'warm' | 'humid' | 'critical'
  description: string
}

export interface GreenhouseClimateState {
  open: boolean
  data: GreenhouseClimateData[]
  showTemperature: boolean
  showHumidity: boolean
  showCo2Level: boolean
  showLightIntensity: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface LivestockMovementData {
  id: string
  name: string
  lat: number
  lng: number
  animalCount: number
  avgSpeed: number         // km/h
  grazingDuration: number  // hours
  distanceTraveled: number // km
  status: 'grazing' | 'moving' | 'resting' | 'alert'
  description: string
}

export interface LivestockMovementState {
  open: boolean
  data: LivestockMovementData[]
  showAnimalCount: boolean
  showAvgSpeed: boolean
  showGrazingDuration: boolean
  showDistanceTraveled: boolean
  statusFilter: string
  activeItemId: string | null
}

// Task 109: Agricultural Monitoring & Precision Farming
export interface CropHealthIndexData {
  id: string
  name: string
  lat: number
  lng: number
  ndviIndex: number         // 0-1
  cropStress: number        // 0-100
  growthStage: number       // 1-12
  coveragePercent: number   // 0-100
  status: 'critical' | 'stressed' | 'healthy' | 'optimal'
  description: string
}

export interface CropHealthIndexState {
  open: boolean
  data: CropHealthIndexData[]
  showNdviIndex: boolean
  showCropStress: boolean
  showGrowthStage: boolean
  showCoveragePercent: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface SoilMoistureFieldData {
  id: string
  name: string
  lat: number
  lng: number
  moisturePercent: number   // 0-100
  fieldCapacity: number     // 0-100
  wiltingPoint: number      // 0-100
  availableWater: number    // mm
  status: 'drought' | 'dry' | 'adequate' | 'saturated'
  description: string
}

export interface SoilMoistureFieldState {
  open: boolean
  data: SoilMoistureFieldData[]
  showMoisturePercent: boolean
  showFieldCapacity: boolean
  showWiltingPoint: boolean
  showAvailableWater: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface IrrigationEfficiencyData {
  id: string
  name: string
  lat: number
  lng: number
  applicationRate: number     // mm/h
  distributionPercent: number // 0-100
  conveyancePercent: number   // 0-100
  overallEfficiency: number   // 0-100
  status: 'poor' | 'fair' | 'good' | 'excellent'
  description: string
}

export interface IrrigationEfficiencyState {
  open: boolean
  data: IrrigationEfficiencyData[]
  showApplicationRate: boolean
  showDistributionPercent: boolean
  showConveyancePercent: boolean
  showOverallEfficiency: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface PestOutbreakTrackerData {
  id: string
  name: string
  lat: number
  lng: number
  riskLevel: number        // 0-100
  spreadRate: number       // km/month
  affectedArea: number     // km2
  controlEfficiency: number // 0-100
  status: 'epidemic' | 'outbreak' | 'monitored' | 'contained'
  description: string
}

export interface PestOutbreakTrackerState {
  open: boolean
  data: PestOutbreakTrackerData[]
  showRiskLevel: boolean
  showSpreadRate: boolean
  showAffectedArea: boolean
  showControlEfficiency: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface FertilizerRunoffData {
  id: string
  name: string
  lat: number
  lng: number
  nitrogenLoad: number      // kg/ha/yr
  phosphorusLoad: number    // kg/ha/yr
  nitrateLevel: number      // mg/L
  eutrophicationIndex: number // 0-100
  status: 'severe' | 'elevated' | 'moderate' | 'low'
  description: string
}

export interface FertilizerRunoffState {
  open: boolean
  data: FertilizerRunoffData[]
  showNitrogenLoad: boolean
  showPhosphorusLoad: boolean
  showNitrateLevel: boolean
  showEutrophicationIndex: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface HarvestYieldPredictData {
  id: string
  name: string
  lat: number
  lng: number
  yieldForecast: number      // tonnes/ha
  areaHarvested: number      // million ha
  productionEst: number      // million tonnes
  yieldGap: number           // %
  status: 'failed' | 'below' | 'average' | 'record'
  description: string
}

export interface HarvestYieldPredictState {
  open: boolean
  data: HarvestYieldPredictData[]
  showYieldForecast: boolean
  showAreaHarvested: boolean
  showProductionEst: boolean
  showYieldGap: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface GreenhouseClimateData {
  id: string
  name: string
  lat: number
  lng: number
  temperature: number     // Celsius
  humidity: number        // 0-100
  co2Level: number        // ppm
  lightPAR: number        // umol/m2/s
  status: 'critical' | 'warning' | 'normal' | 'optimal'
  description: string
}

export interface GreenhouseClimateState {
  open: boolean
  data: GreenhouseClimateData[]
  showTemperature: boolean
  showHumidity: boolean
  showCo2Level: boolean
  showLightPAR: boolean
  statusFilter: string
  activeItemId: string | null
}

export interface LivestockMovementData {
  id: string
  name: string
  lat: number
  lng: number
  herdCount: number       // count
  avgSpeed: number        // km/h
  grazingArea: number     // km2
  healthIndex: number     // 0-100
  status: 'critical' | 'alert' | 'normal' | 'healthy'
  description: string
}

export interface LivestockMovementState {
  open: boolean
  data: LivestockMovementData[]
  showHerdCount: boolean
  showAvgSpeed: boolean
  showGrazingArea: boolean
  showHealthIndex: boolean
  statusFilter: string
  activeItemId: string | null
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      center: [14.5058, 46.0569], // Ljubljana, Slovenia (user timezone)
      zoom: 5,
      currentStyle: MAP_STYLES[0],
      bearing: 0,
      pitch: 0,

      sidebarOpen: true,
      sidebarTab: 'locations',
      searchQuery: '',

      markers: [],
      savedLocations: [],
      selectedMarker: null,

      geolocation: null,
      layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },

      toolMode: 'navigate',
      measurePoints: [],
      measureDistance: null,
      areaPoints: [],
      areaResult: null,

      routePoints: [],
      currentRouteColor: '#3b82f6',
      routes: [],
      osrmDistance: null,
      osrmDuration: null,
      routeProfile: 'driving',
      routeSteps: [],
      highlightedStepIndex: null,

      drawings: [],
      currentDrawing: null,
      drawColor: '#22c55e',
      drawWidth: 3,
      isDrawing: false,

      clusteringEnabled: true,
      buildingExtrusion: false,
      buildings3DEnabled: false,
      selectedBuilding: null,
      markerIconPresets: MARKER_ICON_PRESETS,
      selectedMarkerIcon: 'map-pin',
      terrainEnabled: false,
      terrainExaggeration: 1.5,
      weatherEnabled: false,
      trafficEnabled: false,
      earthquakesEnabled: false,
      sunPositionEnabled: false,
      isochroneEnabled: false,
      isochroneMinutes: 15,
      isochroneMode: 'walking',
      poiMarkers: [],
      poiFilters: {
        categories: [],
        radiusKm: 5,
        openNowOnly: false,
        keyword: '',
        minRating: 0,
      },
      poiFilterPresets: [],
      heatmapEnabled: false,
      heatmapIntensity: 0.5,
      heatmapRadius: 30,
      notifications: [],
      comparisonEnabled: false,
      comparisonStyle: MAP_STYLES[1], // Default to Satellite for comparison
      bookmarkFolders: [],
      annotations: [],
      elevationRouteId: null,
      offlineModeEnabled: false,
      customTileSources: [],

      // WMS/WMTS tile source defaults
      wmsTileSources: [],

      // Track stats panel defaults
      trackStatsPanelOpen: false,

      // Voice navigation defaults
      voiceNavigationEnabled: false,
      voiceLanguage: 'en',
      voiceCurrentStepIndex: 0,

      // Enhanced drawing tool defaults
      drawingTool: 'none',
      drawingColor: '#ef4444',
      drawingLineWidth: 3,
      drawnFeatures: [],

      // Track recording defaults
      isRecording: false,
      currentTrack: [],
      savedTracks: [],
      recordingStats: {
        distance: 0,
        duration: 0,
        currentSpeed: null,
        maxSpeed: 0,
        avgSpeed: 0,
        elevationGain: 0,
        elevationLoss: 0,
      },

      // Geofence defaults
      geofences: [],

      // Language defaults
      language: 'en',

      // App notification defaults
      appNotifications: [],

      // Snapshot defaults
      snapshots: [],

      // Multi-route comparison defaults
      comparedRoutes: [],

      // Accessibility defaults
      highContrastMode: false,
      largeTextMode: false,
      reducedMotionMode: false,
      screenReaderMode: false,
      colorBlindMode: false,

      // Map theme customization defaults
      mapThemeOverrides: {},
      mapThemePreset: 'standard',

      // Panel visibility defaults
      accessibilityPanelOpen: false,
      terrainAnalysisRouteId: null,

      // Image overlay defaults
      imageOverlays: [],

      // Spatial analysis defaults
      spatialResults: [],

      // Collapsed sections defaults
      collapsedSections: {},

      // Map history / timeline defaults
      mapHistory: [],
      timelineOpen: false,

      // Search history defaults
      searchHistory: [],

      // Route optimization defaults
      routeOptimized: false,
      originalRoutePoints: [],

      // Analytics panel defaults
      analyticsPanelOpen: false,

      // AQI panel defaults
      aqiPanelOpen: false,

      // Print dialog defaults
      printDialogOpen: false,

      // Tool usage history defaults
      toolUsageHistory: [],

      // Session start time
      sessionStartTime: typeof Date !== 'undefined' ? Date.now() : 0,

      // Trip Planner defaults
      tripPlans: [],

      // GPS Simulation defaults
      gpsSimulation: {
        isPlaying: false,
        speedMultiplier: 1,
        progress: 0,
        currentPosition: null,
        distanceRemaining: 0,
        eta: 0,
        routeId: null,
      },

      // Map Notes defaults
      mapNotes: [],

      // Batch Operations defaults
      batchOperation: {
        isSelectMode: false,
        selectedMarkerIds: [],
      },

      setCenter: (center) => set({ center }),
      setZoom: (zoom) => set({ zoom }),
      setCurrentStyle: (currentStyle) => set({ currentStyle }),
      setBearing: (bearing) => set({ bearing }),
      setPitch: (pitch) => set({ pitch }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addMarker: (marker) => {
        set((state) => ({ markers: [...state.markers, marker] }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'marker',
            description: 'Add Marker',
            undo: () => {
              useMapStore.setState((s) => ({ markers: s.markers.filter((m) => m.id !== marker.id) }))
            },
            redo: () => {
              useMapStore.setState((s) => ({ markers: [...s.markers, marker] }))
            },
          })
        }
      },

      removeMarker: (id) => {
        // Capture the marker before removing it for undo
        const marker = useMapStore.getState().markers.find((m) => m.id === id)
        set((state) => ({ markers: state.markers.filter((m) => m.id !== id) }))
        if (!undoManager.isExecuting && marker) {
          undoManager.pushAction({
            type: 'marker',
            description: 'Remove Marker',
            undo: () => {
              useMapStore.setState((s) => ({ markers: [...s.markers, marker] }))
            },
            redo: () => {
              useMapStore.setState((s) => ({ markers: s.markers.filter((m) => m.id !== id) }))
            },
          })
        }
      },

      setMarkers: (markers) => set({ markers }),

      setSavedLocations: (savedLocations) => set({ savedLocations }),

      addSavedLocation: (location) => {
        set((state) => ({ savedLocations: [location, ...state.savedLocations] }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'location',
            description: 'Add Location',
            undo: () => {
              useMapStore.setState((s) => ({ savedLocations: s.savedLocations.filter((l) => l.id !== location.id) }))
            },
            redo: () => {
              useMapStore.setState((s) => ({ savedLocations: [location, ...s.savedLocations] }))
            },
          })
        }
      },

      removeSavedLocation: (id) => {
        // Capture the location and marker before removing for undo
        const location = useMapStore.getState().savedLocations.find((l) => l.id === id)
        const marker = useMapStore.getState().markers.find((m) => m.id === id)
        set((state) => ({
          savedLocations: state.savedLocations.filter((l) => l.id !== id),
          markers: state.markers.filter((m) => m.id !== id),
        }))
        if (!undoManager.isExecuting && location) {
          undoManager.pushAction({
            type: 'location',
            description: 'Remove Location',
            undo: () => {
              useMapStore.setState((s) => {
                const newLocations = [location, ...s.savedLocations.filter((l) => l.id !== id)]
                const newMarkers = marker ? [...s.markers.filter((m) => m.id !== id), marker] : s.markers
                return { savedLocations: newLocations, markers: newMarkers }
              })
            },
            redo: () => {
              useMapStore.setState((s) => ({
                savedLocations: s.savedLocations.filter((l) => l.id !== id),
                markers: s.markers.filter((m) => m.id !== id),
              }))
            },
          })
        }
      },

      setSelectedMarker: (selectedMarker) => set({ selectedMarker }),

      setGeolocation: (geolocation) => set({ geolocation }),
      setLayerVisibility: (layers) =>
        set((state) => ({
          layerVisibility: { ...state.layerVisibility, ...layers },
        })),

      setToolMode: (toolMode) =>
        set((state) => ({ toolMode, measurePoints: [], measureDistance: null, areaPoints: [], areaResult: null, toolUsageHistory: [...state.toolUsageHistory, { tool: toolMode, timestamp: Date.now() }].slice(-200) })),

      addMeasurePoint: (point) => {
        set((state) => ({ measurePoints: [...state.measurePoints, point] }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'measure',
            description: 'Add Measure Point',
            undo: () => {
              useMapStore.setState((s) => ({
                measurePoints: s.measurePoints.slice(0, -1),
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                measurePoints: [...s.measurePoints, point],
              }))
            },
          })
        }
      },

      clearMeasurePoints: () => {
        // Capture current state for undo
        const { measurePoints, measureDistance } = useMapStore.getState()
        set({ measurePoints: [], measureDistance: null })
        if (!undoManager.isExecuting && measurePoints.length > 0) {
          undoManager.pushAction({
            type: 'measure',
            description: 'Clear Measurements',
            undo: () => {
              useMapStore.setState({ measurePoints, measureDistance })
            },
            redo: () => {
              useMapStore.setState({ measurePoints: [], measureDistance: null })
            },
          })
        }
      },

      setMeasureDistance: (measureDistance) => set({ measureDistance }),

      addAreaPoint: (point) => {
        set((state) => ({ areaPoints: [...state.areaPoints, point] }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'area',
            description: 'Add Area Point',
            undo: () => {
              useMapStore.setState((s) => ({
                areaPoints: s.areaPoints.slice(0, -1),
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                areaPoints: [...s.areaPoints, point],
              }))
            },
          })
        }
      },

      clearAreaPoints: () => {
        const { areaPoints, areaResult } = useMapStore.getState()
        set({ areaPoints: [], areaResult: null })
        if (!undoManager.isExecuting && areaPoints.length > 0) {
          undoManager.pushAction({
            type: 'area',
            description: 'Clear Area Measurements',
            undo: () => {
              useMapStore.setState({ areaPoints, areaResult })
            },
            redo: () => {
              useMapStore.setState({ areaPoints: [], areaResult: null })
            },
          })
        }
      },

      setAreaResult: (areaResult) => set({ areaResult }),

      addRoutePoint: (point) => {
        set((state) => ({ routePoints: [...state.routePoints, point] }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'route',
            description: 'Add Route Point',
            undo: () => {
              useMapStore.setState((s) => ({
                routePoints: s.routePoints.slice(0, -1),
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                routePoints: [...s.routePoints, point],
              }))
            },
          })
        }
      },

      removeRoutePoint: (index) => {
        const point = useMapStore.getState().routePoints[index]
        set((state) => ({
          routePoints: state.routePoints.filter((_, i) => i !== index),
        }))
        if (!undoManager.isExecuting && point) {
          undoManager.pushAction({
            type: 'route',
            description: 'Remove Route Point',
            undo: () => {
              useMapStore.setState((s) => {
                const newPoints = [...s.routePoints]
                newPoints.splice(index, 0, point)
                return { routePoints: newPoints }
              })
            },
            redo: () => {
              useMapStore.setState((s) => ({
                routePoints: s.routePoints.filter((_, i) => i !== index),
              }))
            },
          })
        }
      },

      clearRoutePoints: () => {
        const { routePoints } = useMapStore.getState()
        set({ routePoints: [] })
        if (!undoManager.isExecuting && routePoints.length > 0) {
          undoManager.pushAction({
            type: 'route',
            description: 'Clear Route Points',
            undo: () => {
              useMapStore.setState({ routePoints })
            },
            redo: () => {
              useMapStore.setState({ routePoints: [] })
            },
          })
        }
      },

      setCurrentRouteColor: (currentRouteColor) => set({ currentRouteColor }),

      saveRoute: (name) => {
        const stateBefore = useMapStore.getState()
        set((state) => {
          if (state.routePoints.length < 2) return state
          // Use OSRM distance if available, otherwise fall back to Haversine
          let distance: number | null = state.osrmDistance
          if (distance === null && state.routePoints.length > 1) {
            let total = 0
            for (let i = 1; i < state.routePoints.length; i++) {
              const p1 = state.routePoints[i - 1]
              const p2 = state.routePoints[i]
              const R = 6371
              const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180
              const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((p1.latitude * Math.PI) / 180) *
                  Math.cos((p2.latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2)
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              total += R * c
            }
            distance = total
          }
          const newRoute: MapRoute = {
            id: `route-${Date.now()}`,
            name,
            color: state.currentRouteColor,
            points: [...state.routePoints],
            distance,
            duration: state.osrmDuration,
          }
          return {
            routes: [...state.routes, newRoute],
            routePoints: [],
            osrmDistance: null,
            osrmDuration: null,
          }
        })
        // Push undo action for the saved route
        if (!undoManager.isExecuting && stateBefore.routePoints.length >= 2) {
          const newRouteId = `route-${Date.now()}`
          const routePointsBefore = [...stateBefore.routePoints]
          const osrmDistanceBefore = stateBefore.osrmDistance
          const osrmDurationBefore = stateBefore.osrmDuration
          undoManager.pushAction({
            type: 'route',
            description: 'Save Route',
            undo: () => {
              useMapStore.setState((s) => ({
                routes: s.routes.filter((r) => r.id !== newRouteId),
                routePoints: routePointsBefore,
                osrmDistance: osrmDistanceBefore,
                osrmDuration: osrmDurationBefore,
              }))
            },
            redo: () => {
              useMapStore.setState((s) => {
                const existingRoute = s.routes.find((r) => r.id === newRouteId)
                if (existingRoute) return s // already exists
                // Recalculate the route from the saved points
                let distance: number | null = null
                if (routePointsBefore.length > 1) {
                  let total = 0
                  for (let i = 1; i < routePointsBefore.length; i++) {
                    const p1 = routePointsBefore[i - 1]
                    const p2 = routePointsBefore[i]
                    const R = 6371
                    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180
                    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180
                    const a =
                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos((p1.latitude * Math.PI) / 180) *
                        Math.cos((p2.latitude * Math.PI) / 180) *
                        Math.sin(dLon / 2) *
                        Math.sin(dLon / 2)
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                    total += R * c
                  }
                  distance = total
                }
                const route: MapRoute = {
                  id: newRouteId,
                  name,
                  color: s.currentRouteColor,
                  points: routePointsBefore,
                  distance,
                  duration: osrmDurationBefore,
                }
                return {
                  routes: [...s.routes, route],
                  routePoints: [],
                  osrmDistance: null,
                  osrmDuration: null,
                }
              })
            },
          })
        }
      },

      setOsmrData: (distance, duration) => set({ osrmDistance: distance, osrmDuration: duration }),

      setRouteProfile: (routeProfile) => set({ routeProfile, routeSteps: [] }),
      setRouteSteps: (routeSteps) => set({ routeSteps }),
      setHighlightedStepIndex: (highlightedStepIndex) => set({ highlightedStepIndex }),

      insertRoutePoint: (index, point) => {
        set((state) => {
          const newPoints = [...state.routePoints]
          newPoints.splice(index, 0, point)
          return { routePoints: newPoints, routeSteps: [] }
        })
      },

      updateRoutePoint: (index, point) => {
        set((state) => {
          const newPoints = [...state.routePoints]
          newPoints[index] = point
          return { routePoints: newPoints, routeSteps: [] }
        })
      },

      deleteRoute: (id) => {
        const route = useMapStore.getState().routes.find((r) => r.id === id)
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
        }))
        if (!undoManager.isExecuting && route) {
          undoManager.pushAction({
            type: 'route',
            description: 'Delete Route',
            undo: () => {
              useMapStore.setState((s) => ({
                routes: [...s.routes, route],
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                routes: s.routes.filter((r) => r.id !== id),
              }))
            },
          })
        }
      },

      setRoutes: (routes) => set({ routes }),
      setCurrentDrawing: (currentDrawing) => set({ currentDrawing }),

      addDrawingPoint: (point) => {
        set((state) => ({
          currentDrawing: state.currentDrawing
            ? [...state.currentDrawing, point]
            : [point],
        }))
        if (!undoManager.isExecuting) {
          undoManager.pushAction({
            type: 'drawing',
            description: 'Add Drawing Point',
            undo: () => {
              useMapStore.setState((s) => ({
                currentDrawing: s.currentDrawing ? s.currentDrawing.slice(0, -1) : null,
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                currentDrawing: s.currentDrawing ? [...s.currentDrawing, point] : [point],
              }))
            },
          })
        }
      },

      finishDrawing: () => {
        const stateBefore = useMapStore.getState()
        const currentDrawingBefore = stateBefore.currentDrawing ? [...stateBefore.currentDrawing] : null
        set((state) => {
          if (!state.currentDrawing || state.currentDrawing.length < 2) {
            return { currentDrawing: null, isDrawing: false }
          }
          const newDrawing: MapDrawing = {
            id: `drawing-${Date.now()}`,
            points: [...state.currentDrawing],
            color: state.drawColor,
            width: state.drawWidth,
            name: `Drawing ${state.drawings.length + 1}`,
          }
          return {
            drawings: [...state.drawings, newDrawing],
            currentDrawing: null,
            isDrawing: false,
          }
        })
        // Push undo for finish drawing
        if (!undoManager.isExecuting && currentDrawingBefore && currentDrawingBefore.length >= 2) {
          const newDrawingId = `drawing-${Date.now()}`
          undoManager.pushAction({
            type: 'drawing',
            description: 'Finish Drawing',
            undo: () => {
              useMapStore.setState((s) => ({
                drawings: s.drawings.filter((d) => d.id !== newDrawingId),
                currentDrawing: currentDrawingBefore,
                isDrawing: true,
              }))
            },
            redo: () => {
              useMapStore.setState((s) => {
                const drawing: MapDrawing = {
                  id: newDrawingId,
                  points: currentDrawingBefore,
                  color: s.drawColor,
                  width: s.drawWidth,
                  name: `Drawing ${s.drawings.length + 1}`,
                }
                return {
                  drawings: [...s.drawings, drawing],
                  currentDrawing: null,
                  isDrawing: false,
                }
              })
            },
          })
        }
      },

      setDrawColor: (drawColor) => set({ drawColor }),
      setDrawWidth: (drawWidth) => set({ drawWidth }),

      deleteDrawing: (id) => {
        const drawing = useMapStore.getState().drawings.find((d) => d.id === id)
        set((state) => ({
          drawings: state.drawings.filter((d) => d.id !== id),
        }))
        if (!undoManager.isExecuting && drawing) {
          undoManager.pushAction({
            type: 'drawing',
            description: 'Delete Drawing',
            undo: () => {
              useMapStore.setState((s) => ({
                drawings: [...s.drawings, drawing],
              }))
            },
            redo: () => {
              useMapStore.setState((s) => ({
                drawings: s.drawings.filter((d) => d.id !== id),
              }))
            },
          })
        }
      },

      setClusteringEnabled: (clusteringEnabled) => set({ clusteringEnabled }),
      setBuildingExtrusion: (buildingExtrusion) => set({ buildingExtrusion }),
      setBuildings3DEnabled: (buildings3DEnabled) => set({ buildings3DEnabled }),
      setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
      setMarkerIconPresets: (markerIconPresets) => set({ markerIconPresets }),
      setSelectedMarkerIcon: (selectedMarkerIcon) => set({ selectedMarkerIcon }),
      setTerrainEnabled: (terrainEnabled) => set({ terrainEnabled }),
      setTerrainExaggeration: (terrainExaggeration) => set({ terrainExaggeration }),
      setWeatherEnabled: (weatherEnabled) => set({ weatherEnabled }),
      setEarthquakesEnabled: (earthquakesEnabled) => set({ earthquakesEnabled }),
      setSunPositionEnabled: (sunPositionEnabled) => set({ sunPositionEnabled }),
      setTrafficEnabled: (trafficEnabled) => set({ trafficEnabled }),
      setIsochroneEnabled: (isochroneEnabled) => set({ isochroneEnabled }),
      setIsochroneMinutes: (isochroneMinutes) => set({ isochroneMinutes }),
      setIsochroneMode: (isochroneMode) => set({ isochroneMode }),

      pushNotification: (notification) =>
        set((state) => ({
          notifications: [
            { ...notification, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() },
            ...state.notifications,
          ].slice(0, 10),
        })),
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      setPoiMarkers: (poiMarkers) => set({ poiMarkers }),
      clearPoiMarkers: () => set({ poiMarkers: [] }),
      setPOIFilters: (filters) => set((state) => ({
        poiFilters: { ...state.poiFilters, ...filters },
      })),
      resetPOIFilters: () => set({
        poiFilters: {
          categories: [],
          radiusKm: 5,
          openNowOnly: false,
          keyword: '',
          minRating: 0,
        },
      }),
      addPOIFilterPreset: (preset) => set((state) => ({
        poiFilterPresets: [...state.poiFilterPresets, preset],
      })),
      deletePOIFilterPreset: (id) => set((state) => ({
        poiFilterPresets: state.poiFilterPresets.filter((p) => p.id !== id),
      })),
      loadPOIFilterPreset: (id) => set((state) => {
        const preset = state.poiFilterPresets.find((p) => p.id === id)
        if (preset) {
          return { poiFilters: { ...preset.filters } }
        }
        return {}
      }),
      setHeatmapEnabled: (heatmapEnabled) => set({ heatmapEnabled }),
      setHeatmapIntensity: (heatmapIntensity) => set({ heatmapIntensity }),
      setHeatmapRadius: (heatmapRadius) => set({ heatmapRadius }),
      setComparisonEnabled: (comparisonEnabled) => set({ comparisonEnabled }),
      setComparisonStyle: (comparisonStyle) => set({ comparisonStyle }),

      addBookmarkFolder: (folder) => set((state) => ({
        bookmarkFolders: [...state.bookmarkFolders, folder],
      })),

      deleteBookmarkFolder: (id) => set((state) => ({
        bookmarkFolders: state.bookmarkFolders.filter((f) => f.id !== id),
      })),

      renameBookmarkFolder: (id, name) => set((state) => ({
        bookmarkFolders: state.bookmarkFolders.map((f) =>
          f.id === id ? { ...f, name } : f
        ),
      })),

      updateBookmarkFolder: (id, updates) => set((state) => ({
        bookmarkFolders: state.bookmarkFolders.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        ),
      })),

      addLocationToFolder: (folderId, locationId) => set((state) => ({
        bookmarkFolders: state.bookmarkFolders.map((f) =>
          f.id === folderId && !f.locationIds.includes(locationId)
            ? { ...f, locationIds: [...f.locationIds, locationId] }
            : f
        ),
      })),

      removeLocationFromFolder: (folderId, locationId) => set((state) => ({
        bookmarkFolders: state.bookmarkFolders.map((f) =>
          f.id === folderId
            ? { ...f, locationIds: f.locationIds.filter((id) => id !== locationId) }
            : f
        ),
      })),

      setOfflineModeEnabled: (offlineModeEnabled) => set({ offlineModeEnabled }),

      // Voice navigation actions
      setVoiceNavigationEnabled: (voiceNavigationEnabled) => set({ voiceNavigationEnabled, voiceCurrentStepIndex: 0 }),
      setVoiceLanguage: (voiceLanguage) => set({ voiceLanguage }),
      setVoiceCurrentStepIndex: (voiceCurrentStepIndex) => set({ voiceCurrentStepIndex }),

      // Enhanced drawing tool actions
      setDrawingTool: (drawingTool) => set({ drawingTool }),
      setDrawingColor: (drawingColor) => set({ drawingColor }),
      setDrawingLineWidth: (drawingLineWidth) => set({ drawingLineWidth }),
      addDrawnFeature: (feature) => set((state) => ({
        drawnFeatures: [...state.drawnFeatures, feature],
      })),
      removeDrawnFeature: (id) => set((state) => ({
        drawnFeatures: state.drawnFeatures.filter((f) => f.id !== id),
      })),
      clearDrawnFeatures: () => set({ drawnFeatures: [] }),

      addCustomTileSource: (source) => set((state) => ({
        customTileSources: [...state.customTileSources, source],
      })),

      removeCustomTileSource: (id) => set((state) => ({
        customTileSources: state.customTileSources.filter((s) => s.id !== id),
      })),

      toggleCustomTileSource: (id) => set((state) => ({
        customTileSources: state.customTileSources.map((s) =>
          s.id === id ? { ...s, visible: !s.visible } : s
        ),
      })),

      // WMS/WMTS tile source actions
      addWMSTileSource: (source) => set((state) => ({
        wmsTileSources: [...state.wmsTileSources, source],
      })),

      removeWMSTileSource: (id) => set((state) => ({
        wmsTileSources: state.wmsTileSources.filter((s) => s.id !== id),
      })),

      toggleWMSTileSourceVisibility: (id) => set((state) => ({
        wmsTileSources: state.wmsTileSources.map((s) =>
          s.id === id ? { ...s, isVisible: !s.isVisible } : s
        ),
      })),

      updateWMSTileSourceOpacity: (id, opacity) => set((state) => ({
        wmsTileSources: state.wmsTileSources.map((s) =>
          s.id === id ? { ...s, opacity } : s
        ),
      })),

      // Track stats panel actions
      setTrackStatsPanelOpen: (trackStatsPanelOpen) => set({ trackStatsPanelOpen }),

      addAnnotation: (annotation) => set((state) => ({
        annotations: [...state.annotations, annotation],
      })),

      updateAnnotation: (id, updates) => set((state) => ({
        annotations: state.annotations.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),

      setElevationRouteId: (elevationRouteId) => set({ elevationRouteId }),

      deleteAnnotation: (id) => set((state) => ({
        annotations: state.annotations.filter((a) => a.id !== id),
      })),

      // Track recording actions
      startRecording: () => set({
        isRecording: true,
        currentTrack: [],
        recordingStats: {
          distance: 0,
          duration: 0,
          currentSpeed: null,
          maxSpeed: 0,
          avgSpeed: 0,
          elevationGain: 0,
          elevationLoss: 0,
        },
      }),

      stopRecording: () => set({ isRecording: false }),

      addTrackPoint: (point) => set((state) => {
        const newTrack = [...state.currentTrack, point]
        let distance = state.recordingStats.distance
        let elevationGain = state.recordingStats.elevationGain
        let elevationLoss = state.recordingStats.elevationLoss
        let maxSpeed = state.recordingStats.maxSpeed

        if (newTrack.length >= 2) {
          const prev = newTrack[newTrack.length - 2]
          const R = 6371
          const dLat = ((point.latitude - prev.latitude) * Math.PI) / 180
          const dLon = ((point.longitude - prev.longitude) * Math.PI) / 180
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((prev.latitude * Math.PI) / 180) *
            Math.cos((point.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          distance += R * c

          if (point.elevation !== null && prev.elevation !== null) {
            const diff = point.elevation - prev.elevation
            if (diff > 0) elevationGain += diff
            else elevationLoss += Math.abs(diff)
          }
        }

        if (point.speed !== null && point.speed > maxSpeed) {
          maxSpeed = point.speed
        }

        const duration = newTrack.length >= 2
          ? (newTrack[newTrack.length - 1].timestamp - newTrack[0].timestamp) / 1000
          : 0
        const avgSpeed = duration > 0 ? (distance / duration) * 3600 : 0

        return {
          currentTrack: newTrack,
          recordingStats: {
            distance,
            duration,
            currentSpeed: point.speed,
            maxSpeed,
            avgSpeed,
            elevationGain,
            elevationLoss,
          },
        }
      }),

      clearCurrentTrack: () => set({
        currentTrack: [],
        recordingStats: {
          distance: 0,
          duration: 0,
          currentSpeed: null,
          maxSpeed: 0,
          avgSpeed: 0,
          elevationGain: 0,
          elevationLoss: 0,
        },
      }),

      saveCurrentTrack: (name) => set((state) => {
        if (state.currentTrack.length < 2) return state
        const newTrack: TrackRecording = {
          id: `track-${Date.now()}`,
          name,
          color: '#ef4444',
          points: [...state.currentTrack],
          distance: state.recordingStats.distance,
          duration: state.recordingStats.duration,
          startedAt: state.currentTrack[0]
            ? new Date(state.currentTrack[0].timestamp).toISOString()
            : new Date().toISOString(),
          stoppedAt: new Date().toISOString(),
        }
        return {
          savedTracks: [...state.savedTracks, newTrack],
          currentTrack: [],
          isRecording: false,
          recordingStats: {
            distance: 0,
            duration: 0,
            currentSpeed: null,
            maxSpeed: 0,
            avgSpeed: 0,
            elevationGain: 0,
            elevationLoss: 0,
          },
        }
      }),

      deleteTrack: (id) => set((state) => ({
        savedTracks: state.savedTracks.filter((t) => t.id !== id),
      })),

      // Geofence actions
      addGeofence: (geofence) => set((state) => ({
        geofences: [...state.geofences, geofence],
      })),

      removeGeofence: (id) => set((state) => ({
        geofences: state.geofences.filter((g) => g.id !== id),
      })),

      updateGeofence: (id, updates) => set((state) => ({
        geofences: state.geofences.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
      })),

      toggleGeofence: (id) => set((state) => ({
        geofences: state.geofences.map((g) =>
          g.id === id ? { ...g, isActive: !g.isActive } : g
        ),
      })),

      // Multi-route comparison actions
      addComparedRoute: (routeId) => set((state) => {
        if (state.comparedRoutes.includes(routeId)) return state
        if (state.comparedRoutes.length >= 3) return state
        return { comparedRoutes: [...state.comparedRoutes, routeId] }
      }),

      removeComparedRoute: (routeId) => set((state) => ({
        comparedRoutes: state.comparedRoutes.filter((id) => id !== routeId),
      })),

      clearComparedRoutes: () => set({ comparedRoutes: [] }),

      // Accessibility actions
      setHighContrastMode: (enabled) => set({ highContrastMode: enabled }),
      setLargeTextMode: (enabled) => set({ largeTextMode: enabled }),
      setReducedMotionMode: (enabled) => set({ reducedMotionMode: enabled }),
      setScreenReaderMode: (enabled) => set({ screenReaderMode: enabled }),
      setColorBlindMode: (enabled) => set({ colorBlindMode: enabled }),

      // Map theme customization actions
      setMapThemeOverrides: (overrides) => set({ mapThemeOverrides: overrides }),
      setMapThemePreset: (preset) => set({ mapThemePreset: preset }),

      // Panel visibility actions
      setAccessibilityPanelOpen: (open) => set({ accessibilityPanelOpen: open }),
      setTerrainAnalysisRouteId: (id) => set({ terrainAnalysisRouteId: id }),

      // Image overlay actions
      addImageOverlay: (overlay) => set((state) => ({
        imageOverlays: [...state.imageOverlays, overlay],
      })),

      removeImageOverlay: (id) => set((state) => ({
        imageOverlays: state.imageOverlays.filter((o) => o.id !== id),
      })),

      toggleImageOverlay: (id) => set((state) => ({
        imageOverlays: state.imageOverlays.map((o) =>
          o.id === id ? { ...o, visible: !o.visible } : o
        ),
      })),

      updateImageOverlayOpacity: (id, opacity) => set((state) => ({
        imageOverlays: state.imageOverlays.map((o) =>
          o.id === id ? { ...o, opacity } : o
        ),
      })),

      // Spatial analysis actions
      addSpatialResult: (result) => set((state) => ({
        spatialResults: [...state.spatialResults, result],
      })),

      clearSpatialResults: () => set({ spatialResults: [] }),

      removeSpatialResult: (id) => set((state) => ({
        spatialResults: state.spatialResults.filter((r) => r.id !== id),
      })),

      // Collapsed sections actions
      toggleSection: (sectionId) => set((state) => ({
        collapsedSections: {
          ...state.collapsedSections,
          [sectionId]: !state.collapsedSections[sectionId],
        },
      })),

      // Map history / timeline actions
      addToHistory: () => set((state) => {
        const entry = {
          center: [...state.center] as [number, number],
          zoom: state.zoom,
          timestamp: Date.now(),
          style: state.currentStyle.id,
        }
        const history = [...state.mapHistory, entry].slice(-100)
        return { mapHistory: history }
      }),

      goToHistory: (index) => {
        const entry = useMapStore.getState().mapHistory[index]
        if (!entry) return

        const style = MAP_STYLES.find((s) => s.id === entry.style) || MAP_STYLES[0]

        if (typeof window !== 'undefined') {
          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
          if (flyTo) {
            flyTo(entry.center[0], entry.center[1], entry.zoom)
          }
        }

        set({
          center: [...entry.center] as [number, number],
          zoom: entry.zoom,
          currentStyle: style,
        })
      },

      clearHistory: () => set({ mapHistory: [] }),

      setTimelineOpen: (timelineOpen) => set({ timelineOpen }),

      // Search history actions
      addSearchHistory: (query) => set((state) => {
        const trimmed = query.trim()
        if (!trimmed) return state
        const filtered = state.searchHistory.filter((s) => s !== trimmed)
        return { searchHistory: [trimmed, ...filtered].slice(0, 10) }
      }),

      clearSearchHistory: () => set({ searchHistory: [] }),

      // Route optimization actions
      setRouteOptimized: (routeOptimized) => set({ routeOptimized }),
      setOriginalRoutePoints: (originalRoutePoints) => set({ originalRoutePoints }),

      // Analytics panel actions
      setAnalyticsPanelOpen: (analyticsPanelOpen) => set({ analyticsPanelOpen }),

      // AQI panel actions
      setAqiPanelOpen: (aqiPanelOpen) => set({ aqiPanelOpen }),

      // Print dialog actions
      setPrintDialogOpen: (printDialogOpen) => set({ printDialogOpen }),

      // Location photos actions
      updateLocationPhotos: (locationId, photos) => set((state) => ({
        savedLocations: state.savedLocations.map((loc) =>
          loc.id === locationId ? { ...loc, photos, updatedAt: new Date().toISOString() } : loc
        ),
      })),

      // Tool usage history actions
      addToolUsage: (tool) => set((state) => ({
        toolUsageHistory: [...state.toolUsageHistory, { tool, timestamp: Date.now() }].slice(-200),
      })),

      // Language actions
      setLanguage: (language) => set({ language }),

      // App notification actions
      addAppNotification: (notification) => set((state) => ({
        appNotifications: [
          { ...notification, id: `appnotif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now(), read: false },
          ...state.appNotifications,
        ].slice(0, 50),
      })),

      markAllNotificationsRead: () => set((state) => ({
        appNotifications: state.appNotifications.map((n) => ({ ...n, read: true })),
      })),

      clearAppNotifications: () => set({ appNotifications: [] }),

      // Snapshot actions
      saveSnapshot: (name) => set((state) => {
        const snapshot: MapSnapshot = {
          id: `snapshot-${Date.now()}`,
          name,
          center: [...state.center] as [number, number],
          zoom: state.zoom,
          bearing: state.bearing,
          pitch: state.pitch,
          style: state.currentStyle.id,
          markers: [...state.markers],
          timestamp: Date.now(),
        }
        return { snapshots: [...state.snapshots, snapshot] }
      }),

      loadSnapshot: (id) => {
        const snapshot = useMapStore.getState().snapshots.find((s) => s.id === id)
        if (!snapshot) return

        const style = MAP_STYLES.find((s) => s.id === snapshot.style) || MAP_STYLES[0]

        // Fly to position
        if (typeof window !== 'undefined') {
          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
          if (flyTo) {
            flyTo(snapshot.center[0], snapshot.center[1], snapshot.zoom)
          }
        }

        set({
          center: [...snapshot.center] as [number, number],
          zoom: snapshot.zoom,
          bearing: snapshot.bearing,
          pitch: snapshot.pitch,
          currentStyle: style,
          markers: [...snapshot.markers],
        })

        useMapStore.getState().pushNotification({
          type: 'general',
          icon: 'camera',
          message: `Restored snapshot: ${snapshot.name}`,
        })
      },

      deleteSnapshot: (id) => set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== id),
      })),

      // Trip Planner actions
      addTripPlan: (plan) => set((state) => ({
        tripPlans: [...state.tripPlans, plan],
      })),

      deleteTripPlan: (id) => set((state) => ({
        tripPlans: state.tripPlans.filter((p) => p.id !== id),
      })),

      updateTripPlan: (id, updates) => set((state) => ({
        tripPlans: state.tripPlans.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),

      addTripStop: (planId, dayId, stop) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                days: p.days.map((d) =>
                  d.id === dayId
                    ? { ...d, stops: [...d.stops, stop] }
                    : d
                ),
              }
            : p
        ),
      })),

      removeTripStop: (planId, dayId, stopId) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                days: p.days.map((d) =>
                  d.id === dayId
                    ? { ...d, stops: d.stops.filter((s) => s.id !== stopId) }
                    : d
                ),
              }
            : p
        ),
      })),

      reorderTripStops: (planId, dayId, stops) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                days: p.days.map((d) =>
                  d.id === dayId ? { ...d, stops } : d
                ),
              }
            : p
        ),
      })),

      updateTripStop: (planId, dayId, stopId, updates) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                days: p.days.map((d) =>
                  d.id === dayId
                    ? { ...d, stops: d.stops.map((s) => s.id === stopId ? { ...s, ...updates } : s) }
                    : d
                ),
              }
            : p
        ),
      })),

      addTripDay: (planId, day) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId ? { ...p, days: [...p.days, day] } : p
        ),
      })),

      removeTripDay: (planId, dayId) => set((state) => ({
        tripPlans: state.tripPlans.map((p) =>
          p.id === planId
            ? { ...p, days: p.days.filter((d) => d.id !== dayId) }
            : p
        ),
      })),

      // GPS Simulation actions
      setGpsSimulation: (updates) => set((state) => ({
        gpsSimulation: { ...state.gpsSimulation, ...updates },
      })),

      resetGpsSimulation: () => set({
        gpsSimulation: {
          isPlaying: false,
          speedMultiplier: 1,
          progress: 0,
          currentPosition: null,
          distanceRemaining: 0,
          eta: 0,
          routeId: null,
        },
      }),

      // Map Notes actions
      addMapNote: (note) => set((state) => ({
        mapNotes: [...state.mapNotes, note],
      })),

      updateMapNote: (id, updates) => set((state) => ({
        mapNotes: state.mapNotes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        ),
      })),

      deleteMapNote: (id) => set((state) => ({
        mapNotes: state.mapNotes.filter((n) => n.id !== id),
      })),

      setMapNotes: (notes) => set({ mapNotes: notes }),

      // Batch Operations actions
      setBatchSelectMode: (enabled) => set((state) => ({
        batchOperation: {
          ...state.batchOperation,
          isSelectMode: enabled,
          selectedMarkerIds: enabled ? state.batchOperation.selectedMarkerIds : [],
        },
      })),

      toggleMarkerSelection: (id) => set((state) => {
        const ids = state.batchOperation.selectedMarkerIds
        const newIds = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
        return { batchOperation: { ...state.batchOperation, selectedMarkerIds: newIds } }
      }),

      selectAllMarkers: () => set((state) => ({
        batchOperation: {
          ...state.batchOperation,
          selectedMarkerIds: state.markers.map((m) => m.id),
        },
      })),

      deselectAllMarkers: () => set((state) => ({
        batchOperation: { ...state.batchOperation, selectedMarkerIds: [] },
      })),

      batchDeleteMarkers: () => set((state) => ({
        markers: state.markers.filter((m) => !state.batchOperation.selectedMarkerIds.includes(m.id)),
        batchOperation: { ...state.batchOperation, selectedMarkerIds: [], isSelectMode: false },
      })),

      batchChangeCategory: (category, color) => set((state) => ({
        markers: state.markers.map((m) =>
          state.batchOperation.selectedMarkerIds.includes(m.id)
            ? { ...m, category, color }
            : m
        ),
      })),

      batchExportGeoJSON: () => {
        const state = useMapStore.getState()
        const selected = state.markers.filter((m) =>
          state.batchOperation.selectedMarkerIds.includes(m.id)
        )
        const geojson = {
          type: 'FeatureCollection' as const,
          features: selected.map((m) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [m.longitude, m.latitude] as [number, number],
            },
            properties: {
              name: m.name,
              category: m.category,
              color: m.color,
              description: m.description || '',
            },
          })),
        }
        return JSON.stringify(geojson, null, 2)
      },

      // Embed Map Dialog
      embedDialogOpen: false,
      setEmbedDialogOpen: (open) => set({ embedDialogOpen: open }),

      // GeoJSON Editor
      geoJsonEditorOpen: false,
      setGeoJsonEditorOpen: (open) => set({ geoJsonEditorOpen: open }),
      customGeoJson: null,
      setCustomGeoJson: (geojson) => set({ customGeoJson: geojson }),

      // Marker Categories
      markerCategories: [
        { id: 'general', name: 'General', emoji: '📌', color: '#6b7280', icon: 'MapPin', isDefault: true },
        { id: 'favorite', name: 'Favorite', emoji: '⭐', color: '#f59e0b', icon: 'Star', isDefault: true },
        { id: 'restaurant', name: 'Restaurant', emoji: '🍽️', color: '#ef4444', icon: 'UtensilsCrossed', isDefault: true },
        { id: 'hotel', name: 'Hotel', emoji: '🏨', color: '#3b82f6', icon: 'Hotel', isDefault: true },
        { id: 'park', name: 'Park', emoji: '🌳', color: '#22c55e', icon: 'TreePine', isDefault: true },
        { id: 'shop', name: 'Shop', emoji: '🛍️', color: '#a855f7', icon: 'ShoppingBag', isDefault: true },
        { id: 'gas', name: 'Gas Station', emoji: '⛽', color: '#f97316', icon: 'Fuel', isDefault: true },
        { id: 'hospital', name: 'Hospital', emoji: '🏥', color: '#dc2626', icon: 'Cross', isDefault: true },
      ],
      markerCategoriesOpen: false,
      setMarkerCategoriesOpen: (open) => set({ markerCategoriesOpen: open }),
      addMarkerCategory: (category) => set((state) => ({
        markerCategories: [...state.markerCategories, { ...category, id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, isDefault: false }],
      })),
      updateMarkerCategory: (id, updates) => set((state) => ({
        markerCategories: state.markerCategories.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteMarkerCategory: (id) => set((state) => ({
        markerCategories: state.markerCategories.filter((c) => c.id !== id || c.isDefault),
      })),

      // Map Styles Mixer
      stylesMixerOpen: false,
      setStylesMixerOpen: (open) => set({ stylesMixerOpen: open }),
      styleMixLayers: [],
      addStyleMixLayer: (layer) => set((state) => ({
        styleMixLayers: [...state.styleMixLayers, layer],
      })),
      removeStyleMixLayer: (id) => set((state) => ({
        styleMixLayers: state.styleMixLayers.filter((l) => l.id !== id),
      })),
      toggleStyleMixLayerVisibility: (id) => set((state) => ({
        styleMixLayers: state.styleMixLayers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l),
      })),
      updateStyleMixLayerOpacity: (id, opacity) => set((state) => ({
        styleMixLayers: state.styleMixLayers.map((l) => l.id === id ? { ...l, opacity } : l),
      })),
      clearStyleMixLayers: () => set({ styleMixLayers: [] }),

      // Route Waypoint Optimizer
      waypointOptimizerOpen: false,
      setWaypointOptimizerOpen: (open) => set({ waypointOptimizerOpen: open }),
      optimizedWaypointOrder: null,
      setOptimizedWaypointOrder: (order) => set({ optimizedWaypointOrder: order }),

      // Route Sharing
      routeSharingOpen: false,
      setRouteSharingOpen: (open) => set({ routeSharingOpen: open }),

      // Route Playback defaults
      routePlayback: {
        routeId: null,
        isPlaying: false,
        progress: 0,
        speed: 1,
        followCamera: true,
      },
      setRoutePlayback: (updates) => set((state) => ({
        routePlayback: { ...state.routePlayback, ...updates },
      })),
      routePlaybackOpen: false,
      setRoutePlaybackOpen: (open) => set({ routePlaybackOpen: open }),

      // Speed Alert System defaults
      speedZones: [],
      addSpeedZone: (zone) => set((state) => ({
        speedZones: [...state.speedZones, zone],
      })),
      removeSpeedZone: (id) => set((state) => ({
        speedZones: state.speedZones.filter((z) => z.id !== id),
      })),
      clearSpeedZones: () => set({ speedZones: [] }),
      speedAlertLog: [],
      addSpeedAlert: (entry) => set((state) => ({
        speedAlertLog: [{ ...entry, timestamp: Date.now() }, ...state.speedAlertLog].slice(0, 50),
      })),
      speedAlertOpen: false,
      setSpeedAlertOpen: (open) => set({ speedAlertOpen: open }),
      speedLimit: 50,
      setSpeedLimit: (limit) => set({ speedLimit: limit }),
      currentSpeed: 0,
      setCurrentSpeed: (speed) => set({ currentSpeed: speed }),

      // Map Labels
      mapLabels: [],
      addMapLabel: (label) => set((state) => ({
        mapLabels: [...state.mapLabels, label],
      })),
      updateMapLabel: (id, updates) => set((state) => ({
        mapLabels: state.mapLabels.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
      })),
      removeMapLabel: (id) => set((state) => ({
        mapLabels: state.mapLabels.filter((l) => l.id !== id),
      })),
      clearMapLabels: () => set({ mapLabels: [] }),
      mapLabelsOpen: false,
      setMapLabelsOpen: (open) => set({ mapLabelsOpen: open }),

      // Contour Generator
      contourData: null,
      setContourData: (data) => set({ contourData: data }),
      clearContourData: () => set({ contourData: null }),
      contourGeneratorOpen: false,
      setContourGeneratorOpen: (open) => set({ contourGeneratorOpen: open }),

      // Location Clustering defaults
      clusteringState: {
        algorithm: 'kmeans',
        k: 3,
        epsilon: 50,
        minPoints: 2,
        clusters: [],
        silhouetteScore: null,
      },
      setClusteringState: (updates) => set((state) => ({
        clusteringState: { ...state.clusteringState, ...updates },
      })),
      clusteringOpen: false,
      setClusteringOpen: (open) => set({ clusteringOpen: open }),

      // Map Story Creator defaults
      mapStories: [],
      addMapStory: (story) => set((state) => ({
        mapStories: [...state.mapStories, story],
      })),
      updateMapStory: (id, updates) => set((state) => ({
        mapStories: state.mapStories.map((s) => s.id === id ? { ...s, ...updates } : s),
      })),
      removeMapStory: (id) => set((state) => ({
        mapStories: state.mapStories.filter((s) => s.id !== id),
        activeStoryId: state.activeStoryId === id ? null : state.activeStoryId,
      })),
      activeStoryId: null,
      setActiveStoryId: (id) => set({ activeStoryId: id }),
      storyPlayback: { isPlaying: false, currentStopIndex: 0 },
      setStoryPlayback: (playback) => set((state) => ({
        storyPlayback: { ...state.storyPlayback, ...playback },
      })),
      storyCreatorOpen: false,
      setStoryCreatorOpen: (open) => set({ storyCreatorOpen: open }),

      // Terrain Profile 3D defaults
      terrainProfile3D: {
        waterLevel: 0,
        rotationX: -30,
        rotationY: 45,
        zoom: 1,
      },
      setTerrainProfile3D: (updates) => set((state) => ({
        terrainProfile3D: { ...state.terrainProfile3D, ...updates },
      })),
      terrainProfile3DOpen: false,
      setTerrainProfile3DOpen: (open) => set({ terrainProfile3DOpen: open }),

      // Data Import/Export defaults
      importExportState: {
        lastImportAt: null,
        lastExportAt: null,
        importCount: 0,
        exportCount: 0,
      },
      setImportExportState: (updates) => set((state) => ({
        importExportState: { ...state.importExportState, ...updates },
      })),
      importExportOpen: false,
      setImportExportOpen: (open) => set({ importExportOpen: open }),

      // Advanced Marker Manager defaults
      markerManagerState: {
        selectedMarkerIds: [],
        searchQuery: '',
        filterCategory: '',
        sortBy: 'name',
        areaSelectMode: false,
      },
      setMarkerManagerState: (updates) => set((state) => ({
        markerManagerState: { ...state.markerManagerState, ...updates },
      })),
      markerManagerOpen: false,
      setMarkerManagerOpen: (open) => set({ markerManagerOpen: open }),

      // Geofence Alert History defaults
      geofenceEvents: [],
      addGeofenceEvent: (event) => set((state) => ({
        geofenceEvents: [...state.geofenceEvents, { ...event, id: `ge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
      })),
      clearGeofenceEvents: () => set({ geofenceEvents: [] }),
      geofenceAlertOpen: false,
      setGeofenceAlertOpen: (open) => set({ geofenceAlertOpen: open }),
      geofenceAlertsEnabled: true,
      setGeofenceAlertsEnabled: (enabled) => set({ geofenceAlertsEnabled: enabled }),

      // Coordinate Grid Overlay
      coordinateGrid: {
        enabled: false,
        interval: 10,
        showLabels: true,
        showMinorGrid: true,
        latColor: '#14b8a6',
        lngColor: '#f59e0b',
      },
      setCoordinateGrid: (updates) => set((state) => ({ coordinateGrid: { ...state.coordinateGrid, ...updates } })),

      // Map Overlay Gallery
      mapOverlays: [],
      setMapOverlay: (id, updates) => set((state) => ({
        mapOverlays: state.mapOverlays.map((o) => o.id === id ? { ...o, ...updates } : o),
      })),
      addMapOverlay: (overlay) => set((state) => ({ mapOverlays: [...state.mapOverlays, overlay] })),
      removeMapOverlay: (id) => set((state) => ({ mapOverlays: state.mapOverlays.filter((o) => o.id !== id) })),
      overlayGalleryOpen: false,
      setOverlayGalleryOpen: (open) => set({ overlayGalleryOpen: open }),

      // Location Visit Timeline defaults
      timelineEvents: [],
      addTimelineEvent: (event) => set((state) => ({
        timelineEvents: [...state.timelineEvents, { ...event, id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
      })),
      visitTimelineOpen: false,
      setVisitTimelineOpen: (open) => set({ visitTimelineOpen: open }),

      // Weather Comparison defaults
      weatherCompareLocations: [],
      addWeatherCompareLocation: (location) => set((state) => {
        if (state.weatherCompareLocations.length >= 5) return state
        if (state.weatherCompareLocations.some((l) => l.locationId === location.locationId)) return state
        return { weatherCompareLocations: [...state.weatherCompareLocations, location] }
      }),
      removeWeatherCompareLocation: (locationId) => set((state) => ({
        weatherCompareLocations: state.weatherCompareLocations.filter((l) => l.locationId !== locationId),
      })),
      clearWeatherCompareLocations: () => set({ weatherCompareLocations: [] }),
      weatherCompareOpen: false,
      setWeatherCompareOpen: (open) => set({ weatherCompareOpen: open }),

      // Measurement Suite
      measurementSuite: {
        mode: 'distance',
        unitSystem: 'metric',
        results: [],
        activeMode: false,
      },
      setMeasurementSuite: (updates) => set((state) => ({
        measurementSuite: { ...state.measurementSuite, ...updates },
      })),
      addMeasurementResult: (result) => set((state) => ({
        measurementSuite: { ...state.measurementSuite, results: [...state.measurementSuite.results, result] },
      })),
      clearMeasurementResults: () => set((state) => ({
        measurementSuite: { ...state.measurementSuite, results: [] },
      })),
      measurementSuiteOpen: false,
      setMeasurementSuiteOpen: (open) => set({ measurementSuiteOpen: open }),

      // Trail Finder
      foundTrails: [],
      setFoundTrails: (trails) => set({ foundTrails: trails }),
      trailFinderOpen: false,
      setTrailFinderOpen: (open) => set({ trailFinderOpen: open }),
      selectedTrailId: null,
      setSelectedTrailId: (id) => set({ selectedTrailId: id }),

      // Screenshot Manager
      savedScreenshots: [],
      addScreenshot: (screenshot) => set((state) => {
        const updated = [screenshot, ...state.savedScreenshots]
        // Limit to last 10 to prevent localStorage overflow
        return { savedScreenshots: updated.slice(0, 10) }
      }),
      removeScreenshot: (id) => set((state) => ({
        savedScreenshots: state.savedScreenshots.filter((s) => s.id !== id),
      })),
      clearScreenshots: () => set({ savedScreenshots: [] }),
      screenshotManagerOpen: false,
      setScreenshotManagerOpen: (open) => set({ screenshotManagerOpen: open }),

      // Route Difficulty Analyzer
      difficultyAnalysis: null,
      setDifficultyAnalysis: (analysis) => set({ difficultyAnalysis: analysis }),
      difficultyAnalyzerOpen: false,
      setDifficultyAnalyzerOpen: (open) => set({ difficultyAnalyzerOpen: open }),

      // Pedometer defaults
      pedometer: {
        isTracking: false,
        steps: 0,
        distance: 0,
        startTime: null,
        lastPosition: null,
        dailyGoal: 10000,
        distanceGoal: 8000,
        history: [],
      },
      setPedometer: (updates) => set((state) => ({
        pedometer: { ...state.pedometer, ...updates },
      })),
      pedometerVisible: false,
      setPedometerVisible: (visible) => set({ pedometerVisible: visible }),

      // Usage Stats defaults
      usageStats: {
        sessionCount: 1,
        totalSessionTime: 0,
        totalSearches: 0,
        totalLocationsAdded: 0,
        totalRoutesCreated: 0,
        totalMeasurements: 0,
        totalScreenshots: 0,
        totalStyleSwitches: 0,
        searchTerms: {},
        dailyUsage: {},
        toolUsage: {},
        achievementsUnlocked: [],
      },
      setUsageStats: (updates) => set((state) => ({
        usageStats: { ...state.usageStats, ...updates },
      })),
      incrementStat: (key) => set((state) => ({
        usageStats: { ...state.usageStats, [key]: state.usageStats[key] + 1 },
      })),
      usageStatsOpen: false,
      setUsageStatsOpen: (open) => set({ usageStatsOpen: open }),

      // Map Collage Creator defaults
      mapCollage: null,
      setMapCollage: (collage) => set({ mapCollage: collage }),
      collageCreatorOpen: false,
      setCollageCreatorOpen: (open) => set({ collageCreatorOpen: open }),

      // Nearby Events Finder defaults
      nearbyEvents: [],
      setNearbyEvents: (events) => set({ nearbyEvents: events }),
      eventsFinderOpen: false,
      setEventsFinderOpen: (open) => set({ eventsFinderOpen: open }),
      eventSearchRadius: 10,
      setEventSearchRadius: (radius) => set({ eventSearchRadius: radius }),

      // Altitude Alert System defaults
      altitudeState: {
        currentAltitude: null,
        minAltitude: null,
        maxAltitude: null,
        targetAltitude: null,
        zones: [
          { id: 'lowland', name: 'Lowland', minAlt: 0, maxAlt: 500, color: '#22c55e' },
          { id: 'highland', name: 'Highland', minAlt: 500, maxAlt: 1500, color: '#eab308' },
          { id: 'alpine', name: 'Alpine', minAlt: 1500, maxAlt: 3000, color: '#f97316' },
          { id: 'high-alpine', name: 'High Alpine', minAlt: 3000, maxAlt: 8849, color: '#ef4444' },
        ],
        alerts: [],
        history: [],
      },
      setAltitudeState: (updates) => set((state) => ({
        altitudeState: { ...state.altitudeState, ...updates },
      })),
      altitudeAlertOpen: false,
      setAltitudeAlertOpen: (open) => set({ altitudeAlertOpen: open }),

      // Custom Compass Rose defaults
      compassRose: {
        style: 'classic',
        points: 8,
        primaryColor: '#14b8a6',
        secondaryColor: '#64748b',
        size: 'medium',
        opacity: 0.9,
        showDegrees: true,
        showLabels: true,
        position: 'top-right',
        visible: true,
      },
      setCompassRose: (updates) => set((state) => ({
        compassRose: { ...state.compassRose, ...updates },
      })),

      // Multi-Stop Route Planner defaults
      multiStopRoute: null,
      setMultiStopRoute: (route) => set({ multiStopRoute: route }),
      multiStopPlannerOpen: false,
      setMultiStopPlannerOpen: (open) => set({ multiStopPlannerOpen: open }),

      // Enhanced Weather Dashboard defaults
      enhancedWeather: {
        temperature: null,
        feelsLike: null,
        humidity: null,
        windSpeed: null,
        windDirection: null,
        pressure: null,
        uvIndex: null,
        visibility: null,
        cloudCover: null,
        precipitation: null,
        weatherCode: null,
        lastUpdated: null,
      },
      setEnhancedWeather: (data) => set((state) => ({
        enhancedWeather: { ...state.enhancedWeather, ...data },
      })),
      enhancedWeatherOpen: false,
      setEnhancedWeatherOpen: (open) => set({ enhancedWeatherOpen: open }),
      temperatureUnit: 'celsius',
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),

      // Sun Shadow Calculator defaults
      sunShadowState: {
        buildings: [],
        selectedTime: 12,
        selectedDate: typeof Date !== 'undefined' ? new Date().toISOString().split('T')[0] : '2024-01-01',
        isAnimating: false,
        animationSpeed: 1,
      },
      setSunShadowState: (updates) => set((state) => ({
        sunShadowState: { ...state.sunShadowState, ...updates },
      })),
      sunShadowOpen: false,
      setSunShadowOpen: (open) => set({ sunShadowOpen: open }),

      // SVG Marker Designer defaults
      svgMarkerDesigns: [],
      addSVGMarkerDesign: (design) => set((state) => ({
        svgMarkerDesigns: [...state.svgMarkerDesigns, design],
      })),
      updateSVGMarkerDesign: (id, updates) => set((state) => ({
        svgMarkerDesigns: state.svgMarkerDesigns.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      })),
      removeSVGMarkerDesign: (id) => set((state) => ({
        svgMarkerDesigns: state.svgMarkerDesigns.filter((d) => d.id !== id),
        activeMarkerDesign: state.activeMarkerDesign === id ? null : state.activeMarkerDesign,
      })),
      activeMarkerDesign: null,
      setActiveMarkerDesign: (id) => set({ activeMarkerDesign: id }),
      markerDesignerOpen: false,
      setMarkerDesignerOpen: (open) => set({ markerDesignerOpen: open }),

      // Coordinate Share Card defaults
      shareCardState: {
        style: 'modern',
        size: 'landscape',
        showQR: true,
        showCoords: true,
        showMap: true,
        accentColor: '#14b8a6',
        message: '',
      },
      setShareCardState: (updates) => set((state) => ({
        shareCardState: { ...state.shareCardState, ...updates },
      })),
      shareCardOpen: false,
      setShareCardOpen: (open) => set({ shareCardOpen: open }),

      // Map Wallpaper Generator defaults
      wallpaperState: {
        filter: 'vibrant',
        customFilter: { brightness: 100, contrast: 100, saturation: 100, hue: 0 },
        resolution: '1920x1080',
        customWidth: 1920,
        customHeight: 1080,
        showClock: false,
        showWeather: false,
        showText: false,
        textContent: '',
        textPosition: 'bottom-left',
        textFont: 'modern',
        textSize: 'medium',
        textColor: '#ffffff',
        textShadow: true,
        vignette: false,
        darkGradient: false,
      },
      setWallpaperState: (updates) => set((state) => ({
        wallpaperState: { ...state.wallpaperState, ...updates },
      })),
      wallpaperOpen: false,
      setWallpaperOpen: (open) => set({ wallpaperOpen: open }),

      // Chat Assistant defaults
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        }],
      })),
      clearChatMessages: () => set({ chatMessages: [] }),
      chatOpen: false,
      setChatOpen: (open) => set({ chatOpen: open }),

      // POI Density Heatmap defaults
      poiHeatmap: {
        enabled: false,
        radius: 25,
        intensity: 0.5,
        colorScheme: 'thermal',
        categoryFilter: null,
      },
      setPOIHeatmap: (updates) => set((state) => ({
        poiHeatmap: { ...state.poiHeatmap, ...updates },
      })),

      // Map Animation Studio
      animationStudio: {
        animations: [],
        activeAnimationId: null,
        isPlaying: false,
        currentKeyframeIndex: 0,
        playbackSpeed: 1,
      },
      setAnimationStudio: (updates) => set((state) => ({
        animationStudio: { ...state.animationStudio, ...updates },
      })),
      animationStudioOpen: false,
      setAnimationStudioOpen: (open) => set({ animationStudioOpen: open }),

      // Smart Route Planner
      smartRoute: {
        preferences: {
          mode: 'balanced',
          avoidHighways: false,
          avoidTolls: false,
          avoidFerries: false,
          preferBikeLanes: false,
          maxIncline: 15,
          minScenicScore: 5,
          departureTime: '',
          arrivalTime: '',
        },
        routeOptions: [],
        selectedRouteId: null,
        open: false,
      },
      setSmartRoute: (updates) => set((state) => ({
        smartRoute: { ...state.smartRoute, ...updates },
      })),

      // Map Data Visualizer
      dataVisualizer: {
        visualizations: [],
        activeVizId: null,
        open: false,
        importFormat: 'geojson',
        importedData: null,
      },
      setDataVisualizer: (updates) => set((state) => ({
        dataVisualizer: { ...state.dataVisualizer, ...updates },
      })),

      // Field Survey Tool
      fieldSurvey: {
        forms: [],
        responses: [],
        activeFormId: null,
        open: false,
        collectMode: false,
      },
      setFieldSurvey: (updates) => set((state) => ({
        fieldSurvey: { ...state.fieldSurvey, ...updates },
      })),

      // Emergency Route Planner
      emergencyRoute: {
        zones: [],
        evacuationPoints: [],
        activeRouteId: null,
        open: false,
        showZones: true,
        showEvacuationPoints: true,
      },
      setEmergencyRoute: (updates) => set((state) => ({
        emergencyRoute: { ...state.emergencyRoute, ...updates },
      })),

      // Map Comparison Slider
      comparisonSlider: {
        enabled: false,
        leftStyle: 'streets',
        rightStyle: 'satellite',
        position: 50,
        orientation: 'horizontal',
        lockedZoom: true,
        lockedCenter: true,
        leftTimestamp: null,
        rightTimestamp: null,
      },
      setComparisonSlider: (updates) => set((state) => ({
        comparisonSlider: { ...state.comparisonSlider, ...updates },
      })),

      // Noise Heatmap Overlay
      noiseHeatmap: {
        enabled: false,
        opacity: 0.6,
        showLabels: true,
        dataSource: 'estimated',
        colorScheme: 'traffic',
        threshold: 55,
      },
      setNoiseHeatmap: (updates) => set((state) => ({
        noiseHeatmap: { ...state.noiseHeatmap, ...updates },
      })),

      // Solar Exposure Analyzer
      solarExposure: {
        open: false,
        analyzerPoint: null,
        data: null,
        date: new Date().toISOString().split('T')[0],
        buildingHeight: 10,
        showShadowPath: true,
        showRadiationMap: false,
      },
      setSolarExposure: (updates) => set((state) => ({
        solarExposure: { ...state.solarExposure, ...updates },
      })),

      // Map Style Forge
      styleForge: {
        customLayers: [],
        activeLayerId: null,
        baseStyle: 'streets',
        open: false,
        exportFormat: 'maplibre-style',
      },
      setStyleForge: (updates) => set((state) => ({
        styleForge: { ...state.styleForge, ...updates },
      })),

      // Topographic Profiler
      topoProfiler: {
        profilePoints: [],
        isDrawing: false,
        showGrid: true,
        showLabels: true,
        verticalExaggeration: 3,
        open: false,
        totalDistance: 0,
        totalAscent: 0,
        totalDescent: 0,
        maxElevation: 0,
        minElevation: 0,
      },
      setTopoProfiler: (updates) => set((state) => ({
        topoProfiler: { ...state.topoProfiler, ...updates },
      })),

      // Maritime Navigation
      maritimeNav: {
        waypoints: [],
        routes: [],
        activeRouteId: null,
        showDepthContours: true,
        showNavigationAids: true,
        showShippingLanes: false,
        depthUnit: 'meters',
        open: false,
      },
      setMaritimeNav: (updates) => set((state) => ({
        maritimeNav: { ...state.maritimeNav, ...updates },
      })),

      // Geocaching Toolkit
      geocaching: {
        caches: [],
        activeCacheId: null,
        showCaches: true,
        filterType: [],
        filterDifficulty: [1, 5],
        filterTerrain: [1, 5],
        open: false,
        foundCount: 0,
        totalSearched: 0,
      },
      setGeocaching: (updates) => set((state) => ({
        geocaching: { ...state.geocaching, ...updates },
      })),

      // Atmospheric Dashboard
      atmospheric: {
        data: {
          temperature: null, humidity: null, pressure: null, windSpeed: null,
          windDirection: null, windGust: null, visibility: null, cloudCover: null,
          precipitation: null, dewPoint: null, frostPoint: null, heatIndex: null,
          windChill: null, uvIndex: null, airDensity: null, lastUpdated: null,
        },
        open: false,
        showWindBarb: false,
        showPressureIsobars: false,
        showCloudCover: false,
        showTemperatureGradient: false,
        unitSystem: 'metric',
        historyData: [],
      },
      setAtmospheric: (updates) => set((state) => ({
        atmospheric: { ...state.atmospheric, ...updates },
      })),

      // Wildlife Tracker
      wildlifeTracker: {
        observations: [],
        activeObservationId: null,
        showObservations: true,
        showHeatmap: false,
        showMigrationPaths: false,
        filterSpecies: [],
        open: false,
        totalSpecies: 0,
        totalObservations: 0,
      },
      setWildlifeTracker: (updates) => set((state) => ({
        wildlifeTracker: { ...state.wildlifeTracker, ...updates },
      })),

      // Cultural Heritage Map
      culturalHeritage: {
        sites: [],
        activeSiteId: null,
        showSites: true,
        filterType: [],
        filterEra: [],
        open: false,
        showProtectionZones: false,
      },
      setCulturalHeritage: (updates) => set((state) => ({
        culturalHeritage: { ...state.culturalHeritage, ...updates },
      })),

      // Hydrology Analyzer
      hydrology: {
        points: [],
        watershed: null,
        activePointId: null,
        showFlowPaths: false,
        showWatersheds: false,
        showWaterBodies: true,
        showQualityOverlay: false,
        open: false,
        analysisMode: 'flow',
      },
      setHydrology: (updates) => set((state) => ({
        hydrology: { ...state.hydrology, ...updates },
      })),

      // Glacier Monitor defaults
      glacierMonitor: {
        glaciers: [],
        activeGlacierId: null,
        showGlaciers: true,
        showRetreatOverlay: false,
        showMassBalance: false,
        showVelocityVectors: false,
        filterType: [],
        filterStatus: [],
        open: false,
        timelineYear: new Date().getFullYear(),
        comparisonMode: false,
      },
      setGlacierMonitor: (updates) => set((state) => ({
        glacierMonitor: { ...state.glacierMonitor, ...updates },
      })),

      // Seismic Activity defaults
      seismicActivity: {
        events: [],
        activeEventId: null,
        showEvents: true,
        showShakeMap: false,
        showFaultLines: false,
        showPlateBoundaries: false,
        filterMinMagnitude: 2.5,
        filterTimeRange: 'week',
        filterType: [],
        open: false,
        autoRefresh: false,
        lastFetchTime: null,
      },
      setSeismicActivity: (updates) => set((state) => ({
        seismicActivity: { ...state.seismicActivity, ...updates },
      })),

      // Soil Analysis defaults
      soilAnalysis: {
        samples: [],
        activeSampleId: null,
        showSamples: true,
        showTypeOverlay: false,
        showMoistureOverlay: false,
        showPHOverlay: false,
        showErosionRisk: false,
        showAgricultureSuitability: false,
        open: false,
        analysisMode: 'type',
      },
      setSoilAnalysis: (updates) => set((state) => ({
        soilAnalysis: { ...state.soilAnalysis, ...updates },
      })),

      // Urban Growth defaults
      urbanGrowth: {
        areas: [],
        activeAreaId: null,
        showAreas: true,
        showHistoricalBoundaries: true,
        showPredictions: false,
        showDensityHeatmap: false,
        showLandUse: false,
        timelineYear: new Date().getFullYear(),
        open: false,
        comparisonMode: false,
        animationSpeed: 1,
      },
      setUrbanGrowth: (updates) => set((state) => ({
        urbanGrowth: { ...state.urbanGrowth, ...updates },
      })),

      // Airspace Navigation defaults
      airspaceNav: {
        airspaces: [],
        airports: [],
        activeAirspaceId: null,
        showAirspaces: true,
        showAirports: true,
        showFlightPaths: false,
        showSIDs: false,
        showSTARs: false,
        altitudeFilter: [0, 60000],
        open: false,
        flightPlan: null,
      },
      setAirspaceNav: (updates) => set((state) => ({
        airspaceNav: { ...state.airspaceNav, ...updates },
      })),

      // Reef Health Monitor defaults
      reefHealth: {
        sites: [],
        activeSiteId: null,
        showSites: true,
        showHealthOverlay: false,
        showBleachingAlert: false,
        showTemperature: false,
        showWaterQuality: false,
        filterType: [],
        filterBleaching: [],
        open: false,
        timelineDate: new Date().toISOString().split('T')[0],
      },
      setReefHealth: (updates) => set((state) => ({
        reefHealth: { ...state.reefHealth, ...updates },
      })),

      // Magnetic Field Mapper defaults
      magneticField: {
        stations: [],
        activeStationId: null,
        showStations: true,
        showDeclinationLines: true,
        showInclinationMap: false,
        showFieldIntensity: false,
        showAnomalies: false,
        showGridLines: false,
        open: false,
        fieldComponent: 'declination',
        modelYear: new Date().getFullYear(),
      },
      setMagneticField: (updates) => set((state) => ({
        magneticField: { ...state.magneticField, ...updates },
      })),

      // Flood Risk Analyzer defaults
      floodRisk: {
        zones: [],
        activeZoneId: null,
        showZones: true,
        showRiskOverlay: false,
        showDepthOverlay: false,
        showDrainageMap: false,
        showHistoricalFloods: false,
        showEvacuationRoutes: false,
        open: false,
        scenarioYear: 100,
        animationPlaying: false,
      },
      setFloodRisk: (updates) => set((state) => ({
        floodRisk: { ...state.floodRisk, ...updates },
      })),

      // Volcano Monitor defaults
      volcanoMonitor: {
        volcanoes: [],
        activeVolcanoId: null,
        showVolcanoes: true,
        showAlertZones: false,
        showSeismicOverlay: false,
        showGasPlumes: false,
        showDeformation: false,
        filterType: [],
        filterStatus: [],
        filterAlertLevel: [],
        open: false,
        autoRefresh: false,
        lastFetchTime: null,
      },
      setVolcanoMonitor: (updates) => set((state) => ({
        volcanoMonitor: { ...state.volcanoMonitor, ...updates },
      })),

      // Avalanche Risk defaults
      avalancheRisk: {
        zones: [],
        activeZoneId: null,
        showZones: true,
        showRiskOverlay: false,
        showAspectMap: false,
        showSlopeAngles: false,
        showWindRose: false,
        open: false,
        forecastDate: new Date().toISOString().split('T')[0],
        comparisonMode: false,
      },
      setAvalancheRisk: (updates) => set((state) => ({
        avalancheRisk: { ...state.avalancheRisk, ...updates },
      })),

      // Crop Health defaults
      cropHealth: {
        fields: [],
        activeFieldId: null,
        showFields: true,
        showHealthOverlay: false,
        showNDVI: false,
        showMoistureStress: false,
        showYieldPrediction: false,
        filterCropType: [],
        filterGrowthStage: [],
        open: false,
        timelineDate: new Date().toISOString().split('T')[0],
        comparisonMode: false,
      },
      setCropHealth: (updates) => set((state) => ({
        cropHealth: { ...state.cropHealth, ...updates },
      })),

      // Space Track defaults
      spaceTrack: {
        objects: [],
        activeObjectId: null,
        showObjects: true,
        showOrbits: false,
        showGroundTracks: false,
        showFootprints: false,
        showDebris: false,
        filterType: [],
        filterCountry: [],
        altitudeRange: [160, 36000],
        open: false,
        autoRefresh: false,
        selectedPassTime: null,
      },
      setSpaceTrack: (updates) => set((state) => ({
        spaceTrack: { ...state.spaceTrack, ...updates },
      })),

      // Archaeology Map defaults
      archaeologyMap: {
        sites: [],
        activeSiteId: null,
        showSites: true,
        showPeriodOverlay: false,
        showSignificance: false,
        showExcavationStatus: false,
        showProtectionZones: false,
        filterType: [],
        filterPeriod: [],
        filterSignificance: [],
        open: false,
        timelinePeriod: 'all',
      },
      setArchaeologyMap: (updates) => set((state) => ({
        archaeologyMap: { ...state.archaeologyMap, ...updates },
      })),

      // Pollution Tracker defaults
      pollutionTracker: {
        sources: [],
        activeSourceId: null,
        showSources: true,
        showAQIOverlay: false,
        showPM25: false,
        showDispersion: false,
        showTrends: false,
        filterType: [],
        filterAQILevel: [],
        open: false,
        autoRefresh: false,
        timelineDate: new Date().toISOString().split('T')[0],
      },
      setPollutionTracker: (updates) => set((state) => ({
        pollutionTracker: { ...state.pollutionTracker, ...updates },
      })),

      // Tidal Predictor defaults
      tidalPredictor: {
        stations: [],
        activeStationId: null,
        showStations: true,
        showCurrentHeight: true,
        showTidalFlow: false,
        showMoonPhase: false,
        showCurrentVectors: false,
        open: false,
        predictionDate: new Date().toISOString().split('T')[0],
        predictionHours: 24,
      },
      setTidalPredictor: (updates) => set((state) => ({
        tidalPredictor: { ...state.tidalPredictor, ...updates },
      })),

      // Wind Farm Optimizer defaults
      windFarm: {
        turbines: [],
        activeTurbineId: null,
        showTurbines: true,
        showWindRose: false,
        showWakeEffects: false,
        showPowerOutput: false,
        showOptimization: false,
        open: false,
        windScenario: 'current',
        optimizationTarget: 'power',
      },
      setWindFarm: (updates) => set((state) => ({
        windFarm: { ...state.windFarm, ...updates },
      })),

      // Desertification Monitor defaults
      desertification: {
        zones: [],
        activeZoneId: null,
        showDesertExpansion: true,
        showVegetationLoss: false,
        showSandDunes: false,
        showDroughtIndex: false,
        open: false,
        timelineYear: 2024,
        severityFilter: 'all',
      },
      setDesertification: (updates) => set((state) => ({
        desertification: { ...state.desertification, ...updates },
      })),

      // Mineral Exploration defaults
      mineralExploration: {
        deposits: [],
        activeDepositId: null,
        showDeposits: true,
        showGeologicalMap: false,
        showMiningClaims: false,
        showGeochemistry: false,
        open: false,
        mineralFilter: 'all',
        surveyMode: 'surface',
      },
      setMineralExploration: (updates) => set((state) => ({
        mineralExploration: { ...state.mineralExploration, ...updates },
      })),

      // Ocean Current Mapper defaults
      oceanCurrent: {
        currents: [],
        activeCurrentId: null,
        showCurrents: true,
        showSST: false,
        showThermohaline: false,
        showSalinity: false,
        open: false,
        depthLayer: 'surface',
        season: 'summer',
      },
      setOceanCurrent: (updates) => set((state) => ({
        oceanCurrent: { ...state.oceanCurrent, ...updates },
      })),

      // Permafrost Thaw Tracker defaults
      permafrost: {
        zones: [],
        activeZoneId: null,
        showPermafrostExtent: true,
        showActiveLayer: false,
        showThawRate: false,
        showGroundIce: false,
        open: false,
        yearFilter: 2024,
        temperatureScenario: 'rcp45',
      },
      setPermafrost: (updates) => set((state) => ({
        permafrost: { ...state.permafrost, ...updates },
      })),

      // Lightning Strike Map defaults
      lightning: {
        strikes: [],
        showStrikes: true,
        showDensityMap: false,
        showStormTracks: false,
        showAlertZones: false,
        open: false,
        timeRange: '24h',
        intensityFilter: 'all',
      },
      setLightning: (updates) => set((state) => ({
        lightning: { ...state.lightning, ...updates },
      })),

      // Biome Classifier defaults
      biome: {
        biomes: [],
        activeBiomeId: null,
        showBiomes: true,
        showBiodiversity: false,
        showTransitions: false,
        showEndangered: false,
        open: false,
        classification: 'olson',
        focusRealm: 'all',
      },
      setBiome: (updates) => set((state) => ({
        biome: { ...state.biome, ...updates },
      })),

      // Groundwater Explorer defaults
      groundwater: {
        aquifers: [],
        activeAquiferId: null,
        showAquifers: true,
        showWells: false,
        showRechargeZones: false,
        showFlowDirection: false,
        open: false,
        depthFilter: 'all',
        qualityFilter: 'all',
      },
      setGroundwater: (updates) => set((state) => ({
        groundwater: { ...state.groundwater, ...updates },
      })),

      // Solar Power Planner defaults
      solarPower: {
        sites: [],
        activeSiteId: null,
        showIrradiance: true,
        showOptimalZones: false,
        showExistingPlants: false,
        showGridConnection: false,
        open: false,
        panelType: 'monocrystalline',
        calculationMode: 'annual',
      },
      setSolarPower: (updates) => set((state) => ({
        solarPower: { ...state.solarPower, ...updates },
      })),

      // Volcanic Ash Tracker defaults
      volcanicAsh: {
        eruptions: [],
        activeEruptionId: null,
        showAshClouds: true,
        showNoFlyZones: false,
        showDispersionModel: false,
        showHealthAdvisory: false,
        open: false,
        alertLevel: 'normal',
        dispersionModel: 'vaac',
      },
      setVolcanicAsh: (updates) => set((state) => ({
        volcanicAsh: { ...state.volcanicAsh, ...updates },
      })),

      // Coastal Erosion Monitor defaults
      coastalErosion: {
        segments: [],
        activeSegmentId: null,
        showErosionZones: true,
        showShorelineChange: false,
        showSeaLevelRise: false,
        showProtection: false,
        open: false,
        timeHorizon: 'current',
        scenario: 'rcp45',
      },
      setCoastalErosion: (updates) => set((state) => ({
        coastalErosion: { ...state.coastalErosion, ...updates },
      })),

      // Carbon Footprint Mapper defaults
      carbonFootprint: {
        sources: [],
        activeSourceId: null,
        showEmissions: true,
        showHeatmap: false,
        showOffsetProjects: false,
        showTrends: false,
        open: false,
        gasType: 'all',
        sector: 'all',
      },
      setCarbonFootprint: (updates) => set((state) => ({
        carbonFootprint: { ...state.carbonFootprint, ...updates },
      })),

      // Wildlife Migration Tracker defaults
      wildlifeMigration: {
        routes: [],
        activeRouteId: null,
        showRoutes: true,
        showCorridors: false,
        showStopPoints: false,
        showBarriers: false,
        open: false,
        season: 'spring',
        species: 'all',
      },
      setWildlifeMigration: (updates) => set((state) => ({
        wildlifeMigration: { ...state.wildlifeMigration, ...updates },
      })),

      // Ice Sheet Monitor defaults
      iceSheet: {
        sheets: [],
        activeSheetId: null,
        showIceExtent: true,
        showFlowVelocity: false,
        showMeltRate: false,
        showCalvingEvents: false,
        open: false,
        yearFilter: 2024,
        scenario: 'historical',
      },
      setIceSheet: (updates) => set((state) => ({
        iceSheet: { ...state.iceSheet, ...updates },
      })),

      // Drought Monitor defaults
      droughtMonitor: {
        regions: [],
        activeRegionId: null,
        showDroughtZones: true,
        showSoilMoisture: false,
        showPrecipitationDeficit: false,
        showCropImpact: false,
        open: false,
        index: 'pdsi',
        timeScale: '6m',
      },
      setDroughtMonitor: (updates) => set((state) => ({
        droughtMonitor: { ...state.droughtMonitor, ...updates },
      })),

      // Land Subsidence Tracker defaults
      landSubsidence: {
        zones: [],
        activeZoneId: null,
        showSubsidence: true,
        showGroundwaterDecline: false,
        showInfrastructure: false,
        showMonitoring: false,
        open: false,
        causeFilter: 'all',
        rateFilter: 'all',
      },
      setLandSubsidence: (updates) => set((state) => ({
        landSubsidence: { ...state.landSubsidence, ...updates },
      })),

      // Coral Bleaching Alert defaults
      coralBleaching: {
        sites: [],
        activeSiteId: null,
        showBleachingAlert: true,
        showSSTAnomaly: false,
        showReefExtent: false,
        showRecovery: false,
        open: false,
        alertLevel: 'all',
        region: 'all',
      },
      setCoralBleaching: (updates) => set((state) => ({
        coralBleaching: { ...state.coralBleaching, ...updates },
      })),

      // Tsunami Alert System defaults
      tsunamiAlert: {
        alerts: [],
        activeAlertId: null,
        showWavePropagation: true,
        showEvacuationZones: false,
        showBuoyData: false,
        showHistoricalEvents: false,
        open: false,
        alertLevel: 'all',
        basin: 'all',
      },
      setTsunamiAlert: (updates) => set((state) => ({
        tsunamiAlert: { ...state.tsunamiAlert, ...updates },
      })),

      // Soil Erosion Monitor defaults
      soilErosion: {
        zones: [],
        activeZoneId: null,
        showErosionRisk: true,
        showSedimentYield: false,
        showConservation: false,
        showRainfallIntensity: false,
        open: false,
        erosionType: 'all',
        severityFilter: 'all',
      },
      setSoilErosion: (updates) => set((state) => ({
        soilErosion: { ...state.soilErosion, ...updates },
      })),

      // Watershed Manager defaults
      watershedManager: {
        watersheds: [],
        activeWatershedId: null,
        showBoundaries: true,
        showFlowAccumulation: false,
        showDrainageNetwork: false,
        showWaterQuality: false,
        open: false,
        sizeFilter: 'all',
        qualityFilter: 'all',
      },
      setWatershedManager: (updates) => set((state) => ({
        watershedManager: { ...state.watershedManager, ...updates },
      })),

      // Tectonic Plate Viewer defaults
      tectonicPlate: {
        plates: [],
        activePlateId: null,
        showPlateBoundaries: true,
        showFaultLines: false,
        showEpicenters: false,
        showMovementVectors: false,
        open: false,
        boundaryType: 'all',
        timeRange: 'recent',
      },
      setTectonicPlate: (updates) => set((state) => ({
        tectonicPlate: { ...state.tectonicPlate, ...updates },
      })),

      // Air Quality Forecaster defaults
      airQualityForecaster: {
        stations: [],
        activeStationId: null,
        showAQI: true,
        showPM25: false,
        showPM10: false,
        showOzone: false,
        open: false,
        pollutant: 'aqi',
        forecast: 'current',
      },
      setAirQualityForecaster: (updates) => set((state) => ({
        airQualityForecaster: { ...state.airQualityForecaster, ...updates },
      })),

      // Glacial Lake Monitor defaults
      glacialLake: {
        lakes: [],
        activeLakeId: null,
        showLakeExtent: true,
        showGLOFRisk: false,
        showDamType: false,
        showMonitoring: false,
        open: false,
        riskLevel: 'all',
        region: 'all',
      },
      setGlacialLake: (updates) => set((state) => ({
        glacialLake: { ...state.glacialLake, ...updates },
      })),

      // Space Weather Monitor defaults
      spaceWeather: {
        events: [],
        activeEventId: null,
        showSolarWind: true,
        showMagneticField: false,
        showAuroraForecast: false,
        showRadiationBelt: false,
        open: false,
        eventType: 'all',
        alertLevel: 'all',
      },
      setSpaceWeather: (updates) => set((state) => ({
        spaceWeather: { ...state.spaceWeather, ...updates },
      })),

      // Peatland Monitor defaults
      peatlandMonitor: {
        peatlands: [],
        activePeatlandId: null,
        showPeatExtent: true,
        showCarbonStock: false,
        showDegradation: false,
        showRestoration: false,
        open: false,
        statusFilter: 'all',
        depthFilter: 'all',
      },
      setPeatlandMonitor: (updates) => set((state) => ({
        peatlandMonitor: { ...state.peatlandMonitor, ...updates },
      })),

      mangroveMonitor: {
        mangroves: [],
        activeMangroveId: null,
        showExtent: true,
        showCarbon: false,
        showRestoration: false,
        showSpecies: false,
        open: false,
        healthFilter: 'all',
      },
      setMangroveMonitor: (updates) => set((state) => ({
        mangroveMonitor: { ...state.mangroveMonitor, ...updates },
      })),

      sandstormTracker: {
        storms: [],
        activeStormId: null,
        showPlumes: true,
        showPM: false,
        showVisibility: false,
        showWind: false,
        open: false,
        intensityFilter: 'all',
      },
      setSandstormTracker: (updates) => set((state) => ({
        sandstormTracker: { ...state.sandstormTracker, ...updates },
      })),

      wetlandMapper: {
        wetlands: [],
        activeWetlandId: null,
        showBoundaries: true,
        showWaterLevel: false,
        showBiodiversity: false,
        showProtection: false,
        open: false,
        typeFilter: 'all',
      },
      setWetlandMapper: (updates) => set((state) => ({
        wetlandMapper: { ...state.wetlandMapper, ...updates },
      })),

      urbanHeatIsland: {
        heatZones: [],
        activeHeatZoneId: null,
        showTemperature: true,
        showVegetation: false,
        showCoolZones: false,
        showPopulation: false,
        open: false,
        tempUnit: 'celsius',
      },
      setUrbanHeatIsland: (updates) => set((state) => ({
        urbanHeatIsland: { ...state.urbanHeatIsland, ...updates },
      })),

      wildfireRisk: {
        fireZones: [],
        activeFireZoneId: null,
        showDangerRating: true,
        showFuelMoisture: false,
        showWind: false,
        showHistory: false,
        open: false,
        dangerFilter: 'all',
      },
      setWildfireRisk: (updates) => set((state) => ({
        wildfireRisk: { ...state.wildfireRisk, ...updates },
      })),

      algalBloom: {
        blooms: [],
        activeBloomId: null,
        showBloomExtent: true,
        showChlorophyll: false,
        showToxicity: false,
        showTemperature: false,
        open: false,
        intensityFilter: 'all',
      },
      setAlgalBloom: (updates) => set((state) => ({
        algalBloom: { ...state.algalBloom, ...updates },
      })),

      landslidePredictor: {
        landslideZones: [],
        activeLandslideId: null,
        showSusceptibility: true,
        showSlope: false,
        showRainfall: false,
        showActivity: false,
        open: false,
        susceptibilityFilter: 'all',
      },
      setLandslidePredictor: (updates) => set((state) => ({
        landslidePredictor: { ...state.landslidePredictor, ...updates },
      })),

      seaIceNavigator: {
        iceZones: [],
        activeIceZoneId: null,
        showConcentration: true,
        showThickness: false,
        showDrift: false,
        showRoutes: false,
        open: false,
        iceTypeFilter: 'all',
      },
      setSeaIceNavigator: (updates) => set((state) => ({
        seaIceNavigator: { ...state.seaIceNavigator, ...updates },
      })),

      cloudCover: {
        cloudLayers: [],
        activeCloudId: null,
        showCoverage: true,
        showAltitude: false,
        showPrecipitation: false,
        showTemperature: false,
        open: false,
        cloudTypeFilter: 'all',
      },
      setCloudCover: (updates) => set((state) => ({
        cloudCover: { ...state.cloudCover, ...updates },
      })),

      soilMoisture: {
        soilZones: [],
        activeSoilZoneId: null,
        showMoisture: true,
        showDepth: false,
        showIrrigation: false,
        showSoilType: false,
        open: false,
        moistureFilter: 'all',
      },
      setSoilMoisture: (updates) => set((state) => ({
        soilMoisture: { ...state.soilMoisture, ...updates },
      })),

      lightPollution: {
        lightZones: [],
        activeLightZoneId: null,
        showBrightness: true,
        showBortle: false,
        showStars: false,
        showMilkyWay: false,
        open: false,
        bortleFilter: 'all',
      },
      setLightPollution: (updates) => set((state) => ({
        lightPollution: { ...state.lightPollution, ...updates },
      })),

      riverFlow: {
        stations: [],
        activeStationId: null,
        showFlowRate: true,
        showWaterLevel: false,
        showFloodStatus: false,
        showQuality: false,
        open: false,
        floodFilter: 'all',
      },
      setRiverFlow: (updates) => set((state) => ({
        riverFlow: { ...state.riverFlow, ...updates },
      })),

      volcanoSeismic: {
        seismicStations: [],
        activeStationId: null,
        showAlertLevel: true,
        showSeismic: false,
        showDeformation: false,
        showGas: false,
        open: false,
        alertFilter: 'all',
      },
      setVolcanoSeismic: (updates) => set((state) => ({
        volcanoSeismic: { ...state.volcanoSeismic, ...updates },
      })),

      whaleMigration: {
        whalePods: [],
        activePodId: null,
        showTracks: true,
        showDepth: false,
        showVocalization: false,
        showSpeed: false,
        open: false,
        speciesFilter: 'all',
      },
      setWhaleMigration: (updates) => set((state) => ({
        whaleMigration: { ...state.whaleMigration, ...updates },
      })),

      avalancheForecaster: {
        avalancheZones: [],
        activeZoneId: null,
        showDanger: true,
        showStability: false,
        showSnowfall: false,
        showAspect: false,
        open: false,
        dangerFilter: 'all',
      },
      setAvalancheForecaster: (updates) => set((state) => ({
        avalancheForecaster: { ...state.avalancheForecaster, ...updates },
      })),

      auroraForecaster: {
        auroraSites: [],
        activeSiteId: null,
        showKpIndex: true,
        showCloudCover: false,
        showIntensity: false,
        showViewingTime: false,
        open: false,
        visibilityFilter: 'all',
      },
      setAuroraForecaster: (updates) => set((state) => ({
        auroraForecaster: { ...state.auroraForecaster, ...updates },
      })),

      ozoneLayer: {
        ozoneZones: [],
        activeOzoneId: null,
        showDobson: true,
        showTrend: false,
        showUV: false,
        showSeason: false,
        open: false,
        trendFilter: 'all',
      },
      setOzoneLayer: (updates) => set((state) => ({
        ozoneLayer: { ...state.ozoneLayer, ...updates },
      })),

      deforestation: {
        deforestationZones: [],
        activeZoneId: null,
        showLoss: true,
        showRemaining: false,
        showRate: false,
        showDrivers: false,
        open: false,
        driverFilter: 'all',
      },
      setDeforestation: (updates) => set((state) => ({
        deforestation: { ...state.deforestation, ...updates },
      })),

      methaneEmissions: {
        methaneSources: [],
        activeSourceId: null,
        showEmissionRate: true,
        showConcentration: false,
        showTrend: false,
        showVerified: false,
        open: false,
        sourceTypeFilter: 'all',
      },
      setMethaneEmissions: (updates) => set((state) => ({
        methaneEmissions: { ...state.methaneEmissions, ...updates },
      })),

      oceanAcidification: {
        acidSites: [],
        activeSiteId: null,
        showPH: true,
        showCO2: false,
        showAragonite: false,
        showImpact: false,
        open: false,
        impactFilter: 'all',
      },
      setOceanAcidification: (updates) => set((state) => ({
        oceanAcidification: { ...state.oceanAcidification, ...updates },
      })),

      spaceDebris: {
        debrisObjects: [],
        activeDebrisId: null,
        showAltitude: true,
        showVelocity: false,
        showDecay: false,
        showType: false,
        open: false,
        typeFilter: 'all',
      },
      setSpaceDebris: (updates) => set((state) => ({
        spaceDebris: { ...state.spaceDebris, ...updates },
      })),

      tectonicStrain: {
        strainStations: [],
        activeStationId: null,
        showStrain: true,
        showStress: false,
        showFaults: false,
        showRisk: false,
        open: false,
        riskFilter: 'all',
      },
      setTectonicStrain: (updates) => set((state) => ({
        tectonicStrain: { ...state.tectonicStrain, ...updates },
      })),

      phytoBloom: {
        bloomSites: [],
        activeBloomId: null,
        showChlorophyll: true,
        showArea: false,
        showToxicity: false,
        showNutrients: false,
        open: false,
        toxicityFilter: 'all',
      },
      setPhytoBloom: (updates) => set((state) => ({
        phytoBloom: { ...state.phytoBloom, ...updates },
      })),

      snowCover: {
        snowZones: [],
        activeSnowZoneId: null,
        showDepth: true,
        showWaterEquiv: false,
        showCoverage: false,
        showMeltRate: false,
        open: false,
        depthFilter: 'all',
      },
      setSnowCover: (updates) => set((state) => ({
        snowCover: { ...state.snowCover, ...updates },
      })),

      geomagneticStorm: {
        storms: [],
        activeStormId: null,
        showKpIndex: true,
        showGScale: false,
        showGridImpact: false,
        showAurora: false,
        open: false,
        gScaleFilter: 'all',
      },
      setGeomagneticStorm: (updates) => set((state) => ({
        geomagneticStorm: { ...state.geomagneticStorm, ...updates },
      })),

      volcanicGas: {
        gasSites: [],
        activeSiteId: null,
        showSO2: true,
        showCO2: false,
        showHazard: false,
        showPopulation: false,
        open: false,
        hazardFilter: 'all',
      },
      setVolcanicGas: (updates) => set((state) => ({
        volcanicGas: { ...state.volcanicGas, ...updates },
      })),

      aquiferDepletion: {
        aquiferSites: [],
        activeAquiferId: null,
        showWaterLevel: true,
        showDepletion: false,
        showRecharge: false,
        showStatus: false,
        open: false,
        statusFilter: 'all',
      },
      setAquiferDepletion: (updates) => set((state) => ({
        aquiferDepletion: { ...state.aquiferDepletion, ...updates },
      })),

      stratosphericWind: {
        windZones: [],
        activeZoneId: null,
        showWindSpeed: true,
        showQBO: false,
        showPolarVortex: false,
        showTemperature: false,
        open: false,
        vortexFilter: 'all',
      },
      setStratosphericWind: (updates) => set((state) => ({
        stratosphericWind: { ...state.stratosphericWind, ...updates },
      })),

      marineHeatwave: {
        heatwaveZones: [],
        activeZoneId: null,
        showSSTAnomaly: true,
        showIntensity: false,
        showEcosystem: false,
        showBleaching: false,
        open: false,
        intensityFilter: 'all',
      },
      setMarineHeatwave: (updates) => set((state) => ({
        marineHeatwave: { ...state.marineHeatwave, ...updates },
      })),

      precipitation: {
        precipZones: [],
        activeZoneId: null,
        showAnnual: true,
        showExtremes: false,
        showDrought: false,
        showFloodRisk: false,
        open: false,
        floodFilter: 'all',
      },
      setPrecipitation: (updates) => set((state) => ({
        precipitation: { ...state.precipitation, ...updates },
      })),

      cosmicRay: {
        stations: [],
        activeStationId: null,
        showNeutronCount: true,
        showFluxVariation: false,
        showSolarModulation: false,
        showStatus: false,
        open: false,
        statusFilter: 'all',
      },
      setCosmicRay: (updates) => set((state) => ({
        cosmicRay: { ...state.cosmicRay, ...updates },
      })),

      greenlandIce: {
        iceZones: [],
        activeZoneId: null,
        showThickness: true,
        showMassBalance: false,
        showMeltRate: false,
        showVelocity: false,
        open: false,
        zoneFilter: 'all',
      },
      setGreenlandIce: (updates) => set((state) => ({
        greenlandIce: { ...state.greenlandIce, ...updates },
      })),

      radiationExposure: {
        stations: [],
        activeStationId: null,
        showDoseRate: true,
        showGamma: false,
        showBeta: false,
        showAlert: false,
        open: false,
        alertFilter: 'all',
      },
      setRadiationExposure: (updates) => set((state) => ({
        radiationExposure: { ...state.radiationExposure, ...updates },
      })),

      peatFire: {
        peatFires: [],
        activeFireId: null,
        showStatus: true,
        showArea: false,
        showCarbon: false,
        showContainment: false,
        open: false,
        statusFilter: 'all',
      },
      setPeatFire: (updates) => set((state) => ({
        peatFire: { ...state.peatFire, ...updates },
      })),

      seaLevelRise: {
        stations: [],
        activeStationId: null,
        showCurrent: true,
        showProjection: false,
        showImpact: false,
        showPopulation: false,
        open: false,
        impactFilter: 'all',
      },
      setSeaLevelRise: (updates) => set((state) => ({
        seaLevelRise: { ...state.seaLevelRise, ...updates },
      })),

      thermocline: {
        profiles: [],
        activeProfileId: null,
        showDepth: true,
        showGradient: false,
        showSST: false,
        showENSO: false,
        open: false,
        ensoFilter: 'all',
      },
      setThermocline: (updates) => set((state) => ({
        thermocline: { ...state.thermocline, ...updates },
      })),

      acidRain: {
        stations: [],
        activeStationId: null,
        showPH: true,
        showSulfate: false,
        showSeverity: false,
        showTrend: false,
        open: false,
        severityFilter: 'all',
      },
      setAcidRain: (updates) => set((state) => ({
        acidRain: { ...state.acidRain, ...updates },
      })),

      methaneHydrate: {
        hydrateZones: [],
        activeZoneId: null,
        showStability: true,
        showDepth: false,
        showTemperature: false,
        showConcentration: false,
        open: false,
        stabilityFilter: 'all',
      },
      setMethaneHydrate: (updates) => set((state) => ({
        methaneHydrate: { ...state.methaneHydrate, ...updates },
      })),

      kelpForest: {
        kelpSites: [],
        activeSiteId: null,
        showCoverage: true,
        showHealth: false,
        showSpecies: false,
        showRestoration: false,
        open: false,
        statusFilter: 'all',
      },
      setKelpForest: (updates) => set((state) => ({
        kelpForest: { ...state.kelpForest, ...updates },
      })),

      glof: {
        glofSites: [],
        activeSiteId: null,
        showVolume: true,
        showStability: false,
        showRisk: false,
        showPopulation: false,
        open: false,
        riskFilter: 'all',
      },
      setGLOF: (updates) => set((state) => ({
        glof: { ...state.glof, ...updates },
      })),

      dustStorm: {
        storms: [],
        activeStormId: null,
        showSeverity: true,
        showWindSpeed: false,
        showVisibility: false,
        showConcentration: false,
        open: false,
        severityFilter: 'all',
      },
      setDustStorm: (updates) => set((state) => ({
        dustStorm: { ...state.dustStorm, ...updates },
      })),

      bioluminescence: {
        sites: [],
        activeSiteId: null,
        showIntensity: true,
        showOrganismType: false,
        showWaterTemp: false,
        showSeasonalPeak: false,
        open: false,
        intensityFilter: 'all',
      },
      setBioluminescence: (updates) => set((state) => ({
        bioluminescence: { ...state.bioluminescence, ...updates },
      })),

      urbanSprawl: {
        zones: [],
        activeZoneId: null,
        showGrowthRate: true,
        showDensity: false,
        showGreenSpace: false,
        showInfraStrain: false,
        open: false,
        strainFilter: 'all',
      },
      setUrbanSprawl: (updates) => set((state) => ({
        urbanSprawl: { ...state.urbanSprawl, ...updates },
      })),

      viralOutbreak: {
        outbreaks: [],
        activeOutbreakId: null,
        showCaseCount: true,
        showR0: false,
        showVaccination: false,
        showMortality: false,
        open: false,
        severityFilter: 'all',
      },
      setViralOutbreak: (updates) => set((state) => ({
        viralOutbreak: { ...state.viralOutbreak, ...updates },
      })),

      magnetosphere: {
        readings: [],
        activeReadingId: null,
        showBz: true,
        showSolarWind: false,
        showKp: false,
        showAurora: false,
        open: false,
        statusFilter: 'all',
      },
      setMagnetosphere: (updates) => set((state) => ({
        magnetosphere: { ...state.magnetosphere, ...updates },
      })),

      fogDensity: {
        zones: [],
        activeZoneId: null,
        showDensity: true,
        showVisibility: false,
        showHumidity: false,
        showAviationImpact: false,
        open: false,
        densityFilter: 'all',
      },
      setFogDensity: (updates) => set((state) => ({
        fogDensity: { ...state.fogDensity, ...updates },
      })),

      carbonCapture: {
        facilities: [],
        activeFacilityId: null,
        showCapacity: true,
        showTechnology: false,
        showStatus: false,
        showStorage: false,
        open: false,
        statusFilter: 'all',
      },
      setCarbonCapture: (updates) => set((state) => ({
        carbonCapture: { ...state.carbonCapture, ...updates },
      })),

      hailStorm: {
        events: [],
        activeEventId: null,
        showHailSize: true,
        showWindSpeed: false,
        showDamage: false,
        showArea: false,
        open: false,
        damageFilter: 'all',
      },
      setHailStorm: (updates) => set((state) => ({
        hailStorm: { ...state.hailStorm, ...updates },
      })),

      saharaReforestation: {
        projects: [],
        activeProjectId: null,
        showArea: true,
        showTreeCount: false,
        showSurvivalRate: false,
        showStatus: false,
        open: false,
        statusFilter: 'all',
      },
      setSaharaReforestation: (updates) => set((state) => ({
        saharaReforestation: { ...state.saharaReforestation, ...updates },
      })),

      deepSeaVent: {
        vents: [],
        activeVentId: null,
        showTemperature: true,
        showDepth: false,
        showVentType: false,
        showBiology: false,
        open: false,
        biologyFilter: 'all',
      },
      setDeepSeaVent: (updates) => set((state) => ({
        deepSeaVent: { ...state.deepSeaVent, ...updates },
      })),

      stormSurge: {
        zones: [],
        activeZoneId: null,
        showSurgeHeight: true,
        showWindSpeed: false,
        showPopulation: false,
        showEvacuation: false,
        open: false,
        evacuationFilter: 'all',
      },
      setStormSurge: (updates) => set((state) => ({
        stormSurge: { ...state.stormSurge, ...updates },
      })),

      landfillMonitor: {
        sites: [],
        activeSiteId: null,
        showFill: true,
        showMethane: false,
        showLeachate: false,
        showRecycling: false,
        open: false,
        leachateFilter: 'all',
      },
      setLandfillMonitor: (updates) => set((state) => ({
        landfillMonitor: { ...state.landfillMonitor, ...updates },
      })),

      salinityGradient: {
        zones: [],
        activeZoneId: null,
        showSalinity: true,
        showDepth: false,
        showGradientType: false,
        showOxygen: false,
        open: false,
        impactFilter: 'all',
      },
      setSalinityGradient: (updates) => set((state) => ({
        salinityGradient: { ...state.salinityGradient, ...updates },
      })),

      microplastics: {
        samples: [],
        activeSampleId: null,
        showConcentration: true,
        showPolymerType: false,
        showSource: false,
        showSeverity: false,
        open: false,
        severityFilter: 'all',
      },
      setMicroplastics: (updates) => set((state) => ({
        microplastics: { ...state.microplastics, ...updates },
      })),

      radioSignal: {
        stations: [],
        activeStationId: null,
        showStrength: true,
        showFrequency: false,
        showCoverage: false,
        showInterference: false,
        open: false,
        interferenceFilter: 'all',
      },
      setRadioSignal: (updates) => set((state) => ({
        radioSignal: { ...state.radioSignal, ...updates },
      })),

      volcanicIsland: {
        islands: [],
        activeIslandId: null,
        showActivity: true,
        showEruptionType: false,
        showElevation: false,
        showPopulation: false,
        open: false,
        activityFilter: 'all',
      },
      setVolcanicIsland: (updates) => set((state) => ({
        volcanicIsland: { ...state.volcanicIsland, ...updates },
      })),

      permafrostThaw: {
        zones: [],
        activeZoneId: null,
        showThawRate: true,
        showActiveLayer: false,
        showGroundTemp: false,
        showInfrastructure: false,
        open: false,
        infrastructureFilter: 'all',
      },
      setPermafrostThaw: (updates) => set((state) => ({
        permafrostThaw: { ...state.permafrostThaw, ...updates },
      })),

      oceanCurrentTracker: {
        currents: [],
        activeCurrentId: null,
        showSpeed: true,
        showTemperature: false,
        showSalinity: false,
        showImpact: false,
        open: false,
        impactFilter: 'all',
      },
      setOceanCurrentTracker: (updates) => set((state) => ({
        oceanCurrentTracker: { ...state.oceanCurrentTracker, ...updates },
      })),

      spaceWeatherAlert: {
        alerts: [],
        activeAlertId: null,
        showSeverity: true,
        showKpIndex: false,
        showHfImpact: false,
        showGnssImpact: false,
        open: false,
        severityFilter: 'all',
      },
      setSpaceWeatherAlert: (updates) => set((state) => ({
        spaceWeatherAlert: { ...state.spaceWeatherAlert, ...updates },
      })),

      desertMonitor: {
        zones: [],
        activeZoneId: null,
        showExpansion: true,
        showTemperature: false,
        showRainfall: false,
        showVegetation: false,
        open: false,
        statusFilter: 'all',
      },
      setDesertMonitor: (updates) => set((state) => ({
        desertMonitor: { ...state.desertMonitor, ...updates },
      })),

      tsunamiBuoy: {
        buoys: [],
        activeBuoyId: null,
        showWaterHeight: true,
        showPressure: false,
        showWavePeriod: false,
        showStatus: false,
        open: false,
        statusFilter: 'all',
      },
      setTsunamiBuoy: (updates) => set((state) => ({
        tsunamiBuoy: { ...state.tsunamiBuoy, ...updates },
      })),

      glacierVelocity: {
        zones: [],
        activeZoneId: null,
        showVelocity: true,
        showThickness: false,
        showMassBalance: false,
        showCalving: false,
        open: false,
        statusFilter: 'all',
      },
      setGlacierVelocity: (updates) => set((state) => ({
        glacierVelocity: { ...state.glacierVelocity, ...updates },
      })),

      earthquakeSwarm: {
        events: [],
        activeEventId: null,
        showMagnitude: true,
        showDepth: false,
        showFrequency: false,
        showAlertLevel: false,
        open: false,
        alertFilter: 'all',
      },
      setEarthquakeSwarm: (updates) => set((state) => ({
        earthquakeSwarm: { ...state.earthquakeSwarm, ...updates },
      })),

      mangroveRestoration: {
        sites: [],
        activeSiteId: null,
        showArea: true,
        showCarbon: false,
        showCoastalProtection: false,
        showFishery: false,
        open: false,
        stageFilter: 'all',
      },
      setMangroveRestoration: (updates) => set((state) => ({
        mangroveRestoration: { ...state.mangroveRestoration, ...updates },
      })),

      coralBleachingMonitor: {
        events: [],
        activeEventId: null,
        showBleachingPercent: true,
        showHeatStress: false,
        showSeaTemp: false,
        showRecoveryPotential: false,
        open: false,
        reefFilter: 'all',
      },
      setCoralBleachingMonitor: (updates) => set((state) => ({
        coralBleachingMonitor: { ...state.coralBleachingMonitor, ...updates },
      })),

      arcticSeaIce: {
        zones: [],
        activeZoneId: null,
        showExtent: true,
        showThickness: false,
        showConcentration: false,
        showTrend: false,
        open: false,
        iceFilter: 'all',
      },
      setArcticSeaIce: (updates) => set((state) => ({
        arcticSeaIce: { ...state.arcticSeaIce, ...updates },
      })),

      landslideRisk: {
        zones: [],
        activeZoneId: null,
        showRiskLevel: true,
        showSlope: false,
        showMoisture: false,
        showVegetation: false,
        open: false,
        riskFilter: 'all',
      },
      setLandslideRisk: (updates) => set((state) => ({
        landslideRisk: { ...state.landslideRisk, ...updates },
      })),

      airQuality: {
        stations: [],
        activeStationId: null,
        showAQI: true,
        showPM25: false,
        showO3: false,
        showDominantPollutant: false,
        open: false,
        categoryFilter: 'all',
      },
      setAirQuality: (updates) => set((state) => ({
        airQuality: { ...state.airQuality, ...updates },
      })),

      soilMoistureAg: {
        zones: [],
        activeZoneId: null,
        showMoisture: true,
        showTemperature: false,
        showDroughtIndex: false,
        showSoilType: false,
        open: false,
        landUseFilter: 'all',
      },
      setSoilMoistureAg: (updates) => set((state) => ({
        soilMoistureAg: { ...state.soilMoistureAg, ...updates },
      })),

      noisePollution: {
        zones: [],
        activeZoneId: null,
        showDecibels: true,
        showNoiseType: false,
        showAffectedPopulation: false,
        showCompliance: false,
        open: false,
        typeFilter: 'all',
      },
      setNoisePollution: (updates) => set((state) => ({
        noisePollution: { ...state.noisePollution, ...updates },
      })),

      lightPollutionSky: {
        zones: [],
        activeZoneId: null,
        showBortleScale: true,
        showSkyBrightness: false,
        showVisibleStars: false,
        showEnergyWaste: false,
        open: false,
        sourceFilter: 'all',
      },
      setLightPollutionSky: (updates) => set((state) => ({
        lightPollutionSky: { ...state.lightPollutionSky, ...updates },
      })),

      groundwaterRecharge: {
        zones: [],
        activeZoneId: null,
        showRechargeRate: true,
        showWaterTable: false,
        showSustainability: false,
        showQuality: false,
        open: false,
        aquiferFilter: 'all',
      },
      setGroundwaterRecharge: (updates) => set((state) => ({
        groundwaterRecharge: { ...state.groundwaterRecharge, ...updates },
      })),

      subglacialLake: {
        lakes: [],
        activeLakeId: null,
        showDepth: true,
        showWaterTemp: true,
        showIceThickness: true,
        showDissolvedOxygen: false,
        open: false,
        statusFilter: 'all',
      },
      setSubglacialLake: (updates) => set((state) => ({
        subglacialLake: { ...state.subglacialLake, ...updates },
      })),

      thermokarstLake: {
        lakes: [],
        activeLakeId: null,
        showExpansionRate: true,
        showMethaneEmission: true,
        showShorelineErosion: false,
        showArea: false,
        open: false,
        riskFilter: 'all',
      },
      setThermokarstLake: (updates) => set((state) => ({
        thermokarstLake: { ...state.thermokarstLake, ...updates },
      })),

      paleoclimateProxy: {
        proxies: [],
        activeProxyId: null,
        showAgeRange: true,
        showResolution: true,
        showTempReconstruction: true,
        open: false,
        typeFilter: 'all',
      },
      setPaleoclimateProxy: (updates) => set((state) => ({
        paleoclimateProxy: { ...state.paleoclimateProxy, ...updates },
      })),

      gicMonitor: {
        readings: [],
        activeReadingId: null,
        showIntensity: true,
        showVoltage: true,
        showRiskLevel: true,
        open: false,
        riskFilter: 'all',
      },
      setGicMonitor: (updates) => set((state) => ({
        gicMonitor: { ...state.gicMonitor, ...updates },
      })),

      sabkhaEnvironment: {
        zones: [],
        activeZoneId: null,
        showSalinity: true,
        showEvaporationRate: true,
        showCrustThickness: false,
        showMineralType: false,
        open: false,
        mineralFilter: 'all',
      },
      setSabkhaEnvironment: (updates) => set((state) => ({
        sabkhaEnvironment: { ...state.sabkhaEnvironment, ...updates },
      })),

      cryosphereChange: {
        regions: [],
        activeRegionId: null,
        showMassBalance: true,
        showExtentChange: true,
        showAlbedoShift: false,
        showSeaLevelContribution: true,
        open: false,
        typeFilter: 'all',
      },
      setCryosphereChange: (updates) => set((state) => ({
        cryosphereChange: { ...state.cryosphereChange, ...updates },
      })),

      abyssalPlain: {
        features: [],
        activeFeatureId: null,
        showDepth: true,
        showSedimentType: true,
        showNoduleDensity: true,
        showBiodiversityIndex: false,
        open: false,
        sedimentFilter: 'all',
      },
      setAbyssalPlain: (updates) => set((state) => ({
        abyssalPlain: { ...state.abyssalPlain, ...updates },
      })),

      fjordEcosystem: {
        fjords: [],
        activeFjordId: null,
        showStratification: true,
        showOxygenLevel: true,
        showBiodiversity: true,
        showGlacialInput: false,
        showHealthScore: true,
        open: false,
        healthFilter: 'all',
      },
      setFjordEcosystem: (updates) => set((state) => ({
        fjordEcosystem: { ...state.fjordEcosystem, ...updates },
      })),

      geothermalSpring: {
        springs: [],
        activeSpringId: null,
        showTemperature: true,
        showFlowRate: true,
        showMineralContent: false,
        showSeismicActivity: true,
        open: false,
        tempFilter: 'all',
      },
      setGeothermalSpring: (updates) => set((state) => ({
        geothermalSpring: { ...state.geothermalSpring, ...updates },
      })),

      asteroidImpact: {
        objects: [],
        activeObjectId: null,
        showTrajectory: true,
        showHazardScore: true,
        showSizeComparison: false,
        open: false,
        hazardFilter: 'all',
      },
      setAsteroidImpact: (updates) => set((state) => ({
        asteroidImpact: { ...state.asteroidImpact, ...updates },
      })),

      desertOasis: {
        oases: [],
        activeOasisId: null,
        showWaterLevel: true,
        showSalinity: true,
        showVegetation: true,
        showAreaChange: false,
        open: false,
        healthFilter: 'all',
      },
      setDesertOasis: (updates) => set((state) => ({
        desertOasis: { ...state.desertOasis, ...updates },
      })),

      volcanicLightning: {
        strikes: [],
        activeStrikeId: null,
        showFrequency: true,
        showAshHeight: true,
        showEruptionIntensity: true,
        showStrikeCount: false,
        open: false,
        intensityFilter: 'all',
      },
      setVolcanicLightning: (updates) => set((state) => ({
        volcanicLightning: { ...state.volcanicLightning, ...updates },
      })),

      iceCoreData: {
        samples: [],
        activeSampleId: null,
        showCO2: true,
        showTemperature: true,
        showDust: false,
        showDepth: true,
        open: false,
        ageFilter: 'all',
      },
      setIceCoreData: (updates) => set((state) => ({
        iceCoreData: { ...state.iceCoreData, ...updates },
      })),

      stratosphericAerosol: {
        layers: [],
        activeLayerId: null,
        showOpticalDepth: true,
        showAltitude: true,
        showCoverage: false,
        showRadiativeEffect: true,
        open: false,
        compositionFilter: 'all',
      },
      setStratosphericAerosol: (updates) => set((state) => ({
        stratosphericAerosol: { ...state.stratosphericAerosol, ...updates },
      })),

      megacityCarbon: {
        cities: [],
        activeCityId: null,
        showCO2: true,
        showMethane: false,
        showTransportShare: true,
        showEnergyShare: true,
        open: false,
        emissionFilter: 'all',
      },
      setMegacityCarbon: (updates) => set((state) => ({
        megacityCarbon: { ...state.megacityCarbon, ...updates },
      })),

      oceanEddy: {
        eddies: [],
        activeEddyId: null,
        showRadius: true,
        showVelocity: true,
        showTempAnomaly: true,
        showLifetime: false,
        open: false,
        typeFilter: 'all',
      },
      setOceanEddy: (updates) => set((state) => ({
        oceanEddy: { ...state.oceanEddy, ...updates },
      })),

      // Task 68: New monitoring defaults and setters
      supervolcano: {
        volcanoes: [],
        activeVolcanoId: null,
        showCaldera: true,
        showMagmaChamber: true,
        showGroundDeformation: true,
        showThermalAnomaly: false,
        open: false,
        statusFilter: 'all',
      },
      setSupervolcano: (updates) => set((state) => ({
        supervolcano: { ...state.supervolcano, ...updates },
      })),
      polarVortex: {
        vortices: [],
        activeVortexId: null,
        showWindSpeed: true,
        showTemperature: true,
        showOzoneLevel: true,
        showJetStream: false,
        open: false,
        hemisphereFilter: 'all',
      },
      setPolarVortex: (updates) => set((state) => ({
        polarVortex: { ...state.polarVortex, ...updates },
      })),
      karstAquifer: {
        aquifers: [],
        activeAquiferId: null,
        showWaterTable: true,
        showConduitFlow: true,
        showRechargeZone: true,
        showWaterQuality: false,
        open: false,
        typeFilter: 'all',
      },
      setKarstAquifer: (updates) => set((state) => ({
        karstAquifer: { ...state.karstAquifer, ...updates },
      })),
      subductionZone: {
        zones: [],
        activeZoneId: null,
        showSeismicity: true,
        showSlipRate: true,
        showCoupling: true,
        showTremorActivity: false,
        open: false,
        typeFilter: 'all',
      },
      setSubductionZone: (updates) => set((state) => ({
        subductionZone: { ...state.subductionZone, ...updates },
      })),
      tropopause: {
        stations: [],
        activeStationId: null,
        showHeight: true,
        showTemperature: true,
        showOzoneConcentration: true,
        showPressure: false,
        open: false,
        regionFilter: 'all',
      },
      setTropopause: (updates) => set((state) => ({
        tropopause: { ...state.tropopause, ...updates },
      })),
      invasiveSpecies: {
        species: [],
        activeSpeciesId: null,
        showSpread: true,
        showImpact: true,
        showControlEffort: true,
        showNativeDecline: false,
        open: false,
        categoryFilter: 'all',
      },
      setInvasiveSpecies: (updates) => set((state) => ({
        invasiveSpecies: { ...state.invasiveSpecies, ...updates },
      })),
      tundraCarbon: {
        sites: [],
        activeSiteId: null,
        showCarbonFlux: true,
        showPermafrostDepth: true,
        showVegetationIndex: true,
        showMethaneRelease: false,
        open: false,
        regionFilter: 'all',
      },
      setTundraCarbon: (updates) => set((state) => ({
        tundraCarbon: { ...state.tundraCarbon, ...updates },
      })),
      monsoon: {
        systems: [],
        activeSystemId: null,
        showPrecipitation: true,
        showWindPattern: true,
        showHumidity: true,
        showCloudCover: false,
        open: false,
        regionFilter: 'all',
      },
      setMonsoon: (updates) => set((state) => ({
        monsoon: { ...state.monsoon, ...updates },
      })),

      // Task 69: New monitoring defaults and setters
      lavaFlow: {
        flows: [],
        activeFlowId: null,
        showFlowArea: true,
        showTemperature: true,
        showVelocity: true,
        showEffusionRate: false,
        open: false,
        typeFilter: 'all',
      },
      setLavaFlow: (updates) => set((state) => ({
        lavaFlow: { ...state.lavaFlow, ...updates },
      })),
      tidalEnergy: {
        sites: [],
        activeSiteId: null,
        showTidalRange: true,
        showCurrentSpeed: true,
        showPowerPotential: true,
        showEnvironmentalImpact: false,
        open: false,
        typeFilter: 'all',
      },
      setTidalEnergy: (updates) => set((state) => ({
        tidalEnergy: { ...state.tidalEnergy, ...updates },
      })),
      peatFire: {
        fires: [],
        activeFireId: null,
        showBurnArea: true,
        showFireDepth: true,
        showEmissionRate: true,
        showSoilMoisture: false,
        open: false,
        typeFilter: 'all',
      },
      setPeatFire: (updates) => set((state) => ({
        peatFire: { ...state.peatFire, ...updates },
      })),
      coralSpawn: {
        reefs: [],
        activeReefId: null,
        showSpawnIntensity: true,
        showWaterTemp: true,
        showLunarPhase: true,
        showLarvalDispersion: false,
        open: false,
        regionFilter: 'all',
      },
      setCoralSpawn: (updates) => set((state) => ({
        coralSpawn: { ...state.coralSpawn, ...updates },
      })),
      glacierCalving: {
        glaciers: [],
        activeGlacierId: null,
        showCalvingRate: true,
        showIceVelocity: true,
        showIceThickness: true,
        showSeismicActivity: false,
        open: false,
        typeFilter: 'all',
      },
      setGlacierCalving: (updates) => set((state) => ({
        glacierCalving: { ...state.glacierCalving, ...updates },
      })),
      soilCarbon: {
        sites: [],
        activeSiteId: null,
        showCarbonStock: true,
        showOrganicMatter: true,
        showMicrobialActivity: true,
        showSequestrationRate: false,
        open: false,
        typeFilter: 'all',
      },
      setSoilCarbon: (updates) => set((state) => ({
        soilCarbon: { ...state.soilCarbon, ...updates },
      })),
      urbanTreeCanopy: {
        zones: [],
        activeZoneId: null,
        showCanopyCoverage: true,
        showTreeDensity: true,
        showAirQualityBenefit: true,
        showHeatReduction: false,
        open: false,
        typeFilter: 'all',
      },
      setUrbanTreeCanopy: (updates) => set((state) => ({
        urbanTreeCanopy: { ...state.urbanTreeCanopy, ...updates },
      })),
      geomagneticPole: {
        poles: [],
        activePoleId: null,
        showDriftRate: true,
        showFieldStrength: true,
        showInclination: true,
        showDeclination: false,
        open: false,
        poleFilter: 'all',
      },
      setGeomagneticPole: (updates) => set((state) => ({
        geomagneticPole: { ...state.geomagneticPole, ...updates },
      })),

      // Task 70: New monitoring defaults and setters
      hydrothermalVent: {
        vents: [], activeVentId: null, showTemperature: true, showFlowRate: true, showMineralDeposit: true, showBiodiversity: false, open: false, typeFilter: 'all',
      },
      setHydrothermalVent: (updates) => set((state) => ({ hydrothermalVent: { ...state.hydrothermalVent, ...updates } })),
      watershedHealth: {
        basins: [], activeBasinId: null, showWaterQuality: true, showFlowRate: true, showSedimentLoad: true, showEcologicalHealth: false, open: false, typeFilter: 'all',
      },
      setWatershedHealth: (updates) => set((state) => ({ watershedHealth: { ...state.watershedHealth, ...updates } })),
      migratoryFlyway: {
        flyways: [], activeFlywayId: null, showPopulation: true, showArrivalDate: true, showThreatLevel: true, showHabitatQuality: false, open: false, typeFilter: 'all',
      },
      setMigratoryFlyway: (updates) => set((state) => ({ migratoryFlyway: { ...state.migratoryFlyway, ...updates } })),
      seagrassMeadow: {
        meadows: [], activeMeadowId: null, showCoverage: true, showCarbonStock: true, showWaterClarity: true, showHealthStatus: false, open: false, speciesFilter: 'all',
      },
      setSeagrassMeadow: (updates) => set((state) => ({ seagrassMeadow: { ...state.seagrassMeadow, ...updates } })),
      urbanHeatIslandDetail: {
        zones: [], activeZoneId: null, showTemperatureDelta: true, showVegetationCover: true, showAlbedo: true, showVulnerability: false, open: false, zoneFilter: 'all',
      },
      setUrbanHeatIslandDetail: (updates) => set((state) => ({ urbanHeatIslandDetail: { ...state.urbanHeatIslandDetail, ...updates } })),
      oceanAcidificationDetail: {
        stations: [], activeStationId: null, showPH: true, showAragonite: true, showPCO2: true, showSaturationState: false, open: false, regionFilter: 'all',
      },
      setOceanAcidificationDetail: (updates) => set((state) => ({ oceanAcidificationDetail: { ...state.oceanAcidificationDetail, ...updates } })),
      desertificationDetail: {
        regions: [], activeRegionId: null, showVegetationIndex: true, showSoilMoisture: true, showWindErosion: true, showDroughtIndex: false, open: false, severityFilter: 'all',
      },
      setDesertificationDetail: (updates) => set((state) => ({ desertificationDetail: { ...state.desertificationDetail, ...updates } })),
      volcanicGasTracker: {
        volcanoes: [], activeVolcanoId: null, showSO2: true, showCO2: true, showH2S: true, showPlumeHeight: false, open: false, gasFilter: 'all',
      },
      setVolcanicGasTracker: (updates) => set((state) => ({ volcanicGasTracker: { ...state.volcanicGasTracker, ...updates } })),
      deepOceanCurrent: {
        currents: [], activeCurrentId: null, showTemperature: true, showSalinity: true, showVelocity: true, showVolume: false, open: false, typeFilter: 'all',
      },
      setDeepOceanCurrent: (updates) => set((state) => ({ deepOceanCurrent: { ...state.deepOceanCurrent, ...updates } })),
      stratosphericOzone: {
        regions: [], activeRegionId: null, showOzoneColumn: true, showUVIndex: true, showTemperature: true, showTrend: false, open: false, regionFilter: 'all',
      },
      setStratosphericOzone: (updates) => set((state) => ({ stratosphericOzone: { ...state.stratosphericOzone, ...updates } })),
      seismicHarmonic: {
        stations: [], activeStationId: null, showAmplitude: true, showFrequency: true, showDuration: true, showDepth: false, open: false, typeFilter: 'all',
      },
      setSeismicHarmonic: (updates) => set((state) => ({ seismicHarmonic: { ...state.seismicHarmonic, ...updates } })),
      wildfireSmoke: {
        plumes: [], activePlumeId: null, showAOD: true, showPM25: true, showPlumeHeight: true, showDispersion: false, open: false, severityFilter: 'all',
      },
      setWildfireSmoke: (updates) => set((state) => ({ wildfireSmoke: { ...state.wildfireSmoke, ...updates } })),
      estuaryHealth: {
        estuaries: [], activeEstuaryId: null, showWaterQuality: true, showBiodiversity: true, showSediment: true, showNutrientLoad: false, open: false, typeFilter: 'all',
      },
      setEstuaryHealth: (updates) => set((state) => ({ estuaryHealth: { ...state.estuaryHealth, ...updates } })),
      alpineGlacier: {
        glaciers: [], activeGlacierId: null, showMassBalance: true, showVelocity: true, showArea: true, showLength: false, open: false, typeFilter: 'all',
      },
      setAlpineGlacier: (updates) => set((state) => ({ alpineGlacier: { ...state.alpineGlacier, ...updates } })),
      oceanAnoxicZone: {
        zones: [], activeZoneId: null, showOxygenLevel: true, showNitrate: true, showSulfide: true, showThickness: false, open: false, severityFilter: 'all',
      },
      setOceanAnoxicZone: (updates) => set((state) => ({ oceanAnoxicZone: { ...state.oceanAnoxicZone, ...updates } })),
      permafrostCarbonFeedback: {
        sites: [], activeSiteId: null, showThawDepth: true, showCarbonStock: true, showMethaneRelease: true, showTemperature: false, open: false, severityFilter: 'all',
      },
      setPermafrostCarbonFeedback: (updates) => set((state) => ({ permafrostCarbonFeedback: { ...state.permafrostCarbonFeedback, ...updates } })),
      tropicalCyclone: {
        cyclones: [], activeCycloneId: null, showWindSpeed: true, showPressure: true, showRainfall: true, showStormSurge: false, open: false, categoryFilter: 'all',
      },
      setTropicalCyclone: (updates) => set((state) => ({ tropicalCyclone: { ...state.tropicalCyclone, ...updates } })),
      volcanicDeformation: {
        volcanoes: [], activeVolcanoId: null, showUplift: true, showHorizontal: true, showTilt: true, showStrainRate: false, open: false, typeFilter: 'all',
      },
      setVolcanicDeformation: (updates) => set((state) => ({ volcanicDeformation: { ...state.volcanicDeformation, ...updates } })),
      coralReefBleachingDetail: {
        reefs: [], activeReefId: null, showBleachingPercent: true, showSST: true, showRecovery: true, showStressLevel: false, open: false, severityFilter: 'all',
      },
      setCoralReefBleachingDetail: (updates) => set((state) => ({ coralReefBleachingDetail: { ...state.coralReefBleachingDetail, ...updates } })),
      arcticPermafrostLakes: {
        lakes: [], activeLakeId: null, showArea: true, showDepth: true, showThawRate: true, showMethane: false, open: false, typeFilter: 'all',
      },
      setArcticPermafrostLakes: (updates) => set((state) => ({ arcticPermafrostLakes: { ...state.arcticPermafrostLakes, ...updates } })),
      methaneEmissionHotspot: {
        hotspots: [], activeHotspotId: null, showEmissionRate: true, showConcentration: true, showSource: true, showTrend: false, open: false, sourceFilter: 'all',
      },
      setMethaneEmissionHotspot: (updates) => set((state) => ({ methaneEmissionHotspot: { ...state.methaneEmissionHotspot, ...updates } })),
      coastalUpwelling: {
        zones: [], activeZoneId: null, showSST: true, showNutrientLevel: true, showProductivity: true, showWindStress: false, open: false, typeFilter: 'all',
      },
      setCoastalUpwelling: (updates) => set((state) => ({ coastalUpwelling: { ...state.coastalUpwelling, ...updates } })),
      spaceDebrisOrbit: {
        objects: [], activeObjectId: null, showAltitude: true, showVelocity: true, showCollisionRisk: true, showDecayRate: false, open: false, typeFilter: 'all',
      },
      setSpaceDebrisOrbit: (updates) => set((state) => ({ spaceDebrisOrbit: { ...state.spaceDebrisOrbit, ...updates } })),
      tectonicPlateBoundary: {
        boundaries: [], activeBoundaryId: null, showVelocity: true, showStress: true, showSeismicity: true, showSlipRate: false, open: false, typeFilter: 'all',
      },
      setTectonicPlateBoundary: (updates) => set((state) => ({ tectonicPlateBoundary: { ...state.tectonicPlateBoundary, ...updates } })),
      landslideSusceptibility: {
        zones: [], activeZoneId: null, showSlopeAngle: true, showSoilMoisture: true, showVegetation: true, showRainfall: false, open: false, riskFilter: 'all',
      },
      setLandslideSusceptibility: (updates) => set((state) => ({ landslideSusceptibility: { ...state.landslideSusceptibility, ...updates } })),
      solarFlareActivity: {
        events: [], activeEventId: null, showXRay: true, showProton: true, showRadio: true, showCoronalMass: false, open: false, classFilter: 'all',
      },
      setSolarFlareActivity: (updates) => set((state) => ({ solarFlareActivity: { ...state.solarFlareActivity, ...updates } })),
      riverDeltaErosion: {
        deltas: [], activeDeltaId: null, showErosionRate: true, showSedimentSupply: true, showSeaLevel: true, showLandLoss: false, open: false, severityFilter: 'all',
      },
      setRiverDeltaErosion: (updates) => set((state) => ({ riverDeltaErosion: { ...state.riverDeltaErosion, ...updates } })),
      seaIceThickness: {
        regions: [], activeRegionId: null, showThickness: true, showConcentration: true, showExtent: true, showAge: false, open: false, typeFilter: 'all',
      },
      setSeaIceThickness: (updates) => set((state) => ({ seaIceThickness: { ...state.seaIceThickness, ...updates } })),
      urbanAirQuality: {
        cities: [], activeCityId: null, showAQI: true, showPM25: true, showNO2: true, showO3: false, open: false, qualityFilter: 'all',
      },
      setUrbanAirQuality: (updates) => set((state) => ({ urbanAirQuality: { ...state.urbanAirQuality, ...updates } })),
      geothermalEnergy: {
        plants: [], activePlantId: null, showOutput: true, showTemperature: true, showFlowRate: true, showEfficiency: false, open: false, typeFilter: 'all',
      },
      setGeothermalEnergy: (updates) => set((state) => ({ geothermalEnergy: { ...state.geothermalEnergy, ...updates } })),
      aquiferSalinization: {
        aquifers: [], activeAquiferId: null, showSalinity: true, showChloride: true, showWaterLevel: true, showIntrusion: false, open: false, severityFilter: 'all',
      },
      setAquiferSalinization: (updates) => set((state) => ({ aquiferSalinization: { ...state.aquiferSalinization, ...updates } })),
      biomassBurning: {
        regions: [], activeRegionId: null, showFireCount: true, showBurnedArea: true, showEmissions: true, showSmoke: false, open: false, typeFilter: 'all',
      },
      setBiomassBurning: (updates) => set((state) => ({ biomassBurning: { ...state.biomassBurning, ...updates } })),
      glacialLakeOutburst: {
        lakes: [], activeLakeId: null, showWaterLevel: true, showDamStability: true, showFloodPotential: true, showDownstreamRisk: false, open: false, riskFilter: 'all',
      },
      setGlacialLakeOutburst: (updates) => set((state) => ({ glacialLakeOutburst: { ...state.glacialLakeOutburst, ...updates } })),
      oceanMicroplastic: {
        zones: [], activeZoneId: null, showConcentration: true, showParticleSize: true, showDepth: true, showAccumulation: false, open: false, typeFilter: 'all',
      },
      setOceanMicroplastic: (updates) => set((state) => ({ oceanMicroplastic: { ...state.oceanMicroplastic, ...updates } })),
      volcanicAshDispersion: {
        clouds: [], activeCloudId: null, showAshColumn: true, showDispersion: true, showAviationRisk: true, showFallout: false, open: false, severityFilter: 'all',
      },
      setVolcanicAshDispersion: (updates) => set((state) => ({ volcanicAshDispersion: { ...state.volcanicAshDispersion, ...updates } })),
      droughtSeverity: {
        regions: [], activeRegionId: null, showSPI: true, showSoilMoisture: true, showVegetation: true, showWaterStress: false, open: false, severityFilter: 'all',
      },
      setDroughtSeverity: (updates) => set((state) => ({ droughtSeverity: { ...state.droughtSeverity, ...updates } })),
      tsunamiWaveHeight: {
        events: [], activeEventId: null, showWaveHeight: true, showArrivalTime: true, showInundation: true, showCurrentSpeed: false, open: false, severityFilter: 'all',
      },
      setTsunamiWaveHeight: (updates) => set((state) => ({ tsunamiWaveHeight: { ...state.tsunamiWaveHeight, ...updates } })),
      caveEcosystem: {
        caves: [], activeCaveId: null, showBiodiversity: true, showTemperature: true, showHumidity: true, showWaterQuality: false, open: false, typeFilter: 'all',
      },
      setCaveEcosystem: (updates) => set((state) => ({ caveEcosystem: { ...state.caveEcosystem, ...updates } })),
      solarIrradiance: {
        stations: [], activeStationId: null, showGHI: true, showDNI: true, showDHI: true, showUVIndex: false, open: false, regionFilter: 'all',
      },
      setSolarIrradiance: (updates) => set((state) => ({ solarIrradiance: { ...state.solarIrradiance, ...updates } })),
      peatlandRestoration: {
        sites: [], activeSiteId: null, showWaterTable: true, showVegetation: true, showCarbonStock: true, showRestorationProgress: false, open: false, statusFilter: 'all',
      },
      setPeatlandRestoration: (updates) => set((state) => ({ peatlandRestoration: { ...state.peatlandRestoration, ...updates } })),
      mangroveCarbon: {
        forests: [], activeForestId: null, showCarbonStock: true, showArea: true, showDegradation: true, showRestoration: false, open: false, speciesFilter: 'all',
      },
      setMangroveCarbon: (updates) => set((state) => ({ mangroveCarbon: { ...state.mangroveCarbon, ...updates } })),
      oceanHeatContent: {
        basins: [], activeBasinId: null, showHeatContent: true, showTemperature: true, showSalinity: true, showTrend: false, open: false, depthFilter: 'all',
      },
      setOceanHeatContent: (updates) => set((state) => ({ oceanHeatContent: { ...state.oceanHeatContent, ...updates } })),
      dustStormTracker: {
        storms: [], activeStormId: null, showAOD: true, showWindSpeed: true, showVisibility: true, showPM10: false, open: false, severityFilter: 'all',
      },
      setDustStormTracker: (updates) => set((state) => ({ dustStormTracker: { ...state.dustStormTracker, ...updates } })),
      coralDiseaseMonitor: {
        reefs: [], activeReefId: null, showPrevalence: true, showWhiteSyndrome: true, showBlackBand: true, showRecoveryRate: false, open: false, diseaseFilter: 'all',
      },
      setCoralDiseaseMonitor: (updates) => set((state) => ({ coralDiseaseMonitor: { ...state.coralDiseaseMonitor, ...updates } })),
      iceShelfCollapse: {
        shelves: [], activeShelfId: null, showArea: true, showThickness: true, showFracture: true, showMeltRate: false, open: false, stabilityFilter: 'all',
      },
      setIceShelfCollapse: (updates) => set((state) => ({ iceShelfCollapse: { ...state.iceShelfCollapse, ...updates } })),
      urbanFloodRisk: {
        zones: [], activeZoneId: null, showImpervious: true, showDrainage: true, showElevation: true, showHistorical: false, open: false, riskFilter: 'all',
      },
      setUrbanFloodRisk: (updates) => set((state) => ({ urbanFloodRisk: { ...state.urbanFloodRisk, ...updates } })),
      phytoplanktonBloom: {
        blooms: [], activeBloomId: null, showChlorophyll: true, showToxicity: true, showExtent: true, showDuration: false, open: false, speciesFilter: 'all',
      },
      setPhytoplanktonBloom: (updates) => set((state) => ({ phytoplanktonBloom: { ...state.phytoplanktonBloom, ...updates } })),
      submarineCanyon: {
        canyons: [], activeCanyonId: null, showDepth: true, showCurrentSpeed: true, showSediment: true, showBiodiversity: false, open: false, typeFilter: 'all',
      },
      setSubmarineCanyon: (updates) => set((state) => ({ submarineCanyon: { ...state.submarineCanyon, ...updates } })),
      kelpForestMonitor: {
        forests: [], activeForestId: null, showCoverage: true, showBiomass: true, showWaterTemp: true, showBiodiversity: false, open: false, speciesFilter: 'all',
      },
      setKelpForestMonitor: (updates) => set((state) => ({ kelpForestMonitor: { ...state.kelpForestMonitor, ...updates } })),
      volcanicIslandFormation: {
        islands: [], activeIslandId: null, showElevation: true, showEruptionRate: true, showArea: true, showSubsidence: false, open: false, stageFilter: 'all',
      },
      setVolcanicIslandFormation: (updates) => set((state) => ({ volcanicIslandFormation: { ...state.volcanicIslandFormation, ...updates } })),
      saltwaterIntrusion: {
        zones: [], activeZoneId: null, showChloride: true, showConductivity: true, showWaterTable: true, showIntrusionRate: false, open: false, severityFilter: 'all',
      },
      setSaltwaterIntrusion: (updates) => set((state) => ({ saltwaterIntrusion: { ...state.saltwaterIntrusion, ...updates } })),
      arcticShippingRoute: {
        routes: [], activeRouteId: null, showIceThickness: true, showNavigability: true, showTransitTime: true, showTraffic: false, open: false, routeFilter: 'all',
      },
      setArcticShippingRoute: (updates) => set((state) => ({ arcticShippingRoute: { ...state.arcticShippingRoute, ...updates } })),
      thermoclineDepth: {
        stations: [], activeStationId: null, showDepth: true, showGradient: true, showSST: true, showTrend: false, open: false, regionFilter: 'all',
      },
      setThermoclineDepth: (updates) => set((state) => ({ thermoclineDepth: { ...state.thermoclineDepth, ...updates } })),
      bioluminescentBay: {
        bays: [], activeBayId: null, showBrightness: true, showDinoflagellate: true, showWaterQuality: true, showTourism: false, open: false, qualityFilter: 'all',
      },
      setBioluminescentBay: (updates) => set((state) => ({ bioluminescentBay: { ...state.bioluminescentBay, ...updates } })),
      orographicRainfall: {
        regions: [], activeRegionId: null, showRainfall: true, showElevation: true, showWindSpeed: true, showRunoff: false, open: false, typeFilter: 'all',
      },
      setOrographicRainfall: (updates) => set((state) => ({ orographicRainfall: { ...state.orographicRainfall, ...updates } })),
      hydrothermalPlume: {
        vents: [], activeVentId: null, showPlumeHeight: true, showTemperature: true, showChemical: true, showDispersion: false, open: false, typeFilter: 'all',
      },
      setHydrothermalPlume: (updates) => set((state) => ({ hydrothermalPlume: { ...state.hydrothermalPlume, ...updates } })),
      seamountEcosystem: {
        seamounts: [], activeSeamountId: null, showElevation: true, showBiodiversity: true, showCurrentSpeed: true, showFishingPressure: false, open: false, typeFilter: 'all',
      },
      setSeamountEcosystem: (updates) => set((state) => ({ seamountEcosystem: { ...state.seamountEcosystem, ...updates } })),
      groundSubsidence: {
        zones: [], activeZoneId: null, showSubsidenceRate: true, showGroundwater: true, showInfrastructure: true, showRisk: false, open: false, causeFilter: 'all',
      },
      setGroundSubsidence: (updates) => set((state) => ({ groundSubsidence: { ...state.groundSubsidence, ...updates } })),
      oceanStratification: {
        basins: [], activeBasinId: null, showPycnocline: true, showTemperature: true, showSalinity: true, showMixing: false, open: false, regionFilter: 'all',
      },
      setOceanStratification: (updates) => set((state) => ({ oceanStratification: { ...state.oceanStratification, ...updates } })),
      snowCoverExtent: {
        regions: [], activeRegionId: null, showExtent: true, showDepth: true, showWaterEquivalent: true, showMeltRate: false, open: false, seasonFilter: 'all',
      },
      setSnowCoverExtent: (updates) => set((state) => ({ snowCoverExtent: { ...state.snowCoverExtent, ...updates } })),
      coastalErosionDetail: {
        segments: [], activeSegmentId: null, showErosionRate: true, showSeaLevel: true, showSediment: true, showProtection: false, open: false, severityFilter: 'all',
      },
      setCoastalErosionDetail: (updates) => set((state) => ({ coastalErosionDetail: { ...state.coastalErosionDetail, ...updates } })),
      ecosystemServiceValue: {
        ecosystems: [], activeEcosystemId: null, showCarbonValue: true, showWaterValue: true, showBiodiversityValue: true, showRecreationValue: false, open: false, typeFilter: 'all',
      },
      setEcosystemServiceValue: (updates) => set((state) => ({ ecosystemServiceValue: { ...state.ecosystemServiceValue, ...updates } })),
      tidalFlatMonitor: {
        flats: [], activeFlatId: null, showArea: true, showBiodiversity: true, showSedimentQuality: true, showBirdPopulation: false, open: false, typeFilter: 'all',
      },
      setTidalFlatMonitor: (updates) => set((state) => ({ tidalFlatMonitor: { ...state.tidalFlatMonitor, ...updates } })),
      wildfireRiskAssessment: {
        zones: [], activeZoneId: null, showFireWeather: true, showFuelLoad: true, showTerrain: true, showExposure: false, open: false, riskFilter: 'all',
      },
      setWildfireRiskAssessment: (updates) => set((state) => ({ wildfireRiskAssessment: { ...state.wildfireRiskAssessment, ...updates } })),
      karstSinkhole: {
        sinkholes: [], activeSinkholeId: null, showDepth: true, showRisk: true, showSubsidence: false, open: false, riskFilter: 'all',
      },
      setKarstSinkhole: (updates) => set((state) => ({ karstSinkhole: { ...state.karstSinkhole, ...updates } })),
      volcanicSO2: {
        sources: [], activeSourceId: null, showConcentration: true, showPlume: true, showAlerts: false, open: false, alertFilter: 'all',
      },
      setVolcanicSO2: (updates) => set((state) => ({ volcanicSO2: { ...state.volcanicSO2, ...updates } })),
      icebergTracker: {
        icebergs: [], activeIcebergId: null, showTrajectory: true, showSize: true, showDrift: false, open: false, sizeFilter: 'all',
      },
      setIcebergTracker: (updates) => set((state) => ({ icebergTracker: { ...state.icebergTracker, ...updates } })),
      caveMineral: {
        formations: [], activeFormationId: null, showMineralType: true, showAge: true, showPurity: false, open: false, typeFilter: 'all',
      },
      setCaveMineral: (updates) => set((state) => ({ caveMineral: { ...state.caveMineral, ...updates } })),
      seafloorHydrate: {
        deposits: [], activeDepositId: null, showVolume: true, showStability: true, showDepth: false, open: false, stabilityFilter: 'all',
      },
      setSeafloorHydrate: (updates) => set((state) => ({ seafloorHydrate: { ...state.seafloorHydrate, ...updates } })),
      mangroveLoss: {
        regions: [], activeRegionId: null, showLossRate: true, showRecovery: true, showBiodiversity: false, open: false, lossFilter: 'all',
      },
      setMangroveLoss: (updates) => set((state) => ({ mangroveLoss: { ...state.mangroveLoss, ...updates } })),
      urbanNoiseCorridor: {
        corridors: [], activeCorridorId: null, showLevel: true, showSources: true, showHealthImpact: false, open: false, levelFilter: 'all',
      },
      setUrbanNoiseCorridor: (updates) => set((state) => ({ urbanNoiseCorridor: { ...state.urbanNoiseCorridor, ...updates } })),
      stratosphericWarming: {
        events: [], activeEventId: null, showTemperature: true, showWindReversal: true, showImpact: false, open: false, intensityFilter: 'all',
      },
      setStratosphericWarming: (updates) => set((state) => ({ stratosphericWarming: { ...state.stratosphericWarming, ...updates } })),
      submarineGroundwater: {
        discharges: [], activeDischargeId: null, showFlowRate: true, showSalinity: true, showNutrients: false, open: false, typeFilter: 'all',
      },
      setSubmarineGroundwater: (updates) => set((state) => ({ submarineGroundwater: { ...state.submarineGroundwater, ...updates } })),
      hydrothermalSulfide: {
        vents: [], activeVentId: null, showMineralContent: true, showTemperature: true, showActivity: false, open: false, activityFilter: 'all',
      },
      setHydrothermalSulfide: (updates) => set((state) => ({ hydrothermalSulfide: { ...state.hydrothermalSulfide, ...updates } })),
      lunarTidalForce: {
        stations: [], activeStationId: null, showTidalRange: true, showLunarPhase: true, showCurrentSpeed: false, open: false, phaseFilter: 'all',
      },
      setLunarTidalForce: (updates) => set((state) => ({ lunarTidalForce: { ...state.lunarTidalForce, ...updates } })),
      ripCurrent: {
        zones: [], activeZoneId: null, showRisk: true, showSpeed: true, showFrequency: false, open: false, riskFilter: 'all',
      },
      setRipCurrent: (updates) => set((state) => ({ ripCurrent: { ...state.ripCurrent, ...updates } })),
      avalancheDebrisFlow: {
        events: [], activeEventId: null, showVolume: true, showVelocity: true, showRunout: false, open: false, typeFilter: 'all',
      },
      setAvalancheDebrisFlow: (updates) => set((state) => ({ avalancheDebrisFlow: { ...state.avalancheDebrisFlow, ...updates } })),
      coastalAcidification: {
        sites: [], activeSiteId: null, showPH: true, showCarbonDioxide: true, showSaturation: false, open: false, severityFilter: 'all',
      },
      setCoastalAcidification: (updates) => set((state) => ({ coastalAcidification: { ...state.coastalAcidification, ...updates } })),
      desertSandSea: {
        regions: [], activeRegionId: null, showDuneHeight: true, showMigration: true, showArea: false, open: false, typeFilter: 'all',
      },
      setDesertSandSea: (updates) => set((state) => ({ desertSandSea: { ...state.desertSandSea, ...updates } })),
      subsidenceHazard: {
        zones: [], activeZoneId: null, showRate: true, showRisk: true, showInfrastructure: false, open: false, riskFilter: 'all',
      },
      setSubsidenceHazard: (updates) => set((state) => ({ subsidenceHazard: { ...state.subsidenceHazard, ...updates } })),
      volcanicLahar: {
        flows: [], activeFlowId: null, showVolume: true, showVelocity: true, showRisk: false, open: false, riskFilter: 'all',
      },
      setVolcanicLahar: (updates) => set((state) => ({ volcanicLahar: { ...state.volcanicLahar, ...updates } })),
      deepWaterCoral: {
        reefs: [], activeReefId: null, showDepth: true, showHealth: true, showSpecies: false, open: false, healthFilter: 'all',
      },
      setDeepWaterCoral: (updates) => set((state) => ({ deepWaterCoral: { ...state.deepWaterCoral, ...updates } })),
      polarBearHabitat: {
        regions: [], activeRegionId: null, showIceCover: true, showPopulation: true, showMigration: false, open: false, statusFilter: 'all',
      },
      setPolarBearHabitat: (updates) => set((state) => ({ polarBearHabitat: { ...state.polarBearHabitat, ...updates } })),
      soilSalinization: {
        zones: [], activeZoneId: null, showSalinity: true, showCropImpact: true, showArea: false, open: false, severityFilter: 'all',
      },
      setSoilSalinization: (updates) => set((state) => ({ soilSalinization: { ...state.soilSalinization, ...updates } })),
      tsunamiRunup: {
        sites: [], activeSiteId: null, showRunup: true, showInundation: true, showRisk: false, open: false, riskFilter: 'all',
      },
      setTsunamiRunup: (updates) => set((state) => ({ tsunamiRunup: { ...state.tsunamiRunup, ...updates } })),
      urbanHeatVentilation: {
        corridors: [], activeCorridorId: null, showAirflow: true, showTemperature: true, showPollution: false, open: false, efficiencyFilter: 'all',
      },
      setUrbanHeatVentilation: (updates) => set((state) => ({ urbanHeatVentilation: { ...state.urbanHeatVentilation, ...updates } })),
      brinePool: {
        pools: [], activePoolId: null, showSalinity: true, showDepth: true, showBiology: false, open: false, activityFilter: 'all',
      },
      setBrinePool: (updates) => set((state) => ({ brinePool: { ...state.brinePool, ...updates } })),
      supraglacialStream: {
        streams: [], activeStreamId: null, showFlowRate: true, showTemperature: true, showMeltRate: false, open: false, statusFilter: 'all',
      },
      setSupraglacialStream: (updates) => set((state) => ({ supraglacialStream: { ...state.supraglacialStream, ...updates } })),
      methaneHydrateStability: {
        zones: [], activeZoneId: null, showStability: true, showTemperature: true, showPressure: false, open: false, stabilityFilter: 'all',
      },
      setMethaneHydrateStability: (updates) => set((state) => ({ methaneHydrateStability: { ...state.methaneHydrateStability, ...updates } })),
      volcanicAshCloud: {
        clouds: [], activeCloudId: null, showAltitude: true, showDispersion: true, showConcentration: false, open: false, alertFilter: 'all',
      },
      setVolcanicAshCloud: (updates) => set((state) => ({ volcanicAshCloud: { ...state.volcanicAshCloud, ...updates } })),
      geothermalGradient: {
        sites: [], activeSiteId: null, showGradient: true, showTemperature: true, showFlow: false, open: false, potentialFilter: 'all',
      },
      setGeothermalGradient: (updates) => set((state) => ({ geothermalGradient: { ...state.geothermalGradient, ...updates } })),
      oceanDeoxygenation: {
        zones: [], activeZoneId: null, showOxygen: true, showArea: true, showImpact: false, open: false, severityFilter: 'all',
      },
      setOceanDeoxygenation: (updates) => set((state) => ({ oceanDeoxygenation: { ...state.oceanDeoxygenation, ...updates } })),
      rockGlacier: {
        glaciers: [], activeGlacierId: null, showVelocity: true, showTemperature: true, showIceContent: false, open: false, activityFilter: 'all',
      },
      setRockGlacier: (updates) => set((state) => ({ rockGlacier: { ...state.rockGlacier, ...updates } })),
      dustHemisphere: {
        events: [], activeEventId: null, showConcentration: true, showTransport: true, showDeposition: false, open: false, intensityFilter: 'all',
      },
      setDustHemisphere: (updates) => set((state) => ({ dustHemisphere: { ...state.dustHemisphere, ...updates } })),
      microplasticOcean: {
        zones: [], activeZoneId: null, showConcentration: true, showSize: true, showSourceType: false, open: false, densityFilter: 'all',
      },
      setMicroplasticOcean: (updates) => set((state) => ({ microplasticOcean: { ...state.microplasticOcean, ...updates } })),
      glacierBasalSlide: {
        glaciers: [], activeGlacierId: null, showVelocity: true, showBasalTemp: true, showSlideRisk: false, open: false, riskFilter: 'all',
      },
      setGlacierBasalSlide: (updates) => set((state) => ({ glacierBasalSlide: { ...state.glacierBasalSlide, ...updates } })),
      volcanicFumarole: {
        fumaroles: [], activeFumaroleId: null, showTemperature: true, showGasComposition: true, showPressure: false, open: false, statusFilter: 'all',
      },
      setVolcanicFumarole: (updates) => set((state) => ({ volcanicFumarole: { ...state.volcanicFumarole, ...updates } })),
      hydroclimateExtremes: {
        events: [], activeEventId: null, showSeverity: true, showDuration: true, showTrend: false, open: false, typeFilter: 'all',
      },
      setHydroclimateExtremes: (updates) => set((state) => ({ hydroclimateExtremes: { ...state.hydroclimateExtremes, ...updates } })),
      megafaunaTracking: {
        animals: [], activeAnimalId: null, showPopulation: true, showTrend: true, showHabitat: false, open: false, speciesFilter: 'all',
      },
      setMegafaunaTracking: (updates) => set((state) => ({ megafaunaTracking: { ...state.megafaunaTracking, ...updates } })),
      cryoconiteHole: {
        holes: [], activeHoleId: null, showDepth: true, showOrganicContent: true, showDiameter: false, open: false, statusFilter: 'all',
      },
      setCryoconiteHole: (updates) => set((state) => ({ cryoconiteHole: { ...state.cryoconiteHole, ...updates } })),
      sapFlow: {
        sensors: [], activeSensorId: null, showFlowRate: true, showTreeDiameter: true, showTrend: false, open: false, statusFilter: 'all',
      },
      setSapFlow: (updates) => set((state) => ({ sapFlow: { ...state.sapFlow, ...updates } })),
      rockfallHazard: {
        zones: [], activeZoneId: null, showSlopeAngle: true, showRockVolume: true, showTriggerType: false, open: false, hazardFilter: 'all',
      },
      setRockfallHazard: (updates) => set((state) => ({ rockfallHazard: { ...state.rockfallHazard, ...updates } })),
      thermohalineCirculation: {
        currents: [], activeCurrentId: null, showTemperature: true, showSalinity: true, showVelocity: false, open: false, statusFilter: 'all',
      },
      setThermohalineCirculation: (updates) => set((state) => ({ thermohalineCirculation: { ...state.thermohalineCirculation, ...updates } })),
      hydroseismicActivity: {
        events: [], activeEventId: null, showMagnitude: true, showDepth: true, showWaterLevel: false, open: false, typeFilter: 'all',
      },
      setHydroseismicActivity: (updates) => set((state) => ({ hydroseismicActivity: { ...state.hydroseismicActivity, ...updates } })),
      lavaTubeCave: {
        caves: [], activeCaveId: null, showLength: true, showTemperature: true, showLavaType: false, open: false, statusFilter: 'all',
      },
      setLavaTubeCave: (updates) => set((state) => ({ lavaTubeCave: { ...state.lavaTubeCave, ...updates } })),
      submarineCanyonFisheries: {
        fisheries: [], activeFisheryId: null, showDepth: true, showCatchVolume: true, showFishSpecies: false, open: false, statusFilter: 'all',
      },
      setSubmarineCanyonFisheries: (updates) => set((state) => ({ submarineCanyonFisheries: { ...state.submarineCanyonFisheries, ...updates } })),
      polynyaIce: {
        polynyas: [], activePolynyaId: null, showArea: true, showIceThickness: true, showWaterTemperature: false, open: false, statusFilter: 'all',
      },
      setPolynyaIce: (updates) => set((state) => ({ polynyaIce: { ...state.polynyaIce, ...updates } })),
      volcanicDomeGrowth: {
        domes: [], activeDomeId: null, showGrowthRate: true, showDomeVolume: true, showTemperature: false, open: false, statusFilter: 'all',
      },
      setVolcanicDomeGrowth: (updates) => set((state) => ({ volcanicDomeGrowth: { ...state.volcanicDomeGrowth, ...updates } })),
      seamountBiodiversity: {
        seamounts: [], activeSeamountId: null, showDepth: true, showSpeciesCount: true, showEndemismRate: false, open: false, statusFilter: 'all',
      },
      setSeamountBiodiversity: (updates) => set((state) => ({ seamountBiodiversity: { ...state.seamountBiodiversity, ...updates } })),
      estuaryAcidification: {
        estuaries: [], activeEstuaryId: null, showPH: true, showAlkalinity: true, showSalinity: false, open: false, statusFilter: 'all',
      },
      setEstuaryAcidification: (updates) => set((state) => ({ estuaryAcidification: { ...state.estuaryAcidification, ...updates } })),
      abyssalSedimentFlux: {
        sites: [], activeSiteId: null, showSedimentRate: true, showDepth: true, showFluxDirection: false, open: false, statusFilter: 'all',
      },
      setAbyssalSedimentFlux: (updates) => set((state) => ({ abyssalSedimentFlux: { ...state.abyssalSedimentFlux, ...updates } })),
      glacialMoulin: {
        moulins: [], activeMoulinId: null, showDepth: true, showFlowRate: true, showDiameter: false, open: false, statusFilter: 'all',
      },
      setGlacialMoulin: (updates) => set((state) => ({ glacialMoulin: { ...state.glacialMoulin, ...updates } })),
      iceShelfCalving: {
        shelves: [], activeShelfId: null, showArea: true, showCalvingRate: true, showThickness: false, open: false, statusFilter: 'all',
      },
      setIceShelfCalving: (updates) => set((state) => ({ iceShelfCalving: { ...state.iceShelfCalving, ...updates } })),
      volcanicGasPlume: {
        plumes: [], activePlumeId: null, showSO2: true, showPlumeHeight: true, showGasType: false, open: false, statusFilter: 'all',
      },
      setVolcanicGasPlume: (updates) => set((state) => ({ volcanicGasPlume: { ...state.volcanicGasPlume, ...updates } })),
      submarineLandslide: {
        slides: [], activeSlideId: null, showVolume: true, showDepth: true, showSlopeAngle: false, open: false, statusFilter: 'all',
      },
      setSubmarineLandslide: (updates) => set((state) => ({ submarineLandslide: { ...state.submarineLandslide, ...updates } })),
      coastalWetlandLoss: {
        wetlands: [], activeWetlandId: null, showAreaLost: true, showRemainingArea: true, showLossRate: false, open: false, statusFilter: 'all',
      },
      setCoastalWetlandLoss: (updates) => set((state) => ({ coastalWetlandLoss: { ...state.coastalWetlandLoss, ...updates } })),
      tundraPermafrostThaw: {
        sites: [], activeSiteId: null, showActiveLayerDepth: true, showGroundTemperature: true, showThawRate: false, open: false, statusFilter: 'all',
      },
      setTundraPermafrostThaw: (updates) => set((state) => ({ tundraPermafrostThaw: { ...state.tundraPermafrostThaw, ...updates } })),
      oceanCurrentProfiler: {
        profiles: [], activeProfileId: null, showCurrentSpeed: true, showDirection: true, showDepth: false, open: false, statusFilter: 'all',
      },
      setOceanCurrentProfiler: (updates) => set((state) => ({ oceanCurrentProfiler: { ...state.oceanCurrentProfiler, ...updates } })),
      desertificationFront: {
        fronts: [], activeFrontId: null, showAdvanceRate: true, showVegetationIndex: true, showSoilMoisture: false, open: false, statusFilter: 'all',
      },
      setDesertificationFront: (updates) => set((state) => ({ desertificationFront: { ...state.desertificationFront, ...updates } })),
      coralReefRecovery: {
        reefs: [], activeReefId: null, showLiveCoralCover: true, showRecoveryRate: true, showBleachingHistory: false, open: false, statusFilter: 'all',
      },
      setCoralReefRecovery: (updates) => set((state) => ({ coralReefRecovery: { ...state.coralReefRecovery, ...updates } })),
      methaneCrater: {
        craters: [], activeCraterId: null, showDiameter: true, showDepth: true, showMethaneConcentration: false, open: false, statusFilter: 'all',
      },
      setMethaneCrater: (updates) => set((state) => ({ methaneCrater: { ...state.methaneCrater, ...updates } })),
      subglacialVolcano: {
        volcanoes: [], activeVolcanoId: null, showIceThickness: true, showHeatFlux: true, showEruptionProbability: false, open: false, statusFilter: 'all',
      },
      setSubglacialVolcano: (updates) => set((state) => ({ subglacialVolcano: { ...state.subglacialVolcano, ...updates } })),
      coralSpawnPrediction: {
        predictions: [], activePredictionId: null, showSpawnDate: true, showWaterTemperature: true, showMoonPhase: false, open: false, statusFilter: 'all',
      },
      setCoralSpawnPrediction: (updates) => set((state) => ({ coralSpawnPrediction: { ...state.coralSpawnPrediction, ...updates } })),
      hydrothermalDiffuseFlow: {
        flows: [], activeFlowId: null, showFlowRate: true, showTemperature: true, showChemosynthesisRate: false, open: false, statusFilter: 'all',
      },
      setHydrothermalDiffuseFlow: (updates) => set((state) => ({ hydrothermalDiffuseFlow: { ...state.hydrothermalDiffuseFlow, ...updates } })),
      permafrostCarbonPipeline: {
        segments: [], activeSegmentId: null, showCarbonStock: true, showThawDepth: true, showPipelineRisk: false, open: false, statusFilter: 'all',
      },
      setPermafrostCarbonPipeline: (updates) => set((state) => ({ permafrostCarbonPipeline: { ...state.permafrostCarbonPipeline, ...updates } })),
      subaqueousLavaFlow: {
        flows: [], activeFlowId: null, showFlowLength: true, showDepth: true, showLavaTemperature: false, open: false, statusFilter: 'all',
      },
      setSubaqueousLavaFlow: (updates) => set((state) => ({ subaqueousLavaFlow: { ...state.subaqueousLavaFlow, ...updates } })),
      intertidalZone: {
        zones: [], activeZoneId: null, showTidalRange: true, showBiodiversityIndex: true, showSeaLevelRise: false, open: false, statusFilter: 'all',
      },
      setIntertidalZone: (updates) => set((state) => ({ intertidalZone: { ...state.intertidalZone, ...updates } })),
      desertFlashFlood: {
        events: [], activeEventId: null, showRainfallIntensity: true, showFloodVolume: true, showCatchmentArea: false, open: false, statusFilter: 'all',
      },
      setDesertFlashFlood: (updates) => set((state) => ({ desertFlashFlood: { ...state.desertFlashFlood, ...updates } })),
      mudVolcanoActivity: {
        volcanoes: [], activeVolcanoId: null, showEruptionRate: true, showFlowTemperature: true, showMudViscosity: false, open: false, statusFilter: 'all',
      },
      setMudVolcanoActivity: (updates) => set((state) => ({ mudVolcanoActivity: { ...state.mudVolcanoActivity, ...updates } })),
      glacierSurgeEvent: {
        events: [], activeEventId: null, showSurgeVelocity: true, showIceDisplacement: true, showSurgeDuration: false, open: false, statusFilter: 'all',
      },
      setGlacierSurgeEvent: (updates) => set((state) => ({ glacierSurgeEvent: { ...state.glacierSurgeEvent, ...updates } })),
      seicheWaveOscillation: {
        oscillations: [], activeOscillationId: null, showWaveAmplitude: true, showOscillationPeriod: true, showWaterLevelChange: false, open: false, statusFilter: 'all',
      },
      setSeicheWaveOscillation: (updates) => set((state) => ({ seicheWaveOscillation: { ...state.seicheWaveOscillation, ...updates } })),
      laharFlowTracker: {
        flows: [], activeFlowId: null, showFlowVelocity: true, showSedimentConcentration: true, showFlowVolume: false, open: false, statusFilter: 'all',
      },
      setLaharFlowTracker: (updates) => set((state) => ({ laharFlowTracker: { ...state.laharFlowTracker, ...updates } })),
      icePenitentMonitor: {
        formations: [], activeFormationId: null, showSpikeHeight: true, showFormationDensity: true, showSurfaceTemperature: false, open: false, statusFilter: 'all',
      },
      setIcePenitentMonitor: (updates) => set((state) => ({ icePenitentMonitor: { ...state.icePenitentMonitor, ...updates } })),
      frostHeaveMonitor: {
        sites: [], activeSiteId: null, showHeaveAmount: true, showGroundTemperature: true, showSoilMoistureContent: false, open: false, statusFilter: 'all',
      },
      setFrostHeaveMonitor: (updates) => set((state) => ({ frostHeaveMonitor: { ...state.frostHeaveMonitor, ...updates } })),
      pumiceRaftDrift: {
        rafts: [], activeRaftId: null, showRaftArea: true, showDriftSpeed: true, showPumiceDensity: false, open: false, statusFilter: 'all',
      },
      setPumiceRaftDrift: (updates) => set((state) => ({ pumiceRaftDrift: { ...state.pumiceRaftDrift, ...updates } })),
      limnicEruptionMonitor: {
        lakes: [], activeLakeId: null, showCO2Concentration: true, showGasReleaseRate: true, showWaterDepth: false, open: false, statusFilter: 'all',
      },
      setLimnicEruptionMonitor: (updates) => set((state) => ({ limnicEruptionMonitor: { ...state.limnicEruptionMonitor, ...updates } })),

      // Task 95: Volcanic Tremor Monitor
      volcanicTremor: {
        data: [], activeItemId: null, showAmplitude: true, showFrequency: true, showDuration: false, open: false, statusFilter: '',
      },
      setVolcanicTremor: (updates) => set((state) => ({ volcanicTremor: { ...state.volcanicTremor, ...updates } })),

      // Task 95: Ice Wedge Polygon Monitor
      iceWedgePolygon: {
        data: [], activeItemId: null, showPolygonArea: true, showWedgeDepth: true, showDegradationRate: false, open: false, statusFilter: '',
      },
      setIceWedgePolygon: (updates) => set((state) => ({ iceWedgePolygon: { ...state.iceWedgePolygon, ...updates } })),

      // Task 95: Salt Flat Crust Monitor
      saltFlatCrust: {
        data: [], activeItemId: null, showCrustThickness: true, showSalinity: true, showMoistureContent: false, open: false, statusFilter: '',
      },
      setSaltFlatCrust: (updates) => set((state) => ({ saltFlatCrust: { ...state.saltFlatCrust, ...updates } })),

      // Task 95: Cold Water Coral Reef Monitor
      coldWaterCoralReef: {
        data: [], activeItemId: null, showDepth: true, showTemperature: true, showCoralCover: false, open: false, statusFilter: '',
      },
      setColdWaterCoralReef: (updates) => set((state) => ({ coldWaterCoralReef: { ...state.coldWaterCoralReef, ...updates } })),

      // Task 95: Peatland Carbon Sink Monitor
      peatlandCarbonSink: {
        data: [], activeItemId: null, showCarbonStock: true, showSequestrationRate: true, showWaterTableDepth: false, open: false, statusFilter: '',
      },
      setPeatlandCarbonSink: (updates) => set((state) => ({ peatlandCarbonSink: { ...state.peatlandCarbonSink, ...updates } })),

      // Task 95: Hyporheic Zone Monitor
      hyporheicZone: {
        data: [], activeItemId: null, showExchangeRate: true, showResidenceTime: true, showTemperature: false, open: false, statusFilter: '',
      },
      setHyporheicZone: (updates) => set((state) => ({ hyporheicZone: { ...state.hyporheicZone, ...updates } })),

      // Task 95: Submarine Fan Monitor
      submarineFan: {
        data: [], activeItemId: null, showSedimentationRate: true, showChannelDepth: true, showFanArea: false, open: false, statusFilter: '',
      },
      setSubmarineFan: (updates) => set((state) => ({ submarineFan: { ...state.submarineFan, ...updates } })),

      // Task 95: Coastal Dune System Monitor
      coastalDuneSystem: {
        data: [], activeItemId: null, showDuneHeight: true, showErosionRate: true, showVegetationCover: false, open: false, statusFilter: '',
      },
      setCoastalDuneSystem: (updates) => set((state) => ({ coastalDuneSystem: { ...state.coastalDuneSystem, ...updates } })),

      // Task 96: New Monitors
      karstSpringDischarge: {
        data: [], activeItemId: null, showDischargeRate: true, showWaterTemperature: true, showConductivity: false, open: false, statusFilter: '',
      },
      setKarstSpringDischarge: (updates) => set((state) => ({ karstSpringDischarge: { ...state.karstSpringDischarge, ...updates } })),
      caveDripMonitor: {
        data: [], activeItemId: null, showDripRate: true, showCalciumConcentration: true, showPHDrip: false, open: false, statusFilter: '',
      },
      setCaveDripMonitor: (updates) => set((state) => ({ caveDripMonitor: { ...state.caveDripMonitor, ...updates } })),
      tidalCreekMonitor: {
        data: [], activeItemId: null, showTidalRange: true, showCreekDepth: true, showSalinity: false, open: false, statusFilter: '',
      },
      setTidalCreekMonitor: (updates) => set((state) => ({ tidalCreekMonitor: { ...state.tidalCreekMonitor, ...updates } })),
      saltMarshCarbon: {
        data: [], activeItemId: null, showCarbonStock: true, showAccretionRate: true, showVegetationCover: false, open: false, statusFilter: '',
      },
      setSaltMarshCarbon: (updates) => set((state) => ({ saltMarshCarbon: { ...state.saltMarshCarbon, ...updates } })),
      opalPaleoMonitor: {
        data: [], activeItemId: null, showOpalConcentration: true, showDiatomCount: true, showSedimentAge: false, open: false, statusFilter: '',
      },
      setOpalPaleoMonitor: (updates) => set((state) => ({ opalPaleoMonitor: { ...state.opalPaleoMonitor, ...updates } })),
      aeolianDustDeposition: {
        data: [], activeItemId: null, showDepositionRate: true, showParticleSize: true, showDustOrigin: false, open: false, statusFilter: '',
      },
      setAeolianDustDeposition: (updates) => set((state) => ({ aeolianDustDeposition: { ...state.aeolianDustDeposition, ...updates } })),
      katabaticWindMonitor: {
        data: [], activeItemId: null, showWindSpeed: true, showTemperature: true, showWindChill: false, open: false, statusFilter: '',
      },
      setKatabaticWindMonitor: (updates) => set((state) => ({ katabaticWindMonitor: { ...state.katabaticWindMonitor, ...updates } })),
      snowAvalancheTracker: {
        data: [], activeItemId: null, showSlopeAngle: true, showSnowDepth: true, showAvalancheSize: false, open: false, statusFilter: '',
      },
      setSnowAvalancheTracker: (updates) => set((state) => ({ snowAvalancheTracker: { ...state.snowAvalancheTracker, ...updates } })),
      riftValleyVolcano: {
        data: [], activeItemId: null, showMagmaChamberDepth: true, showDeformationRate: true, showSo2Emission: false, open: false, statusFilter: '',
      },
      setRiftValleyVolcano: (updates) => set((state) => ({ riftValleyVolcano: { ...state.riftValleyVolcano, ...updates } })),
      streamBankErosion: {
        data: [], activeItemId: null, showErosionRate: true, showBankAngle: true, showVegetationCover: false, open: false, statusFilter: '',
      },
      setStreamBankErosion: (updates) => set((state) => ({ streamBankErosion: { ...state.streamBankErosion, ...updates } })),
      iceStreamVelocity: {
        data: [], activeItemId: null, showFlowVelocity: true, showIceThickness: true, showBasalShearStress: false, open: false, statusFilter: '',
      },
      setIceStreamVelocity: (updates) => set((state) => ({ iceStreamVelocity: { ...state.iceStreamVelocity, ...updates } })),
      coastalAquifer: {
        data: [], activeItemId: null, showSaltwaterFront: true, showWaterTableDepth: true, showChlorideConcentration: false, open: false, statusFilter: '',
      },
      setCoastalAquifer: (updates) => set((state) => ({ coastalAquifer: { ...state.coastalAquifer, ...updates } })),
      mangroveRootSystem: {
        data: [], activeItemId: null, showRootDensity: true, showSedimentAccretion: true, showCarbonStock: false, open: false, statusFilter: '',
      },
      setMangroveRootSystem: (updates) => set((state) => ({ mangroveRootSystem: { ...state.mangroveRootSystem, ...updates } })),
      paleoshorelineTracker: {
        data: [], activeItemId: null, showShorelineAge: true, showElevation: true, showSeaLevelIndicator: false, open: false, statusFilter: '',
      },
      setPaleoshorelineTracker: (updates) => set((state) => ({ paleoshorelineTracker: { ...state.paleoshorelineTracker, ...updates } })),
      cryoconiteGranule: {
        data: [], activeItemId: null, showGranuleDiameter: true, showOrganicContent: true, showAlbedoEffect: false, open: false, statusFilter: '',
      },
      setCryoconiteGranule: (updates) => set((state) => ({ cryoconiteGranule: { ...state.cryoconiteGranule, ...updates } })),
      subglacialWaterSystem: {
        data: [], activeItemId: null, showWaterPressure: true, showFlowRate: true, showChannelDiameter: false, open: false, statusFilter: '',
      },
      setSubglacialWaterSystem: (updates) => set((state) => ({ subglacialWaterSystem: { ...state.subglacialWaterSystem, ...updates } })),

      // Task 98: Mass Wasting and Slope Processes
      landslideVelocity: {
        data: [], activeItemId: null, showVelocity: true, showDisplacement: true, showDepth: false, open: false, statusFilter: '',
      },
      setLandslideVelocity: (updates) => set((state) => ({ landslideVelocity: { ...state.landslideVelocity, ...updates } })),
      debrisFlowSurge: {
        data: [], activeItemId: null, showSurgeVolume: true, showFlowVelocity: true, showSedimentConcentration: false, open: false, statusFilter: '',
      },
      setDebrisFlowSurge: (updates) => set((state) => ({ debrisFlowSurge: { ...state.debrisFlowSurge, ...updates } })),
      rockfallImpact: {
        data: [], activeItemId: null, showImpactEnergy: true, showBlockVolume: true, showFrequency: false, open: false, statusFilter: '',
      },
      setRockfallImpact: (updates) => set((state) => ({ rockfallImpact: { ...state.rockfallImpact, ...updates } })),
      soilCreepRate: {
        data: [], activeItemId: null, showCreepRate: true, showSoilMoisture: true, showSlopeAngle: false, open: false, statusFilter: '',
      },
      setSoilCreepRate: (updates) => set((state) => ({ soilCreepRate: { ...state.soilCreepRate, ...updates } })),
      solifluctionLobe: {
        data: [], activeItemId: null, showLobeVelocity: true, showLobeWidth: true, showActiveLayerDepth: false, open: false, statusFilter: '',
      },
      setSolifluctionLobe: (updates) => set((state) => ({ solifluctionLobe: { ...state.solifluctionLobe, ...updates } })),
      earthflowDisplacement: {
        data: [], activeItemId: null, showDisplacement: true, showFlowRate: true, showMoistureContent: false, open: false, statusFilter: '',
      },
      setEarthflowDisplacement: (updates) => set((state) => ({ earthflowDisplacement: { ...state.earthflowDisplacement, ...updates } })),
      slumpFailure: {
        data: [], activeItemId: null, showScarpHeight: true, showRotationAngle: true, showPorePressure: false, open: false, statusFilter: '',
      },
      setSlumpFailure: (updates) => set((state) => ({ slumpFailure: { ...state.slumpFailure, ...updates } })),
      talusAccumulation: {
        data: [], activeItemId: null, showAccumulationRate: true, showTalusVolume: true, showSlopeAngle: false, open: false, statusFilter: '',
      },
      setTalusAccumulation: (updates) => set((state) => ({ talusAccumulation: { ...state.talusAccumulation, ...updates } })),

      // Task 99: Coastal Engineering and Shore Protection
      breakwaterIntegrity: {
        data: [], activeItemId: null, showStructuralHealth: true, showWaveForce: true, showOvertoppingRate: false, open: false, statusFilter: '',
      },
      setBreakwaterIntegrity: (updates) => set((state) => ({ breakwaterIntegrity: { ...state.breakwaterIntegrity, ...updates } })),
      seawallErosion: {
        data: [], activeItemId: null, showErosionRate: true, showScourDepth: true, showWallDisplacement: false, open: false, statusFilter: '',
      },
      setSeawallErosion: (updates) => set((state) => ({ seawallErosion: { ...state.seawallErosion, ...updates } })),
      groinSediment: {
        data: [], activeItemId: null, showAccretionRate: true, showBypassRate: true, showUpdriftWidth: false, open: false, statusFilter: '',
      },
      setGroinSediment: (updates) => set((state) => ({ groinSediment: { ...state.groinSediment, ...updates } })),
      revetmentStability: {
        data: [], activeItemId: null, showArmorIntegrity: true, showSlopeDisplacement: true, showUnderpressure: false, open: false, statusFilter: '',
      },
      setRevetmentStability: (updates) => set((state) => ({ revetmentStability: { ...state.revetmentStability, ...updates } })),
      jettyCurrent: {
        data: [], activeItemId: null, showCurrentSpeed: true, showEddyIntensity: true, showSedimentDeposition: false, open: false, statusFilter: '',
      },
      setJettyCurrent: (updates) => set((state) => ({ jettyCurrent: { ...state.jettyCurrent, ...updates } })),
      beachNourishment: {
        data: [], activeItemId: null, showFillVolume: true, showRetentionRate: true, showShorelineChange: false, open: false, statusFilter: '',
      },
      setBeachNourishment: (updates) => set((state) => ({ beachNourishment: { ...state.beachNourishment, ...updates } })),
      coastalArmor: {
        data: [], activeItemId: null, showArmorWeight: true, showDisplacementRate: true, showWaveRunup: false, open: false, statusFilter: '',
      },
      setCoastalArmor: (updates) => set((state) => ({ coastalArmor: { ...state.coastalArmor, ...updates } })),
      shorelineRetreat: {
        data: [], activeItemId: null, showRetreatRate: true, showCliffHeight: true, showWaveEnergy: false, open: false, statusFilter: '',
      },
      setShorelineRetreat: (updates) => set((state) => ({ shorelineRetreat: { ...state.shorelineRetreat, ...updates } })),

      // Task 100: Soil Science and Pedology
      soilOrganicCarbon: {
        data: [], activeItemId: null, showCarbonContent: true, showBulkDensity: true, showDecompositionRate: false, open: false, statusFilter: '',
      },
      setSoilOrganicCarbon: (updates) => set((state) => ({ soilOrganicCarbon: { ...state.soilOrganicCarbon, ...updates } })),
      cationExchange: {
        data: [], activeItemId: null, showCec: true, showBaseSaturation: true, showPhLevel: false, open: false, statusFilter: '',
      },
      setCationExchange: (updates) => set((state) => ({ cationExchange: { ...state.cationExchange, ...updates } })),
      soilPhosphorus: {
        data: [], activeItemId: null, showAvailableP: true, showTotalP: true, showRetentionCapacity: false, open: false, statusFilter: '',
      },
      setSoilPhosphorus: (updates) => set((state) => ({ soilPhosphorus: { ...state.soilPhosphorus, ...updates } })),
      soilCompaction: {
        data: [], activeItemId: null, showPenetrationResistance: true, showBulkDensity: true, showPorosity: false, open: false, statusFilter: '',
      },
      setSoilCompaction: (updates) => set((state) => ({ soilCompaction: { ...state.soilCompaction, ...updates } })),
      clayMineral: {
        data: [], activeItemId: null, showSwellPotential: true, showPlasticityIndex: true, showShrinkageLimit: false, open: false, statusFilter: '',
      },
      setClayMineral: (updates) => set((state) => ({ clayMineral: { ...state.clayMineral, ...updates } })),
      podzolProfile: {
        data: [], activeItemId: null, showEluviationDepth: true, showIlluviationDepth: true, showOrganicLayer: false, open: false, statusFilter: '',
      },
      setPodzolProfile: (updates) => set((state) => ({ podzolProfile: { ...state.podzolProfile, ...updates } })),
      gleyRedox: {
        data: [], activeItemId: null, showRedoxPotential: true, showWaterTableDepth: true, showIronReduction: false, open: false, statusFilter: '',
      },
      setGleyRedox: (updates) => set((state) => ({ gleyRedox: { ...state.gleyRedox, ...updates } })),
      calcicHorizon: {
        data: [], activeItemId: null, showCaco3Content: true, showHorizonDepth: true, showNoduleDensity: false, open: false, statusFilter: '',
      },
      setCalcicHorizon: (updates) => set((state) => ({ calcicHorizon: { ...state.calcicHorizon, ...updates } })),

      // Task 101: Mineral Resources and Mining
      oreGradeAssay: {
        data: [], activeItemId: null, showMetalGrade: true, showCutoffGrade: true, showRecoveryRate: false, open: false, statusFilter: '',
      },
      setOreGradeAssay: (updates) => set((state) => ({ oreGradeAssay: { ...state.oreGradeAssay, ...updates } })),
      mineTailingsDam: {
        data: [], activeItemId: null, showDamHeight: true, showStorageVolume: true, showPhreaticLevel: false, open: false, statusFilter: '',
      },
      setMineTailingsDam: (updates) => set((state) => ({ mineTailingsDam: { ...state.mineTailingsDam, ...updates } })),
      mineralVeinThickness: {
        data: [], activeItemId: null, showVeinWidth: true, showOreMineral: true, showDepthExtent: false, open: false, statusFilter: '',
      },
      setMineralVeinThickness: (updates) => set((state) => ({ mineralVeinThickness: { ...state.mineralVeinThickness, ...updates } })),
      stripMineRatio: {
        data: [], activeItemId: null, showStripRatio: true, showOverburdenDepth: true, showOreThickness: false, open: false, statusFilter: '',
      },
      setStripMineRatio: (updates) => set((state) => ({ stripMineRatio: { ...state.stripMineRatio, ...updates } })),
      undergroundMineVent: {
        data: [], activeItemId: null, showAirflowRate: true, showMethaneLevel: true, showTemperature: false, open: false, statusFilter: '',
      },
      setUndergroundMineVent: (updates) => set((state) => ({ undergroundMineVent: { ...state.undergroundMineVent, ...updates } })),
      acidMineDrainage: {
        data: [], activeItemId: null, showPH: true, showIronConcentration: true, showSulfateLevel: false, open: false, statusFilter: '',
      },
      setAcidMineDrainage: (updates) => set((state) => ({ acidMineDrainage: { ...state.acidMineDrainage, ...updates } })),
      oreReserveEstimate: {
        data: [], activeItemId: null, showProvenReserve: true, showProbableReserve: true, showResourceGrade: false, open: false, statusFilter: '',
      },
      setOreReserveEstimate: (updates) => set((state) => ({ oreReserveEstimate: { ...state.oreReserveEstimate, ...updates } })),
      mineralDepositGrade: {
        data: [], activeItemId: null, showDepositTonnes: true, showAverageGrade: true, showContainedMetal: false, open: false, statusFilter: '',
      },
      setMineralDepositGrade: (updates) => set((state) => ({ mineralDepositGrade: { ...state.mineralDepositGrade, ...updates } })),

      // Task 102: Ocean Circulation and Currents
      thermohalineCell: {
        data: [], activeItemId: null, showOverturningRate: true, showTemperature: true, showSalinity: false, open: false, statusFilter: '',
      },
      setThermohalineCell: (updates) => set((state) => ({ thermohalineCell: { ...state.thermohalineCell, ...updates } })),
      ekmanTransport: {
        data: [], activeItemId: null, showTransportAngle: true, showWindSpeed: true, showSurfaceVelocity: false, open: false, statusFilter: '',
      },
      setEkmanTransport: (updates) => set((state) => ({ ekmanTransport: { ...state.ekmanTransport, ...updates } })),
      geostrophicCurrent: {
        data: [], activeItemId: null, showCurrentSpeed: true, showPressureGradient: true, showCoriolisEffect: false, open: false, statusFilter: '',
      },
      setGeostrophicCurrent: (updates) => set((state) => ({ geostrophicCurrent: { ...state.geostrophicCurrent, ...updates } })),
      upwellingIntensity: {
        data: [], activeItemId: null, showUpwellingVelocity: true, showSstAnomaly: true, showChlorophyllConcentration: false, open: false, statusFilter: '',
      },
      setUpwellingIntensity: (updates) => set((state) => ({ upwellingIntensity: { ...state.upwellingIntensity, ...updates } })),
      westernBoundary: {
        data: [], activeItemId: null, showPeakVelocity: true, showTransportVolume: true, showMeanderAmplitude: false, open: false, statusFilter: '',
      },
      setWesternBoundary: (updates) => set((state) => ({ westernBoundary: { ...state.westernBoundary, ...updates } })),
      deepWaterFormation: {
        data: [], activeItemId: null, showConvectionDepth: true, showDensityAnomaly: true, showFormationRate: false, open: false, statusFilter: '',
      },
      setDeepWaterFormation: (updates) => set((state) => ({ deepWaterFormation: { ...state.deepWaterFormation, ...updates } })),
      oceanGyre: {
        data: [], activeItemId: null, showRotationPeriod: true, showDiameter: true, showEddyKineticEnergy: false, open: false, statusFilter: '',
      },
      setOceanGyre: (updates) => set((state) => ({ oceanGyre: { ...state.oceanGyre, ...updates } })),
      tropicalCurrent: {
        data: [], activeItemId: null, showCurrentSpeed: true, showTemperature: true, showFreshwaterFlux: false, open: false, statusFilter: '',
      },
      setTropicalCurrent: (updates) => set((state) => ({ tropicalCurrent: { ...state.tropicalCurrent, ...updates } })),

      // Task 103: Atmospheric Dynamics and Weather
      jetStreamPosition: {
        data: [], activeItemId: null, showLatitudePosition: true, showWindSpeed: true, showMeanderIndex: false, open: false, statusFilter: '',
      },
      setJetStreamPosition: (updates) => set((state) => ({ jetStreamPosition: { ...state.jetStreamPosition, ...updates } })),
      atmosphericPressureCell: {
        data: [], activeItemId: null, showCentralPressure: true, showCellDiameter: true, showPressureGradient: false, open: false, statusFilter: '',
      },
      setAtmosphericPressureCell: (updates) => set((state) => ({ atmosphericPressureCell: { ...state.atmosphericPressureCell, ...updates } })),
      tropopauseHeight: {
        data: [], activeItemId: null, showTropopauseHeight: true, showTemperatureLapse: true, showTropopausePressure: false, open: false, statusFilter: '',
      },
      setTropopauseHeight: (updates) => set((state) => ({ tropopauseHeight: { ...state.tropopauseHeight, ...updates } })),
      rossbyWaveAmplitude: {
        data: [], activeItemId: null, showWaveAmplitude: true, showWavenumber: true, showPhaseSpeed: false, open: false, statusFilter: '',
      },
      setRossbyWaveAmplitude: (updates) => set((state) => ({ rossbyWaveAmplitude: { ...state.rossbyWaveAmplitude, ...updates } })),
      hadleyCellCirculation: {
        data: [], activeItemId: null, showCirculationStrength: true, showUpdraftVelocity: true, showOutflowHeight: false, open: false, statusFilter: '',
      },
      setHadleyCellCirculation: (updates) => set((state) => ({ hadleyCellCirculation: { ...state.hadleyCellCirculation, ...updates } })),
      atmosphericRiverFlow: {
        data: [], activeItemId: null, showMoistureFlux: true, showIntegratedVapor: true, showWindSpeed: false, open: false, statusFilter: '',
      },
      setAtmosphericRiverFlow: (updates) => set((state) => ({ atmosphericRiverFlow: { ...state.atmosphericRiverFlow, ...updates } })),
      polarFrontJet: {
        data: [], activeItemId: null, showJetSpeed: true, showFrontalContrast: true, showBaroclinicity: false, open: false, statusFilter: '',
      },
      setPolarFrontJet: (updates) => set((state) => ({ polarFrontJet: { ...state.polarFrontJet, ...updates } })),
      tradeWindBelt: {
        data: [], activeItemId: null, showWindSpeed: true, showConvergenceZone: true, showConsistency: false, open: false, statusFilter: '',
      },
      setTradeWindBelt: (updates) => set((state) => ({ tradeWindBelt: { ...state.tradeWindBelt, ...updates } })),

      // Task 104: Biogeography and Ecosystem
      speciesMigrationRoute: {
        data: [], activeItemId: null, showMigratoryDistance: true, showPopulationSize: true, showTimingShift: false, open: false, statusFilter: '',
      },
      setSpeciesMigrationRoute: (updates) => set((state) => ({ speciesMigrationRoute: { ...state.speciesMigrationRoute, ...updates } })),
      habitatCorridor: {
        data: [], activeItemId: null, showCorridorWidth: true, showConnectivityIndex: true, showBarrierCount: false, open: false, statusFilter: '',
      },
      setHabitatCorridor: (updates) => set((state) => ({ habitatCorridor: { ...state.habitatCorridor, ...updates } })),
      endemicHotspot: {
        data: [], activeItemId: null, showEndemicSpeciesCount: true, showThreatLevel: true, showProtectionCoverage: false, open: false, statusFilter: '',
      },
      setEndemicHotspot: (updates) => set((state) => ({ endemicHotspot: { ...state.endemicHotspot, ...updates } })),
      keystonePopulation: {
        data: [], activeItemId: null, showPopulationDensity: true, showReproductionRate: true, showEcosystemImpact: false, open: false, statusFilter: '',
      },
      setKeystonePopulation: (updates) => set((state) => ({ keystonePopulation: { ...state.keystonePopulation, ...updates } })),
      wildlifeCorridor: {
        data: [], activeItemId: null, showCorridorLength: true, showSpeciesUsing: true, showCrossingEvents: false, open: false, statusFilter: '',
      },
      setWildlifeCorridor: (updates) => set((state) => ({ wildlifeCorridor: { ...state.wildlifeCorridor, ...updates } })),
      biomeTransition: {
        data: [], activeItemId: null, showTransitionWidth: true, showSpeciesTurnover: true, showShiftRate: false, open: false, statusFilter: '',
      },
      setBiomeTransition: (updates) => set((state) => ({ biomeTransition: { ...state.biomeTransition, ...updates } })),
      forestCanopyCover: {
        data: [], activeItemId: null, showCanopyDensity: true, showLeafAreaIndex: true, showCarbonStock: false, open: false, statusFilter: '',
      },
      setForestCanopyCover: (updates) => set((state) => ({ forestCanopyCover: { ...state.forestCanopyCover, ...updates } })),
      wetlandBiodiversityIndex: {
        data: [], activeItemId: null, showSpeciesRichness: true, showShannonIndex: true, showWaterQuality: false, open: false, statusFilter: '',
      },
      setWetlandBiodiversityIndex: (updates) => set((state) => ({ wetlandBiodiversityIndex: { ...state.wetlandBiodiversityIndex, ...updates } })),

      // Task 105: Hydrology and Watershed
      watershedDischarge: {
        data: [], activeItemId: null, showDischargeRate: true, showDrainageArea: true, showRunoffCoefficient: false, open: false, statusFilter: '',
      },
      setWatershedDischarge: (updates) => set((state) => ({ watershedDischarge: { ...state.watershedDischarge, ...updates } })),
      aquiferRechargeRate: {
        data: [], activeItemId: null, showRechargeRate: true, showWaterTableDepth: true, showPermeability: false, open: false, statusFilter: '',
      },
      setAquiferRechargeRate: (updates) => set((state) => ({ aquiferRechargeRate: { ...state.aquiferRechargeRate, ...updates } })),
      floodInundationMap: {
        data: [], activeItemId: null, showFloodDepth: true, showReturnPeriod: true, showAffectedArea: false, open: false, statusFilter: '',
      },
      setFloodInundationMap: (updates) => set((state) => ({ floodInundationMap: { ...state.floodInundationMap, ...updates } })),
      riverSedimentLoad: {
        data: [], activeItemId: null, showSuspendedLoad: true, showBedloadTransport: true, showTurbidity: false, open: false, statusFilter: '',
      },
      setRiverSedimentLoad: (updates) => set((state) => ({ riverSedimentLoad: { ...state.riverSedimentLoad, ...updates } })),
      groundwaterTableLevel: {
        data: [], activeItemId: null, showWaterLevel: true, showTrendRate: true, showAquiferType: false, open: false, statusFilter: '',
      },
      setGroundwaterTableLevel: (updates) => set((state) => ({ groundwaterTableLevel: { ...state.groundwaterTableLevel, ...updates } })),
      snowpackWaterEquivalent: {
        data: [], activeItemId: null, showSweValue: true, showSnowDepth: true, showMeltRate: false, open: false, statusFilter: '',
      },
      setSnowpackWaterEquivalent: (updates) => set((state) => ({ snowpackWaterEquivalent: { ...state.snowpackWaterEquivalent, ...updates } })),
      reservoirStorageLevel: {
        data: [], activeItemId: null, showStorageLevel: true, showInflowRate: true, showOutflowRate: false, open: false, statusFilter: '',
      },
      setReservoirStorageLevel: (updates) => set((state) => ({ reservoirStorageLevel: { ...state.reservoirStorageLevel, ...updates } })),
      baseflowIndex: {
        data: [], activeItemId: null, showBaseflowRatio: true, showTotalFlow: true, showGroundwaterContribution: false, open: false, statusFilter: '',
      },
      setBaseflowIndex: (updates) => set((state) => ({ baseflowIndex: { ...state.baseflowIndex, ...updates } })),

      // Task 106: Cryosphere Dynamics
      iceShelfThickness: {
        data: [], activeItemId: null, showShelfThickness: true, showBasalMeltRate: true, showRiftLength: false, open: false, statusFilter: '',
      },
      setIceShelfThickness: (updates) => set((state) => ({ iceShelfThickness: { ...state.iceShelfThickness, ...updates } })),
      seaIceExtent: {
        data: [], activeItemId: null, showIceConcentration: true, showExtentAnomaly: true, showIceAge: false, open: false, statusFilter: '',
      },
      setSeaIceExtent: (updates) => set((state) => ({ seaIceExtent: { ...state.seaIceExtent, ...updates } })),
      glacierMassBalance: {
        data: [], activeItemId: null, showMassBalance: true, showEquilibriumLine: true, showAccumulationRatio: false, open: false, statusFilter: '',
      },
      setGlacierMassBalance: (updates) => set((state) => ({ glacierMassBalance: { ...state.glacierMassBalance, ...updates } })),
      permafrostActiveLayer: {
        data: [], activeItemId: null, showActiveLayerDepth: true, showGroundTemperature: true, showThawRate: false, open: false, statusFilter: '',
      },
      setPermafrostActiveLayer: (updates) => set((state) => ({ permafrostActiveLayer: { ...state.permafrostActiveLayer, ...updates } })),
      iceCoreRecord: {
        data: [], activeItemId: null, showCoreDepth: true, showOldestIceAge: true, showCo2Concentration: false, open: false, statusFilter: '',
      },
      setIceCoreRecord: (updates) => set((state) => ({ iceCoreRecord: { ...state.iceCoreRecord, ...updates } })),
      snowCoverDuration: {
        data: [], activeItemId: null, showSnowDays: true, showSnowOnsetDate: true, showSnowMeltDate: false, open: false, statusFilter: '',
      },
      setSnowCoverDuration: (updates) => set((state) => ({ snowCoverDuration: { ...state.snowCoverDuration, ...updates } })),
      frostThawCycle: {
        data: [], activeItemId: null, showFreezeThawCycles: true, showFrostDepth: true, showHeaveMagnitude: false, open: false, statusFilter: '',
      },
      setFrostThawCycle: (updates) => set((state) => ({ frostThawCycle: { ...state.frostThawCycle, ...updates } })),
      icebergCalving: {
        data: [], activeItemId: null, showCalvingRate: true, showIcebergSize: true, showDriftSpeed: false, open: false, statusFilter: '',
      },
      setIcebergCalving: (updates) => set((state) => ({ icebergCalving: { ...state.icebergCalving, ...updates } })),

      // Task 107: Space Weather and Geomagnetism
      magnetopauseStandoff: {
        data: [], activeItemId: null, showStandoffDistance: true, showSolarWindPressure: true, showMagneticFieldBz: false, open: false, statusFilter: '',
      },
      setMagnetopauseStandoff: (updates) => set((state) => ({ magnetopauseStandoff: { ...state.magnetopauseStandoff, ...updates } })),
      auroraOvalPosition: {
        data: [], activeItemId: null, showOvalLatitude: true, showKpIndex: true, showVisibilityProbability: false, open: false, statusFilter: '',
      },
      setAuroraOvalPosition: (updates) => set((state) => ({ auroraOvalPosition: { ...state.auroraOvalPosition, ...updates } })),
      vanAllenRadiation: {
        data: [], activeItemId: null, showProtonFlux: true, showElectronFlux: true, showBeltAltitude: false, open: false, statusFilter: '',
      },
      setVanAllenRadiation: (updates) => set((state) => ({ vanAllenRadiation: { ...state.vanAllenRadiation, ...updates } })),
      ionosphericDisturbance: {
        data: [], activeItemId: null, showTecValue: true, showScintillationIndex: true, showF2LayerFrequency: false, open: false, statusFilter: '',
      },
      setIonosphericDisturbance: (updates) => set((state) => ({ ionosphericDisturbance: { ...state.ionosphericDisturbance, ...updates } })),
      cosmicRayFlux: {
        data: [], activeItemId: null, showNeutronCount: true, showMuonFlux: true, showSolarModulation: false, open: false, statusFilter: '',
      },
      setCosmicRayFlux: (updates) => set((state) => ({ cosmicRayFlux: { ...state.cosmicRayFlux, ...updates } })),
      solarFluxIndex: {
        data: [], activeItemId: null, showF107Index: true, showSunspotNumber: true, showSolarCyclePhase: false, open: false, statusFilter: '',
      },
      setSolarFluxIndex: (updates) => set((state) => ({ solarFluxIndex: { ...state.solarFluxIndex, ...updates } })),
      spaceRadiationDose: {
        data: [], activeItemId: null, showDoseRate: true, showParticleEnergy: true, showShieldingEffectiveness: false, open: false, statusFilter: '',
      },
      setSpaceRadiationDose: (updates) => set((state) => ({ spaceRadiationDose: { ...state.spaceRadiationDose, ...updates } })),
      satelliteDrag: {
        data: [], activeItemId: null, showOrbitalDecay: true, showAtmosphericDensity: true, showAltitude: false, open: false, statusFilter: '',
      },
      setSatelliteDrag: (updates) => set((state) => ({ satelliteDrag: { ...state.satelliteDrag, ...updates } })),

      // Task 108: Urban Infrastructure & Smart City
      trafficFlowMonitor: {
        data: [], activeItemId: null, showAverageSpeed: true, showCongestionIndex: true, showVehicleCount: false, showTravelTime: false, open: false, statusFilter: '',
      },
      setTrafficFlowMonitor: (updates) => set((state) => ({ trafficFlowMonitor: { ...state.trafficFlowMonitor, ...updates } })),
      bridgeStructuralHealth: {
        data: [], activeItemId: null, showStructuralStress: true, showVibrationLevel: true, showLoadCapacity: false, showCorrosionIndex: false, open: false, statusFilter: '',
      },
      setBridgeStructuralHealth: (updates) => set((state) => ({ bridgeStructuralHealth: { ...state.bridgeStructuralHealth, ...updates } })),
      waterPipeNetwork: {
        data: [], activeItemId: null, showPressureLevel: true, showFlowRate: true, showLeakDetection: false, showWaterQuality: false, open: false, statusFilter: '',
      },
      setWaterPipeNetwork: (updates) => set((state) => ({ waterPipeNetwork: { ...state.waterPipeNetwork, ...updates } })),
      powerGridLoad: {
        data: [], activeItemId: null, showGridLoad: true, showPeakDemand: true, showFrequency: false, showReserveMargin: false, open: false, statusFilter: '',
      },
      setPowerGridLoad: (updates) => set((state) => ({ powerGridLoad: { ...state.powerGridLoad, ...updates } })),
      wasteCollectionRoute: {
        data: [], activeItemId: null, showCollectionRate: true, showRouteEfficiency: true, showFillLevel: false, showRecyclingRate: false, open: false, statusFilter: '',
      },
      setWasteCollectionRoute: (updates) => set((state) => ({ wasteCollectionRoute: { ...state.wasteCollectionRoute, ...updates } })),
      airQualityUrban: {
        data: [], activeItemId: null, showAqiIndex: true, showPm25Level: true, showNo2Level: false, showO3Level: false, open: false, statusFilter: '',
      },
      setAirQualityUrban: (updates) => set((state) => ({ airQualityUrban: { ...state.airQualityUrban, ...updates } })),
      noiseLevelMapper: {
        data: [], activeItemId: null, showAvgDecibels: true, showPeakLevel: true, showQuietZonePercent: false, showNightLevel: false, open: false, statusFilter: '',
      },
      setNoiseLevelMapper: (updates) => set((state) => ({ noiseLevelMapper: { ...state.noiseLevelMapper, ...updates } })),
      smartParkingCapacity: {
        data: [], activeItemId: null, showOccupancyRate: true, showAvailableSpots: true, showAvgDuration: false, showTurnoverRate: false, open: false, statusFilter: '',
      },
      setSmartParkingCapacity: (updates) => set((state) => ({ smartParkingCapacity: { ...state.smartParkingCapacity, ...updates } })),

      // Task 109: Agricultural Monitoring & Precision Farming
      cropHealthIndex: {
        data: [], activeItemId: null, showNdviIndex: true, showCropStress: true, showGrowthStage: false, showCoveragePercent: false, open: false, statusFilter: '',
      },
      setCropHealthIndex: (updates) => set((state) => ({ cropHealthIndex: { ...state.cropHealthIndex, ...updates } })),
      soilMoistureField: {
        data: [], activeItemId: null, showMoisturePercent: true, showFieldCapacity: true, showWiltingPoint: false, showAvailableWater: false, open: false, statusFilter: '',
      },
      setSoilMoistureField: (updates) => set((state) => ({ soilMoistureField: { ...state.soilMoistureField, ...updates } })),
      irrigationEfficiency: {
        data: [], activeItemId: null, showApplicationRate: true, showDistributionPercent: true, showConveyancePercent: false, showOverallEfficiency: false, open: false, statusFilter: '',
      },
      setIrrigationEfficiency: (updates) => set((state) => ({ irrigationEfficiency: { ...state.irrigationEfficiency, ...updates } })),
      pestOutbreakTracker: {
        data: [], activeItemId: null, showRiskLevel: true, showSpreadRate: true, showAffectedArea: false, showControlEfficiency: false, open: false, statusFilter: '',
      },
      setPestOutbreakTracker: (updates) => set((state) => ({ pestOutbreakTracker: { ...state.pestOutbreakTracker, ...updates } })),
      fertilizerRunoff: {
        data: [], activeItemId: null, showNitrogenLoad: true, showPhosphorusLoad: true, showNitrateLevel: false, showEutrophicationIndex: false, open: false, statusFilter: '',
      },
      setFertilizerRunoff: (updates) => set((state) => ({ fertilizerRunoff: { ...state.fertilizerRunoff, ...updates } })),
      harvestYieldPredict: {
        data: [], activeItemId: null, showYieldForecast: true, showAreaHarvested: true, showProductionEst: false, showYieldGap: false, open: false, statusFilter: '',
      },
      setHarvestYieldPredict: (updates) => set((state) => ({ harvestYieldPredict: { ...state.harvestYieldPredict, ...updates } })),
      greenhouseClimate: {
        data: [], activeItemId: null, showTemperature: true, showHumidity: true, showCo2Level: false, showLightPAR: false, open: false, statusFilter: '',
      },
      setGreenhouseClimate: (updates) => set((state) => ({ greenhouseClimate: { ...state.greenhouseClimate, ...updates } })),
      livestockMovement: {
        data: [], activeItemId: null, showHerdCount: true, showAvgSpeed: true, showGrazingArea: false, showHealthIndex: false, open: false, statusFilter: '',
      },
      setLivestockMovement: (updates) => set((state) => ({ livestockMovement: { ...state.livestockMovement, ...updates } })),

      // Dialog states (moved from local useState in page.tsx for lazy loading)
      addLocationDialogOpen: false,
      setAddLocationDialogOpen: (open) => set({ addLocationDialogOpen: open }),
      shortcutsDialogOpen: false,
      setShortcutsDialogOpen: (open) => set({ shortcutsDialogOpen: open }),
      coordInputDialogOpen: false,
      setCoordInputDialogOpen: (open) => set({ coordInputDialogOpen: open }),
      exportDialogOpen: false,
      setExportDialogOpen: (open) => set({ exportDialogOpen: open }),
      bookmarkManagerOpen: false,
      setBookmarkManagerOpen: (open) => set({ bookmarkManagerOpen: open }),
      shareDialogOpen: false,
      setShareDialogOpen: (open) => set({ shareDialogOpen: open }),
      geofenceDialogOpen: false,
      setGeofenceDialogOpen: (open) => set({ geofenceDialogOpen: open }),
      aiSuggestionsOpen: false,
      setAiSuggestionsOpen: (open) => set({ aiSuggestionsOpen: open }),
      distanceMatrixOpen: false,
      setDistanceMatrixOpen: (open) => set({ distanceMatrixOpen: open }),
      styleGalleryOpen: false,
      setStyleGalleryOpen: (open) => set({ styleGalleryOpen: open }),

      // Style Switcher open state
      styleSwitcherOpen: false,
      setStyleSwitcherOpen: (open) => set({ styleSwitcherOpen: open }),

      // Language Selector open state
      languageSelectorOpen: false,
      setLanguageSelectorOpen: (open) => set({ languageSelectorOpen: open }),

      // Notification Center open state
      notificationCenterOpen: false,
      setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),

      // Route Analytics open state
      routeAnalyticsOpen: false,
      setRouteAnalyticsOpen: (open) => set({ routeAnalyticsOpen: open }),

      // Collaboration open state
      collaborationOpen: false,
      setCollaborationOpen: (open) => set({ collaborationOpen: open }),

      // Coordinate Converter open state
      coordinateConverterOpen: false,
      setCoordinateConverterOpen: (open) => set({ coordinateConverterOpen: open }),

      // Spatial Analysis panel state
      spatialAnalysisOpen: false,
      setSpatialAnalysisOpen: (open) => set({ spatialAnalysisOpen: open }),

      // Map Stats Panel open state
      statsPanelOpen: false,
      setStatsPanelOpen: (open) => set({ statsPanelOpen: open }),

      // Map Legend open state
      legendOpen: false,
      setLegendOpen: (open) => set({ legendOpen: open }),

      // Mini Map enabled state
      miniMapEnabled: true,
      setMiniMapEnabled: (enabled) => set({ miniMapEnabled: enabled }),
    }),
    {
      name: 'maplibre-explorer-prefs',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        clusteringEnabled: state.clusteringEnabled,
        weatherEnabled: state.weatherEnabled,
        trafficEnabled: state.trafficEnabled,
        earthquakesEnabled: state.earthquakesEnabled,
        sunPositionEnabled: state.sunPositionEnabled,
        isochroneEnabled: state.isochroneEnabled,
        isochroneMinutes: state.isochroneMinutes,
        isochroneMode: state.isochroneMode,
        terrainEnabled: state.terrainEnabled,
        buildingExtrusion: state.buildingExtrusion,
        buildings3DEnabled: state.buildings3DEnabled,
        selectedMarkerIcon: state.selectedMarkerIcon,
        terrainExaggeration: state.terrainExaggeration,
        layerVisibility: state.layerVisibility,
        drawColor: state.drawColor,
        drawWidth: state.drawWidth,
        heatmapEnabled: state.heatmapEnabled,
        heatmapIntensity: state.heatmapIntensity,
        heatmapRadius: state.heatmapRadius,
        comparisonEnabled: state.comparisonEnabled,
        comparisonStyle: state.comparisonStyle,
        bookmarkFolders: state.bookmarkFolders,
        annotations: state.annotations,
        offlineModeEnabled: state.offlineModeEnabled,
        customTileSources: state.customTileSources,
        wmsTileSources: state.wmsTileSources,
        trackStatsPanelOpen: state.trackStatsPanelOpen,
        voiceNavigationEnabled: state.voiceNavigationEnabled,
        voiceLanguage: state.voiceLanguage,
        drawingTool: state.drawingTool,
        drawingColor: state.drawingColor,
        drawingLineWidth: state.drawingLineWidth,
        drawnFeatures: state.drawnFeatures,
        routeProfile: state.routeProfile,
        savedTracks: state.savedTracks,
        geofences: state.geofences,
        language: state.language,
        appNotifications: state.appNotifications,
        snapshots: state.snapshots,
        comparedRoutes: state.comparedRoutes,
        highContrastMode: state.highContrastMode,
        largeTextMode: state.largeTextMode,
        reducedMotionMode: state.reducedMotionMode,
        screenReaderMode: state.screenReaderMode,
        colorBlindMode: state.colorBlindMode,
        mapThemeOverrides: state.mapThemeOverrides,
        mapThemePreset: state.mapThemePreset,
        imageOverlays: state.imageOverlays,
        spatialResults: state.spatialResults,
        collapsedSections: state.collapsedSections,
        mapHistory: state.mapHistory,
        timelineOpen: state.timelineOpen,
        searchHistory: state.searchHistory,
        routeOptimized: state.routeOptimized,
        originalRoutePoints: state.originalRoutePoints,
        toolUsageHistory: state.toolUsageHistory,
        sessionStartTime: state.sessionStartTime,
        tripPlans: state.tripPlans,
        gpsSimulation: state.gpsSimulation,
        mapNotes: state.mapNotes,
        poiFilters: state.poiFilters,
        poiFilterPresets: state.poiFilterPresets,
        markerCategories: state.markerCategories,
        styleMixLayers: state.styleMixLayers,
        speedZones: state.speedZones,
        speedLimit: state.speedLimit,
        routePlayback: state.routePlayback,
        mapStories: state.mapStories,
        activeStoryId: state.activeStoryId,
        terrainProfile3D: state.terrainProfile3D,
        importExportState: state.importExportState,
        geofenceEvents: state.geofenceEvents,
        geofenceAlertsEnabled: state.geofenceAlertsEnabled,
        coordinateGrid: state.coordinateGrid,
        mapOverlays: state.mapOverlays,
        timelineEvents: state.timelineEvents,
        weatherCompareLocations: state.weatherCompareLocations,
        measurementSuite: state.measurementSuite,
        savedScreenshots: state.savedScreenshots,
        pedometer: state.pedometer,
        usageStats: state.usageStats,
        mapCollage: state.mapCollage,
        eventSearchRadius: state.eventSearchRadius,
        altitudeState: state.altitudeState,
        compassRose: state.compassRose,
        multiStopRoute: state.multiStopRoute,
        temperatureUnit: state.temperatureUnit,
        sunShadowState: state.sunShadowState,
        svgMarkerDesigns: state.svgMarkerDesigns,
        activeMarkerDesign: state.activeMarkerDesign,
        shareCardState: state.shareCardState,
        wallpaperState: state.wallpaperState,
        chatMessages: state.chatMessages,
        poiHeatmap: state.poiHeatmap,
        animationStudio: state.animationStudio,
        smartRoute: state.smartRoute,
        dataVisualizer: state.dataVisualizer,
        fieldSurvey: state.fieldSurvey,
        emergencyRoute: state.emergencyRoute,
        comparisonSlider: state.comparisonSlider,
        noiseHeatmap: state.noiseHeatmap,
        solarExposure: state.solarExposure,
        styleForge: state.styleForge,
        topoProfiler: state.topoProfiler,
        maritimeNav: state.maritimeNav,
        geocaching: state.geocaching,
        atmospheric: state.atmospheric,
        wildlifeTracker: state.wildlifeTracker,
        culturalHeritage: state.culturalHeritage,
        hydrology: state.hydrology,
        glacierMonitor: state.glacierMonitor,
        seismicActivity: state.seismicActivity,
        soilAnalysis: state.soilAnalysis,
        urbanGrowth: state.urbanGrowth,
        airspaceNav: state.airspaceNav,
        reefHealth: state.reefHealth,
        magneticField: state.magneticField,
        floodRisk: state.floodRisk,
        volcanoMonitor: state.volcanoMonitor,
        avalancheRisk: state.avalancheRisk,
        cropHealth: state.cropHealth,
        spaceTrack: state.spaceTrack,
        archaeologyMap: state.archaeologyMap,
        pollutionTracker: state.pollutionTracker,
        tidalPredictor: state.tidalPredictor,
        windFarm: state.windFarm,
        desertification: state.desertification,
        mineralExploration: state.mineralExploration,
        oceanCurrent: state.oceanCurrent,
        permafrost: state.permafrost,
        lightning: state.lightning,
        biome: state.biome,
        groundwater: state.groundwater,
        solarPower: state.solarPower,
        volcanicAsh: state.volcanicAsh,
        coastalErosion: state.coastalErosion,
        carbonFootprint: state.carbonFootprint,
        wildlifeMigration: state.wildlifeMigration,
        iceSheet: state.iceSheet,
        droughtMonitor: state.droughtMonitor,
        landSubsidence: state.landSubsidence,
        coralBleachingMonitor: state.coralBleachingMonitor,
        tsunamiAlert: state.tsunamiAlert,
        soilErosion: state.soilErosion,
        watershedManager: state.watershedManager,
        tectonicPlate: state.tectonicPlate,
        airQualityForecaster: state.airQualityForecaster,
        glacialLake: state.glacialLake,
        spaceWeather: state.spaceWeather,
        peatlandMonitor: state.peatlandMonitor,
        mangroveMonitor: state.mangroveMonitor,
        sandstormTracker: state.sandstormTracker,
        wetlandMapper: state.wetlandMapper,
        urbanHeatIsland: state.urbanHeatIsland,
        wildfireRisk: state.wildfireRisk,
        algalBloom: state.algalBloom,
        landslideRisk: state.landslideRisk,
        seaIceNavigator: state.seaIceNavigator,
        cloudCover: state.cloudCover,
        soilMoisture: state.soilMoisture,
        lightPollution: state.lightPollution,
        riverFlow: state.riverFlow,
        volcanoSeismic: state.volcanoSeismic,
        whaleMigration: state.whaleMigration,
        avalancheForecaster: state.avalancheForecaster,
        auroraForecaster: state.auroraForecaster,
        ozoneLayer: state.ozoneLayer,
        deforestation: state.deforestation,
        methaneEmissions: state.methaneEmissions,
        oceanAcidification: state.oceanAcidification,
        spaceDebris: state.spaceDebris,
        tectonicStrain: state.tectonicStrain,
        phytoBloom: state.phytoBloom,
        snowCover: state.snowCover,
        geomagneticStorm: state.geomagneticStorm,
        volcanicGas: state.volcanicGas,
        aquiferDepletion: state.aquiferDepletion,
        stratosphericWind: state.stratosphericWind,
        marineHeatwave: state.marineHeatwave,
        precipitation: state.precipitation,
        cosmicRay: state.cosmicRay,
        greenlandIce: state.greenlandIce,
        radiationExposure: state.radiationExposure,
        peatFire: state.peatFire,
        seaLevelRise: state.seaLevelRise,
        thermocline: state.thermocline,
        acidRain: state.acidRain,
        methaneHydrate: state.methaneHydrate,
        kelpForest: state.kelpForest,
        glof: state.glof,
        dustStorm: state.dustStorm,
        bioluminescence: state.bioluminescence,
        urbanSprawl: state.urbanSprawl,
        viralOutbreak: state.viralOutbreak,
        magnetosphere: state.magnetosphere,
        fogDensity: state.fogDensity,
        carbonCapture: state.carbonCapture,
        hailStorm: state.hailStorm,
        saharaReforestation: state.saharaReforestation,
        deepSeaVent: state.deepSeaVent,
        stormSurge: state.stormSurge,
        landfillMonitor: state.landfillMonitor,
        salinityGradient: state.salinityGradient,
        microplastics: state.microplastics,
        radioSignal: state.radioSignal,
        volcanicIsland: state.volcanicIsland,
        permafrostThaw: state.permafrostThaw,
        oceanCurrentTracker: state.oceanCurrentTracker,
        spaceWeatherAlert: state.spaceWeatherAlert,
        desertMonitor: state.desertMonitor,
        tsunamiBuoy: state.tsunamiBuoy,
        glacierVelocity: state.glacierVelocity,
        earthquakeSwarm: state.earthquakeSwarm,
        mangroveRestoration: state.mangroveRestoration,
        coralBleachingMonitor: state.coralBleachingMonitor,
        arcticSeaIce: state.arcticSeaIce,
        landslideRisk: state.landslideRisk,
        airQuality: state.airQuality,
        soilMoistureAg: state.soilMoistureAg,
        noisePollution: state.noisePollution,
        lightPollutionSky: state.lightPollutionSky,
        groundwaterRecharge: state.groundwaterRecharge,
        subglacialLake: state.subglacialLake,
        thermokarstLake: state.thermokarstLake,
        paleoclimateProxy: state.paleoclimateProxy,
        gicMonitor: state.gicMonitor,
        sabkhaEnvironment: state.sabkhaEnvironment,
        cryosphereChange: state.cryosphereChange,
        abyssalPlain: state.abyssalPlain,
        fjordEcosystem: state.fjordEcosystem,
        geothermalSpring: state.geothermalSpring,
        asteroidImpact: state.asteroidImpact,
        desertOasis: state.desertOasis,
        volcanicLightning: state.volcanicLightning,
        iceCoreData: state.iceCoreData,
        stratosphericAerosol: state.stratosphericAerosol,
        megacityCarbon: state.megacityCarbon,
        oceanEddy: state.oceanEddy,
        supervolcano: state.supervolcano,
        polarVortex: state.polarVortex,
        karstAquifer: state.karstAquifer,
        subductionZone: state.subductionZone,
        tropopause: state.tropopause,
        invasiveSpecies: state.invasiveSpecies,
        tundraCarbon: state.tundraCarbon,
        monsoon: state.monsoon,
        lavaFlow: state.lavaFlow,
        tidalEnergy: state.tidalEnergy,
        peatFire: state.peatFire,
        coralSpawn: state.coralSpawn,
        glacierCalving: state.glacierCalving,
        soilCarbon: state.soilCarbon,
        urbanTreeCanopy: state.urbanTreeCanopy,
        geomagneticPole: state.geomagneticPole,
        hydrothermalVent: state.hydrothermalVent,
        watershedHealth: state.watershedHealth,
        migratoryFlyway: state.migratoryFlyway,
        seagrassMeadow: state.seagrassMeadow,
        urbanHeatIslandDetail: state.urbanHeatIslandDetail,
        oceanAcidificationDetail: state.oceanAcidificationDetail,
        desertificationDetail: state.desertificationDetail,
        volcanicGasTracker: state.volcanicGasTracker,
        deepOceanCurrent: state.deepOceanCurrent,
        stratosphericOzone: state.stratosphericOzone,
        seismicHarmonic: state.seismicHarmonic,
        wildfireSmoke: state.wildfireSmoke,
        estuaryHealth: state.estuaryHealth,
        alpineGlacier: state.alpineGlacier,
        oceanAnoxicZone: state.oceanAnoxicZone,
        permafrostCarbonFeedback: state.permafrostCarbonFeedback,
        tropicalCyclone: state.tropicalCyclone,
        volcanicDeformation: state.volcanicDeformation,
        coralReefBleachingDetail: state.coralReefBleachingDetail,
        arcticPermafrostLakes: state.arcticPermafrostLakes,
        methaneEmissionHotspot: state.methaneEmissionHotspot,
        coastalUpwelling: state.coastalUpwelling,
        spaceDebrisOrbit: state.spaceDebrisOrbit,
        tectonicPlateBoundary: state.tectonicPlateBoundary,
        landslideSusceptibility: state.landslideSusceptibility,
        solarFlareActivity: state.solarFlareActivity,
        riverDeltaErosion: state.riverDeltaErosion,
        seaIceThickness: state.seaIceThickness,
        urbanAirQuality: state.urbanAirQuality,
        geothermalEnergy: state.geothermalEnergy,
        aquiferSalinization: state.aquiferSalinization,
        biomassBurning: state.biomassBurning,
        glacialLakeOutburst: state.glacialLakeOutburst,
        oceanMicroplastic: state.oceanMicroplastic,
        volcanicAshDispersion: state.volcanicAshDispersion,
        droughtSeverity: state.droughtSeverity,
        tsunamiWaveHeight: state.tsunamiWaveHeight,
        caveEcosystem: state.caveEcosystem,
        solarIrradiance: state.solarIrradiance,
        peatlandRestoration: state.peatlandRestoration,
        mangroveCarbon: state.mangroveCarbon,
        oceanHeatContent: state.oceanHeatContent,
        dustStormTracker: state.dustStormTracker,
        coralDiseaseMonitor: state.coralDiseaseMonitor,
        iceShelfCollapse: state.iceShelfCollapse,
        urbanFloodRisk: state.urbanFloodRisk,
        phytoplanktonBloom: state.phytoplanktonBloom,
        submarineCanyon: state.submarineCanyon,
        kelpForestMonitor: state.kelpForestMonitor,
        volcanicIslandFormation: state.volcanicIslandFormation,
        saltwaterIntrusion: state.saltwaterIntrusion,
        arcticShippingRoute: state.arcticShippingRoute,
        thermoclineDepth: state.thermoclineDepth,
        bioluminescentBay: state.bioluminescentBay,
        orographicRainfall: state.orographicRainfall,
        hydrothermalPlume: state.hydrothermalPlume,
        seamountEcosystem: state.seamountEcosystem,
        groundSubsidence: state.groundSubsidence,
        oceanStratification: state.oceanStratification,
        snowCoverExtent: state.snowCoverExtent,
        coastalErosionDetail: state.coastalErosionDetail,
        ecosystemServiceValue: state.ecosystemServiceValue,
        tidalFlatMonitor: state.tidalFlatMonitor,
        wildfireRiskAssessment: state.wildfireRiskAssessment,
        karstSinkhole: state.karstSinkhole,
        volcanicSO2: state.volcanicSO2,
        icebergTracker: state.icebergTracker,
        caveMineral: state.caveMineral,
        seafloorHydrate: state.seafloorHydrate,
        mangroveLoss: state.mangroveLoss,
        urbanNoiseCorridor: state.urbanNoiseCorridor,
        stratosphericWarming: state.stratosphericWarming,
        submarineGroundwater: state.submarineGroundwater,
        hydrothermalSulfide: state.hydrothermalSulfide,
        lunarTidalForce: state.lunarTidalForce,
        ripCurrent: state.ripCurrent,
        avalancheDebrisFlow: state.avalancheDebrisFlow,
        coastalAcidification: state.coastalAcidification,
        desertSandSea: state.desertSandSea,
        subsidenceHazard: state.subsidenceHazard,
        volcanicLahar: state.volcanicLahar,
        deepWaterCoral: state.deepWaterCoral,
        polarBearHabitat: state.polarBearHabitat,
        soilSalinization: state.soilSalinization,
        tsunamiRunup: state.tsunamiRunup,
        urbanHeatVentilation: state.urbanHeatVentilation,
        brinePool: state.brinePool,
        supraglacialStream: state.supraglacialStream,
        methaneHydrateStability: state.methaneHydrateStability,
        volcanicAshCloud: state.volcanicAshCloud,
        geothermalGradient: state.geothermalGradient,
        oceanDeoxygenation: state.oceanDeoxygenation,
        rockGlacier: state.rockGlacier,
        dustHemisphere: state.dustHemisphere,
        microplasticOcean: state.microplasticOcean,
        glacierBasalSlide: state.glacierBasalSlide,
        volcanicFumarole: state.volcanicFumarole,
        hydroclimateExtremes: state.hydroclimateExtremes,
        megafaunaTracking: state.megafaunaTracking,
        cryoconiteHole: state.cryoconiteHole,
        sapFlow: state.sapFlow,
        rockfallHazard: state.rockfallHazard,
        thermohalineCirculation: state.thermohalineCirculation,
        hydroseismicActivity: state.hydroseismicActivity,
        lavaTubeCave: state.lavaTubeCave,
        submarineCanyonFisheries: state.submarineCanyonFisheries,
        polynyaIce: state.polynyaIce,
        volcanicDomeGrowth: state.volcanicDomeGrowth,
        seamountBiodiversity: state.seamountBiodiversity,
        estuaryAcidification: state.estuaryAcidification,
        abyssalSedimentFlux: state.abyssalSedimentFlux,
        glacialMoulin: state.glacialMoulin,
        iceShelfCalving: state.iceShelfCalving,
        volcanicGasPlume: state.volcanicGasPlume,
        submarineLandslide: state.submarineLandslide,
        coastalWetlandLoss: state.coastalWetlandLoss,
        tundraPermafrostThaw: state.tundraPermafrostThaw,
        oceanCurrentProfiler: state.oceanCurrentProfiler,
        desertificationFront: state.desertificationFront,
        coralReefRecovery: state.coralReefRecovery,
        methaneCrater: state.methaneCrater,
        subglacialVolcano: state.subglacialVolcano,
        coralSpawnPrediction: state.coralSpawnPrediction,
        hydrothermalDiffuseFlow: state.hydrothermalDiffuseFlow,
        permafrostCarbonPipeline: state.permafrostCarbonPipeline,
        subaqueousLavaFlow: state.subaqueousLavaFlow,
        intertidalZone: state.intertidalZone,
        desertFlashFlood: state.desertFlashFlood,
        mudVolcanoActivity: state.mudVolcanoActivity,
        glacierSurgeEvent: state.glacierSurgeEvent,
        seicheWaveOscillation: state.seicheWaveOscillation,
        laharFlowTracker: state.laharFlowTracker,
        icePenitentMonitor: state.icePenitentMonitor,
        frostHeaveMonitor: state.frostHeaveMonitor,
        pumiceRaftDrift: state.pumiceRaftDrift,
        limnicEruptionMonitor: state.limnicEruptionMonitor,
        volcanicTremor: state.volcanicTremor,
        iceWedgePolygon: state.iceWedgePolygon,
        saltFlatCrust: state.saltFlatCrust,
        coldWaterCoralReef: state.coldWaterCoralReef,
        peatlandCarbonSink: state.peatlandCarbonSink,
        hyporheicZone: state.hyporheicZone,
        submarineFan: state.submarineFan,
        coastalDuneSystem: state.coastalDuneSystem,
        // Task 99
        breakwaterIntegrity: state.breakwaterIntegrity,
        seawallErosion: state.seawallErosion,
        groinSediment: state.groinSediment,
        revetmentStability: state.revetmentStability,
        jettyCurrent: state.jettyCurrent,
        beachNourishment: state.beachNourishment,
        coastalArmor: state.coastalArmor,
        shorelineRetreat: state.shorelineRetreat,
        // Task 100
        soilOrganicCarbon: state.soilOrganicCarbon,
        cationExchange: state.cationExchange,
        soilPhosphorus: state.soilPhosphorus,
        soilCompaction: state.soilCompaction,
        clayMineral: state.clayMineral,
        podzolProfile: state.podzolProfile,
        gleyRedox: state.gleyRedox,
        calcicHorizon: state.calcicHorizon,
        // Task 101
        oreGradeAssay: state.oreGradeAssay,
        mineTailingsDam: state.mineTailingsDam,
        mineralVeinThickness: state.mineralVeinThickness,
        stripMineRatio: state.stripMineRatio,
        undergroundMineVent: state.undergroundMineVent,
        acidMineDrainage: state.acidMineDrainage,
        oreReserveEstimate: state.oreReserveEstimate,
        mineralDepositGrade: state.mineralDepositGrade,
        // Task 102
        thermohalineCell: state.thermohalineCell,
        ekmanTransport: state.ekmanTransport,
        geostrophicCurrent: state.geostrophicCurrent,
        upwellingIntensity: state.upwellingIntensity,
        westernBoundary: state.westernBoundary,
        deepWaterFormation: state.deepWaterFormation,
        oceanGyre: state.oceanGyre,
        tropicalCurrent: state.tropicalCurrent,
        // Task 103
        jetStreamPosition: state.jetStreamPosition,
        atmosphericPressureCell: state.atmosphericPressureCell,
        tropopauseHeight: state.tropopauseHeight,
        rossbyWaveAmplitude: state.rossbyWaveAmplitude,
        hadleyCellCirculation: state.hadleyCellCirculation,
        atmosphericRiverFlow: state.atmosphericRiverFlow,
        polarFrontJet: state.polarFrontJet,
        tradeWindBelt: state.tradeWindBelt,
        // Task 104
        speciesMigrationRoute: state.speciesMigrationRoute,
        habitatCorridor: state.habitatCorridor,
        endemicHotspot: state.endemicHotspot,
        keystonePopulation: state.keystonePopulation,
        wildlifeCorridor: state.wildlifeCorridor,
        biomeTransition: state.biomeTransition,
        forestCanopyCover: state.forestCanopyCover,
        wetlandBiodiversityIndex: state.wetlandBiodiversityIndex,
        // Task 105
        watershedDischarge: state.watershedDischarge,
        aquiferRechargeRate: state.aquiferRechargeRate,
        floodInundationMap: state.floodInundationMap,
        riverSedimentLoad: state.riverSedimentLoad,
        groundwaterTableLevel: state.groundwaterTableLevel,
        snowpackWaterEquivalent: state.snowpackWaterEquivalent,
        reservoirStorageLevel: state.reservoirStorageLevel,
        baseflowIndex: state.baseflowIndex,
        // Task 106
        iceShelfThickness: state.iceShelfThickness,
        seaIceExtent: state.seaIceExtent,
        glacierMassBalance: state.glacierMassBalance,
        permafrostActiveLayer: state.permafrostActiveLayer,
        iceCoreRecord: state.iceCoreRecord,
        snowCoverDuration: state.snowCoverDuration,
        frostThawCycle: state.frostThawCycle,
        icebergCalving: state.icebergCalving,
        // Task 107
        magnetopauseStandoff: state.magnetopauseStandoff,
        auroraOvalPosition: state.auroraOvalPosition,
        vanAllenRadiation: state.vanAllenRadiation,
        ionosphericDisturbance: state.ionosphericDisturbance,
        cosmicRayFlux: state.cosmicRayFlux,
        solarFluxIndex: state.solarFluxIndex,
        spaceRadiationDose: state.spaceRadiationDose,
        satelliteDrag: state.satelliteDrag,
        // Task 108: Urban Infrastructure & Smart City
        trafficFlowMonitor: state.trafficFlowMonitor,
        bridgeStructuralHealth: state.bridgeStructuralHealth,
        waterPipeNetwork: state.waterPipeNetwork,
        powerGridLoad: state.powerGridLoad,
        wasteCollectionRoute: state.wasteCollectionRoute,
        airQualityUrban: state.airQualityUrban,
        noiseLevelMapper: state.noiseLevelMapper,
        smartParkingCapacity: state.smartParkingCapacity,
        // Task 109: Agricultural Monitoring & Precision Farming
        cropHealthIndex: state.cropHealthIndex,
        soilMoistureField: state.soilMoistureField,
        irrigationEfficiency: state.irrigationEfficiency,
        pestOutbreakTracker: state.pestOutbreakTracker,
        fertilizerRunoff: state.fertilizerRunoff,
        harvestYieldPredict: state.harvestYieldPredict,
        greenhouseClimate: state.greenhouseClimate,
        livestockMovement: state.livestockMovement,
        // Task 96
        karstSpringDischarge: state.karstSpringDischarge,
        caveDripMonitor: state.caveDripMonitor,
        tidalCreekMonitor: state.tidalCreekMonitor,
        saltMarshCarbon: state.saltMarshCarbon,
        opalPaleoMonitor: state.opalPaleoMonitor,
        aeolianDustDeposition: state.aeolianDustDeposition,
        katabaticWindMonitor: state.katabaticWindMonitor,
        snowAvalancheTracker: state.snowAvalancheTracker,
        // Task 97
        riftValleyVolcano: state.riftValleyVolcano,
        streamBankErosion: state.streamBankErosion,
        iceStreamVelocity: state.iceStreamVelocity,
        coastalAquifer: state.coastalAquifer,
        mangroveRootSystem: state.mangroveRootSystem,
        paleoshorelineTracker: state.paleoshorelineTracker,
        cryoconiteGranule: state.cryoconiteGranule,
        subglacialWaterSystem: state.subglacialWaterSystem,
        // Task 98
        landslideVelocity: state.landslideVelocity,
        debrisFlowSurge: state.debrisFlowSurge,
        rockfallImpact: state.rockfallImpact,
        soilCreepRate: state.soilCreepRate,
        solifluctionLobe: state.solifluctionLobe,
        earthflowDisplacement: state.earthflowDisplacement,
        slumpFailure: state.slumpFailure,
        talusAccumulation: state.talusAccumulation,
      }),
    }
  )
)
