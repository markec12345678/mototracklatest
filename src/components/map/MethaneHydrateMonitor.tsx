'use client'

import { useMemo } from 'react'
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
import { useMapStore, type HydrateZone, type MethaneHydrateState } from '@/lib/map-store'
import { Droplets, X, Thermometer, AlertTriangle, Filter, MapPin } from 'lucide-react'

const SAMPLE_ZONES: HydrateZone[] = [
  {
    id: 'mh-1',
    name: 'Blake Ridge',
    latitude: 32.0,
    longitude: -75.0,
    stabilityZone: 'stable',
    depth: 3200,
    temperature: 2.8,
    pressure: 32.5,
    methaneConcentration: 8.4,
    seafloorType: 'Continental rise sediment',
  },
  {
    id: 'mh-2',
    name: 'Nankai Trough',
    latitude: 33.0,
    longitude: 136.0,
    stabilityZone: 'marginal',
    depth: 2100,
    temperature: 4.1,
    pressure: 21.0,
    methaneConcentration: 15.2,
    seafloorType: 'Accretionary prism',
  },
  {
    id: 'mh-3',
    name: 'Gulf of Mexico',
    latitude: 27.5,
    longitude: -90.0,
    stabilityZone: 'unstable',
    depth: 1500,
    temperature: 6.3,
    pressure: 15.2,
    methaneConcentration: 22.7,
    seafloorType: 'Salt basin sediment',
  },
  {
    id: 'mh-4',
    name: 'Svalbard Margin',
    latitude: 78.5,
    longitude: 14.0,
    stabilityZone: 'dissociating',
    depth: 800,
    temperature: 8.5,
    pressure: 8.3,
    methaneConcentration: 35.1,
    seafloorType: 'Glaciomarine sediment',
  },
  {
    id: 'mh-5',
    name: 'Cascadia Margin',
    latitude: 46.0,
    longitude: -125.0,
    stabilityZone: 'marginal',
    depth: 1800,
    temperature: 4.7,
    pressure: 18.3,
    methaneConcentration: 18.6,
    seafloorType: 'Subduction zone sediment',
  },
  {
    id: 'mh-6',
    name: 'Hikurangi Margin',
    latitude: -39.5,
    longitude: 178.0,
    stabilityZone: 'unstable',
    depth: 1200,
    temperature: 7.2,
    pressure: 12.1,
    methaneConcentration: 28.3,
    seafloorType: 'Accretionary wedge',
  },
]

const STABILITY_CONFIG: Record<
  HydrateZone['stabilityZone'],
  { bg: string; text: string; border: string; dot: string }
> = {
  stable: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
  marginal: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  unstable: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  dissociating: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
}

export default function MethaneHydrateMonitor() {
  const methaneHydrate = useMapStore((s) => s.methaneHydrate)
  const setMethaneHydrate = useMapStore((s) => s.setMethaneHydrate)

  const zones = useMemo(() => {
    const source =
      methaneHydrate.hydrateZones.length > 0 ? methaneHydrate.hydrateZones : SAMPLE_ZONES
    return source
  }, [methaneHydrate.hydrateZones])

  const filteredZones = useMemo(() => {
    let result = zones
    if (methaneHydrate.stabilityFilter !== 'all') {
      result = result.filter((z) => z.stabilityZone === methaneHydrate.stabilityFilter)
    }
    return result
  }, [zones, methaneHydrate.stabilityFilter])

  const selectedZone = useMemo(() => {
    if (!methaneHydrate.activeZoneId) return null
    return zones.find((z) => z.id === methaneHydrate.activeZoneId) ?? null
  }, [zones, methaneHydrate.activeZoneId])

  const summary = useMemo(() => {
    const unstableCount = zones.filter(
      (z) => z.stabilityZone === 'unstable' || z.stabilityZone === 'dissociating'
    ).length
    const avgDepth =
      zones.length > 0 ? zones.reduce((sum, z) => sum + z.depth, 0) / zones.length : 0
    const maxConcentration = zones.length > 0 ? Math.max(...zones.map((z) => z.methaneConcentration)) : 0
    return { unstableCount, avgDepth, maxConcentration }
  }, [zones])

  if (!methaneHydrate.open) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-500" />
              <CardTitle className="text-lg">Methane Hydrate Monitor</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMethaneHydrate({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Unstable</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.unstableCount}
              </p>
            </div>
            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Avg Depth</p>
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round(summary.avgDepth)}m
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Max CH₄</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {summary.maxConcentration.toFixed(1)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Display Options
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="mhm-show-stability"
                  checked={methaneHydrate.showStability}
                  onCheckedChange={(v) => setMethaneHydrate({ showStability: v })}
                />
                <Label htmlFor="mhm-show-stability" className="text-xs cursor-pointer">
                  Stability
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mhm-show-depth"
                  checked={methaneHydrate.showDepth}
                  onCheckedChange={(v) => setMethaneHydrate({ showDepth: v })}
                />
                <Label htmlFor="mhm-show-depth" className="text-xs cursor-pointer">
                  Depth
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mhm-show-temp"
                  checked={methaneHydrate.showTemperature}
                  onCheckedChange={(v) => setMethaneHydrate({ showTemperature: v })}
                />
                <Label htmlFor="mhm-show-temp" className="text-xs cursor-pointer">
                  Temperature
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mhm-show-conc"
                  checked={methaneHydrate.showConcentration}
                  onCheckedChange={(v) => setMethaneHydrate({ showConcentration: v })}
                />
                <Label htmlFor="mhm-show-conc" className="text-xs cursor-pointer">
                  CH₄ Conc.
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stability Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Stability
              </p>
            </div>
            <Select
              value={methaneHydrate.stabilityFilter}
              onValueChange={(v) =>
                setMethaneHydrate({
                  stabilityFilter: v as MethaneHydrateState['stabilityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All stabilities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stabilities</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="marginal">Marginal</SelectItem>
                <SelectItem value="unstable">Unstable</SelectItem>
                <SelectItem value="dissociating">Dissociating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Hydrate Zones ({filteredZones.length})
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredZones.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No zones match the current filter.
                </p>
              )}
              {filteredZones.map((zone) => {
                const sc = STABILITY_CONFIG[zone.stabilityZone]
                const isSelected = methaneHydrate.activeZoneId === zone.id
                return (
                  <button
                    key={zone.id}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() =>
                      setMethaneHydrate({
                        activeZoneId: isSelected ? null : zone.id,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${sc.dot}`} />
                        <span className="text-sm font-medium truncate">{zone.name}</span>
                      </div>
                      {methaneHydrate.showStability && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          {zone.stabilityZone}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {methaneHydrate.showDepth && (
                        <span className="flex items-center gap-0.5">
                          <Droplets className="h-3 w-3" />
                          {zone.depth}m
                        </span>
                      )}
                      {methaneHydrate.showTemperature && (
                        <span className="flex items-center gap-0.5">
                          <Thermometer className="h-3 w-3" />
                          {zone.temperature.toFixed(1)}°C
                        </span>
                      )}
                      <span>{zone.pressure.toFixed(1)} MPa</span>
                      {methaneHydrate.showConcentration && (
                        <span className="flex items-center gap-0.5">
                          CH₄ {zone.methaneConcentration.toFixed(1)}
                        </span>
                      )}
                      <span className="truncate">{zone.seafloorType}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Zone Details */}
          {selectedZone && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{selectedZone.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Stability
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${STABILITY_CONFIG[selectedZone.stabilityZone].bg} ${STABILITY_CONFIG[selectedZone.stabilityZone].text} ${STABILITY_CONFIG[selectedZone.stabilityZone].border}`}
                    >
                      {selectedZone.stabilityZone === 'dissociating' && (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {selectedZone.stabilityZone}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Depth
                    </p>
                    <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      {selectedZone.depth}m
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Temperature
                    </p>
                    <p className="text-sm font-medium">
                      {selectedZone.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Pressure
                    </p>
                    <p className="text-sm font-medium">
                      {selectedZone.pressure.toFixed(1)} MPa
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Methane Conc.
                    </p>
                    <p className="text-sm font-medium">
                      {selectedZone.methaneConcentration.toFixed(1)} mM
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Seafloor Type
                    </p>
                    <p className="text-sm font-medium">{selectedZone.seafloorType}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedZone.latitude.toFixed(2)}°,{' '}
                    {selectedZone.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
