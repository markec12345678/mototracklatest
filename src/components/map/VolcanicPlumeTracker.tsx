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
import { useMapStore, type VolcanicPlumeState, type VolcanicPlume } from '@/lib/map-store'
import { Cloud as CloudIcon7, X, Gauge, Wind, Layers, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_PLUMES: VolcanicPlume[] = [
  {
    id: 'vp-etna',
    name: 'Mount Etna',
    latitude: 37.75,
    longitude: 14.99,
    plumeHeight: 9200,
    so2Concentration: 420,
    ashDensity: 3.8,
    dispersionDirection: 'SE',
    windSpeed: 28,
    affectedRadius: 45,
    aviationColor: 'orange',
    eruptionType: 'strombolian',
  },
  {
    id: 'vp-kilauea',
    name: 'Kīlauea',
    latitude: 19.41,
    longitude: -155.29,
    plumeHeight: 4500,
    so2Concentration: 850,
    ashDensity: 1.2,
    dispersionDirection: 'W',
    windSpeed: 18,
    affectedRadius: 30,
    aviationColor: 'yellow',
    eruptionType: 'effusive',
  },
  {
    id: 'vp-eyja',
    name: 'Eyjafjallajökull',
    latitude: 63.63,
    longitude: -19.62,
    plumeHeight: 11000,
    so2Concentration: 310,
    ashDensity: 8.5,
    dispersionDirection: 'E',
    windSpeed: 45,
    affectedRadius: 120,
    aviationColor: 'red',
    eruptionType: 'explosive',
  },
  {
    id: 'vp-pinatubo',
    name: 'Mount Pinatubo',
    latitude: 15.14,
    longitude: 120.35,
    plumeHeight: 15000,
    so2Concentration: 1200,
    ashDensity: 12.4,
    dispersionDirection: 'SW',
    windSpeed: 52,
    affectedRadius: 200,
    aviationColor: 'red',
    eruptionType: 'plinian',
  },
  {
    id: 'vp-sthelens',
    name: 'Mount St. Helens',
    latitude: 46.20,
    longitude: -122.18,
    plumeHeight: 6800,
    so2Concentration: 180,
    ashDensity: 5.2,
    dispersionDirection: 'NE',
    windSpeed: 35,
    affectedRadius: 65,
    aviationColor: 'orange',
    eruptionType: 'explosive',
  },
  {
    id: 'vp-whakaari',
    name: 'Whakaari / White Island',
    latitude: -37.52,
    longitude: 177.18,
    plumeHeight: 3200,
    so2Concentration: 95,
    ashDensity: 0.8,
    dispersionDirection: 'N',
    windSpeed: 14,
    affectedRadius: 15,
    aviationColor: 'yellow',
    eruptionType: 'phreatic',
  },
]

const AVIATION_CONFIG: Record<
  VolcanicPlume['aviationColor'],
  { label: string; color: string; bgClass: string }
> = {
  green: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  yellow: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  orange: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  red: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ERUPTION_CONFIG: Record<
  VolcanicPlume['eruptionType'],
  { label: string; color: string; bgClass: string }
> = {
  effusive: { label: 'Effusive', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  explosive: { label: 'Explosive', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  phreatic: { label: 'Phreatic', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  strombolian: { label: 'Strombolian', color: '#fb923c', bgClass: 'bg-orange-400/10 text-orange-500 border-orange-400/30' },
  plinian: { label: 'Plinian', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

export function VolcanicPlumeTracker() {
  const state = useMapStore((s) => s.volcanicPlume)
  const setState = useMapStore((s) => s.setVolcanicPlume)

  const plumes = useMemo(
    () => (state.plumes.length > 0 ? state.plumes : DEMO_PLUMES),
    [state.plumes]
  )

  const filteredPlumes = useMemo(() => {
    return plumes.filter((p) => {
      if (state.colorFilter !== 'all' && p.aviationColor !== state.colorFilter) return false
      return true
    })
  }, [plumes, state.colorFilter])

  const summary = useMemo(() => {
    if (filteredPlumes.length === 0) {
      return { avgPlumeHeight: 0, avgSO2: 0, criticalCount: 0 }
    }
    const avgPlumeHeight = filteredPlumes.reduce((sum, p) => sum + p.plumeHeight, 0) / filteredPlumes.length
    const avgSO2 = filteredPlumes.reduce((sum, p) => sum + p.so2Concentration, 0) / filteredPlumes.length
    const criticalCount = filteredPlumes.filter(
      (p) => p.aviationColor === 'red' || p.aviationColor === 'orange'
    ).length
    return {
      avgPlumeHeight: Math.round(avgPlumeHeight),
      avgSO2: Math.round(avgSO2),
      criticalCount,
    }
  }, [filteredPlumes])

  const activePlume = useMemo(
    () => plumes.find((p) => p.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicPlumeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPlumeHeight', label: 'Plume Height', icon: Gauge },
    { key: 'showSO2', label: 'SO₂ Concentration', icon: Wind },
    { key: 'showAshDensity', label: 'Ash Density', icon: Layers },
    { key: 'showAviationColor', label: 'Aviation Color', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudIcon7 className="h-4 w-4 text-orange-600" />
              Volcanic Plume Tracker
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
          {/* Aviation Color Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Aviation Color Code
            </Label>
            <Select
              value={state.colorFilter}
              onValueChange={(v) =>
                setState({
                  colorFilter: v as VolcanicPlumeState['colorFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                <SelectItem value="green">Green — Low</SelectItem>
                <SelectItem value="yellow">Yellow — Moderate</SelectItem>
                <SelectItem value="orange">Orange — High</SelectItem>
                <SelectItem value="red">Red — Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Height</div>
              <div className="text-sm font-semibold">{summary.avgPlumeHeight}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg SO₂</div>
              <div className="text-sm font-semibold text-orange-600">{summary.avgSO2}</div>
              <div className="text-[9px] text-muted-foreground">DU</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Orange/Red</div>
              <div className="text-sm font-semibold text-red-600">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">plumes</div>
            </div>
          </div>

          <Separator />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Volcanic Plumes ({filteredPlumes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlumes.map((plume) => {
                  const isActive = state.activePlumeId === plume.id
                  const avCfg = AVIATION_CONFIG[plume.aviationColor]
                  const erCfg = ERUPTION_CONFIG[plume.eruptionType]
                  return (
                    <div
                      key={plume.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePlumeId: isActive ? null : plume.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: avCfg.color }}
                          />
                          <span className="text-xs font-medium">{plume.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${avCfg.bgClass}`}
                        >
                          {avCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showPlumeHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-foreground font-medium">
                              {plume.plumeHeight.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {state.showSO2 && (
                          <div>
                            SO₂:{' '}
                            <span className="text-foreground font-medium">
                              {plume.so2Concentration} DU
                            </span>
                          </div>
                        )}
                        {state.showAshDensity && (
                          <div>
                            Ash:{' '}
                            <span className="text-foreground font-medium">
                              {plume.ashDensity} g/m³
                            </span>
                          </div>
                        )}
                        {state.showAviationColor && (
                          <div>
                            Eruption:{' '}
                            <span className="text-foreground font-medium">
                              {erCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPlumes.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No plumes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Plume Details */}
          {activePlume && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-xs font-semibold">{activePlume.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${AVIATION_CONFIG[activePlume.aviationColor].bgClass}`}
                  >
                    {AVIATION_CONFIG[activePlume.aviationColor].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePlume.latitude.toFixed(2)}, {activePlume.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plume Height: </span>
                    <span className="font-medium">{activePlume.plumeHeight.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SO₂: </span>
                    <span className="font-medium">{activePlume.so2Concentration} DU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ash Density: </span>
                    <span className="font-medium">{activePlume.ashDensity} g/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dispersion: </span>
                    <span className="font-medium">{activePlume.dispersionDirection}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activePlume.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Radius: </span>
                    <span className="font-medium">{activePlume.affectedRadius} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Eruption Type: </span>
                    <span className="font-medium">{ERUPTION_CONFIG[activePlume.eruptionType].label}</span>
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
