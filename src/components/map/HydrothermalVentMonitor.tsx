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
import { useMapStore, type HydrothermalVentState, type HydrothermalVentData } from '@/lib/map-store'
import { Flame as FlameIcon6, X, Thermometer, Droplets, Gem, Bug, MapPin, Filter } from 'lucide-react'

interface DemoVent extends HydrothermalVentData {
  ventType: 'black_smoker' | 'white_smoker' | 'diffuse' | 'shallow'
}

const DEMO_VENTS: DemoVent[] = [
  {
    id: 'hvm-tag',
    name: 'TAG Mid-Atlantic',
    lat: 26.1,
    lng: -44.8,
    temperature: 380,
    flowRate: 5.2,
    mineralDeposit: 85,
    biodiversity: 72,
    depth: 3625,
    status: 'active',
    description: 'High-temperature black smoker on the Mid-Atlantic Ridge',
    ventType: 'black_smoker',
  },
  {
    id: 'hvm-endeavour',
    name: 'Endeavour Pacific',
    lat: 47.9,
    lng: -129.1,
    temperature: 340,
    flowRate: 3.8,
    mineralDeposit: 78,
    biodiversity: 65,
    depth: 2200,
    status: 'active',
    description: 'Active vent field on the Juan de Fuca Ridge',
    ventType: 'black_smoker',
  },
  {
    id: 'hvm-loki',
    name: "Loki's Castle Arctic",
    lat: 73.5,
    lng: 8.0,
    temperature: 315,
    flowRate: 2.1,
    mineralDeposit: 55,
    biodiversity: 45,
    depth: 2350,
    status: 'waning',
    description: 'Arctic vent field with unique microorganism communities',
    ventType: 'black_smoker',
  },
  {
    id: 'hvm-lostcity',
    name: 'Lost City Atlantic',
    lat: 30.1,
    lng: -42.1,
    temperature: 90,
    flowRate: 1.2,
    mineralDeposit: 92,
    biodiversity: 82,
    depth: 800,
    status: 'active',
    description: 'Low-temperature alkaline vent field with carbonate chimneys',
    ventType: 'white_smoker',
  },
  {
    id: 'hvm-brothers',
    name: 'Brothers Volcano',
    lat: -34.9,
    lng: 179.0,
    temperature: 290,
    flowRate: 4.5,
    mineralDeposit: 68,
    biodiversity: 58,
    depth: 1850,
    status: 'eruptive',
    description: 'Submarine volcano with ongoing eruptive activity',
    ventType: 'diffuse',
  },
  {
    id: 'hvm-snakepit',
    name: 'Snake Pit Mid-Atlantic',
    lat: 23.2,
    lng: -44.9,
    temperature: 350,
    flowRate: 3.2,
    mineralDeposit: 72,
    biodiversity: 48,
    depth: 3480,
    status: 'dormant',
    description: 'Dormant vent field on the Mid-Atlantic Ridge',
    ventType: 'shallow',
  },
]

const STATUS_CONFIG: Record<
  HydrothermalVentData['status'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  waning: { label: 'Waning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  dormant: { label: 'Dormant', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  eruptive: { label: 'Eruptive', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  extinct: { label: 'Extinct', color: '#1e293b', bgClass: 'bg-slate-800/10 text-slate-800 border-slate-800/30' },
}

const VENT_TYPE_LABELS: Record<DemoVent['ventType'], string> = {
  black_smoker: 'Black Smoker',
  white_smoker: 'White Smoker',
  diffuse: 'Diffuse Flow',
  shallow: 'Shallow Vent',
}

export function HydrothermalVentMonitor() {
  const state = useMapStore((s) => s.hydrothermalVent)
  const setState = useMapStore((s) => s.setHydrothermalVent)

  const vents = useMemo(
    () => (state.vents.length > 0 ? (state.vents as DemoVent[]) : DEMO_VENTS),
    [state.vents]
  )

  const filteredVents = useMemo(() => {
    return vents.filter((v) => {
      if (state.typeFilter !== 'all' && v.ventType !== state.typeFilter) return false
      return true
    })
  }, [vents, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredVents.length === 0) {
      return { avgTemperature: 0, avgFlowRate: 0, activeEruptiveCount: 0 }
    }
    const avgTemperature =
      filteredVents.reduce((sum, v) => sum + v.temperature, 0) / filteredVents.length
    const avgFlowRate =
      filteredVents.reduce((sum, v) => sum + v.flowRate, 0) / filteredVents.length
    const activeEruptiveCount = filteredVents.filter(
      (v) => v.status === 'active' || v.status === 'eruptive'
    ).length
    return {
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgFlowRate: Math.round(avgFlowRate * 100) / 100,
      activeEruptiveCount,
    }
  }, [filteredVents])

  const activeVent = useMemo(
    () => vents.find((v) => v.id === state.activeVentId) ?? null,
    [vents, state.activeVentId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydrothermalVentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplets },
    { key: 'showMineralDeposit', label: 'Mineral Deposit', icon: Gem },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Bug },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg shadow-orange-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon6 className="h-4 w-4 text-orange-400" />
              Hydrothermal Vent Monitor
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
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Vent Type Filter */}
          <div>
            <Label className="text-xs text-orange-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Vent Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as HydrothermalVentState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="black_smoker">Black Smoker</SelectItem>
                <SelectItem value="white_smoker">White Smoker</SelectItem>
                <SelectItem value="diffuse">Diffuse Flow</SelectItem>
                <SelectItem value="shallow">Shallow Vent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Temp</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-orange-400">&deg;C</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-orange-400">L/s</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Active/Eruptive</div>
              <div className="text-sm font-semibold text-orange-200">{summary.activeEruptiveCount}</div>
              <div className="text-[9px] text-orange-400">vents</div>
            </div>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Vent List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300">
              Hydrothermal Vents ({filteredVents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredVents.map((vent) => {
                  const isActive = state.activeVentId === vent.id
                  const statusCfg = STATUS_CONFIG[vent.status]
                  return (
                    <div
                      key={vent.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/60 bg-orange-800/30'
                          : 'border-orange-800/30 hover:border-orange-600/40 hover:bg-orange-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeVentId: isActive ? null : vent.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">{vent.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300">
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-orange-100 font-medium">
                              {vent.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-orange-100 font-medium">
                              {vent.flowRate} L/s
                            </span>
                          </div>
                        )}
                        {state.showMineralDeposit && (
                          <div>
                            Mineral:{' '}
                            <span className="text-orange-100 font-medium">
                              {vent.mineralDeposit}%
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-orange-100 font-medium">
                              {vent.biodiversity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVents.length === 0 && (
                  <div className="text-center text-xs text-orange-400 py-4">
                    No vents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Vent Details */}
          {activeVent && (
            <>
              <Separator className="bg-orange-800/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeVent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeVent.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeVent.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeVent.lat.toFixed(1)}, {activeVent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400">Temperature: </span>
                    <span className="font-medium text-red-400">{activeVent.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Flow Rate: </span>
                    <span className="font-medium text-orange-200">{activeVent.flowRate} L/s</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Depth: </span>
                    <span className="font-medium text-orange-200">{activeVent.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Mineral Deposit: </span>
                    <span className="font-medium text-orange-200">{activeVent.mineralDeposit}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Biodiversity: </span>
                    <span className="font-medium text-orange-200">{activeVent.biodiversity}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Vent Type: </span>
                    <span className="font-medium text-orange-200">
                      {(activeVent as DemoVent).ventType ? VENT_TYPE_LABELS[(activeVent as DemoVent).ventType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Description: </span>
                    <span className="font-medium text-orange-200">{activeVent.description}</span>
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
