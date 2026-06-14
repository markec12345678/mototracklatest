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
import { useMapStore, type VolcanicGasState, type VolcanicGasSource } from '@/lib/map-store'
import { CloudOff as CloudOffIcon, X, Wind, Flame, Thermometer, AlertOctagon, MapPin, Filter } from 'lucide-react'

const DEMO_SOURCES: VolcanicGasSource[] = [
  {
    id: 'vg-etna',
    name: 'Etna SO2',
    latitude: 37.75,
    longitude: 14.99,
    so2Flux: 3200,
    co2Flux: 18000,
    h2sConcentration: 12,
    hclEmission: 450,
    fumaroleTemp: 340,
    gasPlumeHeight: 5200,
    alertLevel: 'watch',
  },
  {
    id: 'vg-kilauea',
    name: 'Kilauea',
    latitude: 19.41,
    longitude: -155.29,
    so2Flux: 5800,
    co2Flux: 32000,
    h2sConcentration: 8,
    hclEmission: 280,
    fumaroleTemp: 410,
    gasPlumeHeight: 6800,
    alertLevel: 'warning',
  },
  {
    id: 'vg-popocatepetl',
    name: 'Popocatepetl',
    latitude: 19.02,
    longitude: -98.62,
    so2Flux: 2100,
    co2Flux: 14000,
    h2sConcentration: 18,
    hclEmission: 390,
    fumaroleTemp: 290,
    gasPlumeHeight: 4100,
    alertLevel: 'advisory',
  },
  {
    id: 'vg-ambrym',
    name: 'Ambrym Vanuatu',
    latitude: -16.25,
    longitude: 168.12,
    so2Flux: 4500,
    co2Flux: 26000,
    h2sConcentration: 22,
    hclEmission: 560,
    fumaroleTemp: 380,
    gasPlumeHeight: 7100,
    alertLevel: 'warning',
  },
  {
    id: 'vg-miyakejima',
    name: 'Miyakejima Japan',
    latitude: 34.08,
    longitude: 139.53,
    so2Flux: 1200,
    co2Flux: 8500,
    h2sConcentration: 5,
    hclEmission: 180,
    fumaroleTemp: 220,
    gasPlumeHeight: 2800,
    alertLevel: 'normal',
  },
  {
    id: 'vg-turrialba',
    name: 'Turrialba Costa Rica',
    latitude: 10.03,
    longitude: -83.77,
    so2Flux: 1800,
    co2Flux: 11000,
    h2sConcentration: 15,
    hclEmission: 320,
    fumaroleTemp: 310,
    gasPlumeHeight: 3600,
    alertLevel: 'advisory',
  },
]

const ALERT_CONFIG: Record<
  VolcanicGasSource['alertLevel'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  advisory: { label: 'Advisory', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  watch: { label: 'Watch', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  warning: { label: 'Warning', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function VolcanicGasEmissionMonitor() {
  const state = useMapStore((s) => s.volcanicGasEmission)
  const setState = useMapStore((s) => s.setVolcanicGasEmission)

  const sources = useMemo(
    () => (state.sources.length > 0 ? state.sources : DEMO_SOURCES),
    [state.sources]
  )

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (state.alertFilter !== 'all' && s.alertLevel !== state.alertFilter) return false
      return true
    })
  }, [sources, state.alertFilter])

  const summary = useMemo(() => {
    if (filteredSources.length === 0) {
      return { avgSO2: 0, avgCO2: 0, watchWarningCount: 0 }
    }
    const avgSO2 = filteredSources.reduce((sum, s) => sum + s.so2Flux, 0) / filteredSources.length
    const avgCO2 = filteredSources.reduce((sum, s) => sum + s.co2Flux, 0) / filteredSources.length
    const watchWarningCount = filteredSources.filter(
      (s) => s.alertLevel === 'watch' || s.alertLevel === 'warning'
    ).length
    return {
      avgSO2: Math.round(avgSO2),
      avgCO2: Math.round(avgCO2),
      watchWarningCount,
    }
  }, [filteredSources])

  const activeSource = useMemo(
    () => sources.find((s) => s.id === state.activeSourceId) ?? null,
    [sources, state.activeSourceId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicGasState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSO2', label: 'SO\u2082 Flux', icon: Wind },
    { key: 'showCO2', label: 'CO\u2082 Flux', icon: Flame },
    { key: 'showFumaroleTemp', label: 'Fumarole Temp', icon: Thermometer },
    { key: 'showAlertLevel', label: 'Alert Level', icon: AlertOctagon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudOffIcon className="h-4 w-4 text-orange-600" />
              Volcanic Gas Emission Monitor
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
          {/* Alert Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Alert Level
            </Label>
            <Select
              value={state.alertFilter}
              onValueChange={(v) =>
                setState({
                  alertFilter: v as VolcanicGasState['alertFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg SO&#8322;</div>
              <div className="text-sm font-semibold text-orange-600">{summary.avgSO2}</div>
              <div className="text-[9px] text-muted-foreground">t/d</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg CO&#8322;</div>
              <div className="text-sm font-semibold text-red-600">{summary.avgCO2}</div>
              <div className="text-[9px] text-muted-foreground">t/d</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Watch/Warning</div>
              <div className="text-sm font-semibold text-red-600">{summary.watchWarningCount}</div>
              <div className="text-[9px] text-muted-foreground">sources</div>
            </div>
          </div>

          <Separator />

          {/* Source List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Gas Sources ({filteredSources.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSources.map((source) => {
                  const isActive = state.activeSourceId === source.id
                  const alertCfg = ALERT_CONFIG[source.alertLevel]
                  return (
                    <div
                      key={source.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSourceId: isActive ? null : source.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: alertCfg.color }}
                          />
                          <span className="text-xs font-medium">{source.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${alertCfg.bgClass}`}
                        >
                          {alertCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showSO2 && (
                          <div>
                            SO&#8322;:{' '}
                            <span className="text-foreground font-medium">
                              {source.so2Flux} t/d
                            </span>
                          </div>
                        )}
                        {state.showCO2 && (
                          <div>
                            CO&#8322;:{' '}
                            <span className="text-foreground font-medium">
                              {source.co2Flux} t/d
                            </span>
                          </div>
                        )}
                        {state.showFumaroleTemp && (
                          <div>
                            Fumarole:{' '}
                            <span className="text-foreground font-medium">
                              {source.fumaroleTemp}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showAlertLevel && (
                          <div>
                            Plume:{' '}
                            <span className="text-foreground font-medium">
                              {source.gasPlumeHeight} m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSources.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sources match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Source Details */}
          {activeSource && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-xs font-semibold">{activeSource.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ALERT_CONFIG[activeSource.alertLevel].bgClass}`}
                  >
                    {ALERT_CONFIG[activeSource.alertLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSource.latitude.toFixed(2)}, {activeSource.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SO&#8322; Flux: </span>
                    <span className="font-medium">{activeSource.so2Flux} t/d</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CO&#8322; Flux: </span>
                    <span className="font-medium">{activeSource.co2Flux} t/d</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">H&#8322;S: </span>
                    <span className="font-medium">{activeSource.h2sConcentration} ppm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">HCl: </span>
                    <span className="font-medium">{activeSource.hclEmission} t/d</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fumarole: </span>
                    <span className="font-medium">{activeSource.fumaroleTemp}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plume Height: </span>
                    <span className="font-medium">{activeSource.gasPlumeHeight} m</span>
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
