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
import { useMapStore, type FrostHeaveMonitorState, type FrostHeaveMonitorData } from '@/lib/map-store'
import { ArrowUpFromLine as ArrowUpIcon3, X, Thermometer, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: FrostHeaveMonitorData[] = [
  {
    id: 'fh-fairbanks',
    name: 'Fairbanks Frost Heave',
    lat: 64.8378,
    lng: -147.7164,
    heaveAmount: 12.5,
    groundTemperature: -3,
    soilMoistureContent: 35,
    status: 'heaving',
    description: 'Active permafrost zone',
  },
  {
    id: 'fh-svalbard',
    name: 'Svalbard Frost Heave',
    lat: 78.2233,
    lng: 15.6267,
    heaveAmount: 5.2,
    groundTemperature: -12,
    soilMoistureContent: 20,
    status: 'frozen',
    description: 'Arctic ground monitoring',
  },
  {
    id: 'fh-yakutsk',
    name: 'Yakutsk Frost Zone',
    lat: 62.0355,
    lng: 129.6739,
    heaveAmount: 18.3,
    groundTemperature: 1,
    soilMoistureContent: 42,
    status: 'thawing',
    description: 'Extreme frost heave area',
  },
  {
    id: 'fh-churchill',
    name: 'Churchill Frost Line',
    lat: 58.7694,
    lng: -94.1472,
    heaveAmount: 3.1,
    groundTemperature: -6,
    soilMoistureContent: 28,
    status: 'stable',
    description: 'Subarctic frost monitoring',
  },
]

const STATUS_COLORS: Record<FrostHeaveMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  heaving: { label: 'Heaving', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  frozen: { label: 'Frozen', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  thawing: { label: 'Thawing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: FrostHeaveMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FrostHeaveMonitor() {
  const state = useMapStore((s) => s.frostHeaveMonitor)
  const setState = useMapStore((s) => s.setFrostHeaveMonitor)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredItems = useMemo(() => {
    return sites.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [sites, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, maxHeave: 0, avgGroundTemp: 0, heavingThawingCount: 0 }
    }
    const maxHeave = Math.max(...filteredItems.map((e) => e.heaveAmount))
    const avgGroundTemp = filteredItems.reduce((sum, e) => sum + e.groundTemperature, 0) / filteredItems.length
    const heavingThawingCount = filteredItems.filter((e) => e.status === 'heaving' || e.status === 'thawing').length
    return {
      totalSites: filteredItems.length,
      maxHeave,
      avgGroundTemp,
      heavingThawingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => sites.find((e) => e.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, heaveAmount: e.heaveAmount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setFrostHeaveMonitor({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FrostHeaveMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHeaveAmount', label: 'Heave Amount', icon: ArrowUpIcon3 },
    { key: 'showGroundTemperature', label: 'Ground Temperature', icon: Thermometer },
    { key: 'showSoilMoistureContent', label: 'Soil Moisture', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <ArrowUpIcon3 className="h-4 w-4 text-cyan-400" />
              Frost Heave Monitor
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as FrostHeaveMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="heaving">Heaving</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="thawing">Thawing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
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
              <div className="text-[10px] text-cyan-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSites}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Max Heave</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxHeave.toFixed(1)}</div>
              <div className="text-[9px] text-cyan-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Ground Temp</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgGroundTemp.toFixed(1)}</div>
              <div className="text-[9px] text-cyan-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Heaving+Thawing</div>
              <div className="text-sm font-semibold text-amber-400">{summary.heavingThawingCount}</div>
              <div className="text-[9px] text-cyan-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeSiteId === e.id
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
                        setState({ activeSiteId: isActive ? null : e.id })
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
                        {state.showHeaveAmount && (
                          <div>
                            Heave:{' '}
                            <span className="text-cyan-100 font-medium">{e.heaveAmount} cm</span>
                          </div>
                        )}
                        {state.showGroundTemperature && (
                          <div>
                            Ground Temp:{' '}
                            <span className="text-cyan-100 font-medium">{e.groundTemperature} °C</span>
                          </div>
                        )}
                        {state.showSoilMoistureContent && (
                          <div>
                            Soil Moisture:{' '}
                            <span className="text-cyan-100 font-medium">{e.soilMoistureContent}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
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
                    <span className="text-cyan-400/70">Heave Amount: </span>
                    <span className="font-medium text-red-400">{activeItem.heaveAmount} cm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Ground Temp: </span>
                    <span className="font-medium text-blue-400">{activeItem.groundTemperature} °C</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Soil Moisture: </span>
                    <span className="font-medium text-cyan-400">{activeItem.soilMoistureContent}%</span>
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
