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
import { useMapStore, type SupervolcanoData, type SupervolcanoState } from '@/lib/map-store'
import { Flame as FlameIcon3, X, Circle, AlertTriangle, MapPin, Filter, Activity } from 'lucide-react'

const DEMO_VOLCANOES: SupervolcanoData[] = [
  {
    id: 'sv-yellowstone',
    name: 'Yellowstone',
    lat: 44.43,
    lng: -110.67,
    calderaDiameter: 72,
    magmaChamberDepth: 8,
    groundDeformation: 2.4,
    thermalAnomaly: 85,
    lastEruption: '640,000 years ago',
    vei: 8,
    status: 'unrest',
    description: 'Wyoming, USA - Largest volcanic system in North America',
  },
  {
    id: 'sv-campi-flegrei',
    name: 'Campi Flegrei',
    lat: 40.83,
    lng: 14.14,
    calderaDiameter: 13,
    magmaChamberDepth: 4,
    groundDeformation: 8.5,
    thermalAnomaly: 72,
    lastEruption: '1538 AD',
    vei: 7,
    status: 'elevated',
    description: 'Naples, Italy - Active caldera near populated area',
  },
  {
    id: 'sv-toba',
    name: 'Toba',
    lat: 2.68,
    lng: 98.86,
    calderaDiameter: 100,
    magmaChamberDepth: 12,
    groundDeformation: 0.3,
    thermalAnomaly: 35,
    lastEruption: '74,000 years ago',
    vei: 8,
    status: 'dormant',
    description: 'Sumatra, Indonesia - Largest volcanic lake on Earth',
  },
  {
    id: 'sv-taupo',
    name: 'Taupo',
    lat: -38.78,
    lng: 176.0,
    calderaDiameter: 35,
    magmaChamberDepth: 6,
    groundDeformation: 1.1,
    thermalAnomaly: 48,
    lastEruption: '26,500 years ago',
    vei: 7,
    status: 'dormant',
    description: 'North Island, New Zealand - Oruanui eruption site',
  },
  {
    id: 'sv-long-valley',
    name: 'Long Valley',
    lat: 37.7,
    lng: -118.87,
    calderaDiameter: 22,
    magmaChamberDepth: 5,
    groundDeformation: 3.2,
    thermalAnomaly: 62,
    lastEruption: '760,000 years ago',
    vei: 7,
    status: 'unrest',
    description: 'California, USA - Active magmatic system',
  },
  {
    id: 'sv-valles-caldera',
    name: 'Valles Caldera',
    lat: 35.87,
    lng: -106.57,
    calderaDiameter: 22,
    magmaChamberDepth: 7,
    groundDeformation: 0.5,
    thermalAnomaly: 28,
    lastEruption: '1.25 million years ago',
    vei: 7,
    status: 'dormant',
    description: 'New Mexico, USA - Resurgent dome complex',
  },
]

const STATUS_CONFIG: Record<
  SupervolcanoData['status'],
  { label: string; color: string; bgClass: string }
> = {
  dormant: { label: 'Dormant', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  unrest: { label: 'Unrest', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SupervolcanoMonitor() {
  const state = useMapStore((s) => s.supervolcano)
  const setState = useMapStore((s) => s.setSupervolcano)

  const volcanoes = useMemo(
    () => (state.volcanoes.length > 0 ? state.volcanoes : DEMO_VOLCANOES),
    [state.volcanoes]
  )

  const filteredVolcanoes = useMemo(() => {
    return volcanoes.filter((v) => {
      if (state.statusFilter !== 'all' && v.status !== state.statusFilter) return false
      return true
    })
  }, [volcanoes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredVolcanoes.length === 0) {
      return { avgGroundDeformation: 0, avgThermalAnomaly: 0, activeCount: 0 }
    }
    const avgGroundDeformation =
      filteredVolcanoes.reduce((sum, v) => sum + v.groundDeformation, 0) / filteredVolcanoes.length
    const avgThermalAnomaly =
      filteredVolcanoes.reduce((sum, v) => sum + v.thermalAnomaly, 0) / filteredVolcanoes.length
    const activeCount = filteredVolcanoes.filter(
      (v) => v.status === 'unrest' || v.status === 'elevated'
    ).length
    return {
      avgGroundDeformation: Math.round(avgGroundDeformation * 10) / 10,
      avgThermalAnomaly: Math.round(avgThermalAnomaly * 10) / 10,
      activeCount,
    }
  }, [filteredVolcanoes])

  const activeVolcano = useMemo(
    () => volcanoes.find((v) => v.id === state.activeVolcanoId) ?? null,
    [volcanoes, state.activeVolcanoId]
  )

  useEffect(() => {
    if (state.volcanoes.length === 0) {
      useMapStore.getState().setSupervolcano({ volcanoes: DEMO_VOLCANOES })
    }
  }, [])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SupervolcanoState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCaldera', label: 'Caldera Diameter', icon: Circle },
    { key: 'showMagmaChamber', label: 'Magma Chamber Depth', icon: Activity },
    { key: 'showGroundDeformation', label: 'Ground Deformation', icon: AlertTriangle },
    { key: 'showThermalAnomaly', label: 'Thermal Anomaly', icon: FlameIcon3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon3 className="h-4 w-4 text-orange-400" />
              Supervolcano Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-200 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status Filter
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({
                  statusFilter: v as SupervolcanoState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-800/30 text-orange-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="unrest">Unrest</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-100">
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

          <Separator className="bg-red-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Deformation</div>
              <div className="text-sm font-semibold text-orange-100">{summary.avgGroundDeformation}</div>
              <div className="text-[9px] text-orange-300/60">cm/yr</div>
            </div>
            <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Avg Thermal</div>
              <div className="text-sm font-semibold text-orange-100">{summary.avgThermalAnomaly}%</div>
              <div className="text-[9px] text-orange-300/60">anomaly</div>
            </div>
            <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-2 text-center">
              <div className="text-[10px] text-orange-300/70">Active</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.activeCount}</div>
              <div className="text-[9px] text-orange-300/60">unrest/elevated</div>
            </div>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Volcano List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Supervolcanoes ({filteredVolcanoes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredVolcanoes.map((volcano) => {
                  const isActive = state.activeVolcanoId === volcano.id
                  const statusCfg = STATUS_CONFIG[volcano.status]
                  return (
                    <div
                      key={volcano.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/10'
                          : 'border-red-800/30 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeVolcanoId: isActive ? null : volcano.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">{volcano.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/70">
                        {state.showCaldera && (
                          <div>
                            Caldera:{' '}
                            <span className="text-orange-100 font-medium">
                              {volcano.calderaDiameter} km
                            </span>
                          </div>
                        )}
                        {state.showMagmaChamber && (
                          <div>
                            Magma Depth:{' '}
                            <span className="text-orange-100 font-medium">
                              {volcano.magmaChamberDepth} km
                            </span>
                          </div>
                        )}
                        {state.showGroundDeformation && (
                          <div>
                            Deformation:{' '}
                            <span className="text-orange-100 font-medium">
                              {volcano.groundDeformation} cm/yr
                            </span>
                          </div>
                        )}
                        {state.showThermalAnomaly && (
                          <div>
                            Thermal:{' '}
                            <span className="text-orange-100 font-medium">
                              {volcano.thermalAnomaly}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVolcanoes.length === 0 && (
                  <div className="text-center text-xs text-orange-300/60 py-4">
                    No volcanoes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Volcano Details */}
          {activeVolcano && (
            <>
              <Separator className="bg-red-800/30" />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeVolcano.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeVolcano.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeVolcano.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/70">{activeVolcano.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-orange-300/80">
                  <div>
                    <span className="text-orange-300/50">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeVolcano.lat.toFixed(2)}, {activeVolcano.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-300/50">VEI: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.vei}</span>
                  </div>
                  <div>
                    <span className="text-orange-300/50">Caldera: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.calderaDiameter} km</span>
                  </div>
                  <div>
                    <span className="text-orange-300/50">Magma Depth: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.magmaChamberDepth} km</span>
                  </div>
                  <div>
                    <span className="text-orange-300/50">Deformation: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.groundDeformation} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-orange-300/50">Thermal: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.thermalAnomaly}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-300/50">Last Eruption: </span>
                    <span className="font-medium text-orange-100">{activeVolcano.lastEruption}</span>
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
