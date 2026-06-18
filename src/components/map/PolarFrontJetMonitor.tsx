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
import { useMapStore, type PolarFrontJetState, type PolarFrontJetData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon14, X, Wind, Thermometer, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PolarFrontJetData[] = [
  {
    id: 'pfj-northatlantic',
    name: 'NA Polar Front Jet',
    lat: 55.0000,
    lng: -30.0000,
    jetSpeed: 75,
    frontalContrast: 12,
    baroclinicity: 8.5,
    status: 'intense',
    description: 'Intense polar front jet over North Atlantic',
  },
  {
    id: 'pfj-northpacific',
    name: 'NP Polar Front Jet',
    lat: 45.0000,
    lng: 170.0000,
    jetSpeed: 55,
    frontalContrast: 8,
    baroclinicity: 5.5,
    status: 'active',
    description: 'Active polar front over North Pacific',
  },
  {
    id: 'pfj-southerncircle',
    name: 'SH Polar Front',
    lat: -55.0000,
    lng: 0.0000,
    jetSpeed: 30,
    frontalContrast: 4,
    baroclinicity: 2.5,
    status: 'slack',
    description: 'Slack southern polar front jet',
  },
  {
    id: 'pfj-displaced',
    name: 'Displaced Polar Jet',
    lat: 65.0000,
    lng: 40.0000,
    jetSpeed: 40,
    frontalContrast: 6,
    baroclinicity: 3.0,
    status: 'displaced',
    description: 'Poleward-displaced polar front jet',
  },
]

const STATUS_COLORS: Record<PolarFrontJetData['status'], { label: string; color: string; bgClass: string }> = {
  intense: { label: 'Intense', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  slack: { label: 'Slack', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  displaced: { label: 'Displaced', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: PolarFrontJetData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PolarFrontJetMonitor() {
  const state = useMapStore((s) => s.polarFrontJet)
  const setState = useMapStore((s) => s.setPolarFrontJet)

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
      return { totalPaths: 0, avgJetSpeed: 0, avgFrontalContrast: 0, avgBaroclinicity: 0 }
    }
    const avgJetSpeed = filteredItems.reduce((sum, e) => sum + e.jetSpeed, 0) / filteredItems.length
    const avgFrontalContrast = filteredItems.reduce((sum, e) => sum + e.frontalContrast, 0) / filteredItems.length
    const avgBaroclinicity = filteredItems.reduce((sum, e) => sum + e.baroclinicity, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgJetSpeed: Math.round(avgJetSpeed * 100) / 100,
      avgFrontalContrast: Math.round(avgFrontalContrast * 100) / 100,
      avgBaroclinicity: Math.round(avgBaroclinicity * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, jetSpeed: e.jetSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPolarFrontJet({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PolarFrontJetState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showJetSpeed', label: 'Jet Speed', icon: Wind },
    { key: 'showFrontalContrast', label: 'Frontal Contrast', icon: Thermometer },
    { key: 'showBaroclinicity', label: 'Baroclinicity', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SnowflakeIcon14 className="h-4 w-4 text-cyan-400" />
              Polar Front Jet Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as PolarFrontJetState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="displaced">Displaced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
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

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Jets</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Jet Speed</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgJetSpeed}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Contrast</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgFrontalContrast}</div>
              <div className="text-[9px] text-slate-400/60">K</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Baroclinicity</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgBaroclinicity}</div>
              <div className="text-[9px] text-slate-400/60">K/100km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Jets ({filteredItems.length})
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
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showJetSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.jetSpeed} m/s</span>
                          </div>
                        )}
                        {state.showFrontalContrast && (
                          <div>
                            Contrast:{' '}
                            <span className="text-slate-100 font-medium">{e.frontalContrast} K</span>
                          </div>
                        )}
                        {state.showBaroclinicity && (
                          <div>
                            Baroclinic:{' '}
                            <span className="text-slate-100 font-medium">{e.baroclinicity} K/100km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No jets match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Jet Speed: </span>
                    <span className="font-medium text-cyan-400">{activeItem.jetSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Contrast: </span>
                    <span className="font-medium text-blue-400">{activeItem.frontalContrast} K</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Baroclinic: </span>
                    <span className="font-medium text-slate-400">{activeItem.baroclinicity} K/100km</span>
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
