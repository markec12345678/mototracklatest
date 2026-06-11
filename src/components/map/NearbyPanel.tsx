'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Loader2, RefreshCw, Coffee, Utensils, Hotel, TreePine, Landmark, ShoppingBag } from 'lucide-react'
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
}

const POI_CATEGORIES = [
  { id: 'eating_out', label: 'Food', icon: Utensils, color: 'text-red-500' },
  { id: 'accommodation', label: 'Hotels', icon: Hotel, color: 'text-purple-500' },
  { id: 'activity', label: 'Activities', icon: TreePine, color: 'text-green-500' },
  { id: 'tourism', label: 'Tourism', icon: Landmark, color: 'text-orange-500' },
  { id: 'commercial', label: 'Shops', icon: ShoppingBag, color: 'text-sky-500' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: 'text-amber-500' },
]

export function NearbyPanel() {
  const { center, sidebarOpen } = useMapStore()
  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('eating_out')
  const lastFetchRef = useRef<string>('')

  const fetchPOIs = useCallback(async (lat: number, lng: number, category: string) => {
    const fetchKey = `${lat.toFixed(3)},${lng.toFixed(3)},${category}`
    if (fetchKey === lastFetchRef.current && pois.length > 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/poi?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&category=${category}`)
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

  if (!sidebarOpen) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Nearby Places</h3>
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
      <div className="flex gap-1.5 flex-wrap">
        {POI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id)
              setPois([])
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
          </button>
        ))}
      </div>

      {/* POI List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="ml-2 text-xs text-muted-foreground">Searching nearby...</span>
        </div>
      ) : pois.length > 0 ? (
        <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {pois.map((poi, i) => (
            <motion.div
              key={`${poi.latitude}-${poi.longitude}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group"
              onClick={() => handlePOIClick(poi)}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 text-sm">
                {poi.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{poi.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{poi.category.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddAsMarker(poi)
                }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/10 transition-all"
                aria-label="Add as marker"
              >
                <MapPin className="h-3 w-3 text-emerald-500" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No nearby places found</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Try a different category or move the map</p>
        </div>
      )}
    </div>
  )
}
