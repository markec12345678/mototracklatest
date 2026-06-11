'use client'

import { useState, useEffect } from 'react'
import { MapView } from '@/components/map/MapView'
import { MapSidebar } from '@/components/map/MapSidebar'
import { SearchBar } from '@/components/map/SearchBar'
import { StyleSwitcher } from '@/components/map/StyleSwitcher'
import { CoordinatesDisplay } from '@/components/map/CoordinatesDisplay'
import { MapToolbar } from '@/components/map/MapToolbar'
import { AddLocationDialog } from '@/components/map/AddLocationDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type ToolMode } from '@/lib/map-store'
import {
  Navigation,
  MapPin,
  Ruler,
  Crosshair,
  Github,
  Info,
  X,
} from 'lucide-react'

export default function Home() {
  const { toolMode, setToolMode, sidebarOpen } = useMapStore()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Dismiss welcome after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  const toolIndicator = {
    navigate: { label: 'Navigate', color: 'bg-emerald-500', icon: <Navigation className="h-3 w-3" /> },
    mark: { label: 'Drop Pin', color: 'bg-red-500', icon: <MapPin className="h-3 w-3" /> },
    measure: { label: 'Measure', color: 'bg-amber-500', icon: <Ruler className="h-3 w-3" /> },
    directions: { label: 'Directions', color: 'bg-blue-500', icon: <Crosshair className="h-3 w-3" /> },
  }

  const currentTool = toolIndicator[toolMode]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Map */}
      <MapView />

      {/* Sidebar */}
      <MapSidebar />

      {/* Top bar - Search and controls */}
      <div
        className="absolute top-4 right-4 left-4 z-10 flex items-start gap-3"
        style={{ paddingLeft: sidebarOpen ? '320px' : '48px' }}
      >
        <div className="flex-1">
          <SearchBar />
        </div>
        <StyleSwitcher />
        <Button
          variant="outline"
          size="icon"
          className="bg-background/90 backdrop-blur-sm shadow-sm h-10 w-10"
          onClick={() => window.open('https://github.com/maplibre/maplibre-native', '_blank')}
        >
          <Github className="h-4 w-4" />
        </Button>
      </div>

      {/* Tool toolbar - left side */}
      <div
        className="absolute left-4 z-10 transition-all"
        style={{ top: '80px' }}
      >
        <MapToolbar />
      </div>

      {/* Current tool indicator */}
      <div
        className="absolute z-10 transition-all"
        style={{
          left: sidebarOpen ? '332px' : '60px',
          top: '80px',
        }}
      >
        <Badge
          className={`${currentTool.color} text-white border-0 px-3 py-1 gap-1.5 shadow-sm`}
        >
          {currentTool.icon}
          {currentTool.label} Mode
        </Badge>
      </div>

      {/* Coordinates display - bottom center */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <CoordinatesDisplay />
      </div>

      {/* Add Location FAB */}
      <div
        className="absolute bottom-20 right-4 z-10"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          onClick={() => setAddDialogOpen(true)}
        >
          <MapPin className="h-6 w-6" />
        </Button>
      </div>

      {/* Welcome banner */}
      {showWelcome && (
        <div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-lg w-full px-4"
        >
          <div className="bg-background/95 backdrop-blur-md border rounded-xl p-5 shadow-xl">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Welcome to MapLibre Explorer</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  An interactive map application powered by MapLibre GL JS. Explore the world,
                  drop pins to save locations, measure distances, and switch between beautiful
                  map styles. Built with the open-source MapLibre rendering engine.
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary" className="text-[10px]">
                    🗺️ Multiple Styles
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    📍 Save Locations
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    📏 Measure Distance
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Dialog */}
      <AddLocationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t py-2 px-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="h-2.5 w-2.5 text-white" />
            </div>
            <span>MapLibre Explorer</span>
            <span className="text-border">|</span>
            <span>Powered by MapLibre GL JS</span>
          </div>
          <div className="flex items-center gap-3">
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
