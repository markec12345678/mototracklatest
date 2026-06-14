'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useMapStore, MAP_STYLES } from '@/lib/map-store'
import { useServiceWorker } from '@/hooks/use-service-worker'
import {
  MapPin,
  Layers,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { LazyPanel } from '@/components/LazyPanel'

export default function Home() {
  const { currentStyle, setCurrentStyle, setCenter, setZoom } = useMapStore()
  const [showWelcome, setShowWelcome] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadedPanels, setLoadedPanels] = useState<Set<string>>(new Set(['core']))

  useServiceWorker()

  // Restore map state from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = params.get('lat')
    const lng = params.get('lng')
    const z = params.get('zoom')
    const style = params.get('style')
    if (lat && lng) setCenter([parseFloat(lat), parseFloat(lng)])
    if (z) setZoom(parseFloat(z))
    if (style) {
      const found = MAP_STYLES.find(s => s.id === style)
      if (found) setCurrentStyle(found)
    }
  }, [setCenter, setZoom, setCurrentStyle])

  // Sequential panel loading - loads groups one at a time
  useEffect(() => {
    const panelOrder = ['search', 'topbar', 'overlay', 'toolbar', 'mobile', 'dialog']
    let cancelled = false
    async function loadPanelsSequentially() {
      for (const panel of panelOrder) {
        if (cancelled) break
        await new Promise(resolve => setTimeout(resolve, 4000))
        setLoadedPanels(prev => new Set([...prev, panel]))
      }
    }
    loadPanelsSequentially()
    return () => { cancelled = true }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Map */}
      <div className="absolute inset-0">
        <LazyPanel
          importFn={() => import('@/components/map/MapView')}
          exportName="MapView"
          shouldLoad={true}
        />
      </div>

      {/* Search Bar */}
      {loadedPanels.has('search') && (
        <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex-1">
              <LazyPanel
                importFn={() => import('@/components/map/SearchBar')}
                exportName="SearchBar"
                shouldLoad={true}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="map-control-glass h-9 w-9 rounded-xl shrink-0"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar Buttons - loaded after search */}
      {loadedPanels.has('topbar') && (
        <LazyPanel
          importFn={() => import('@/components/map/MapToolbarButtons')}
          exportName="MapToolbarButtons"
          shouldLoad={true}
        />
      )}

      {/* Overlay panels (compass, indicators, overlays) */}
      {loadedPanels.has('overlay') && (
        <LazyPanel
          importFn={() => import('@/components/map/panel-groups/MapOverlayPanels')}
          exportName="MapOverlayPanels"
          shouldLoad={true}
        />
      )}

      {/* Toolbar panels (left side) */}
      {loadedPanels.has('toolbar') && (
        <LazyPanel
          importFn={() => import('@/components/map/panel-groups/ToolbarPanels')}
          exportName="ToolbarPanels"
          shouldLoad={true}
        />
      )}

      {/* Mobile bottom panels */}
      {loadedPanels.has('mobile') && (
        <LazyPanel
          importFn={() => import('@/components/map/panel-groups/MobileBottomPanels')}
          exportName="MobileBottomPanels"
          shouldLoad={true}
        />
      )}

      {/* Dialog panels */}
      {loadedPanels.has('dialog') && (
        <LazyPanel
          importFn={() => import('@/components/map/panel-groups/DialogPanels')}
          exportName="DialogPanels"
          shouldLoad={true}
        />
      )}

      {/* Monitor panel registry - loads on demand */}
      {loadedPanels.has('dialog') && (
        <LazyPanel
          importFn={() => import('@/components/map/panel-groups/MonitorPanelRegistry')}
          exportName="MonitorPanelRegistry"
          shouldLoad={true}
        />
      )}

      {/* Welcome overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-2xl p-8 max-w-md shadow-xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">MapLibre Explorer</h1>
              <p className="text-muted-foreground mb-6 text-sm">
                Interactive map application with real-time monitoring, route planning, and environmental tracking.
              </p>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8"
                onClick={() => setShowWelcome(false)}
              >
                Start Exploring
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t py-1 px-2 sm:px-3 md:px-4">
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
              MapLibre GL JS
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
