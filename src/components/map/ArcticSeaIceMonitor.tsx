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
import { useMapStore, type ArcticSeaIceState, type ArcticSeaIceZone } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon2, X, MapPin, Layers, Ruler, Droplets, TrendingDown, Filter } from 'lucide-react'

const DEMO_ZONES: ArcticSeaIceZone[] = [
  {
    id: 'asi-central',
    name: 'Central Arctic',
    latitude: 85.00,
    longitude: 0.00,
    iceExtent: 4.2,
    iceThickness: 3.8,
    iceConcentration: 95,
    trend: 'stable',
    iceType: 'multiyear',
  },
  {
    id: 'asi-beaufort',
    name: 'Beaufort Sea',
    latitude: 72.00,
    longitude: -140.00,
    iceExtent: 1.8,
    iceThickness: 1.6,
    iceConcentration: 72,
    trend: 'declining',
    iceType: 'firstyear',
  },
  {
    id: 'asi-greenland',
    name: 'Greenland Sea',
    latitude: 75.00,
    longitude: -10.00,
    iceExtent: 1.2,
    iceThickness: 2.1,
    iceConcentration: 68,
    trend: 'rapid_decline',
    iceType: 'mixed',
  },
  {
    id: 'asi-barents',
    name: 'Barents Sea',
    latitude: 76.00,
    longitude: 35.00,
    iceExtent: 0.9,
    iceThickness: 1.2,
    iceConcentration: 55,
    trend: 'rapid_decline',
    iceType: 'firstyear',
  },
  {
    id: 'asi-chukchi',
    name: 'Chukchi Sea',
    latitude: 70.00,
    longitude: -170.00,
    iceExtent: 1.5,
    iceThickness: 1.4,
    iceConcentration: 64,
    trend: 'declining',
    iceType: 'mixed',
  },
  {
    id: 'asi-laptev',
    name: 'Laptev Sea',
    latitude: 76.00,
    longitude: 125.00,
    iceExtent: 1.1,
    iceThickness: 0.9,
    iceConcentration: 78,
    trend: 'growing',
    iceType: 'newice',
  },
]

const TREND_CONFIG: Record<
  ArcticSeaIceZone['trend'],
  { label: string; color: string; bgClass: string }
> = {
  growing: { label: 'Growing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  rapid_decline: { label: 'Rapid Decline', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ICE_TYPE_LABELS: Record<ArcticSeaIceZone['iceType'], string> = {
  multiyear: 'Multi-year',
  firstyear: 'First-year',
  newice: 'New Ice',
  mixed: 'Mixed',
}

export function ArcticSeaIceMonitor() {
  const arcticSeaIce = useMapStore((s) => s.arcticSeaIce)
  const setArcticSeaIce = useMapStore((s) => s.setArcticSeaIce)

  const zones = useMemo(
    () => (arcticSeaIce.zones.length > 0 ? arcticSeaIce.zones : DEMO_ZONES),
    [arcticSeaIce.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (arcticSeaIce.iceFilter !== 'all' && z.iceType !== arcticSeaIce.iceFilter) return false
      return true
    })
  }, [zones, arcticSeaIce.iceFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalExtent: 0, avgThickness: 0, decliningCount: 0 }
    }
    const totalExtent = Math.round(filteredZones.reduce((sum, z) => sum + z.iceExtent, 0) * 10) / 10
    const avgThickness =
      Math.round(
        (filteredZones.reduce((sum, z) => sum + z.iceThickness, 0) / filteredZones.length) * 10
      ) / 10
    const decliningCount = filteredZones.filter(
      (z) => z.trend === 'declining' || z.trend === 'rapid_decline'
    ).length
    return { totalExtent, avgThickness, decliningCount }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === arcticSeaIce.activeZoneId) ?? null,
    [zones, arcticSeaIce.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!arcticSeaIce.open) return null

  const overlayToggles: { key: keyof ArcticSeaIceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showExtent', label: 'Ice Extent', icon: Layers },
    { key: 'showThickness', label: 'Thickness', icon: Ruler },
    { key: 'showConcentration', label: 'Concentration', icon: Droplets },
    { key: 'showTrend', label: 'Trend', icon: TrendingDown },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SnowflakeIcon2 className="h-4 w-4 text-cyan-500" />
              Arctic Sea Ice Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setArcticSeaIce({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Ice Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ice Type
            </Label>
            <Select
              value={arcticSeaIce.iceFilter}
              onValueChange={(v) =>
                setArcticSeaIce({
                  iceFilter: v as ArcticSeaIceState['iceFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ice Types</SelectItem>
                <SelectItem value="multiyear">Multi-year</SelectItem>
                <SelectItem value="firstyear">First-year</SelectItem>
                <SelectItem value="newice">New Ice</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={arcticSeaIce[key] as boolean}
                  onCheckedChange={(checked) => setArcticSeaIce({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Extent</div>
              <div className="text-sm font-semibold text-cyan-500">{summary.totalExtent}</div>
              <div className="text-[9px] text-muted-foreground">million km²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Thickness</div>
              <div className="text-sm font-semibold text-blue-500">{summary.avgThickness}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Declining</div>
              <div className="text-sm font-semibold">{summary.decliningCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ice Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = arcticSeaIce.activeZoneId === zone.id
                  const trendCfg = TREND_CONFIG[zone.trend]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setArcticSeaIce({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: trendCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${trendCfg.bgClass}`}
                        >
                          {trendCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {arcticSeaIce.showExtent && (
                          <div>
                            Extent:{' '}
                            <span className="text-foreground font-medium">
                              {zone.iceExtent} M km²
                            </span>
                          </div>
                        )}
                        {arcticSeaIce.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-foreground font-medium">
                              {zone.iceThickness} m
                            </span>
                          </div>
                        )}
                        {arcticSeaIce.showConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-foreground font-medium">
                              {zone.iceConcentration}%
                            </span>
                          </div>
                        )}
                        {arcticSeaIce.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className="text-foreground font-medium">
                              {TREND_CONFIG[zone.trend].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${TREND_CONFIG[activeZone.trend].bgClass}`}
                  >
                    {TREND_CONFIG[activeZone.trend].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ice Type: </span>
                    <span className="font-medium">{ICE_TYPE_LABELS[activeZone.iceType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Extent: </span>
                    <span className="font-medium">{activeZone.iceExtent} M km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thickness: </span>
                    <span className="font-medium">{activeZone.iceThickness} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Concentration: </span>
                    <span className="font-medium">{activeZone.iceConcentration}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <span className="font-medium">{TREND_CONFIG[activeZone.trend].label}</span>
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
