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
import { useMapStore, type SolarFlareState, type SolarFlare } from '@/lib/map-store'
import { Zap as ZapIcon, X, Activity as ActivityIcon, Radio as RadioIcon, Shield as ShieldIcon, MapPin, Filter } from 'lucide-react'

const DEMO_FLARES: SolarFlare[] = [
  {
    id: 'sf-ar13664',
    name: 'AR 13664 X-Class',
    latitude: 15.2,
    longitude: -25.4,
    flareClass: 'X',
    intensity: 8.2,
    duration: 45,
    cmeProbability: 92,
    radioBlackout: 'R4',
    radiationStorm: 'S3',
    impact: 'strong',
  },
  {
    id: 'sf-ar13712',
    name: 'AR 13712 M-Class',
    latitude: -8.5,
    longitude: 42.1,
    flareClass: 'M',
    intensity: 2.4,
    duration: 28,
    cmeProbability: 65,
    radioBlackout: 'R2',
    radiationStorm: 'S1',
    impact: 'moderate',
  },
  {
    id: 'sf-ar13698',
    name: 'AR 13698 C-Class',
    latitude: 22.7,
    longitude: 11.3,
    flareClass: 'C',
    intensity: 0.45,
    duration: 15,
    cmeProbability: 20,
    radioBlackout: 'none',
    radiationStorm: 'none',
    impact: 'negligible',
  },
  {
    id: 'sf-ar13655',
    name: 'AR 13655 X-Class',
    latitude: -12.8,
    longitude: -55.9,
    flareClass: 'X',
    intensity: 12.5,
    duration: 62,
    cmeProbability: 98,
    radioBlackout: 'R5',
    radiationStorm: 'S4',
    impact: 'extreme',
  },
  {
    id: 'sf-ar13725',
    name: 'AR 13725 B-Class',
    latitude: 5.1,
    longitude: 68.4,
    flareClass: 'B',
    intensity: 0.02,
    duration: 8,
    cmeProbability: 5,
    radioBlackout: 'none',
    radiationStorm: 'none',
    impact: 'negligible',
  },
  {
    id: 'sf-ar13680',
    name: 'AR 13680 M-Class',
    latitude: -18.3,
    longitude: -32.7,
    flareClass: 'M',
    intensity: 3.8,
    duration: 35,
    cmeProbability: 78,
    radioBlackout: 'R3',
    radiationStorm: 'S2',
    impact: 'moderate',
  },
]

const FLARE_CLASS_CONFIG: Record<
  SolarFlare['flareClass'],
  { label: string; color: string; bgClass: string }
> = {
  A: { label: 'A-Class', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  B: { label: 'B-Class', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  C: { label: 'C-Class', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  M: { label: 'M-Class', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  X: { label: 'X-Class', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const IMPACT_CONFIG: Record<
  SolarFlare['impact'],
  { label: string; bgClass: string }
> = {
  negligible: { label: 'Negligible', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  minor: { label: 'Minor', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  strong: { label: 'Strong', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SolarFlareMonitor() {
  const solarFlare = useMapStore((s) => s.solarFlare)
  const setSolarFlare = useMapStore((s) => s.setSolarFlare)

  const flares = useMemo(
    () => (solarFlare.flares.length > 0 ? solarFlare.flares : DEMO_FLARES),
    [solarFlare.flares]
  )

  const filteredFlares = useMemo(() => {
    return flares.filter((f) => {
      if (solarFlare.classFilter !== 'all' && f.flareClass !== solarFlare.classFilter) return false
      return true
    })
  }, [flares, solarFlare.classFilter])

  const summary = useMemo(() => {
    if (filteredFlares.length === 0) {
      return { strongestClass: '-', avgCMEProbability: 0, r3PlusCount: 0 }
    }
    const classOrder: SolarFlare['flareClass'][] = ['A', 'B', 'C', 'M', 'X']
    const strongestClass = filteredFlares.reduce((strongest, f) => {
      return classOrder.indexOf(f.flareClass) > classOrder.indexOf(strongest) ? f.flareClass : strongest
    }, filteredFlares[0].flareClass)
    const avgCMEProbability =
      filteredFlares.reduce((sum, f) => sum + f.cmeProbability, 0) / filteredFlares.length
    const r3PlusCount = filteredFlares.filter(
      (f) => f.radioBlackout === 'R3' || f.radioBlackout === 'R4' || f.radioBlackout === 'R5'
    ).length
    return {
      strongestClass,
      avgCMEProbability: Math.round(avgCMEProbability),
      r3PlusCount,
    }
  }, [filteredFlares])

  const activeFlare = useMemo(
    () => flares.find((f) => f.id === solarFlare.activeFlareId) ?? null,
    [flares, solarFlare.activeFlareId]
  )

  if (typeof window === 'undefined') return null
  if (!solarFlare.open) return null

  const overlayToggles: { key: keyof SolarFlareState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIntensity', label: 'Intensity', icon: ActivityIcon },
    { key: 'showCMEProbability', label: 'CME Probability', icon: ZapIcon },
    { key: 'showRadioBlackout', label: 'Radio Blackout', icon: RadioIcon },
    { key: 'showRadiationStorm', label: 'Radiation Storm', icon: ShieldIcon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ZapIcon className="h-4 w-4 text-amber-500" />
              Solar Flare Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSolarFlare({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Class Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Flare Class
            </Label>
            <Select
              value={solarFlare.classFilter}
              onValueChange={(v) =>
                setSolarFlare({
                  classFilter: v as SolarFlareState['classFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="A">A-Class</SelectItem>
                <SelectItem value="B">B-Class</SelectItem>
                <SelectItem value="C">C-Class</SelectItem>
                <SelectItem value="M">M-Class</SelectItem>
                <SelectItem value="X">X-Class</SelectItem>
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
                  checked={solarFlare[key] as boolean}
                  onCheckedChange={(checked) => setSolarFlare({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Strongest</div>
              <div className="text-sm font-semibold text-red-500">{summary.strongestClass}</div>
              <div className="text-[9px] text-muted-foreground">class</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg CME Prob.</div>
              <div className="text-sm font-semibold text-amber-500">{summary.avgCMEProbability}%</div>
              <div className="text-[9px] text-muted-foreground">probability</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">R3+ Blackouts</div>
              <div className="text-sm font-semibold text-orange-600">{summary.r3PlusCount}</div>
              <div className="text-[9px] text-muted-foreground">events</div>
            </div>
          </div>

          <Separator />

          {/* Flare List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Solar Flares ({filteredFlares.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlares.map((flare) => {
                  const isActive = solarFlare.activeFlareId === flare.id
                  const classCfg = FLARE_CLASS_CONFIG[flare.flareClass]
                  return (
                    <div
                      key={flare.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setSolarFlare({
                          activeFlareId: isActive ? null : flare.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: classCfg.color }}
                          />
                          <span className="text-xs font-medium">{flare.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${classCfg.bgClass}`}
                        >
                          {classCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {solarFlare.showIntensity && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {flare.intensity} W/m²
                            </span>
                          </div>
                        )}
                        {solarFlare.showCMEProbability && (
                          <div>
                            CME:{' '}
                            <span className="text-foreground font-medium">
                              {flare.cmeProbability}%
                            </span>
                          </div>
                        )}
                        {solarFlare.showRadioBlackout && (
                          <div>
                            Blackout:{' '}
                            <span className="text-foreground font-medium">
                              {flare.radioBlackout === 'none' ? 'None' : flare.radioBlackout}
                            </span>
                          </div>
                        )}
                        {solarFlare.showRadiationStorm && (
                          <div>
                            Storm:{' '}
                            <span className="text-foreground font-medium">
                              {flare.radiationStorm === 'none' ? 'None' : flare.radiationStorm}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlares.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No flares match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flare Details */}
          {activeFlare && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeFlare.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${FLARE_CLASS_CONFIG[activeFlare.flareClass].bgClass}`}
                  >
                    {FLARE_CLASS_CONFIG[activeFlare.flareClass].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeFlare.latitude.toFixed(2)}, {activeFlare.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{activeFlare.duration} min</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intensity: </span>
                    <span className="font-medium">{activeFlare.intensity} W/m²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CME Prob: </span>
                    <span className="font-medium">{activeFlare.cmeProbability}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Radio Blackout: </span>
                    <span className="font-medium">{activeFlare.radioBlackout === 'none' ? 'None' : activeFlare.radioBlackout}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rad. Storm: </span>
                    <span className="font-medium">{activeFlare.radiationStorm === 'none' ? 'None' : activeFlare.radiationStorm}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1">
                    <span className="text-muted-foreground">Impact: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-4 ${IMPACT_CONFIG[activeFlare.impact].bgClass}`}
                    >
                      {IMPACT_CONFIG[activeFlare.impact].label}
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
