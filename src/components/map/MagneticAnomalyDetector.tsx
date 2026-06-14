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
import { useMapStore, type MagneticAnomalyState, type MagneticAnomaly } from '@/lib/map-store'
import { Magnet as MagnetIcon, X, Gauge, Compass, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_ANOMALIES: MagneticAnomaly[] = [
  {
    id: 'ma-kursk',
    name: 'Kursk Anomaly Russia',
    latitude: 51.70,
    longitude: 36.15,
    anomalyType: 'crustal',
    fieldStrength: 62000,
    declination: 4.2,
    inclination: 65.3,
    anomalyIntensity: 18500,
    depth: 8.5,
    riskLevel: 'extreme',
  },
  {
    id: 'ma-satlantic',
    name: 'S Atlantic Anomaly',
    latitude: -25.00,
    longitude: -40.00,
    anomalyType: 'gradient',
    fieldStrength: 24000,
    declination: -12.8,
    inclination: -38.5,
    anomalyIntensity: 12000,
    depth: 0,
    riskLevel: 'high',
  },
  {
    id: 'ma-bangui',
    name: 'Bangui Anomaly CAR',
    latitude: 4.36,
    longitude: 18.56,
    anomalyType: 'crustal',
    fieldStrength: 43000,
    declination: -3.5,
    inclination: -18.7,
    anomalyIntensity: 15000,
    depth: 12.0,
    riskLevel: 'high',
  },
  {
    id: 'ma-temagami',
    name: 'Temagami Canada',
    latitude: 47.05,
    longitude: -80.05,
    anomalyType: 'dipole',
    fieldStrength: 54800,
    declination: -8.6,
    inclination: 72.4,
    anomalyIntensity: 9200,
    depth: 3.2,
    riskLevel: 'moderate',
  },
  {
    id: 'ma-kirovograd',
    name: 'Kirovograd Ukraine',
    latitude: 48.51,
    longitude: 32.26,
    anomalyType: 'induced',
    fieldStrength: 51200,
    declination: 5.1,
    inclination: 63.8,
    anomalyIntensity: 7800,
    depth: 5.7,
    riskLevel: 'low',
  },
  {
    id: 'ma-bjorko',
    name: 'Björkö Sweden',
    latitude: 59.36,
    longitude: 17.56,
    anomalyType: 'remnant',
    fieldStrength: 49800,
    declination: 1.8,
    inclination: 71.2,
    anomalyIntensity: 5400,
    depth: 2.1,
    riskLevel: 'negligible',
  },
]

const RISK_CONFIG: Record<
  MagneticAnomaly['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  negligible: { label: 'Negligible', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_CONFIG: Record<
  MagneticAnomaly['anomalyType'],
  { label: string }
> = {
  dipole: { label: 'Dipole' },
  monopole: { label: 'Monopole' },
  gradient: { label: 'Gradient' },
  crustal: { label: 'Crustal' },
  induced: { label: 'Induced' },
  remnant: { label: 'Remnant' },
}

export function MagneticAnomalyDetector() {
  const state = useMapStore((s) => s.magneticAnomaly)
  const setState = useMapStore((s) => s.setMagneticAnomaly)

  const anomalies = useMemo(
    () => (state.anomalies.length > 0 ? state.anomalies : DEMO_ANOMALIES),
    [state.anomalies]
  )

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((a) => {
      if (state.typeFilter !== 'all' && a.anomalyType !== state.typeFilter) return false
      return true
    })
  }, [anomalies, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredAnomalies.length === 0) {
      return { avgFieldStrength: 0, avgIntensity: 0, highExtremeCount: 0 }
    }
    const avgFieldStrength = filteredAnomalies.reduce((sum, a) => sum + a.fieldStrength, 0) / filteredAnomalies.length
    const avgIntensity = filteredAnomalies.reduce((sum, a) => sum + a.anomalyIntensity, 0) / filteredAnomalies.length
    const highExtremeCount = filteredAnomalies.filter(
      (a) => a.riskLevel === 'high' || a.riskLevel === 'extreme'
    ).length
    return {
      avgFieldStrength: Math.round(avgFieldStrength),
      avgIntensity: Math.round(avgIntensity),
      highExtremeCount,
    }
  }, [filteredAnomalies])

  const activeAnomaly = useMemo(
    () => anomalies.find((a) => a.id === state.activeAnomalyId) ?? null,
    [anomalies, state.activeAnomalyId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MagneticAnomalyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFieldStrength', label: 'Field Strength', icon: Gauge },
    { key: 'showDeclination', label: 'Declination', icon: Compass },
    { key: 'showAnomalyIntensity', label: 'Anomaly Intensity', icon: AlertTriangle },
    { key: 'showRiskLevel', label: 'Risk Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MagnetIcon className="h-4 w-4 text-violet-600" />
              Magnetic Anomaly Detector
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
              Anomaly Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as MagneticAnomalyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dipole">Dipole</SelectItem>
                <SelectItem value="monopole">Monopole</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="crustal">Crustal</SelectItem>
                <SelectItem value="induced">Induced</SelectItem>
                <SelectItem value="remnant">Remnant</SelectItem>
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
                  <Icon className="h-3 w-3 text-violet-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Field Strength</div>
              <div className="text-sm font-semibold">{summary.avgFieldStrength.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">nT</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Intensity</div>
              <div className="text-sm font-semibold text-violet-600">{summary.avgIntensity.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">nT</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High+Extreme</div>
              <div className="text-sm font-semibold text-red-600">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">anomalies</div>
            </div>
          </div>

          <Separator />

          {/* Anomaly List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Anomalies ({filteredAnomalies.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredAnomalies.map((anomaly) => {
                  const isActive = state.activeAnomalyId === anomaly.id
                  const riskCfg = RISK_CONFIG[anomaly.riskLevel]
                  return (
                    <div
                      key={anomaly.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-border/40 hover:border-violet-500/20 hover:bg-violet-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeAnomalyId: isActive ? null : anomaly.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{anomaly.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showFieldStrength && (
                          <div>
                            Field:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.fieldStrength.toLocaleString()} nT
                            </span>
                          </div>
                        )}
                        {state.showDeclination && (
                          <div>
                            Decl.:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.declination.toFixed(1)}°
                            </span>
                          </div>
                        )}
                        {state.showAnomalyIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.anomalyIntensity.toLocaleString()} nT
                            </span>
                          </div>
                        )}
                        {state.showRiskLevel && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {anomaly.depth.toFixed(1)} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredAnomalies.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No anomalies match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Anomaly Details */}
          {activeAnomaly && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-semibold">{activeAnomaly.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeAnomaly.riskLevel].bgClass}`}
                  >
                    {RISK_CONFIG[activeAnomaly.riskLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeAnomaly.latitude.toFixed(2)}, {activeAnomaly.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeAnomaly.anomalyType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Field Strength: </span>
                    <span className="font-medium">{activeAnomaly.fieldStrength.toLocaleString()} nT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Declination: </span>
                    <span className="font-medium">{activeAnomaly.declination.toFixed(1)}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inclination: </span>
                    <span className="font-medium">{activeAnomaly.inclination.toFixed(1)}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intensity: </span>
                    <span className="font-medium">{activeAnomaly.anomalyIntensity.toLocaleString()} nT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeAnomaly.depth.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Level: </span>
                    <span className="font-medium">{RISK_CONFIG[activeAnomaly.riskLevel].label}</span>
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
