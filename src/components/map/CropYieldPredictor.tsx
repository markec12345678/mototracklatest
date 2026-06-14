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
import { useMapStore, type CropYieldState, type CropYieldZone } from '@/lib/map-store'
import { Wheat, X, BarChart3, Sprout, Bug, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: CropYieldZone[] = [
  {
    id: 'cy-kansas',
    name: 'Kansas Wheat Belt',
    latitude: 38.50,
    longitude: -98.00,
    cropType: 'wheat',
    predictedYield: 3.2,
    actualYield: 2.9,
    soilQuality: 72,
    rainfallIndex: 65,
    temperatureIndex: 78,
    pestRisk: 'moderate',
    growthStage: 'maturity',
  },
  {
    id: 'cy-iowa',
    name: 'Iowa Corn Belt',
    latitude: 42.03,
    longitude: -93.46,
    cropType: 'corn',
    predictedYield: 11.5,
    actualYield: null,
    soilQuality: 85,
    rainfallIndex: 80,
    temperatureIndex: 82,
    pestRisk: 'low',
    growthStage: 'vegetative',
  },
  {
    id: 'cy-mekong',
    name: 'Mekong Delta Rice',
    latitude: 10.02,
    longitude: 105.78,
    cropType: 'rice',
    predictedYield: 6.8,
    actualYield: 6.2,
    soilQuality: 68,
    rainfallIndex: 92,
    temperatureIndex: 88,
    pestRisk: 'high',
    growthStage: 'flowering',
  },
  {
    id: 'cy-mato',
    name: 'Mato Grosso Soy',
    latitude: -15.60,
    longitude: -56.10,
    cropType: 'soybean',
    predictedYield: 3.5,
    actualYield: null,
    soilQuality: 60,
    rainfallIndex: 75,
    temperatureIndex: 85,
    pestRisk: 'moderate',
    growthStage: 'planting',
  },
  {
    id: 'cy-xinjiang',
    name: 'Xinjiang Cotton',
    latitude: 41.73,
    longitude: 86.17,
    cropType: 'cotton',
    predictedYield: 1.8,
    actualYield: 1.6,
    soilQuality: 55,
    rainfallIndex: 30,
    temperatureIndex: 90,
    pestRisk: 'severe',
    growthStage: 'maturity',
  },
  {
    id: 'cy-colombia',
    name: 'Colombian Coffee',
    latitude: 4.57,
    longitude: -74.30,
    cropType: 'coffee',
    predictedYield: 2.1,
    actualYield: null,
    soilQuality: 78,
    rainfallIndex: 88,
    temperatureIndex: 76,
    pestRisk: 'high',
    growthStage: 'flowering',
  },
]

const PEST_RISK_CONFIG: Record<
  CropYieldZone['pestRisk'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const GROWTH_STAGE_CONFIG: Record<
  CropYieldZone['growthStage'],
  { label: string; bgClass: string }
> = {
  planting: { label: 'Planting', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  vegetative: { label: 'Vegetative', bgClass: 'bg-lime-500/10 text-lime-600 border-lime-500/30' },
  flowering: { label: 'Flowering', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  maturity: { label: 'Maturity', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  harvest: { label: 'Harvest', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

const CROP_LABELS: Record<CropYieldState['cropFilter'], string> = {
  all: 'All Crops',
  wheat: 'Wheat',
  corn: 'Corn',
  rice: 'Rice',
  soybean: 'Soybean',
  cotton: 'Cotton',
  coffee: 'Coffee',
}

export function CropYieldPredictor() {
  const state = useMapStore((s) => s.cropYield)
  const setState = useMapStore((s) => s.setCropYield)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.cropFilter !== 'all' && z.cropType !== state.cropFilter) return false
      return true
    })
  }, [zones, state.cropFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgPredictedYield: 0, avgSoilQuality: 0, highSeverePestCount: 0 }
    }
    const avgPredictedYield =
      filteredZones.reduce((sum, z) => sum + z.predictedYield, 0) / filteredZones.length
    const avgSoilQuality =
      filteredZones.reduce((sum, z) => sum + z.soilQuality, 0) / filteredZones.length
    const highSeverePestCount = filteredZones.filter(
      (z) => z.pestRisk === 'high' || z.pestRisk === 'severe'
    ).length
    return {
      avgPredictedYield: Math.round(avgPredictedYield * 10) / 10,
      avgSoilQuality: Math.round(avgSoilQuality),
      highSeverePestCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CropYieldState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPredictedYield', label: 'Predicted Yield', icon: BarChart3 },
    { key: 'showSoilQuality', label: 'Soil Quality', icon: Sprout },
    { key: 'showPestRisk', label: 'Pest Risk', icon: Bug },
    { key: 'showGrowthStage', label: 'Growth Stage', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wheat className="h-4 w-4 text-amber-500" />
              Crop Yield Predictor
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
          {/* Crop Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Crop Type
            </Label>
            <Select
              value={state.cropFilter}
              onValueChange={(v) =>
                setState({
                  cropFilter: v as CropYieldState['cropFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CROP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
                  <Icon className="h-3 w-3 text-amber-500" />
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
              <div className="text-[10px] text-muted-foreground">Avg Yield</div>
              <div className="text-sm font-semibold">{summary.avgPredictedYield}</div>
              <div className="text-[9px] text-muted-foreground">t/ha</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Soil Quality</div>
              <div className="text-sm font-semibold text-amber-500">{summary.avgSoilQuality}</div>
              <div className="text-[9px] text-muted-foreground">/ 100</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Severe Pest</div>
              <div className="text-sm font-semibold text-red-500">{summary.highSeverePestCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Crop Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const pestCfg = PEST_RISK_CONFIG[zone.pestRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: pestCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${pestCfg.bgClass}`}
                        >
                          {pestCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showPredictedYield && (
                          <div>
                            Yield:{' '}
                            <span className="text-foreground font-medium">
                              {zone.predictedYield} t/ha
                            </span>
                          </div>
                        )}
                        {state.showSoilQuality && (
                          <div>
                            Soil:{' '}
                            <span className="text-foreground font-medium">
                              {zone.soilQuality}/100
                            </span>
                          </div>
                        )}
                        {state.showPestRisk && (
                          <div>
                            Pest:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {zone.pestRisk}
                            </span>
                          </div>
                        )}
                        {state.showGrowthStage && (
                          <div>
                            Stage:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${GROWTH_STAGE_CONFIG[zone.growthStage].bgClass}`}
                            >
                              {GROWTH_STAGE_CONFIG[zone.growthStage].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${PEST_RISK_CONFIG[activeZone.pestRisk].bgClass}`}
                  >
                    {PEST_RISK_CONFIG[activeZone.pestRisk].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crop: </span>
                    <span className="font-medium capitalize">{activeZone.cropType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Predicted Yield: </span>
                    <span className="font-medium">{activeZone.predictedYield} t/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actual Yield: </span>
                    <span className="font-medium">{activeZone.actualYield ?? 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil Quality: </span>
                    <span className="font-medium">{activeZone.soilQuality}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rainfall Index: </span>
                    <span className="font-medium">{activeZone.rainfallIndex}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp Index: </span>
                    <span className="font-medium">{activeZone.temperatureIndex}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Growth Stage: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${GROWTH_STAGE_CONFIG[activeZone.growthStage].bgClass}`}
                    >
                      {GROWTH_STAGE_CONFIG[activeZone.growthStage].label}
                    </Badge>
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
