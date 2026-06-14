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
import { useMapStore, type HydrothermalPlumeState, type HydrothermalPlumeData } from '@/lib/map-store'
import { Flame as FlameIcon9, X, BarChart3, MapPin, Filter, Thermometer, TrendingUp, Atom } from 'lucide-react'

const DEMO_VENTS: HydrothermalPlumeData[] = [
  {
    id: 'hp-tag',
    name: 'TAG Plume Mid-Atlantic',
    lat: 26.1,
    lng: -44.8,
    plumeHeight: 300,
    temperature: 50,
    chemical: 85,
    dispersion: 70,
    particleDensity: 4500,
    status: 'active',
    description: 'Trans-Atlantic Geotraverse hydrothermal plume on the Mid-Atlantic Ridge',
  },
  {
    id: 'hp-epr',
    name: "EPR 9°50'N",
    lat: 9.8,
    lng: -104.3,
    plumeHeight: 500,
    temperature: 80,
    chemical: 95,
    dispersion: 85,
    particleDensity: 8000,
    status: 'eruptive',
    description: 'East Pacific Rise fast-spreading ridge with intense hydrothermal activity',
  },
  {
    id: 'hp-lokis',
    name: "Loki's Castle",
    lat: 73.5,
    lng: 8,
    plumeHeight: 150,
    temperature: 30,
    chemical: 45,
    dispersion: 40,
    particleDensity: 1500,
    status: 'moderate',
    description: 'Arctic mid-ocean ridge vent field with moderate plume activity',
  },
  {
    id: 'hp-endeavour',
    name: 'Endeavour Segment',
    lat: 47.9,
    lng: -129.1,
    plumeHeight: 250,
    temperature: 40,
    chemical: 65,
    dispersion: 55,
    particleDensity: 3000,
    status: 'active',
    description: 'Juan de Fuca Ridge segment with active black smoker plumes',
  },
  {
    id: 'hp-lostcity',
    name: 'Lost City',
    lat: 30.1,
    lng: -42.1,
    plumeHeight: 100,
    temperature: 20,
    chemical: 35,
    dispersion: 30,
    particleDensity: 800,
    status: 'low',
    description: 'Off-axis serpentinite-hosted vent field with low-temperature plumes',
  },
  {
    id: 'hp-rodriguez',
    name: 'Rodriguez Triple Junction',
    lat: -22,
    lng: 69,
    plumeHeight: 50,
    temperature: 10,
    chemical: 15,
    dispersion: 15,
    particleDensity: 200,
    status: 'dormant',
    description: 'Indian Ocean triple junction with minimal hydrothermal activity',
  },
]

const STATUS_CONFIG: Record<
  HydrothermalPlumeData['status'],
  { label: string; color: string; bgClass: string }
> = {
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  active: { label: 'Active', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  eruptive: { label: 'Eruptive', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function HydrothermalPlumeMonitor() {
  const state = useMapStore((s) => s.hydrothermalPlume)
  const setState = useMapStore((s) => s.setHydrothermalPlume)

  const vents = useMemo(
    () => (state.vents.length > 0 ? state.vents : DEMO_VENTS),
    [state.vents]
  )

  const filteredVents = useMemo(() => {
    return vents.filter((v) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          black_smoker: ['hp-tag', 'hp-epr', 'hp-endeavour'],
          white_smoker: ['hp-lostcity'],
          diffuse: ['hp-lokis'],
          megaplume: ['hp-epr', 'hp-tag'],
        }
        if (!typeMap[state.typeFilter]?.includes(v.id)) return false
      }
      return true
    })
  }, [vents, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredVents.length === 0) {
      return { avgPlumeHeight: 0, avgTemperature: 0, avgChemical: 0 }
    }
    const avgPlumeHeight =
      filteredVents.reduce((sum, v) => sum + v.plumeHeight, 0) / filteredVents.length
    const avgTemperature =
      filteredVents.reduce((sum, v) => sum + v.temperature, 0) / filteredVents.length
    const avgChemical =
      filteredVents.reduce((sum, v) => sum + v.chemical, 0) / filteredVents.length
    return {
      avgPlumeHeight: Math.round(avgPlumeHeight),
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgChemical: Math.round(avgChemical),
    }
  }, [filteredVents])

  const activeVent = useMemo(
    () => vents.find((v) => v.id === state.activeVentId) ?? null,
    [vents, state.activeVentId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydrothermalPlumeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPlumeHeight', label: 'Plume Height', icon: BarChart3 },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showChemical', label: 'Chemical Signature', icon: Atom },
    { key: 'showDispersion', label: 'Dispersion', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg shadow-orange-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon9 className="h-4 w-4 text-orange-400" />
              Hydrothermal Plume Monitor
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-orange-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Vent Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as HydrothermalPlumeState['typeFilter'],
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
                <SelectItem value="megaplume">Megaplume</SelectItem>
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
              <div className="text-[10px] text-orange-400">Avg Plume Height</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgPlumeHeight}</div>
              <div className="text-[9px] text-orange-400">meters</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}°C</div>
              <div className="text-[9px] text-orange-400">plume</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Chemical</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgChemical}%</div>
              <div className="text-[9px] text-orange-400">signature</div>
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
                        {state.showPlumeHeight && (
                          <div>
                            Plume Height:{' '}
                            <span className="text-orange-100 font-medium">
                              {vent.plumeHeight} m
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-red-400 font-medium">
                              {vent.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showChemical && (
                          <div>
                            Chemical:{' '}
                            <span className="text-amber-400 font-medium">
                              {vent.chemical}%
                            </span>
                          </div>
                        )}
                        {state.showDispersion && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-orange-200 font-medium">
                              {vent.dispersion}%
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
                    <span className="text-orange-400">Plume Height: </span>
                    <span className="font-medium text-orange-200">{activeVent.plumeHeight} m</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Temperature: </span>
                    <span className="font-medium text-red-400">{activeVent.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Chemical: </span>
                    <span className="font-medium text-amber-400">{activeVent.chemical}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Dispersion: </span>
                    <span className="font-medium text-orange-200">{activeVent.dispersion}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Particle Density: </span>
                    <span className="font-medium text-orange-200">{activeVent.particleDensity} pts/m³</span>
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
