'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  Layers,
  Wrench,
  Route,
  Plus,
  Trash2,
  Navigation,
  Pencil,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Star,
  Share2,
  MapPinned,
  Globe2,
  Mountain,
  Palette,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  useMapStore,
  type SavedLocation,
  type ToolMode,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LocationDetailDrawer } from '@/components/map/LocationDetailDrawer'

const categories = [
  { id: 'general', label: 'General', color: '#6b7280', icon: '📌' },
  { id: 'favorite', label: 'Favorite', color: '#f59e0b', icon: '⭐' },
  { id: 'restaurant', label: 'Restaurant', color: '#ef4444', icon: '🍽️' },
  { id: 'hotel', label: 'Hotel', color: '#8b5cf6', icon: '🏨' },
  { id: 'park', label: 'Park', color: '#22c55e', icon: '🌳' },
  { id: 'shop', label: 'Shop', color: '#3b82f6', icon: '🛍️' },
  { id: 'landmark', label: 'Landmark', color: '#f97316', icon: '🏛️' },
  { id: 'transport', label: 'Transport', color: '#06b6d4', icon: '🚌' },
]

const toolModes: {
  id: ToolMode
  label: string
  icon: React.ReactNode
  description: string
  color: string
}[] = [
  {
    id: 'navigate',
    label: 'Navigate',
    icon: <Navigation className="h-4 w-4" />,
    description: 'Pan & zoom the map',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'mark',
    label: 'Drop Pin',
    icon: <Pencil className="h-4 w-4" />,
    description: 'Click map to add markers',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'measure',
    label: 'Measure',
    icon: <Ruler className="h-4 w-4" />,
    description: 'Click points to measure distance',
    color: 'from-amber-500 to-orange-500',
  },
]

export function MapSidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarTab,
    setSidebarTab,
    savedLocations,
    setSavedLocations,
    addSavedLocation,
    removeSavedLocation,
    markers,
    removeMarker,
    toolMode,
    setToolMode,
    measurePoints,
    measureDistance,
    setMeasureDistance,
    clearMeasurePoints,
    selectedMarker,
    setSelectedMarker,
  } = useMapStore()

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState('')
  const [detailLocation, setDetailLocation] = useState<SavedLocation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Load saved locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch('/api/locations')
        if (res.ok) {
          const data = await res.json()
          setSavedLocations(data)
          useMapStore.getState().setMarkers(
            data.map((loc: SavedLocation) => ({
              id: loc.id,
              longitude: loc.longitude,
              latitude: loc.latitude,
              name: loc.name,
              description: loc.description || undefined,
              color: loc.color,
              category: loc.category,
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load locations:', err)
      }
    }
    loadLocations()
  }, [setSavedLocations])

  // Calculate measurement distance
  useEffect(() => {
    if (measurePoints.length < 2) {
      setMeasureDistance(null)
      return
    }

    let total = 0
    for (let i = 1; i < measurePoints.length; i++) {
      total += haversineDistance(
        measurePoints[i - 1].latitude,
        measurePoints[i - 1].longitude,
        measurePoints[i].latitude,
        measurePoints[i].longitude
      )
    }
    setMeasureDistance(total)
  }, [measurePoints, setMeasureDistance])

  const handleDeleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        removeSavedLocation(id)
        removeMarker(id)
        if (selectedMarker === id) setSelectedMarker(null)
        toast.success('Location removed')
      }
    } catch (err) {
      console.error('Failed to delete location:', err)
      toast.error('Failed to delete location')
    }
  }

  const handleFlyTo = useCallback((lng: number, lat: number) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) flyTo(lng, lat, 14)
  }, [])

  const handleExportGeoJSON = useCallback(() => {
    const geojson = {
      type: 'FeatureCollection' as const,
      features: savedLocations.map((loc) => ({
        type: 'Feature' as const,
        properties: {
          name: loc.name,
          description: loc.description,
          category: loc.category,
          color: loc.color,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.longitude, loc.latitude],
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/geo+json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maplibre-explorer-locations.geojson'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('GeoJSON exported!')
  }, [savedLocations])

  const filteredLocations = savedLocations.filter((loc) => {
    const matchesCategory =
      filterCategory === 'all' || loc.category === filterCategory
    const matchesSearch =
      !searchFilter ||
      loc.name.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const tabs = [
    {
      id: 'locations' as const,
      label: 'Places',
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      id: 'layers' as const,
      label: 'Layers',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'tools' as const,
      label: 'Tools',
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      id: 'routes' as const,
      label: 'Routes',
      icon: <Route className="h-4 w-4" />,
    },
  ]

  return (
    <div
      className={cn(
        'absolute left-0 top-0 bottom-0 z-20 flex transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-80' : 'w-0'
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          'absolute z-30 bg-background border rounded-full p-1.5 shadow-lg hover:bg-accent transition-all duration-200',
          sidebarOpen ? '-right-3 top-4' : 'right-0 top-4 translate-x-full'
        )}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {/* Sidebar content */}
      <div
        className={cn(
          'w-80 bg-background/95 backdrop-blur-xl border-r flex flex-col shadow-2xl transition-opacity duration-200',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Header with gradient accent */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />
          <div className="relative px-4 py-3 border-b">
            <h2 className="font-bold text-lg flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-base">MapLibre Explorer</span>
                <p className="text-[10px] text-muted-foreground font-normal -mt-0.5">
                  Interactive Map Application
                </p>
              </div>
            </h2>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b bg-muted/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 px-1 text-xs font-medium transition-all flex flex-col items-center gap-1 relative',
                sidebarTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
              {sidebarTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {sidebarTab === 'locations' && (
            <LocationsTab
              locations={filteredLocations}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              onFlyTo={handleFlyTo}
              onDelete={handleDeleteLocation}
              selectedMarker={selectedMarker}
              onSelectMarker={setSelectedMarker}
              totalCount={savedLocations.length}
              onOpenDetail={(loc) => {
                setDetailLocation(loc)
                setDetailOpen(true)
              }}
            />
          )}
          {sidebarTab === 'layers' && <LayersTab />}
          {sidebarTab === 'tools' && (
            <ToolsTab
              toolMode={toolMode}
              setToolMode={setToolMode}
              measurePoints={measurePoints}
              measureDistance={measureDistance}
              clearMeasurePoints={clearMeasurePoints}
              onExportGeoJSON={handleExportGeoJSON}
            />
          )}
          {sidebarTab === 'routes' && <RoutesTab />}
        </div>
      </div>

      {/* Location Detail Drawer */}
      <LocationDetailDrawer
        location={detailLocation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDeleteLocation}
      />
    </div>
  )
}

function LocationsTab({
  locations,
  searchFilter,
  setSearchFilter,
  filterCategory,
  setFilterCategory,
  onFlyTo,
  onDelete,
  selectedMarker,
  onSelectMarker,
  totalCount,
  onOpenDetail,
}: {
  locations: SavedLocation[]
  searchFilter: string
  setSearchFilter: (v: string) => void
  filterCategory: string
  setFilterCategory: (v: string) => void
  onFlyTo: (lng: number, lat: number) => void
  onDelete: (id: string) => void
  selectedMarker: string | null
  onSelectMarker: (id: string | null) => void
  totalCount: number
  onOpenDetail: (loc: SavedLocation) => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Search & filter */}
      <div className="p-3 space-y-2 border-b bg-muted/20">
        <Input
          placeholder="Search locations..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-8 text-sm"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full border transition-all duration-200',
              filterCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-accent bg-background'
            )}
          >
            All ({totalCount})
          </button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'text-[11px] px-2 py-1 rounded-full border transition-all duration-200',
                filterCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'hover:bg-accent bg-background'
              )}
              style={
                filterCategory === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : undefined
              }
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {locations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
                <MapPinned className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-medium">No saved locations</p>
              <p className="text-xs mt-1 max-w-[200px] mx-auto">
                Click the &quot;+&quot; button on the map or use the Drop Pin
                tool to save places
              </p>
            </div>
          ) : (
            locations.map((loc) => {
              const cat = categories.find((c) => c.id === loc.category)
              const isSelected = selectedMarker === loc.id
              return (
                <div
                  key={loc.id}
                  className={cn(
                    'group flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10'
                      : 'hover:bg-accent/50 border-transparent hover:border-border'
                  )}
                  onClick={() => {
                    onSelectMarker(isSelected ? null : loc.id)
                    onFlyTo(loc.longitude, loc.latitude)
                  }}
                  onDoubleClick={() => onOpenDetail(loc)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: loc.color + '15',
                      color: loc.color,
                    }}
                  >
                    <span className="text-sm">{cat?.icon || '📌'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{loc.name}</p>
                    </div>
                    {loc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {loc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {cat && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                          style={{
                            backgroundColor: cat.color + '15',
                            color: cat.color,
                            border: 'none',
                          }}
                        >
                          {cat.label}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(loc.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function LayersTab() {
  const [layers, setLayers] = useState([
    { id: 'water', name: 'Water Bodies', visible: true, icon: '🌊', color: '#06b6d4' },
    { id: 'roads', name: 'Roads', visible: true, icon: '🛣️', color: '#6b7280' },
    { id: 'buildings', name: 'Buildings', visible: true, icon: '🏗️', color: '#f59e0b' },
    { id: 'landuse', name: 'Land Use', visible: true, icon: '🌳', color: '#22c55e' },
    { id: 'poi', name: 'Points of Interest', visible: true, icon: '📍', color: '#ef4444' },
    { id: 'transit', name: 'Transit', visible: false, icon: '🚌', color: '#8b5cf6' },
    { id: 'boundaries', name: 'Boundaries', visible: true, icon: '🗺️', color: '#f97316' },
    { id: 'terrain', name: 'Terrain', visible: false, icon: '⛰️', color: '#78716c' },
  ])

  const [terrain3D, setTerrain3D] = useState(false)
  const [show3DBuildings, setShow3DBuildings] = useState(false)

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Map Layers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              Map Layers
            </h3>
            <Badge variant="secondary" className="text-xs font-mono">
              {layers.filter((l) => l.visible).length}/{layers.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 text-left group',
                  layer.visible
                    ? 'bg-background border-border/50 shadow-sm'
                    : 'opacity-40 border-transparent hover:border-border'
                )}
              >
                <span className="text-base">{layer.icon}</span>
                <span className="text-sm flex-1">{layer.name}</span>
                <div
                  className="w-1.5 h-4 rounded-full transition-opacity"
                  style={{
                    backgroundColor: layer.color,
                    opacity: layer.visible ? 1 : 0.3,
                  }}
                />
                {layer.visible ? (
                  <Eye className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* 3D Options */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Mountain className="h-3.5 w-3.5 text-muted-foreground" />
            3D Options
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border bg-background">
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">3D Terrain</p>
                  <p className="text-[10px] text-muted-foreground">
                    Elevation rendering
                  </p>
                </div>
              </div>
              <Switch
                checked={terrain3D}
                onCheckedChange={setTerrain3D}
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl border bg-background">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">3D Buildings</p>
                  <p className="text-[10px] text-muted-foreground">
                    Extruded building footprints
                  </p>
                </div>
              </div>
              <Switch
                checked={show3DBuildings}
                onCheckedChange={setShow3DBuildings}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Overlay Data */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Overlay Data
          </h3>
          <div className="space-y-1.5">
            {[
              { id: 'weather', name: 'Weather', icon: '🌤️', desc: 'Real-time weather' },
              { id: 'traffic', name: 'Traffic', icon: '🚗', desc: 'Live traffic flow' },
              { id: 'earthquakes', name: 'Earthquakes', icon: '🌍', desc: 'Seismic activity' },
            ].map((overlay) => (
              <div
                key={overlay.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-dashed text-muted-foreground"
              >
                <span className="text-base">{overlay.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">{overlay.name}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {overlay.desc}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4"
                >
                  Soon
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function ToolsTab({
  toolMode,
  setToolMode,
  measurePoints,
  measureDistance,
  clearMeasurePoints,
  onExportGeoJSON,
}: {
  toolMode: ToolMode
  setToolMode: (mode: ToolMode) => void
  measurePoints: { longitude: number; latitude: number }[]
  measureDistance: number | null
  clearMeasurePoints: () => void
  onExportGeoJSON: () => void
}) {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Active Tool */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            Active Tool
          </h3>
          <div className="space-y-1.5">
            {toolModes.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setToolMode(tool.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left group',
                  toolMode === tool.id
                    ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10'
                    : 'hover:bg-accent/50 border-transparent'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                    toolMode === tool.id
                      ? `bg-gradient-to-br ${tool.color} text-white shadow-md`
                      : 'bg-muted text-muted-foreground group-hover:bg-accent'
                  )}
                >
                  {tool.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{tool.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
                {toolMode === tool.id && (
                  <ArrowRight className="h-4 w-4 text-primary ml-auto shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Measurement results */}
        {toolMode === 'measure' && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                Measurement
              </h4>
              {measurePoints.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Ruler className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-xs">
                    Click on the map to add measurement points
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {measureDistance !== null && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Total Distance
                        </span>
                        <span className="text-lg font-bold text-amber-600">
                          {measureDistance < 1
                            ? `${(measureDistance * 1000).toFixed(0)} m`
                            : `${measureDistance.toFixed(2)} km`}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                    <span className="text-xs text-muted-foreground">
                      Points
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {measurePoints.length}
                    </Badge>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {measurePoints.map((p, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-2 px-2 py-1"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="font-mono">
                          {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={clearMeasurePoints}
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Clear Measurement
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Export */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Export Data
          </h4>
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs justify-start rounded-xl"
              onClick={onExportGeoJSON}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export as GeoJSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs justify-start rounded-xl"
            >
              <Share2 className="h-3.5 w-3.5 mr-2" />
              Share Map View
            </Button>
          </div>
        </div>

        <Separator />

        {/* Quick Bookmarks */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-muted-foreground" />
            Quick Bookmarks
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { name: 'Paris', lat: 48.8566, lng: 2.3522, emoji: '🗼' },
              { name: 'London', lat: 51.5074, lng: -0.1278, emoji: '🎡' },
              { name: 'New York', lat: 40.7128, lng: -74.006, emoji: '🗽' },
              { name: 'Tokyo', lat: 35.6762, lng: 139.6503, emoji: '⛩️' },
              { name: 'Sydney', lat: -33.8688, lng: 151.2093, emoji: ' Opera' },
              { name: 'Dubai', lat: 25.2048, lng: 55.2708, emoji: '🏙️' },
            ].map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                  if (flyTo) flyTo(city.lng, city.lat, 12)
                }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-all text-left"
              >
                <span className="text-sm">{city.emoji}</span>
                <span className="text-xs font-medium">{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function RoutesTab() {
  const [routes, setRoutes] = useState<
    Array<{
      id: string
      name: string
      color: string
      distance: number | null
      waypoints: string
    }>
  >([])

  useEffect(() => {
    async function loadRoutes() {
      try {
        const res = await fetch('/api/routes')
        if (res.ok) {
          const data = await res.json()
          setRoutes(data)
        }
      } catch (err) {
        console.error('Failed to load routes:', err)
      }
    }
    loadRoutes()
  }, [])

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Route className="h-3.5 w-3.5 text-muted-foreground" />
          Saved Routes
        </h3>
        <Separator />
        {routes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Route className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">No saved routes</p>
            <p className="text-xs mt-1 max-w-[200px] mx-auto">
              Use the Measure tool to trace a route, then save it
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {routes.map((route) => (
              <div
                key={route.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border hover:bg-accent/50 transition-colors"
              >
                <div
                  className="w-3 h-8 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{route.name}</p>
                  {route.distance && (
                    <p className="text-xs text-muted-foreground">
                      {route.distance < 1
                        ? `${(route.distance * 1000).toFixed(0)} m`
                        : `${route.distance.toFixed(2)} km`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// Haversine distance calculation
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
