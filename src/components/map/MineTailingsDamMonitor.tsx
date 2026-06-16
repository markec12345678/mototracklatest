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
import { useMapStore, type MineTailingsDamState, type MineTailingsDamData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon4, X, Mountain, Droplets, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MineTailingsDamData[] = [
  {
    id: 'mtd-brumadinho',
    name: 'Brumadinho Dam',
    lat: -20.0700,
    lng: -44.1200,
    damHeight: 86,
    storageVolume: 12.8,
    phreaticLevel: 72,
    status: 'critical',
    description: 'Failed tailings dam - critical monitoring',
  },
  {
    id: 'mtd-bhp',
    name: 'BHP Escondida Dam',
    lat: -24.2700,
    lng: -69.0700,
    damHeight: 65,
    storageVolume: 8.5,
    phreaticLevel: 48,
    status: 'elevated',
    description: 'Elevated phreatic surface detected',
  },
  {
    id: 'mtd-fort',
    name: 'Fort Knox Tailings',
    lat: 64.9600,
    lng: -147.6200,
    damHeight: 42,
    storageVolume: 3.2,
    phreaticLevel: 28,
    status: 'normal',
    description: 'Normal operations tailings facility',
  },
  {
    id: 'mtd-ritting',
    name: 'Ritting Dam Sweden',
    lat: 64.6000,
    lng: 18.2000,
    damHeight: 25,
    storageVolume: 1.5,
    phreaticLevel: 12,
    status: 'draining',
    description: 'Controlled drainage in progress',
  },
]

const STATUS_COLORS: Record<MineTailingsDamData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  draining: { label: 'Draining', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: MineTailingsDamData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MineTailingsDamMonitor() {
  const state = useMapStore((s) => s.mineTailingsDam)
  const setState = useMapStore((s) => s.setMineTailingsDam)

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
      return { totalPaths: 0, avgDamHeight: 0, avgStorageVolume: 0, criticalElevatedCount: 0 }
    }
    const avgDamHeight = filteredItems.reduce((sum, e) => sum + e.damHeight, 0) / filteredItems.length
    const avgStorageVolume = filteredItems.reduce((sum, e) => sum + e.storageVolume, 0) / filteredItems.length
    const criticalElevatedCount = filteredItems.filter((e) => e.status === 'critical' || e.status === 'elevated').length
    return {
      totalPaths: filteredItems.length,
      avgDamHeight: Math.round(avgDamHeight * 10) / 10,
      avgStorageVolume: Math.round(avgStorageVolume * 10) / 10,
      criticalElevatedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, damHeight: e.damHeight },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMineTailingsDam({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MineTailingsDamState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDamHeight', label: 'Dam Height', icon: Mountain },
    { key: 'showStorageVolume', label: 'Storage Volume', icon: Droplets },
    { key: 'showPhreaticLevel', label: 'Phreatic Level', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <AlertTriangleIcon4 className="h-4 w-4 text-red-400" />
              Mine Tailings Dam Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as MineTailingsDamState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="draining">Draining</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Dam Height</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgDamHeight}</div>
              <div className="text-[9px] text-red-400/60">m</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Storage</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgStorageVolume}</div>
              <div className="text-[9px] text-red-400/60">Mm3</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Critical+Elevated</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalElevatedCount}</div>
              <div className="text-[9px] text-red-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Sites ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showDamHeight && (
                          <div>
                            Dam Height:{' '}
                            <span className="text-red-100 font-medium">{e.damHeight} m</span>
                          </div>
                        )}
                        {state.showStorageVolume && (
                          <div>
                            Storage:{' '}
                            <span className="text-red-100 font-medium">{e.storageVolume} Mm3</span>
                          </div>
                        )}
                        {state.showPhreaticLevel && (
                          <div>
                            Phreatic:{' '}
                            <span className="text-red-100 font-medium">{e.phreaticLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Dam Height: </span>
                    <span className="font-medium text-orange-400">{activeItem.damHeight} m</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Storage: </span>
                    <span className="font-medium text-red-400">{activeItem.storageVolume} Mm3</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Phreatic: </span>
                    <span className="font-medium text-yellow-400">{activeItem.phreaticLevel}%</span>
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
