'use client'

import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type ToolMode } from '@/lib/map-store'
import {
  Navigation,
  MapPin,
  Ruler,
  Crosshair,
  Github,
  X,
  Plus,
  LocateFixed,
  Layers,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function Home() {
  const { toolMode, sidebarOpen, center, zoom } = useMapStore()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Dismiss welcome after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const flyTo = (window as unknown as Record<
            string,
            (lng: number, lat: number, z?: number) => void
          >).__mapFlyTo
          if (flyTo) {
            flyTo(position.coords.longitude, position.coords.latitude, 14)
          }
        },
        () => {
          // Geolocation denied
        }
      )
    }
  }

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
      color: 'from-blue-500 to-cyan-500',
      icon: <Crosshair className="h-3 w-3" />,
    },
  }

  const currentTool = toolIndicator[toolMode]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Map */}
      <MapView />

      {/* Sidebar */}
      <MapSidebar />

      {/* Compass indicator (visible when map is rotated) */}
      <CompassIndicator />

      {/* Top bar - Search and controls */}
      <div
        className="absolute top-4 right-4 left-4 z-10 flex items-start gap-2 transition-all duration-300"
        style={{ paddingLeft: sidebarOpen ? '332px' : '16px' }}
      >
        <div className="flex-1 max-w-lg">
          <SearchBar />
        </div>
        <StyleSwitcher />
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          className="bg-background/90 backdrop-blur-sm shadow-md h-10 w-10 rounded-xl"
          onClick={handleLocateMe}
          title="My Location"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/90 backdrop-blur-sm shadow-md h-10 w-10 rounded-xl"
          onClick={toggleFullscreen}
          title="Fullscreen"
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
          className="bg-background/90 backdrop-blur-sm shadow-md h-10 w-10 rounded-xl"
          onClick={() =>
            window.open('https://github.com/maplibre/maplibre-native', '_blank')
          }
          title="GitHub"
        >
          <Github className="h-4 w-4" />
        </Button>
      </div>

      {/* Tool toolbar - left side */}
      <div
        className="absolute left-4 z-10 transition-all duration-300"
        style={{ top: '80px' }}
      >
        <MapToolbar />
      </div>

      {/* Current tool indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={toolMode}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 transition-all"
          style={{
            left: sidebarOpen ? '332px' : '60px',
            top: '80px',
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

      {/* Map Stats Panel - right side above footer */}
      <div className="absolute bottom-10 right-5 z-10">
        <MapStatsPanel />
      </div>

      {/* Coordinates display - bottom center */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <CoordinatesDisplay />
      </div>

      {/* Add Location FAB */}
      <motion.div
        className="absolute bottom-20 right-5 z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-2xl shadow-xl h-14 px-5 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 transition-all"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">Add Place</span>
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
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-md w-full px-4"
          >
            <div className="bg-background/95 backdrop-blur-xl border rounded-2xl p-5 shadow-2xl">
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    Welcome to MapLibre Explorer
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    An interactive map application powered by MapLibre GL JS.
                    Explore the world, drop pins, measure distances, and switch
                    between beautiful map styles.
                  </p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {[
                      { label: '5 Map Styles', emoji: '🗺️' },
                      { label: 'Save Locations', emoji: '📍' },
                      { label: 'Measure', emoji: '📏' },
                      { label: 'Geocoding', emoji: '🔍' },
                      { label: 'Export GeoJSON', emoji: '📦' },
                      { label: 'Dark Mode', emoji: '🌙' },
                    ].map((feature) => (
                      <Badge
                        key={feature.label}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 gap-1"
                      >
                        {feature.emoji} {feature.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Location Dialog */}
      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t py-1.5 px-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="font-medium">MapLibre Explorer</span>
            <span className="text-border">|</span>
            <span>Powered by MapLibre GL JS</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://maplibre.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              maplibre.org
            </a>
            <span className="text-border">|</span>
            <a
              href="https://github.com/maplibre/maplibre-native"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <span className="text-border">|</span>
            <span>© OpenStreetMap</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
