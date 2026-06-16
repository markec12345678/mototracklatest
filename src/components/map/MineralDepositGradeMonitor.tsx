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
import { useMapStore, type MineralDepositGradeState, type MineralDepositGradeData } from '@/lib/map-store'
import { Mountain as MountainIcon16, X, Gauge, Gem, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MineralDepositGradeData[] = [
  {
    id: 'mdg-bingham',
    name: 'Bingham Canyon Deposit',
    lat: 40.5200,
    lng: -112.1500,
    depositTonnes: 3500,
    averageGrade: 0.55,
    containedMetal: 19250,
    status: 'giant',
    description: 'Giant porphyry copper deposit',
  },
  {
    id: 'mdg-escondida',
    name: 'Escondida Deposit',
    lat: -24.2700,
    lng: -69.0700,
    depositTonnes: 2800,
    averageGrade: 0.52,
    containedMetal: 14560,
    status: 'major',
    description: 'Major copper porphyry system',
  },
  {
    id: 'mdg-fre',
    name: 'Frezier Mine Deposit',
    lat: 45.8000,
    lng: 3.2000,
    depositTonnes: 80,
    averageGrade: 2.8,
    containedMetal: 2240,
    status: 'moderate',
    description: 'Moderate tungsten deposit',
  },
  {
    id: 'mdg-cornish',
    name: 'Cornish Tin Deposit',
    lat: 50.4000,
    lng: -5.0000,
    depositTonnes: 8,
    averageGrade: 1.2,
    containedMetal: 96,
    status: 'small',
    description: 'Small historic tin deposit',
  },
]

const STATUS_COLORS: Record<MineralDepositGradeData['status'], { label: string; color: string; bgClass: string }> = {
  giant: { label: 'Giant', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  major: { label: 'Major', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  small: { label: 'Small', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: MineralDepositGradeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MineralDepositGradeMonitor() {
  const state = useMapStore((s) => s.mineralDepositGrade)
  const setState = useMapStore((s) => s.setMineralDepositGrade)

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
      return { totalPaths: 0, avgDepositTonnes: 0, avgAverageGrade: 0, totalContainedMetal: 0 }
    }
    const avgDepositTonnes = filteredItems.reduce((sum, e) => sum + e.depositTonnes, 0) / filteredItems.length
    const avgAverageGrade = filteredItems.reduce((sum, e) => sum + e.averageGrade, 0) / filteredItems.length
    const totalContainedMetal = filteredItems.reduce((sum, e) => sum + e.containedMetal, 0)
    return {
      totalPaths: filteredItems.length,
      avgDepositTonnes: Math.round(avgDepositTonnes),
      avgAverageGrade: Math.round(avgAverageGrade * 100) / 100,
      totalContainedMetal: Math.round(totalContainedMetal),
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
      properties: { id: e.id, name: e.name, status: e.status, depositTonnes: e.depositTonnes },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMineralDepositGrade({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MineralDepositGradeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepositTonnes', label: 'Deposit Tonnes', icon: MountainIcon16 },
    { key: 'showAverageGrade', label: 'Average Grade', icon: Gauge },
    { key: 'showContainedMetal', label: 'Contained Metal', icon: Gem },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-zinc-950/95 to-slate-950/95 backdrop-blur-xl border border-zinc-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-100">
              <MountainIcon16 className="h-4 w-4 text-zinc-400" />
              Mineral Deposit Grade Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-zinc-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-zinc-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as MineralDepositGradeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-zinc-900/40 border-zinc-700/40 text-zinc-100 hover:bg-zinc-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="giant">Giant</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="small">Small</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                  <Icon className="h-3 w-3 text-zinc-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-zinc-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-zinc-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-zinc-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Avg Tonnes</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgDepositTonnes}</div>
              <div className="text-[9px] text-zinc-400/60">Mt</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Avg Grade</div>
              <div className="text-sm font-semibold text-zinc-400">{summary.avgAverageGrade}</div>
              <div className="text-[9px] text-zinc-400/60">%</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Total Metal</div>
              <div className="text-sm font-semibold text-green-400">{summary.totalContainedMetal}</div>
              <div className="text-[9px] text-zinc-400/60">kt</div>
            </div>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300/80">
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
                          ? 'border-zinc-500/50 bg-zinc-800/30'
                          : 'border-zinc-700/30 hover:border-zinc-500/30 hover:bg-zinc-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-zinc-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-zinc-300/60">
                        {state.showDepositTonnes && (
                          <div>
                            Tonnes:{' '}
                            <span className="text-zinc-100 font-medium">{e.depositTonnes} Mt</span>
                          </div>
                        )}
                        {state.showAverageGrade && (
                          <div>
                            Avg Grade:{' '}
                            <span className="text-zinc-100 font-medium">{e.averageGrade}%</span>
                          </div>
                        )}
                        {state.showContainedMetal && (
                          <div>
                            Contained Metal:{' '}
                            <span className="text-zinc-100 font-medium">{e.containedMetal} kt</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-zinc-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-zinc-700/30" />
              <div className="space-y-2 rounded-lg border border-zinc-600/30 bg-zinc-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-400/70">Coordinates: </span>
                    <span className="font-medium text-zinc-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Tonnes: </span>
                    <span className="font-medium text-slate-400">{activeItem.depositTonnes} Mt</span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Avg Grade: </span>
                    <span className="font-medium text-zinc-400">{activeItem.averageGrade}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Contained Metal: </span>
                    <span className="font-medium text-green-400">{activeItem.containedMetal} kt</span>
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
