'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type AirspaceZone, type AirportData } from '@/lib/map-store'
import {
  Plane,
  X,
  Radar,
  Radio,
  MapPin,
  ArrowUp,
  Navigation,
  ArrowUpRight,
  Compass,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

// Demo data
const DEMO_AIRSPACES: AirspaceZone[] = [
  {
    id: 'as-1',
    name: 'London TMA',
    type: 'tma',
    ceiling: 24500,
    floor: 2500,
    coordinates: [[-0.5, 51.5], [0.2, 51.6], [0.5, 51.3], [-0.1, 51.2]],
    activeTimes: 'H24',
    controllingAuthority: 'London Area Control',
    frequency: '132.800',
  },
  {
    id: 'as-2',
    name: 'Heathrow CTR',
    type: 'ctr',
    ceiling: 2500,
    floor: 0,
    coordinates: [[-0.6, 51.5], [-0.1, 51.5], [-0.1, 51.4], [-0.6, 51.4]],
    activeTimes: 'H24',
    controllingAuthority: 'Heathrow Director',
    frequency: '119.725',
  },
  {
    id: 'as-3',
    name: 'Class A Airway A1',
    type: 'classA',
    ceiling: 35000,
    floor: 5500,
    coordinates: [[-0.1, 51.5], [0.3, 52.0], [0.8, 52.5]],
    activeTimes: 'H24',
    controllingAuthority: 'London Area Control',
    frequency: '133.400',
  },
  {
    id: 'as-4',
    name: 'Stansted Class D',
    type: 'classD',
    ceiling: 3500,
    floor: 1000,
    coordinates: [[0.2, 51.9], [0.35, 51.95], [0.4, 51.85], [0.25, 51.8]],
    activeTimes: 'HJ',
    controllingAuthority: 'Stansted Approach',
    frequency: '123.800',
  },
  {
    id: 'as-5',
    name: 'Fairford Restricted',
    type: 'restricted',
    ceiling: 8000,
    floor: 0,
    coordinates: [[-1.8, 51.7], [-1.5, 51.7], [-1.5, 51.5], [-1.8, 51.5]],
    activeTimes: 'H24 (NOTAM)',
    controllingAuthority: 'RAF Fairford',
    frequency: null,
  },
  {
    id: 'as-6',
    name: 'Class E Airspace',
    type: 'classE',
    ceiling: 10000,
    floor: 3000,
    coordinates: [[0.5, 51.8], [1.0, 51.9], [1.2, 51.6], [0.7, 51.5]],
    activeTimes: 'H24',
    controllingAuthority: 'London Information',
    frequency: '124.600',
  },
  {
    id: 'as-7',
    name: 'Class G Uncontrolled',
    type: 'classG',
    ceiling: 3000,
    floor: 0,
    coordinates: [[1.0, 51.5], [1.5, 51.6], [1.6, 51.3], [1.1, 51.2]],
    activeTimes: 'N/A',
    controllingAuthority: 'None',
    frequency: null,
  },
]

const DEMO_AIRPORTS: AirportData[] = [
  {
    id: 'apt-1',
    icao: 'EGLL',
    name: 'London Heathrow',
    latitude: 51.47,
    longitude: -0.46,
    elevation: 83,
    runways: [
      { name: '09L/27R', length: 3902, surface: 'Asphalt', heading: 87 },
      { name: '09R/27L', length: 3658, surface: 'Asphalt', heading: 90 },
    ],
    frequencies: [
      { type: 'ATIS', freq: '128.075' },
      { type: 'Ground', freq: '121.700' },
      { type: 'Tower', freq: '118.500' },
      { type: 'Director', freq: '119.725' },
    ],
    type: 'international',
  },
  {
    id: 'apt-2',
    icao: 'EGSS',
    name: 'London Stansted',
    latitude: 51.89,
    longitude: 0.24,
    elevation: 106,
    runways: [
      { name: '04/22', length: 3048, surface: 'Asphalt', heading: 23 },
    ],
    frequencies: [
      { type: 'ATIS', freq: '127.075' },
      { type: 'Ground', freq: '121.725' },
      { type: 'Tower', freq: '123.800' },
      { type: 'Approach', freq: '126.700' },
    ],
    type: 'international',
  },
  {
    id: 'apt-3',
    icao: 'EGKB',
    name: 'London Biggin Hill',
    latitude: 51.33,
    longitude: 0.03,
    elevation: 167,
    runways: [
      { name: '03/21', length: 1804, surface: 'Asphalt', heading: 24 },
    ],
    frequencies: [
      { type: 'Tower', freq: '119.575' },
      { type: 'Ground', freq: '121.875' },
    ],
    type: 'regional',
  },
  {
    id: 'apt-4',
    icao: 'EGUC',
    name: 'RAF Brize Norton',
    latitude: 51.75,
    longitude: -1.58,
    elevation: 86,
    runways: [
      { name: '07/25', length: 2728, surface: 'Asphalt', heading: 72 },
    ],
    frequencies: [
      { type: 'Tower', freq: '128.075' },
      { type: 'Approach', freq: '134.300' },
    ],
    type: 'military',
  },
  {
    id: 'apt-5',
    icao: 'EGLW',
    name: 'London Heliport',
    latitude: 51.47,
    longitude: -0.18,
    elevation: 5,
    runways: [],
    frequencies: [
      { type: 'Tower', freq: '122.900' },
    ],
    type: 'heliport',
  },
]

const AIRSPACE_CLASS_CONFIG: Record<string, { color: string; bgColor: string; textColor: string; label: string }> = {
  classA: { color: '#ef4444', bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400', label: 'Class A' },
  classB: { color: '#f97316', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400', label: 'Class B' },
  classC: { color: '#eab308', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-600 dark:text-yellow-400', label: 'Class C' },
  classD: { color: '#22c55e', bgColor: 'bg-green-500/10', textColor: 'text-green-600 dark:text-green-400', label: 'Class D' },
  classE: { color: '#3b82f6', bgColor: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400', label: 'Class E' },
  classG: { color: '#6b7280', bgColor: 'bg-gray-500/10', textColor: 'text-gray-600 dark:text-gray-400', label: 'Class G' },
  restricted: { color: '#ef4444', bgColor: 'bg-red-500/10', textColor: 'text-red-600 dark:text-red-400', label: 'Restricted' },
  prohibited: { color: '#dc2626', bgColor: 'bg-red-700/10', textColor: 'text-red-700 dark:text-red-300', label: 'Prohibited' },
  military: { color: '#7c3aed', bgColor: 'bg-violet-500/10', textColor: 'text-violet-600 dark:text-violet-400', label: 'Military' },
  tma: { color: '#06b6d4', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-600 dark:text-cyan-400', label: 'TMA' },
  ctr: { color: '#a855f7', bgColor: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400', label: 'CTR' },
}

const AIRPORT_TYPE_CONFIG: Record<string, { bgColor: string; textColor: string; label: string }> = {
  international: { bgColor: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400', label: 'International' },
  regional: { bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600 dark:text-emerald-400', label: 'Regional' },
  private: { bgColor: 'bg-gray-500/10', textColor: 'text-gray-600 dark:text-gray-400', label: 'Private' },
  military: { bgColor: 'bg-violet-500/10', textColor: 'text-violet-600 dark:text-violet-400', label: 'Military' },
  heliport: { bgColor: 'bg-amber-500/10', textColor: 'text-amber-600 dark:text-amber-400', label: 'Heliport' },
}

export function AirspaceNavigator() {
  const airspaceNav = useMapStore((s) => s.airspaceNav)
  const setAirspaceNav = useMapStore((s) => s.setAirspaceNav)

  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null)
  const [flightPlanWaypoints, setFlightPlanWaypoints] = useState<Array<{ lat: string; lng: string; alt: string; speed: string }>>([
    { lat: '51.47', lng: '-0.46', alt: '5000', speed: '250' },
  ])

  // Use demo data if store is empty
  const airspaces = airspaceNav.airspaces.length > 0 ? airspaceNav.airspaces : DEMO_AIRSPACES
  const airports = airspaceNav.airports.length > 0 ? airspaceNav.airports : DEMO_AIRPORTS
  const isOpen = airspaceNav.open

  const filteredAirspaces = useMemo(() => {
    const [minAlt, maxAlt] = airspaceNav.altitudeFilter
    return airspaces.filter((as) => {
      const overlapsCeiling = as.ceiling >= minAlt
      const overlapsFloor = as.floor <= maxAlt
      return overlapsCeiling && overlapsFloor
    })
  }, [airspaces, airspaceNav.altitudeFilter])

  const selectedAirport = useMemo(() => {
    return airports.find((a) => a.id === selectedAirportId) || null
  }, [airports, selectedAirportId])

  const togglePanel = useCallback(() => {
    setAirspaceNav({ open: !isOpen })
  }, [isOpen, setAirspaceNav])

  const updateOverlay = useCallback((key: keyof typeof airspaceNav, value: boolean) => {
    setAirspaceNav({ [key]: value })
  }, [setAirspaceNav])

  const addFlightPlanWaypoint = useCallback(() => {
    setFlightPlanWaypoints((prev) => [...prev, { lat: '', lng: '', alt: '5000', speed: '250' }])
  }, [])

  const removeFlightPlanWaypoint = useCallback((index: number) => {
    setFlightPlanWaypoints((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateFlightPlanWaypoint = useCallback((index: number, field: 'lat' | 'lng' | 'alt' | 'speed', value: string) => {
    setFlightPlanWaypoints((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const saveFlightPlan = useCallback(() => {
    const plan = flightPlanWaypoints
      .filter((wp) => wp.lat && wp.lng)
      .map((wp) => ({
        lat: parseFloat(wp.lat),
        lng: parseFloat(wp.lng),
        alt: parseInt(wp.alt) || 5000,
        speed: parseInt(wp.speed) || 250,
      }))
    if (plan.length >= 2) {
      setAirspaceNav({ flightPlan: plan })
    }
  }, [flightPlanWaypoints, setAirspaceNav])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed top-20 right-4 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={togglePanel}
          className={cn(
            'h-11 w-11 rounded-full shadow-lg transition-all duration-200',
            isOpen
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
              : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
          )}
          aria-label={isOpen ? 'Close airspace navigator' : 'Open airspace navigator'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
        </Button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-36 right-4 z-40 w-[380px] max-h-[75vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-sky-500/10 to-blue-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Radar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Airspace Navigator</h3>
                  <p className="text-[10px] text-muted-foreground">Aviation navigation & airspace</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredAirspaces.length} zones
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={togglePanel}
                  aria-label="Close panel"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <Tabs defaultValue="airspaces" className="w-full flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-2">
                <TabsList className="w-full h-8 text-xs">
                  <TabsTrigger value="airspaces" className="text-[11px] flex-1">Airspaces</TabsTrigger>
                  <TabsTrigger value="airports" className="text-[11px] flex-1">Airports</TabsTrigger>
                  <TabsTrigger value="overlays" className="text-[11px] flex-1">Overlays</TabsTrigger>
                  <TabsTrigger value="flightplan" className="text-[11px] flex-1">Flight Plan</TabsTrigger>
                </TabsList>
              </div>

              {/* Airspaces Tab */}
              <TabsContent value="airspaces" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    {/* Altitude Filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Altitude Filter</Label>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {airspaceNav.altitudeFilter[0].toLocaleString()} - {airspaceNav.altitudeFilter[1].toLocaleString()} ft
                        </span>
                      </div>
                      <Slider
                        value={airspaceNav.altitudeFilter}
                        min={0}
                        max={60000}
                        step={500}
                        onValueChange={(value) => setAirspaceNav({ altitudeFilter: value as [number, number] })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>0 ft</span>
                        <span>30,000 ft</span>
                        <span>60,000 ft</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Airspace List */}
                    <div className="space-y-2">
                      {filteredAirspaces.map((airspace) => {
                        const config = AIRSPACE_CLASS_CONFIG[airspace.type] || AIRSPACE_CLASS_CONFIG.classG
                        const isActive = airspaceNav.activeAirspaceId === airspace.id
                        return (
                          <Card
                            key={airspace.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isActive ? 'ring-1 ring-primary' : ''
                            )}
                            onClick={() => setAirspaceNav({
                              activeAirspaceId: isActive ? null : airspace.id
                            })}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div
                                  className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0"
                                  style={{ backgroundColor: config.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-medium truncate">{airspace.name}</span>
                                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4', config.bgColor, config.textColor)} variant="outline">
                                      {config.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <ArrowUpRight className="h-2.5 w-2.5" />
                                      {airspace.floor.toLocaleString()}-{airspace.ceiling.toLocaleString()} ft
                                    </span>
                                    {airspace.frequency && (
                                      <span className="flex items-center gap-0.5">
                                        <Radio className="h-2.5 w-2.5" />
                                        {airspace.frequency}
                                      </span>
                                    )}
                                    <span>{airspace.activeTimes}</span>
                                  </div>
                                  {isActive && (
                                    <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                                      <p>Authority: {airspace.controllingAuthority}</p>
                                      <p>Type: {config.label} airspace</p>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className={cn(
                                  'h-3.5 w-3.5 text-muted-foreground transition-transform',
                                  isActive && 'rotate-90'
                                )} />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                      {filteredAirspaces.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No airspaces in altitude range
                        </p>
                      )}
                    </div>

                    {/* Airspace Class Legend */}
                    <div className="pt-2">
                      <Label className="text-xs font-medium mb-2 block">Class Legend</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(AIRSPACE_CLASS_CONFIG).map(([key, config]) => (
                          <div key={key} className="flex items-center gap-1 text-[9px]">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                            <span className="text-muted-foreground">{config.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Airports Tab */}
              <TabsContent value="airports" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-2">
                    {airports.map((airport) => {
                      const typeConfig = AIRPORT_TYPE_CONFIG[airport.type] || AIRPORT_TYPE_CONFIG.regional
                      const isSelected = selectedAirportId === airport.id
                      return (
                        <Card
                          key={airport.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md',
                            isSelected ? 'ring-1 ring-primary' : ''
                          )}
                          onClick={() => setSelectedAirportId(isSelected ? null : airport.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
                                {airport.type === 'heliport' ? (
                                  <Navigation className="h-4 w-4 text-white" />
                                ) : (
                                  <Plane className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-xs font-medium truncate">{airport.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                                    {airport.icao}
                                  </Badge>
                                  <Badge className={cn('text-[9px] px-1.5 py-0 h-4', typeConfig.bgColor, typeConfig.textColor)} variant="outline">
                                    {typeConfig.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5">
                                    <ArrowUp className="h-2.5 w-2.5" />
                                    {airport.elevation} ft
                                  </span>
                                  <span>{airport.runways.length} runway{airport.runways.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <ChevronRight className={cn(
                                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                                isSelected && 'rotate-90'
                              )} />
                            </div>

                            {/* Expanded Detail View */}
                            {isSelected && (
                              <div className="mt-3 pt-2 border-t border-border/50 space-y-2">
                                {/* Runways Table */}
                                {airport.runways.length > 0 && (
                                  <div>
                                    <Label className="text-[10px] font-medium text-muted-foreground mb-1 block">Runways</Label>
                                    <div className="rounded-lg border border-border/50 overflow-hidden">
                                      <table className="w-full text-[10px]">
                                        <thead>
                                          <tr className="bg-muted/30">
                                            <th className="px-2 py-1 text-left font-medium">Name</th>
                                            <th className="px-2 py-1 text-right font-medium">Length</th>
                                            <th className="px-2 py-1 text-right font-medium">HDG</th>
                                            <th className="px-2 py-1 text-right font-medium">Surface</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {airport.runways.map((rw, i) => (
                                            <tr key={i} className="border-t border-border/30">
                                              <td className="px-2 py-1 font-mono">{rw.name}</td>
                                              <td className="px-2 py-1 text-right">{rw.length}m</td>
                                              <td className="px-2 py-1 text-right font-mono">{rw.heading}°</td>
                                              <td className="px-2 py-1 text-right">{rw.surface}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Frequencies List */}
                                {airport.frequencies.length > 0 && (
                                  <div>
                                    <Label className="text-[10px] font-medium text-muted-foreground mb-1 block">Frequencies</Label>
                                    <div className="grid grid-cols-2 gap-1">
                                      {airport.frequencies.map((freq, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 text-[10px]">
                                          <Radio className="h-2.5 w-2.5 text-sky-500" />
                                          <span className="text-muted-foreground">{freq.type}</span>
                                          <span className="font-mono ml-auto">{freq.freq}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Overlays Tab */}
              <TabsContent value="overlays" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <Label className="text-xs font-medium mb-3 block">Map Overlays</Label>
                      <div className="space-y-3">
                        {[
                          { key: 'showAirspaces' as const, label: 'Airspaces', icon: Radar, desc: 'Airspace class zones' },
                          { key: 'showAirports' as const, label: 'Airports', icon: Plane, desc: 'Airport markers & info' },
                          { key: 'showFlightPaths' as const, label: 'Flight Paths', icon: Navigation, desc: 'Active flight routes' },
                          { key: 'showSIDs' as const, label: 'SIDs', icon: ArrowUpRight, desc: 'Standard Instrument Departures' },
                          { key: 'showSTARs' as const, label: 'STARs', icon: Compass, desc: 'Standard Terminal Arrivals' },
                        ].map((overlay) => (
                          <div key={overlay.key} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <overlay.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium">{overlay.label}</p>
                                <p className="text-[10px] text-muted-foreground">{overlay.desc}</p>
                              </div>
                            </div>
                            <Switch
                              checked={airspaceNav[overlay.key]}
                              onCheckedChange={(checked) => updateOverlay(overlay.key, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Quick altitude presets */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Altitude Presets</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Surface', range: [0, 3000] as [number, number] },
                          { label: 'Low Altitude', range: [0, 10000] as [number, number] },
                          { label: 'High Altitude', range: [10000, 60000] as [number, number] },
                          { label: 'All Altitudes', range: [0, 60000] as [number, number] },
                        ].map((preset) => (
                          <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7"
                            onClick={() => setAirspaceNav({ altitudeFilter: preset.range })}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Flight Plan Tab */}
              <TabsContent value="flightplan" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">Waypoint Editor</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] gap-1"
                        onClick={addFlightPlanWaypoint}
                      >
                        <Plus className="h-3 w-3" />
                        Add WP
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {flightPlanWaypoints.map((wp, index) => (
                        <Card key={index} className="overflow-hidden">
                          <div className="bg-gradient-to-r from-sky-500/5 to-blue-500/5 px-3 py-1.5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold">WP {index + 1}</span>
                            {flightPlanWaypoints.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-red-500"
                                onClick={() => removeFlightPlanWaypoint(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="p-2 grid grid-cols-2 gap-1.5">
                            <div>
                              <Label className="text-[9px] text-muted-foreground">Lat</Label>
                              <Input
                                value={wp.lat}
                                onChange={(e) => updateFlightPlanWaypoint(index, 'lat', e.target.value)}
                                placeholder="51.47"
                                className="h-6 text-[10px] font-mono"
                              />
                            </div>
                            <div>
                              <Label className="text-[9px] text-muted-foreground">Lng</Label>
                              <Input
                                value={wp.lng}
                                onChange={(e) => updateFlightPlanWaypoint(index, 'lng', e.target.value)}
                                placeholder="-0.46"
                                className="h-6 text-[10px] font-mono"
                              />
                            </div>
                            <div>
                              <Label className="text-[9px] text-muted-foreground">Alt (ft)</Label>
                              <Input
                                value={wp.alt}
                                onChange={(e) => updateFlightPlanWaypoint(index, 'alt', e.target.value)}
                                placeholder="5000"
                                className="h-6 text-[10px] font-mono"
                              />
                            </div>
                            <div>
                              <Label className="text-[9px] text-muted-foreground">Speed (kt)</Label>
                              <Input
                                value={wp.speed}
                                onChange={(e) => updateFlightPlanWaypoint(index, 'speed', e.target.value)}
                                placeholder="250"
                                className="h-6 text-[10px] font-mono"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button
                      className="w-full text-xs h-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                      onClick={saveFlightPlan}
                      disabled={flightPlanWaypoints.filter((wp) => wp.lat && wp.lng).length < 2}
                    >
                      <Navigation className="h-3.5 w-3.5 mr-1.5" />
                      Save Flight Plan
                    </Button>

                    {airspaceNav.flightPlan && (
                      <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                            <MapPin className="h-3 w-3" />
                            <span className="font-medium">
                              Flight plan saved: {airspaceNav.flightPlan.length} waypoints
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
