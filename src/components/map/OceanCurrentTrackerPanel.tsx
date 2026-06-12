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
import { useMapStore, type OceanCurrentTrackerState, type OceanCurrentZone } from '@/lib/map-store'
import { Waves as WavesIcon3, X, Gauge, Thermometer, Droplets, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_CURRENTS: OceanCurrentZone[] = [
  {
    id: 'oc-gulfstream',
    name: 'Gulf Stream',
    latitude: 35.0,
    longitude: -55.0,
    speed: 2.5,
    direction: 45,
    temperature: 24.3,
    salinity: 36.2,
    currentType: 'surface',
    ecosystemImpact: 'significant',
  },
  {
    id: 'oc-kuroshio',
    name: 'Kuroshio',
    latitude: 30.0,
    longitude: 140.0,
    speed: 2.1,
    direction: 60,
    temperature: 22.8,
    salinity: 34.8,
    currentType: 'surface',
    ecosystemImpact: 'moderate',
  },
  {
    id: 'oc-antarctic',
    name: 'Antarctic Circumpolar',
    latitude: -55.0,
    longitude: 0.0,
    speed: 1.4,
    direction: 90,
    temperature: 2.1,
    salinity: 34.5,
    currentType: 'thermohaline',
    ecosystemImpact: 'severe',
  },
  {
    id: 'oc-benguela',
    name: 'Benguela',
    latitude: -22.0,
    longitude: 10.0,
    speed: 0.8,
    direction: 180,
    temperature: 14.5,
    salinity: 35.1,
    currentType: 'coastal',
    ecosystemImpact: 'minimal',
  },
  {
    id: 'oc-humboldt',
    name: 'Humboldt',
    latitude: -18.0,
    longitude: -78.0,
    speed: 0.9,
    direction: 195,
    temperature: 15.2,
    salinity: 35.4,
    currentType: 'coastal',
    ecosystemImpact: 'moderate',
  },
  {
    id: 'oc-agulhas',
    name: 'Agulhas',
    latitude: -32.0,
    longitude: 32.0,
    speed: 1.8,
    direction: 270,
    temperature: 21.7,
    salinity: 35.7,
    currentType: 'surface',
    ecosystemImpact: 'significant',
  },
]

const IMPACT_CONFIG: Record<
  OceanCurrentZone['ecosystemImpact'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  significant: { label: 'Significant', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function OceanCurrentTrackerPanel() {
  const oceanCurrentTracker = useMapStore((s) => s.oceanCurrentTracker)
  const setOceanCurrentTracker = useMapStore((s) => s.setOceanCurrentTracker)

  const currents = useMemo(
    () => (oceanCurrentTracker.currents.length > 0 ? oceanCurrentTracker.currents : DEMO_CURRENTS),
    [oceanCurrentTracker.currents]
  )

  const filteredCurrents = useMemo(() => {
    return currents.filter((c) => {
      if (oceanCurrentTracker.impactFilter !== 'all' && c.ecosystemImpact !== oceanCurrentTracker.impactFilter) return false
      return true
    })
  }, [currents, oceanCurrentTracker.impactFilter])

  const summary = useMemo(() => {
    if (filteredCurrents.length === 0) {
      return { avgSpeed: 0, impactCount: 0, avgSalinity: 0 }
    }
    const avgSpeed =
      filteredCurrents.reduce((sum, c) => sum + c.speed, 0) / filteredCurrents.length
    const impactCount = filteredCurrents.filter(
      (c) => c.ecosystemImpact === 'significant' || c.ecosystemImpact === 'severe'
    ).length
    const avgSalinity =
      filteredCurrents.reduce((sum, c) => sum + c.salinity, 0) / filteredCurrents.length
    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      impactCount,
      avgSalinity: Math.round(avgSalinity * 10) / 10,
    }
  }, [filteredCurrents])

  const activeCurrent = useMemo(
    () => currents.find((c) => c.id === oceanCurrentTracker.activeCurrentId) ?? null,
    [currents, oceanCurrentTracker.activeCurrentId]
  )

  if (typeof window === 'undefined') return null
  if (!oceanCurrentTracker.open) return null

  const overlayToggles: { key: keyof OceanCurrentTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpeed', label: 'Speed', icon: Gauge },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showImpact', label: 'Impact', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon3 className="h-4 w-4 text-blue-500" />
              Ocean Current Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOceanCurrentTracker({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Impact Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ecosystem Impact
            </Label>
            <Select
              value={oceanCurrentTracker.impactFilter}
              onValueChange={(v) =>
                setOceanCurrentTracker({
                  impactFilter: v as OceanCurrentTrackerState['impactFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="significant">Significant</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-blue-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={oceanCurrentTracker[key] as boolean}
                  onCheckedChange={(checked) => setOceanCurrentTracker({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Speed</div>
              <div className="text-sm font-semibold">{summary.avgSpeed}</div>
              <div className="text-[9px] text-muted-foreground">m/s</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Sig/Severe</div>
              <div className="text-sm font-semibold text-orange-500">{summary.impactCount}</div>
              <div className="text-[9px] text-muted-foreground">currents</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Salinity</div>
              <div className="text-sm font-semibold">{summary.avgSalinity}</div>
              <div className="text-[9px] text-muted-foreground">PSU</div>
            </div>
          </div>

          <Separator />

          {/* Current List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ocean Currents ({filteredCurrents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCurrents.map((current) => {
                  const isActive = oceanCurrentTracker.activeCurrentId === current.id
                  const impactCfg = IMPACT_CONFIG[current.ecosystemImpact]
                  return (
                    <div
                      key={current.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-500/5'
                          : 'border-border/40 hover:border-blue-500/20 hover:bg-blue-500/5'
                      }`}
                      onClick={() =>
                        setOceanCurrentTracker({
                          activeCurrentId: isActive ? null : current.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: impactCfg.color }}
                          />
                          <span className="text-xs font-medium">{current.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${impactCfg.bgClass}`}
                        >
                          {impactCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {oceanCurrentTracker.showSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-foreground font-medium">
                              {current.speed} m/s
                            </span>
                          </div>
                        )}
                        {oceanCurrentTracker.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {current.temperature} °C
                            </span>
                          </div>
                        )}
                        {oceanCurrentTracker.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-foreground font-medium">
                              {current.salinity} PSU
                            </span>
                          </div>
                        )}
                        {oceanCurrentTracker.showImpact && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {current.currentType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCurrents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Current Details */}
          {activeCurrent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-semibold">{activeCurrent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${IMPACT_CONFIG[activeCurrent.ecosystemImpact].bgClass}`}
                  >
                    {IMPACT_CONFIG[activeCurrent.ecosystemImpact].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeCurrent.latitude.toFixed(2)}, {activeCurrent.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed: </span>
                    <span className="font-medium">{activeCurrent.speed} m/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Direction: </span>
                    <span className="font-medium">{activeCurrent.direction}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeCurrent.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeCurrent.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Type: </span>
                    <span className="font-medium">{activeCurrent.currentType}</span>
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
