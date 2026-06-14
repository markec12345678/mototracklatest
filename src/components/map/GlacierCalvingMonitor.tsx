'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type GlacierCalvingData, type GlacierCalvingState } from '@/lib/map-store'
import { Mountain as MountainIcon4, X, Activity, TrendingDown, Layers, MapPin, Filter } from 'lucide-react'

const DEMO_GLACIERS: GlacierCalvingData[] = [
  {
    id: 'gc-jakobshavn',
    name: 'Jakobshavn Isbrae',
    lat: 69.15,
    lng: -49.50,
    calvingRate: 45,
    iceVelocity: 17,
    iceThickness: 2600,
    seismicActivity: 850,
    retreatRate: 3.5,
    status: 'rapid_retreat',
    description: 'Greenland - Fastest flowing glacier',
  },
  {
    id: 'gc-pine-island',
    name: 'Pine Island Glacier',
    lat: -75.0,
    lng: -100.0,
    calvingRate: 65,
    iceVelocity: 4,
    iceThickness: 2000,
    seismicActivity: 320,
    retreatRate: 8.0,
    status: 'collapsing',
    description: 'Antarctica - Thinning and acceleration',
  },
  {
    id: 'gc-helheim',
    name: 'Helheim Glacier',
    lat: 66.35,
    lng: -38.20,
    calvingRate: 25,
    iceVelocity: 8,
    iceThickness: 1500,
    seismicActivity: 450,
    retreatRate: 1.2,
    status: 'retreating',
    description: 'Greenland - East Greenland outlet',
  },
  {
    id: 'gc-columbia',
    name: 'Columbia Glacier',
    lat: 61.20,
    lng: -147.10,
    calvingRate: 5,
    iceVelocity: 2,
    iceThickness: 600,
    seismicActivity: 180,
    retreatRate: 0.3,
    status: 'retreating',
    description: 'Alaska, USA - Well-studied tidewater glacier',
  },
  {
    id: 'gc-perito-moreno',
    name: 'Perito Moreno',
    lat: -50.50,
    lng: -73.05,
    calvingRate: 2,
    iceVelocity: 1.8,
    iceThickness: 500,
    seismicActivity: 95,
    retreatRate: -0.1,
    status: 'stable',
    description: 'Argentina - Rare advancing glacier',
  },
  {
    id: 'gc-drygalski',
    name: 'Drygalski Glacier',
    lat: -75.40,
    lng: -83.50,
    calvingRate: 55,
    iceVelocity: 3.5,
    iceThickness: 1800,
    seismicActivity: 580,
    retreatRate: 5.0,
    status: 'rapid_retreat',
    description: 'Antarctica - Ice shelf breakup zone',
  },
]

const GLACIER_TYPE_MAP: Record<string, GlacierCalvingState['typeFilter']> = {
  'gc-jakobshavn': 'tidewater',
  'gc-pine-island': 'ice_shelf',
  'gc-helheim': 'tidewater',
  'gc-columbia': 'tidewater',
  'gc-perito-moreno': 'lake_terminating',
  'gc-drygalski': 'ice_shelf',
}

const STATUS_CONFIG: Record<
  GlacierCalvingData['status'],
  { label: string; color: string; bgClass: string }
> = {
  advancing: { label: 'Advancing', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  retreating: { label: 'Retreating', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  rapid_retreat: { label: 'Rapid Retreat', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_FILTER_LABELS: Record<GlacierCalvingState['typeFilter'], string> = {
  all: 'All Types',
  tidewater: 'Tidewater',
  lake_terminating: 'Lake Terminating',
  ice_shelf: 'Ice Shelf',
  grounding_line: 'Grounding Line',
}

export function GlacierCalvingMonitor() {
  const glacierCalving = useMapStore((s) => s.glacierCalving)
  const setGlacierCalving = useMapStore((s) => s.setGlacierCalving)

  const glaciers = useMemo(
    () => (glacierCalving.glaciers.length > 0 ? glacierCalving.glaciers : DEMO_GLACIERS),
    [glacierCalving.glaciers]
  )

  const filteredGlaciers = useMemo(() => {
    return glaciers.filter((g) => {
      if (glacierCalving.typeFilter !== 'all') {
        const gType = GLACIER_TYPE_MAP[g.id]
        if (gType !== glacierCalving.typeFilter) return false
      }
      return true
    })
  }, [glaciers, glacierCalving.typeFilter])

  const summary = useMemo(() => {
    if (filteredGlaciers.length === 0) {
      return { avgCalvingRate: 0, avgRetreatRate: 0, criticalCount: 0 }
    }
    const avgCalvingRate =
      filteredGlaciers.reduce((sum, g) => sum + g.calvingRate, 0) / filteredGlaciers.length
    const avgRetreatRate =
      filteredGlaciers.reduce((sum, g) => sum + g.retreatRate, 0) / filteredGlaciers.length
    const criticalCount = filteredGlaciers.filter(
      (g) => g.status === 'rapid_retreat' || g.status === 'collapsing'
    ).length
    return {
      avgCalvingRate: Math.round(avgCalvingRate * 10) / 10,
      avgRetreatRate: Math.round(avgRetreatRate * 100) / 100,
      criticalCount,
    }
  }, [filteredGlaciers])

  const activeGlacier = useMemo(
    () => glaciers.find((g) => g.id === glacierCalving.activeGlacierId) ?? null,
    [glaciers, glacierCalving.activeGlacierId]
  )

  useEffect(() => {
    const current = useMapStore.getState().glacierCalving
    if (current.glaciers.length === 0) {
      useMapStore.getState().setGlacierCalving({ glaciers: DEMO_GLACIERS })
    }
  }, [])

  if (typeof window === 'undefined') return null
  if (!glacierCalving.open) return null

  const overlayToggles: { key: keyof GlacierCalvingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCalvingRate', label: 'Calving Rate', icon: Activity },
    { key: 'showIceVelocity', label: 'Ice Velocity', icon: TrendingDown },
    { key: 'showIceThickness', label: 'Ice Thickness', icon: Layers },
    { key: 'showSeismicActivity', label: 'Seismic Activity', icon: MountainIcon4 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-500/20 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <MountainIcon4 className="h-4 w-4 text-sky-300" />
              Glacier Calving Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-white hover:bg-sky-800/50"
              onClick={() => setGlacierCalving({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Glacier Type
            </Label>
            <Select
              value={glacierCalving.typeFilter}
              onValueChange={(v) =>
                setGlacierCalving({
                  typeFilter: v as GlacierCalvingState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/50 border-sky-500/30 text-sky-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-500/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-100">
                  <Icon className="h-3 w-3 text-sky-300" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={glacierCalving[key] as boolean}
                  onCheckedChange={(checked) => setGlacierCalving({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-500/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-sky-500/20 bg-sky-900/40 p-2 text-center">
              <div className="text-[10px] text-sky-300">Avg Calving Rate</div>
              <div className="text-sm font-semibold text-sky-100">{summary.avgCalvingRate}</div>
              <div className="text-[9px] text-sky-400">km²/yr</div>
            </div>
            <div className="rounded-lg border border-sky-500/20 bg-sky-900/40 p-2 text-center">
              <div className="text-[10px] text-sky-300">Avg Retreat Rate</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgRetreatRate}</div>
              <div className="text-[9px] text-sky-400">km/yr</div>
            </div>
            <div className="rounded-lg border border-sky-500/20 bg-sky-900/40 p-2 text-center">
              <div className="text-[10px] text-sky-300">Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-sky-400">sites</div>
            </div>
          </div>

          <Separator className="bg-sky-500/20" />

          {/* Glacier List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Calving Sites ({filteredGlaciers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredGlaciers.map((glacier) => {
                  const isActive = glacierCalving.activeGlacierId === glacier.id
                  const statusCfg = STATUS_CONFIG[glacier.status]
                  return (
                    <div
                      key={glacier.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-400/50 bg-sky-800/30'
                          : 'border-sky-500/20 hover:border-sky-400/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setGlacierCalving({
                          activeGlacierId: isActive ? null : glacier.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-sky-50">{glacier.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {glacierCalving.showCalvingRate && (
                          <div>
                            Calving:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.calvingRate} km²/yr
                            </span>
                          </div>
                        )}
                        {glacierCalving.showIceVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.iceVelocity} km/yr
                            </span>
                          </div>
                        )}
                        {glacierCalving.showIceThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.iceThickness} m
                            </span>
                          </div>
                        )}
                        {glacierCalving.showSeismicActivity && (
                          <div>
                            Seismic:{' '}
                            <span className="text-sky-100 font-medium">
                              {glacier.seismicActivity} evt/mo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredGlaciers.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No glaciers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Glacier Details */}
          {activeGlacier && (
            <>
              <Separator className="bg-sky-500/20" />
              <div className="space-y-2 rounded-lg border border-sky-400/30 bg-sky-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-300" />
                  <span className="text-xs font-semibold text-sky-50">{activeGlacier.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeGlacier.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeGlacier.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] text-sky-300 italic">{activeGlacier.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeGlacier.lat.toFixed(2)}, {activeGlacier.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Calving Rate: </span>
                    <span className="font-medium text-sky-100">{activeGlacier.calvingRate} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Ice Velocity: </span>
                    <span className="font-medium text-sky-100">{activeGlacier.iceVelocity} km/yr</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Ice Thickness: </span>
                    <span className="font-medium text-sky-100">{activeGlacier.iceThickness} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Seismic Activity: </span>
                    <span className="font-medium text-sky-100">{activeGlacier.seismicActivity} events/mo</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Retreat Rate: </span>
                    <span className="font-medium text-sky-100">{activeGlacier.retreatRate} km/yr</span>
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
