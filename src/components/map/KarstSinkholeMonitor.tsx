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
import { useMapStore, type KarstSinkholeState, type KarstSinkholeData } from '@/lib/map-store'
import { Triangle as TriangleIcon3, X, Layers, Activity, Droplets, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: KarstSinkholeData[] = [
  {
    id: 'ks-florida',
    name: 'Florida Sinkhole',
    lat: 28.5,
    lng: -81.8,
    depth: 45,
    diameter: 120,
    subsidenceRate: 2.1,
    waterTableDepth: 8,
    risk: 'high',
    description: 'Active sinkhole zone in Floridan karst terrain',
  },
  {
    id: 'ks-slovenia',
    name: 'Slovenian Karst',
    lat: 45.8,
    lng: 14.2,
    depth: 30,
    diameter: 80,
    subsidenceRate: 0.8,
    waterTableDepth: 15,
    risk: 'moderate',
    description: 'Classical karst region with moderate subsidence',
  },
  {
    id: 'ks-yucatan',
    name: 'Yucatan Cenote',
    lat: 20.5,
    lng: -87.7,
    depth: 60,
    diameter: 50,
    subsidenceRate: 1.5,
    waterTableDepth: 5,
    risk: 'moderate',
    description: 'Cenote network with shallow water table',
  },
  {
    id: 'ks-guangxi',
    name: 'Guangxi Collapse',
    lat: 23.8,
    lng: 108.3,
    depth: 80,
    diameter: 200,
    subsidenceRate: 3.2,
    waterTableDepth: 12,
    risk: 'critical',
    description: 'Large-scale karst collapse with rapid subsidence',
  },
]

const STATUS_COLORS: Record<KarstSinkholeData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ risk }: { risk: KarstSinkholeData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function KarstSinkholeMonitor() {
  const state = useMapStore((s) => s.karstSinkhole)
  const setState = useMapStore((s) => s.setKarstSinkhole)

  const sinkholes = useMemo(
    () => (state.sinkholes.length > 0 ? state.sinkholes : SAMPLE_LOCATIONS),
    [state.sinkholes]
  )

  const filteredSinkholes = useMemo(() => {
    return sinkholes.filter((s) => {
      if (state.riskFilter !== 'all' && s.risk !== state.riskFilter) return false
      return true
    })
  }, [sinkholes, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredSinkholes.length === 0) {
      return { avgDepth: 0, totalSinkholes: 0, avgSubsidence: 0, avgWaterTable: 0 }
    }
    const avgDepth = filteredSinkholes.reduce((sum, s) => sum + s.depth, 0) / filteredSinkholes.length
    const avgSubsidence = filteredSinkholes.reduce((sum, s) => sum + s.subsidenceRate, 0) / filteredSinkholes.length
    const avgWaterTable = filteredSinkholes.reduce((sum, s) => sum + s.waterTableDepth, 0) / filteredSinkholes.length
    return {
      avgDepth: Math.round(avgDepth * 10) / 10,
      totalSinkholes: filteredSinkholes.length,
      avgSubsidence: Math.round(avgSubsidence * 10) / 10,
      avgWaterTable: Math.round(avgWaterTable * 10) / 10,
    }
  }, [filteredSinkholes])

  const activeSinkhole = useMemo(
    () => sinkholes.find((s) => s.id === state.activeSinkholeId) ?? null,
    [sinkholes, state.activeSinkholeId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredSinkholes.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, risk: s.risk, depth: s.depth },
    })),
  }), [filteredSinkholes])

  useEffect(() => {
    if (state.sinkholes.length === 0) {
      useMapStore.getState().setKarstSinkhole({ sinkholes: SAMPLE_LOCATIONS })
    }
  }, [state.sinkholes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KarstSinkholeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Layers },
    { key: 'showRisk', label: 'Risk Level', icon: AlertTriangle },
    { key: 'showSubsidence', label: 'Subsidence Rate', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-stone-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <TriangleIcon3 className="h-4 w-4 text-amber-400" />
              Karst Sinkhole Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as KarstSinkholeState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Average Depth</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgDepth}</div>
              <div className="text-[9px] text-amber-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Sinkholes</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalSinkholes}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Subsidence Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSubsidence}</div>
              <div className="text-[9px] text-amber-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Water Table</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgWaterTable}</div>
              <div className="text-[9px] text-amber-400/60">meters</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Sinkhole List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Sinkholes ({filteredSinkholes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSinkholes.map((sinkhole) => {
                  const isActive = state.activeSinkholeId === sinkhole.id
                  const statusCfg = STATUS_COLORS[sinkhole.risk]
                  return (
                    <div
                      key={sinkhole.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSinkholeId: isActive ? null : sinkhole.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={sinkhole.risk} />
                          <span className="text-xs font-medium text-amber-100">{sinkhole.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-amber-100 font-medium">{sinkhole.depth}m</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Diameter:{' '}
                            <span className="text-amber-100 font-medium">{sinkhole.diameter}m</span>
                          </div>
                        )}
                        {state.showSubsidence && (
                          <div>
                            Subsidence:{' '}
                            <span className="text-amber-100 font-medium">{sinkhole.subsidenceRate}mm/yr</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Water Table:{' '}
                            <span className="text-amber-100 font-medium">{sinkhole.waterTableDepth}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSinkholes.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No sinkholes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Sinkhole Details */}
          {activeSinkhole && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeSinkhole.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeSinkhole.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeSinkhole.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeSinkhole.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeSinkhole.lat.toFixed(1)}, {activeSinkhole.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Depth: </span>
                    <span className="font-medium text-amber-100">{activeSinkhole.depth}m</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Diameter: </span>
                    <span className="font-medium text-amber-100">{activeSinkhole.diameter}m</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Subsidence: </span>
                    <span className="font-medium text-orange-400">{activeSinkhole.subsidenceRate}mm/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Water Table: </span>
                    <span className="font-medium text-amber-100">{activeSinkhole.waterTableDepth}m</span>
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
