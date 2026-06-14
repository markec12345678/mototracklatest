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
import { useMapStore, type ThermoclineDepthState, type ThermoclineDepthData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon2, X, BarChart3, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const DEMO_STATIONS: ThermoclineDepthData[] = [
  {
    id: 'td-tropical',
    name: 'Tropical Pacific',
    lat: 0,
    lng: -160,
    depth: 120,
    gradient: 8,
    sst: 28,
    trend: -3,
    stratification: 85,
    status: 'rapid_shallowing',
    description: 'Rapidly shallowing thermocline linked to ENSO dynamics',
  },
  {
    id: 'td-natlantic',
    name: 'N Atlantic',
    lat: 35,
    lng: -40,
    depth: 200,
    gradient: 5,
    sst: 20,
    trend: -1,
    stratification: 65,
    status: 'shallowing',
    description: 'Gradual shallowing due to ocean warming and increased stratification',
  },
  {
    id: 'td-indian',
    name: 'Indian Ocean',
    lat: -10,
    lng: 70,
    depth: 150,
    gradient: 6,
    sst: 26,
    trend: -2,
    stratification: 75,
    status: 'shallowing',
    description: 'Thermocline shallowing affecting monsoon and fisheries patterns',
  },
  {
    id: 'td-mediterranean',
    name: 'Mediterranean',
    lat: 36,
    lng: 18,
    depth: 80,
    gradient: 4,
    sst: 22,
    trend: 0,
    stratification: 70,
    status: 'stable',
    description: 'Relatively stable thermocline in semi-enclosed basin',
  },
  {
    id: 'td-satlantic',
    name: 'S Atlantic',
    lat: -20,
    lng: -20,
    depth: 250,
    gradient: 3,
    sst: 18,
    trend: 1,
    stratification: 50,
    status: 'deepening',
    description: 'Deepening thermocline in the South Atlantic gyre region',
  },
  {
    id: 'td-arctic',
    name: 'Arctic Ocean',
    lat: 80,
    lng: 0,
    depth: 30,
    gradient: 10,
    sst: 4,
    trend: -5,
    stratification: 90,
    status: 'eroded',
    description: 'Severely eroded thermocline from ice melt and freshwater input',
  },
]

const STATUS_CONFIG: Record<
  ThermoclineDepthData['status'],
  { label: string; color: string; bgClass: string }
> = {
  deepening: { label: 'Deepening', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  shallowing: { label: 'Shallowing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_shallowing: { label: 'Rapid Shallowing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  eroded: { label: 'Eroded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function ThermoclineDepthMonitor() {
  const state = useMapStore((s) => s.thermoclineDepth)
  const setState = useMapStore((s) => s.setThermoclineDepth)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all') {
        const regionMap: Record<string, string[]> = {
          tropical: ['td-tropical'],
          subtropical: ['td-natlantic', 'td-satlantic'],
          temperate: ['td-mediterranean', 'td-indian'],
          polar: ['td-arctic'],
        }
        if (!regionMap[state.regionFilter]?.includes(s.id)) return false
      }
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgDepth: 0, avgSST: 0, avgStratification: 0 }
    }
    const avgDepth =
      filteredStations.reduce((sum, s) => sum + s.depth, 0) / filteredStations.length
    const avgSST =
      filteredStations.reduce((sum, s) => sum + s.sst, 0) / filteredStations.length
    const avgStratification =
      filteredStations.reduce((sum, s) => sum + s.stratification, 0) / filteredStations.length
    return {
      avgDepth: Math.round(avgDepth),
      avgSST: Math.round(avgSST * 10) / 10,
      avgStratification: Math.round(avgStratification),
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ThermoclineDepthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: ArrowDownIcon2 },
    { key: 'showGradient', label: 'Gradient', icon: BarChart3 },
    { key: 'showSST', label: 'SST', icon: TrendingUp },
    { key: 'showTrend', label: 'Trend', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <ArrowDownIcon2 className="h-4 w-4 text-blue-400" />
              Thermocline Depth Monitor
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
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ocean Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as ThermoclineDepthState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="tropical">Tropical</SelectItem>
                <SelectItem value="subtropical">Subtropical</SelectItem>
                <SelectItem value="temperate">Temperate</SelectItem>
                <SelectItem value="polar">Polar</SelectItem>
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
              <div className="text-[10px] text-blue-400">Avg Depth</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgDepth}</div>
              <div className="text-[9px] text-blue-400">m</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg SST</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSST}°C</div>
              <div className="text-[9px] text-blue-400">surface</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Stratification</div>
              <div className="text-sm font-semibold text-blue-200">{summary.avgStratification}%</div>
              <div className="text-[9px] text-blue-400">index</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_CONFIG[station.status]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.depth} m
                            </span>
                          </div>
                        )}
                        {state.showGradient && (
                          <div>
                            Gradient:{' '}
                            <span className="text-blue-100 font-medium">
                              {station.gradient} °C/m
                            </span>
                          </div>
                        )}
                        {state.showSST && (
                          <div>
                            SST:{' '}
                            <span className="text-amber-400 font-medium">
                              {station.sst}°C
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className={station.trend < 0 ? 'text-orange-400 font-medium' : 'text-emerald-400 font-medium'}>
                              {station.trend > 0 ? '+' : ''}{station.trend} m/dec
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeStation.lat.toFixed(1)}, {activeStation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Depth: </span>
                    <span className="font-medium text-blue-200">{activeStation.depth} m</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Gradient: </span>
                    <span className="font-medium text-blue-200">{activeStation.gradient} °C/m</span>
                  </div>
                  <div>
                    <span className="text-blue-400">SST: </span>
                    <span className="font-medium text-amber-400">{activeStation.sst}°C</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Trend: </span>
                    <span className="font-medium text-orange-400">{activeStation.trend} m/decade</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Stratification: </span>
                    <span className="font-medium text-blue-200">{activeStation.stratification}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeStation.description}</span>
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
