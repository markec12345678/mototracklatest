'use client'

import { useState, useEffect } from 'react'
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
  Tag,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMapStore,
  type SavedLocation,
  type ToolMode,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const categories = [
  { id: 'general', label: 'General', color: '#6b7280' },
  { id: 'favorite', label: 'Favorite', color: '#f59e0b' },
  { id: 'restaurant', label: 'Restaurant', color: '#ef4444' },
  { id: 'hotel', label: 'Hotel', color: '#8b5cf6' },
  { id: 'park', label: 'Park', color: '#22c55e' },
  { id: 'shop', label: 'Shop', color: '#3b82f6' },
  { id: 'landmark', label: 'Landmark', color: '#f97316' },
  { id: 'transport', label: 'Transport', color: '#06b6d4' },
]

const toolModes: { id: ToolMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'navigate', label: 'Navigate', icon: <Navigation className="h-4 w-4" />, description: 'Pan & zoom the map' },
  { id: 'mark', label: 'Drop Pin', icon: <Pencil className="h-4 w-4" />, description: 'Click map to add markers' },
  { id: 'measure', label: 'Measure', icon: <Ruler className="h-4 w-4" />, description: 'Click points to measure distance' },
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

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newLocName, setNewLocName] = useState('')
  const [newLocDesc, setNewLocDesc] = useState('')
  const [newLocCategory, setNewLocCategory] = useState('general')
  const [newLocColor, setNewLocColor] = useState('#ef4444')
  const [newLocLat, setNewLocLat] = useState('')
  const [newLocLng, setNewLocLng] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState('')

  // Load saved locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetch('/api/locations')
        if (res.ok) {
          const data = await res.json()
          setSavedLocations(data)
          // Also set them as markers on the map
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

  const handleAddLocation = async () => {
    if (!newLocName || !newLocLat || !newLocLng) {
      toast.error('Please fill in name, latitude, and longitude')
      return
    }

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocName,
          description: newLocDesc || undefined,
          latitude: parseFloat(newLocLat),
          longitude: parseFloat(newLocLng),
          category: newLocCategory,
          color: newLocColor,
        }),
      })

      if (res.ok) {
        const location = await res.json()
        addSavedLocation(location)
        useMapStore.getState().addMarker({
          id: location.id,
          longitude: location.longitude,
          latitude: location.latitude,
          name: location.name,
          description: location.description || undefined,
          color: location.color,
          category: location.category,
        })
        toast.success(`Added "${newLocName}"`)
        setAddDialogOpen(false)
        resetForm()
      }
    } catch (err) {
      console.error('Failed to add location:', err)
      toast.error('Failed to add location')
    }
  }

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

  const handleFlyTo = (lng: number, lat: number) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) flyTo(lng, lat, 14)
  }

  const resetForm = () => {
    setNewLocName('')
    setNewLocDesc('')
    setNewLocCategory('general')
    setNewLocColor('#ef4444')
    setNewLocLat('')
    setNewLocLng('')
  }

  const filteredLocations = savedLocations.filter((loc) => {
    const matchesCategory = filterCategory === 'all' || loc.category === filterCategory
    const matchesSearch = !searchFilter || loc.name.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const tabs = [
    { id: 'locations' as const, label: 'Places', icon: <MapPin className="h-4 w-4" /> },
    { id: 'layers' as const, label: 'Layers', icon: <Layers className="h-4 w-4" /> },
    { id: 'tools' as const, label: 'Tools', icon: <Wrench className="h-4 w-4" /> },
    { id: 'routes' as const, label: 'Routes', icon: <Route className="h-4 w-4" /> },
  ]

  return (
    <div
      className={cn(
        'absolute left-0 top-0 bottom-0 z-20 flex transition-all duration-300',
        sidebarOpen ? 'w-80' : 'w-12'
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-4 z-30 bg-background border rounded-full p-1 shadow-md hover:bg-accent transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {/* Sidebar content */}
      {sidebarOpen && (
        <div className="w-80 bg-background/95 backdrop-blur-md border-r flex flex-col shadow-lg">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              MapLibre Explorer
            </h2>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSidebarTab(tab.id)}
                className={cn(
                  'flex-1 py-2.5 px-1 text-xs font-medium transition-colors flex flex-col items-center gap-1',
                  sidebarTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.icon}
                {tab.label}
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
                onAddClick={() => setAddDialogOpen(true)}
                selectedMarker={selectedMarker}
                onSelectMarker={setSelectedMarker}
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
              />
            )}
            {sidebarTab === 'routes' && <RoutesTab />}
          </div>
        </div>
      )}
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
  onAddClick,
  selectedMarker,
  onSelectMarker,
}: {
  locations: SavedLocation[]
  searchFilter: string
  setSearchFilter: (v: string) => void
  filterCategory: string
  setFilterCategory: (v: string) => void
  onFlyTo: (lng: number, lat: number) => void
  onDelete: (id: string) => void
  onAddClick: () => void
  selectedMarker: string | null
  onSelectMarker: (id: string | null) => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Search & filter */}
      <div className="p-3 space-y-2 border-b">
        <Input
          placeholder="Filter locations..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-8 text-sm"
        />
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'text-xs px-2 py-1 rounded-full border transition-colors',
              filterCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            )}
          >
            All
          </button>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'text-xs px-2 py-1 rounded-full border transition-colors',
                filterCategory === cat.id
                  ? 'text-white'
                  : 'hover:bg-accent'
              )}
              style={
                filterCategory === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : undefined
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add button */}
      <div className="p-3 border-b">
        <Dialog open={useMapStore.getState().sidebarOpen} onOpenChange={() => {}}>
          <Button
            onClick={onAddClick}
            className="w-full h-9 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Location
          </Button>
        </Dialog>
      </div>

      {/* Locations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved locations</p>
              <p className="text-xs mt-1">Click &quot;Add Location&quot; to save places</p>
            </div>
          ) : (
            locations.map((loc) => {
              const cat = categories.find((c) => c.id === loc.category)
              const isSelected = selectedMarker === loc.id
              return (
                <div
                  key={loc.id}
                  className={cn(
                    'group flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer',
                    isSelected
                      ? 'bg-accent border-primary/20 shadow-sm'
                      : 'hover:bg-accent/50 border-transparent'
                  )}
                  onClick={() => {
                    onSelectMarker(isSelected ? null : loc.id)
                    onFlyTo(loc.longitude, loc.latitude)
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: loc.color + '20', color: loc.color }}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{loc.name}</p>
                      {cat && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 shrink-0"
                        >
                          {cat.label}
                        </Badge>
                      )}
                    </div>
                    {loc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {loc.description}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      📍 {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(loc.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all shrink-0"
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
    { id: 'water', name: 'Water Bodies', visible: true, icon: '🌊' },
    { id: 'roads', name: 'Roads', visible: true, icon: '🛣️' },
    { id: 'buildings', name: 'Buildings', visible: true, icon: '🏗️' },
    { id: 'landuse', name: 'Land Use', visible: true, icon: '🌳' },
    { id: 'poi', name: 'Points of Interest', visible: true, icon: '📍' },
    { id: 'transit', name: 'Transit', visible: false, icon: '🚌' },
    { id: 'boundaries', name: 'Boundaries', visible: true, icon: '🗺️' },
    { id: 'terrain', name: 'Terrain', visible: false, icon: '⛰️' },
  ])

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Map Layers</h3>
        <Badge variant="secondary" className="text-xs">
          {layers.filter((l) => l.visible).length}/{layers.length}
        </Badge>
      </div>
      <Separator />
      <div className="space-y-1.5">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
              layer.visible
                ? 'bg-accent/50 border-transparent'
                : 'opacity-50 border-transparent hover:border-border'
            )}
          >
            <span className="text-base">{layer.icon}</span>
            <span className="text-sm flex-1">{layer.name}</span>
            {layer.visible ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Overlay Data
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'weather', name: 'Weather', icon: '🌤️' },
            { id: 'traffic', name: 'Traffic', icon: '🚗' },
            { id: 'earthquakes', name: 'Earthquakes', icon: '🌍' },
          ].map((overlay) => (
            <div
              key={overlay.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed text-muted-foreground"
            >
              <span className="text-base">{overlay.icon}</span>
              <span className="text-sm flex-1">{overlay.name}</span>
              <Badge variant="outline" className="text-[10px]">
                Coming Soon
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ToolsTab({
  toolMode,
  setToolMode,
  measurePoints,
  measureDistance,
  clearMeasurePoints,
}: {
  toolMode: ToolMode
  setToolMode: (mode: ToolMode) => void
  measurePoints: { longitude: number; latitude: number }[]
  measureDistance: number | null
  clearMeasurePoints: () => void
}) {
  return (
    <div className="p-3 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Active Tool</h3>
        <div className="grid gap-1.5">
          {toolModes.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setToolMode(tool.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                toolMode === tool.id
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'hover:bg-accent border-transparent'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  toolMode === tool.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {tool.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="text-[11px] text-muted-foreground">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {toolMode === 'measure' && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Measurement</h4>
            {measurePoints.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Click on the map to add measurement points
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                  <span className="text-xs text-muted-foreground">Points</span>
                  <Badge variant="secondary">{measurePoints.length}</Badge>
                </div>
                {measureDistance !== null && (
                  <div className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                    <span className="text-xs text-muted-foreground">Distance</span>
                    <span className="text-sm font-semibold">
                      {measureDistance < 1
                        ? `${(measureDistance * 1000).toFixed(0)} m`
                        : `${measureDistance.toFixed(2)} km`}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {measurePoints.map((p, i) => (
                    <div
                      key={i}
                      className="text-xs text-muted-foreground flex items-center gap-2 px-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
                        {i + 1}
                      </span>
                      {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={clearMeasurePoints}
                >
                  Clear Measurement
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <Separator />
      <div>
        <h4 className="text-sm font-semibold mb-2">Export</h4>
        <div className="grid gap-1.5">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export as GeoJSON
          </Button>
          <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start">
            <Star className="h-3.5 w-3.5 mr-2" />
            Save as KML
          </Button>
        </div>
      </div>
    </div>
  )
}

function RoutesTab() {
  const [routes, setRoutes] = useState<Array<{ id: string; name: string; color: string; distance: number | null; waypoints: string }>>([])
  const [routeName, setRouteName] = useState('')

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
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold">Saved Routes</h3>
      <Separator />
      {routes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Route className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No saved routes</p>
          <p className="text-xs mt-1">Use the measure tool to create routes</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div
                className="w-3 h-8 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{route.name}</p>
                {route.distance && (
                  <p className="text-xs text-muted-foreground">
                    {(route.distance < 1
                      ? `${(route.distance * 1000).toFixed(0)} m`
                      : `${route.distance.toFixed(2)} km`)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
