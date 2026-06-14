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
import { useMapStore, type EcosystemServiceValueState, type EcosystemServiceValueData } from '@/lib/map-store'
import { Gem as GemIcon2, X, BarChart3, MapPin, Filter, DollarSign, Leaf } from 'lucide-react'

const DEMO_ECOSYSTEMS: EcosystemServiceValueData[] = [
  {
    id: 'esv-amazon',
    name: 'Amazon Rainforest',
    lat: -3,
    lng: -60,
    carbonValue: 12000,
    waterValue: 8000,
    biodiversityValue: 15000,
    recreationValue: 2000,
    totalValue: 37000,
    status: 'intact',
    description: 'Largest tropical rainforest providing immense global ecosystem services',
  },
  {
    id: 'esv-reef',
    name: 'Great Barrier Reef',
    lat: -18,
    lng: 147,
    carbonValue: 2000,
    waterValue: 3000,
    biodiversityValue: 10000,
    recreationValue: 6000,
    totalValue: 21000,
    status: 'degraded',
    description: 'World largest coral reef system under bleaching and pollution stress',
  },
  {
    id: 'esv-congo',
    name: 'Congo Rainforest',
    lat: 0,
    lng: 23,
    carbonValue: 9000,
    waterValue: 6000,
    biodiversityValue: 12000,
    recreationValue: 500,
    totalValue: 27500,
    status: 'good',
    description: 'Second largest tropical forest with high biodiversity and carbon value',
  },
  {
    id: 'esv-everglades',
    name: 'Florida Everglades',
    lat: 26,
    lng: -81,
    carbonValue: 3000,
    waterValue: 7000,
    biodiversityValue: 5000,
    recreationValue: 4000,
    totalValue: 19000,
    status: 'degraded',
    description: 'Unique wetland ecosystem under pressure from development and pollution',
  },
  {
    id: 'esv-borneo',
    name: 'Borneo Peatlands',
    lat: 2,
    lng: 114,
    carbonValue: 8000,
    waterValue: 4000,
    biodiversityValue: 8000,
    recreationValue: 1000,
    totalValue: 21000,
    status: 'heavily_degraded',
    description: 'Carbon-rich peatlands severely damaged by deforestation and fires',
  },
  {
    id: 'esv-aral',
    name: 'Aral Sea',
    lat: 45,
    lng: 60,
    carbonValue: 100,
    waterValue: 200,
    biodiversityValue: 50,
    recreationValue: 10,
    totalValue: 360,
    status: 'lost',
    description: 'Formerly vast inland sea now largely desiccated with minimal ecosystem services',
  },
]

const STATUS_CONFIG: Record<
  EcosystemServiceValueData['status'],
  { label: string; color: string; bgClass: string }
> = {
  intact: { label: 'Intact', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  degraded: { label: 'Degraded', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  heavily_degraded: { label: 'Heavily Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  lost: { label: 'Lost', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function EcosystemServiceValueMonitor() {
  const state = useMapStore((s) => s.ecosystemServiceValue)
  const setState = useMapStore((s) => s.setEcosystemServiceValue)

  const ecosystems = useMemo(
    () => (state.ecosystems.length > 0 ? state.ecosystems : DEMO_ECOSYSTEMS),
    [state.ecosystems]
  )

  const filteredEcosystems = useMemo(() => {
    return ecosystems.filter((e) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          forest: ['esv-amazon', 'esv-congo'],
          wetland: ['esv-everglades', 'esv-borneo'],
          coral_reef: ['esv-reef'],
          grassland: ['esv-aral'],
        }
        if (!typeMap[state.typeFilter]?.includes(e.id)) return false
      }
      return true
    })
  }, [ecosystems, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredEcosystems.length === 0) {
      return { avgCarbonValue: 0, avgTotalValue: 0, avgBiodiversityValue: 0 }
    }
    const avgCarbonValue =
      filteredEcosystems.reduce((sum, e) => sum + e.carbonValue, 0) / filteredEcosystems.length
    const avgTotalValue =
      filteredEcosystems.reduce((sum, e) => sum + e.totalValue, 0) / filteredEcosystems.length
    const avgBiodiversityValue =
      filteredEcosystems.reduce((sum, e) => sum + e.biodiversityValue, 0) / filteredEcosystems.length
    return {
      avgCarbonValue: Math.round(avgCarbonValue),
      avgTotalValue: Math.round(avgTotalValue),
      avgBiodiversityValue: Math.round(avgBiodiversityValue),
    }
  }, [filteredEcosystems])

  const activeEcosystem = useMemo(
    () => ecosystems.find((e) => e.id === state.activeEcosystemId) ?? null,
    [ecosystems, state.activeEcosystemId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EcosystemServiceValueState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonValue', label: 'Carbon Value', icon: Leaf },
    { key: 'showWaterValue', label: 'Water Value', icon: DollarSign },
    { key: 'showBiodiversityValue', label: 'Biodiversity Value', icon: BarChart3 },
    { key: 'showRecreationValue', label: 'Recreation Value', icon: GemIcon2 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-emerald-950/80 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg shadow-emerald-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <GemIcon2 className="h-4 w-4 text-emerald-400" />
              Ecosystem Service Value Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-emerald-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ecosystem Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as EcosystemServiceValueState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
                <SelectItem value="coral_reef">Coral Reef</SelectItem>
                <SelectItem value="grassland">Grassland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Carbon</div>
              <div className="text-sm font-semibold text-emerald-300">${(summary.avgCarbonValue / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-emerald-400">$/ha/yr</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Total</div>
              <div className="text-sm font-semibold text-amber-400">${(summary.avgTotalValue / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-emerald-400">$/ha/yr</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-sky-400">${(summary.avgBiodiversityValue / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-emerald-400">value</div>
            </div>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Ecosystem List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">
              Ecosystems ({filteredEcosystems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEcosystems.map((ecosystem) => {
                  const isActive = state.activeEcosystemId === ecosystem.id
                  const statusCfg = STATUS_CONFIG[ecosystem.status]
                  return (
                    <div
                      key={ecosystem.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/60 bg-emerald-800/30'
                          : 'border-emerald-800/30 hover:border-emerald-600/40 hover:bg-emerald-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeEcosystemId: isActive ? null : ecosystem.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-emerald-100">{ecosystem.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300">
                        {state.showCarbonValue && (
                          <div>
                            Carbon Value:{' '}
                            <span className="text-emerald-200 font-medium">
                              ${ecosystem.carbonValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {state.showWaterValue && (
                          <div>
                            Water Value:{' '}
                            <span className="text-sky-400 font-medium">
                              ${ecosystem.waterValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {state.showBiodiversityValue && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-200 font-medium">
                              ${ecosystem.biodiversityValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {state.showRecreationValue && (
                          <div>
                            Recreation:{' '}
                            <span className="text-amber-400 font-medium">
                              ${ecosystem.recreationValue.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEcosystems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400 py-4">
                    No ecosystems match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Ecosystem Details */}
          {activeEcosystem && (
            <>
              <Separator className="bg-emerald-800/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeEcosystem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeEcosystem.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeEcosystem.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeEcosystem.lat.toFixed(1)}, {activeEcosystem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Carbon Value: </span>
                    <span className="font-medium text-emerald-200">${activeEcosystem.carbonValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Water Value: </span>
                    <span className="font-medium text-sky-400">${activeEcosystem.waterValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Biodiversity: </span>
                    <span className="font-medium text-emerald-200">${activeEcosystem.biodiversityValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Recreation: </span>
                    <span className="font-medium text-amber-400">${activeEcosystem.recreationValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Total Value: </span>
                    <span className="font-medium text-amber-300">${activeEcosystem.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400">Description: </span>
                    <span className="font-medium text-emerald-200">{activeEcosystem.description}</span>
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
