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
import { useMapStore, type SeafloorMappingState, type SeafloorFeature } from '@/lib/map-store'
import { Waves as WavesIcon5, X, ArrowDown, Tag, ClipboardCheck, Gem, MapPin, Filter } from 'lucide-react'

const DEMO_FEATURES: SeafloorFeature[] = [
  {
    id: 'sf-mariana',
    name: 'Mariana Trench',
    latitude: 11.35,
    longitude: 142.20,
    depth: -10994,
    featureType: 'trench',
    area: 700000,
    age: 'Eocene',
    surveyStatus: 'partial',
    mineralPotential: 'moderate',
  },
  {
    id: 'sf-midatlantic',
    name: 'Mid-Atlantic Ridge',
    latitude: 0.00,
    longitude: -25.00,
    depth: -2500,
    featureType: 'ridge',
    area: 16000000,
    age: 'Ongoing',
    surveyStatus: 'partial',
    mineralPotential: 'high',
  },
  {
    id: 'sf-emperor',
    name: 'Emperor Seamount',
    latitude: 42.00,
    longitude: 170.00,
    depth: -1100,
    featureType: 'seamount',
    area: 15000,
    age: 'Cretaceous',
    surveyStatus: 'minimal',
    mineralPotential: 'low',
  },
  {
    id: 'sf-clarion',
    name: 'Clarion-Clipperton Zone',
    latitude: 12.00,
    longitude: -145.00,
    depth: -4500,
    featureType: 'abyssal_plain',
    area: 6000000,
    age: 'Miocene',
    surveyStatus: 'complete',
    mineralPotential: 'high',
  },
  {
    id: 'sf-lostcity',
    name: 'Lost City Vents',
    latitude: 30.13,
    longitude: -42.12,
    depth: -800,
    featureType: 'hydrothermal_vent',
    area: 250,
    age: 'Ongoing',
    surveyStatus: 'complete',
    mineralPotential: 'moderate',
  },
  {
    id: 'sf-detroit',
    name: 'Detroit Guyot',
    latitude: 19.50,
    longitude: -166.50,
    depth: -1500,
    featureType: 'guyot',
    area: 8500,
    age: 'Jurassic',
    surveyStatus: 'unsurveyed',
    mineralPotential: 'none',
  },
]

const SURVEY_STATUS_CONFIG: Record<
  SeafloorFeature['surveyStatus'],
  { label: string; color: string; bgClass: string }
> = {
  complete: { label: 'Complete', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  partial: { label: 'Partial', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  minimal: { label: 'Minimal', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unsurveyed: { label: 'Unsurveyed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const MINERAL_POTENTIAL_CONFIG: Record<
  SeafloorFeature['mineralPotential'],
  { label: string; bgClass: string }
> = {
  none: { label: 'None', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  low: { label: 'Low', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const FEATURE_TYPE_LABELS: Record<SeafloorFeature['featureType'], string> = {
  trench: 'Trench',
  ridge: 'Ridge',
  seamount: 'Seamount',
  abyssal_plain: 'Abyssal Plain',
  hydrothermal_vent: 'Hydrothermal Vent',
  guyot: 'Guyot',
}

export function SeafloorMappingPanel() {
  const seafloorMapping = useMapStore((s) => s.seafloorMapping)
  const setSeafloorMapping = useMapStore((s) => s.setSeafloorMapping)

  const features = useMemo(
    () => (seafloorMapping.features.length > 0 ? seafloorMapping.features : DEMO_FEATURES),
    [seafloorMapping.features]
  )

  const filteredFeatures = useMemo(() => {
    return features.filter((f) => {
      if (seafloorMapping.typeFilter !== 'all' && f.featureType !== seafloorMapping.typeFilter) return false
      return true
    })
  }, [features, seafloorMapping.typeFilter])

  const summary = useMemo(() => {
    if (filteredFeatures.length === 0) {
      return { deepestFeature: 0, surveyedCount: 0, highMineralCount: 0 }
    }
    const deepestFeature = Math.min(...filteredFeatures.map((f) => f.depth))
    const surveyedCount = filteredFeatures.filter(
      (f) => f.surveyStatus === 'complete' || f.surveyStatus === 'partial'
    ).length
    const highMineralCount = filteredFeatures.filter((f) => f.mineralPotential === 'high').length
    return { deepestFeature, surveyedCount, highMineralCount }
  }, [filteredFeatures])

  const activeFeature = useMemo(
    () => features.find((f) => f.id === seafloorMapping.activeFeatureId) ?? null,
    [features, seafloorMapping.activeFeatureId]
  )

  if (typeof window === 'undefined') return null
  if (!seafloorMapping.open) return null

  const overlayToggles: { key: keyof SeafloorMappingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showFeatureType', label: 'Feature Type', icon: Tag },
    { key: 'showSurveyStatus', label: 'Survey Status', icon: ClipboardCheck },
    { key: 'showMineralPotential', label: 'Mineral Potential', icon: Gem },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon5 className="h-4 w-4 text-cyan-500" />
              Seafloor Mapping
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSeafloorMapping({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Feature Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Feature Type
            </Label>
            <Select
              value={seafloorMapping.typeFilter}
              onValueChange={(v) =>
                setSeafloorMapping({
                  typeFilter: v as SeafloorMappingState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trench">Trench</SelectItem>
                <SelectItem value="ridge">Ridge</SelectItem>
                <SelectItem value="seamount">Seamount</SelectItem>
                <SelectItem value="abyssal_plain">Abyssal Plain</SelectItem>
                <SelectItem value="hydrothermal_vent">Hydrothermal Vent</SelectItem>
                <SelectItem value="guyot">Guyot</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={seafloorMapping[key] as boolean}
                  onCheckedChange={(checked) => setSeafloorMapping({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Deepest Feature</div>
              <div className="text-sm font-semibold text-cyan-500">{Math.abs(summary.deepestFeature).toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Surveyed</div>
              <div className="text-sm font-semibold text-blue-500">{summary.surveyedCount}</div>
              <div className="text-[9px] text-muted-foreground">features</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Mineral</div>
              <div className="text-sm font-semibold text-green-500">{summary.highMineralCount}</div>
              <div className="text-[9px] text-muted-foreground">features</div>
            </div>
          </div>

          <Separator />

          {/* Feature List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Seafloor Features ({filteredFeatures.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFeatures.map((feature) => {
                  const isActive = seafloorMapping.activeFeatureId === feature.id
                  const surveyCfg = SURVEY_STATUS_CONFIG[feature.surveyStatus]
                  return (
                    <div
                      key={feature.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setSeafloorMapping({
                          activeFeatureId: isActive ? null : feature.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: surveyCfg.color }}
                          />
                          <span className="text-xs font-medium">{feature.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${surveyCfg.bgClass}`}
                        >
                          {surveyCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {seafloorMapping.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {feature.depth.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {seafloorMapping.showFeatureType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {FEATURE_TYPE_LABELS[feature.featureType]}
                            </span>
                          </div>
                        )}
                        {seafloorMapping.showSurveyStatus && (
                          <div>
                            Survey:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${SURVEY_STATUS_CONFIG[feature.surveyStatus].bgClass}`}
                            >
                              {SURVEY_STATUS_CONFIG[feature.surveyStatus].label}
                            </Badge>
                          </div>
                        )}
                        {seafloorMapping.showMineralPotential && (
                          <div>
                            Mineral:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${MINERAL_POTENTIAL_CONFIG[feature.mineralPotential].bgClass}`}
                            >
                              {MINERAL_POTENTIAL_CONFIG[feature.mineralPotential].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFeatures.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No features match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Feature Details */}
          {activeFeature && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeFeature.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SURVEY_STATUS_CONFIG[activeFeature.surveyStatus].bgClass}`}
                  >
                    {SURVEY_STATUS_CONFIG[activeFeature.surveyStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeFeature.latitude.toFixed(2)}, {activeFeature.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeFeature.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Feature Type: </span>
                    <span className="font-medium">{FEATURE_TYPE_LABELS[activeFeature.featureType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeFeature.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age: </span>
                    <span className="font-medium">{activeFeature.age}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mineral Potential: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${MINERAL_POTENTIAL_CONFIG[activeFeature.mineralPotential].bgClass}`}
                    >
                      {MINERAL_POTENTIAL_CONFIG[activeFeature.mineralPotential].label}
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
