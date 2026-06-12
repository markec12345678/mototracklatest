'use client'

import { useMemo } from 'react'
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
import { useMapStore, type PrecipitationState, type PrecipZone } from '@/lib/map-store'
import {
  CloudRain,
  X,
  Droplets,
  TrendingUp,
  Filter,
  MapPin,
} from 'lucide-react'

const DEMO_ZONES: PrecipZone[] = [
  {
    id: 'pz-1',
    name: 'Cherrapunji, India',
    latitude: 25.27,
    longitude: 91.73,
    annualPrecip: 11777,
    monthlyAverage: 981,
    extremeEvents: 14,
    droughtIndex: 0.2,
    floodRisk: 'very_high',
    trend: 'increasing',
  },
  {
    id: 'pz-2',
    name: 'Amazon Basin',
    latitude: -3.47,
    longitude: -62.22,
    annualPrecip: 2300,
    monthlyAverage: 192,
    extremeEvents: 6,
    droughtIndex: 0.8,
    floodRisk: 'high',
    trend: 'decreasing',
  },
  {
    id: 'pz-3',
    name: 'Sahara Desert',
    latitude: 23.42,
    longitude: 25.66,
    annualPrecip: 25,
    monthlyAverage: 2,
    extremeEvents: 1,
    droughtIndex: 9.6,
    floodRisk: 'low',
    trend: 'stable',
  },
  {
    id: 'pz-4',
    name: 'British Isles',
    latitude: 54.38,
    longitude: -3.44,
    annualPrecip: 1220,
    monthlyAverage: 102,
    extremeEvents: 4,
    droughtIndex: 2.1,
    floodRisk: 'moderate',
    trend: 'increasing',
  },
  {
    id: 'pz-5',
    name: 'Mawsynram, India',
    latitude: 25.3,
    longitude: 91.57,
    annualPrecip: 11872,
    monthlyAverage: 989,
    extremeEvents: 16,
    droughtIndex: 0.1,
    floodRisk: 'very_high',
    trend: 'increasing',
  },
  {
    id: 'pz-6',
    name: 'Atacama Desert',
    latitude: -24.1,
    longitude: -69.6,
    annualPrecip: 15,
    monthlyAverage: 1,
    extremeEvents: 0,
    droughtIndex: 9.9,
    floodRisk: 'low',
    trend: 'stable',
  },
  {
    id: 'pz-7',
    name: 'Monsoon Coast, Myanmar',
    latitude: 16.87,
    longitude: 96.2,
    annualPrecip: 5100,
    monthlyAverage: 425,
    extremeEvents: 9,
    droughtIndex: 1.4,
    floodRisk: 'high',
    trend: 'stable',
  },
]

const FLOOD_RISK_COLORS: Record<PrecipZone['floodRisk'], string> = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  very_high: '#ef4444',
}

const FLOOD_RISK_LABELS: Record<PrecipZone['floodRisk'], string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
}

const TREND_COLORS: Record<PrecipZone['trend'], string> = {
  increasing: '#3b82f6',
  stable: '#a3a3a3',
  decreasing: '#ef4444',
}

const TREND_LABELS: Record<PrecipZone['trend'], string> = {
  increasing: 'Increasing',
  stable: 'Stable',
  decreasing: 'Decreasing',
}

export function PrecipitationAnalyzer() {
  const precipitation = useMapStore((s) => s.precipitation)
  const setPrecipitation = useMapStore((s) => s.setPrecipitation)

  const zones = useMemo(
    () =>
      precipitation.precipZones.length > 0
        ? precipitation.precipZones
        : DEMO_ZONES,
    [precipitation.precipZones]
  )

  const filteredZones = useMemo(() => {
    let result = zones
    if (precipitation.floodFilter !== 'all') {
      result = result.filter((z) => z.floodRisk === precipitation.floodFilter)
    }
    return result
  }, [zones, precipitation.floodFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { highestPrecip: 0, highFloodRiskCount: 0, avgDroughtIndex: 0 }
    }
    const highestPrecip = Math.max(...filteredZones.map((z) => z.annualPrecip))
    const highFloodRiskCount = filteredZones.filter(
      (z) => z.floodRisk === 'high' || z.floodRisk === 'very_high'
    ).length
    const avgDroughtIndex =
      filteredZones.reduce((sum, z) => sum + z.droughtIndex, 0) /
      filteredZones.length
    return { highestPrecip, highFloodRiskCount, avgDroughtIndex }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === precipitation.activeZoneId) ?? null,
    [zones, precipitation.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!precipitation.open) return null

  const toggleItems: { key: keyof PrecipitationState; label: string }[] = [
    { key: 'showAnnual', label: 'Annual Precip' },
    { key: 'showExtremes', label: 'Extreme Events' },
    { key: 'showDrought', label: 'Drought Index' },
    { key: 'showFloodRisk', label: 'Flood Risk' },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-sky-500" />
              Precipitation Analyzer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPrecipitation({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {toggleItems.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs">{label}</span>
                  <Switch
                    checked={precipitation[key] as boolean}
                    onCheckedChange={(checked) =>
                      setPrecipitation({ [key]: checked })
                    }
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Flood Risk Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Flood Risk Filter
            </Label>
            <Select
              value={precipitation.floodFilter}
              onValueChange={(v) =>
                setPrecipitation({
                  floodFilter: v as PrecipitationState['floodFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Highest Precip</div>
              <div className="text-sm font-semibold text-sky-500">
                {summary.highestPrecip.toLocaleString()}mm
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">High Flood Risk</div>
              <div className="text-sm font-semibold text-orange-500">
                {summary.highFloodRiskCount}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Avg Drought Idx</div>
              <div className="text-sm font-semibold text-amber-500">
                {summary.avgDroughtIndex.toFixed(1)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Precipitation Zones
            </Label>
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2 pr-1">
                {filteredZones.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No zones match the current filter.
                  </div>
                )}
                {filteredZones.map((zone) => {
                  const isActive = precipitation.activeZoneId === zone.id
                  const floodColor = FLOOD_RISK_COLORS[zone.floodRisk]
                  const trendColor = TREND_COLORS[zone.trend]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setPrecipitation({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium truncate mr-2">
                          {zone.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5"
                            style={{
                              borderColor: floodColor,
                              color: floodColor,
                            }}
                          >
                            {FLOOD_RISK_LABELS[zone.floodRisk]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5"
                            style={{
                              borderColor: trendColor,
                              color: trendColor,
                            }}
                          >
                            <TrendingUp
                              className="h-2.5 w-2.5 mr-0.5"
                              style={{
                                transform:
                                  zone.trend === 'decreasing'
                                    ? 'rotate(180deg)'
                                    : zone.trend === 'stable'
                                    ? 'rotate(90deg)'
                                    : 'none',
                              }}
                            />
                            {TREND_LABELS[zone.trend]}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                        {precipitation.showAnnual && (
                          <div>
                            Annual:{' '}
                            <span className="text-foreground">
                              {zone.annualPrecip.toLocaleString()}mm
                            </span>
                          </div>
                        )}
                        {precipitation.showAnnual && (
                          <div>
                            Monthly:{' '}
                            <span className="text-foreground">
                              {zone.monthlyAverage}mm
                            </span>
                          </div>
                        )}
                        {precipitation.showExtremes && (
                          <div>
                            Extremes:{' '}
                            <span className="text-foreground">
                              {zone.extremeEvents}
                            </span>
                          </div>
                        )}
                        {precipitation.showDrought && (
                          <div>
                            Drought Idx:{' '}
                            <span className="text-foreground">
                              {zone.droughtIndex.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Droplets className="h-3.5 w-3.5 text-sky-500" />
                  {activeZone.name}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  <div className="text-muted-foreground">
                    Annual Precipitation
                    <div className="text-foreground font-medium">
                      {activeZone.annualPrecip.toLocaleString()} mm
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Monthly Average
                    <div className="text-foreground font-medium">
                      {activeZone.monthlyAverage} mm
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Extreme Events
                    <div className="text-foreground font-medium">
                      {activeZone.extremeEvents}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Drought Index
                    <div className="text-foreground font-medium">
                      {activeZone.droughtIndex.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Flood Risk
                    <div
                      className="font-medium"
                      style={{ color: FLOOD_RISK_COLORS[activeZone.floodRisk] }}
                    >
                      {FLOOD_RISK_LABELS[activeZone.floodRisk]}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    Precipitation Trend
                    <div
                      className="font-medium"
                      style={{ color: TREND_COLORS[activeZone.trend] }}
                    >
                      {TREND_LABELS[activeZone.trend]}
                    </div>
                  </div>
                  <div className="text-muted-foreground col-span-2">
                    Coordinates
                    <div className="text-foreground font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
