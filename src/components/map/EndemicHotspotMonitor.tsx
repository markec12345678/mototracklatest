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
import { useMapStore, type EndemicHotspotState, type EndemicHotspotData } from '@/lib/map-store'
import { Sparkles as SparklesIcon8, X, Bird, AlertTriangle, Shield, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: EndemicHotspotData[] = [
  {
    id: 'eh-madagascar',
    name: 'Madagascar',
    lat: -19.0000,
    lng: 47.0000,
    endemicSpeciesCount: 12000,
    threatLevel: 8,
    protectionCoverage: 12,
    status: 'threatened',
    description: '90% endemic species under threat',
  },
  {
    id: 'eh-galapagos',
    name: 'Galapagos Islands',
    lat: -0.5000,
    lng: -91.0000,
    endemicSpeciesCount: 5500,
    threatLevel: 5,
    protectionCoverage: 85,
    status: 'protected',
    description: 'Well-protected volcanic archipelago',
  },
  {
    id: 'eh-celebes',
    name: 'Sulawesi',
    lat: -2.0000,
    lng: 121.0000,
    endemicSpeciesCount: 3200,
    threatLevel: 7,
    protectionCoverage: 22,
    status: 'vulnerable',
    description: 'Vulnerable island biodiversity hotspot',
  },
  {
    id: 'eh-newcaledonia',
    name: 'New Caledonia',
    lat: -22.0000,
    lng: 166.0000,
    endemicSpeciesCount: 1800,
    threatLevel: 9,
    protectionCoverage: 8,
    status: 'critical',
    description: 'Mining threatens ultra-endemic flora',
  },
]

const STATUS_COLORS: Record<EndemicHotspotData['status'], { label: string; color: string; bgClass: string }> = {
  protected: { label: 'Protected', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  vulnerable: { label: 'Vulnerable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  threatened: { label: 'Threatened', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: EndemicHotspotData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function EndemicHotspotMonitor() {
  const state = useMapStore((s) => s.endemicHotspot)
  const setState = useMapStore((s) => s.setEndemicHotspot)

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
      return { totalPaths: 0, avgEndemicSpeciesCount: 0, avgThreatLevel: 0, avgProtectionCoverage: 0 }
    }
    const avgEndemicSpeciesCount = filteredItems.reduce((sum, e) => sum + e.endemicSpeciesCount, 0) / filteredItems.length
    const avgThreatLevel = filteredItems.reduce((sum, e) => sum + e.threatLevel, 0) / filteredItems.length
    const avgProtectionCoverage = filteredItems.reduce((sum, e) => sum + e.protectionCoverage, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgEndemicSpeciesCount: Math.round(avgEndemicSpeciesCount * 100) / 100,
      avgThreatLevel: Math.round(avgThreatLevel * 100) / 100,
      avgProtectionCoverage: Math.round(avgProtectionCoverage * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, endemicSpeciesCount: e.endemicSpeciesCount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setEndemicHotspot({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EndemicHotspotState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showEndemicSpeciesCount', label: 'Bird', icon: Bird },
    { key: 'showThreatLevel', label: 'AlertTriangle', icon: AlertTriangle },
    { key: 'showProtectionCoverage', label: 'Shield', icon: Shield },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SparklesIcon8 className="h-4 w-4 text-amber-400" />
              Endemic Hotspot Monitor
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
                setState({ statusFilter: v as EndemicHotspotState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="protected">Protected</SelectItem>
                <SelectItem value="vulnerable">Vulnerable</SelectItem>
                <SelectItem value="threatened">Threatened</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Hotspots</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Endemic</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgEndemicSpeciesCount}</div>
              <div className="text-[9px] text-slate-400/60">species</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Threat</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgThreatLevel}</div>
              <div className="text-[9px] text-slate-400/60">level</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Protection</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgProtectionCoverage}%</div>
              <div className="text-[9px] text-slate-400/60">coverage</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Hotspots ({filteredItems.length})
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
                        {state.showEndemicSpeciesCount && (
                          <div>
                            Endemic:{' '}
                            <span className="text-slate-100 font-medium">{e.endemicSpeciesCount.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showThreatLevel && (
                          <div>
                            Threat:{' '}
                            <span className="text-slate-100 font-medium">{e.threatLevel}/10</span>
                          </div>
                        )}
                        {state.showProtectionCoverage && (
                          <div>
                            Protection:{' '}
                            <span className="text-slate-100 font-medium">{e.protectionCoverage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No hotspots match the current filter.
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
                    <span className="text-slate-400/70">Endemic: </span>
                    <span className="font-medium text-amber-400">{activeItem.endemicSpeciesCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Threat: </span>
                    <span className="font-medium text-yellow-400">{activeItem.threatLevel}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Protection: </span>
                    <span className="font-medium text-slate-400">{activeItem.protectionCoverage}%</span>
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
