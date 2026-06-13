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
import { useMapStore, type LandslideRiskState, type LandslideRiskZone } from '@/lib/map-store'
import { Mountain as MountainIcon2, X, MapPin, Droplets, TreePine, Filter } from 'lucide-react'

const DEMO_ZONES: LandslideRiskZone[] = [
  {
    id: 'lp-himalayas',
    name: 'Himalayas - Uttarakhand',
    latitude: 30.39,
    longitude: 79.07,
    riskLevel: 'very_high',
    slopeAngle: 42,
    soilMoisture: 78,
    rainfallRate: 210,
    vegetationCover: 28,
    triggerType: 'rainfall',
  },
  {
    id: 'lp-andes',
    name: 'Andes - Peru Slopes',
    latitude: -13.16,
    longitude: -72.55,
    riskLevel: 'high',
    slopeAngle: 38,
    soilMoisture: 65,
    rainfallRate: 120,
    vegetationCover: 45,
    triggerType: 'erosion',
  },
  {
    id: 'lp-alps',
    name: 'Alps - Swiss Valley',
    latitude: 46.82,
    longitude: 8.23,
    riskLevel: 'moderate',
    slopeAngle: 30,
    soilMoisture: 52,
    rainfallRate: 95,
    vegetationCover: 62,
    triggerType: 'rainfall',
  },
  {
    id: 'lp-appalachian',
    name: 'Appalachians - West Virginia',
    latitude: 38.35,
    longitude: -81.63,
    riskLevel: 'low',
    slopeAngle: 22,
    soilMoisture: 40,
    rainfallRate: 60,
    vegetationCover: 72,
    triggerType: 'erosion',
  },
  {
    id: 'lp-java',
    name: 'Java - Merapi Region',
    latitude: -7.54,
    longitude: 110.45,
    riskLevel: 'high',
    slopeAngle: 35,
    soilMoisture: 71,
    rainfallRate: 165,
    vegetationCover: 38,
    triggerType: 'earthquake',
  },
  {
    id: 'lp-norway',
    name: 'Norwegian Fjords',
    latitude: 61.45,
    longitude: 6.78,
    riskLevel: 'very_low',
    slopeAngle: 15,
    soilMoisture: 30,
    rainfallRate: 45,
    vegetationCover: 85,
    triggerType: 'erosion',
  },
]

const RISK_CONFIG: Record<
  LandslideRiskZone['riskLevel'],
  { label: string; color: string; bgClass: string }
> = {
  very_low: { label: 'Very Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#14b8a6', bgClass: 'bg-teal-500/10 text-teal-600 border-teal-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TRIGGER_LABELS: Record<LandslideRiskZone['triggerType'], string> = {
  rainfall: 'Rainfall',
  earthquake: 'Earthquake',
  erosion: 'Erosion',
  human_activity: 'Human Activity',
}

export function LandslidePredictor() {
  const landslideRisk = useMapStore((s) => s.landslideRisk)
  const setLandslideRisk = useMapStore((s) => s.setLandslideRisk)

  const zones = useMemo(
    () => (landslideRisk.zones.length > 0 ? landslideRisk.zones : DEMO_ZONES),
    [landslideRisk.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (landslideRisk.riskFilter !== 'all' && z.riskLevel !== landslideRisk.riskFilter) return false
      return true
    })
  }, [zones, landslideRisk.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { highRiskCount: 0, avgSlope: 0, avgMoisture: 0 }
    }
    const highRiskCount = filteredZones.filter(
      (z) => z.riskLevel === 'high' || z.riskLevel === 'very_high'
    ).length
    const avgSlope = filteredZones.reduce((sum, z) => sum + z.slopeAngle, 0) / filteredZones.length
    const avgMoisture = filteredZones.reduce((sum, z) => sum + z.soilMoisture, 0) / filteredZones.length
    return {
      highRiskCount,
      avgSlope: Math.round(avgSlope * 10) / 10,
      avgMoisture: Math.round(avgMoisture * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === landslideRisk.activeZoneId) ?? null,
    [zones, landslideRisk.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!landslideRisk.open) return null

  const overlayToggles: { key: keyof LandslideRiskState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRiskLevel', label: 'Risk Level', icon: MapPin },
    { key: 'showSlope', label: 'Slope Angle', icon: MountainIcon2 },
    { key: 'showMoisture', label: 'Soil Moisture', icon: Droplets },
    { key: 'showVegetation', label: 'Vegetation', icon: TreePine },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainIcon2 className="h-4 w-4 text-amber-500" />
              Landslide Predictor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLandslideRisk({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk Level Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={landslideRisk.riskFilter}
              onValueChange={(v) =>
                setLandslideRisk({
                  riskFilter: v as LandslideRiskState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="very_low">Very Low</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
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
                  checked={landslideRisk[key] as boolean}
                  onCheckedChange={(checked) => setLandslideRisk({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Risk</div>
              <div className="text-sm font-semibold text-orange-500">{summary.highRiskCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Slope</div>
              <div className="text-sm font-semibold text-amber-500">{summary.avgSlope}&deg;</div>
              <div className="text-[9px] text-muted-foreground">degrees</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Moisture</div>
              <div className="text-sm font-semibold">{summary.avgMoisture}%</div>
              <div className="text-[9px] text-muted-foreground">soil</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Risk Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = landslideRisk.activeZoneId === zone.id
                  const riskCfg = RISK_CONFIG[zone.riskLevel]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setLandslideRisk({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: riskCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${riskCfg.bgClass}`}
                        >
                          {riskCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {landslideRisk.showRiskLevel && (
                          <div>
                            Risk:{' '}
                            <span className="text-foreground font-medium">
                              {riskCfg.label}
                            </span>
                          </div>
                        )}
                        {landslideRisk.showSlope && (
                          <div>
                            Slope:{' '}
                            <span className="text-foreground font-medium">
                              {zone.slopeAngle}&deg;
                            </span>
                          </div>
                        )}
                        {landslideRisk.showMoisture && (
                          <div>
                            Moisture:{' '}
                            <span className="text-foreground font-medium">
                              {zone.soilMoisture}%
                            </span>
                          </div>
                        )}
                        {landslideRisk.showVegetation && (
                          <div>
                            Vegetation:{' '}
                            <span className="text-foreground font-medium">
                              {zone.vegetationCover}%
                            </span>
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
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeZone.riskLevel].bgClass}`}
                  >
                    {RISK_CONFIG[activeZone.riskLevel].label}
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
                    <span className="text-muted-foreground">Slope Angle: </span>
                    <span className="font-medium">{activeZone.slopeAngle}&deg;</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil Moisture: </span>
                    <span className="font-medium">{activeZone.soilMoisture}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rainfall Rate: </span>
                    <span className="font-medium">{activeZone.rainfallRate} mm/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vegetation Cover: </span>
                    <span className="font-medium">{activeZone.vegetationCover}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trigger Type: </span>
                    <span className="font-medium">{TRIGGER_LABELS[activeZone.triggerType]}</span>
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
