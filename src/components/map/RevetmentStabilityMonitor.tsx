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
import { useMapStore, type RevetmentStabilityState, type RevetmentStabilityData } from '@/lib/map-store'
import { Square as SquareIcon, X, Shield, ArrowDown, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: RevetmentStabilityData[] = [
  {
    id: 'rs-netherlands',
    name: 'Zeeland Revetment',
    lat: 51.5,
    lng: 3.9,
    armorIntegrity: 45,
    slopeDisplacement: 85,
    underpressure: 35,
    status: 'breached',
    description: 'Breached revetment section in Zeeland',
  },
  {
    id: 'rs-surrey',
    name: 'Surrey River Revetment',
    lat: 51.33,
    lng: -0.76,
    armorIntegrity: 62,
    slopeDisplacement: 42,
    underpressure: 18,
    status: 'shifting',
    description: 'Shifting armor layer on river bank',
  },
  {
    id: 'rs-gotland',
    name: 'Gotland Coastal Revetment',
    lat: 57.5,
    lng: 18.5,
    armorIntegrity: 78,
    slopeDisplacement: 12,
    underpressure: 8,
    status: 'settling',
    description: 'Settling revetment on Baltic coast',
  },
  {
    id: 'rs-dubai',
    name: 'Dubai Palm Revetment',
    lat: 25.11,
    lng: 55.14,
    armorIntegrity: 98,
    slopeDisplacement: 2,
    underpressure: 1,
    status: 'stable',
    description: 'Stable engineered revetment',
  },
]

const STATUS_COLORS: Record<RevetmentStabilityData['status'], { label: string; color: string; bgClass: string }> = {
  breached: { label: 'Breached', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  shifting: { label: 'Shifting', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  settling: { label: 'Settling', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: RevetmentStabilityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RevetmentStabilityMonitor() {
  const state = useMapStore((s) => s.revetmentStability)
  const setState = useMapStore((s) => s.setRevetmentStability)

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
      return { totalPaths: 0, avgArmorIntegrity: 0, avgSlopeDisplacement: 0, breachedShiftingCount: 0 }
    }
    const avgArmorIntegrity = filteredItems.reduce((sum, e) => sum + e.armorIntegrity, 0) / filteredItems.length
    const avgSlopeDisplacement = filteredItems.reduce((sum, e) => sum + e.slopeDisplacement, 0) / filteredItems.length
    const breachedShiftingCount = filteredItems.filter((e) => e.status === 'breached' || e.status === 'shifting').length
    return {
      totalPaths: filteredItems.length,
      avgArmorIntegrity: Math.round(avgArmorIntegrity * 10) / 10,
      avgSlopeDisplacement: Math.round(avgSlopeDisplacement * 10) / 10,
      breachedShiftingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, armorIntegrity: e.armorIntegrity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRevetmentStability({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RevetmentStabilityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArmorIntegrity', label: 'Armor Integrity', icon: Shield },
    { key: 'showSlopeDisplacement', label: 'Slope Displacement', icon: ArrowDown },
    { key: 'showUnderpressure', label: 'Underpressure', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-orange-950/95 backdrop-blur-xl border border-stone-700/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <SquareIcon className="h-4 w-4 text-orange-400" />
              Revetment Stability Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as RevetmentStabilityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="breached">Breached</SelectItem>
                <SelectItem value="shifting">Shifting</SelectItem>
                <SelectItem value="settling">Settling</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Revetments</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-stone-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Integrity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgArmorIntegrity}</div>
              <div className="text-[9px] text-stone-400/60">%</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Displacement</div>
              <div className="text-sm font-semibold text-stone-400">{summary.avgSlopeDisplacement}</div>
              <div className="text-[9px] text-stone-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Breached+Shifting</div>
              <div className="text-sm font-semibold text-red-400">{summary.breachedShiftingCount}</div>
              <div className="text-[9px] text-stone-400/60">structures</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Revetments ({filteredItems.length})
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
                          ? 'border-stone-500/50 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-stone-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showArmorIntegrity && (
                          <div>
                            Integrity:{' '}
                            <span className="text-stone-100 font-medium">{e.armorIntegrity}%</span>
                          </div>
                        )}
                        {state.showSlopeDisplacement && (
                          <div>
                            Displacement:{' '}
                            <span className="text-stone-100 font-medium">{e.slopeDisplacement} mm</span>
                          </div>
                        )}
                        {state.showUnderpressure && (
                          <div>
                            Underpressure:{' '}
                            <span className="text-stone-100 font-medium">{e.underpressure} kPa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No revetments match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Integrity: </span>
                    <span className="font-medium text-orange-400">{activeItem.armorIntegrity}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Displacement: </span>
                    <span className="font-medium text-stone-400">{activeItem.slopeDisplacement} mm</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Underpressure: </span>
                    <span className="font-medium text-red-400">{activeItem.underpressure} kPa</span>
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
