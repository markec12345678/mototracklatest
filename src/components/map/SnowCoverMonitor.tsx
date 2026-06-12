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
import { useMapStore, type SnowCoverZone, type SnowCoverState } from '@/lib/map-store'
import {
  Snowflake,
  X,
  Mountain,
  Droplets,
  Filter,
  MapPin,
} from 'lucide-react'

const DEMO_ZONES: SnowCoverZone[] = [
  {
    id: 'sc1',
    name: 'Sierra Nevada',
    latitude: 37.77,
    longitude: -119.42,
    snowDepth: 185,
    snowWaterEquiv: 520,
    coverage: 78,
    meltRate: 2.4,
    snowLine: 1800,
    seasonOnset: 'Nov 15',
  },
  {
    id: 'sc2',
    name: 'Rocky Mountains',
    latitude: 39.55,
    longitude: -105.78,
    snowDepth: 310,
    snowWaterEquiv: 890,
    coverage: 85,
    meltRate: 1.8,
    snowLine: 2200,
    seasonOnset: 'Oct 28',
  },
  {
    id: 'sc3',
    name: 'Alps',
    latitude: 46.82,
    longitude: 8.23,
    snowDepth: 420,
    snowWaterEquiv: 1250,
    coverage: 92,
    meltRate: 3.1,
    snowLine: 1600,
    seasonOnset: 'Oct 10',
  },
  {
    id: 'sc4',
    name: 'Scandinavian Range',
    latitude: 62.55,
    longitude: 12.38,
    snowDepth: 140,
    snowWaterEquiv: 380,
    coverage: 68,
    meltRate: 1.2,
    snowLine: 900,
    seasonOnset: 'Sep 22',
  },
  {
    id: 'sc5',
    name: 'Himalaya',
    latitude: 28.0,
    longitude: 86.93,
    snowDepth: 560,
    snowWaterEquiv: 1780,
    coverage: 95,
    meltRate: 4.5,
    snowLine: 3800,
    seasonOnset: 'Nov 01',
  },
  {
    id: 'sc6',
    name: 'Hokkaido',
    latitude: 43.22,
    longitude: 142.87,
    snowDepth: 95,
    snowWaterEquiv: 260,
    coverage: 55,
    meltRate: 3.8,
    snowLine: 600,
    seasonOnset: 'Nov 20',
  },
  {
    id: 'sc7',
    name: 'Caucasus',
    latitude: 43.35,
    longitude: 42.45,
    snowDepth: 275,
    snowWaterEquiv: 780,
    coverage: 81,
    meltRate: 2.9,
    snowLine: 2400,
    seasonOnset: 'Oct 18',
  },
]

function getDepthCategory(depth: number): 'shallow' | 'moderate' | 'deep' | 'very_deep' {
  if (depth < 150) return 'shallow'
  if (depth < 300) return 'moderate'
  if (depth < 450) return 'deep'
  return 'very_deep'
}

function getDepthColor(depth: number): string {
  const category = getDepthCategory(depth)
  switch (category) {
    case 'shallow':
      return 'bg-light-blue text-blue-900 border-light-blue/30'
    case 'moderate':
      return 'bg-blue-500 text-white border-blue-500/30'
    case 'deep':
      return 'bg-blue-800 text-white border-blue-800/30'
    case 'very_deep':
      return 'bg-purple-700 text-white border-purple-700/30'
  }
}

function getDepthBgClass(depth: number): string {
  const category = getDepthCategory(depth)
  switch (category) {
    case 'shallow':
      return 'border-sky-300/50 bg-sky-50/50'
    case 'moderate':
      return 'border-blue-400/50 bg-blue-50/50'
    case 'deep':
      return 'border-blue-700/50 bg-blue-100/50'
    case 'very_deep':
      return 'border-purple-500/50 bg-purple-50/50'
  }
}

function getDepthBadgeVariant(depth: number) {
  const category = getDepthCategory(depth)
  switch (category) {
    case 'shallow':
      return 'bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-300/40'
    case 'moderate':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-400/40'
    case 'deep':
      return 'bg-blue-200 text-blue-900 hover:bg-blue-200 border-blue-700/40'
    case 'very_deep':
      return 'bg-purple-100 text-purple-900 hover:bg-purple-100 border-purple-500/40'
  }
}

const DEPTH_FILTER_OPTIONS: { value: SnowCoverState['depthFilter']; label: string }[] = [
  { value: 'all', label: 'All Depths' },
  { value: 'shallow', label: 'Shallow (<150 cm)' },
  { value: 'moderate', label: 'Moderate (150-300 cm)' },
  { value: 'deep', label: 'Deep (300-450 cm)' },
  { value: 'very_deep', label: 'Very Deep (>450 cm)' },
]

const TOGGLE_CONFIG = [
  { key: 'showDepth' as const, label: 'Snow Depth', icon: Mountain },
  { key: 'showWaterEquiv' as const, label: 'Water Equiv.', icon: Droplets },
  { key: 'showCoverage' as const, label: 'Coverage %', icon: MapPin },
  { key: 'showMeltRate' as const, label: 'Melt Rate', icon: Snowflake },
]

export function SnowCoverMonitor() {
  const snowCover = useMapStore((s) => s.snowCover)
  const setSnowCover = useMapStore((s) => s.setSnowCover)

  const zones = useMemo(
    () => (snowCover.snowZones.length > 0 ? snowCover.snowZones : DEMO_ZONES),
    [snowCover.snowZones]
  )

  const filteredZones = useMemo(() => {
    if (snowCover.depthFilter === 'all') return zones
    return zones.filter((z) => getDepthCategory(z.snowDepth) === snowCover.depthFilter)
  }, [zones, snowCover.depthFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgDepth: 0, totalCoverage: 0, fastestMelt: null }
    }
    const avgDepth = filteredZones.reduce((sum, z) => sum + z.snowDepth, 0) / filteredZones.length
    const totalCoverage = filteredZones.reduce((sum, z) => sum + z.coverage, 0) / filteredZones.length
    const fastestMelt = filteredZones.reduce(
      (max, z) => (z.meltRate > max.meltRate ? z : max),
      filteredZones[0]
    )
    return { avgDepth, totalCoverage, fastestMelt }
  }, [filteredZones])

  if (typeof window === 'undefined') return null
  if (!snowCover.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              Snow Cover Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSnowCover({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold text-cyan-600">
                {summary.avgDepth.toFixed(0)} cm
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Coverage</div>
              <div className="text-sm font-semibold text-cyan-600">
                {summary.totalCoverage.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Fastest Melt</div>
              <div className="text-sm font-semibold text-cyan-600">
                {summary.fastestMelt
                  ? `${summary.fastestMelt.meltRate} cm/d`
                  : '—'}
              </div>
              {summary.fastestMelt && (
                <div className="text-[9px] text-muted-foreground truncate">
                  {summary.fastestMelt.name}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Depth Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Depth Filter</Label>
            </div>
            <Select
              value={snowCover.depthFilter}
              onValueChange={(v) =>
                setSnowCover({ depthFilter: v as SnowCoverState['depthFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {TOGGLE_CONFIG.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={snowCover[key]}
                  onCheckedChange={(checked) => setSnowCover({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Snow Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[280px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = snowCover.activeSnowZoneId === zone.id
                  const depthCategory = getDepthCategory(zone.snowDepth)
                  const depthLabel =
                    depthCategory === 'very_deep'
                      ? 'Very Deep'
                      : depthCategory.charAt(0).toUpperCase() + depthCategory.slice(1)

                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? `${getDepthBgClass(zone.snowDepth)} ring-1 ring-cyan-500/30`
                          : `border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5`
                      }`}
                      onClick={() =>
                        setSnowCover({
                          activeSnowZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Mountain className="h-3 w-3 text-cyan-500 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[180px]">
                            {zone.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${getDepthBadgeVariant(zone.snowDepth)}`}
                        >
                          {depthLabel}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        {snowCover.showDepth && (
                          <div className="flex items-center gap-1">
                            <Mountain className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {zone.snowDepth} cm
                            </span>
                          </div>
                        )}
                        {snowCover.showWaterEquiv && (
                          <div className="flex items-center gap-1">
                            <Droplets className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                            SWE:{' '}
                            <span className="text-foreground font-medium">
                              {zone.snowWaterEquiv} mm
                            </span>
                          </div>
                        )}
                        {snowCover.showCoverage && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                            Coverage:{' '}
                            <span className="text-foreground font-medium">
                              {zone.coverage}%
                            </span>
                          </div>
                        )}
                        {snowCover.showMeltRate && (
                          <div className="flex items-center gap-1">
                            <Snowflake className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                            Melt:{' '}
                            <span className="text-foreground font-medium">
                              {zone.meltRate} cm/d
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Detail Panel when active */}
                      {isActive && (
                        <>
                          <Separator className="my-2" />
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                            <div className="text-muted-foreground">
                              Snow Depth:{' '}
                              <span className="text-foreground font-medium">
                                {zone.snowDepth} cm
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              SWE:{' '}
                              <span className="text-foreground font-medium">
                                {zone.snowWaterEquiv} mm
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Coverage:{' '}
                              <span className="text-foreground font-medium">
                                {zone.coverage}%
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Melt Rate:{' '}
                              <span className="text-foreground font-medium">
                                {zone.meltRate} cm/d
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Snow Line:{' '}
                              <span className="text-foreground font-medium">
                                {zone.snowLine} m
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Season Onset:{' '}
                              <span className="text-foreground font-medium">
                                {zone.seasonOnset}
                              </span>
                            </div>
                            <div className="text-muted-foreground col-span-2">
                              Coordinates:{' '}
                              <span className="text-foreground font-mono text-[9px]">
                                {zone.latitude.toFixed(2)}, {zone.longitude.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {/* Depth color bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div
                              className={`h-2 flex-1 rounded-full ${getDepthColor(zone.snowDepth)}`}
                            />
                            <span className="text-[9px] text-muted-foreground">
                              {zone.snowDepth} cm
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}

                {filteredZones.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    No zones match the selected depth filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Depth Legend */}
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Depth Legend</Label>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-sky-200 border border-sky-300/50" />
                <span className="text-muted-foreground">Shallow</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-blue-500 border border-blue-400/50" />
                <span className="text-muted-foreground">Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-blue-800 border border-blue-700/50" />
                <span className="text-muted-foreground">Deep</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-purple-700 border border-purple-500/50" />
                <span className="text-muted-foreground">Very Deep</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
