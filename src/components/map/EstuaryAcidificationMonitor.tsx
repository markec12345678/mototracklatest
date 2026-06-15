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
import { useMapStore, type EstuaryAcidificationState, type EstuaryAcidificationData } from '@/lib/map-store'
import { Droplets as DropletsIcon11, X, Thermometer, Beaker, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: EstuaryAcidificationData[] = [
  {
    id: 'ea-chesapeake',
    name: 'Chesapeake Bay',
    lat: 37.5,
    lng: -76.3,
    pH: 7.8,
    alkalinity: 1.6,
    salinity: 15,
    status: 'moderate',
    description: 'Declining pH trends in eutrophic estuary',
  },
  {
    id: 'ea-othello',
    name: 'Oyster Bay Estuary',
    lat: 40.7,
    lng: -73.5,
    pH: 7.5,
    alkalinity: 1.2,
    salinity: 22,
    status: 'acidified',
    description: 'Acidified urban estuary near NYC',
  },
  {
    id: 'ea-shark',
    name: 'Shark Bay Estuary',
    lat: -25.9,
    lng: 113.5,
    pH: 8.1,
    alkalinity: 2.4,
    salinity: 40,
    status: 'healthy',
    description: 'Pristine hypersaline estuary in Western Australia',
  },
  {
    id: 'ea-pearl',
    name: 'Pearl River Delta',
    lat: 22.2,
    lng: 113.6,
    pH: 7.2,
    alkalinity: 0.8,
    salinity: 8,
    status: 'critical',
    description: 'Severely acidified estuary from industrial discharge',
  },
]

const STATUS_COLORS: Record<EstuaryAcidificationData['status'], { label: string; color: string; bgClass: string }> = {
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  acidified: { label: 'Acidified', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: EstuaryAcidificationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function EstuaryAcidificationMonitor() {
  const state = useMapStore((s) => s.estuaryAcidification)
  const setState = useMapStore((s) => s.setEstuaryAcidification)

  const estuaries = useMemo(
    () => (state.estuaries.length > 0 ? state.estuaries : SAMPLE_LOCATIONS),
    [state.estuaries]
  )

  const filteredItems = useMemo(() => {
    return estuaries.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [estuaries, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalEstuaries: 0, avgPH: 0, avgAlkalinity: 0, criticalCount: 0 }
    }
    const avgPH = filteredItems.reduce((sum, e) => sum + e.pH, 0) / filteredItems.length
    const avgAlkalinity = filteredItems.reduce((sum, e) => sum + e.alkalinity, 0) / filteredItems.length
    const criticalCount = filteredItems.filter((e) => e.status === 'critical').length
    return {
      totalEstuaries: filteredItems.length,
      avgPH: Math.round(avgPH * 100) / 100,
      avgAlkalinity: Math.round(avgAlkalinity * 100) / 100,
      criticalCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => estuaries.find((e) => e.id === state.activeEstuaryId) ?? null,
    [estuaries, state.activeEstuaryId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, pH: e.pH },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.estuaries.length === 0) {
      useMapStore.getState().setEstuaryAcidification({ estuaries: SAMPLE_LOCATIONS })
    }
  }, [state.estuaries.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EstuaryAcidificationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPH', label: 'pH Level', icon: Thermometer },
    { key: 'showAlkalinity', label: 'Alkalinity', icon: Beaker },
    { key: 'showSalinity', label: 'Salinity', icon: Waves },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-pink-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <DropletsIcon11 className="h-4 w-4 text-rose-400" />
              Estuary Acidification Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as EstuaryAcidificationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="acidified">Acidified</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Total Estuaries</div>
              <div className="text-sm font-semibold text-rose-200">{summary.totalEstuaries}</div>
              <div className="text-[9px] text-rose-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg pH</div>
              <div className="text-sm font-semibold text-pink-400">{summary.avgPH}</div>
              <div className="text-[9px] text-rose-400/60">level</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Alkalinity</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgAlkalinity}</div>
              <div className="text-[9px] text-rose-400/60">mmol/L</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Critical Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-rose-400/60">estuaries</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Estuary List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
              Estuaries ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeEstuaryId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEstuaryId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-rose-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showPH && (
                          <div>
                            pH:{' '}
                            <span className="text-rose-100 font-medium">{e.pH}</span>
                          </div>
                        )}
                        {state.showAlkalinity && (
                          <div>
                            Alkalinity:{' '}
                            <span className="text-rose-100 font-medium">{e.alkalinity} mmol/L</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-rose-100 font-medium">{e.salinity} PSU</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No estuaries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Estuary Details */}
          {activeItem && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">pH: </span>
                    <span className="font-medium text-pink-400">{activeItem.pH}</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Alkalinity: </span>
                    <span className="font-medium text-amber-400">{activeItem.alkalinity} mmol/L</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Salinity: </span>
                    <span className="font-medium text-cyan-400">{activeItem.salinity} PSU</span>
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
