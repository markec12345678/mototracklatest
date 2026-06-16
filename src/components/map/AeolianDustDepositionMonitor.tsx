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
import { useMapStore, type AeolianDustDepositionState, type AeolianDustDepositionData } from '@/lib/map-store'
import { Wind as WindIcon12, X, CloudDownload as CloudDown, CircleDot, Route, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AeolianDustDepositionData[] = [
  {
    id: 'ad-sahara',
    name: 'Saharan Dust Outlet',
    lat: 23.0,
    lng: 12.0,
    depositionRate: 85,
    particleSize: 12,
    dustOrigin: 1500,
    status: 'heavy',
    description: 'Major Saharan dust emission',
  },
  {
    id: 'ad-gobi',
    name: 'Gobi Dust Source',
    lat: 42.0,
    lng: 105.0,
    depositionRate: 42,
    particleSize: 18,
    dustOrigin: 2500,
    status: 'moderate',
    description: 'Asian dust storm source',
  },
  {
    id: 'ad-patagonia',
    name: 'Patagonian Dust',
    lat: -48.0,
    lng: -68.0,
    depositionRate: 12,
    particleSize: 8,
    dustOrigin: 800,
    status: 'light',
    description: 'Southern dust source',
  },
  {
    id: 'ad-hawaii',
    name: 'Hawaiian Dust Sink',
    lat: 20.0,
    lng: -155.5,
    depositionRate: 5,
    particleSize: 4,
    dustOrigin: 12000,
    status: 'settled',
    description: 'Remote Pacific deposition',
  },
]

const STATUS_COLORS: Record<AeolianDustDepositionData['status'], { label: string; color: string; bgClass: string }> = {
  heavy: { label: 'Heavy', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  light: { label: 'Light', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  settled: { label: 'Settled', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: AeolianDustDepositionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AeolianDustDepositionMonitor() {
  const state = useMapStore((s) => s.aeolianDustDeposition)
  const setState = useMapStore((s) => s.setAeolianDustDeposition)

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
      return { totalSites: 0, avgDeposition: 0, avgParticle: 0, heavyModerateCount: 0 }
    }
    const avgDeposition = filteredItems.reduce((sum, e) => sum + e.depositionRate, 0) / filteredItems.length
    const avgParticle = filteredItems.reduce((sum, e) => sum + e.particleSize, 0) / filteredItems.length
    const heavyModerateCount = filteredItems.filter((e) => e.status === 'heavy' || e.status === 'moderate').length
    return {
      totalSites: filteredItems.length,
      avgDeposition: Math.round(avgDeposition * 10) / 10,
      avgParticle: Math.round(avgParticle * 10) / 10,
      heavyModerateCount,
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
      properties: { id: e.id, name: e.name, status: e.status, depositionRate: e.depositionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAeolianDustDeposition({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AeolianDustDepositionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepositionRate', label: 'Deposition Rate', icon: CloudDown },
    { key: 'showParticleSize', label: 'Particle Size', icon: CircleDot },
    { key: 'showDustOrigin', label: 'Dust Origin', icon: Route },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <WindIcon12 className="h-4 w-4 text-amber-400" />
              Aeolian Dust Deposition
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as AeolianDustDepositionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
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
              <div className="text-[10px] text-amber-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalSites}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Deposition</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgDeposition}</div>
              <div className="text-[9px] text-amber-400/60">g/m²/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Particle</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgParticle}</div>
              <div className="text-[9px] text-amber-400/60">μm</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Heavy+Moderate</div>
              <div className="text-sm font-semibold text-red-400">{summary.heavyModerateCount}</div>
              <div className="text-[9px] text-amber-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
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
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-amber-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showDepositionRate && (
                          <div>
                            Deposition:{' '}
                            <span className="text-amber-100 font-medium">{e.depositionRate} g/m²/yr</span>
                          </div>
                        )}
                        {state.showParticleSize && (
                          <div>
                            Particle:{' '}
                            <span className="text-amber-100 font-medium">{e.particleSize} μm</span>
                          </div>
                        )}
                        {state.showDustOrigin && (
                          <div>
                            Origin:{' '}
                            <span className="text-amber-100 font-medium">{e.dustOrigin.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Deposition: </span>
                    <span className="font-medium text-orange-400">{activeItem.depositionRate} g/m²/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Particle Size: </span>
                    <span className="font-medium text-yellow-400">{activeItem.particleSize} μm</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Dust Origin: </span>
                    <span className="font-medium text-amber-400">{activeItem.dustOrigin.toLocaleString()} km</span>
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
