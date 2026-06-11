import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export interface MapMarker {
  id: string
  longitude: number
  latitude: number
  name: string
  description?: string
  color: string
  category: string
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

export interface POIMarker {
  id: string
  longitude: number
  latitude: number
  name: string
  category: string
  icon: string
  distance: number | null
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

export type ToolMode = 'navigate' | 'mark' | 'measure' | 'directions' | 'draw' | 'area'

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

  // Isochrone visualization
  isochroneEnabled: boolean
  isochroneMinutes: number
  isochroneMode: 'walking' | 'cycling' | 'driving'

  // Area measurement
  areaPoints: MeasurePoint[]
  areaResult: number | null

  // POI Markers (temporary, for nearby search)
  poiMarkers: POIMarker[]

  // Heatmap visualization
  heatmapEnabled: boolean

  // Notifications
  notifications: MapNotification[]

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
  setCurrentDrawing: (points: number[][] | null) => void
  addDrawingPoint: (point: number[]) => void
  finishDrawing: () => void
  setDrawColor: (color: string) => void
  setDrawWidth: (width: number) => void
  deleteDrawing: (id: string) => void
  setClusteringEnabled: (enabled: boolean) => void
  setBuildingExtrusion: (enabled: boolean) => void
  setTerrainEnabled: (enabled: boolean) => void
  setTerrainExaggeration: (exaggeration: number) => void
  setWeatherEnabled: (enabled: boolean) => void
  setEarthquakesEnabled: (enabled: boolean) => void
  setTrafficEnabled: (enabled: boolean) => void
  setIsochroneEnabled: (enabled: boolean) => void
  setIsochroneMinutes: (minutes: number) => void
  setIsochroneMode: (mode: 'walking' | 'cycling' | 'driving') => void
  pushNotification: (notification: Omit<MapNotification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  setPoiMarkers: (poiMarkers: POIMarker[]) => void
  clearPoiMarkers: () => void
  setHeatmapEnabled: (enabled: boolean) => void
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

      drawings: [],
      currentDrawing: null,
      drawColor: '#22c55e',
      drawWidth: 3,
      isDrawing: false,

      clusteringEnabled: true,
      buildingExtrusion: false,
      terrainEnabled: false,
      terrainExaggeration: 1.5,
      weatherEnabled: false,
      trafficEnabled: false,
      earthquakesEnabled: false,
      isochroneEnabled: false,
      isochroneMinutes: 15,
      isochroneMode: 'walking',
      poiMarkers: [],
      heatmapEnabled: false,
      notifications: [],

      setCenter: (center) => set({ center }),
      setZoom: (zoom) => set({ zoom }),
      setCurrentStyle: (currentStyle) => set({ currentStyle }),
      setBearing: (bearing) => set({ bearing }),
      setPitch: (pitch) => set({ pitch }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addMarker: (marker) =>
        set((state) => ({ markers: [...state.markers, marker] })),
      removeMarker: (id) =>
        set((state) => ({ markers: state.markers.filter((m) => m.id !== id) })),
      setMarkers: (markers) => set({ markers }),

      setSavedLocations: (savedLocations) => set({ savedLocations }),
      addSavedLocation: (location) =>
        set((state) => ({ savedLocations: [location, ...state.savedLocations] })),
      removeSavedLocation: (id) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter((l) => l.id !== id),
          markers: state.markers.filter((m) => m.id !== id),
        })),

      setSelectedMarker: (selectedMarker) => set({ selectedMarker }),

      setGeolocation: (geolocation) => set({ geolocation }),
      setLayerVisibility: (layers) =>
        set((state) => ({
          layerVisibility: { ...state.layerVisibility, ...layers },
        })),

      setToolMode: (toolMode) =>
        set({ toolMode, measurePoints: [], measureDistance: null, areaPoints: [], areaResult: null }),
      addMeasurePoint: (point) =>
        set((state) => ({ measurePoints: [...state.measurePoints, point] })),
      clearMeasurePoints: () => set({ measurePoints: [], measureDistance: null }),
      setMeasureDistance: (measureDistance) => set({ measureDistance }),
      addAreaPoint: (point) =>
        set((state) => ({ areaPoints: [...state.areaPoints, point] })),
      clearAreaPoints: () => set({ areaPoints: [], areaResult: null }),
      setAreaResult: (areaResult) => set({ areaResult }),
      addRoutePoint: (point) =>
        set((state) => ({ routePoints: [...state.routePoints, point] })),
      removeRoutePoint: (index) =>
        set((state) => ({
          routePoints: state.routePoints.filter((_, i) => i !== index),
        })),
      clearRoutePoints: () => set({ routePoints: [] }),
      setCurrentRouteColor: (currentRouteColor) => set({ currentRouteColor }),
      saveRoute: (name) =>
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
        }),
      setOsmrData: (distance, duration) => set({ osrmDistance: distance, osrmDuration: duration }),
      deleteRoute: (id) =>
        set((state) => ({
          routes: state.routes.filter((r) => r.id !== id),
        })),
      setRoutes: (routes) => set({ routes }),
      setCurrentDrawing: (currentDrawing) => set({ currentDrawing }),
      addDrawingPoint: (point) =>
        set((state) => ({
          currentDrawing: state.currentDrawing
            ? [...state.currentDrawing, point]
            : [point],
        })),
      finishDrawing: () =>
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
        }),
      setDrawColor: (drawColor) => set({ drawColor }),
      setDrawWidth: (drawWidth) => set({ drawWidth }),
      deleteDrawing: (id) =>
        set((state) => ({
          drawings: state.drawings.filter((d) => d.id !== id),
        })),
      setClusteringEnabled: (clusteringEnabled) => set({ clusteringEnabled }),
      setBuildingExtrusion: (buildingExtrusion) => set({ buildingExtrusion }),
      setTerrainEnabled: (terrainEnabled) => set({ terrainEnabled }),
      setTerrainExaggeration: (terrainExaggeration) => set({ terrainExaggeration }),
      setWeatherEnabled: (weatherEnabled) => set({ weatherEnabled }),
      setEarthquakesEnabled: (earthquakesEnabled) => set({ earthquakesEnabled }),
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
      setHeatmapEnabled: (heatmapEnabled) => set({ heatmapEnabled }),
    }),
    {
      name: 'maplibre-explorer-prefs',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        clusteringEnabled: state.clusteringEnabled,
        weatherEnabled: state.weatherEnabled,
        trafficEnabled: state.trafficEnabled,
        earthquakesEnabled: state.earthquakesEnabled,
        isochroneEnabled: state.isochroneEnabled,
        isochroneMinutes: state.isochroneMinutes,
        isochroneMode: state.isochroneMode,
        terrainEnabled: state.terrainEnabled,
        buildingExtrusion: state.buildingExtrusion,
        terrainExaggeration: state.terrainExaggeration,
        layerVisibility: state.layerVisibility,
        drawColor: state.drawColor,
        drawWidth: state.drawWidth,
        heatmapEnabled: state.heatmapEnabled,
      }),
    }
  )
)
