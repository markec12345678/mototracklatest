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
import { useMapStore, type OceanGyreState, type OceanGyreData } from '@/lib/map-store'
import { RotateCcw as RotateCcwIcon2, X, Clock, Ruler, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: OceanGyreData[] = [
  {
    id: 'og-northatlantic',
    name: 'North Atlantic Subtropical',
    lat: 30.0000,
    lng: -50.0000,
    rotationPeriod: 365,
    diameter: 6000,
    eddyKineticEnergy: 250,
    status: 'energetic',
    description: 'Energetic subtropical gyre',
  },
  {
    id: 'og-northpacific',
    name: 'North Pacific Gyre',
    lat: 30.0000,
    lng: -150.0000,
    rotationPeriod: 400,
    diameter: 7000,
    eddyKineticEnergy: 120,
    status: 'stable',
    description: 'Stable North Pacific gyre',
  },
  {
    id: 'og-southatlantic',
    name: 'South Atlantic Gyre',
    lat: -30.0000,
    lng: -15.0000,
    rotationPeriod: 350,
    diameter: 5000,
    eddyKineticEnergy: 60,
    status: 'shrinking',
    description: 'Shrinking subtropical gyre',
  },
  {
    id: 'og-indian',
    name: 'Indian Ocean Gyre',
    lat: -25.0000,
    lng: 75.0000,
    rotationPeriod: 300,
    diameter: 4500,
    eddyKineticEnergy: 180,
    status: 'expanding',
    description: 'Expanding monsoon-driven gyre',
  },
]

const STATUS_COLORS: Record<OceanGyreData['status'], { label: string; color: string; bgClass: string }> = {
  energetic: { label: 'Energetic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  shrinking: { label: 'Shrinking', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  expanding: { label: 'Expanding', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: OceanGyreData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OceanGyreMonitor() {
  const state = useMapStore((s) => s.oceanGyre)
  const setState = useMapStore((s) => s.setOceanGyre)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPaths: 0, avgRotationPeriod: 0, avgDiameter: 0, avgEddyKineticEnergy: 0 }
    }
    const avgRotationPeriod = filteredItems.reduce((sum, e) => sum + e.rotationPeriod, 0) / filteredItems.length
    const avgDiameter = filteredItems.reduce((sum, e) => sum + e.diameter, 0) / filteredItems.length
    const avgEddyKineticEnergy = filteredItems.reduce((sum, e) => sum + e.eddyKineticEnergy, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgRotationPeriod: Math.round(avgRotationPeriod),
      avgDiameter: Math.round(avgDiameter),
      avgEddyKineticEnergy: Math.round(avgEddyKineticEnergy),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, rotationPeriod: e.rotationPeriod },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setOceanGyre({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanGyreState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRotationPeriod', label: 'Rotation Period', icon: Clock },
    { key: 'showDiameter', label: 'Diameter', icon: Ruler },
    { key: 'showEddyKineticEnergy', label: 'Eddy Energy', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-sky-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <RotateCcwIcon2 className="h-4 w-4 text-cyan-400" />
              Ocean Gyre Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as OceanGyreState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="shrinking">Shrinking</SelectItem>
                <SelectItem value="expanding">Expanding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Gyres</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Rotation</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgRotationPeriod}</div>
              <div className="text-[9px] text-cyan-400/60">days</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Diameter</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgDiameter}</div>
              <div className="text-[9px] text-cyan-400/60">km</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg EKE</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgEddyKineticEnergy}</div>
              <div className="text-[9px] text-cyan-400/60">cm2/s2</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Gyres ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-cyan-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showRotationPeriod && (
                          <div>
                            Rotation:{' '}
                            <span className="text-cyan-100 font-medium">{e.rotationPeriod} days</span>
                          </div>
                        )}
                        {state.showDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-cyan-100 font-medium">{e.diameter} km</span>
                          </div>
                        )}
                        {state.showEddyKineticEnergy && (
                          <div>
                            EKE:{' '}
                            <span className="text-cyan-100 font-medium">{e.eddyKineticEnergy} cm2/s2</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No gyres match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Rotation: </span>
                    <span className="font-medium text-sky-400">{activeItem.rotationPeriod} days</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Diameter: </span>
                    <span className="font-medium text-cyan-400">{activeItem.diameter} km</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">EKE: </span>
                    <span className="font-medium text-blue-400">{activeItem.eddyKineticEnergy} cm2/s2</span>
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
