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
        coralBleaching: state.coralBleaching,
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
        landslidePredictor: state.landslidePredictor,
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
      }),
    }
  )
)
