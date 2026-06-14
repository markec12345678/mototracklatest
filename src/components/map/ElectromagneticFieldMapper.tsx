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
import { useMapStore, type ElectromagneticFieldState, type ElectromagneticFieldPoint } from '@/lib/map-store'
import { Radio as RadioIcon4, X, Gauge, Waves, Layers, Zap, MapPin, Filter } from 'lucide-react'

const DEMO_POINTS: ElectromagneticFieldPoint[] = [
  {
    id: 'em-snaefells',
    name: 'Snaefellsnes Anomaly',
    latitude: 64.81,
    longitude: -23.79,
    fieldStrength: 58.3,
    frequencyBand: 'elf',
    anomalyType: 'natural',
    intensityDb: -42,
    polarizationAngle: 87.2,
    signalToNoise: 12.5,
    measurementDepth: 320,
  },
  {
    id: 'em-kursk',
    name: 'Kursk Magnetic Anomaly',
    latitude: 51.67,
    longitude: 36.08,
    fieldStrength: 92.7,
    frequencyBand: 'lf',
    anomalyType: 'natural',
    intensityDb: -18,
    polarizationAngle: 45.6,
    signalToNoise: 28.3,
    measurementDepth: 180,
  },
  {
    id: 'em-haarp',
    name: 'HAARP Research Station',
    latitude: 62.39,
    longitude: -145.15,
    fieldStrength: 74.1,
    frequencyBand: 'hf',
    anomalyType: 'anthropogenic',
    intensityDb: -30,
    polarizationAngle: 22.8,
    signalToNoise: 35.7,
    measurementDepth: 85,
  },
  {
    id: 'em-geomag-storm',
    name: 'South Atlantic Geomagnetic Storm',
    latitude: -28.50,
    longitude: -42.30,
    fieldStrength: 121.5,
    frequencyBand: 'vlf',
    anomalyType: 'magnetic_storm',
    intensityDb: -8,
    polarizationAngle: 156.3,
    signalToNoise: 6.2,
    measurementDepth: 500,
  },
  {
    id: 'em-solar-aurora',
    name: 'Northern Solar Interaction Zone',
    latitude: 69.65,
    longitude: 18.96,
    fieldStrength: 105.2,
    frequencyBand: 'uhf',
    anomalyType: 'solar_interaction',
    intensityDb: -14,
    polarizationAngle: 72.9,
    signalToNoise: 19.1,
    measurementDepth: 420,
  },
  {
    id: 'em-bayanhaote',
    name: 'Bayanhaote EM Field',
    latitude: 40.08,
    longitude: 106.77,
    fieldStrength: 67.8,
    frequencyBand: 'mf',
    anomalyType: 'anthropogenic',
    intensityDb: -36,
    polarizationAngle: 110.4,
    signalToNoise: 22.8,
    measurementDepth: 150,
  },
]

const BAND_CONFIG: Record<
  ElectromagneticFieldPoint['frequencyBand'],
  { label: string; color: string; bgClass: string }
> = {
  elf: { label: 'ELF', color: '#8b5cf6', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  vlf: { label: 'VLF', color: '#7c3aed', bgClass: 'bg-violet-600/10 text-violet-700 border-violet-600/30' },
  lf: { label: 'LF', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  mf: { label: 'MF', color: '#9333ea', bgClass: 'bg-purple-600/10 text-purple-700 border-purple-600/30' },
  hf: { label: 'HF', color: '#c084fc', bgClass: 'bg-purple-400/10 text-purple-500 border-purple-400/30' },
  vhf: { label: 'VHF', color: '#d8b4fe', bgClass: 'bg-purple-300/10 text-purple-600 border-purple-300/30' },
  uhf: { label: 'UHF', color: '#e9d5ff', bgClass: 'bg-purple-200/10 text-purple-700 border-purple-200/30' },
}

const ANOMALY_CONFIG: Record<
  ElectromagneticFieldPoint['anomalyType'],
  { label: string; color: string; bgClass: string }
> = {
  natural: { label: 'Natural', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  anthropogenic: { label: 'Anthropogenic', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  magnetic_storm: { label: 'Mag. Storm', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  solar_interaction: { label: 'Solar Interact.', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
}

export function ElectromagneticFieldMapper() {
  const state = useMapStore((s) => s.electromagneticField)
  const setState = useMapStore((s) => s.setElectromagneticField)

  const points = useMemo(
    () => (state.points.length > 0 ? state.points : DEMO_POINTS),
    [state.points]
  )

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      if (state.bandFilter !== 'all' && p.frequencyBand !== state.bandFilter) return false
      return true
    })
  }, [points, state.bandFilter])

  const summary = useMemo(() => {
    if (filteredPoints.length === 0) {
      return { avgStrength: 0, avgSNR: 0, highAnomalyCount: 0 }
    }
    const avgStrength = filteredPoints.reduce((sum, p) => sum + p.fieldStrength, 0) / filteredPoints.length
    const avgSNR = filteredPoints.reduce((sum, p) => sum + p.signalToNoise, 0) / filteredPoints.length
    const highAnomalyCount = filteredPoints.filter(
      (p) => p.anomalyType === 'magnetic_storm' || p.anomalyType === 'solar_interaction'
    ).length
    return {
      avgStrength: Math.round(avgStrength * 10) / 10,
      avgSNR: Math.round(avgSNR * 10) / 10,
      highAnomalyCount,
    }
  }, [filteredPoints])

  const activePoint = useMemo(
    () => points.find((p) => p.id === state.activePointId) ?? null,
    [points, state.activePointId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ElectromagneticFieldState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFieldStrength', label: 'Field Strength', icon: Gauge },
    { key: 'showFrequencyBand', label: 'Frequency Band', icon: Waves },
    { key: 'showAnomalyType', label: 'Anomaly Type', icon: Zap },
    { key: 'showIntensity', label: 'Intensity (dB)', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <RadioIcon4 className="h-4 w-4 text-violet-600" />
              Electromagnetic Field Mapper
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
          {/* Band Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Frequency Band
            </Label>
            <Select
              value={state.bandFilter}
              onValueChange={(v) =>
                setState({
                  bandFilter: v as ElectromagneticFieldState['bandFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bands</SelectItem>
                <SelectItem value="elf">ELF (3–30 Hz)</SelectItem>
                <SelectItem value="vlf">VLF (3–30 kHz)</SelectItem>
                <SelectItem value="lf">LF (30–300 kHz)</SelectItem>
                <SelectItem value="mf">MF (300 kHz–3 MHz)</SelectItem>
                <SelectItem value="hf">HF (3–30 MHz)</SelectItem>
                <SelectItem value="vhf">VHF (30–300 MHz)</SelectItem>
                <SelectItem value="uhf">UHF (300 MHz–3 GHz)</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Strength</div>
              <div className="text-sm font-semibold">{summary.avgStrength}</div>
              <div className="text-[9px] text-muted-foreground">μT</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg SNR</div>
              <div className="text-sm font-semibold text-violet-600">{summary.avgSNR}</div>
              <div className="text-[9px] text-muted-foreground">dB</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Anomaly</div>
              <div className="text-sm font-semibold text-red-600">{summary.highAnomalyCount}</div>
              <div className="text-[9px] text-muted-foreground">points</div>
            </div>
          </div>

          <Separator />

          {/* Point List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              EM Field Points ({filteredPoints.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPoints.map((point) => {
                  const isActive = state.activePointId === point.id
                  const bandCfg = BAND_CONFIG[point.frequencyBand]
                  const anomalyCfg = ANOMALY_CONFIG[point.anomalyType]
                  return (
                    <div
                      key={point.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-500/5'
                          : 'border-border/40 hover:border-violet-500/20 hover:bg-violet-500/5'
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
                            style={{ backgroundColor: anomalyCfg.color }}
                          />
                          <span className="text-xs font-medium">{point.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${bandCfg.bgClass}`}
                        >
                          {bandCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showFieldStrength && (
                          <div>
                            Strength:{' '}
                            <span className="text-foreground font-medium">
                              {point.fieldStrength} μT
                            </span>
                          </div>
                        )}
                        {state.showFrequencyBand && (
                          <div>
                            Band:{' '}
                            <span className="text-foreground font-medium">
                              {bandCfg.label}
                            </span>
                          </div>
                        )}
                        {state.showAnomalyType && (
                          <div>
                            Anomaly:{' '}
                            <span className="text-foreground font-medium">
                              {anomalyCfg.label}
                            </span>
                          </div>
                        )}
                        {state.showIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {point.intensityDb} dB
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
              <div className="space-y-2 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-xs font-semibold">{activePoint.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ANOMALY_CONFIG[activePoint.anomalyType].bgClass}`}
                  >
                    {ANOMALY_CONFIG[activePoint.anomalyType].label}
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
                    <span className="text-muted-foreground">Field Strength: </span>
                    <span className="font-medium">{activePoint.fieldStrength} μT</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency Band: </span>
                    <span className="font-medium">{BAND_CONFIG[activePoint.frequencyBand].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intensity: </span>
                    <span className="font-medium">{activePoint.intensityDb} dB</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Polarization: </span>
                    <span className="font-medium">{activePoint.polarizationAngle}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SNR: </span>
                    <span className="font-medium">{activePoint.signalToNoise} dB</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Measurement Depth: </span>
                    <span className="font-medium">{activePoint.measurementDepth} m</span>
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
