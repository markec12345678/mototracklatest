'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type DeforestationState, type DeforestationZone } from '@/lib/map-store'
import {
  TreePine,
  X,
  Shield,
  Filter,
  MapPin,
  AlertTriangle,
} from 'lucide-react'

// Sample deforestation zones
const DEMO_ZONES: DeforestationZone[] = [
  {
    id: 'dz-amazon',
    name: 'Amazon Basin',
    latitude: -3.47,
    longitude: -62.22,
    treeCoverLoss: 4570000,
    remainingForest: 76.8,
    rate: 987000,
    driver: 'Cattle Ranching',
    protectedArea: true,
    restorationPotential: 82,
  },
  {
    id: 'dz-congo',
    name: 'Congo Rainforest',
    latitude: -0.23,
    longitude: 21.75,
    treeCoverLoss: 920000,
    remainingForest: 87.3,
    rate: 475000,
    driver: 'Small-scale Agriculture',
    protectedArea: true,
    restorationPotential: 71,
  },
  {
    id: 'dz-borneo',
    name: 'Borneo',
    latitude: 1.0,
    longitude: 114.0,
    treeCoverLoss: 3210000,
    remainingForest: 52.4,
    rate: 521000,
    driver: 'Palm Oil Plantations',
    protectedArea: false,
    restorationPotential: 64,
  },
  {
    id: 'dz-sumatra',
    name: 'Sumatra',
    latitude: -0.58,
    longitude: 101.44,
    treeCoverLoss: 2580000,
    remainingForest: 39.7,
    rate: 389000,
    driver: 'Palm Oil Plantations',
    protectedArea: false,
    restorationPotential: 58,
  },
  {
    id: 'dz-cerrado',
    name: 'Cerrado',
    latitude: -15.0,
    longitude: -47.0,
    treeCoverLoss: 2130000,
    remainingForest: 46.1,
    rate: 642000,
    driver: 'Soy Expansion',
    protectedArea: true,
    restorationPotential: 73,
  },
  {
    id: 'dz-myanmar',
    name: 'Myanmar',
    latitude: 21.91,
    longitude: 95.96,
    treeCoverLoss: 870000,
    remainingForest: 55.9,
    rate: 312000,
    driver: 'Logging',
    protectedArea: false,
    restorationPotential: 49,
  },
  {
    id: 'dz-madagascar',
    name: 'Madagascar',
    latitude: -18.77,
    longitude: 46.87,
    treeCoverLoss: 640000,
    remainingForest: 23.5,
    rate: 198000,
    driver: 'Slash & Burn',
    protectedArea: true,
    restorationPotential: 67,
  },
]

// Driver color coding
const DRIVER_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Cattle Ranching': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  'Small-scale Agriculture': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  'Palm Oil Plantations': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  'Soy Expansion': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' },
  'Logging': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  'Slash & Burn': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' },
}

const DEFAULT_DRIVER_STYLE = { bg: 'bg-muted/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return n.toString()
}

export function DeforestationTracker() {
  const deforestation = useMapStore((s) => s.deforestation)
  const setDeforestation = useMapStore((s) => s.setDeforestation)

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  // Use store zones or fallback to demo data
  const zones = deforestation.deforestationZones.length > 0
    ? deforestation.deforestationZones
    : DEMO_ZONES

  // Filter zones by driver
  const filteredZones = deforestation.driverFilter === 'all'
    ? zones
    : zones.filter((z) => z.driver === deforestation.driverFilter)

  // Extract unique drivers for filter dropdown
  const uniqueDrivers = useMemo(() => {
    const drivers = new Set(zones.map((z) => z.driver))
    return Array.from(drivers).sort()
  }, [zones])

  // Summary statistics
  const summary = useMemo(() => {
    const totalLoss = filteredZones.reduce((sum, z) => sum + z.treeCoverLoss, 0)
    const protectedCount = filteredZones.filter((z) => z.protectedArea).length
    const highestRateZone = filteredZones.length > 0
      ? filteredZones.reduce((max, z) => (z.rate > max.rate ? z : max), filteredZones[0])
      : null
    return { totalLoss, protectedCount, highestRateZone }
  }, [filteredZones])

  // Selected zone details
  const selectedZone = selectedZoneId
    ? filteredZones.find((z) => z.id === selectedZoneId) ?? null
    : null

  if (typeof window === 'undefined') return null
  if (!deforestation.open) return null

  const overlayToggles: { key: keyof DeforestationState; label: string; checked: boolean }[] = [
    { key: 'showLoss', label: 'Tree Cover Loss', checked: deforestation.showLoss },
    { key: 'showRemaining', label: 'Remaining Forest', checked: deforestation.showRemaining },
    { key: 'showRate', label: 'Deforestation Rate', checked: deforestation.showRate },
    { key: 'showDrivers', label: 'Drivers', checked: deforestation.showDrivers },
  ]

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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <TreePine className="h-4 w-4 text-green-600 dark:text-green-400" />
                Deforestation Tracker
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredZones.length} zones
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setDeforestation({ open: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="max-h-[calc(100vh-180px)]">
            <CardContent className="pt-0 space-y-4 pb-4">
              {/* Summary Bar */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-red-500/10 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Total Loss</div>
                  <div className="text-xs font-bold text-red-600 dark:text-red-400">
                    {formatNumber(summary.totalLoss)} ha
                  </div>
                </div>
                <div className="rounded-lg bg-green-500/10 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Protected</div>
                  <div className="text-xs font-bold text-green-600 dark:text-green-400">
                    {summary.protectedCount} zones
                  </div>
                </div>
                <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">Highest Rate</div>
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {summary.highestRateZone
                      ? formatNumber(summary.highestRateZone.rate)
                      : '—'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Overlay Toggles */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Map Overlays
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {overlayToggles.map((toggle) => (
                    <div key={toggle.key} className="flex items-center gap-2">
                      <Switch
                        checked={toggle.checked}
                        onCheckedChange={(v) =>
                          setDeforestation({ [toggle.key]: v } as Partial<DeforestationState>)
                        }
                      />
                      <span className="text-xs">{toggle.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Driver Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  <AlertTriangle className="h-3 w-3" /> Driver
                </Label>
                <Select
                  value={deforestation.driverFilter}
                  onValueChange={(v) =>
                    setDeforestation({ driverFilter: v as DeforestationState['driverFilter'] })
                  }
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    {uniqueDrivers.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Zone List */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Deforestation Zones</Label>
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {filteredZones.map((zone) => {
                    const driverStyle = DRIVER_COLORS[zone.driver] ?? DEFAULT_DRIVER_STYLE
                    const isSelected = selectedZoneId === zone.id

                    return (
                      <div
                        key={zone.id}
                        className={`rounded-lg border p-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border/50 hover:bg-accent/30'
                        }`}
                        onClick={() =>
                          setSelectedZoneId(isSelected ? null : zone.id)
                        }
                      >
                        {/* Zone header row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                            <span className="text-xs font-medium truncate max-w-[130px]">
                              {zone.name}
                            </span>
                            {zone.protectedArea && (
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 text-[9px] px-1.5 py-0 flex items-center gap-0.5">
                                <Shield className="h-2.5 w-2.5" />
                                Protected
                              </Badge>
                            )}
                          </div>
                          <Badge
                            className={`${driverStyle.bg} ${driverStyle.text} border-0 text-[9px] px-1.5 py-0`}
                          >
                            {zone.driver}
                          </Badge>
                        </div>

                        {/* Quick stats (always visible) */}
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-muted-foreground ml-5.5">
                          {deforestation.showLoss && (
                            <span>Loss: {formatNumber(zone.treeCoverLoss)} ha</span>
                          )}
                          {deforestation.showRemaining && (
                            <span>Remaining: {zone.remainingForest.toFixed(1)}%</span>
                          )}
                          {deforestation.showRate && (
                            <span>Rate: {formatNumber(zone.rate)} ha/yr</span>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]"
                          >
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tree Cover Loss</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {formatNumber(zone.treeCoverLoss)} ha
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Remaining Forest</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {zone.remainingForest.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Deforestation Rate</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">
                                {formatNumber(zone.rate)} ha/yr
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Driver</span>
                              <span className={`font-medium ${driverStyle.text}`}>
                                {zone.driver}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Protected</span>
                              <span className={`font-medium ${zone.protectedArea ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                {zone.protectedArea ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Restoration Potential</span>
                              <span className="font-medium">
                                {zone.restorationPotential}%
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-muted-foreground">Coordinates</span>
                              <span className="font-medium">
                                {zone.latitude.toFixed(2)}°, {zone.longitude.toFixed(2)}°
                              </span>
                            </div>

                            {/* Restoration potential bar */}
                            <div className="col-span-2 mt-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-muted-foreground text-[9px]">Restoration Potential</span>
                                <span className="text-[9px] font-medium">{zone.restorationPotential}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-green-500 transition-all"
                                  style={{ width: `${zone.restorationPotential}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>

              {/* Driver Legend */}
              {deforestation.showDrivers && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Driver Legend</Label>
                    <div className="flex flex-wrap gap-2">
                      {uniqueDrivers.map((d) => {
                        const style = DRIVER_COLORS[d] ?? DEFAULT_DRIVER_STYLE
                        return (
                          <div key={d} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                            <span className="text-[9px] text-muted-foreground">{d}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

// Toggle button for the map toolbar
export function DeforestationTrackerToggle() {
  const deforestation = useMapStore((s) => s.deforestation)
  const setDeforestation = useMapStore((s) => s.setDeforestation)

  return (
    <Button
      variant={deforestation.open ? 'default' : 'ghost'}
      size="icon"
      className="h-9 w-9"
      onClick={() => setDeforestation({ open: !deforestation.open })}
      title="Deforestation Tracker"
    >
      <TreePine className="h-4 w-4" />
    </Button>
  )
}
