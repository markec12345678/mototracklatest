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
import { useMapStore, type GeothermalEnergyState, type GeothermalEnergyData } from '@/lib/map-store'
import { Zap as ZapIcon2, X, Bolt, Thermometer, Droplets, BarChart3, MapPin, Filter } from 'lucide-react'

interface DemoPlant extends GeothermalEnergyData {
  plantType: 'dry_steam' | 'flash' | 'binary' | 'enhanced'
}

const DEMO_PLANTS: DemoPlant[] = [
  {
    id: 'ge-hellisheidi',
    name: 'Hellisheidi Iceland',
    lat: 64,
    lng: -21.4,
    output: 303,
    temperature: 180,
    flowRate: 85,
    efficiency: 92,
    reservoirDepth: 2000,
    status: 'optimal',
    description: 'High-efficiency combined heat and power plant in Iceland',
    plantType: 'flash',
  },
  {
    id: 'ge-geysers',
    name: 'The Geysers USA',
    lat: 38.8,
    lng: -122.8,
    output: 725,
    temperature: 175,
    flowRate: 120,
    efficiency: 88,
    reservoirDepth: 2500,
    status: 'good',
    description: 'Largest dry steam geothermal field in the world',
    plantType: 'dry_steam',
  },
  {
    id: 'ge-larderello',
    name: 'Larderello Italy',
    lat: 43.3,
    lng: 10.9,
    output: 595,
    temperature: 165,
    flowRate: 95,
    efficiency: 85,
    reservoirDepth: 3000,
    status: 'good',
    description: 'Historic geothermal field with dry steam technology',
    plantType: 'dry_steam',
  },
  {
    id: 'ge-cerroprieto',
    name: 'Cerro Prieto Mexico',
    lat: 32.4,
    lng: -115.2,
    output: 720,
    temperature: 155,
    flowRate: 110,
    efficiency: 78,
    reservoirDepth: 2800,
    status: 'moderate',
    description: 'Large flash steam plant with declining reservoir pressure',
    plantType: 'flash',
  },
  {
    id: 'ge-olkaria',
    name: 'Olkaria Kenya',
    lat: -0.9,
    lng: 36.3,
    output: 280,
    temperature: 145,
    flowRate: 70,
    efficiency: 75,
    reservoirDepth: 2200,
    status: 'moderate',
    description: 'East African Rift geothermal development with expansion plans',
    plantType: 'flash',
  },
  {
    id: 'ge-matsukawa',
    name: 'Matsukawa Japan',
    lat: 39.9,
    lng: 140.8,
    output: 23,
    temperature: 120,
    flowRate: 15,
    efficiency: 45,
    reservoirDepth: 1500,
    status: 'declining',
    description: 'Aging plant with reduced output and efficiency',
    plantType: 'binary',
  },
]

const STATUS_CONFIG: Record<
  GeothermalEnergyData['status'],
  { label: string; color: string; bgClass: string }
> = {
  optimal: { label: 'Optimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  declining: { label: 'Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  depleted: { label: 'Depleted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const PLANT_TYPE_LABELS: Record<DemoPlant['plantType'], string> = {
  dry_steam: 'Dry Steam',
  flash: 'Flash Steam',
  binary: 'Binary Cycle',
  enhanced: 'Enhanced (EGS)',
}

export function GeothermalEnergyMonitor() {
  const state = useMapStore((s) => s.geothermalEnergy)
  const setState = useMapStore((s) => s.setGeothermalEnergy)

  const plants = useMemo(
    () => (state.plants.length > 0 ? (state.plants as DemoPlant[]) : DEMO_PLANTS),
    [state.plants]
  )

  const filteredPlants = useMemo(() => {
    return plants.filter((p) => {
      if (state.typeFilter !== 'all' && p.plantType !== state.typeFilter) return false
      return true
    })
  }, [plants, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredPlants.length === 0) {
      return { totalOutput: 0, avgEfficiency: 0, optimalCount: 0 }
    }
    const totalOutput = filteredPlants.reduce((sum, p) => sum + p.output, 0)
    const avgEfficiency =
      filteredPlants.reduce((sum, p) => sum + p.efficiency, 0) / filteredPlants.length
    const optimalCount = filteredPlants.filter(
      (p) => p.status === 'optimal' || p.status === 'good'
    ).length
    return {
      totalOutput,
      avgEfficiency: Math.round(avgEfficiency),
      optimalCount,
    }
  }, [filteredPlants])

  const activePlant = useMemo(
    () => plants.find((p) => p.id === state.activePlantId) ?? null,
    [plants, state.activePlantId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeothermalEnergyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOutput', label: 'Output MW', icon: Bolt },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplets },
    { key: 'showEfficiency', label: 'Efficiency', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg shadow-orange-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <ZapIcon2 className="h-4 w-4 text-orange-400" />
              Geothermal Energy Monitor
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
          {/* Plant Type Filter */}
          <div>
            <Label className="text-xs text-orange-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Plant Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as GeothermalEnergyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dry_steam">Dry Steam</SelectItem>
                <SelectItem value="flash">Flash Steam</SelectItem>
                <SelectItem value="binary">Binary Cycle</SelectItem>
                <SelectItem value="enhanced">Enhanced (EGS)</SelectItem>
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
              <div className="text-[10px] text-orange-400">Total Output</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalOutput}</div>
              <div className="text-[9px] text-orange-400">MW</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Efficiency</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgEfficiency}</div>
              <div className="text-[9px] text-orange-400">%</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Optimal/Good</div>
              <div className="text-sm font-semibold text-sky-400">{summary.optimalCount}</div>
              <div className="text-[9px] text-orange-400">plants</div>
            </div>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Plant List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300">
              Geothermal Plants ({filteredPlants.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlants.map((plant) => {
                  const isActive = state.activePlantId === plant.id
                  const statusCfg = STATUS_CONFIG[plant.status]
                  return (
                    <div
                      key={plant.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/60 bg-orange-800/30'
                          : 'border-orange-800/30 hover:border-orange-600/40 hover:bg-orange-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activePlantId: isActive ? null : plant.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">{plant.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300">
                        {state.showOutput && (
                          <div>
                            Output:{' '}
                            <span className="text-orange-100 font-medium">
                              {plant.output} MW
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-orange-100 font-medium">
                              {plant.temperature}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-orange-100 font-medium">
                              {plant.flowRate} kg/s
                            </span>
                          </div>
                        )}
                        {state.showEfficiency && (
                          <div>
                            Efficiency:{' '}
                            <span className="text-orange-100 font-medium">
                              {plant.efficiency}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPlants.length === 0 && (
                  <div className="text-center text-xs text-orange-400 py-4">
                    No plants match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Plant Details */}
          {activePlant && (
            <>
              <Separator className="bg-orange-800/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activePlant.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activePlant.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activePlant.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activePlant.lat.toFixed(1)}, {activePlant.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400">Output: </span>
                    <span className="font-medium text-orange-200">{activePlant.output} MW</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Temperature: </span>
                    <span className="font-medium text-red-400">{activePlant.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Flow Rate: </span>
                    <span className="font-medium text-orange-200">{activePlant.flowRate} kg/s</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Efficiency: </span>
                    <span className="font-medium text-emerald-400">{activePlant.efficiency}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Reservoir Depth: </span>
                    <span className="font-medium text-orange-200">{activePlant.reservoirDepth.toLocaleString()} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Plant Type: </span>
                    <span className="font-medium text-orange-200">
                      {(activePlant as DemoPlant).plantType ? PLANT_TYPE_LABELS[(activePlant as DemoPlant).plantType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Description: </span>
                    <span className="font-medium text-orange-200">{activePlant.description}</span>
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
