'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore, type StratosphericWindZone, type StratosphericWindState } from '@/lib/map-store'
import { Wind, X, Compass, Thermometer, Filter, MapPin } from 'lucide-react'

const SAMPLE_ZONES: StratosphericWindZone[] = [
  {
    id: 'sw-1',
    name: 'Equatorial QBO East',
    latitude: 0.0,
    longitude: 25.0,
    windSpeed: 28.5,
    windDirection: 90,
    altitude: 30,
    qboPhase: 'easterly',
    polarVortexStatus: 'normal',
    temperature: -72.4,
  },
  {
    id: 'sw-2',
    name: 'Equatorial QBO West',
    latitude: 0.0,
    longitude: 160.0,
    windSpeed: 22.1,
    windDirection: 270,
    altitude: 28,
    qboPhase: 'westerly',
    polarVortexStatus: 'normal',
    temperature: -68.9,
  },
  {
    id: 'sw-3',
    name: 'Arctic Polar Vortex',
    latitude: 78.0,
    longitude: 15.0,
    windSpeed: 65.3,
    windDirection: 320,
    altitude: 22,
    qboPhase: 'transition',
    polarVortexStatus: 'strong',
    temperature: -85.6,
  },
  {
    id: 'sw-4',
    name: 'Antarctic Vortex',
    latitude: -80.0,
    longitude: 0.0,
    windSpeed: 52.8,
    windDirection: 210,
    altitude: 20,
    qboPhase: 'easterly',
    polarVortexStatus: 'disrupted',
    temperature: -78.3,
  },
  {
    id: 'sw-5',
    name: 'Mid-Latitude Jet',
    latitude: 45.0,
    longitude: -30.0,
    windSpeed: 41.7,
    windDirection: 255,
    altitude: 12,
    qboPhase: 'westerly',
    polarVortexStatus: 'weak',
    temperature: -56.2,
  },
  {
    id: 'sw-6',
    name: 'Subtropical Ridge',
    latitude: 30.0,
    longitude: 90.0,
    windSpeed: 15.4,
    windDirection: 180,
    altitude: 18,
    qboPhase: 'transition',
    polarVortexStatus: 'normal',
    temperature: -61.8,
  },
  {
    id: 'sw-7',
    name: 'Equatorial QBO Transition',
    latitude: 2.0,
    longitude: -60.0,
    windSpeed: 8.9,
    windDirection: 135,
    altitude: 35,
    qboPhase: 'transition',
    polarVortexStatus: 'normal',
    temperature: -74.1,
  },
]

const QBO_STYLES: Record<StratosphericWindZone['qboPhase'], { color: string; bgColor: string; label: string }> = {
  easterly: { color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-500/10', label: 'Easterly' },
  westerly: { color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10', label: 'Westerly' },
  transition: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10', label: 'Transition' },
}

const VORTEX_STYLES: Record<StratosphericWindZone['polarVortexStatus'], { color: string; bgColor: string; label: string }> = {
  strong: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', label: 'Strong' },
  normal: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Normal' },
  weak: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10', label: 'Weak' },
  disrupted: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Disrupted' },
}

export function StratosphericWindMonitor() {
  const stratosphericWind = useMapStore((s) => s.stratosphericWind)
  const setStratosphericWind = useMapStore((s) => s.setStratosphericWind)

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  const zones = useMemo(() => {
    return stratosphericWind.windZones.length > 0 ? stratosphericWind.windZones : SAMPLE_ZONES
  }, [stratosphericWind.windZones])

  const filteredZones = useMemo(() => {
    let list = zones
    if (stratosphericWind.vortexFilter !== 'all') {
      list = list.filter((z) => z.polarVortexStatus === stratosphericWind.vortexFilter)
    }
    return list
  }, [zones, stratosphericWind.vortexFilter])

  const selectedZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) ?? null
  }, [zones, selectedZoneId])

  const summary = useMemo(() => {
    const maxWindSpeed =
      zones.length > 0 ? Math.max(...zones.map((z) => z.windSpeed)) : 0
    const disruptedCount = zones.filter((z) => z.polarVortexStatus === 'disrupted').length
    const avgAltitude =
      zones.length > 0
        ? Math.round((zones.reduce((sum, z) => sum + z.altitude, 0) / zones.length) * 10) / 10
        : 0
    return { maxWindSpeed, disruptedCount, avgAltitude }
  }, [zones])

  if (!stratosphericWind.open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25 }}
        className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]"
      >
        <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wind className="h-4 w-4 text-teal-500" />
                Stratospheric Wind Monitor
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredZones.length} zones
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setStratosphericWind({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Summary Card */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Wind</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">{summary.maxWindSpeed.toFixed(1)}</p>
                  <p className="text-[9px] text-muted-foreground">m/s</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Disrupted</p>
                  <p className="text-lg font-bold tabular-nums text-red-500 mt-0.5">{summary.disruptedCount}</p>
                  <p className="text-[9px] text-muted-foreground">vortex</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Alt</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">{summary.avgAltitude}</p>
                  <p className="text-[9px] text-muted-foreground">km</p>
                </div>
              </div>

              <Separator />

              {/* Toggles & Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Filter className="h-3 w-3" />
                  Display &amp; Filter
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showWindSpeed" className="text-xs cursor-pointer">Wind Speed</Label>
                    <Switch
                      id="showWindSpeed"
                      checked={stratosphericWind.showWindSpeed}
                      onCheckedChange={(v) => setStratosphericWind({ showWindSpeed: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showQBO" className="text-xs cursor-pointer">QBO Phase</Label>
                    <Switch
                      id="showQBO"
                      checked={stratosphericWind.showQBO}
                      onCheckedChange={(v) => setStratosphericWind({ showQBO: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPolarVortex" className="text-xs cursor-pointer">Polar Vortex</Label>
                    <Switch
                      id="showPolarVortex"
                      checked={stratosphericWind.showPolarVortex}
                      onCheckedChange={(v) => setStratosphericWind({ showPolarVortex: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTemperature" className="text-xs cursor-pointer">Temperature</Label>
                    <Switch
                      id="showTemperature"
                      checked={stratosphericWind.showTemperature}
                      onCheckedChange={(v) => setStratosphericWind({ showTemperature: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Vortex:</span>
                  <Select
                    value={stratosphericWind.vortexFilter}
                    onValueChange={(v) =>
                      setStratosphericWind({ vortexFilter: v as StratosphericWindState['vortexFilter'] })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="weak">Weak</SelectItem>
                      <SelectItem value="disrupted">Disrupted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Zone List */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Wind Zones
                </p>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredZones.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No zones match the current filter.
                    </p>
                  )}

                  {filteredZones.map((zone) => {
                    const qboStyle = QBO_STYLES[zone.qboPhase]
                    const vortexStyle = VORTEX_STYLES[zone.polarVortexStatus]
                    const isSelected = selectedZoneId === zone.id

                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
                          isSelected
                            ? 'border-teal-500/50 bg-teal-500/5'
                            : 'border-border/40 hover:border-border/80 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{zone.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                              {stratosphericWind.showWindSpeed && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Wind className="h-2.5 w-2.5" />
                                  {zone.windSpeed.toFixed(1)} m/s
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Compass className="h-2.5 w-2.5" />
                                {zone.windDirection}°
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {zone.altitude} km
                              </span>
                              {stratosphericWind.showQBO && (
                                <Badge
                                  className={`text-[9px] px-1.5 py-0 border-0 ${qboStyle.bgColor} ${qboStyle.color}`}
                                >
                                  {qboStyle.label}
                                </Badge>
                              )}
                              {stratosphericWind.showPolarVortex && (
                                <Badge
                                  className={`text-[9px] px-1.5 py-0 border-0 ${vortexStyle.bgColor} ${vortexStyle.color}`}
                                >
                                  {vortexStyle.label}
                                </Badge>
                              )}
                              {stratosphericWind.showTemperature && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Thermometer className="h-2.5 w-2.5" />
                                  {zone.temperature.toFixed(1)}°C
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Zone Details */}
              <AnimatePresence mode="wait">
                {selectedZone && (
                  <motion.div
                    key={selectedZone.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/50">
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-xs flex items-center gap-2">
                          <Wind className="h-3.5 w-3.5 text-teal-500" />
                          {selectedZone.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Wind Speed</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {selectedZone.windSpeed.toFixed(1)}{' '}
                              <span className="text-[9px] font-normal text-muted-foreground">m/s</span>
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Direction</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {selectedZone.windDirection}{' '}
                              <span className="text-[9px] font-normal text-muted-foreground">deg</span>
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Altitude</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {selectedZone.altitude}{' '}
                              <span className="text-[9px] font-normal text-muted-foreground">km</span>
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Temperature</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {selectedZone.temperature.toFixed(1)}{' '}
                              <span className="text-[9px] font-normal text-muted-foreground">°C</span>
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">QBO Phase</p>
                            <p className={`text-sm font-semibold ${QBO_STYLES[selectedZone.qboPhase].color}`}>
                              {QBO_STYLES[selectedZone.qboPhase].label}
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Polar Vortex</p>
                            <p className={`text-sm font-semibold ${VORTEX_STYLES[selectedZone.polarVortexStatus].color}`}>
                              {VORTEX_STYLES[selectedZone.polarVortexStatus].label}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Coordinates</p>
                          <p className="text-xs font-medium tabular-nums">
                            {selectedZone.latitude.toFixed(2)}°, {selectedZone.longitude.toFixed(2)}°
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data source */}
              <p className="text-[9px] text-muted-foreground/60 text-center pt-1">
                Sample data · Sources: ERA5 Reanalysis, MERRA-2, NOAA CPC
              </p>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
