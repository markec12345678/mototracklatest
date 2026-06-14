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
import { useMapStore, type PeatFireData, type PeatFireState } from '@/lib/map-store'
import { Flame as FlameIcon5, X, MapPin, Filter, Layers, Droplets, Thermometer } from 'lucide-react'

const DEMO_FIRES: PeatFireData[] = [
  {
    id: 'pf-indonesia-riau',
    name: 'Indonesian Peat Fire',
    lat: 0.5,
    lng: 103.5,
    burnArea: 28000,
    fireDepth: 2.5,
    emissionRate: 450,
    soilMoisture: 15,
    peatDepth: 8.5,
    status: 'active',
    description: 'Riau, Sumatra - Annual haze disaster',
  },
  {
    id: 'pf-russia-moscow',
    name: 'Russian Peat Fire',
    lat: 55.0,
    lng: 38.0,
    burnArea: 15000,
    fireDepth: 1.8,
    emissionRate: 220,
    soilMoisture: 22,
    peatDepth: 5.2,
    status: 'smoldering',
    description: 'Moscow Region - 2010 extreme event',
  },
  {
    id: 'pf-malaysia-sarawak',
    name: 'Malaysian Peat Fire',
    lat: 2.5,
    lng: 111.5,
    burnArea: 8500,
    fireDepth: 1.5,
    emissionRate: 180,
    soilMoisture: 28,
    peatDepth: 6.0,
    status: 'suppressed',
    description: 'Sarawak - Palm oil plantation fires',
  },
  {
    id: 'pf-nc-pocosin',
    name: 'North Carolina Peat',
    lat: 35.5,
    lng: -76.5,
    burnArea: 2800,
    fireDepth: 0.8,
    emissionRate: 45,
    soilMoisture: 45,
    peatDepth: 3.5,
    status: 'monitoring',
    description: 'Pocosin Lakes - Lightning-ignited',
  },
  {
    id: 'pf-borneo-kalimantan',
    name: 'Borneo Peat Fire',
    lat: -1.0,
    lng: 114.0,
    burnArea: 35000,
    fireDepth: 3.2,
    emissionRate: 680,
    soilMoisture: 8,
    peatDepth: 12.0,
    status: 'active',
    description: 'Central Kalimantan - Mega Rice Project',
  },
  {
    id: 'pf-sc-cairngorms',
    name: 'Scotland Peat Fire',
    lat: 57.0,
    lng: -4.0,
    burnArea: 450,
    fireDepth: 0.3,
    emissionRate: 12,
    soilMoisture: 55,
    peatDepth: 2.8,
    status: 'extinguished',
    description: 'Cairngorms - Rare upland peat fire',
  },
]

const STATUS_CONFIG: Record<
  PeatFireData['status'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  smoldering: { label: 'Smoldering', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  suppressed: { label: 'Suppressed', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  monitoring: { label: 'Monitoring', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  extinguished: { label: 'Extinguished', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

export function PeatFireMonitor() {
  const state = useMapStore((s) => s.peatFire)
  const setState = useMapStore.getState().setPeatFire

  // Initialize demo data on mount if fires array is empty
  useEffect(() => {
    if (useMapStore.getState().peatFire.fires.length === 0) {
      useMapStore.getState().setPeatFire({ fires: DEMO_FIRES })
    }
  }, [])

  const fires = useMemo(
    () => (state.fires.length > 0 ? state.fires : DEMO_FIRES),
    [state.fires]
  )

  const filteredFires = useMemo(() => {
    return fires.filter((f) => {
      if (state.typeFilter !== 'all') {
        if (state.typeFilter === 'surface') return f.fireDepth < 1.0
        if (state.typeFilter === 'ground') return f.fireDepth >= 1.0 && f.fireDepth < 2.0
        if (state.typeFilter === 'deep') return f.fireDepth >= 2.0
        if (state.typeFilter === 'smoldering') return f.status === 'smoldering'
      }
      return true
    })
  }, [fires, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredFires.length === 0) {
      return { avgBurnArea: 0, avgEmissionRate: 0, activeSmolderingCount: 0 }
    }
    const avgBurnArea = filteredFires.reduce((sum, f) => sum + f.burnArea, 0) / filteredFires.length
    const avgEmissionRate = filteredFires.reduce((sum, f) => sum + f.emissionRate, 0) / filteredFires.length
    const activeSmolderingCount = filteredFires.filter(
      (f) => f.status === 'active' || f.status === 'smoldering'
    ).length
    return {
      avgBurnArea: Math.round(avgBurnArea),
      avgEmissionRate: Math.round(avgEmissionRate),
      activeSmolderingCount,
    }
  }, [filteredFires])

  const activeFire = useMemo(
    () => fires.find((f) => f.id === state.activeFireId) ?? null,
    [fires, state.activeFireId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PeatFireState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBurnArea', label: 'Burn Area', icon: FlameIcon5 },
    { key: 'showFireDepth', label: 'Fire Depth', icon: Layers },
    { key: 'showEmissionRate', label: 'Emission Rate', icon: Thermometer },
    { key: 'showSoilMoisture', label: 'Soil Moisture', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon5 className="h-4 w-4 text-orange-400" />
              Peat Fire Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Fire Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as PeatFireState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/30 border-orange-800/40 text-orange-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="surface">Surface (&lt;1.0m)</SelectItem>
                <SelectItem value="ground">Ground (1.0-2.0m)</SelectItem>
                <SelectItem value="deep">Deep (&ge;2.0m)</SelectItem>
                <SelectItem value="smoldering">Smoldering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-100/80">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-orange-800/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Burn Area</div>
              <div className="text-sm font-semibold text-orange-100">{summary.avgBurnArea.toLocaleString()}</div>
              <div className="text-[9px] text-orange-300/60">hectares</div>
            </div>
            <div className="rounded-lg border border-orange-800/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Emission</div>
              <div className="text-sm font-semibold text-orange-100">{summary.avgEmissionRate}</div>
              <div className="text-[9px] text-orange-300/60">tCO2/day</div>
            </div>
            <div className="rounded-lg border border-orange-800/30 bg-orange-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Active/Smold.</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeSmolderingCount}</div>
              <div className="text-[9px] text-orange-300/60">fires</div>
            </div>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Fire List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Peat Fires ({filteredFires.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFires.map((fire) => {
                  const isActive = state.activeFireId === fire.id
                  const statusCfg = STATUS_CONFIG[fire.status]
                  return (
                    <div
                      key={fire.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-orange-800/30 hover:border-orange-600/30 hover:bg-orange-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeFireId: isActive ? null : fire.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">{fire.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showBurnArea && (
                          <div>
                            Burn Area:{' '}
                            <span className="text-orange-100 font-medium">
                              {fire.burnArea.toLocaleString()} ha
                            </span>
                          </div>
                        )}
                        {state.showFireDepth && (
                          <div>
                            Fire Depth:{' '}
                            <span className="text-orange-100 font-medium">
                              {fire.fireDepth} m
                            </span>
                          </div>
                        )}
                        {state.showEmissionRate && (
                          <div>
                            Emission:{' '}
                            <span className="text-orange-100 font-medium">
                              {fire.emissionRate} tCO2/day
                            </span>
                          </div>
                        )}
                        {state.showSoilMoisture && (
                          <div>
                            Soil Moisture:{' '}
                            <span className="text-orange-100 font-medium">
                              {fire.soilMoisture}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFires.length === 0 && (
                  <div className="text-center text-xs text-orange-300/50 py-4">
                    No fires match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Fire Details */}
          {activeFire && (
            <>
              <Separator className="bg-orange-800/30" />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-900/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeFire.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeFire.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeFire.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-orange-100/80">
                  <div>
                    <span className="text-orange-300/60">Coordinates: </span>
                    <span className="font-medium">
                      {activeFire.lat.toFixed(1)}, {activeFire.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-300/60">Burn Area: </span>
                    <span className="font-medium">{activeFire.burnArea.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-orange-300/60">Fire Depth: </span>
                    <span className="font-medium">{activeFire.fireDepth} m</span>
                  </div>
                  <div>
                    <span className="text-orange-300/60">Emission Rate: </span>
                    <span className="font-medium">{activeFire.emissionRate} tCO2/day</span>
                  </div>
                  <div>
                    <span className="text-orange-300/60">Soil Moisture: </span>
                    <span className="font-medium">{activeFire.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-orange-300/60">Peat Depth: </span>
                    <span className="font-medium">{activeFire.peatDepth} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-300/60">Description: </span>
                    <span className="font-medium">{activeFire.description}</span>
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
