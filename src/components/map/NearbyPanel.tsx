'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Loader2, RefreshCw, Coffee, Utensils, Hotel, TreePine,
  Landmark, ShoppingBag, Heart, Fuel, ParkingCircle, Building2,
  GraduationCap, Drama, Bus, Dumbbell, Droplets, Toilet,
  Search, ArrowUpDown, ExternalLink, ChevronDown, X
} from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface POI {
  name: string
  latitude: number
  longitude: number
  category: string
  type: string
  distance: number | null
  icon: string
  address?: string
  openingHours?: string
  phone?: string
  website?: string
}

type SortMode = 'distance' | 'name' | 'category'

const POI_CATEGORIES = [
  { id: 'eating_out', label: 'Food', icon: Utensils, color: 'text-red-500', bgColor: 'bg-red-500', emoji: '🍽️' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: 'text-amber-500', bgColor: 'bg-amber-500', emoji: '☕' },
  { id: 'accommodation', label: 'Hotels', icon: Hotel, color: 'text-purple-500', bgColor: 'bg-purple-500', emoji: '🏨' },
  { id: 'activity', label: 'Activities', icon: TreePine, color: 'text-green-500', bgColor: 'bg-green-500', emoji: '🎯' },
  { id: 'tourism', label: 'Tourism', icon: Landmark, color: 'text-orange-500', bgColor: 'bg-orange-500', emoji: '🗺️' },
  { id: 'commercial', label: 'Shops', icon: ShoppingBag, color: 'text-sky-500', bgColor: 'bg-sky-500', emoji: '🛍️' },
  { id: 'healthcare', label: 'Health', icon: Heart, color: 'text-rose-500', bgColor: 'bg-rose-500', emoji: '🏥' },
  { id: 'fuel', label: 'Fuel', icon: Fuel, color: 'text-yellow-600', bgColor: 'bg-yellow-600', emoji: '⛽' },
  { id: 'parking', label: 'Parking', icon: ParkingCircle, color: 'text-blue-500', bgColor: 'bg-blue-500', emoji: '🅿️' },
  { id: 'banking', label: 'Banking', icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-600', emoji: '🏦' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-indigo-500', bgColor: 'bg-indigo-500', emoji: '📚' },
  { id: 'entertainment', label: 'Fun', icon: Drama, color: 'text-pink-500', bgColor: 'bg-pink-500', emoji: '🎭' },
  { id: 'public_transport', label: 'Transit', icon: Bus, color: 'text-teal-500', bgColor: 'bg-teal-500', emoji: '🚌' },
  { id: 'sports', label: 'Sports', icon: Dumbbell, color: 'text-lime-500', bgColor: 'bg-lime-500', emoji: '🏋️' },
  { id: 'drinking_water', label: 'Water', icon: Droplets, color: 'text-cyan-500', bgColor: 'bg-cyan-500', emoji: '💧' },
  { id: 'toilets', label: 'Toilets', icon: Toilet, color: 'text-gray-500', bgColor: 'bg-gray-500', emoji: '🚻' },
]

function formatDistance(meters: number | null): string {
  if (meters === null) return ''
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function openInMaps(lat: number, lng: number, name: string) {
  // Try to open in Apple Maps on iOS, Google Maps otherwise
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (isIOS) {
    window.open(`maps://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name)}`, '_blank')
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`, '_blank')
  }
}

export function NearbyPanel() {
  const { center, sidebarOpen } = useMapStore()
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('eating_out')
  const [searchFilter, setSearchFilter] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('distance')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const lastFetchRef = useRef<string>('')

  // Show first 6 categories by default, expand for more
  const visibleCategories = showAllCategories ? POI_CATEGORIES : POI_CATEGORIES.slice(0, 8)

  const fetchPOIs = useCallback(async (lat: number, lng: number, category: string) => {
    const fetchKey = `${lat.toFixed(3)},${lng.toFixed(3)},${category}`
    if (fetchKey === lastFetchRef.current && pois.length > 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/poi?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&category=${category}&limit=30`)
      if (res.ok) {
        const data = await res.json()
        setPois(data.pois || [])
        lastFetchRef.current = fetchKey

        // Update POI markers on map
        const { setPoiMarkers, clearPoiMarkers } = useMapStore.getState()
        if (data.pois && data.pois.length > 0) {
          setPoiMarkers(
            data.pois.map((poi: POI, i: number) => ({
              id: `poi-${i}-${poi.latitude.toFixed(4)}-${poi.longitude.toFixed(4)}`,
              longitude: poi.longitude,
              latitude: poi.latitude,
              name: poi.name,
              category: poi.category,
              icon: poi.icon,
              distance: poi.distance,
            }))
          )
        } else {
          clearPoiMarkers()
        }
      } else {
        setPois([])
        useMapStore.getState().clearPoiMarkers()
      }
    } catch (err) {
      console.error('POI fetch error:', err)
      setPois([])
      useMapStore.getState().clearPoiMarkers()
    } finally {
      setLoading(false)
    }
  }, [pois.length])

  useEffect(() => {
    if (sidebarOpen) {
      const [lng, lat] = center
      fetchPOIs(lat, lng, selectedCategory)
    }
  }, [center, selectedCategory, sidebarOpen, fetchPOIs])

  const handlePOIClick = (poi: POI) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) flyTo(poi.longitude, poi.latitude, 16)
  }

  const handleAddAsMarker = (poi: POI) => {
    const { addMarker, addSavedLocation, pushNotification } = useMapStore.getState()
    const id = `marker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    addMarker({
      id,
      longitude: poi.longitude,
      latitude: poi.latitude,
      name: poi.name,
      category: poi.category,
      color: '#10b981',
    })
    addSavedLocation({
      id,
      name: poi.name,
      latitude: poi.latitude,
      longitude: poi.longitude,
      category: poi.category,
      color: '#10b981',
      icon: poi.icon,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    pushNotification({
      type: 'location',
      icon: poi.icon,
      message: `Added "${poi.name}" to saved locations`,
    })
    toast.success(`Added "${poi.name}" to saved locations`)
  }

  // Clear POI markers when panel unmounts or sidebar closes
  useEffect(() => {
    if (!sidebarOpen) {
      useMapStore.getState().clearPoiMarkers()
    }
    return () => {
      useMapStore.getState().clearPoiMarkers()
    }
  }, [sidebarOpen])

  // Filter and sort POIs
  const filteredAndSortedPois = useMemo(() => {
    let filtered = pois
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      filtered = pois.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.replace(/_/g, ' ').includes(q) ||
          p.type.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q))
      )
    }

    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category) || (a.distance ?? 0) - (b.distance ?? 0)
        case 'distance':
        default:
          return (a.distance ?? 0) - (b.distance ?? 0)
      }
    })
  }, [pois, searchFilter, sortMode])

  // Category counts
  const categoryCount = useMemo(() => {
    return pois.length
  }, [pois])

  if (!sidebarOpen) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Nearby Places</h3>
          {categoryCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
              {categoryCount}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const [lng, lat] = center
            lastFetchRef.current = ''
            fetchPOIs(lat, lng, selectedCategory)
          }}
          className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          aria-label="Refresh POIs"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Category pills */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5 flex-wrap">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setPois([])
                setSearchFilter('')
                lastFetchRef.current = ''
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedCategory === cat.id
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-accent'
              )}
            >
              <cat.icon className={cn('h-3 w-3', selectedCategory === cat.id && cat.color)} />
              {cat.label}
              {selectedCategory === cat.id && categoryCount > 0 && (
                <span className="text-[9px] bg-primary/15 text-primary px-1 rounded-full">
                  {categoryCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {!showAllCategories && POI_CATEGORIES.length > 8 && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ChevronDown className="h-3 w-3" />
            {POI_CATEGORIES.length - 8} more categories
          </button>
        )}
        {showAllCategories && (
          <button
            onClick={() => setShowAllCategories(false)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ChevronDown className="h-3 w-3 rotate-180" />
            Show less
          </button>
        )}
      </div>

      {/* Search within results + Sort */}
      {pois.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter results..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-7 pl-6 pr-6 text-xs rounded-lg border border-border/50 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              const modes: SortMode[] = ['distance', 'name', 'category']
              const nextIdx = (modes.indexOf(sortMode) + 1) % modes.length
              setSortMode(modes[nextIdx])
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border/50"
            title={`Sort by: ${sortMode}`}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortMode === 'distance' ? 'Dist' : sortMode === 'name' ? 'Name' : 'Cat'}
          </button>
        </div>
      )}

      {/* POI List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="ml-2 text-xs text-muted-foreground">Searching nearby...</span>
        </div>
      ) : filteredAndSortedPois.length > 0 ? (
        <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <AnimatePresence mode="popLayout">
            {filteredAndSortedPois.map((poi, i) => {
              const catConfig = POI_CATEGORIES.find((c) => c.id === poi.category)
              return (
                <motion.div
                  key={`${poi.latitude}-${poi.longitude}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group"
                  onClick={() => handlePOIClick(poi)}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm',
                      catConfig ? `${catConfig.bgColor}/10` : 'bg-muted/50'
                    )}
                  >
                    {poi.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{poi.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="capitalize">{poi.category.replace(/_/g, ' ')}</span>
                      {poi.distance !== null && (
                        <>
                          <span className="text-border">·</span>
                          <span className="font-medium tabular-nums">{formatDistance(poi.distance)}</span>
                        </>
                      )}
                      {poi.openingHours && (
                        <>
                          <span className="text-border">·</span>
                          <span className="truncate max-w-[80px]">{poi.openingHours.split(';')[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openInMaps(poi.latitude, poi.longitude, poi.name)
                      }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-all"
                      title="Open in Maps"
                      aria-label="Open in maps"
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddAsMarker(poi)
                      }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-all"
                      aria-label="Add as marker"
                    >
                      <MapPin className="h-3 w-3 text-emerald-500" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-6">
          <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            {searchFilter ? 'No results match your filter' : 'No nearby places found'}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {searchFilter ? 'Try a different search term' : 'Try a different category or move the map'}
          </p>
        </div>
      )}
    </div>
  )
}
