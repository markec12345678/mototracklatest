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
import { useMapStore, type SaltFlatCrustState, type SaltFlatCrustData } from '@/lib/map-store'
import { Layers as LayersIcon6, X, Ruler, Droplets, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SaltFlatCrustData[] = [
  {
    id: 'sf-uyuni',
    name: 'Salar de Uyuni Crust',
    lat: -20.1338,
    lng: -67.4891,
    crustThickness: 15,
    salinity: 320,
    moistureContent: 2.1,
    status: 'crystalline',
    description: "World's largest salt flat",
  },
  {
    id: 'sf-bonneville',
    name: 'Bonneville Salt Flats',
    lat: 40.75,
    lng: -113.8667,
    crustThickness: 8,
    salinity: 280,
    moistureContent: 5.5,
    status: 'deliquescent',
    description: 'Racing salt crust',
  },
  {
    id: 'sf-deadsea',
    name: 'Dead Sea Salt Crust',
    lat: 31.5,
    lng: 35.5,
    crustThickness: 5,
    salinity: 340,
    moistureContent: 12.0,
    status: 'eroding',
    description: 'Receding shoreline crust',
  },
  {
    id: 'sf-etosha',
    name: 'Etosha Pan Crust',
    lat: -18.9833,
    lng: 15.9833,
    crustThickness: 3,
    salinity: 290,
    moistureContent: 35.0,
    status: 'submerged',
    description: 'Seasonally flooded pan',
  },
]

const STATUS_COLORS: Record<SaltFlatCrustData['status'], { label: string; color: string; bgClass: string }> = {
  crystalline: { label: 'Crystalline', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  deliquescent: { label: 'Deliquescent', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  eroding: { label: 'Eroding', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  submerged: { label: 'Submerged', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SaltFlatCrustData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SaltFlatCrustMonitor() {
  const state = useMapStore((s) => s.saltFlatCrust)
  const setState = useMapStore((s) => s.setSaltFlatCrust)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgThickness: 0, avgSalinity: 0, crystallineCount: 0 }
    }
    const avgThickness = filteredItems.reduce((sum, e) => sum + e.crustThickness, 0) / filteredItems.length
    const avgSalinity = filteredItems.reduce((sum, e) => sum + e.salinity, 0) / filteredItems.length
    const crystallineCount = filteredItems.filter((e) => e.status === 'crystalline').length
    return {
      totalSites: filteredItems.length,
      avgThickness,
      avgSalinity,
      crystallineCount,
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
      properties: { id: e.id, name: e.name, status: e.status, crustThickness: e.crustThickness },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSaltFlatCrust({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SaltFlatCrustState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCrustThickness', label: 'Crust Thickness', icon: Ruler },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showMoistureContent', label: 'Moisture Content', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-amber-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <LayersIcon6 className="h-4 w-4 text-amber-400" />
              Salt Flat Crust
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SaltFlatCrustState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="crystalline">Crystalline</SelectItem>
                <SelectItem value="deliquescent">Deliquescent</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
                <SelectItem value="submerged">Submerged</SelectItem>
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

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalSites}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Thickness</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgThickness.toFixed(1)}</div>
              <div className="text-[9px] text-amber-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgSalinity.toFixed(0)}</div>
              <div className="text-[9px] text-amber-400/60">ppt</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Crystalline</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.crystallineCount}</div>
              <div className="text-[9px] text-amber-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
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
                          : 'border-stone-700/30 hover:border-amber-500/30 hover:bg-stone-800/20'
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
                        {state.showCrustThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-stone-100 font-medium">{e.crustThickness} cm</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-stone-100 font-medium">{e.salinity} ppt</span>
                          </div>
                        )}
                        {state.showMoistureContent && (
                          <div>
                            Moisture:{' '}
                            <span className="text-stone-100 font-medium">{e.moistureContent}%</span>
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
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
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
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Thickness: </span>
                    <span className="font-medium text-amber-300">{activeItem.crustThickness} cm</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Salinity: </span>
                    <span className="font-medium text-yellow-400">{activeItem.salinity} ppt</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Moisture: </span>
                    <span className="font-medium text-cyan-400">{activeItem.moistureContent}%</span>
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
