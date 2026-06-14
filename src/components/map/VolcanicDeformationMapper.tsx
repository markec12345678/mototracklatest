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
import { useMapStore, type VolcanicDeformationState, type DeformationPoint } from '@/lib/map-store'
import { Triangle as TriangleIcon, X, Gauge, TrendingDown, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_POINTS: DeformationPoint[] = [
  {
    id: 'vd-kilauea',
    name: 'Kilauea Hawaii',
    latitude: 19.41,
    longitude: -155.29,
    volcanoType: 'shield',
    upliftRate: 12.5,
    subsidenceRate: 8.3,
    displacement: 15.2,
    strainRate: 0.85,
    alertLevel: 'warning',
  },
  {
    id: 'vd-campi-flegrei',
    name: 'Campi Flegrei Italy',
    latitude: 40.83,
    longitude: 14.14,
    volcanoType: 'caldera',
    upliftRate: 28.4,
    subsidenceRate: 3.1,
    displacement: 42.7,
    strainRate: 1.42,
    alertLevel: 'critical',
  },
  {
    id: 'vd-st-helens',
    name: 'Mount St. Helens USA',
    latitude: 46.20,
    longitude: -122.18,
    volcanoType: 'stratovolcano',
    upliftRate: 5.8,
    subsidenceRate: 2.2,
    displacement: 8.1,
    strainRate: 0.32,
    alertLevel: 'watch',
  },
  {
    id: 'vd-unzen',
    name: 'Unzen Japan',
    latitude: 32.76,
    longitude: 130.30,
    volcanoType: 'dome',
    upliftRate: 3.2,
    subsidenceRate: 4.5,
    displacement: 5.8,
    strainRate: 0.18,
    alertLevel: 'advisory',
  },
  {
    id: 'vd-laki',
    name: 'Laki Iceland',
    latitude: 64.07,
    longitude: -18.24,
    volcanoType: 'fissure',
    upliftRate: 8.9,
    subsidenceRate: 6.7,
    displacement: 11.3,
    strainRate: 0.55,
    alertLevel: 'watch',
  },
  {
    id: 'vd-eifel',
    name: 'Eifel Germany',
    latitude: 50.20,
    longitude: 6.95,
    volcanoType: 'maar',
    upliftRate: 1.2,
    subsidenceRate: 0.8,
    displacement: 2.1,
    strainRate: 0.05,
    alertLevel: 'normal',
  },
]

const ALERT_CONFIG: Record<
  DeformationPoint['alertLevel'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  advisory: { label: 'Advisory', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  watch: { label: 'Watch', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  warning: { label: 'Warning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  DeformationPoint['volcanoType'],
  { label: string; unit: string }
> = {
  stratovolcano: { label: 'Stratovolcano', unit: 'mm/yr' },
  shield: { label: 'Shield', unit: 'mm/yr' },
  caldera: { label: 'Caldera', unit: 'mm/yr' },
  dome: { label: 'Dome', unit: 'mm/yr' },
  fissure: { label: 'Fissure', unit: 'mm/yr' },
  maar: { label: 'Maar', unit: 'mm/yr' },
}

export function VolcanicDeformationMapper() {
  const state = useMapStore((s) => s.volcanicDeformation)
  const setState = useMapStore((s) => s.setVolcanicDeformation)

  const points = useMemo(
    () => (state.points.length > 0 ? state.points : DEMO_POINTS),
    [state.points]
  )

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (state.typeFilter !== 'all' && p.volcanoType !== state.typeFilter) return false
      return true
    })
  }, [points, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredPoints.length === 0) {
      return { avgUpliftRate: 0, avgDisplacement: 0, warningCriticalCount: 0 }
    }
    const avgUpliftRate = filteredPoints.reduce((sum, p) => sum + p.upliftRate, 0) / filteredPoints.length
    const avgDisplacement = filteredPoints.reduce((sum, p) => sum + p.displacement, 0) / filteredPoints.length
    const warningCriticalCount = filteredPoints.filter(
      (p) => p.alertLevel === 'warning' || p.alertLevel === 'critical'
    ).length
    return {
      avgUpliftRate: Math.round(avgUpliftRate * 10) / 10,
      avgDisplacement: Math.round(avgDisplacement * 10) / 10,
      warningCriticalCount,
    }
  }, [filteredPoints])

  const activePoint = useMemo(
    () => points.find((p) => p.id === state.activePointId) ?? null,
    [points, state.activePointId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicDeformationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showUplift', label: 'Uplift Rate', icon: Gauge },
    { key: 'showSubsidence', label: 'Subsidence Rate', icon: TrendingDown },
    { key: 'showDisplacement', label: 'Displacement', icon: MapPin },
    { key: 'showAlertLevel', label: 'Alert Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TriangleIcon className="h-4 w-4 text-red-600" />
              Volcanic Deformation Mapper
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Volcano Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as VolcanicDeformationState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="stratovolcano">Stratovolcano</SelectItem>
                <SelectItem value="shield">Shield</SelectItem>
                <SelectItem value="caldera">Caldera</SelectItem>
                <SelectItem value="dome">Dome</SelectItem>
                <SelectItem value="fissure">Fissure</SelectItem>
                <SelectItem value="maar">Maar</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Uplift</div>
              <div className="text-sm font-semibold">{summary.avgUpliftRate}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Displacement</div>
              <div className="text-sm font-semibold text-red-600">{summary.avgDisplacement}</div>
              <div className="text-[9px] text-muted-foreground">mm</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Warn./Critical</div>
              <div className="text-sm font-semibold text-orange-600">{summary.warningCriticalCount}</div>
              <div className="text-[9px] text-muted-foreground">points</div>
            </div>
          </div>

          <Separator />

          {/* Point List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Deformation Points ({filteredPoints.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPoints.map((point) => {
                  const isActive = state.activePointId === point.id
                  const alertCfg = ALERT_CONFIG[point.alertLevel]
                  return (
                    <div
                      key={point.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePointId: isActive ? null : point.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: alertCfg.color }}
                          />
                          <span className="text-xs font-medium">{point.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${alertCfg.bgClass}`}
                        >
                          {alertCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showUplift && (
                          <div>
                            Uplift:{' '}
                            <span className="text-foreground font-medium">
                              {point.upliftRate.toFixed(1)} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showSubsidence && (
                          <div>
                            Subsidence:{' '}
                            <span className="text-foreground font-medium">
                              {point.subsidenceRate.toFixed(1)} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showDisplacement && (
                          <div>
                            Disp.:{' '}
                            <span className="text-foreground font-medium">
                              {point.displacement.toFixed(1)} mm
                            </span>
                          </div>
                        )}
                        {state.showAlertLevel && (
                          <div>
                            Alert:{' '}
                            <span className="text-foreground font-medium">
                              {alertCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPoints.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No points match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Point Details */}
          {activePoint && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-xs font-semibold">{activePoint.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ALERT_CONFIG[activePoint.alertLevel].bgClass}`}
                  >
                    {ALERT_CONFIG[activePoint.alertLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePoint.latitude.toFixed(2)}, {activePoint.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volcano Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activePoint.volcanoType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uplift Rate: </span>
                    <span className="font-medium">{activePoint.upliftRate.toFixed(1)} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subsidence Rate: </span>
                    <span className="font-medium">{activePoint.subsidenceRate.toFixed(1)} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Displacement: </span>
                    <span className="font-medium">{activePoint.displacement.toFixed(1)} mm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Strain Rate: </span>
                    <span className="font-medium">{activePoint.strainRate.toFixed(2)} μstrain/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alert Level: </span>
                    <span className="font-medium">{ALERT_CONFIG[activePoint.alertLevel].label}</span>
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
