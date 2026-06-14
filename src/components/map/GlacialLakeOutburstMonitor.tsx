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
import { useMapStore, type GlacialLakeOutburstState, type GlacialLakeOutburstData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon, X, Droplets, Shield, Waves, MapPin, Filter } from 'lucide-react'

const DEMO_LAKES: GlacialLakeOutburstData[] = [
  {
    id: 'glo-1', name: 'Imja Tsho Nepal', lat: 27.9, lng: 87, waterLevel: 92, damStability: 25, floodPotential: 85, downstreamRisk: 90, lakeArea: 1.2, status: 'imminent', description: 'Rapidly growing glacial lake near Everest with high GLOF risk',
  },
  {
    id: 'glo-2', name: 'Tsho Rolpa Nepal', lat: 27.8, lng: 86.5, waterLevel: 85, damStability: 35, floodPotential: 70, downstreamRisk: 75, lakeArea: 1.5, status: 'very_high', description: 'One of the largest glacial lakes in Nepal with controlled drainage',
  },
  {
    id: 'glo-3', name: 'Lake Palcacocha Peru', lat: -9.4, lng: -77.4, waterLevel: 78, damStability: 40, floodPotential: 60, downstreamRisk: 80, lakeArea: 0.9, status: 'high', description: 'Glacial lake above Huaraz city with history of outburst floods',
  },
  {
    id: 'glo-4', name: 'Merzbacher Lake Kyrgyzstan', lat: 42, lng: 80, waterLevel: 65, damStability: 55, floodPotential: 45, downstreamRisk: 50, lakeArea: 3.5, status: 'moderate', description: 'Ice-dammed lake with periodic outburst floods in Tien Shan',
  },
  {
    id: 'glo-5', name: 'Jökulhlaup Iceland', lat: 64, lng: -17, waterLevel: 88, damStability: 30, floodPotential: 75, downstreamRisk: 65, lakeArea: 10, status: 'very_high', description: 'Subglacial lake beneath Vatnajökull with cyclic jökulhlaup events',
  },
  {
    id: 'glo-6', name: 'Thorthormi Bhutan', lat: 27.9, lng: 89.6, waterLevel: 70, damStability: 45, floodPotential: 55, downstreamRisk: 60, lakeArea: 0.6, status: 'high', description: 'Lowering dam stability in Lunana region of Bhutan Himalaya',
  },
]

const STATUS_CONFIG: Record<GlacialLakeOutburstData['status'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  very_high: { label: 'Very High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  imminent: { label: 'Imminent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GlacialLakeOutburstMonitor() {
  const state = useMapStore((s) => s.glacialLakeOutburst)
  const setState = useMapStore((s) => s.setGlacialLakeOutburst)

  const lakes = useMemo(
    () => (state.lakes.length > 0 ? state.lakes : DEMO_LAKES),
    [state.lakes]
  )

  const filteredLakes = useMemo(() => {
    return lakes.filter((l) => {
      if (state.riskFilter !== 'all' && l.status !== state.riskFilter) return false
      return true
    })
  }, [lakes, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredLakes.length === 0) {
      return { avgWaterLevel: 0, avgDamStability: 0, imminentCount: 0 }
    }
    const avgWaterLevel = filteredLakes.reduce((sum, l) => sum + l.waterLevel, 0) / filteredLakes.length
    const avgDamStability = filteredLakes.reduce((sum, l) => sum + l.damStability, 0) / filteredLakes.length
    const imminentCount = filteredLakes.filter((l) => l.status === 'imminent' || l.status === 'very_high').length
    return {
      avgWaterLevel: Math.round(avgWaterLevel * 10) / 10,
      avgDamStability: Math.round(avgDamStability * 10) / 10,
      imminentCount,
    }
  }, [filteredLakes])

  const activeLake = useMemo(
    () => lakes.find((l) => l.id === state.activeLakeId) ?? null,
    [lakes, state.activeLakeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GlacialLakeOutburstState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterLevel', label: 'Water Level', icon: Droplets },
    { key: 'showDamStability', label: 'Dam Stability', icon: Shield },
    { key: 'showFloodPotential', label: 'Flood Potential', icon: Waves },
    { key: 'showDownstreamRisk', label: 'Downstream Risk', icon: AlertTriangleIcon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <AlertTriangleIcon className="h-4 w-4 text-blue-400" />
              Glacial Lake Outburst Monitor
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
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as GlacialLakeOutburstState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
                <SelectItem value="imminent">Imminent</SelectItem>
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
              <div className="text-[10px] text-blue-400">Avg Water Level</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgWaterLevel}</div>
              <div className="text-[9px] text-blue-400">%</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Dam Stability</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgDamStability}</div>
              <div className="text-[9px] text-blue-400">%</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.imminentCount}</div>
              <div className="text-[9px] text-blue-400">lakes</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Lake List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Glacial Lakes ({filteredLakes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredLakes.map((lake) => {
                  const isActive = state.activeLakeId === lake.id
                  const statusCfg = STATUS_CONFIG[lake.status]
                  return (
                    <div
                      key={lake.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeLakeId: isActive ? null : lake.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{lake.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showWaterLevel && (
                          <div>
                            Water: <span className="text-blue-100 font-medium">{lake.waterLevel}%</span>
                          </div>
                        )}
                        {state.showDamStability && (
                          <div>
                            Dam: <span className="text-blue-100 font-medium">{lake.damStability}%</span>
                          </div>
                        )}
                        {state.showFloodPotential && (
                          <div>
                            Flood: <span className="text-blue-100 font-medium">{lake.floodPotential}%</span>
                          </div>
                        )}
                        {state.showDownstreamRisk && (
                          <div>
                            Risk: <span className="text-blue-100 font-medium">{lake.downstreamRisk}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredLakes.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No lakes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Lake Details */}
          {activeLake && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeLake.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeLake.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeLake.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeLake.lat.toFixed(1)}, {activeLake.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Water Level: </span>
                    <span className="font-medium text-indigo-300">{activeLake.waterLevel}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Dam Stability: </span>
                    <span className="font-medium text-blue-200">{activeLake.damStability}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Flood Potential: </span>
                    <span className="font-medium text-blue-200">{activeLake.floodPotential}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Downstream Risk: </span>
                    <span className="font-medium text-red-400">{activeLake.downstreamRisk}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Lake Area: </span>
                    <span className="font-medium text-blue-200">{activeLake.lakeArea} km&sup2;</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeLake.description}</span>
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
