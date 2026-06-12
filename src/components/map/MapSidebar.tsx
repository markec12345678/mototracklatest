'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MapPin,
  Layers,
  Wrench,
  Route,
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
  ArrowRight,
  PanelLeft,
  Keyboard,
  Circle,
  Minus,
  Copy,
  Compass,
  Upload,
  Footprints,
  Bike,
  Car,
  Loader2,
  FileUp,
  Pentagon,
  Type,
  Shield,
  GitCompare,
  Activity,
  X,
  ImageIcon,
  ChevronDown,
  Palette,
  Camera,
  Zap,
  Clock,
  BarChart3,
  Wind,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  useMapStore,
  type SavedLocation,
  type ToolMode,
  type MapRoute,
  type RoutePoint,
  type RouteStep,
  type RouteProfile,
} from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/translations'
import { LocationDetailDrawer } from '@/components/map/LocationDetailDrawer'
import { NearbyPanel } from '@/components/map/NearbyPanel'
import { CustomTileSourceList } from '@/components/map/CustomTileSourceList'
import { MapThemeCustomizer } from '@/components/map/MapThemeCustomizer'
import { Skeleton } from '@/components/ui/skeleton'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { GeofenceManager } from '@/components/map/GeofenceManager'
import { RouteAnalyticsPanel } from '@/components/map/RouteAnalyticsPanel'
import { SnapshotManager } from '@/components/map/SnapshotManager'
import { ImageOverlayManager } from '@/components/map/ImageOverlayManager'
import { SpatialAnalysisPanel } from '@/components/map/SpatialAnalysisPanel'
import { RouteOptimizer } from '@/components/map/RouteOptimizer'
import { LocationHistoryTimeline } from '@/components/map/LocationHistoryTimeline'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

// SectionHeader component for collapsible sidebar sections
function SectionHeader({ title, sectionId, icon, count }: {
  title: string
  sectionId: string
  icon?: React.ReactNode
  count?: number
}) {
  const collapsedSections = useMapStore((s) => s.collapsedSections)
  const toggleSection = useMapStore((s) => s.toggleSection)
  const isCollapsed = collapsedSections[sectionId] || false

  return (
    <CollapsibleTrigger asChild>
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between py-1.5 group cursor-pointer"
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title}`}
      >
        <h3 className="text-sm font-semibold flex items-center gap-2">
          {icon}
          {title}
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-xs font-mono h-5 min-w-[20px] px-1.5">
              {count}
            </Badge>
          )}
        </h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isCollapsed && '-rotate-90'
          )}
        />
      </button>
    </CollapsibleTrigger>
  )
}

function SidebarSkeleton() {
  return (
    <div className="p-3 space-y-3">
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function mapSymbolToCategory(sym?: string): string {
  if (!sym) return 'general'
  const lower = sym.toLowerCase()
  if (lower.includes('restaurant') || lower.includes('food')) return 'restaurant'
  if (lower.includes('hotel') || lower.includes('lodging')) return 'hotel'
  if (lower.includes('park')) return 'park'
  if (lower.includes('star') || lower.includes('favorite')) return 'favorite'
  if (lower.includes('shop') || lower.includes('store')) return 'shop'
  if (lower.includes('landmark') || lower.includes('museum')) return 'landmark'
  return 'general'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: '#6b7280',
    favorite: '#f59e0b',
    restaurant: '#ef4444',
    hotel: '#8b5cf6',
    park: '#22c55e',
    shop: '#3b82f6',
    landmark: '#f97316',
    transport: '#06b6d4',
  }
  return colors[category] || '#6b7280'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    general: '📌',
    favorite: '⭐',
    restaurant: '🍽️',
    hotel: '🏨',
    park: '🌳',
    shop: '🛍️',
    landmark: '🏛️',
    transport: '🚌',
  }
  return icons[category] || '📌'
}

async function exportGPX(type: 'route' | 'markers' | 'all', data: Record<string, unknown>) {
  try {
    const res = await fetch('/api/export/gpx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maplibre-${type}-${Date.now()}.gpx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${type === 'route' ? 'Route' : type === 'markers' ? 'Markers' : 'All data'} exported as GPX`)
  } catch (err) {
    console.error('GPX export error:', err)
    toast.error('Failed to export GPX')
  }
}

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
  shortcut: string
}[] = [
  {
    id: 'navigate',
    label: 'Navigate',
    icon: <Navigation className="h-4 w-4" />,
    description: 'Pan & zoom the map',
    color: 'from-emerald-500 to-teal-500',
    shortcut: '1',
  },
  {
    id: 'mark',
    label: 'Drop Pin',
    icon: <MapPin className="h-4 w-4" />,
    description: 'Click map to add markers',
    color: 'from-red-500 to-rose-500',
    shortcut: '2',
  },
  {
    id: 'measure',
    label: 'Measure',
    icon: <Ruler className="h-4 w-4" />,
    description: 'Click points to measure distance',
    color: 'from-amber-500 to-orange-500',
    shortcut: '3',
  },
  {
    id: 'directions',
    label: 'Directions',
    icon: <Route className="h-4 w-4" />,
    description: 'Draw routes between points',
    color: 'from-cyan-500 to-sky-500',
    shortcut: '4',
  },
  {
    id: 'draw',
    label: 'Draw',
    icon: <Pencil className="h-4 w-4" />,
    description: 'Freehand drawing on the map',
    color: 'from-green-500 to-emerald-500',
    shortcut: '5',
  },
  {
    id: 'area',
    label: 'Area',
    icon: <Pentagon className="h-4 w-4" />,
    description: 'Measure polygon area on the map',
    color: 'from-violet-500 to-purple-500',
    shortcut: '6',
  },
  {
    id: 'annotate',
    label: 'Label',
    icon: <Type className="h-4 w-4" />,
    description: 'Add text labels on the map',
    color: 'from-pink-500 to-rose-500',
    shortcut: '8',
  },
]

// Shared sidebar content component
function SidebarContent({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const {
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
    areaPoints,
    areaResult,
    clearAreaPoints,
  } = useMapStore()

  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState('')
  const [detailLocation, setDetailLocation] = useState<SavedLocation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const gpxInputRef = useRef<HTMLInputElement>(null)
  const gpxRouteInputRef = useRef<HTMLInputElement>(null)

  // GPX Import handler
  const handleGPXImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import/gpx', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Import failed')

      const data = await res.json()
      const { waypoints, tracks } = data

      // Import waypoints as markers/locations
      const { addMarker, addSavedLocation, pushNotification, setRoutes } = useMapStore.getState()

      let importedWaypoints = 0
      for (const wp of waypoints) {
        const id = `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const category = mapSymbolToCategory(wp.sym || wp.type)
        addMarker({
          id,
          longitude: wp.longitude,
          latitude: wp.latitude,
          name: wp.name,
          category,
          color: getCategoryColor(category),
        })
        addSavedLocation({
          id,
          name: wp.name,
          latitude: wp.latitude,
          longitude: wp.longitude,
          category,
          color: getCategoryColor(category),
          icon: getCategoryIcon(category),
          description: wp.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        importedWaypoints++
      }

      // Import tracks as routes
      let importedTracks = 0
      const currentRoutes = useMapStore.getState().routes
      const newRoutes = [...currentRoutes]
      for (const track of tracks) {
        newRoutes.push({
          id: `route-import-${Date.now()}-${importedTracks}`,
          name: track.name,
          color: '#10b981',
          points: track.points.map((p: { latitude: number; longitude: number }) => ({ latitude: p.latitude, longitude: p.longitude })),
          distance: null,
          duration: null,
        })
        importedTracks++
      }
      setRoutes(newRoutes)

      pushNotification({
        type: 'general',
        icon: '📥',
        message: `Imported ${importedWaypoints} waypoints and ${importedTracks} tracks`,
      })
      toast.success(`Imported ${importedWaypoints} waypoints and ${importedTracks} tracks from GPX`)
    } catch (err) {
      console.error('GPX import error:', err)
      toast.error('Failed to import GPX file')
    }

    // Reset the input
    e.target.value = ''
  }, [])

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
    if (measurePoints.length === 2) {
      useMapStore.getState().pushNotification({ type: 'measurement', icon: 'ruler', message: `Measurement completed: ${total < 1 ? `${(total * 1000).toFixed(0)}m` : `${total.toFixed(2)}km`}` })
    }
  }, [measurePoints, setMeasureDistance])

  const handleDeleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const locName = savedLocations.find(l => l.id === id)?.name || 'Location'
        removeSavedLocation(id)
        removeMarker(id)
        if (selectedMarker === id) setSelectedMarker(null)
        useMapStore.getState().pushNotification({ type: 'location', icon: 'trash', message: `${locName} removed from saved locations` })
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

  const routesList = useMapStore((s) => s.routes)

  const { t } = useTranslation()

  const tabs = [
    {
      id: 'locations' as const,
      label: t('tabPlaces'),
      icon: <MapPin className="h-4 w-4" />,
      count: savedLocations.length,
      gradientClass: 'sidebar-section-gradient-locations',
      borderClass: 'sidebar-border-locations',
    },
    {
      id: 'layers' as const,
      label: t('tabLayers'),
      icon: <Layers className="h-4 w-4" />,
      count: null,
      gradientClass: 'sidebar-section-gradient-layers',
      borderClass: 'sidebar-border-layers',
    },
    {
      id: 'tools' as const,
      label: t('tabTools'),
      icon: <Wrench className="h-4 w-4" />,
      count: null,
      gradientClass: 'sidebar-section-gradient-tools',
      borderClass: 'sidebar-border-tools',
    },
    {
      id: 'routes' as const,
      label: t('tabRoutes'),
      icon: <Route className="h-4 w-4" />,
      count: routesList.length,
      gradientClass: 'sidebar-section-gradient-routes',
      borderClass: 'sidebar-border-routes',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Gradient top border - enhanced with animation */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Header with gradient accent */}
      <div className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />
        <div className="relative px-4 py-3 border-b">
          <h1 className="font-bold text-lg flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="gradient-text text-base font-bold">MapLibre Explorer</span>
              <p className="text-[10px] text-muted-foreground font-normal -mt-0.5">
                Interactive Map Application
              </p>
            </div>
          </h1>
        </div>
      </div>

      {/* Tab navigation with pill-style indicator and count badges */}
      <div className="flex border-b bg-muted/30 shrink-0 px-2 py-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-1 text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 relative rounded-lg',
              sidebarTab === tab.id
                ? 'sidebar-tab-active bg-primary/5 text-primary scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <span className={cn(
              'transition-transform duration-200 relative',
              sidebarTab === tab.id && 'scale-110'
            )}>
              {tab.icon}
              {tab.count !== null && tab.count > 0 && (
                <span className={cn(
                  'sidebar-count-badge absolute -top-1.5 -right-3',
                  sidebarTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              )}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content with AnimatePresence - smooth slide transition */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
          >
            {sidebarTab === 'locations' && (
              <div className="h-full sidebar-section-gradient-locations">
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
              </div>
            )}
            {sidebarTab === 'layers' && (
              <div className="h-full sidebar-section-gradient-layers">
              <LayersTab />
              </div>
            )}
            {sidebarTab === 'tools' && (
              <div className="h-full sidebar-section-gradient-tools">
              <ToolsTab
                toolMode={toolMode}
                setToolMode={setToolMode}
                measurePoints={measurePoints}
                measureDistance={measureDistance}
                clearMeasurePoints={clearMeasurePoints}
                onExportGeoJSON={handleExportGeoJSON}
                onGPXImportClick={() => gpxInputRef.current?.click()}
                areaPoints={areaPoints}
                areaResult={areaResult}
                clearAreaPoints={clearAreaPoints}
              />
              </div>
            )}
            {sidebarTab === 'routes' && (
              <div className="h-full sidebar-section-gradient-routes">
              <RoutesTab
                onGPXImportClick={() => gpxRouteInputRef.current?.click()}
              />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden file inputs for GPX import */}
      <input
        ref={gpxInputRef}
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={handleGPXImport}
        aria-label="Import GPX file"
      />
      <input
        ref={gpxRouteInputRef}
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={handleGPXImport}
        aria-label="Import GPX file for routes"
      />

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

export function MapSidebar() {
  const { sidebarOpen, setSidebarOpen } = useMapStore()

  // Mobile detection - only render Sheet on mobile viewports
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close sidebar on mobile by default on initial mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [setSidebarOpen])

  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <div
        className={cn(
          'hidden md:flex absolute left-0 top-0 bottom-0 z-20 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'absolute z-30 bg-background/95 backdrop-blur-sm border rounded-full p-1.5 shadow-lg hover:bg-accent transition-all duration-200 hover:scale-110',
            sidebarOpen ? '-right-3 top-4' : 'right-3 top-4'
          )}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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
            'w-80 bg-background/95 backdrop-blur-xl border-r flex flex-col sidebar-shadow sidebar-inner-glow relative transition-opacity duration-200',
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="relative z-10 h-full flex flex-col">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile sidebar - Sheet/drawer (only renders on mobile) */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>MapLibre Explorer Sidebar</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation sidebar for map locations, layers, and tools
              </SheetDescription>
            </SheetHeader>
            <SidebarContent onCloseMobile={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile toggle button - positioned below search bar to avoid overlap */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute left-3 top-[58px] z-20 bg-background/95 backdrop-blur-sm border rounded-xl p-2 shadow-lg hover:bg-accent transition-all duration-200 hover:scale-105"
          aria-label="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}
    </>
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
  const collapsedSections = useMapStore((s) => s.collapsedSections)

  return (
    <div className="flex flex-col h-full">
      {/* Saved Locations Section - Collapsible */}
      <Collapsible
        open={!collapsedSections['section-places-saved']}
        onOpenChange={() => useMapStore.getState().toggleSection('section-places-saved')}
        className="flex flex-col flex-1 min-h-0"
      >
        {/* Search & filter */}
        <div className="p-3 space-y-2 border-b bg-muted/20 shrink-0">
          <SectionHeader
            title="Saved Locations"
            sectionId="section-places-saved"
            icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
            count={totalCount}
          />
          <CollapsibleContent>
          <Input
            placeholder="Filter locations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-8 text-sm"
            aria-label="Filter locations"
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
                aria-label={`Filter by ${cat.label}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          </CollapsibleContent>
        </div>

        {/* Export GPX button for locations */}
        {locations.length > 0 && !collapsedSections['section-places-saved'] && (
          <div className="px-3 pt-2 pb-1 shrink-0">
            <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-[11px] justify-center rounded-xl gpx-export-btn"
            onClick={() => exportGPX('markers', { markers: locations as unknown as Record<string, unknown>[] })}
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export All as GPX
          </Button>
        </div>
      )}

      {/* Locations list */}
      <CollapsibleContent>
      <div className="relative flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {locations.length === 0 ? (
              <div className="empty-state-container">
                <div className="empty-state-icon-wrapper">
                  <MapPinned className="h-8 w-8 opacity-40" />
                </div>
                <p className="text-sm font-medium">No saved locations yet</p>
                <p className="text-xs mt-1 max-w-[200px] mx-auto text-muted-foreground">
                  Click the &quot;+&quot; button on the map or use the Drop Pin
                  tool to save places
                </p>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 rounded-xl"
                    onClick={() => useMapStore.getState().setToolMode('mark')}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Start Dropping Pins
                  </Button>
                  <span className="text-[10px] text-muted-foreground/50">or explore nearby places below</span>
                </div>
              </div>
          ) : (
            locations.map((loc, locIndex) => {
              const cat = categories.find((c) => c.id === loc.category)
              const isSelected = selectedMarker === loc.id
              return (
                <div
                  key={loc.id}
                  className={cn(
                    'group flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer sidebar-item-slide-in',
                    isSelected
                      ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10'
                      : 'hover:bg-accent/50 border-transparent hover:border-border hover:shadow-sm hover:translate-x-0.5'
                  )}
                  style={{ animationDelay: `${locIndex * 40}ms` }}
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
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: loc.color }}
                      />
                      <p className="text-sm font-medium truncate location-name-truncate" title={loc.name}>{loc.name}</p>
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
                    aria-label={`Delete ${loc.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })
          )}
          </div>
        </ScrollArea>
        {/* Bottom fade gradient */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </div>
      </CollapsibleContent>
      </Collapsible>

      {/* Nearby POI Search - Collapsible */}
      <Collapsible
        open={!collapsedSections['section-places-nearby']}
        onOpenChange={() => useMapStore.getState().toggleSection('section-places-nearby')}
      >
        <div className="mt-3 pt-3 border-t px-3 pb-3">
          <SectionHeader
            title="Nearby Places"
            sectionId="section-places-nearby"
            icon={<MapPinned className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <NearbyPanel />
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Location History Timeline - Collapsible */}
      <Collapsible
        open={!collapsedSections['section-places-history']}
        onOpenChange={() => useMapStore.getState().toggleSection('section-places-history')}
      >
        <div className="mt-3 pt-3 border-t px-3 pb-3">
          <SectionHeader
            title="Location History"
            sectionId="section-places-history"
            icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <LocationHistoryTimeline />
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

function LayersTab() {
  const { layerVisibility, setLayerVisibility, clusteringEnabled, setClusteringEnabled, buildingExtrusion, setBuildingExtrusion, terrainExaggeration, setTerrainExaggeration, weatherEnabled, setWeatherEnabled, trafficEnabled, setTrafficEnabled, earthquakesEnabled, setEarthquakesEnabled, heatmapEnabled, setHeatmapEnabled, sunPositionEnabled, setSunPositionEnabled } = useMapStore()

  const layerConfig = [
    { id: 'water' as const, name: 'Water Bodies', icon: '🌊', color: '#06b6d4' },
    { id: 'roads' as const, name: 'Roads', icon: '🛣️', color: '#6b7280' },
    { id: 'buildings' as const, name: 'Buildings', icon: '🏗️', color: '#f59e0b' },
    { id: 'parks' as const, name: 'Parks & Land Use', icon: '🌳', color: '#22c55e' },
    { id: 'labels' as const, name: 'Labels & Places', icon: '🏷️', color: '#f97316' },
  ]

  const visibleCount = Object.values(layerVisibility).filter(Boolean).length

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Map Layers - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-layers-map']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-layers-map')}
        >
          <SectionHeader
            title="Map Layers"
            sectionId="section-layers-map"
            icon={<Layers className="h-3.5 w-3.5 text-muted-foreground" />}
            count={visibleCount}
          />
          <CollapsibleContent>
          <div className="space-y-1">
            {layerConfig.map((layer) => (
              <button
                key={layer.id}
                onClick={() =>
                  setLayerVisibility({
                    [layer.id]: !layerVisibility[layer.id],
                  })
                }
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 text-left group',
                  layerVisibility[layer.id]
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
                    opacity: layerVisibility[layer.id] ? 1 : 0.3,
                  }}
                />
                {layerVisibility[layer.id] ? (
                  <Eye className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 3D Options */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Mountain className="h-3.5 w-3.5 text-muted-foreground" />
            3D View
          </h3>
          <div className="space-y-3">
            <div className="px-3 py-2 rounded-xl border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">3D Terrain &amp; Buildings</p>
                    <p className="text-[10px] text-muted-foreground">
                      Elevation + extruded buildings
                    </p>
                  </div>
                </div>
                <Switch
                  checked={buildingExtrusion}
                  onCheckedChange={(checked) => {
                    setBuildingExtrusion(checked)
                    useMapStore.getState().pushNotification({ type: 'terrain', icon: 'mountain', message: checked ? '3D terrain enabled' : '3D terrain disabled' })
                  }}
                  aria-label="Toggle 3D view"
                />
              </div>
              {buildingExtrusion && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Terrain exaggeration</span>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      {terrainExaggeration.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={terrainExaggeration}
                    onChange={(e) => setTerrainExaggeration(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-accent accent-primary"
                    aria-label="Terrain exaggeration"
                  />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[9px] text-muted-foreground/60">1×</span>
                    <span className="text-[9px] text-muted-foreground/60">3×</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Marker Clustering */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            Marker Clustering
          </h3>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border bg-background">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">Cluster Markers</p>
                <p className="text-[10px] text-muted-foreground">
                  Group nearby markers (&gt;5)
                </p>
              </div>
            </div>
            <Switch
              checked={clusteringEnabled}
              onCheckedChange={setClusteringEnabled}
              aria-label="Toggle marker clustering"
            />
          </div>
        </div>

        <Separator />

        {/* Overlay Data */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Overlay Data
          </h3>
          <div className="space-y-1.5">
            {/* Weather overlay - real toggle */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
                weatherEnabled
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
            >
              <span className="text-base">🌤️</span>
              <div className="flex-1">
                <p className="text-sm">Weather</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Real-time weather
                </p>
              </div>
              <Switch
                checked={weatherEnabled}
                onCheckedChange={(checked) => {
                  setWeatherEnabled(checked)
                  useMapStore.getState().pushNotification({ type: 'weather', icon: 'cloud', message: checked ? 'Weather data loaded' : 'Weather overlay disabled' })
                }}
                aria-label="Toggle weather overlay"
              />
            </div>

            {/* Traffic overlay - real toggle */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
                trafficEnabled
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
            >
              <Navigation className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <p className="text-sm">Traffic</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Live traffic flow data
                </p>
              </div>
              <Switch
                checked={trafficEnabled}
                onCheckedChange={(checked) => {
                  setTrafficEnabled(checked)
                  useMapStore.getState().pushNotification({ type: 'general', icon: 'car', message: checked ? 'Traffic overlay enabled' : 'Traffic overlay disabled' })
                }}
                aria-label="Toggle traffic overlay"
              />
            </div>

            {/* Earthquakes overlay */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
                earthquakesEnabled
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
            >
              <Globe2 className="h-4 w-4 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm">Earthquakes</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Real-time seismic activity (USGS)
                </p>
              </div>
              <Switch
                checked={earthquakesEnabled}
                onCheckedChange={(checked) => {
                  setEarthquakesEnabled(checked)
                  useMapStore.getState().pushNotification({ type: 'general', icon: 'globe', message: checked ? 'Earthquake data loaded' : 'Earthquake overlay disabled' })
                }}
                aria-label="Toggle earthquakes overlay"
              />
            </div>

            {/* Heatmap overlay */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
                heatmapEnabled
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
            >
              <span className="text-base">🔥</span>
              <div className="flex-1">
                <p className="text-sm">Heatmap</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Marker density visualization
                </p>
              </div>
              <Switch
                checked={heatmapEnabled}
                onCheckedChange={(checked) => {
                  setHeatmapEnabled(checked)
                  useMapStore.getState().pushNotification({ type: 'general', icon: 'fire', message: checked ? 'Heatmap enabled' : 'Heatmap disabled' })
                }}
                aria-label="Toggle heatmap overlay"
              />
            </div>

            {/* Sun Position & Day/Night overlay */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200',
                sunPositionEnabled
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
            >
              <span className="text-base">☀️</span>
              <div className="flex-1">
                <p className="text-sm">Sun Position & Day/Night</p>
                <p className="text-[10px] text-muted-foreground/70">
                  Terminator line & solar position
                </p>
              </div>
              <Switch
                checked={sunPositionEnabled}
                onCheckedChange={(checked) => {
                  setSunPositionEnabled(checked)
                  useMapStore.getState().pushNotification({ type: 'general', icon: 'sun', message: checked ? 'Sun position overlay enabled' : 'Sun position overlay disabled' })
                }}
                aria-label="Toggle sun position overlay"
              />
            </div>

            {/* Air Quality overlay */}
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer',
                useMapStore.getState().aqiPanelOpen
                  ? 'bg-background border-border/50 shadow-sm'
                  : 'border-dashed text-muted-foreground hover:border-border'
              )}
              onClick={() => useMapStore.getState().setAqiPanelOpen(true)}
            >
              <Wind className="h-4 w-4 text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm">Air Quality</p>
                <p className="text-[10px] text-muted-foreground/70">
                  AQI & pollutant monitoring
                </p>
              </div>
              <Badge variant="secondary" className="text-[9px] px-1.5">Open</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Map Theme Customizer - Collapsible */}
        <Separator />
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-layers-theme']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-layers-theme')}
        >
          <SectionHeader
            title="Theme Customizer"
            sectionId="section-layers-theme"
            icon={<Palette className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <MapThemeCustomizer />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Custom Tile Sources - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-layers-tiles']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-layers-tiles')}
        >
          <SectionHeader
            title="Custom Tile Sources"
            sectionId="section-layers-tiles"
            icon={<Globe2 className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <CustomTileSourceList />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Image Overlays - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-layers-overlays']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-layers-overlays')}
        >
          <SectionHeader
            title="Image Overlays"
            sectionId="section-layers-overlays"
            icon={<ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <ImageOverlayManager />
          </CollapsibleContent>
        </Collapsible>
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
  onGPXImportClick,
  areaPoints,
  areaResult,
  clearAreaPoints,
}: {
  toolMode: ToolMode
  setToolMode: (mode: ToolMode) => void
  measurePoints: { longitude: number; latitude: number }[]
  measureDistance: number | null
  clearMeasurePoints: () => void
  onExportGeoJSON: () => void
  onGPXImportClick: () => void
  areaPoints: { longitude: number; latitude: number }[]
  areaResult: number | null
  clearAreaPoints: () => void
}) {
  const center = useMapStore((s) => s.center)
  const drawings = useMapStore((s) => s.drawings)
  const currentDrawing = useMapStore((s) => s.currentDrawing)
  const drawColor = useMapStore((s) => s.drawColor)
  const drawWidth = useMapStore((s) => s.drawWidth)
  const setDrawColor = useMapStore((s) => s.setDrawColor)
  const setDrawWidth = useMapStore((s) => s.setDrawWidth)
  const deleteDrawing = useMapStore((s) => s.deleteDrawing)

  const drawColorOptions = [
    { id: '#22c55e', label: 'Green', class: 'bg-green-500' },
    { id: '#ef4444', label: 'Red', class: 'bg-red-500' },
    { id: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
    { id: '#f97316', label: 'Orange', class: 'bg-orange-500' },
    { id: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
    { id: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  ]
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Active Tool */}
        <div className="sidebar-border-tools pl-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5" />
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
                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/50 font-mono">
                    {tool.shortcut}
                  </kbd>
                  {toolMode === tool.id && (
                    <ArrowRight className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Drawing section */}
        {toolMode === 'draw' && (
          <>
            <Separator />
            <div className="sidebar-border-draw pl-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Drawing
                </h4>
              </div>

              {/* Drawing mode hint */}
              {currentDrawing && currentDrawing.length > 0 ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Drawing on map... {currentDrawing.length} points
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-muted-foreground">
                    Click and drag on the map to draw freehand annotations.
                  </p>
                </div>
              )}

              {/* Color picker */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex gap-1.5">
                  {drawColorOptions.map((c) => (
                    <button
                      key={c.id}
                      className={cn(
                        'w-6 h-6 rounded-full transition-all',
                        c.class,
                        drawColor === c.id
                          ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                          : 'opacity-60 hover:opacity-100'
                      )}
                      onClick={() => setDrawColor(c.id)}
                      title={c.label}
                      aria-label={`Drawing color: ${c.label}`}
                    />
                  ))}
                </div>
              </div>

              {/* Line width slider */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Line width</span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">
                    {drawWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={drawWidth}
                  onChange={(e) => setDrawWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-accent accent-green-500"
                  aria-label="Drawing line width"
                />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-muted-foreground/60">1</span>
                  <span className="text-[9px] text-muted-foreground/60">8</span>
                </div>
              </div>

              {/* Saved drawings list */}
              {drawings.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Saved Drawings
                    </h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        drawings.forEach((d) => deleteDrawing(d.id))
                        toast.success('All drawings cleared')
                      }}
                    >
                      <Minus className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {drawings.map((drawing) => (
                      <div
                        key={drawing.id}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-background/50 text-xs group"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: drawing.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">
                            {drawing.name}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {drawing.points.length} points · {drawing.width}px
                          </span>
                        </div>
                        <button
                          className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                          onClick={() => {
                            deleteDrawing(drawing.id)
                            toast.success(`"${drawing.name}" deleted`)
                          }}
                          aria-label={`Delete ${drawing.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Measurement results */}
        {toolMode === 'measure' && (
          <>
            <Separator />
            <div className="sidebar-border-measure pl-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Ruler className="h-3.5 w-3.5" />
                  Measurement
                </h4>
                {measurePoints.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-destructive"
                    onClick={clearMeasurePoints}
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              {measurePoints.length === 0 ? (
                <div className="empty-state-container py-6">
                  <div className="empty-state-icon-wrapper" style={{ width: 48, height: 48, borderRadius: '0.75rem' }}>
                    <Ruler className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-xs font-medium mt-2">No measurements yet</p>
                  <p className="text-[10px] mt-1 text-muted-foreground">
                    Click on the map to add measurement points
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {measureDistance !== null && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Total Distance
                        </span>
                        <span className="text-lg font-bold text-amber-600 tabular-nums">
                          {formatDistance(measureDistance)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                    <span className="text-xs text-muted-foreground">
                      Points
                    </span>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {measurePoints.length}
                    </Badge>
                  </div>
                  {/* Segment distances and bearings */}
                  {measurePoints.length >= 2 && (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {measurePoints.slice(0, -1).map((p, i) => {
                        const next = measurePoints[i + 1]
                        const segDist = haversineDistance(p.latitude, p.longitude, next.latitude, next.longitude)
                        const bearing = calculateBearing(p.latitude, p.longitude, next.latitude, next.longitude)
                        return (
                          <div
                            key={`seg-${i}`}
                            className="px-2.5 py-2 rounded-lg bg-muted/40 border border-border/30"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Segment {i + 1} → {i + 2}
                              </span>
                              <span className="text-xs font-semibold text-amber-600 tabular-nums">
                                {formatDistance(segDist)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Compass className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground tabular-nums">
                                {formatBearing(bearing)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {measurePoints.map((p, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="font-mono tabular-nums">
                          {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Elevation summary */}
                  <ElevationSummaryInline measurePoints={measurePoints} />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={clearMeasurePoints}
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Clear
                    </Button>
                    {measurePoints.length >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          const lines: string[] = ['Measurement Results', '']
                          measurePoints.slice(0, -1).forEach((p, i) => {
                            const next = measurePoints[i + 1]
                            const segDist = haversineDistance(p.latitude, p.longitude, next.latitude, next.longitude)
                            const bearing = calculateBearing(p.latitude, p.longitude, next.latitude, next.longitude)
                            lines.push(`Segment ${i + 1} → ${i + 2}: ${formatDistance(segDist)} (${formatBearing(bearing)})`)
                          })
                          if (measureDistance !== null) {
                            lines.push('')
                            lines.push(`Total Distance: ${formatDistance(measureDistance)}`)
                          }
                          navigator.clipboard.writeText(lines.join('\n')).then(() => {
                            toast.success('Measurements copied to clipboard!')
                          }).catch(() => {
                            toast.error('Failed to copy measurements')
                          })
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Area measurement results */}
        {toolMode === 'area' && (
          <>
            <Separator />
            <div className="sidebar-border-area pl-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Pentagon className="h-3.5 w-3.5" />
                  Area Measurement
                </h4>
                {areaPoints.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground hover:text-destructive"
                    onClick={clearAreaPoints}
                  >
                    <Minus className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              {areaPoints.length === 0 ? (
                <div className="empty-state-container py-6">
                  <div className="empty-state-icon-wrapper" style={{ width: 48, height: 48, borderRadius: '0.75rem', background: 'linear-gradient(135deg, oklch(0.6 0.2 300 / 8%), oklch(0.5 0.22 280 / 4%))', borderColor: 'oklch(0.6 0.2 300 / 10%)' }}>
                    <Pentagon className="h-6 w-6 text-violet-500 opacity-60" />
                  </div>
                  <p className="text-xs font-medium mt-2">No area measurements</p>
                  <p className="text-[10px] mt-1 text-muted-foreground">
                    Click on the map to place polygon vertices
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    3+ points required to calculate area
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {areaResult !== null && (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-violet-500/10 border border-violet-500/20 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Area
                        </span>
                        <span className="text-lg font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                          {formatArea(areaResult)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Perimeter
                        </span>
                        <span className="text-sm font-semibold text-violet-500/80 tabular-nums">
                          {formatDistance(calculatePerimeter(areaPoints))}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                    <span className="text-xs text-muted-foreground">
                      Vertices
                    </span>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {areaPoints.length}
                    </Badge>
                  </div>
                  {areaPoints.length < 3 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        Need {3 - areaPoints.length} more point{3 - areaPoints.length !== 1 ? 's' : ''} to calculate area
                      </p>
                    </div>
                  )}
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {areaPoints.map((p, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="font-mono tabular-nums">
                          {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={clearAreaPoints}
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Clear
                    </Button>
                    {areaResult !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => {
                          const text = `Area: ${formatArea(areaResult)}\nPerimeter: ${formatDistance(calculatePerimeter(areaPoints))}\nVertices: ${areaPoints.length}`
                          navigator.clipboard.writeText(text).then(() => {
                            toast.success('Area measurement copied!')
                          }).catch(() => {
                            toast.error('Failed to copy')
                          })
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1.5" />
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <Separator />
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Download className="h-3.5 w-3.5" />
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
              onClick={() => {
                const exportImage = (window as unknown as Record<string, () => void>).__mapExportImage
                if (exportImage) {
                  exportImage()
                } else {
                  toast.error('Map not ready for export')
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-2" />
              Export as Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs justify-start rounded-xl gpx-export-btn"
              onClick={() => {
                const state = useMapStore.getState()
                exportGPX('all', {
                  markers: state.savedLocations as unknown as Record<string, unknown>[],
                  routes: state.routes as unknown as Record<string, unknown>[],
                })
              }}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export All as GPX
            </Button>
          </div>
        </div>

        <Separator />

        {/* Import GPX */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Upload className="h-3.5 w-3.5" />
            Import Data
          </h4>
          <button
            onClick={onGPXImportClick}
            className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
            aria-label="Import GPX file"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <FileUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Drop GPX file or click to browse
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                Waypoints & tracks will be imported
              </p>
            </div>
          </button>
        </div>

        <Separator />

        {/* Isochrone Visualization */}
        <IsochroneControls />

        <Separator />

        {/* Quick Bookmarks - European Cities */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Star className="h-3.5 w-3.5" />
            Popular Destinations
          </h4>
          <div className="space-y-1">
            {[
              { name: 'Ljubljana', lat: 46.0569, lng: 14.5058, flag: '🇸🇮', color: '#22c55e' },
              { name: 'Vienna', lat: 48.2082, lng: 16.3738, flag: '🇦🇹', color: '#ef4444' },
              { name: 'Venice', lat: 45.4408, lng: 12.3155, flag: '🇮🇹', color: '#06b6d4' },
              { name: 'Munich', lat: 48.1351, lng: 11.5820, flag: '🇩🇪', color: '#f59e0b' },
              { name: 'Zagreb', lat: 45.8150, lng: 15.9819, flag: '🇭🇷', color: '#3b82f6' },
              { name: 'Budapest', lat: 47.4979, lng: 19.0402, flag: '🇭🇺', color: '#8b5cf6' },
              { name: 'Prague', lat: 50.0755, lng: 14.4378, flag: '🇨🇿', color: '#f97316' },
              { name: 'Paris', lat: 48.8566, lng: 2.3522, flag: '🇫🇷', color: '#ec4899' },
            ].map((city) => {
              const distance = haversineDistance(city.lat, city.lng, center[1], center[0])
              const isNearby = distance < 500
              return (
                <div
                  key={city.name}
                  className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all duration-200 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    borderColor: city.color + '30',
                    backgroundColor: city.color + '08',
                  }}
                >
                  <span className="text-base leading-none">{city.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{city.name}</span>
                      {isNearby && (
                        <Badge
                          variant="secondary"
                          className="text-[8px] px-1 py-0 h-3.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 shrink-0"
                        >
                          Nearby
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                      if (flyTo) flyTo(city.lng, city.lat, 12)
                    }}
                    className="opacity-60 hover:opacity-100 p-1.5 rounded-lg hover:bg-background/80 transition-all shrink-0"
                    aria-label={`Fly to ${city.name}`}
                  >
                    <Navigation className="h-3 w-3" style={{ color: city.color }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Geofences - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-tools-geofences']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-tools-geofences')}
        >
          <SectionHeader
            title="Geofences"
            sectionId="section-tools-geofences"
            icon={<Shield className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <GeofenceSection />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Map Snapshots - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-tools-snapshots']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-tools-snapshots')}
        >
          <SectionHeader
            title="Map Snapshots"
            sectionId="section-tools-snapshots"
            icon={<Camera className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <SnapshotManager />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Spatial Analysis - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-tools-spatial']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-tools-spatial')}
        >
          <SectionHeader
            title="Spatial Analysis"
            sectionId="section-tools-spatial"
            icon={<Activity className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <SpatialAnalysisPanel />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Analytics Dashboard - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-tools-analytics']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-tools-analytics')}
        >
          <SectionHeader
            title="Analytics Dashboard"
            sectionId="section-tools-analytics"
            icon={<BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            <div className="px-2 py-2">
              <p className="text-xs text-muted-foreground mb-3">
                View your map activity stats, session time, and usage charts.
              </p>
              <Button
                size="sm"
                className="w-full h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                onClick={() => useMapStore.getState().setAnalyticsPanelOpen(true)}
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Open Analytics Dashboard
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Accessibility - Collapsible */}
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-tools-accessibility']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-tools-accessibility')}
        >
          <SectionHeader
            title="Accessibility"
            sectionId="section-tools-accessibility"
            icon={<Eye className="h-3.5 w-3.5 text-muted-foreground" />}
          />
          <CollapsibleContent>
            {/* Accessibility settings inline */}
            <AccessibilitySection />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Keyboard shortcuts reference */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Keyboard className="h-3.5 w-3.5" />
            Keyboard Shortcuts
          </h4>
          <div className="space-y-1">
            {[
              { keys: ['1', '2', '3'], desc: 'Switch tools' },
              { keys: ['/'], desc: 'Focus search' },
              { keys: ['Esc'], desc: 'Clear selection' },
              { keys: ['B'], desc: 'Toggle sidebar' },
              { keys: ['F'], desc: 'Fullscreen' },
              { keys: ['L'], desc: 'My location' },
            ].map((shortcut) => (
              <div key={shortcut.desc} className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-muted-foreground">{shortcut.desc}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd key={key} className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/50 font-mono">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

// Accessibility section component for the Tools tab
function AccessibilitySection() {
  const highContrastMode = useMapStore((s) => s.highContrastMode)
  const setHighContrastMode = useMapStore((s) => s.setHighContrastMode)
  const largeTextMode = useMapStore((s) => s.largeTextMode)
  const setLargeTextMode = useMapStore((s) => s.setLargeTextMode)
  const reducedMotionMode = useMapStore((s) => s.reducedMotionMode)
  const setReducedMotionMode = useMapStore((s) => s.setReducedMotionMode)
  const colorBlindMode = useMapStore((s) => s.colorBlindMode)
  const setColorBlindMode = useMapStore((s) => s.setColorBlindMode)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">High Contrast</span>
        </div>
        <Switch checked={highContrastMode} onCheckedChange={setHighContrastMode} />
      </div>
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Type className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">Large Text</span>
        </div>
        <Switch checked={largeTextMode} onCheckedChange={setLargeTextMode} />
      </div>
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">Reduced Motion</span>
        </div>
        <Switch checked={reducedMotionMode} onCheckedChange={setReducedMotionMode} />
      </div>
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">Color Blind Mode</span>
        </div>
        <Switch checked={colorBlindMode} onCheckedChange={setColorBlindMode} />
      </div>
    </div>
  )
}

// Geofence section component for the Tools tab
function GeofenceSection() {
  const geofences = useMapStore((s) => s.geofences)

  return (
    <div>
      <GeofenceManager
        onCreateGeofence={() => {
          const center = useMapStore.getState().center
          window.dispatchEvent(new CustomEvent('map-create-geofence', { detail: { lat: center[1], lng: center[0] } }))
        }}
      />
    </div>
  )
}

// Isochrone visualization controls component
function IsochroneControls() {
  const isochroneEnabled = useMapStore((s) => s.isochroneEnabled)
  const isochroneMinutes = useMapStore((s) => s.isochroneMinutes)
  const isochroneMode = useMapStore((s) => s.isochroneMode)
  const setIsochroneEnabled = useMapStore((s) => s.setIsochroneEnabled)
  const setIsochroneMinutes = useMapStore((s) => s.setIsochroneMinutes)
  const setIsochroneMode = useMapStore((s) => s.setIsochroneMode)

  const modeOptions = [
    { id: 'walking' as const, label: 'Walking', icon: <Footprints className="h-3.5 w-3.5" />, speed: '5 km/h' },
    { id: 'cycling' as const, label: 'Cycling', icon: <Bike className="h-3.5 w-3.5" />, speed: '15 km/h' },
    { id: 'driving' as const, label: 'Driving', icon: <Car className="h-3.5 w-3.5" />, speed: '40 km/h' },
  ]

  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
        <span className="text-sm">🎯</span>
        Reachability (Isochrone)
      </h4>
      <div
        className={cn(
          'px-3 py-2.5 rounded-xl border transition-all duration-200',
          isochroneEnabled
            ? 'bg-background border-border/50 shadow-sm'
            : 'border-dashed text-muted-foreground hover:border-border'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <div>
              <p className="text-sm">Isochrone</p>
              <p className="text-[10px] text-muted-foreground/70">
                Show travel reachability area
              </p>
            </div>
          </div>
          <Switch
            checked={isochroneEnabled}
            onCheckedChange={(checked) => {
              setIsochroneEnabled(checked)
              useMapStore.getState().pushNotification({ type: 'general', icon: 'target', message: checked ? 'Isochrone visualization enabled' : 'Isochrone visualization disabled' })
            }}
            aria-label="Toggle isochrone visualization"
          />
        </div>

        {isochroneEnabled && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* Minutes slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Travel time</span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                  {isochroneMinutes} min
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={isochroneMinutes}
                onChange={(e) => setIsochroneMinutes(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-accent accent-emerald-500"
                aria-label="Isochrone travel time in minutes"
              />
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-muted-foreground/60">5 min</span>
                <span className="text-[9px] text-muted-foreground/60">60 min</span>
              </div>
            </div>

            {/* Mode buttons */}
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">Travel mode</span>
              <div className="flex gap-1.5">
                {modeOptions.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setIsochroneMode(mode.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs transition-all duration-200',
                      isochroneMode === mode.id
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'border-border/50 hover:border-border hover:bg-accent/50 text-muted-foreground'
                    )}
                    aria-label={`Isochrone mode: ${mode.label}`}
                  >
                    {mode.icon}
                    <span className="text-[10px] font-medium">{mode.label}</span>
                    <span className="text-[9px] text-muted-foreground/60">{mode.speed}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RoutesTab({ onGPXImportClick }: { onGPXImportClick: () => void }) {
  const routePoints = useMapStore((s) => s.routePoints)
  const currentRouteColor = useMapStore((s) => s.currentRouteColor)
  const routes = useMapStore((s) => s.routes)
  const toolMode = useMapStore((s) => s.toolMode)
  const removeRoutePoint = useMapStore((s) => s.removeRoutePoint)
  const clearRoutePoints = useMapStore((s) => s.clearRoutePoints)
  const setCurrentRouteColor = useMapStore((s) => s.setCurrentRouteColor)
  const saveRoute = useMapStore((s) => s.saveRoute)
  const deleteRoute = useMapStore((s) => s.deleteRoute)
  const setRoutes = useMapStore((s) => s.setRoutes)
  const setToolMode = useMapStore((s) => s.setToolMode)
  const osrmDistance = useMapStore((s) => s.osrmDistance)
  const osrmDuration = useMapStore((s) => s.osrmDuration)
  const elevationRouteId = useMapStore((s) => s.elevationRouteId)
  const setElevationRouteId = useMapStore((s) => s.setElevationRouteId)
  const comparedRoutes = useMapStore((s) => s.comparedRoutes)
  const addComparedRoute = useMapStore((s) => s.addComparedRoute)
  const removeComparedRoute = useMapStore((s) => s.removeComparedRoute)
  const clearComparedRoutes = useMapStore((s) => s.clearComparedRoutes)
  const setTerrainAnalysisRouteId = useMapStore((s) => s.setTerrainAnalysisRouteId)

  const [routeName, setRouteName] = useState('')
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set())
  const [routeSubTab, setRouteSubTab] = useState<'directions' | 'analytics'>('directions')

  // Load routes from database on mount
  useEffect(() => {
    fetch('/api/routes')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch routes')
        return res.json()
      })
      .then((dbRoutes) => {
        if (Array.isArray(dbRoutes) && dbRoutes.length > 0) {
          const mapRoutes: MapRoute[] = dbRoutes.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            name: r.name as string,
            color: r.color as string,
            points: JSON.parse(r.waypoints as string || '[]') as RoutePoint[],
            distance: r.distance as number | null,
            duration: r.duration as number | null,
          }))
          setRoutes(mapRoutes)
        }
      })
      .catch((err) => {
        console.error('Failed to load routes from database:', err)
      })
  }, [setRoutes])

  const colorOptions = [
    { id: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
    { id: '#ef4444', label: 'Red', class: 'bg-red-500' },
    { id: '#22c55e', label: 'Green', class: 'bg-green-500' },
    { id: '#f97316', label: 'Orange', class: 'bg-orange-500' },
    { id: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
    { id: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  ]

  // Calculate live distance for current route
  const currentDistance = (() => {
    if (routePoints.length < 2) return null
    let total = 0
    for (let i = 1; i < routePoints.length; i++) {
      total += haversineDistance(
        routePoints[i - 1].latitude,
        routePoints[i - 1].longitude,
        routePoints[i].latitude,
        routePoints[i].longitude
      )
    }
    return total
  })()

  const handleSaveRoute = async () => {
    if (routePoints.length < 2) return
    const name = routeName.trim() || `Route ${routes.length + 1}`
    saveRoute(name)
    setRouteName('')
    useMapStore.getState().pushNotification({ type: 'route', icon: 'route', message: `Route "${name}" saved` })
    toast.success(`Route "${name}" saved`)

    // Persist to database - get the newly saved route from the store
    const savedRoutes = useMapStore.getState().routes
    const newRoute = savedRoutes.find((r) => r.name === name)
    if (newRoute) {
      try {
        await fetch('/api/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newRoute.name,
            color: newRoute.color,
            distance: newRoute.distance,
            duration: newRoute.duration,
            waypoints: JSON.stringify(newRoute.points),
          }),
        })
      } catch (err) {
        console.error('Failed to persist route to database:', err)
      }
    }
  }

  const handleDeleteRoute = async (id: string, name: string) => {
    deleteRoute(id)
    setSavedRouteIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    toast.success(`Route "${name}" deleted`)

    // Delete from database
    try {
      await fetch(`/api/routes/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete route from database:', err)
    }
  }

  const toggleRouteVisibility = (id: string) => {
    setSavedRouteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDistanceLocal = (d: number | null) => {
    if (d === null) return ''
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`
  }

  const formatDurationLocal = (sec: number | null) => {
    if (sec === null) return ''
    if (sec < 60) return `${Math.round(sec)} sec`
    if (sec < 3600) return `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} sec`
    return `${Math.floor(sec / 3600)} hr ${Math.floor((sec % 3600) / 60)} min`
  }

  const { t } = useTranslation()

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Route className="h-3.5 w-3.5 text-muted-foreground" />
          {t('tabRoutes')}
        </h3>

        {/* Sub-tab toggle: Directions / Analytics */}
        <div className="flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
          <button
            onClick={() => setRouteSubTab('directions')}
            className={cn(
              'flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all',
              routeSubTab === 'directions'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('toolDirections')}
          </button>
          <button
            onClick={() => setRouteSubTab('analytics')}
            className={cn(
              'flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all',
              routeSubTab === 'analytics'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('analyticsTitle')}
          </button>
        </div>

        <Separator />

        {/* Analytics sub-tab */}
        {routeSubTab === 'analytics' && (
          <RouteAnalyticsPanel inline />
        )}

        {/* Directions sub-tab */}
        {routeSubTab === 'directions' && (
        <>
        {/* Directions tool hint */}
        {toolMode === 'directions' && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              Directions mode active — click on the map to add waypoints
            </p>
          </div>
        )}

        {/* Import GPX button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs justify-center rounded-xl"
          onClick={onGPXImportClick}
        >
          <Upload className="h-3.5 w-3.5 mr-2" />
          Import GPX Route
        </Button>

        {toolMode !== 'directions' && routePoints.length === 0 && (
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              Select the Directions tool to start drawing a route on the map.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs w-full"
              onClick={() => setToolMode('directions')}
            >
              <Navigation className="h-3 w-3 mr-1" />
              Start Drawing
            </Button>
          </div>
        )}

        {/* Current route drawing */}
        {routePoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Route
            </h4>

            {/* Route profile selector */}
            <div className="flex gap-1.5">
              {[
                { id: 'driving' as const, label: 'Drive', icon: <Car className="h-3 w-3" /> },
                { id: 'cycling' as const, label: 'Bike', icon: <Bike className="h-3 w-3" /> },
                { id: 'walking' as const, label: 'Walk', icon: <Footprints className="h-3 w-3" /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => useMapStore.getState().setRouteProfile(mode.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    useMapStore.getState().routeProfile === mode.id
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              <div className="flex gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.id}
                    className={cn(
                      'w-6 h-6 rounded-full transition-all',
                      c.class,
                      currentRouteColor === c.id
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    onClick={() => setCurrentRouteColor(c.id)}
                    title={c.label}
                    aria-label={`Route color: ${c.label}`}
                  />
                ))}
              </div>
            </div>

            {/* Waypoints list */}
            <div className="space-y-1">
              {routePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-background/50 text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: currentRouteColor }}
                  />
                  <span className="flex-1 text-muted-foreground truncate">
                    {point.name || `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {idx === 0 ? 'A' : idx === routePoints.length - 1 ? 'B' : String(idx + 1)}
                  </span>
                  <button
                    className="p-0.5 hover:text-red-500 transition-colors"
                    onClick={() => removeRoutePoint(idx)}
                    aria-label={`Remove waypoint ${idx + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Distance display */}
            {(currentDistance !== null || osrmDistance !== null) && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                <Ruler className="h-3 w-3" />
                {osrmDistance !== null ? (
                  <>
                    Road: {formatDistanceLocal(osrmDistance)}{osrmDuration !== null ? ` · ${formatDurationLocal(osrmDuration)}` : ''}
                  </>
                ) : (
                  <>Straight: {formatDistanceLocal(currentDistance)}</>
                )}
              </div>
            )}

            {/* Turn-by-turn directions */}
            {useMapStore.getState().routeSteps.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Turn-by-turn
                </h5>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {useMapStore.getState().routeSteps.map((step, idx) => {
                    const icon = getManeuverIcon(step.maneuver.type, step.maneuver.modifier)
                    return (
                      <button
                        key={idx}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-accent/50 transition-colors text-left"
                        onClick={() => {
                          useMapStore.getState().setHighlightedStepIndex(idx)
                          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                          if (flyTo) flyTo(step.maneuver.location[0], step.maneuver.location[1], 16)
                        }}
                      >
                        <span className="text-sm shrink-0">{icon}</span>
                        <span className="flex-1 truncate text-muted-foreground">
                          {step.name || getManeuverLabel(step.maneuver.type, step.maneuver.modifier)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 font-mono tabular-nums shrink-0">
                          {step.distance < 1000 ? `${Math.round(step.distance)}m` : `${(step.distance / 1000).toFixed(1)}km`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Save / Clear buttons */}
            <div className="flex gap-2">
              {routePoints.length >= 2 && (
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Route name..."
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRoute()
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-cyan-500 hover:bg-cyan-600 text-white"
                    onClick={handleSaveRoute}
                  >
                    Save
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={clearRoutePoints}
              >
                Clear
              </Button>
            </div>

            {/* Route Optimizer - shows when 3+ waypoints */}
            {routePoints.length >= 3 && (
              <div className="mt-2">
                <Separator className="mb-2" />
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Route Optimization
                  </span>
                </div>
                <RouteOptimizer />
              </div>
            )}
          </div>
        )}

        {/* Saved routes - Collapsible */}
        {routes.length > 0 && (
          <Collapsible
            open={!useMapStore.getState().collapsedSections['section-routes-saved']}
            onOpenChange={() => useMapStore.getState().toggleSection('section-routes-saved')}
          >
            <SectionHeader
              title="Saved Routes"
              sectionId="section-routes-saved"
              icon={<Route className="h-3.5 w-3.5 text-muted-foreground" />}
              count={routes.length}
            />
            <CollapsibleContent>
            <div className="space-y-1.5">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-xl border hover:bg-accent/50 hover:translate-x-0.5 hover:shadow-sm transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 p-2.5 cursor-pointer">
                  <button
                    className="w-3 h-8 rounded-full shrink-0 transition-opacity"
                    style={{ backgroundColor: route.color, opacity: savedRouteIds.has(route.id) ? 1 : 0.4 }}
                    onClick={() => toggleRouteVisibility(route.id)}
                    title={savedRouteIds.has(route.id) ? 'Hide on map' : 'Show on map'}
                    aria-label={savedRouteIds.has(route.id) ? 'Hide route on map' : 'Show route on map'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{route.name}</p>
                    {route.distance !== null && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceLocal(route.distance)}{route.duration !== null ? ` · ${formatDurationLocal(route.duration)}` : ''} · {route.points.length} pts
                      </p>
                    )}
                  </div>
                  <button
                    className={cn(
                      'p-1 transition-colors',
                      elevationRouteId === route.id
                        ? 'text-emerald-500 hover:text-emerald-600'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                    onClick={() => setElevationRouteId(elevationRouteId === route.id ? null : route.id)}
                    aria-label={`Elevation profile for ${route.name}`}
                    title="Toggle elevation profile"
                  >
                    <Mountain className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className={cn(
                      'p-1 transition-colors',
                      comparedRoutes.includes(route.id)
                        ? 'text-primary hover:text-primary/80'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                    onClick={() => {
                      if (comparedRoutes.includes(route.id)) {
                        removeComparedRoute(route.id)
                      } else {
                        if (comparedRoutes.length >= 3) {
                          toast.warning('Maximum 3 routes can be compared at once')
                          return
                        }
                        addComparedRoute(route.id)
                      }
                    }}
                    aria-label={`Compare route ${route.name}`}
                    title={comparedRoutes.includes(route.id) ? 'Remove from comparison' : 'Add to comparison'}
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className={cn(
                      'p-1 transition-colors',
                      'text-muted-foreground hover:text-primary'
                    )}
                    onClick={() => setTerrainAnalysisRouteId(route.id)}
                    aria-label={`Terrain analysis for ${route.name}`}
                    title="Terrain analysis"
                  >
                    <Activity className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1 hover:text-primary transition-colors text-muted-foreground"
                    onClick={() => exportGPX('route', route as unknown as Record<string, unknown>)}
                    aria-label={`Export route ${route.name} as GPX`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1 hover:text-red-500 transition-colors text-muted-foreground"
                    onClick={() => handleDeleteRoute(route.id, route.name)}
                    aria-label={`Delete route ${route.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  </div>
                  {/* Elevation profile expandable section */}
                  {elevationRouteId === route.id && route.points.length >= 2 && (
                    <div className="px-2.5 pb-2.5 border-t border-border/30 pt-2">
                      <ElevationProfileInline route={route} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Route comparison indicator - Collapsible */}
        {comparedRoutes.length > 0 && (
          <Collapsible
            open={!useMapStore.getState().collapsedSections['section-routes-comparison']}
            onOpenChange={() => useMapStore.getState().toggleSection('section-routes-comparison')}
          >
            <SectionHeader
              title="Route Comparison"
              sectionId="section-routes-comparison"
              icon={<GitCompare className="h-3.5 w-3.5 text-muted-foreground" />}
              count={comparedRoutes.length}
            />
            <CollapsibleContent>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <GitCompare className="h-3 w-3 text-primary" />
                Comparing {comparedRoutes.length} route{comparedRoutes.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearComparedRoutes}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear route comparison"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {comparedRoutes.map((id) => {
                const r = routes.find((rt) => rt.id === id)
                return r ? (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-[10px] gap-1 pr-1"
                    style={{ borderLeft: `3px solid ${r.color}` }}
                  >
                    {r.name}
                    <button
                      onClick={() => removeComparedRoute(id)}
                      className="rounded-full p-0.5 hover:bg-destructive/20"
                      aria-label={`Remove ${r.name} from comparison`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              See the comparison panel on the map for detailed analysis
            </p>
          </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Empty state */}
        {routes.length === 0 && routePoints.length === 0 && toolMode !== 'directions' && (
          <div className="empty-state-container">
            <div className="empty-state-icon-wrapper" style={{ background: 'linear-gradient(135deg, oklch(0.6 0.15 200 / 8%), oklch(0.55 0.12 180 / 4%))', borderColor: 'oklch(0.6 0.15 200 / 10%)' }}>
              <Route className="h-7 w-7 opacity-40" />
            </div>
            <p className="text-sm font-medium">No saved routes</p>
            <p className="text-xs mt-1 max-w-[200px] mx-auto text-muted-foreground">
              Use the Directions tool to draw a route on the map, then save it
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 text-xs gap-1.5 rounded-xl"
              onClick={() => setToolMode('directions')}
            >
              <Navigation className="h-3.5 w-3.5" />
              Start Drawing Route
            </Button>
          </div>
        )}

        {/* Saved Tracks section - Collapsible */}
        <Separator className="my-4" />
        <Collapsible
          open={!useMapStore.getState().collapsedSections['section-routes-tracks']}
          onOpenChange={() => useMapStore.getState().toggleSection('section-routes-tracks')}
        >
          <SectionHeader
            title="Saved Tracks"
            sectionId="section-routes-tracks"
            icon={<Footprints className="h-3.5 w-3.5 text-muted-foreground" />}
            count={useMapStore.getState().savedTracks.length}
          />
          <CollapsibleContent>
            <SavedTracksSection />
          </CollapsibleContent>
        </Collapsible>
        </> )} {/* End directions sub-tab */}
      </div>
    </ScrollArea>
  )
}

// Saved Tracks section for the Routes tab
function SavedTracksSection() {
  const savedTracks = useMapStore((s) => s.savedTracks)

  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
        <Route className="h-3.5 w-3.5" />
        Saved Tracks
      </h4>
      {savedTracks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-xs">No saved tracks</p>
          <p className="text-[10px] mt-1">Record a GPS track to see it here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedTracks.map((track) => (
            <div key={track.id} className="group rounded-xl border border-border/50 p-2.5 hover:bg-accent/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => {
                      const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
                      if (flyTo && track.points.length > 0) {
                        const mid = Math.floor(track.points.length / 2)
                        flyTo(track.points[mid].longitude, track.points[mid].latitude, 14)
                      }
                    }}
                    className="text-xs font-medium text-foreground hover:text-primary transition-colors truncate block text-left"
                  >
                    {track.name}
                  </button>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{track.distance < 1 ? `${Math.round(track.distance * 1000)} m` : `${track.distance.toFixed(2)} km`}</span>
                    <span>·</span>
                    <span>{formatTrackDuration(track.duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="p-1 hover:text-primary transition-colors text-muted-foreground"
                    onClick={() => {
                      // Export GPX
                      const trkpts = track.points.map((p) => {
                        const ele = p.elevation !== null ? `<ele>${p.elevation.toFixed(1)}</ele>` : ''
                        const time = `<time>${new Date(p.timestamp).toISOString()}</time>`
                        return `      <trkpt lat="${p.latitude}" lon="${p.longitude}">${ele}${time}</trkpt>`
                      }).join('\n')
                      const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="MotoTrack"><trk><name>${track.name}</name><trkseg>\n${trkpts}\n    </trkseg></trk></gpx>`
                      const blob = new Blob([gpx], { type: 'application/gpx+xml' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${track.name.replace(/[^a-zA-Z0-9]/g, '_')}.gpx`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                      toast.success('GPX exported')
                    }}
                    aria-label={`Export track ${track.name} as GPX`}
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    className="p-1 hover:text-red-500 transition-colors text-muted-foreground"
                    onClick={() => {
                      useMapStore.getState().deleteTrack(track.id)
                      toast.success(`Track "${track.name}" deleted`)
                    }}
                    aria-label={`Delete track ${track.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTrackDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

// Inline elevation profile component for route detail
function ElevationProfileInline({ route }: { route: MapRoute }) {
  return (
    <ElevationProfile route={route} compact />
  )
}

// Inline elevation summary component for the measurement section
function ElevationSummaryInline({ measurePoints }: { measurePoints: { longitude: number; latitude: number }[] }) {
  const [elevations, setElevations] = useState<number[]>([])
  const [fetchedKey, setFetchedKey] = useState('')

  const pointsKey = measurePoints.length >= 2
    ? measurePoints.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';')
    : ''

  const loading = pointsKey !== '' && pointsKey !== fetchedKey

  useEffect(() => {
    if (!pointsKey) return
    if (pointsKey === fetchedKey) return

    fetch(`/api/elevation?points=${encodeURIComponent(pointsKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((data) => {
        setFetchedKey(pointsKey)
        setElevations(data.elevations || [])
      })
      .catch(() => {
        setFetchedKey(pointsKey)
        setElevations([])
      })
  }, [pointsKey, fetchedKey])

  if (measurePoints.length < 2) return null

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/40 text-xs text-muted-foreground">
        <Mountain className="h-3 w-3 animate-pulse" />
        <span>Loading elevation...</span>
      </div>
    )
  }

  if (elevations.length < 2) return null

  const minElev = Math.min(...elevations)
  const maxElev = Math.max(...elevations)

  // Compute gain
  let gain = 0
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0) gain += diff
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs">
      <Mountain className="h-3 w-3 text-emerald-500 shrink-0" />
      <span className="text-muted-foreground">
        Elevation:
      </span>
      <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
        {Math.round(minElev)}m - {Math.round(maxElev)}m
      </span>
      <span className="text-border">|</span>
      <span className="text-muted-foreground">Gain:</span>
      <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
        +{Math.round(gain)}m
      </span>
    </div>
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

// Calculate bearing between two points (in degrees)
function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}

// Format bearing as compass direction with degrees (e.g., "NE 42°")
function formatBearing(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(bearing / 45) % 8
  return `${directions[index]} ${Math.round(bearing)}°`
}

// Format distance: < 1km in meters, >= 1km in km with 1 decimal
function formatDistance(km: number): string {
  return km < 1
    ? `${Math.round(km * 1000)} m`
    : `${km.toFixed(1)} km`
}

// Calculate polygon area using the Shoelace formula (spherical approximation)
function calculatePolygonArea(points: { latitude: number; longitude: number }[]): number {
  if (points.length < 3) return 0
  const R = 6371000 // Earth radius in meters
  // Convert to radians
  const rad = points.map((p) => ({
    lat: (p.latitude * Math.PI) / 180,
    lng: (p.longitude * Math.PI) / 180,
  }))
  // Shoelace on unit sphere (spherical excess approximation)
  let sum = 0
  for (let i = 0; i < rad.length; i++) {
    const j = (i + 1) % rad.length
    sum += (rad[j].lng - rad[i].lng) * (2 + Math.sin(rad[i].lat) + Math.sin(rad[j].lat))
  }
  return Math.abs(sum * R * R / 2)
}

// Format area for display
function formatArea(sqMeters: number): string {
  if (sqMeters < 10000) {
    return `${sqMeters.toFixed(0)} m²`
  } else if (sqMeters < 1000000) {
    return `${(sqMeters / 10000).toFixed(2)} ha`
  } else {
    return `${(sqMeters / 1000000).toFixed(2)} km²`
  }
}

// Calculate perimeter of polygon
function calculatePerimeter(points: { latitude: number; longitude: number }[]): number {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    total += haversineDistance(points[i].latitude, points[i].longitude, points[j].latitude, points[j].longitude)
  }
  return total
}

// Get maneuver icon for turn-by-turn directions
function getManeuverIcon(type: string, modifier?: string): string {
  if (type === 'depart') return '🏁'
  if (type === 'arrive') return '📍'
  if (type === 'turn') {
    if (modifier?.includes('left')) return '↰'
    if (modifier?.includes('right')) return '↱'
    return '↪'
  }
  if (type === 'new name' || type === 'continue') return '⬆️'
  if (type === 'merge') return '↗️'
  if (type === 'fork') {
    if (modifier?.includes('left')) return '↰'
    if (modifier?.includes('right')) return '↱'
    return '↪'
  }
  if (type === 'roundabout' || type === 'rotary') return '🔄'
  if (type === 'end of road') {
    if (modifier?.includes('left')) return '↰'
    if (modifier?.includes('right')) return '↱'
    return '↪'
  }
  return '→'
}

// Get maneuver label for turn-by-turn directions
function getManeuverLabel(type: string, modifier?: string): string {
  if (type === 'depart') return 'Start'
  if (type === 'arrive') return 'Arrive at destination'
  if (type === 'turn') {
    if (modifier?.includes('sharp') && modifier?.includes('left')) return 'Sharp left turn'
    if (modifier?.includes('sharp') && modifier?.includes('right')) return 'Sharp right turn'
    if (modifier?.includes('slight') && modifier?.includes('left')) return 'Slight left turn'
    if (modifier?.includes('slight') && modifier?.includes('right')) return 'Slight right turn'
    if (modifier?.includes('left')) return 'Turn left'
    if (modifier?.includes('right')) return 'Turn right'
    if (modifier?.includes('uturn')) return 'U-turn'
    return 'Turn'
  }
  if (type === 'new name') return 'Continue'
  if (type === 'continue') return 'Continue straight'
  if (type === 'merge') return 'Merge'
  if (type === 'fork') return 'Take the fork'
  if (type === 'roundabout' || type === 'rotary') return 'Enter roundabout'
  if (type === 'end of road') return 'End of road'
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
}
