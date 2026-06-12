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
      }),
    }
  )
)
