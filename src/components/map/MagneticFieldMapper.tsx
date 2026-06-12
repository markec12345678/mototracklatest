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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type MagneticStation, type MagneticFieldState } from '@/lib/map-store'
import {
  Magnet,
  X,
  Compass,
  ArrowUpDown,
  Activity,
  Globe,
  Zap,
  ChevronRight,
  Grid3x3,
  Mountain,
  BarChart3,
  Eye,
} from 'lucide-react'

// Demo data
const DEMO_STATIONS: MagneticStation[] = [
  {
    id: 'mag-1',
    name: 'Hartland Observatory',
    latitude: 50.99,
    longitude: -4.48,
    declination: -0.72,
    inclination: 66.49,
    totalField: 48618,
    horizontalField: 19323,
    verticalField: 44598,
    annualChange: -0.14,
    lastMeasurement: '2025-01-15',
  },
  {
    id: 'mag-2',
    name: 'Eskdalemuir Observatory',
    latitude: 55.31,
    longitude: -3.20,
    declination: -1.21,
    inclination: 70.13,
    totalField: 49276,
    horizontalField: 16710,
    verticalField: 46347,
    annualChange: 0.12,
    lastMeasurement: '2025-01-20',
  },
  {
    id: 'mag-3',
    name: 'Lerwick Observatory',
    latitude: 60.13,
    longitude: -1.18,
    declination: -1.84,
    inclination: 73.34,
    totalField: 50123,
    horizontalField: 14329,
    verticalField: 48036,
    annualChange: 0.22,
    lastMeasurement: '2025-02-01',
  },
  {
    id: 'mag-4',
    name: 'Fredericksburg',
    latitude: 38.20,
    longitude: -77.37,
    declination: -10.32,
    inclination: 63.89,
    totalField: 52941,
    horizontalField: 23322,
    verticalField: 47486,
    annualChange: -0.07,
    lastMeasurement: '2025-01-18',
  },
  {
    id: 'mag-5',
    name: 'Boulder Observatory',
    latitude: 40.14,
    longitude: -105.24,
    declination: 7.85,
    inclination: 62.47,
    totalField: 51764,
    horizontalField: 23806,
    verticalField: 45972,
    annualChange: -0.10,
    lastMeasurement: '2025-01-25',
  },
  {
    id: 'mag-6',
    name: 'Kakioka Observatory',
    latitude: 36.23,
    longitude: 140.19,
    declination: -7.14,
    inclination: 51.08,
    totalField: 46078,
    horizontalField: 28964,
    verticalField: 35825,
    annualChange: -0.04,
    lastMeasurement: '2025-02-05',
  },
  {
    id: 'mag-7',
    name: 'Mbour Observatory',
    latitude: 14.39,
    longitude: -16.97,
    declination: -8.56,
    inclination: 27.52,
    totalField: 43012,
    horizontalField: 38152,
    verticalField: 19845,
    annualChange: -0.09,
    lastMeasurement: '2025-01-30',
  },
]

const FIELD_COMPONENT_CONFIG: Record<string, { label: string; unit: string; icon: typeof Compass; color: string }> = {
  declination: { label: 'Declination', unit: '°', icon: Compass, color: '#3b82f6' },
  inclination: { label: 'Inclination', unit: '°', icon: ArrowUpDown, color: '#8b5cf6' },
  total: { label: 'Total Field', unit: 'nT', icon: Activity, color: '#ef4444' },
  horizontal: { label: 'Horizontal', unit: 'nT', icon: Globe, color: '#22c55e' },
  vertical: { label: 'Vertical', unit: 'nT', icon: Zap, color: '#f97316' },
}

const ANOMALY_REGIONS = [
  { id: 'anom-1', name: 'Kursk Magnetic Anomaly', lat: 51.5, lng: 36.5, strength: 'Very Strong', intensity: 1900 },
  { id: 'anom-2', name: 'Carajas Anomaly', lat: -6.0, lng: -50.3, strength: 'Strong', intensity: 1200 },
  { id: 'anom-3', name: 'Kiruna Anomaly', lat: 67.8, lng: 20.2, strength: 'Moderate', intensity: 800 },
  { id: 'anom-4', name: 'Banded Iron Formation', lat: -23.5, lng: 131.0, strength: 'Moderate', intensity: 650 },
]

function getFieldIntensityColor(value: number): string {
  // Normalize typical total field range 20000-65000 nT
  const normalized = Math.max(0, Math.min(1, (value - 20000) / 45000))
  if (normalized < 0.2) return '#3b82f6'
  if (normalized < 0.4) return '#22c55e'
  if (normalized < 0.6) return '#eab308'
  if (normalized < 0.8) return '#f97316'
  return '#ef4444'
}

function getAnomalyStrengthStyle(strength: string): { bg: string; color: string } {
  switch (strength) {
    case 'Very Strong': return { bg: 'bg-red-500/10', color: 'text-red-600 dark:text-red-400' }
    case 'Strong': return { bg: 'bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400' }
    case 'Moderate': return { bg: 'bg-yellow-500/10', color: 'text-yellow-600 dark:text-yellow-400' }
    default: return { bg: 'bg-muted/30', color: 'text-muted-foreground' }
  }
}

export function MagneticFieldMapper() {
  const magneticField = useMapStore((s) => s.magneticField)
  const setMagneticField = useMapStore((s) => s.setMagneticField)

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  // Use demo data if store is empty
  const stations = magneticField.stations.length > 0 ? magneticField.stations : DEMO_STATIONS
  const isOpen = magneticField.open
  const fieldComponent = magneticField.fieldComponent

  const selectedStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || null
  }, [stations, selectedStationId])

  const fieldStats = useMemo(() => {
    const values = stations.map((s) => {
      switch (fieldComponent) {
        case 'declination': return s.declination
        case 'inclination': return s.inclination
        case 'total': return s.totalField
        case 'horizontal': return s.horizontalField
        case 'vertical': return s.verticalField
        default: return s.totalField
      }
    })
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }
  }, [stations, fieldComponent])

  const getStationValue = useCallback((station: MagneticStation) => {
    switch (fieldComponent) {
      case 'declination': return station.declination
      case 'inclination': return station.inclination
      case 'total': return station.totalField
      case 'horizontal': return station.horizontalField
      case 'vertical': return station.verticalField
      default: return station.totalField
    }
  }, [fieldComponent])

  const getStationUnit = useCallback(() => {
    return FIELD_COMPONENT_CONFIG[fieldComponent].unit
  }, [fieldComponent])

  const togglePanel = useCallback(() => {
    setMagneticField({ open: !isOpen })
  }, [isOpen, setMagneticField])

  if (typeof window === 'undefined') return null

  return (
    <>
      {/* Toggle button */}
      <motion.div
        className="fixed top-20 right-[8.5rem] z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={togglePanel}
          className={cn(
            'h-11 w-11 rounded-full shadow-lg transition-all duration-200',
            'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white'
          )}
          aria-label={isOpen ? 'Close magnetic field mapper' : 'Open magnetic field mapper'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Magnet className="h-5 w-5" />}
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
            className="fixed top-36 right-4 z-40 w-[400px] max-h-[75vh] flex flex-col bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Magnet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Magnetic Field Mapper</h3>
                  <p className="text-[10px] text-muted-foreground">Geomagnetic field visualization</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {stations.length} stations
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
            <Tabs defaultValue="stations" className="w-full flex-1 flex flex-col min-h-0">
              <div className="px-4 pt-2">
                <TabsList className="w-full h-8 text-xs">
                  <TabsTrigger value="stations" className="text-[11px] flex-1">Stations</TabsTrigger>
                  <TabsTrigger value="fieldmap" className="text-[11px] flex-1">Field Map</TabsTrigger>
                  <TabsTrigger value="anomalies" className="text-[11px] flex-1">Anomalies</TabsTrigger>
                  <TabsTrigger value="overlays" className="text-[11px] flex-1">Overlays</TabsTrigger>
                </TabsList>
              </div>

              {/* Stations Tab */}
              <TabsContent value="stations" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    {/* Field Component Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Field Component</Label>
                      <Select
                        value={fieldComponent}
                        onValueChange={(value) => setMagneticField({ fieldComponent: value as MagneticFieldState['fieldComponent'] })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FIELD_COMPONENT_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              <div className="flex items-center gap-2">
                                <config.icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                                {config.label} ({config.unit})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model Year Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Model Year</Label>
                        <span className="text-[10px] font-mono text-muted-foreground">{magneticField.modelYear}</span>
                      </div>
                      <Slider
                        value={[magneticField.modelYear]}
                        min={1900}
                        max={2025}
                        step={1}
                        onValueChange={(value) => setMagneticField({ modelYear: value[0] })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>1900</span>
                        <span>2025</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="bg-muted/30">
                        <CardContent className="p-2 text-center">
                          <p className="text-[9px] text-muted-foreground">Min</p>
                          <p className="text-xs font-mono font-medium">{fieldStats.min.toFixed(1)} {getStationUnit()}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-2 text-center">
                          <p className="text-[9px] text-muted-foreground">Avg</p>
                          <p className="text-xs font-mono font-medium">{fieldStats.avg.toFixed(1)} {getStationUnit()}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-2 text-center">
                          <p className="text-[9px] text-muted-foreground">Max</p>
                          <p className="text-xs font-mono font-medium">{fieldStats.max.toFixed(1)} {getStationUnit()}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    {/* Station List */}
                    <div className="space-y-2">
                      {stations.map((station) => {
                        const isSelected = selectedStationId === station.id
                        const value = getStationValue(station)
                        const intensityColor = fieldComponent === 'total' || fieldComponent === 'horizontal' || fieldComponent === 'vertical'
                          ? getFieldIntensityColor(value)
                          : value >= 0 ? '#22c55e' : '#ef4444'
                        return (
                          <Card
                            key={station.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-md',
                              isSelected ? 'ring-1 ring-primary' : ''
                            )}
                            onClick={() => setSelectedStationId(isSelected ? null : station.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div
                                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: intensityColor + '20' }}
                                >
                                  <Compass className="h-4 w-4" style={{ color: intensityColor }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-xs font-medium truncate">{station.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                                    <span className="font-mono">
                                      {station.latitude.toFixed(2)}°, {station.longitude.toFixed(2)}°
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px]">
                                    <span style={{ color: intensityColor }} className="font-mono font-medium">
                                      {value.toFixed(2)} {getStationUnit()}
                                    </span>
                                    <span className="text-muted-foreground">
                                      Δ {station.annualChange > 0 ? '+' : ''}{station.annualChange}'/yr
                                    </span>
                                  </div>

                                  {/* Expanded detail */}
                                  {isSelected && (
                                    <div className="mt-2 pt-2 border-t border-border/50">
                                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Declination</span>
                                          <span className="font-mono">{station.declination}°</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Inclination</span>
                                          <span className="font-mono">{station.inclination}°</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Total F</span>
                                          <span className="font-mono">{station.totalField} nT</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">H-Field</span>
                                          <span className="font-mono">{station.horizontalField} nT</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">V-Field</span>
                                          <span className="font-mono">{station.verticalField} nT</span>
                                        </div>
                                        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/30">
                                          <span className="text-muted-foreground">Annual Δ</span>
                                          <span className="font-mono">{station.annualChange}'/yr</span>
                                        </div>
                                      </div>
                                      <p className="text-[9px] text-muted-foreground mt-1.5">
                                        Last measurement: {station.lastMeasurement}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className={cn(
                                  'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
                                  isSelected && 'rotate-90'
                                )} />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Field Map Tab */}
              <TabsContent value="fieldmap" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-4">
                    {/* Isogonic Lines Visualization (simplified grid) */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Declination Isogonic Lines</Label>
                      <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/10">
                        <div className="p-3">
                          <div className="grid grid-cols-7 gap-0.5">
                            {Array.from({ length: 49 }).map((_, i) => {
                              const row = Math.floor(i / 7)
                              const col = i % 7
                              // Simplified declination model
                              const dec = -20 + col * 5 + row * 1.5 + Math.sin(col * 0.8) * 3
                              const color = getFieldIntensityColor(Math.abs(dec) * 1000 + 30000)
                              return (
                                <div
                                  key={i}
                                  className="h-8 rounded-sm flex items-center justify-center text-[8px] font-mono text-white/80"
                                  style={{ backgroundColor: color }}
                                >
                                  {dec.toFixed(0)}°
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
                            <span>West (-)</span>
                            <span>→ Longitude →</span>
                            <span>East (+)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Intensity Color Bar Legend */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Field Intensity Color Bar</Label>
                      <div className="space-y-1">
                        <div className="h-4 rounded-full overflow-hidden" style={{
                          background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'
                        }} />
                        <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                          <span>20,000 nT</span>
                          <span>32,500 nT</span>
                          <span>45,000 nT</span>
                          <span>57,500 nT</span>
                          <span>65,000 nT</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Station Readings Chart */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">
                        Station {FIELD_COMPONENT_CONFIG[fieldComponent].label} Readings
                      </Label>
                      <div className="space-y-1.5">
                        {stations.map((station) => {
                          const value = getStationValue(station)
                          const config = FIELD_COMPONENT_CONFIG[fieldComponent]
                          const minVal = fieldStats.min
                          const maxVal = fieldStats.max
                          const range = maxVal - minVal || 1
                          const percent = Math.max(0, Math.min(100, ((value - minVal) / range) * 100))
                          const barColor = config.color
                          return (
                            <div key={station.id} className="space-y-0.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="truncate max-w-[180px]">{station.name}</span>
                                <span className="font-mono" style={{ color: barColor }}>
                                  {value.toFixed(1)} {config.unit}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: barColor }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Anomalies Tab */}
              <TabsContent value="anomalies" className="flex-1 min-h-0 px-0 m-0">
                <ScrollArea className="h-[calc(75vh-160px)]">
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <Label className="text-xs font-medium">Magnetic Anomalies</Label>
                    </div>

                    <div className="space-y-2">
                      {ANOMALY_REGIONS.map((anomaly) => {
                        const strengthStyle = getAnomalyStrengthStyle(anomaly.strength)
                        return (
                          <Card key={anomaly.id} className="overflow-hidden">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', strengthStyle.bg)}>
                                  <Zap className={cn('h-4 w-4', strengthStyle.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-medium truncate">{anomaly.name}</span>
                                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4', strengthStyle.bg, strengthStyle.color)} variant="outline">
                                      {anomaly.strength}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    <span className="font-mono">
                                      {anomaly.lat.toFixed(1)}°, {anomaly.lng.toFixed(1)}°
                                    </span>
                                    <span>Intensity: <span className="font-mono font-medium text-foreground">{anomaly.intensity} nT</span></span>
                                  </div>
                                  <div className="mt-1.5">
                                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                                        style={{ width: `${Math.min((anomaly.intensity / 2000) * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    <Separator />

                    <div className="rounded-lg border border-border/50 p-3 bg-muted/10">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Magnetic anomalies are local variations in the Earth&apos;s magnetic field caused by 
                        concentrations of ferromagnetic minerals in the upper crust. They are important for 
                        mineral exploration and geological mapping.
                      </p>
                    </div>
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
                          { key: 'showStations' as const, label: 'Observatory Stations', icon: Activity, desc: 'Magnetic observatory markers' },
                          { key: 'showDeclinationLines' as const, label: 'Declination Lines', icon: Compass, desc: 'Isogonic lines on map' },
                          { key: 'showInclinationMap' as const, label: 'Inclination Map', icon: ArrowUpDown, desc: 'Isoclinic lines & regions' },
                          { key: 'showFieldIntensity' as const, label: 'Field Intensity', icon: BarChart3, desc: 'Total field strength map' },
                          { key: 'showAnomalies' as const, label: 'Anomalies', icon: Zap, desc: 'Anomaly regions overlay' },
                          { key: 'showGridLines' as const, label: 'Grid Lines', icon: Grid3x3, desc: 'Reference coordinate grid' },
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
                              checked={magneticField[overlay.key]}
                              onCheckedChange={(checked) => setMagneticField({ [overlay.key]: checked })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Quick Reference */}
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Quick Reference</Label>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/30">
                          <Compass className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Declination</span>
                            <span className="text-muted-foreground"> — angle between magnetic north and true north</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/30">
                          <ArrowUpDown className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Inclination</span>
                            <span className="text-muted-foreground"> — angle of the field below horizontal</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/30">
                          <Activity className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium">Total Field</span>
                            <span className="text-muted-foreground"> — magnitude of the full field vector</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
