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
import { useMapStore, type OzoneZone, type OzoneLayerState } from '@/lib/map-store'
import { Sun, X, Shield, Filter, MapPin, TrendingUp } from 'lucide-react'

const SAMPLE_ZONES: OzoneZone[] = [
  {
    id: 'oz-1',
    name: 'Antarctic Ozone Hole',
    latitude: -78.0,
    longitude: 0.0,
    ozoneDobson: 180,
    trend: 'decreasing',
    uvIndex: 11.5,
    season: 'Spring (Sep–Nov)',
    satelliteSource: 'Aura OMI',
  },
  {
    id: 'oz-2',
    name: 'Arctic Region',
    latitude: 75.0,
    longitude: 20.0,
    ozoneDobson: 340,
    trend: 'stable',
    uvIndex: 3.2,
    season: 'Winter (Dec–Feb)',
    satelliteSource: 'Sentinel-5P TROPOMI',
  },
  {
    id: 'oz-3',
    name: 'Mid-Latitude Pacific',
    latitude: 30.0,
    longitude: -150.0,
    ozoneDobson: 295,
    trend: 'increasing',
    uvIndex: 7.8,
    season: 'Summer (Jun–Aug)',
    satelliteSource: 'NOAA-20 OMPS',
  },
  {
    id: 'oz-4',
    name: 'Sahara',
    latitude: 23.0,
    longitude: 12.0,
    ozoneDobson: 270,
    trend: 'decreasing',
    uvIndex: 12.0,
    season: 'Year-round arid',
    satelliteSource: 'MetOp-B GOME-2',
  },
  {
    id: 'oz-5',
    name: 'Australian Outback',
    latitude: -25.0,
    longitude: 135.0,
    ozoneDobson: 260,
    trend: 'decreasing',
    uvIndex: 13.2,
    season: 'Summer (Dec–Feb)',
    satelliteSource: 'Aura OMI',
  },
  {
    id: 'oz-6',
    name: 'Northern Europe',
    latitude: 55.0,
    longitude: 15.0,
    ozoneDobson: 370,
    trend: 'increasing',
    uvIndex: 2.8,
    season: 'Spring (Mar–May)',
    satelliteSource: 'Sentinel-5P TROPOMI',
  },
  {
    id: 'oz-7',
    name: 'Tropical Atlantic',
    latitude: 5.0,
    longitude: -30.0,
    ozoneDobson: 250,
    trend: 'stable',
    uvIndex: 10.4,
    season: 'Wet season (Apr–Jul)',
    satelliteSource: 'NOAA-20 OMPS',
  },
]

const TREND_STYLES: Record<OzoneZone['trend'], { color: string; bgColor: string; label: string }> = {
  increasing: { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10', label: 'Increasing' },
  stable: { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10', label: 'Stable' },
  decreasing: { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10', label: 'Decreasing' },
}

export function OzoneLayerMonitor() {
  const ozoneLayer = useMapStore((s) => s.ozoneLayer)
  const setOzoneLayer = useMapStore((s) => s.setOzoneLayer)

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  const zones = useMemo(() => {
    return ozoneLayer.ozoneZones.length > 0 ? ozoneLayer.ozoneZones : SAMPLE_ZONES
  }, [ozoneLayer.ozoneZones])

  const filteredZones = useMemo(() => {
    let list = zones
    if (ozoneLayer.trendFilter !== 'all') {
      list = list.filter((z) => z.trend === ozoneLayer.trendFilter)
    }
    return list
  }, [zones, ozoneLayer.trendFilter])

  const selectedZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) ?? null
  }, [zones, selectedZoneId])

  const summary = useMemo(() => {
    const avgDU =
      zones.length > 0
        ? Math.round(zones.reduce((sum, z) => sum + z.ozoneDobson, 0) / zones.length)
        : 0
    const decreasingCount = zones.filter((z) => z.trend === 'decreasing').length
    const highestUV = zones.length > 0 ? Math.max(...zones.map((z) => z.uvIndex)) : 0
    return { avgDU, decreasingCount, highestUV }
  }, [zones])

  if (!ozoneLayer.open) return null

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
                <Shield className="h-4 w-4 text-emerald-500" />
                Ozone Layer Monitor
                <Badge variant="outline" className="text-[10px] font-normal">
                  {filteredZones.length} zones
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setOzoneLayer({ open: false })}
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
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg DU</p>
                  <p className="text-lg font-bold tabular-nums mt-0.5">{summary.avgDU}</p>
                  <p className="text-[9px] text-muted-foreground">Dobson Units</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Decreasing</p>
                  <p className="text-lg font-bold tabular-nums text-red-500 mt-0.5">{summary.decreasingCount}</p>
                  <p className="text-[9px] text-muted-foreground">zones</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest UV</p>
                  <p className="text-lg font-bold tabular-nums text-orange-500 mt-0.5">{summary.highestUV.toFixed(1)}</p>
                  <p className="text-[9px] text-muted-foreground">UV Index</p>
                </div>
              </div>

              <Separator />

              {/* Toggles & Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Filter className="h-3 w-3" />
                  Display & Filter
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDobson" className="text-xs cursor-pointer">Dobson Units</Label>
                    <Switch
                      id="showDobson"
                      checked={ozoneLayer.showDobson}
                      onCheckedChange={(v) => setOzoneLayer({ showDobson: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showTrend" className="text-xs cursor-pointer">Trend</Label>
                    <Switch
                      id="showTrend"
                      checked={ozoneLayer.showTrend}
                      onCheckedChange={(v) => setOzoneLayer({ showTrend: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showUV" className="text-xs cursor-pointer">UV Index</Label>
                    <Switch
                      id="showUV"
                      checked={ozoneLayer.showUV}
                      onCheckedChange={(v) => setOzoneLayer({ showUV: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSeason" className="text-xs cursor-pointer">Season</Label>
                    <Switch
                      id="showSeason"
                      checked={ozoneLayer.showSeason}
                      onCheckedChange={(v) => setOzoneLayer({ showSeason: v })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Trend:</span>
                  <Select
                    value={ozoneLayer.trendFilter}
                    onValueChange={(v) =>
                      setOzoneLayer({ trendFilter: v as OzoneLayerState['trendFilter'] })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="All trends" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trends</SelectItem>
                      <SelectItem value="increasing">Increasing</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="decreasing">Decreasing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Zone List */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Monitored Zones
                </p>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredZones.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No zones match the current filter.
                    </p>
                  )}

                  {filteredZones.map((zone) => {
                    const trendStyle = TREND_STYLES[zone.trend]
                    const isSelected = selectedZoneId === zone.id

                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZoneId(isSelected ? null : zone.id)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : 'border-border/40 hover:border-border/80 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{zone.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                              {ozoneLayer.showDobson && (
                                <span className="text-[10px] text-muted-foreground">
                                  {zone.ozoneDobson} DU
                                </span>
                              )}
                              {ozoneLayer.showTrend && (
                                <Badge
                                  className={`text-[9px] px-1.5 py-0 border-0 ${trendStyle.bgColor} ${trendStyle.color}`}
                                >
                                  {trendStyle.label}
                                </Badge>
                              )}
                              {ozoneLayer.showUV && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Sun className="h-2.5 w-2.5" />
                                  UV {zone.uvIndex.toFixed(1)}
                                </span>
                              )}
                              {ozoneLayer.showSeason && (
                                <span className="text-[10px] text-muted-foreground">
                                  {zone.season}
                                </span>
                              )}
                            </div>
                          </div>
                          <TrendingUp className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${trendStyle.color}`} />
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
                          <Shield className="h-3.5 w-3.5 text-emerald-500" />
                          {selectedZone.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Ozone</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {selectedZone.ozoneDobson}{' '}
                              <span className="text-[9px] font-normal text-muted-foreground">DU</span>
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Trend</p>
                            <p className={`text-sm font-semibold ${TREND_STYLES[selectedZone.trend].color}`}>
                              {TREND_STYLES[selectedZone.trend].label}
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">UV Index</p>
                            <p className="text-sm font-semibold tabular-nums text-orange-500">
                              {selectedZone.uvIndex.toFixed(1)}
                            </p>
                          </div>
                          <div className="rounded-md bg-muted/40 p-2">
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Season</p>
                            <p className="text-sm font-semibold">{selectedZone.season}</p>
                          </div>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Coordinates</p>
                          <p className="text-xs font-medium tabular-nums">
                            {selectedZone.latitude.toFixed(2)}°, {selectedZone.longitude.toFixed(2)}°
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-2">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Satellite Source</p>
                          <p className="text-xs font-medium">{selectedZone.satelliteSource}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data source */}
              <p className="text-[9px] text-muted-foreground/60 text-center pt-1">
                Sample data · Satellite sources: Aura OMI, Sentinel-5P TROPOMI, NOAA-20 OMPS, MetOp-B GOME-2
              </p>
            </CardContent>
          </ScrollArea>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
