'use client'

import { useMemo } from 'react'
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
import { useMapStore, type PolynyaState, type Polynya } from '@/lib/map-store'
import { Snowflake, X, Gauge, Activity, MapPin, Filter, Waves } from 'lucide-react'

const DEMO_POLYNYAS: Polynya[] = [
  {
    id: 'py-north-water',
    name: 'North Water Polynya',
    lat: 77.0,
    lng: -75.0,
    area: 85000,
    iceThickness: 1.8,
    waterTemperature: -1.2,
    salinity: 33.5,
    productivityIndex: 0.92,
    formationType: 'latent_heat',
    biologicalActivity: 'exceptional',
    status: 'open',
  },
  {
    id: 'py-weddell',
    name: 'Weddell Polynya',
    lat: -68.0,
    lng: -5.0,
    area: 320000,
    iceThickness: 2.5,
    waterTemperature: -1.8,
    salinity: 34.6,
    productivityIndex: 0.78,
    formationType: 'sensible_heat',
    biologicalActivity: 'high',
    status: 'forming',
  },
  {
    id: 'py-cosmonaut',
    name: 'Cosmonaut Polynya',
    lat: -66.0,
    lng: 50.0,
    area: 15000,
    iceThickness: 1.5,
    waterTemperature: -1.5,
    salinity: 34.0,
    productivityIndex: 0.55,
    formationType: 'sensible_heat',
    biologicalActivity: 'moderate',
    status: 'open',
  },
  {
    id: 'py-ross-sea',
    name: 'Ross Sea Polynya',
    lat: -76.0,
    lng: -170.0,
    area: 420000,
    iceThickness: 2.2,
    waterTemperature: -1.0,
    salinity: 34.2,
    productivityIndex: 0.95,
    formationType: 'coastal',
    biologicalActivity: 'exceptional',
    status: 'seasonal_peak',
  },
  {
    id: 'py-st-lawrence',
    name: 'St. Lawrence Island Polynya',
    lat: 63.5,
    lng: -170.5,
    area: 5200,
    iceThickness: 1.2,
    waterTemperature: -0.8,
    salinity: 32.8,
    productivityIndex: 0.72,
    formationType: 'flaw',
    biologicalActivity: 'high',
    status: 'open',
  },
  {
    id: 'py-amundsen',
    name: 'Amundsen Sea Polynya',
    lat: -73.0,
    lng: -110.0,
    area: 28000,
    iceThickness: 2.0,
    waterTemperature: -1.6,
    salinity: 34.1,
    productivityIndex: 0.48,
    formationType: 'recurrent',
    biologicalActivity: 'moderate',
    status: 'refreezing',
  },
]

const BIOLOGICAL_CONFIG: Record<
  Polynya['biologicalActivity'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  exceptional: { label: 'Exceptional', color: '#059669', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const STATUS_CONFIG: Record<
  Polynya['status'],
  { label: string; color: string; bgClass: string }
> = {
  forming: { label: 'Forming', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  open: { label: 'Open', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  refreezing: { label: 'Refreezing', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  frozen: { label: 'Frozen', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  seasonal_peak: { label: 'Seasonal Peak', color: '#059669', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const FORMATION_CONFIG: Record<
  Polynya['formationType'],
  { label: string }
> = {
  latent_heat: { label: 'Latent Heat' },
  sensible_heat: { label: 'Sensible Heat' },
  coastal: { label: 'Coastal' },
  flaw: { label: 'Flaw' },
  recurrent: { label: 'Recurrent' },
}

function formatArea(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

export function PolynyaMonitor() {
  const state = useMapStore((s) => s.polynya)
  const setState = useMapStore((s) => s.setPolynya)

  const polynyas = useMemo(
    () => (state.polynyas && state.polynyas.length > 0 ? state.polynyas : DEMO_POLYNYAS),
    [state.polynyas]
  )

  const filteredPolynyas = useMemo(() => {
    return polynyas.filter((p) => {
      if (state.formationFilter !== 'all' && p.formationType !== state.formationFilter) return false
      return true
    })
  }, [polynyas, state.formationFilter])

  const summary = useMemo(() => {
    if (filteredPolynyas.length === 0) {
      return { avgArea: 0, avgProductivityIndex: 0, highExceptionalCount: 0 }
    }
    const avgArea = filteredPolynyas.reduce((sum, p) => sum + p.area, 0) / filteredPolynyas.length
    const avgProductivityIndex = filteredPolynyas.reduce((sum, p) => sum + p.productivityIndex, 0) / filteredPolynyas.length
    const highExceptionalCount = filteredPolynyas.filter(
      (p) => p.biologicalActivity === 'high' || p.biologicalActivity === 'exceptional'
    ).length
    return {
      avgArea: Math.round(avgArea),
      avgProductivityIndex: Math.round(avgProductivityIndex * 100) / 100,
      highExceptionalCount,
    }
  }, [filteredPolynyas])

  const activePolynya = useMemo(
    () => polynyas.find((p) => p.id === state.activePolynyaId) ?? null,
    [polynyas, state.activePolynyaId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PolynyaState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: Gauge },
    { key: 'showProductivityIndex', label: 'Productivity Index', icon: Activity },
    { key: 'showBiologicalActivity', label: 'Biological Activity', icon: Waves },
    { key: 'showStatus', label: 'Status', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-sky-500" />
              Polynya Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Formation Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Formation Type
            </Label>
            <Select
              value={state.formationFilter}
              onValueChange={(v) =>
                setState({
                  formationFilter: v as PolynyaState['formationFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="latent_heat">Latent Heat</SelectItem>
                <SelectItem value="sensible_heat">Sensible Heat</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="flaw">Flaw</SelectItem>
                <SelectItem value="recurrent">Recurrent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-sky-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Area</div>
              <div className="text-sm font-semibold">{formatArea(summary.avgArea)}</div>
              <div className="text-[9px] text-muted-foreground">km²</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Productivity</div>
              <div className="text-sm font-semibold text-sky-600">{summary.avgProductivityIndex}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Exceptional</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.highExceptionalCount}</div>
              <div className="text-[9px] text-muted-foreground">bio. activity</div>
            </div>
          </div>

          <Separator />

          {/* Polynya List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Polynyas ({filteredPolynyas.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPolynyas.map((polynya) => {
                  const isActive = state.activePolynyaId === polynya.id
                  const bioCfg = BIOLOGICAL_CONFIG[polynya.biologicalActivity]
                  const statusCfg = STATUS_CONFIG[polynya.status]
                  return (
                    <div
                      key={polynya.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-400/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePolynyaId: isActive ? null : polynya.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: bioCfg.color }}
                          />
                          <span className="text-xs font-medium">{polynya.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {formatArea(polynya.area)} km²
                            </span>
                          </div>
                        )}
                        {state.showProductivityIndex && (
                          <div>
                            Productivity:{' '}
                            <span className="text-foreground font-medium">
                              {(polynya.productivityIndex * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {state.showBiologicalActivity && (
                          <div>
                            Bio. Activity:{' '}
                            <span className="text-foreground font-medium">
                              {bioCfg.label}
                            </span>
                          </div>
                        )}
                        {state.showStatus && (
                          <div>
                            Status:{' '}
                            <span className="text-foreground font-medium">
                              {statusCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPolynyas.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No polynyas match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Polynya Details */}
          {activePolynya && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-xs font-semibold">{activePolynya.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activePolynya.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activePolynya.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePolynya.lat.toFixed(2)}, {activePolynya.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formation: </span>
                    <span className="font-medium">{FORMATION_CONFIG[activePolynya.formationType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activePolynya.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ice Thickness: </span>
                    <span className="font-medium">{activePolynya.iceThickness} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Temp: </span>
                    <span className="font-medium">{activePolynya.waterTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activePolynya.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Productivity: </span>
                    <span className="font-medium">{(activePolynya.productivityIndex * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bio. Activity: </span>
                    <span className="font-medium">{BIOLOGICAL_CONFIG[activePolynya.biologicalActivity].label}</span>
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
