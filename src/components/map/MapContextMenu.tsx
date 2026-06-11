'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Ruler,
  Navigation,
  Pentagon,
  Search,
  Copy,
  Crosshair,
  BookmarkPlus,
  Loader2,
} from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { toast } from 'sonner'

export interface ContextMenuPosition {
  x: number
  y: number
  lng: number
  lat: number
}

interface MapContextMenuProps {
  position: ContextMenuPosition | null
  onClose: () => void
  onAddToSavedLocations: (lat: number, lng: number) => void
}

interface MenuItem {
  icon: React.ReactNode
  label: string
  onClick: () => void
  shortcut?: string
  danger?: boolean
  separatorAfter?: boolean
}

export function MapContextMenu({ position, onClose, onAddToSavedLocations }: MapContextMenuProps) {
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState<string | null>(null)
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false)
  const [geocodeFetched, setGeocodeFetched] = useState(false)

  const { toolMode, addMarker, addMeasurePoint, addRoutePoint, addAreaPoint, setToolMode } = useMapStore()

  // Adjust position so menu doesn't go off-screen
  const getAdjustedPosition = useCallback(() => {
    if (!position) return { x: 0, y: 0 }

    const menuWidth = 260
    const menuHeight = 380
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = position.x
    let y = position.y

    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 8
    }
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 8
    }
    if (x < 8) x = 8
    if (y < 8) y = 8

    return { x, y }
  }, [position])

  // Fetch reverse geocoding when context menu opens
  useEffect(() => {
    if (!position || geocodeFetched) return

    setGeocodeFetched(true)
    setIsLoadingGeocode(true)

    const fetchGeocode = async () => {
      try {
        const res = await fetch(`/api/reverse-geocode?lng=${position.lng}&lat=${position.lat}`)
        if (res.ok) {
          const data = await res.json()
          if (data.name) {
            setReverseGeocodeResult(data.fullName || data.name)
          }
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingGeocode(false)
      }
    }

    fetchGeocode()
  }, [position, geocodeFetched])

  // Reset geocode state when menu closes
  useEffect(() => {
    if (!position) {
      setReverseGeocodeResult(null)
      setIsLoadingGeocode(false)
      setGeocodeFetched(false)
    }
  }, [position])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && position) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [position, onClose])

  const handleCopyCoordinates = useCallback(() => {
    if (!position) return
    const text = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Coordinates copied to clipboard')
    }).catch(() => {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Coordinates copied to clipboard')
    })
    onClose()
  }, [position, onClose])

  const handleAddMarker = useCallback(() => {
    if (!position) return
    const id = `marker-${Date.now()}`
    addMarker({
      id,
      longitude: position.lng,
      latitude: position.lat,
      name: `Pin at ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
      color: '#ef4444',
      category: 'general',
    })
    useMapStore.getState().pushNotification({ type: 'location', icon: 'pin', message: `Pin dropped at ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` })
    toast.success('Marker added')
    onClose()
  }, [position, addMarker, onClose])

  const handleStartMeasurement = useCallback(() => {
    if (!position) return
    setToolMode('measure')
    // Clear existing points and add the first one
    useMapStore.getState().clearMeasurePoints()
    addMeasurePoint({
      longitude: position.lng,
      latitude: position.lat,
    })
    toast.success('Measurement started from this point')
    onClose()
  }, [position, setToolMode, addMeasurePoint, onClose])

  const handleAddRoutePoint = useCallback(() => {
    if (!position) return
    setToolMode('directions')
    addRoutePoint({
      longitude: position.lng,
      latitude: position.lat,
    })
    toast.success('Route point added')
    onClose()
  }, [position, setToolMode, addRoutePoint, onClose])

  const handleAddAreaPoint = useCallback(() => {
    if (!position) return
    setToolMode('area')
    addAreaPoint({
      longitude: position.lng,
      latitude: position.lat,
    })
    toast.success('Area point added')
    onClose()
  }, [position, setToolMode, addAreaPoint, onClose])

  const handleWhatsHere = useCallback(() => {
    if (!position) return
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(position.lng, position.lat, Math.max(useMapStore.getState().zoom, 14))
    }
    if (reverseGeocodeResult) {
      toast.info(reverseGeocodeResult, { duration: 5000 })
    } else {
      toast.info(`Coordinates: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`, { duration: 5000 })
    }
    onClose()
  }, [position, reverseGeocodeResult, onClose])

  const handleCenterHere = useCallback(() => {
    if (!position) return
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(position.lng, position.lat)
    }
    onClose()
  }, [position, onClose])

  const handleAddToSaved = useCallback(() => {
    if (!position) return
    onAddToSavedLocations(position.lat, position.lng)
    onClose()
  }, [position, onAddToSavedLocations, onClose])

  if (!position) return null

  const adjusted = getAdjustedPosition()

  const menuItems: MenuItem[] = [
    {
      icon: <MapPin className="h-4 w-4 text-red-500" />,
      label: 'Add Marker Here',
      onClick: handleAddMarker,
    },
    {
      icon: <Ruler className="h-4 w-4 text-amber-500" />,
      label: 'Start Measurement From Here',
      onClick: handleStartMeasurement,
    },
    {
      icon: <Navigation className="h-4 w-4 text-cyan-500" />,
      label: 'Add Route Point',
      onClick: handleAddRoutePoint,
    },
    {
      icon: <Pentagon className="h-4 w-4 text-violet-500" />,
      label: 'Add Area Point',
      onClick: handleAddAreaPoint,
      separatorAfter: true,
    },
    {
      icon: isLoadingGeocode ? (
        <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
      ) : (
        <Search className="h-4 w-4 text-emerald-500" />
      ),
      label: "What's Here?",
      onClick: handleWhatsHere,
    },
    {
      icon: <Copy className="h-4 w-4 text-muted-foreground" />,
      label: 'Copy Coordinates',
      onClick: handleCopyCoordinates,
    },
    {
      icon: <Crosshair className="h-4 w-4 text-muted-foreground" />,
      label: 'Center Map Here',
      onClick: handleCenterHere,
    },
    {
      icon: <BookmarkPlus className="h-4 w-4 text-teal-500" />,
      label: 'Add to Saved Locations',
      onClick: handleAddToSaved,
    },
  ]

  return (
    <AnimatePresence>
      {position && (
        <>
          {/* Invisible backdrop to catch clicks outside */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={onClose}
            onContextMenu={(e) => {
              e.preventDefault()
              onClose()
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-[9999] min-w-[240px] max-w-[300px]"
            style={{ left: adjusted.x, top: adjusted.y }}
          >
            <div className="bg-background/90 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Coordinates header */}
              <div className="px-3 py-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-medium text-foreground">
                      {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </div>
                    {isLoadingGeocode && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        Looking up location...
                      </div>
                    )}
                    {reverseGeocodeResult && !isLoadingGeocode && (
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {reverseGeocodeResult}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    <button
                      onClick={item.onClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent/60 transition-colors duration-100 text-left group"
                    >
                      <span className="shrink-0 group-hover:scale-110 transition-transform duration-100">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                    {item.separatorAfter && (
                      <div className="my-1.5 mx-3 h-px bg-border/50" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
