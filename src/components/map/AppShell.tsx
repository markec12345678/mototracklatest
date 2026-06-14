'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  Code2,
  Camera,
  GitCompare,
  Globe2,
  Type,
  Activity,
  GitBranch,
  Save,
  BarChart3,
  Wind,
  Printer,
  Tag,
  Palette,
  Share,
  Mountain,
  Gauge,
  Play,
  Boxes,
  BookOpen,
  Database,
  BellRing,
  Grid3x3,
  MapPinned,
  Calendar,
  Thermometer,
  Triangle,
  TreePine,
  PieChart,
  Image as ImageIcon,
  TrendingUp,
  LayoutGrid,
  CalendarDays,
  ArrowUpFromLine,
  Compass,
  SunDim,
  PenTool,
  Waypoints,
  CloudSun,
  MessageCircle,
  QrCode,
  Monitor,
  Clapperboard,
  Route,
  BarChart2,
  ClipboardCheck,
  ShieldAlert,
  SplitSquareHorizontal,
  Volume2,
  Sun,
  Hammer,
  Mountain as MountainIcon,
  Anchor,
  Map,
  CloudCog,
  Bird,
  Landmark,
  Droplets,
  Activity as ActivityIcon,
  Sprout,
  Building2,
  Plane,
  Waves,
  Magnet,
  Droplet,
  Flame,
  Snowflake as SnowflakeIcon,
  Wheat,
  Satellite,
  Pyramid,
  Factory,
  Ship,
  Zap,
  Sun as SunIcon,
  Gem,
  Fish,
  ThermometerSnowflake,
  CloudLightning,
  Leaf,
  Droplet as DropletIcon,
  Sun as SunIcon3,
  CloudHail,
  Waves as WavesIcon,
  CloudCog as CloudSmoke,
  Bird as BirdIcon,
  MountainSnow,
  ThermometerSun,
  ArrowDownFromLine,
  Shell,
  Siren,
  CloudRain,
  Cloud as CloudIcon,
  Droplets as DropletsIcon,
  Globe as GlobeIcon,
  Wind as WindIcon,
  Snowflake as SnowflakeIcon2,
  Radio,
  TreeDeciduous,
  Flame as FlameIcon,
  Ship as ShipIcon,
  Moon as MoonIcon,
  Sparkles as SparklesIcon,
  Globe2 as Globe2Icon2,
  Wind as WindIcon2,
  Sparkles as SparklesIcon2,
  Building2 as Building2Icon,
  Bug,
  Magnet as MagnetIcon2,
  CloudFog,
  Factory as FactoryIcon2,
  CloudHail as CloudHailIcon,
  TreePine as TreePineIcon2,
  Flame as FlameIcon2,
  Waves as WavesIcon2,
  Trash2,
  Droplets as DropletsIcon2,
  Search as SearchIcon2,
  Radio as RadioIcon2,
  Mountain as MountainIcon2,
  Waves as WavesIcon3,
  Sun as SunIcon2,
  Activity as ActivityIcon2,
  TreeDeciduous as TreeDeciduousIcon2,
  Eye as EyeIcon2,
  Drill as DrillIcon,
  Volume2 as Volume2Icon,
  Wind as WindIcon3,
  Fish as FishIcon2,
  Clock,
} from 'lucide-react'

// Lazy loading for heavy components and panel groups to prevent OOM
import { LazyPanel } from '@/components/LazyPanel'



export function AppShell() {
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
  const embedDialogOpen = useMapStore((s) => s.embedDialogOpen)
  const setEmbedDialogOpen = useMapStore((s) => s.setEmbedDialogOpen)
  const markerCategoriesOpen = useMapStore((s) => s.markerCategoriesOpen)
  const setMarkerCategoriesOpen = useMapStore((s) => s.setMarkerCategoriesOpen)
  const waypointOptimizerOpen = useMapStore((s) => s.waypointOptimizerOpen)
  const setWaypointOptimizerOpen = useMapStore((s) => s.setWaypointOptimizerOpen)
  const stylesMixerOpen = useMapStore((s) => s.stylesMixerOpen)
  const setStylesMixerOpen = useMapStore((s) => s.setStylesMixerOpen)
  const routeSharingOpen = useMapStore((s) => s.routeSharingOpen)
  const setRouteSharingOpen = useMapStore((s) => s.setRouteSharingOpen)
  const shortcutsOpen = useMapStore((s) => s.shortcutsDialogOpen)
  const setShortcutsOpen = useMapStore((s) => s.setShortcutsDialogOpen)
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')
  const [snapshotSaveOpen, setSnapshotSaveOpen] = useState(false)
  const [geofenceCoords, setGeofenceCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapInitialized, setMapInitialized] = useState(false)
  const [loadedPanels, setLoadedPanels] = useState<Set<string>>(new Set())
  const compassAnimatingRef = useRef(false)
  const savedLocations = useMapStore((s) => s.savedLocations)

  // Sequential panel loading - loads panel groups one at a time with delays
  // to prevent OOM by avoiding all chunks being compiled simultaneously
  useEffect(() => {
    const panelOrder = ['core', 'topbar', 'toolbar', 'mobile', 'overlay', 'dialog']
    let cancelled = false

    async function loadPanelsSequentially() {
      for (const panel of panelOrder) {
        if (cancelled) break
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoadedPanels(prev => new Set([...prev, panel]))
      }
    }

    loadPanelsSequentially()
    return () => { cancelled = true }
  }, [])

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
    notes: {
      label: 'Notes',
      color: 'from-yellow-500 to-amber-500',
      icon: <PenTool className="h-3 w-3" />,
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

      {/* Map - loaded lazily to reduce initial compilation memory */}
      <LazyPanel
        importFn={() => import('@/components/map/MapView')}
        exportName="MapView"
        shouldLoad={true}
      />

      {/* Map overlay panels (layers, indicators, overlays) - loaded sequentially */}
      <LazyPanel
        importFn={() => import('@/components/map/panel-groups/MapOverlayPanels')}
        exportName="MapOverlayPanels"
        shouldLoad={loadedPanels.has('overlay')}
      />

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

      {/* Top bar - Search and controls */}
      <div
        className="absolute top-2 right-2 left-2 sm:top-3 sm:right-3 sm:left-3 z-10 flex items-start gap-1.5 sm:gap-2 transition-all duration-300 md:pl-0"
      >
        {/* Responsive padding for desktop sidebar */}
        <div className="flex-1 md:flex-1 md:max-w-lg md:ml-0" style={{ marginLeft: sidebarOpen ? '0px' : undefined }}>
          <div className={sidebarOpen ? 'md:pl-[332px]' : ''} style={{ transition: 'padding-left 0.3s ease-in-out' }}>
            <div className="w-full md:min-w-[280px]">
              <LazyPanel
                importFn={() => import('@/components/map/SearchBar')}
                exportName="SearchBar"
                shouldLoad={true}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <LazyPanel
            importFn={() => import('@/components/map/panel-groups/TopBarPanels')}
            exportName="TopBarPanels"
            shouldLoad={loadedPanels.has('topbar')}
          />
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
            onClick={() => useMapStore.getState().setPrintDialogOpen(true)}
            title="Print Map"
            aria-label="Print map"
          >
            <Printer className="h-4 w-4" />
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
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setRouteSharingOpen(true)}
            title="Share Route"
            aria-label="Share route"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setEmbedDialogOpen(true)}
            title="Embed Map"
            aria-label="Generate embed code"
          >
            <Code2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRoutePlaybackOpen(true)}
            title="Route Playback"
            aria-label="Open route playback"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpeedAlertOpen(true)}
            title="Speed Alerts"
            aria-label="Open speed alert system"
          >
            <Gauge className="h-4 w-4" />
          </Button>
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
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarkerManagerOpen(true)}
            title="Advanced Marker Manager"
            aria-label="Open advanced marker manager"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeofenceAlertOpen(true)}
            title="Geofence Alert History"
            aria-label="Open geofence alert history"
          >
            <BellRing className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setMarkerCategoriesOpen(true)}
            title="Marker Categories"
            aria-label="Manage marker categories"
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setStylesMixerOpen(true)}
            title="Style Mixer"
            aria-label="Open style mixer"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMapLabelsOpen(true)}
            title="Map Labels"
            aria-label="Open map labels overlay"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setContourGeneratorOpen(true)}
            title="Contour Generator"
            aria-label="Open contour generator"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setClusteringOpen(true)}
            title="Location Clustering"
            aria-label="Open location clustering"
          >
            <Boxes className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStoryCreatorOpen(true)}
            title="Map Story Creator"
            aria-label="Open map story creator"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTerrainProfile3DOpen(true)}
            title="3D Terrain Profile"
            aria-label="Open 3D terrain profile"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setImportExportOpen(true)}
            title="Data Import/Export"
            aria-label="Open data import/export"
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOverlayGalleryOpen(true)}
            title="Map Overlay Gallery"
            aria-label="Open map overlay gallery"
          >
            <MapPinned className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVisitTimelineOpen(true)}
            title="Location Visit Timeline"
            aria-label="Open location visit timeline"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWeatherCompareOpen(true)}
            title="Weather Comparison"
            aria-label="Open weather comparison"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setScreenshotManagerOpen(true)}
            title="Screenshot Manager"
            aria-label="Open screenshot manager"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDifficultyAnalyzerOpen(true)}
            title="Route Difficulty Analyzer"
            aria-label="Open route difficulty analyzer"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAltitudeAlertOpen(true)}
            title="Altitude Alerts"
            aria-label="Open altitude alert system"
          >
            <ArrowUpFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCompassRose({ visible: !useMapStore.getState().compassRose.visible })}
            title="Compass Rose"
            aria-label="Toggle compass rose"
          >
            <Compass className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMultiStopPlannerOpen(true)}
            title="Multi-Stop Route Planner"
            aria-label="Open multi-stop route planner"
          >
            <Waypoints className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEnhancedWeatherOpen(true)}
            title="Enhanced Weather Dashboard"
            aria-label="Open enhanced weather dashboard"
          >
            <CloudSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setChatOpen(!useMapStore.getState().chatOpen)}
            title="Map Chat Assistant"
            aria-label="Open map chat assistant"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setShareCardOpen(true)}
            title="Coordinate Share Card"
            aria-label="Open coordinate share card"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWallpaperOpen(true)}
            title="Map Wallpaper Generator"
            aria-label="Open map wallpaper generator"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAnimationStudioOpen(true)}
            title="Animation Studio"
            aria-label="Open map animation studio"
          >
            <Clapperboard className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSmartRoute({ open: true })}
            title="Smart Route Planner"
            aria-label="Open smart route planner"
          >
            <Route className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDataVisualizer({ open: true })}
            title="Data Visualizer"
            aria-label="Open data visualizer"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFieldSurvey({ open: true })}
            title="Field Survey Tool"
            aria-label="Open field survey tool"
          >
            <ClipboardCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEmergencyRoute({ open: true })}
            title="Emergency Route Planner"
            aria-label="Open emergency route planner"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setComparisonSlider({ enabled: !useMapStore.getState().comparisonSlider.enabled })}
            title="Map Comparison Slider"
            aria-label="Toggle map comparison slider"
          >
            <SplitSquareHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setNoiseHeatmap({ enabled: !useMapStore.getState().noiseHeatmap.enabled })}
            title="Noise Heatmap"
            aria-label="Toggle noise heatmap"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarExposure({ open: true })}
            title="Solar Exposure Analyzer"
            aria-label="Open solar exposure analyzer"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStyleForge({ open: true })}
            title="Style Forge"
            aria-label="Open style forge"
          >
            <Hammer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTopoProfiler({ open: true })}
            title="Topographic Profiler"
            aria-label="Open topographic profiler"
          >
            <MountainIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMaritimeNav({ open: true })}
            title="Maritime Navigation"
            aria-label="Open maritime navigation"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeocaching({ open: true })}
            title="Geocaching Toolkit"
            aria-label="Open geocaching toolkit"
          >
            <Map className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAtmospheric({ open: true })}
            title="Atmospheric Dashboard"
            aria-label="Open atmospheric dashboard"
          >
            <CloudCog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeTracker({ open: true })}
            title="Wildlife Tracker"
            aria-label="Open wildlife tracker"
          >
            <Bird className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCulturalHeritage({ open: true })}
            title="Cultural Heritage Map"
            aria-label="Open cultural heritage map"
          >
            <Landmark className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHydrology({ open: true })}
            title="Hydrology Analyzer"
            aria-label="Open hydrology analyzer"
          >
            <Droplets className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierMonitor({ open: true })}
            title="Glacier Monitor"
            aria-label="Open glacier monitor"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeismicActivity({ open: true })}
            title="Seismic Activity"
            aria-label="Open seismic activity map"
          >
            <ActivityIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilAnalysis({ open: true })}
            title="Soil Analysis"
            aria-label="Open soil analysis panel"
          >
            <Sprout className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanGrowth({ open: true })}
            title="Urban Growth Simulator"
            aria-label="Open urban growth simulator"
          >
            <Building2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirspaceNav({ open: true })}
            title="Airspace Navigator"
            aria-label="Open airspace navigator"
          >
            <Plane className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setReefHealth({ open: true })}
            title="Reef Health Monitor"
            aria-label="Open reef health monitor"
          >
            <Waves className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagneticField({ open: true })}
            title="Magnetic Field Mapper"
            aria-label="Open magnetic field mapper"
          >
            <Magnet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFloodRisk({ open: true })}
            title="Flood Risk Analyzer"
            aria-label="Open flood risk analyzer"
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoMonitor({ open: true })}
            title="Volcano Monitor"
            aria-label="Open volcano monitor"
          >
            <Flame className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheRisk({ open: true })}
            title="Avalanche Risk Map"
            aria-label="Open avalanche risk map"
          >
            <SnowflakeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCropHealth({ open: true })}
            title="Crop Health Analyzer"
            aria-label="Open crop health analyzer"
          >
            <Wheat className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceTrack({ open: true })}
            title="Space Track Viewer"
            aria-label="Open space track viewer"
          >
            <Satellite className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setArchaeologyMap({ open: true })}
            title="Archaeology Map"
            aria-label="Open archaeology map"
          >
            <Pyramid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPollutionTracker({ open: true })}
            title="Pollution Tracker"
            aria-label="Open pollution tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTidalPredictor({ open: true })}
            title="Tidal Predictor"
            aria-label="Open tidal predictor"
          >
            <Ship className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWindFarm({ open: true })}
            title="Wind Farm Optimizer"
            aria-label="Open wind farm optimizer"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertification({ open: true })}
            title="Desertification Monitor"
            aria-label="Open desertification monitor"
          >
            <SunIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMineralExploration({ open: true })}
            title="Mineral Exploration"
            aria-label="Open mineral exploration"
          >
            <Gem className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrent({ open: true })}
            title="Ocean Current Mapper"
            aria-label="Open ocean current mapper"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrost({ open: true })}
            title="Permafrost Thaw Tracker"
            aria-label="Open permafrost thaw tracker"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightning({ open: true })}
            title="Lightning Strike Map"
            aria-label="Open lightning strike map"
          >
            <CloudLightning className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBiome({ open: true })}
            title="Biome Classifier"
            aria-label="Open biome classifier"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGroundwater({ open: true })}
            title="Groundwater Explorer"
            aria-label="Open groundwater explorer"
          >
            <DropletIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSolarPower({ open: true })}
            title="Solar Power Planner"
            aria-label="Open solar power planner"
          >
            <SunIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicAsh({ open: true })}
            title="Volcanic Ash Tracker"
            aria-label="Open volcanic ash tracker"
          >
            <CloudHail className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoastalErosion({ open: true })}
            title="Coastal Erosion Monitor"
            aria-label="Open coastal erosion monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonFootprint({ open: true })}
            title="Carbon Footprint Mapper"
            aria-label="Open carbon footprint mapper"
          >
            <CloudSmoke className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildlifeMigration({ open: true })}
            title="Wildlife Migration Tracker"
            aria-label="Open wildlife migration tracker"
          >
            <BirdIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setIceSheet({ open: true })}
            title="Ice Sheet Monitor"
            aria-label="Open ice sheet monitor"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDroughtMonitor({ open: true })}
            title="Drought Monitor"
            aria-label="Open drought monitor"
          >
            <ThermometerSun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandSubsidence({ open: true })}
            title="Land Subsidence Tracker"
            aria-label="Open land subsidence tracker"
          >
            <ArrowDownFromLine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralBleaching({ open: true })}
            title="Coral Bleaching Alert"
            aria-label="Open coral bleaching alert"
          >
            <Shell className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiAlert({ open: true })}
            title="Tsunami Alert System"
            aria-label="Open tsunami alert system"
          >
            <Siren className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilErosion({ open: true })}
            title="Soil Erosion Monitor"
            aria-label="Open soil erosion monitor"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWatershedManager({ open: true })}
            title="Watershed Manager"
            aria-label="Open watershed manager"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicPlate({ open: true })}
            title="Tectonic Plate Viewer"
            aria-label="Open tectonic plate viewer"
          >
            <GlobeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirQualityForecaster({ open: true })}
            title="Air Quality Forecaster"
            aria-label="Open air quality forecaster"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacialLake({ open: true })}
            title="Glacial Lake Monitor"
            aria-label="Open glacial lake monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeather({ open: true })}
            title="Space Weather Monitor"
            aria-label="Open space weather monitor"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatlandMonitor({ open: true })}
            title="Peatland Monitor"
            aria-label="Open peatland monitor"
          >
            <TreeDeciduous className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveMonitor({ open: true })}
            title="Mangrove Monitor"
            aria-label="Open mangrove monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSandstormTracker({ open: true })}
            title="Sandstorm Tracker"
            aria-label="Open sandstorm tracker"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWetlandMapper({ open: true })}
            title="Wetland Mapper"
            aria-label="Open wetland mapper"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanHeatIsland({ open: true })}
            title="Urban Heat Island"
            aria-label="Open urban heat island"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWildfireRisk({ open: true })}
            title="Wildfire Risk Assessor"
            aria-label="Open wildfire risk assessor"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAlgalBloom({ open: true })}
            title="Algal Bloom Tracker"
            aria-label="Open algal bloom tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandslideRisk({ open: true })}
            title="Landslide Predictor"
            aria-label="Open landslide predictor"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaIceNavigator({ open: true })}
            title="Sea Ice Navigator"
            aria-label="Open sea ice navigator"
          >
            <ShipIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCloudCover({ open: true })}
            title="Cloud Cover Analyzer"
            aria-label="Open cloud cover analyzer"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilMoisture({ open: true })}
            title="Soil Moisture Monitor"
            aria-label="Open soil moisture monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightPollution({ open: true })}
            title="Light Pollution Map"
            aria-label="Open light pollution map"
          >
            <MoonIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRiverFlow({ open: true })}
            title="River Flow Monitor"
            aria-label="Open river flow monitor"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanoSeismic({ open: true })}
            title="Volcano Seismic Monitor"
            aria-label="Open volcano seismic monitor"
          >
            <Triangle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setWhaleMigration({ open: true })}
            title="Whale Migration Tracker"
            aria-label="Open whale migration tracker"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAvalancheForecaster({ open: true })}
            title="Avalanche Forecaster"
            aria-label="Open avalanche forecaster"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAuroraForecaster({ open: true })}
            title="Aurora Forecaster"
            aria-label="Open aurora forecaster"
          >
            <SparklesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOzoneLayer({ open: true })}
            title="Ozone Layer Monitor"
            aria-label="Open ozone layer monitor"
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeforestation({ open: true })}
            title="Deforestation Tracker"
            aria-label="Open deforestation tracker"
          >
            <TreePine className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneEmissions({ open: true })}
            title="Methane Emissions Tracker"
            aria-label="Open methane emissions tracker"
          >
            <Factory className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanAcidification({ open: true })}
            title="Ocean Acidification Monitor"
            aria-label="Open ocean acidification monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceDebris({ open: true })}
            title="Space Debris Tracker"
            aria-label="Open space debris tracker"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTectonicStrain({ open: true })}
            title="Tectonic Strain Monitor"
            aria-label="Open tectonic strain monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPhytoBloom({ open: true })}
            title="Phytoplankton Bloom Monitor"
            aria-label="Open phytoplankton bloom monitor"
          >
            <Fish className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSnowCover({ open: true })}
            title="Snow Cover Monitor"
            aria-label="Open snow cover monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeomagneticStorm({ open: true })}
            title="Geomagnetic Storm Tracker"
            aria-label="Open geomagnetic storm tracker"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicGas({ open: true })}
            title="Volcanic Gas Monitor"
            aria-label="Open volcanic gas monitor"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAquiferDepletion({ open: true })}
            title="Aquifer Depletion Monitor"
            aria-label="Open aquifer depletion monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStratosphericWind({ open: true })}
            title="Stratospheric Wind Monitor"
            aria-label="Open stratospheric wind monitor"
          >
            <WindIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMarineHeatwave({ open: true })}
            title="Marine Heatwave Tracker"
            aria-label="Open marine heatwave tracker"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPrecipitation({ open: true })}
            title="Precipitation Analyzer"
            aria-label="Open precipitation analyzer"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCosmicRay({ open: true })}
            title="Cosmic Ray Monitor"
            aria-label="Open cosmic ray monitor"
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGreenlandIce({ open: true })}
            title="Greenland Ice Tracker"
            aria-label="Open greenland ice tracker"
          >
            <Globe2Icon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadiationExposure({ open: true })}
            title="Radiation Exposure Monitor"
            aria-label="Open radiation exposure monitor"
          >
            <ShieldAlert className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPeatFire({ open: true })}
            title="Peat Fire Tracker"
            aria-label="Open peat fire tracker"
          >
            <FlameIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSeaLevelRise({ open: true })}
            title="Sea Level Rise Projector"
            aria-label="Open sea level rise projector"
          >
            <WavesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setThermocline({ open: true })}
            title="Thermocline Mapper"
            aria-label="Open thermocline mapper"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAcidRain({ open: true })}
            title="Acid Rain Tracker"
            aria-label="Open acid rain tracker"
          >
            <CloudRain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMethaneHydrate({ open: true })}
            title="Methane Hydrate Monitor"
            aria-label="Open methane hydrate monitor"
          >
            <DropletsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setKelpForest({ open: true })}
            title="Kelp Forest Monitor"
            aria-label="Open kelp forest monitor"
          >
            <Leaf className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGLOF({ open: true })}
            title="Glacier Lake Outburst Tracker"
            aria-label="Open glacier lake outburst tracker"
          >
            <Mountain className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDustStorm({ open: true })}
            title="Dust Storm Tracker"
            aria-label="Open dust storm tracker"
          >
            <WindIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setBioluminescence({ open: true })}
            title="Bioluminescence Tracker"
            aria-label="Open bioluminescence tracker"
          >
            <SparklesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setUrbanSprawl({ open: true })}
            title="Urban Sprawl Monitor"
            aria-label="Open urban sprawl monitor"
          >
            <Building2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setViralOutbreak({ open: true })}
            title="Viral Outbreak Mapper"
            aria-label="Open viral outbreak mapper"
          >
            <Bug className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMagnetosphere({ open: true })}
            title="Magnetosphere Monitor"
            aria-label="Open magnetosphere monitor"
          >
            <MagnetIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFogDensity({ open: true })}
            title="Fog Density Mapper"
            aria-label="Open fog density mapper"
          >
            <CloudFog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCarbonCapture({ open: true })}
            title="Carbon Capture Tracker"
            aria-label="Open carbon capture tracker"
          >
            <FactoryIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setHailStorm({ open: true })}
            title="Hail Storm Tracker"
            aria-label="Open hail storm tracker"
          >
            <CloudHailIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSaharaReforestation({ open: true })}
            title="Sahara Reforestation Tracker"
            aria-label="Open sahara reforestation tracker"
          >
            <TreePineIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDeepSeaVent({ open: true })}
            title="Deep Sea Vent Monitor"
            aria-label="Open deep sea vent monitor"
          >
            <FlameIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStormSurge({ open: true })}
            title="Storm Surge Predictor"
            aria-label="Open storm surge predictor"
          >
            <WavesIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLandfillMonitor({ open: true })}
            title="Landfill Monitor"
            aria-label="Open landfill monitor"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSalinityGradient({ open: true })}
            title="Salinity Gradient Mapper"
            aria-label="Open salinity gradient mapper"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMicroplastics({ open: true })}
            title="Microplastics Tracker"
            aria-label="Open microplastics tracker"
          >
            <SearchIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setRadioSignal({ open: true })}
            title="Radio Signal Mapper"
            aria-label="Open radio signal mapper"
          >
            <RadioIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicIsland({ open: true })}
            title="Volcanic Island Monitor"
            aria-label="Open volcanic island monitor"
          >
            <MountainIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPermafrostThaw({ open: true })}
            title="Permafrost Thaw Monitor"
            aria-label="Open permafrost thaw monitor"
          >
            <ThermometerSnowflake className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanCurrentTracker({ open: true })}
            title="Ocean Current Tracker"
            aria-label="Open ocean current tracker"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSpaceWeatherAlert({ open: true })}
            title="Space Weather Alert"
            aria-label="Open space weather alert"
          >
            <SunIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertMonitor({ open: true })}
            title="Desert Monitor"
            aria-label="Open desert monitor"
          >
            <SunDim className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setTsunamiBuoy({ open: true })}
            title="Tsunami Buoy Tracker"
            aria-label="Open tsunami buoy tracker"
          >
            <Anchor className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGlacierVelocity({ open: true })}
            title="Glacier Velocity Tracker"
            aria-label="Open glacier velocity tracker"
          >
            <MountainSnow className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setEarthquakeSwarm({ open: true })}
            title="Earthquake Swarm Monitor"
            aria-label="Open earthquake swarm monitor"
          >
            <ActivityIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMangroveRestoration({ open: true })}
            title="Mangrove Restoration Tracker"
            aria-label="Open mangrove restoration tracker"
          >
            <TreeDeciduousIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCoralBleachingMonitor({ open: true })}
            title="Coral Bleaching Monitor"
            aria-label="Open coral bleaching monitor"
          >
            <FishIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setArcticSeaIce({ open: true })}
            title="Arctic Sea Ice Monitor"
            aria-label="Open arctic sea ice monitor"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSoilMoistureAg({ open: true })}
            title="Soil Moisture Ag Mapper"
            aria-label="Open soil moisture mapper"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setNoisePollution({ open: true })}
            title="Noise Pollution Mapper"
            aria-label="Open noise pollution mapper"
          >
            <Volume2Icon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setLightPollutionSky({ open: true })}
            title="Light Pollution Sky Mapper"
            aria-label="Open light pollution mapper"
          >
            <EyeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGroundwaterRecharge({ open: true })}
            title="Groundwater Recharge Tracker"
            aria-label="Open groundwater recharge tracker"
          >
            <DrillIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAirQuality({ open: true })}
            title="Air Quality Monitor"
            aria-label="Open air quality monitor"
          >
            <WindIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSubglacialLake({ open: true })}
            title="Subglacial Lake Explorer"
            aria-label="Open subglacial lake explorer"
          >
            <WavesIcon3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setThermokarstLake({ open: true })}
            title="Thermokarst Lake Monitor"
            aria-label="Open thermokarst lake monitor"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setPaleoclimateProxy({ open: true })}
            title="Paleoclimate Proxy Explorer"
            aria-label="Open paleoclimate proxy explorer"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGicMonitor({ open: true })}
            title="GIC Monitor"
            aria-label="Open geomagnetically induced current monitor"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setSabkhaEnvironment({ open: true })}
            title="Sabkha Environment"
            aria-label="Open sabkha environment monitor"
          >
            <SunIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setCryosphereChange({ open: true })}
            title="Cryosphere Change Tracker"
            aria-label="Open cryosphere change tracker"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAbyssalPlain({ open: true })}
            title="Abyssal Plain Mapper"
            aria-label="Open abyssal plain mapper"
          >
            <FishIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setFjordEcosystem({ open: true })}
            title="Fjord Ecosystem Monitor"
            aria-label="Open fjord ecosystem monitor"
          >
            <MountainIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setGeothermalSpring({ open: true })}
            title="Geothermal Spring Monitor"
            aria-label="Open geothermal spring monitor"
          >
            <FlameIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setAsteroidImpact({ open: true })}
            title="Asteroid Impact Risk Mapper"
            aria-label="Open asteroid impact risk mapper"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setDesertOasis({ open: true })}
            title="Desert Oasis Monitor"
            aria-label="Open desert oasis monitor"
          >
            <DropletsIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setVolcanicLightning({ open: true })}
            title="Volcanic Lightning Tracker"
            aria-label="Open volcanic lightning tracker"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setIceCoreData({ open: true })}
            title="Ice Core Data Explorer"
            aria-label="Open ice core data explorer"
          >
            <SnowflakeIcon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setStratosphericAerosol({ open: true })}
            title="Stratospheric Aerosol Monitor"
            aria-label="Open stratospheric aerosol monitor"
          >
            <CloudIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setMegacityCarbon({ open: true })}
            title="Megacity Carbon Footprint"
            aria-label="Open megacity carbon footprint"
          >
            <Globe2Icon2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => useMapStore.getState().setOceanEddy({ open: true })}
            title="Ocean Mesoscale Eddy Tracker"
            aria-label="Open ocean mesoscale eddy tracker"
          >
            <WavesIcon3 className="h-4 w-4" />
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
        {/* Track Record Button - lazy loaded */}
        <div className="mt-2 flex justify-center">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <LazyPanel
                  importFn={() => import('@/components/map/TrackRecorder')}
                  exportName="TrackRecordButton"
                  shouldLoad={loadedPanels.has('topbar')}
                  props={{
                    onClick: () => {
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
        {/* Measurement Suite & Trail Finder buttons */}
        <div className="mt-2 flex flex-col items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.measurementSuiteOpen)
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setMeasurementSuiteOpen(true)}
                  aria-label="Measurement Suite"
                >
                  <Triangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Measurement Suite
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.trailFinderOpen)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setTrailFinderOpen(true)}
                  aria-label="Trail Finder"
                >
                  <TreePine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Trail Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.pedometerVisible)
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setPedometerVisible(!useMapStore.getState().pedometerVisible)}
                  aria-label="Pedometer"
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Pedometer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.usageStatsOpen)
                      ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setUsageStatsOpen(true)}
                  aria-label="Usage Statistics"
                >
                  <PieChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Usage Statistics
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.collageCreatorOpen)
                      ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setCollageCreatorOpen(true)}
                  aria-label="Map Collage Creator"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Map Collage Creator
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl transition-all duration-200',
                    useMapStore((s) => s.eventsFinderOpen)
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'hover:bg-accent'
                  )}
                  onClick={() => useMapStore.getState().setEventsFinderOpen(true)}
                  aria-label="Nearby Events Finder"
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium px-3 py-2">
                Nearby Events Finder
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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


      {/* Coordinates display - bottom center (desktop only) */}
      <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <LazyPanel
          importFn={() => import('@/components/map/CoordinatesDisplay')}
          exportName="CoordinatesDisplay"
          shouldLoad={true}
        />
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
                {[
                  { x: 50, y: 80, dur: 3.5 },
                  { x: 120, y: 40, dur: 4.2 },
                  { x: 200, y: 110, dur: 3.8 },
                  { x: 280, y: 60, dur: 4.5 },
                  { x: 160, y: 130, dur: 3.2 },
                  { x: 90, y: 20, dur: 4.0 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-emerald-400"
                    initial={{
                      x: p.x,
                      y: p.y,
                      opacity: 0,
                    }}
                    animate={{
                      y: [p.y, p.y - 30, p.y + 10],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: p.dur,
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
      <LazyPanel
        importFn={() => import('@/components/map/TrackRecorder')}
        exportName="TrackRecorder"
        shouldLoad={loadedPanels.has('toolbar')}
      />

      {/* Toolbar panels (positioned panels, weather, elevation, etc.) - loaded sequentially */}
      <LazyPanel
        importFn={() => import('@/components/map/panel-groups/ToolbarPanels')}
        exportName="ToolbarPanels"
        shouldLoad={loadedPanels.has('toolbar')}
      />

      {/* Mobile bottom panels - loaded sequentially */}
      <LazyPanel
        importFn={() => import('@/components/map/panel-groups/MobileBottomPanels')}
        exportName="MobileBottomPanels"
        shouldLoad={loadedPanels.has('mobile')}
      />

      {/* Dialog panels (modals, dialogs, managers) - loaded sequentially */}
      <LazyPanel
        importFn={() => import('@/components/map/panel-groups/DialogPanels')}
        exportName="DialogPanels"
        shouldLoad={loadedPanels.has('dialog')}
        props={{ geofenceCoords }}
      />

      {/* Monitor panels (environmental/geospatial monitoring) - always loaded since it returns null */}
      <LazyPanel
        importFn={() => import('@/components/map/panel-groups/MonitorPanelRegistry')}
        exportName="MonitorPanelRegistry"
        shouldLoad={loadedPanels.has('core')}
      />

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
