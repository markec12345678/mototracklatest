import { create } from 'zustand'

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

export type MapStyleOption = {
  id: string
  name: string
  url: string
  category: 'standard' | 'dark' | 'satellite' | 'terrain' | 'custom'
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://demotiles.maplibre.org/style.json',
    category: 'standard',
  },
  {
    id: 'dark',
    name: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    category: 'dark',
  },
  {
    id: 'voyager',
    name: 'Voyager',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    category: 'standard',
  },
  {
    id: 'positron',
    name: 'Positron',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    category: 'standard',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    category: 'standard',
  },
]

export type ToolMode = 'navigate' | 'mark' | 'measure' | 'directions'

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

  // Clustering
  clusteringEnabled: boolean

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
  setClusteringEnabled: (enabled: boolean) => void
}

export const useMapStore = create<MapState>((set) => ({
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

  clusteringEnabled: true,

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
    set({ toolMode, measurePoints: [], measureDistance: null }),
  addMeasurePoint: (point) =>
    set((state) => ({ measurePoints: [...state.measurePoints, point] })),
  clearMeasurePoints: () => set({ measurePoints: [], measureDistance: null }),
  setMeasureDistance: (measureDistance) => set({ measureDistance }),
  setClusteringEnabled: (clusteringEnabled) => set({ clusteringEnabled }),
}))
