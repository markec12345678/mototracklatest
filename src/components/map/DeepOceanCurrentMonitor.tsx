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
import { useMapStore, type DeepOceanCurrentState, type DeepOceanCurrentData } from '@/lib/map-store'
import { Anchor as AnchorIcon2, X, Thermometer, Droplets, Gauge, Waves, MapPin, Filter } from 'lucide-react'

interface DemoCurrent extends DeepOceanCurrentData {
  currentType: 'thermohaline' | 'wind_driven' | 'tidal' | 'boundary'
}

const DEMO_CURRENTS: DemoCurrent[] = [
  {
    id: 'doc-amoc',
    name: 'AMOC North Atlantic',
    lat: 55,
    lng: -30,
    temperature: 3.2,
    salinity: 34.9,
    velocity: 1.5,
    volume: 17,
    depth: 3500,
    status: 'weakening',
    description: 'Atlantic Meridional Overturning Circulation showing decline',
    currentType: 'thermohaline',
  },
  {
    id: 'doc-aabw',
    name: 'Antarctic Bottom Water',
    lat: -60,
    lng: 0,
    temperature: -0.8,
    salinity: 34.7,
    velocity: 0.3,
    volume: 12,
    depth: 4500,
    status: 'moderate',
    description: 'Cold dense water mass formed in the Southern Ocean',
    currentType: 'thermohaline',
  },
  {
    id: 'doc-nadw',
    name: 'North Atlantic Deep Water',
    lat: 50,
    lng: -20,
    temperature: 2.5,
    salinity: 35.0,
    velocity: 0.8,
    volume: 14,
    depth: 3000,
    status: 'strong',
    description: 'Major deep water mass in the Atlantic basin',
    currentType: 'thermohaline',
  },
  {
    id: 'doc-iodw',
    name: 'Indian Ocean Deep Water',
    lat: -20,
    lng: 70,
    temperature: 1.8,
    salinity: 34.8,
    velocity: 0.5,
    volume: 8,
    depth: 3800,
    status: 'moderate',
    description: 'Deep water circulation in the Indian Ocean basin',
    currentType: 'wind_driven',
  },
  {
    id: 'doc-pdw',
    name: 'Pacific Deep Water',
    lat: 10,
    lng: -170,
    temperature: 1.2,
    salinity: 34.7,
    velocity: 0.4,
    volume: 10,
    depth: 4000,
    status: 'slowing',
    description: 'Deep circulation patterns in the Pacific basin',
    currentType: 'tidal',
  },
  {
    id: 'doc-cdw',
    name: 'Circumpolar Deep Water',
    lat: -55,
    lng: 140,
    temperature: 1.0,
    salinity: 34.7,
    velocity: 0.6,
    volume: 15,
    depth: 3500,
    status: 'weakening',
    description: 'Circumpolar deep water encircling Antarctica',
    currentType: 'boundary',
  },
]

const STATUS_CONFIG: Record<
  DeepOceanCurrentData['status'],
  { label: string; color: string; bgClass: string }
> = {
  strong: { label: 'Strong', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weakening: { label: 'Weakening', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  slowing: { label: 'Slowing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CURRENT_TYPE_LABELS: Record<DemoCurrent['currentType'], string> = {
  thermohaline: 'Thermohaline',
  wind_driven: 'Wind-Driven',
  tidal: 'Tidal',
  boundary: 'Boundary',
}

export function DeepOceanCurrentMonitor() {
  const state = useMapStore((s) => s.deepOceanCurrent)
  const setState = useMapStore((s) => s.setDeepOceanCurrent)

  const currents = useMemo(
    () => (state.currents.length > 0 ? (state.currents as DemoCurrent[]) : DEMO_CURRENTS),
    [state.currents]
  )

  const filteredCurrents = useMemo(() => {
    return currents.filter((c) => {
      if (state.typeFilter !== 'all' && c.currentType !== state.typeFilter) return false
      return true
    })
  }, [currents, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredCurrents.length === 0) {
      return { avgTemperature: 0, avgVelocity: 0, weakeningSlowingCount: 0 }
    }
    const avgTemperature =
      filteredCurrents.reduce((sum, c) => sum + c.temperature, 0) / filteredCurrents.length
    const avgVelocity =
      filteredCurrents.reduce((sum, c) => sum + c.velocity, 0) / filteredCurrents.length
    const weakeningSlowingCount = filteredCurrents.filter(
      (c) => c.status === 'weakening' || c.status === 'slowing'
    ).length
    return {
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      weakeningSlowingCount,
    }
  }, [filteredCurrents])

  const activeCurrent = useMemo(
    () => currents.find((c) => c.id === state.activeCurrentId) ?? null,
    [currents, state.activeCurrentId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DeepOceanCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showVolume', label: 'Volume', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <AnchorIcon2 className="h-4 w-4 text-blue-400" />
              Deep Ocean Current Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Current Type Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Current Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as DeepOceanCurrentState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="thermohaline">Thermohaline</SelectItem>
                <SelectItem value="wind_driven">Wind-Driven</SelectItem>
                <SelectItem value="tidal">Tidal</SelectItem>
                <SelectItem value="boundary">Boundary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Temp</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-blue-400">&deg;C</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Velocity</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgVelocity}</div>
              <div className="text-[9px] text-blue-400">m/s</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Weakening/Slowing</div>
              <div className="text-sm font-semibold text-amber-400">{summary.weakeningSlowingCount}</div>
              <div className="text-[9px] text-blue-400">currents</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Current List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Ocean Currents ({filteredCurrents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCurrents.map((current) => {
                  const isActive = state.activeCurrentId === current.id
                  const statusCfg = STATUS_CONFIG[current.status]
                  return (
                    <div
                      key={current.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeCurrentId: isActive ? null : current.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{current.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-blue-100 font-medium">
                              {current.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-blue-100 font-medium">
                              {current.salinity} PSU
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-blue-100 font-medium">
                              {current.velocity} m/s
                            </span>
                          </div>
                        )}
                        {state.showVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-blue-100 font-medium">
                              {current.volume} Sv
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCurrents.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Current Details */}
          {activeCurrent && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeCurrent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCurrent.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCurrent.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeCurrent.lat.toFixed(1)}, {activeCurrent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Temperature: </span>
                    <span className="font-medium text-cyan-400">{activeCurrent.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Salinity: </span>
                    <span className="font-medium text-blue-200">{activeCurrent.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Velocity: </span>
                    <span className="font-medium text-blue-200">{activeCurrent.velocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Volume: </span>
                    <span className="font-medium text-blue-200">{activeCurrent.volume} Sv</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Depth: </span>
                    <span className="font-medium text-blue-200">{activeCurrent.depth.toLocaleString()} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Current Type: </span>
                    <span className="font-medium text-blue-200">
                      {(activeCurrent as DemoCurrent).currentType ? CURRENT_TYPE_LABELS[(activeCurrent as DemoCurrent).currentType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeCurrent.description}</span>
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
