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
import { useMapStore, type VolcanicDeformationState, type VolcanicDeformationData } from '@/lib/map-store'
import { Move as MoveIcon, X, ArrowUp, ArrowRight, RotateCcw, Activity, MapPin, Filter } from 'lucide-react'

interface DemoVolcano extends VolcanicDeformationData {
  deformationType: 'inflation' | 'deflation' | 'complex' | 'stable'
}

const DEMO_VOLCANOES: DemoVolcano[] = [
  {
    id: 'vd-sierra-negra',
    name: 'Sierra Negra',
    lat: -0.8,
    lng: -91.2,
    uplift: 8.5,
    horizontal: 3.2,
    tilt: 45,
    strainRate: 2.8,
    magmaDepth: 3,
    status: 'inflating',
    description: 'Rapidly inflating shield volcano in the Galápagos Islands',
    deformationType: 'inflation',
  },
  {
    id: 'vd-kilauea',
    name: 'Kilauea',
    lat: 19.4,
    lng: -155.3,
    uplift: -2.5,
    horizontal: -1.5,
    tilt: -20,
    strainRate: 1.2,
    magmaDepth: 1,
    status: 'deflating',
    description: 'Deflating summit following recent eruption in Hawaii',
    deformationType: 'deflation',
  },
  {
    id: 'vd-campi-flegrei',
    name: 'Campi Flegrei',
    lat: 40.8,
    lng: 14.1,
    uplift: 12.5,
    horizontal: 5.0,
    tilt: 80,
    strainRate: 4.5,
    magmaDepth: 4,
    status: 'inflating',
    description: 'Highly active caldera near Naples showing significant uplift',
    deformationType: 'inflation',
  },
  {
    id: 'vd-eyjafjallajokull',
    name: 'Eyjafjallajökull',
    lat: 63.6,
    lng: -19.6,
    uplift: 0.5,
    horizontal: 0.2,
    tilt: 5,
    strainRate: 0.1,
    magmaDepth: 8,
    status: 'stable',
    description: 'Icelandic volcano currently in a stable deformation state',
    deformationType: 'stable',
  },
  {
    id: 'vd-sakurajima',
    name: 'Sakurajima',
    lat: 31.6,
    lng: 130.7,
    uplift: 4.0,
    horizontal: 2.0,
    tilt: 35,
    strainRate: 1.8,
    magmaDepth: 2,
    status: 'erupting',
    description: 'Active stratovolcano in Japan with ongoing eruptive activity',
    deformationType: 'inflation',
  },
  {
    id: 'vd-long-valley',
    name: 'Long Valley',
    lat: 37.6,
    lng: -118.9,
    uplift: 3.0,
    horizontal: 1.5,
    tilt: 25,
    strainRate: 0.8,
    magmaDepth: 6,
    status: 'complex',
    description: 'California caldera with complex deformation patterns',
    deformationType: 'complex',
  },
]

const STATUS_CONFIG: Record<
  VolcanicDeformationData['status'],
  { label: string; color: string; bgClass: string }
> = {
  inflating: { label: 'Inflating', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  deflating: { label: 'Deflating', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  complex: { label: 'Complex', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  stable: { label: 'Stable', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  erupting: { label: 'Erupting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const DEFORMATION_TYPE_LABELS: Record<DemoVolcano['deformationType'], string> = {
  inflation: 'Inflation',
  deflation: 'Deflation',
  complex: 'Complex',
  stable: 'Stable',
}

export function VolcanicDeformationMonitor() {
  const state = useMapStore((s) => s.volcanicDeformation)
  const setState = useMapStore((s) => s.setVolcanicDeformation)

  const volcanoes = useMemo(
    () => (state.volcanoes.length > 0 ? (state.volcanoes as DemoVolcano[]) : DEMO_VOLCANOES),
    [state.volcanoes]
  )

  const filteredVolcanoes = useMemo(() => {
    return volcanoes.filter((v) => {
      if (state.typeFilter !== 'all' && v.deformationType !== state.typeFilter) return false
      return true
    })
  }, [volcanoes, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredVolcanoes.length === 0) {
      return { avgUplift: 0, avgStrainRate: 0, inflatingEruptingCount: 0 }
    }
    const avgUplift =
      filteredVolcanoes.reduce((sum, v) => sum + v.uplift, 0) / filteredVolcanoes.length
    const avgStrainRate =
      filteredVolcanoes.reduce((sum, v) => sum + v.strainRate, 0) / filteredVolcanoes.length
    const inflatingEruptingCount = filteredVolcanoes.filter(
      (v) => v.status === 'inflating' || v.status === 'erupting'
    ).length
    return {
      avgUplift: Math.round(avgUplift * 10) / 10,
      avgStrainRate: Math.round(avgStrainRate * 100) / 100,
      inflatingEruptingCount,
    }
  }, [filteredVolcanoes])

  const activeVolcano = useMemo(
    () => volcanoes.find((v) => v.id === state.activeVolcanoId) ?? null,
    [volcanoes, state.activeVolcanoId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicDeformationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showUplift', label: 'Uplift', icon: ArrowUp },
    { key: 'showHorizontal', label: 'Horizontal', icon: ArrowRight },
    { key: 'showTilt', label: 'Tilt', icon: RotateCcw },
    { key: 'showStrainRate', label: 'Strain Rate', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-stone-900/95 backdrop-blur-xl border border-stone-700/40 rounded-xl shadow-lg shadow-stone-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <MoveIcon className="h-4 w-4 text-stone-400" />
              Volcanic Deformation Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Deformation Type Filter */}
          <div>
            <Label className="text-xs text-stone-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Deformation Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as VolcanicDeformationState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inflation">Inflation</SelectItem>
                <SelectItem value="deflation">Deflation</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Uplift</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgUplift}</div>
              <div className="text-[9px] text-stone-400">cm</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Strain</div>
              <div className="text-sm font-semibold text-stone-300">{summary.avgStrainRate}</div>
              <div className="text-[9px] text-stone-400">μstrain/yr</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Active</div>
              <div className="text-sm font-semibold text-stone-200">{summary.inflatingEruptingCount}</div>
              <div className="text-[9px] text-stone-400">volcanoes</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Volcano List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">
              Volcanic Deformation ({filteredVolcanoes.length})
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
                          ? 'border-stone-500/60 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-600/40 hover:bg-stone-900/20'
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
                          <span className="text-xs font-medium text-stone-100">{volcano.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300">
                        {state.showUplift && (
                          <div>
                            Uplift:{' '}
                            <span className="text-stone-100 font-medium">
                              {volcano.uplift} cm
                            </span>
                          </div>
                        )}
                        {state.showHorizontal && (
                          <div>
                            Horiz:{' '}
                            <span className="text-stone-100 font-medium">
                              {volcano.horizontal} cm
                            </span>
                          </div>
                        )}
                        {state.showTilt && (
                          <div>
                            Tilt:{' '}
                            <span className="text-stone-100 font-medium">
                              {volcano.tilt} μrad
                            </span>
                          </div>
                        )}
                        {state.showStrainRate && (
                          <div>
                            Strain:{' '}
                            <span className="text-stone-100 font-medium">
                              {volcano.strainRate} μstrain/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVolcanoes.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    No volcanoes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Volcano Details */}
          {activeVolcano && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeVolcano.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeVolcano.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeVolcano.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeVolcano.lat.toFixed(1)}, {activeVolcano.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">Uplift: </span>
                    <span className="font-medium text-amber-400">{activeVolcano.uplift} cm</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Horizontal: </span>
                    <span className="font-medium text-stone-200">{activeVolcano.horizontal} cm</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Tilt: </span>
                    <span className="font-medium text-stone-200">{activeVolcano.tilt} μrad</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Strain Rate: </span>
                    <span className="font-medium text-stone-200">{activeVolcano.strainRate} μstrain/yr</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Magma Depth: </span>
                    <span className="font-medium text-stone-200">{activeVolcano.magmaDepth} km</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Deformation Type: </span>
                    <span className="font-medium text-stone-200">
                      {(activeVolcano as DemoVolcano).deformationType ? DEFORMATION_TYPE_LABELS[(activeVolcano as DemoVolcano).deformationType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Description: </span>
                    <span className="font-medium text-stone-200">{activeVolcano.description}</span>
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
