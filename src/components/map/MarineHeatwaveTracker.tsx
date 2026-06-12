'use client'

import { useMemo, useState } from 'react'
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
import { useMapStore, type MarineHeatwaveZone, type MarineHeatwaveState } from '@/lib/map-store'
import { Thermometer, X, Waves, AlertTriangle, Filter, MapPin } from 'lucide-react'

const SAMPLE_ZONES: MarineHeatwaveZone[] = [
  {
    id: 'mh-1',
    name: 'Mediterranean Heatwave',
    latitude: 35.5,
    longitude: 18.5,
    sstAnomaly: 4.2,
    intensity: 'extreme',
    duration: 87,
    area: 285000,
    ecosystemImpact: 'severe',
    coralBleachingRisk: true,
  },
  {
    id: 'mh-2',
    name: 'Northeast Pacific Blob',
    latitude: 45.0,
    longitude: -135.0,
    sstAnomaly: 3.1,
    intensity: 'severe',
    duration: 142,
    area: 1200000,
    ecosystemImpact: 'high',
    coralBleachingRisk: false,
  },
  {
    id: 'mh-3',
    name: 'Coral Sea Heat',
    latitude: -17.5,
    longitude: 150.0,
    sstAnomaly: 2.5,
    intensity: 'strong',
    duration: 56,
    area: 410000,
    ecosystemImpact: 'high',
    coralBleachingRisk: true,
  },
  {
    id: 'mh-4',
    name: 'Tasman Sea',
    latitude: -40.0,
    longitude: 165.0,
    sstAnomaly: 2.8,
    intensity: 'strong',
    duration: 64,
    area: 320000,
    ecosystemImpact: 'moderate',
    coralBleachingRisk: false,
  },
  {
    id: 'mh-5',
    name: 'Bay of Bengal',
    latitude: 14.0,
    longitude: 88.0,
    sstAnomaly: 1.6,
    intensity: 'moderate',
    duration: 38,
    area: 540000,
    ecosystemImpact: 'moderate',
    coralBleachingRisk: true,
  },
  {
    id: 'mh-6',
    name: 'Gulf of Maine',
    latitude: 43.5,
    longitude: -68.5,
    sstAnomaly: 2.0,
    intensity: 'moderate',
    duration: 45,
    area: 93000,
    ecosystemImpact: 'low',
    coralBleachingRisk: false,
  },
  {
    id: 'mh-7',
    name: 'Western Australian Coast',
    latitude: -28.0,
    longitude: 114.0,
    sstAnomaly: 3.6,
    intensity: 'severe',
    duration: 73,
    area: 175000,
    ecosystemImpact: 'severe',
    coralBleachingRisk: true,
  },
]

const INTENSITY_CONFIG: Record<
  MarineHeatwaveZone['intensity'],
  { bg: string; text: string; border: string; dot: string }
> = {
  moderate: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    dot: 'bg-yellow-500',
  },
  strong: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  severe: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
  extreme: {
    bg: 'bg-red-200 dark:bg-red-950/50',
    text: 'text-red-900 dark:text-red-200',
    border: 'border-red-500 dark:border-red-800',
    dot: 'bg-red-800',
  },
}

const ECOSYSTEM_CONFIG: Record<
  MarineHeatwaveZone['ecosystemImpact'],
  { bg: string; text: string }
> = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  moderate: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-300',
  },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
  severe: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
}

function formatArea(km2: number): string {
  if (km2 >= 1000000) return `${(km2 / 1000000).toFixed(1)}M`
  if (km2 >= 1000) return `${(km2 / 1000).toFixed(0)}K`
  return km2.toString()
}

export default function MarineHeatwaveTracker() {
  const marineHeatwave = useMapStore((s) => s.marineHeatwave)
  const setMarineHeatwave = useMapStore((s) => s.setMarineHeatwave)

  const zones = useMemo(() => {
    const source = marineHeatwave.heatwaveZones.length > 0 ? marineHeatwave.heatwaveZones : SAMPLE_ZONES
    return source
  }, [marineHeatwave.heatwaveZones])

  const filteredZones = useMemo(() => {
    let result = zones
    if (marineHeatwave.intensityFilter !== 'all') {
      result = result.filter((z) => z.intensity === marineHeatwave.intensityFilter)
    }
    return result
  }, [zones, marineHeatwave.intensityFilter])

  const selectedZone = useMemo(() => {
    if (!marineHeatwave.activeZoneId) return null
    return zones.find((z) => z.id === marineHeatwave.activeZoneId) ?? null
  }, [zones, marineHeatwave.activeZoneId])

  const summary = useMemo(() => {
    const maxAnomaly = zones.length > 0 ? Math.max(...zones.map((z) => z.sstAnomaly)) : 0
    const extremeCount = zones.filter((z) => z.intensity === 'extreme').length
    const bleachingRiskCount = zones.filter((z) => z.coralBleachingRisk).length
    return { maxAnomaly, extremeCount, bleachingRiskCount }
  }, [zones])

  if (!marineHeatwave.open) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg">Marine Heatwave Tracker</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMarineHeatwave({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Max Anomaly</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.maxAnomaly.toFixed(1)}°C
              </p>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Extreme</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {summary.extremeCount}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Bleaching Risk</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {summary.bleachingRiskCount}
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
                  id="show-sst"
                  checked={marineHeatwave.showSSTAnomaly}
                  onCheckedChange={(v) => setMarineHeatwave({ showSSTAnomaly: v })}
                />
                <Label htmlFor="show-sst" className="text-xs cursor-pointer">
                  SST Anomaly
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-intensity"
                  checked={marineHeatwave.showIntensity}
                  onCheckedChange={(v) => setMarineHeatwave({ showIntensity: v })}
                />
                <Label htmlFor="show-intensity" className="text-xs cursor-pointer">
                  Intensity
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-ecosystem"
                  checked={marineHeatwave.showEcosystem}
                  onCheckedChange={(v) => setMarineHeatwave({ showEcosystem: v })}
                />
                <Label htmlFor="show-ecosystem" className="text-xs cursor-pointer">
                  Ecosystem Impact
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-bleaching"
                  checked={marineHeatwave.showBleaching}
                  onCheckedChange={(v) => setMarineHeatwave({ showBleaching: v })}
                />
                <Label htmlFor="show-bleaching" className="text-xs cursor-pointer">
                  Bleaching Risk
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Intensity Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Intensity
              </p>
            </div>
            <Select
              value={marineHeatwave.intensityFilter}
              onValueChange={(v) =>
                setMarineHeatwave({
                  intensityFilter: v as MarineHeatwaveState['intensityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All intensities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active Zones ({filteredZones.length})
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredZones.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No zones match the current filter.
                </p>
              )}
              {filteredZones.map((zone) => {
                const ic = INTENSITY_CONFIG[zone.intensity]
                const isSelected = marineHeatwave.activeZoneId === zone.id
                return (
                  <button
                    key={zone.id}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() =>
                      setMarineHeatwave({
                        activeZoneId: isSelected ? null : zone.id,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${ic.dot}`} />
                        <span className="text-sm font-medium truncate">{zone.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${ic.bg} ${ic.text} ${ic.border}`}
                      >
                        {zone.intensity}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {marineHeatwave.showSSTAnomaly && (
                        <span className="flex items-center gap-0.5">
                          <Thermometer className="h-3 w-3" />
                          {zone.sstAnomaly.toFixed(1)}°C
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Waves className="h-3 w-3" />
                        {zone.duration}d
                      </span>
                      <span>{formatArea(zone.area)} km²</span>
                      {marineHeatwave.showEcosystem && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1 py-0 ${ECOSYSTEM_CONFIG[zone.ecosystemImpact].bg} ${ECOSYSTEM_CONFIG[zone.ecosystemImpact].text}`}
                        >
                          {zone.ecosystemImpact}
                        </Badge>
                      )}
                      {marineHeatwave.showBleaching && zone.coralBleachingRisk && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                        >
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          Bleaching
                        </Badge>
                      )}
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
                      SST Anomaly
                    </p>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      +{selectedZone.sstAnomaly.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Intensity
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${INTENSITY_CONFIG[selectedZone.intensity].bg} ${INTENSITY_CONFIG[selectedZone.intensity].text} ${INTENSITY_CONFIG[selectedZone.intensity].border}`}
                    >
                      {selectedZone.intensity}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-sm font-medium">{selectedZone.duration} days</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Area
                    </p>
                    <p className="text-sm font-medium">{selectedZone.area.toLocaleString()} km²</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Ecosystem Impact
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${ECOSYSTEM_CONFIG[selectedZone.ecosystemImpact].bg} ${ECOSYSTEM_CONFIG[selectedZone.ecosystemImpact].text}`}
                    >
                      {selectedZone.ecosystemImpact}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Coral Bleaching Risk
                    </p>
                    {selectedZone.coralBleachingRisk ? (
                      <Badge
                        variant="outline"
                        className="text-xs mt-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        At Risk
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700"
                      >
                        Low Risk
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedZone.latitude.toFixed(2)}°, {selectedZone.longitude.toFixed(2)}°
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
