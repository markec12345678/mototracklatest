'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapView } from '@/components/map/MapView'
import { MapSidebar } from '@/components/map/MapSidebar'
import { SearchBar } from '@/components/map/SearchBar'
import { StyleSwitcher } from '@/components/map/StyleSwitcher'
import { CoordinatesDisplay } from '@/components/map/CoordinatesDisplay'
import { MapToolbar } from '@/components/map/MapToolbar'
import { AddLocationDialog } from '@/components/map/AddLocationDialog'
import { ThemeToggle } from '@/components/map/ThemeToggle'
import { MapStatsPanel } from '@/components/map/MapStatsPanel'
import { CompassIndicator } from '@/components/map/CompassIndicator'
import { KeyboardShortcutsDialog } from '@/components/map/KeyboardShortcutsDialog'
import { MiniMap } from '@/components/map/MiniMap'
import { MapLegend } from '@/components/map/MapLegend'
import { MapNotifications } from '@/components/map/MapNotifications'
import { WeatherPanel } from '@/components/map/WeatherPanel'
import { MobileWeatherBar } from '@/components/map/MobileWeatherBar'
import { ElevationProfile } from '@/components/map/ElevationProfile'
import { QuickJumpPanel } from '@/components/map/QuickJumpPanel'
import { UndoRedoBar } from '@/components/map/UndoRedoBar'
import { MapComparison } from '@/components/map/MapComparison'
import { CoordinateInputDialog } from '@/components/map/CoordinateInputDialog'
import { MapExportDialog } from '@/components/map/MapExportDialog'
import { BookmarkManager } from '@/components/map/BookmarkManager'
import { SunPositionOverlay } from '@/components/map/SunPositionOverlay'
import { SunInfoPanel } from '@/components/map/SunInfoPanel'
import { HeatmapLayer } from '@/components/map/HeatmapLayer'
import { HeatmapControls } from '@/components/map/HeatmapControls'
import { TrackRecorder, TrackRecordButton } from '@/components/map/TrackRecorder'
import { PWAInstallBanner } from '@/components/map/PWAInstallBanner'
import { Buildings3DLayer } from '@/components/map/Buildings3DLayer'
import { BuildingInfoPanel } from '@/components/map/BuildingInfoPanel'
import { GeofenceDialog } from '@/components/map/GeofenceDialog'
import { ShareDialog } from '@/components/map/ShareDialog'
import { LanguageSelector } from '@/components/map/LanguageSelector'
import { NotificationCenter } from '@/components/map/NotificationCenter'
import { AISuggestionsPanel } from '@/components/map/AISuggestionsPanel'
import { RouteAnalyticsPanel } from '@/components/map/RouteAnalyticsPanel'
import { DistanceMatrix } from '@/components/map/DistanceMatrix'
import { StyleGallery } from '@/components/map/StyleGallery'
import { VoiceNavigator } from '@/components/map/VoiceNavigator'
import { VoiceNavigationToggle } from '@/components/map/VoiceNavigationToggle'
import { CollaborationPanel } from '@/components/map/CollaborationPanel'
import { CollaboratorCursors } from '@/components/map/CollaboratorCursors'
import { OfflineIndicator } from '@/components/map/OfflineIndicator'
import { DrawingToolbar } from '@/components/map/DrawingToolbar'
import { DrawingLayer } from '@/components/map/DrawingLayer'
import { RouteComparisonPanel } from '@/components/map/RouteComparisonPanel'
import { TerrainAnalysisPanel } from '@/components/map/TerrainAnalysisPanel'
import { AccessibilityPanel } from '@/components/map/AccessibilityPanel'
import { SpatialAnalysisPanel } from '@/components/map/SpatialAnalysisPanel'
import { BufferZoneLayer } from '@/components/map/BufferZoneLayer'
import { ImageOverlayManager } from '@/components/map/ImageOverlayManager'
import { MapTimeline } from '@/components/map/MapTimeline'
import { MapAnalyticsDashboard } from '@/components/map/MapAnalyticsDashboard'
import { AirQualityPanel } from '@/components/map/AirQualityPanel'
import dynamic from 'next/dynamic'

const GPSSimulator = dynamic(() => import('@/components/map/GPSSimulator').then((m) => m.GPSSimulator), { ssr: false })
const MapNotesLayer = dynamic(() => import('@/components/map/MapNotes').then((m) => m.MapNotesLayer), { ssr: false })
const BatchActionBar = dynamic(() => import('@/components/map/BatchOperations').then((m) => m.BatchActionBar), { ssr: false })
const MapAnnotationsLayer = dynamic(() => import('@/components/map/MapAnnotationsLayer').then((m) => m.MapAnnotationsLayer), { ssr: false })
import { TrackStatsPanel } from '@/components/map/TrackStatsPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMapStore, type ToolMode, MAP_STYLES } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { useUndoStore } from '@/lib/use-undo-store'
import { useServiceWorker } from '@/hooks/use-service-worker'
import { toast } from 'sonner'
import {
  Navigation,
  MapPin,
  Ruler,
  Crosshair,
  Pencil,
  Github,
  X,
  Plus,
  LocateFixed,
  Layers,
  Maximize2,
  Minimize2,
  Keyboard,
  Share2,
  Camera,
  GitCompare,
  Globe2,
  Type,
  Activity,
  GitBranch,
  Save,
  BarChart3,
  Wind,
} from 'lucide-react'

export default function Home() {
  const { toolMode, sidebarOpen, center, zoom, currentStyle, weatherEnabled, comparisonEnabled, sunPositionEnabled, heatmapEnabled, elevationRouteId, setSidebarOpen, setToolMode, setCenter, setZoom, setCurrentStyle, setComparisonEnabled } = useMapStore()
  const comparedRoutes = useMapStore((s) => s.comparedRoutes)
  const terrainAnalysisRouteId = useMapStore((s) => s.terrainAnalysisRouteId)
  const accessibilityPanelOpen = useMapStore((s) => s.accessibilityPanelOpen)
  const highContrastMode = useMapStore((s) => s.highContrastMode)
  const largeTextMode = useMapStore((s) => s.largeTextMode)
  const reducedMotionMode = useMapStore((s) => s.reducedMotionMode)
  const pushNotification = useMapStore((s) => s.pushNotification)
  const drawingTool = useMapStore((s) => s.drawingTool)

  // Register service worker for offline tile caching
  useServiceWorker()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [coordDialogOpen, setCoordDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [bookmarkManagerOpen, setBookmarkManagerOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [geofenceDialogOpen, setGeofenceDialogOpen] = useState(false)
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false)
  const [distanceMatrixOpen, setDistanceMatrixOpen] = useState(false)
  const [styleGalleryOpen, setStyleGalleryOpen] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotSaveOpen, setSnapshotSaveOpen] = useState(false)
  const [geofenceCoords, setGeofenceCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)
  const compassAnimatingRef = useRef(false)
  const savedLocations = useMapStore((s) => s.savedLocations)

  // Restore map state from URL params on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = params.get('lat')
    const lng = params.get('lng')
    const zoomParam = params.get('zoom')
    const styleParam = params.get('style')

    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setCenter([lngNum, latNum])
        // Fly to the position after map loads
        setTimeout(() => {
          const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
          if (flyTo) {
            flyTo(lngNum, latNum, zoomParam ? parseFloat(zoomParam) : undefined)
          }
        }, 500)
      }
    }
    if (zoomParam) {
      const zoomNum = parseFloat(zoomParam)
      if (!isNaN(zoomNum)) {
        setZoom(zoomNum)
      }
    }
    if (styleParam) {
      const found = MAP_STYLES.find((s) => s.id === styleParam)
      if (found) {
        setCurrentStyle(found)
      }
    }
  }, [setCenter, setZoom, setCurrentStyle])

  // Update URL (debounced) when map state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const [lng, lat] = center
      const params = new URLSearchParams({
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        zoom: zoom.toFixed(2),
        style: currentStyle.id,
      })
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }, 500)
    return () => clearTimeout(timer)
  }, [center, zoom, currentStyle])

  // Handle map export - now opens the export dialog
  const handleExportMap = useCallback(() => {
    setExportDialogOpen(true)
  }, [])

  // Handle share URL - now opens the ShareDialog
  const handleShare = useCallback(() => {
    setShareDialogOpen(true)
  }, [])

  // Listen for map initialization
  useEffect(() => {
    const handleMapReady = () => setMapInitialized(true)
    window.addEventListener('map-ready', handleMapReady)
    // Fallback: check if map is already ready after a tick
    const fallbackTimer = setTimeout(() => {
      if ((window as unknown as Record<string, unknown>).__mainMap) {
        setMapInitialized(true)
      }
    }, 0)
    return () => {
      window.removeEventListener('map-ready', handleMapReady)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Welcome back toast for returning users
  useEffect(() => {
    if (savedLocations.length > 0) {
      const timer = setTimeout(() => {
        toast.success(`Welcome back! You have ${savedLocations.length} saved location${savedLocations.length > 1 ? 's' : ''}`)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [savedLocations.length])

  // Dismiss welcome after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleLocateMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords
          const flyTo = (window as unknown as Record<
            string,
            (lng: number, lat: number, z?: number) => void
          >).__mapFlyTo
          if (flyTo) {
            flyTo(longitude, latitude, 14)
          }
          useMapStore.getState().setGeolocation({ longitude, latitude, accuracy })
        },
        () => {
          // Geolocation denied
        }
      )
    }
  }, [])

  // Listen for context menu "Add to Saved Locations" event
  useEffect(() => {
    const handleAddSavedLocation = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lat: number; lng: number }
      if (detail) {
        // Open the Add Location dialog with pre-filled coordinates
        setAddDialogOpen(true)
        // The dialog reads center from store, so temporarily set it
        // We'll use a custom event to pass the coordinates
        window.dispatchEvent(new CustomEvent('add-location-prefill', { detail }))
      }
    }
    window.addEventListener('map-add-saved-location', handleAddSavedLocation)
    return () => window.removeEventListener('map-add-saved-location', handleAddSavedLocation)
  }, [])

  // Listen for context menu "Create Geofence" event
  useEffect(() => {
    const handleCreateGeofence = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lat: number; lng: number }
      if (detail) {
        setGeofenceCoords(detail)
        setGeofenceDialogOpen(true)
      }
    }
    window.addEventListener('map-create-geofence', handleCreateGeofence)
    return () => window.removeEventListener('map-create-geofence', handleCreateGeofence)
  }, [])

  // Geofence monitoring logic
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkGeofences = () => {
      const geolocation = useMapStore.getState().geolocation
      if (!geolocation) return

      const geofences = useMapStore.getState().geofences
      for (const geofence of geofences) {
        if (!geofence.isActive) continue
        if (!geofence.notifyOnEnter && !geofence.notifyOnExit) continue

        const R = 6371000 // meters
        const dLat = ((geolocation.latitude - geofence.latitude) * Math.PI) / 180
        const dLon = ((geolocation.longitude - geofence.longitude) * Math.PI) / 180
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((geofence.latitude * Math.PI) / 180) * Math.cos((geolocation.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        const inside = dist <= geofence.radius
        const key = `geofence-inside-${geofence.id}`
        const wasInside = sessionStorage.getItem(key) === 'true'

        if (inside && !wasInside && geofence.notifyOnEnter) {
          toast.info(`Entered geofence: ${geofence.name}`, { duration: 5000 })
          sessionStorage.setItem(key, 'true')
        } else if (!inside && wasInside && geofence.notifyOnExit) {
          toast.info(`Exited geofence: ${geofence.name}`, { duration: 5000 })
          sessionStorage.setItem(key, 'false')
        }
      }
    }

    // Check periodically
    const interval = setInterval(checkGeofences, 5000)
    // Also check when geolocation changes
    const unsub = useMapStore.subscribe((state, prev) => {
      if (state.geolocation !== prev.geolocation) {
        checkGeofences()
      }
    })

    return () => {
      clearInterval(interval)
      unsub()
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Z / Cmd+Z: Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        useUndoStore.getState().undo()
        return
      }
      // Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z: Redo
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault()
        useUndoStore.getState().redo()
        return
      }
      // Ctrl+G / Cmd+G: Open coordinate dialog
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setCoordDialogOpen(true)
        return
      }

      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape from inputs
        if (e.key === 'Escape') {
          target.blur()
        }
        return
      }

      switch (e.key) {
        case '1':
          setToolMode('navigate')
          break
        case '2':
          setToolMode('mark')
          break
        case '3':
          setToolMode('measure')
          break
        case '4':
          setToolMode('directions')
          break
        case '5':
          setToolMode('draw')
          break
        case '6':
          setToolMode('area')
          break
        case '8':
          setToolMode('annotate')
          break
        case '0': {
          const streets = MAP_STYLES.find((s) => s.id === 'streets')
          if (streets) useMapStore.getState().setCurrentStyle(streets)
          break
        }
        case '7': {
          const satellite = MAP_STYLES.find((s) => s.id === 'satellite')
          if (satellite) useMapStore.getState().setCurrentStyle(satellite)
          break
        }
        case '9': {
          const currentIdx = MAP_STYLES.findIndex((s) => s.id === useMapStore.getState().currentStyle.id)
          const nextIdx = (currentIdx + 1) % MAP_STYLES.length
          useMapStore.getState().setCurrentStyle(MAP_STYLES[nextIdx])
          break
        }
        case '/':
          e.preventDefault()
          document.getElementById('map-search-input')?.focus()
          break
        case 'b':
          if (e.shiftKey) {
            // Shift+B: same as B
          }
          setSidebarOpen(!useMapStore.getState().sidebarOpen)
          break
        case 'B':
          setSidebarOpen(!useMapStore.getState().sidebarOpen)
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'l':
        case 'L':
          handleLocateMe()
          break
        case 'h':
        case 'H':
          useMapStore.getState().setHeatmapEnabled(!useMapStore.getState().heatmapEnabled)
          break
        case 'v':
        case 'V': {
          const voiceEnabled = useMapStore.getState().voiceNavigationEnabled
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            if (voiceEnabled) {
              window.speechSynthesis.cancel()
            } else {
              const u = new SpeechSynthesisUtterance('')
              u.volume = 0
              window.speechSynthesis.speak(u)
            }
          }
          useMapStore.getState().setVoiceNavigationEnabled(!voiceEnabled)
          break
        }
        case 't':
        case 'T':
          useMapStore.getState().setSidebarTab('layers')
          useMapStore.getState().toggleSection('section-layers-theme')
          if (!useMapStore.getState().sidebarOpen) {
            useMapStore.getState().setSidebarOpen(true)
          }
          break
        case 'd':
        case 'D': {
          const currentDrawing = useMapStore.getState().drawingTool
          useMapStore.getState().setDrawingTool(currentDrawing === 'none' ? 'line' : 'none')
          setToolMode('draw')
          break
        }
        case 'c': {
          // Cycle coordinate format
          toast.info('Coordinate format cycled')
          break
        }
        case 'C': {
          // Shift+C: Copy coordinates
          const [lng, lat] = useMapStore.getState().center
          const zoom = useMapStore.getState().zoom
          const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)} (z${zoom.toFixed(1)})`
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(coords)
            toast.success(`Copied: ${coords}`)
          }
          break
        }
        case 'r':
        case 'R': {
          const { isRecording, startRecording, stopRecording } = useMapStore.getState()
          if (isRecording) {
            stopRecording()
            toast.success('Track recording stopped')
          } else {
            if (typeof navigator !== 'undefined' && navigator.geolocation) {
              startRecording()
              navigator.geolocation.watchPosition(
                (position) => {
                  useMapStore.getState().addTrackPoint({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    elevation: position.coords.altitude,
                    timestamp: position.timestamp,
                    speed: position.coords.speed,
                    accuracy: position.coords.accuracy,
                  })
                },
                (error) => {
                  toast.error(`GPS Error: ${error.message}`)
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
              )
              toast.success('Track recording started')
            } else {
              toast.error('Geolocation is not supported')
            }
          }
          break
        }
        case 'Escape':
          useMapStore.getState().setSelectedMarker(null)
          useMapStore.getState().setBatchSelectMode(false)
          break
        case 'g':
        case 'G': {
          const sim = useMapStore.getState().gpsSimulation
          if (sim.isPlaying) {
            useMapStore.getState().setGpsSimulation({ isPlaying: false })
          } else {
            useMapStore.getState().setGpsSimulation({ isPlaying: true, progress: 0 })
          }
          break
        }
        case 'n':
        case 'N':
          setToolMode('notes')
          break
        case 'x':
        case 'X': {
          const batch = useMapStore.getState().batchOperation
          useMapStore.getState().setBatchSelectMode(!batch.isSelectMode)
          break
        }
        case '?':
          if (e.shiftKey) {
            setSidebarOpen(!useMapStore.getState().sidebarOpen)
          } else {
            setShortcutsOpen(true)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setToolMode, setSidebarOpen, toggleFullscreen, handleLocateMe, setShortcutsOpen])

  const toolIndicator: Record<
    ToolMode,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    navigate: {
      label: 'Navigate',
      color: 'from-emerald-500 to-teal-500',
      icon: <Navigation className="h-3 w-3" />,
    },
    mark: {
      label: 'Drop Pin',
      color: 'from-red-500 to-rose-500',
      icon: <MapPin className="h-3 w-3" />,
    },
    measure: {
      label: 'Measure',
      color: 'from-amber-500 to-orange-500',
      icon: <Ruler className="h-3 w-3" />,
    },
    directions: {
      label: 'Directions',
      color: 'from-cyan-500 to-sky-500',
      icon: <Crosshair className="h-3 w-3" />,
    },
    draw: {
      label: 'Draw',
      color: 'from-green-500 to-emerald-500',
      icon: <Pencil className="h-3 w-3" />,
    },
    area: {
      label: 'Area',
      color: 'from-violet-500 to-purple-500',
      icon: <Maximize2 className="h-3 w-3" />,
    },
    annotate: {
      label: 'Label',
      color: 'from-pink-500 to-rose-500',
      icon: <Type className="h-3 w-3" />,
    },
  }

  const currentTool = toolIndicator[toolMode]

  return (
    <div className={cn(
      'relative w-screen h-screen overflow-hidden bg-background',
      highContrastMode && 'accessibility-high-contrast',
      largeTextMode && 'accessibility-large-text',
      reducedMotionMode && 'accessibility-reduced-motion',
    )}>
      {/* Map loading overlay - shows before map initializes */}
      <AnimatePresence>
        {!mapInitialized && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 bg-background"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-foreground">Loading Map…</span>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
              <div className="w-48 h-1 rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <MapView />

      {/* Drawing Layer - renders drawn features on the map */}
      <DrawingLayer />

      {/* Buffer Zone Layer - renders spatial analysis buffers */}
      <BufferZoneLayer />

      {/* Collaborator Cursors - shows other users' positions on the map */}
      <CollaboratorCursors />

      {/* Sun Position Overlay - renders terminator and subsolar point on the map */}
      <SunPositionOverlay />

      {/* Heatmap Layer - renders density heatmap from markers */}
      <HeatmapLayer />

      {/* Map Annotations Layer - renders annotations as GeoJSON on the map */}
      <MapAnnotationsLayer />

      {/* Map Comparison / Swipe View */}
      <MapComparison />

      {/* Crosshair overlay for measure/mark/directions mode */}
      {toolMode !== 'navigate' && (
        <div className="absolute inset-0 pointer-events-none z-[15]" aria-hidden="true">
          {/* Horizontal line */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 60,
              height: 2,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.6)' : toolMode === 'measure' ? 'rgba(245,158,11,0.6)' : toolMode === 'draw' ? 'rgba(34,197,94,0.6)' : toolMode === 'area' ? 'rgba(139,92,246,0.6)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.6)' : 'rgba(6,182,212,0.6)',
              borderRadius: 1,
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 2,
              height: 60,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.6)' : toolMode === 'measure' ? 'rgba(245,158,11,0.6)' : toolMode === 'draw' ? 'rgba(34,197,94,0.6)' : toolMode === 'area' ? 'rgba(139,92,246,0.6)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.6)' : 'rgba(6,182,212,0.6)',
              borderRadius: 1,
            }}
          />
          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 8,
              height: 8,
              background: toolMode === 'mark' ? 'rgba(239,68,68,0.7)' : toolMode === 'measure' ? 'rgba(245,158,11,0.7)' : toolMode === 'draw' ? 'rgba(34,197,94,0.7)' : toolMode === 'area' ? 'rgba(139,92,246,0.7)' : toolMode === 'annotate' ? 'rgba(236,72,153,0.7)' : 'rgba(6,182,212,0.7)',
            }}
          />
        </div>
      )}

      {/* Sidebar - responsive */}
      <MapSidebar />

      {/* Map Notifications - top right below top bar */}
      <MapNotifications />

      {/* Voice Navigation Indicator */}
      <VoiceNavigator />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Compass indicator (visible when map is rotated) */}
      <CompassIndicator />

      {/* Top bar - Search and controls */}
      <div
        className="absolute top-2 right-2 left-2 sm:top-3 sm:right-3 sm:left-3 z-10 flex items-start gap-1.5 sm:gap-2 transition-all duration-300 md:pl-0"
      >
        {/* Responsive padding for desktop sidebar */}
        <div className="flex-1 md:flex-1 md:max-w-lg md:ml-0" style={{ marginLeft: sidebarOpen ? '0px' : undefined }}>
          <div className={sidebarOpen ? 'md:pl-[332px]' : ''} style={{ transition: 'padding-left 0.3s ease-in-out' }}>
            <div className="w-full md:min-w-[280px]">
              <SearchBar />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <UndoRedoBar />
          <StyleSwitcher onBrowseAll={() => setStyleGalleryOpen(true)} />
          <Button
            variant="outline"
            size="icon"
            className={`map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${comparisonEnabled ? 'bg-primary/20 border-primary/50 text-primary' : ''}`}
            onClick={() => {
              setComparisonEnabled(!comparisonEnabled)
              if (!comparisonEnabled) {
                pushNotification({ type: 'style', icon: 'compare', message: 'Style comparison mode enabled' })
              }
            }}
            title="Compare map styles"
            aria-label="Toggle style comparison"
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setDistanceMatrixOpen(true)}
            title="Distance Matrix"
            aria-label="Distance matrix calculator"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setSnapshotSaveOpen(true)}
            title="Save Map Snapshot"
            aria-label="Save map snapshot"
          >
            <Save className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <LanguageSelector />
          <NotificationCenter />
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleLocateMe}
            title="My Location"
            aria-label="My Location"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={toggleFullscreen}
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setCoordDialogOpen(true)}
            title="Go to Coordinates (Ctrl+G)"
            aria-label="Go to coordinates"
          >
            <Globe2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleExportMap}
            title="Export Map as Image"
            aria-label="Export map as image"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleShare}
            title="Share Map View"
            aria-label="Share map view"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <VoiceNavigationToggle />
          <CollaborationPanel />
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnalyticsPanelOpen(true)}
            title="Analytics Dashboard"
            aria-label="Open analytics dashboard"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAqiPanelOpen(true)}
            title="Air Quality Index"
            aria-label="Open air quality panel"
          >
            <Wind className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTrackStatsPanelOpen(true)}
            title="Track Statistics"
            aria-label="Open track statistics"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:flex map-control-glass h-10 w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() =>
              window.open('https://github.com/maplibre/maplibre-native', '_blank')
            }
            title="GitHub"
            aria-label="View on GitHub"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tool toolbar - left side (desktop only) */}
      <div className="hidden md:block absolute left-4 z-10 transition-all duration-300" style={{ top: '80px' }}>
        <MapToolbar aiSuggestionsOpen={aiSuggestionsOpen} setAiSuggestionsOpen={setAiSuggestionsOpen} />
        {/* Track Record Button */}
        <div className="mt-2 flex justify-center">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrackRecordButton
                  onClick={() => {
                    const { isRecording, startRecording, stopRecording } = useMapStore.getState()
                    if (isRecording) {
                      stopRecording()
                    } else {
                      if (typeof navigator !== 'undefined' && navigator.geolocation) {
                        startRecording()
                        navigator.geolocation.watchPosition(
                          (position) => {
                            useMapStore.getState().addTrackPoint({
                              latitude: position.coords.latitude,
                              longitude: position.coords.longitude,
                              elevation: position.coords.altitude,
                              timestamp: position.timestamp,
                              speed: position.coords.speed,
                              accuracy: position.coords.accuracy,
                            })
                          },
                          (error) => {
                            toast.error(`GPS Error: ${error.message}`)
                          },
                          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
                        )
                        toast.success('GPS recording started')
                      } else {
                        toast.error('Geolocation is not supported')
                      }
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                GPS Track Recording
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Drawing Toolbar - appears when draw tool is active */}
      <DrawingToolbar />

      {/* AI Suggestions Panel - left side below toolbar (desktop only) */}
      {aiSuggestionsOpen && (
        <div className="hidden md:block absolute z-10" style={{ left: '80px', top: '80px' }}>
          <AISuggestionsPanel />
        </div>
      )}

      {/* Route Analytics Panel - left side below AI suggestions (desktop only) */}
      <div className="hidden md:block absolute z-10" style={{ left: aiSuggestionsOpen ? '400px' : '80px', top: '80px', transition: 'left 0.3s ease-in-out' }}>
        <RouteAnalyticsPanel />
      </div>

      {/* Route Comparison Panel - right side below search bar (desktop only) */}
      {comparedRoutes.length > 0 && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <RouteComparisonPanel />
        </div>
      )}

      {/* Terrain Analysis Panel - right side below comparison (desktop only) */}
      {terrainAnalysisRouteId && (
        <div className="hidden md:block absolute z-10" style={{ right: comparedRoutes.length > 0 ? '560px' : '20px', top: '80px', transition: 'right 0.3s ease-in-out' }}>
          <TerrainAnalysisPanel />
        </div>
      )}

      {/* Accessibility Panel - right side (desktop only) */}
      {accessibilityPanelOpen && (
        <div className="hidden md:block absolute z-10" style={{ right: '20px', top: '80px' }}>
          <AccessibilityPanel />
        </div>
      )}

      {/* Quick Jump Panel - left side below toolbar (desktop only) */}
      <div className="hidden md:block absolute z-10 transition-all duration-300" style={{ left: sidebarOpen ? '332px' : '16px', top: '140px' }}>
        <QuickJumpPanel onOpenBookmarkManager={() => setBookmarkManagerOpen(true)} />
      </div>

      {/* Current tool indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={toolMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 hidden md:block transition-all"
          style={{
            left: sidebarOpen ? '332px' : '60px',
            top: '80px',
            transition: 'left 0.3s ease-in-out',
          }}
        >
          <Badge
            className={`bg-gradient-to-r ${currentTool.color} text-white border-0 px-3 py-1.5 gap-1.5 shadow-lg`}
          >
            {currentTool.icon}
            {currentTool.label} Mode
          </Badge>
        </motion.div>
      </AnimatePresence>

      {/* Mobile weather bar - below search on mobile only */}
      <div className="md:hidden absolute top-[52px] sm:top-[58px] left-2 right-2 sm:left-3 sm:right-3 z-10">
        <MobileWeatherBar />
      </div>

      {/* Mobile tool indicator - shows on mobile below search/weather */}
      <div className="md:hidden absolute top-[88px] sm:top-24 left-2 sm:left-3 z-10">
        <Badge
          className={`bg-gradient-to-r ${currentTool.color} text-white border-0 px-2.5 py-1 gap-1 shadow-lg text-xs`}
        >
          {currentTool.icon}
          {currentTool.label}
        </Badge>
      </div>

      {/* Mobile bottom toolbar */}
      <div className="md:hidden absolute bottom-10 left-2 right-2 sm:left-3 sm:right-3 z-10 safe-area-bottom">
        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-1.5 sm:p-2 mobile-toolbar-container">
          {([
            { mode: 'navigate' as ToolMode, icon: <Navigation className="h-4 w-4" />, label: 'Navigate', activeClass: 'bg-emerald-500 text-white' },
            { mode: 'mark' as ToolMode, icon: <MapPin className="h-4 w-4" />, label: 'Pin', activeClass: 'bg-red-500 text-white' },
            { mode: 'measure' as ToolMode, icon: <Ruler className="h-4 w-4" />, label: 'Measure', activeClass: 'bg-amber-500 text-white' },
            { mode: 'directions' as ToolMode, icon: <Crosshair className="h-4 w-4" />, label: 'Route', activeClass: 'bg-cyan-500 text-white' },
            { mode: 'draw' as ToolMode, icon: <Pencil className="h-4 w-4" />, label: 'Draw', activeClass: 'bg-green-500 text-white' },
            { mode: 'area' as ToolMode, icon: <Maximize2 className="h-4 w-4" />, label: 'Area', activeClass: 'bg-violet-500 text-white' },
            { mode: 'annotate' as ToolMode, icon: <Type className="h-4 w-4" />, label: 'Label', activeClass: 'bg-pink-500 text-white' },
          ]).map((tool) => (
            <button
              key={tool.mode}
              onClick={() => setToolMode(tool.mode)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs transition-all min-w-[44px] min-h-[44px] justify-center touch-feedback ${
                toolMode === tool.mode ? tool.activeClass + ' shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              aria-label={`${tool.label} tool`}
            >
              {tool.icon}
              <span className="text-[8px] sm:text-[9px] font-medium">{tool.label}</span>
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-0.5 sm:mx-1" />
          <button
            onClick={handleLocateMe}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all min-w-[44px] min-h-[44px] justify-center touch-feedback"
            aria-label="My location"
          >
            <LocateFixed className="h-4 w-4" />
            <span className="text-[8px] sm:text-[9px] font-medium">Locate</span>
          </button>
        </div>
      </div>

      {/* Map Stats Panel - right side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 right-5 z-10">
        <MapStatsPanel />
      </div>

      {/* Weather Panel - left side above footer (desktop only) */}
      <div className="hidden md:block absolute bottom-12 z-10" style={{ left: sidebarOpen ? '332px' : '20px', transition: 'left 0.3s ease-in-out' }}>
        <WeatherPanel />
      </div>

      {/* Elevation Profile Panel - above weather panel when measuring, routing, or viewing route elevation (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) && weatherEnabled ? '260px' : '12px',
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <ElevationProfile />
      </div>

      {/* Heatmap Controls - bottom-left above coordinates (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          left: sidebarOpen ? '332px' : '20px',
          bottom: (toolMode === 'measure' || toolMode === 'directions' || elevationRouteId !== null) ? (weatherEnabled ? '360px' : '120px') : (weatherEnabled ? '260px' : '12px'),
          transition: 'left 0.3s ease-in-out, bottom 0.3s ease-in-out',
        }}
      >
        <HeatmapControls />
      </div>

      {/* Sun Info Panel - right side above map stats (desktop only) */}
      <div
        className="hidden md:block absolute z-10"
        style={{
          right: '20px',
          bottom: sunPositionEnabled ? '100px' : '12px',
          transition: 'bottom 0.3s ease-in-out',
        }}
      >
        <SunInfoPanel />
      </div>

      {/* Sun Info Panel - mobile version, bottom-left */}
      <div className="md:hidden absolute bottom-20 left-3 z-10">
        <SunInfoPanel />
      </div>

      {/* Minimap - bottom right above MapStatsPanel (desktop only) */}
      <MiniMap />

      {/* Map Legend - right side below minimap (desktop only) */}
      <MapLegend />

      {/* Coordinates display - bottom center (desktop only) */}
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <CoordinatesDisplay />
      </div>

      {/* Add Location FAB */}
      <motion.div
        className="absolute bottom-16 right-3 sm:bottom-20 sm:right-5 md:bottom-20 md:right-5 z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 h-12 md:h-14 px-4 md:px-5 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 transition-all duration-200 fab-pulse-shadow"
          onClick={() => setAddDialogOpen(true)}
          aria-label="Add new location"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Add Place</span>
        </Button>
      </motion.div>

      {/* Welcome banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4 hidden md:block"
          >
            <div className="relative bg-background/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none">
                <div className="absolute inset-0 rounded-2xl animate-gradient-rotate" style={{
                  background: 'conic-gradient(from 0deg, #10b981, #14b8a6, #06b6d4, #10b981)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1.5px',
                }} />
              </div>
              {/* Floating particles background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-emerald-400"
                    initial={{
                      x: Math.random() * 300,
                      y: Math.random() * 150,
                      opacity: 0,
                    }}
                    animate={{
                      y: [Math.random() * 150, Math.random() * 50, Math.random() * 150],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent z-10"
                aria-label="Dismiss welcome"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="font-bold text-base">
                    Welcome to MapLibre Explorer
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    An interactive map application powered by MapLibre GL JS.
                    Explore the world, drop pins, measure distances, and switch
                    between beautiful map styles.
                  </p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {[
                      { label: '8 Map Styles', emoji: '🗺️', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                      { label: '3D Terrain', emoji: '⛰️', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
                      { label: 'Satellite', emoji: '🛰️', bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400' },
                      { label: 'Weather', emoji: '🌤️', bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400' },
                      { label: 'Save Places', emoji: '📍', bg: 'bg-red-500/10 text-red-700 dark:text-red-400' },
                      { label: 'Measure', emoji: '📏', bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
                      { label: 'Custom Tiles', emoji: '🧩', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400' },
                      { label: 'Shortcuts', emoji: '⌨️', bg: 'bg-violet-500/10 text-violet-700 dark:text-violet-400' },
                    ].map((feature, featureIndex) => (
                      <motion.div
                        key={feature.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + featureIndex * 0.06 }}
                      >
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-2 py-0.5 gap-1 ${feature.bg}`}
                        >
                          {feature.emoji} {feature.label}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block"
                  >
                    <Button
                      size="sm"
                      className="mt-3 h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25 px-5 font-medium"
                      onClick={() => {
                        setShowWelcome(false)
                        setTimeout(() => {
                          document.getElementById('map-search-input')?.focus()
                        }, 100)
                      }}
                    >
                      Get Started →
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Location Dialog */}
      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Coordinate Input Dialog */}
      <CoordinateInputDialog open={coordDialogOpen} onOpenChange={setCoordDialogOpen} />

      {/* Map Export Dialog */}
      <MapExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />

      {/* Bookmark Manager Dialog */}
      <BookmarkManager open={bookmarkManagerOpen} onOpenChange={setBookmarkManagerOpen} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Share Dialog */}
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />

      {/* Geofence Dialog */}
      <GeofenceDialog
        open={geofenceDialogOpen}
        onOpenChange={setGeofenceDialogOpen}
        latitude={geofenceCoords?.lat}
        longitude={geofenceCoords?.lng}
      />

      {/* Distance Matrix Dialog */}
      <DistanceMatrix open={distanceMatrixOpen} onOpenChange={setDistanceMatrixOpen} />

      {/* Style Gallery Dialog */}
      <StyleGallery open={styleGalleryOpen} onOpenChange={setStyleGalleryOpen} />

      {/* Snapshot Save Dialog */}
      {snapshotSaveOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSnapshotSaveOpen(false)}>
          <div
            className="bg-background rounded-2xl shadow-2xl p-6 w-80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-500" />
              Save Map Snapshot
            </h3>
            <p className="text-xs text-muted-foreground">Save the current map view, position, and markers as a snapshot you can restore later.</p>
            <input
              type="text"
              placeholder="Snapshot name..."
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = snapshotName.trim() || `Snapshot ${useMapStore.getState().snapshots.length + 1}`
                  useMapStore.getState().saveSnapshot(name)
                  setSnapshotName('')
                  setSnapshotSaveOpen(false)
                  toast.success(`Snapshot "${name}" saved`)
                }
              }}
              className="w-full h-9 px-3 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setSnapshotSaveOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  const name = snapshotName.trim() || `Snapshot ${useMapStore.getState().snapshots.length + 1}`
                  useMapStore.getState().saveSnapshot(name)
                  setSnapshotName('')
                  setSnapshotSaveOpen(false)
                  toast.success(`Snapshot "${name}" saved`)
                }}
              >
                <Camera className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Track Recorder Panel */}
      <TrackRecorder />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* 3D Buildings Layer */}
      <Buildings3DLayer />

      {/* Building Info Panel */}
      <BuildingInfoPanel />

      {/* Map Timeline */}
      <MapTimeline />

      {/* Analytics Dashboard */}
      <MapAnalyticsDashboard />

      {/* Air Quality Panel */}
      <AirQualityPanel />

      {/* GPS Simulator */}
      <GPSSimulator />

      {/* Map Notes Layer */}
      <MapNotesLayer />

      {/* Batch Operations Action Bar */}
      <BatchActionBar />

      {/* Track Statistics Panel */}
      <TrackStatsPanel />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t py-1 px-2 sm:px-3 md:px-4 safe-area-bottom before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent">
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-[11px] text-muted-foreground/70">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 text-white" />
            </div>
            <span className="font-medium hidden sm:inline">MapLibre Explorer</span>
            <span className="text-border hidden sm:inline">|</span>
            <span className="hidden md:inline">MapTiler · OpenStreetMap · Open-Meteo</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <a
              href="https://maplibre.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hidden sm:inline"
            >
              maplibre.org
            </a>
            <span className="text-border hidden sm:inline">|</span>
            <a
              href="https://github.com/maplibre/maplibre-native"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hidden md:inline"
            >
              GitHub
            </a>
            <span className="text-border hidden md:inline">|</span>
            <span>© OpenStreetMap</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
