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
import { useMapStore, type MangroveCarbonState, type MangroveCarbonZone } from '@/lib/map-store'
import { TreePine as TreePineIcon3, X, Leaf, Scale, Heart, Sprout, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: MangroveCarbonZone[] = [
  {
    id: 'mc-sundarbans',
    name: 'Sundarbans',
    latitude: 21.95,
    longitude: 89.18,
    carbonSequestration: 12.8,
    aboveGroundBiomass: 185.2,
    belowGroundBiomass: 92.4,
    area: 10200,
    speciesDiversity: 36,
    healthIndex: 'excellent',
    restorationPotential: 'moderate',
  },
  {
    id: 'mc-madagascar',
    name: 'Madagascar Mangroves',
    latitude: -16.25,
    longitude: 44.67,
    carbonSequestration: 8.5,
    aboveGroundBiomass: 124.6,
    belowGroundBiomass: 61.8,
    area: 4600,
    speciesDiversity: 28,
    healthIndex: 'good',
    restorationPotential: 'high',
  },
  {
    id: 'mc-florida',
    name: 'Florida Everglades',
    latitude: 25.32,
    longitude: -80.93,
    carbonSequestration: 6.2,
    aboveGroundBiomass: 98.4,
    belowGroundBiomass: 48.2,
    area: 3200,
    speciesDiversity: 18,
    healthIndex: 'moderate',
    restorationPotential: 'moderate',
  },
  {
    id: 'mc-vietnam',
    name: 'Mekong Delta Mangroves',
    latitude: 9.85,
    longitude: 106.33,
    carbonSequestration: 5.1,
    aboveGroundBiomass: 76.3,
    belowGroundBiomass: 38.7,
    area: 2800,
    speciesDiversity: 22,
    healthIndex: 'poor',
    restorationPotential: 'high',
  },
  {
    id: 'mc-ecuador',
    name: 'Ecuador Pacific Coast',
    latitude: -1.25,
    longitude: -80.35,
    carbonSequestration: 3.2,
    aboveGroundBiomass: 42.8,
    belowGroundBiomass: 21.4,
    area: 1500,
    speciesDiversity: 14,
    healthIndex: 'critical',
    restorationPotential: 'high',
  },
  {
    id: 'mc-kenya',
    name: 'Kenya Coastal Mangroves',
    latitude: -4.05,
    longitude: 39.67,
    carbonSequestration: 4.7,
    aboveGroundBiomass: 68.5,
    belowGroundBiomass: 34.2,
    area: 2100,
    speciesDiversity: 16,
    healthIndex: 'good',
    restorationPotential: 'moderate',
  },
]

const HEALTH_CONFIG: Record<
  MangroveCarbonZone['healthIndex'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  poor: { label: 'Poor', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function MangroveCarbonTracker() {
  const mangroveCarbon = useMapStore((s) => s.mangroveCarbon)
  const setMangroveCarbon = useMapStore((s) => s.setMangroveCarbon)

  const zones = useMemo(
    () => (mangroveCarbon.zones.length > 0 ? mangroveCarbon.zones : DEMO_ZONES),
    [mangroveCarbon.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (mangroveCarbon.healthFilter !== 'all' && z.healthIndex !== mangroveCarbon.healthFilter) return false
      return true
    })
  }, [zones, mangroveCarbon.healthFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalCarbonSeq: 0, avgArea: 0, criticalPoorCount: 0 }
    }
    const totalCarbonSeq = filteredZones.reduce((sum, z) => sum + z.carbonSequestration, 0)
    const avgArea = filteredZones.reduce((sum, z) => sum + z.area, 0) / filteredZones.length
    const criticalPoorCount = filteredZones.filter(
      (z) => z.healthIndex === 'critical' || z.healthIndex === 'poor'
    ).length
    return {
      totalCarbonSeq: Math.round(totalCarbonSeq * 10) / 10,
      avgArea: Math.round(avgArea),
      criticalPoorCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === mangroveCarbon.activeZoneId) ?? null,
    [zones, mangroveCarbon.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!mangroveCarbon.open) return null

  const overlayToggles: { key: keyof MangroveCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonSequestration', label: 'Carbon Seq.', icon: Leaf },
    { key: 'showBiomass', label: 'Biomass', icon: Scale },
    { key: 'showHealthIndex', label: 'Health Index', icon: Heart },
    { key: 'showRestorationPotential', label: 'Restoration', icon: Sprout },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePineIcon3 className="h-4 w-4 text-green-600" />
              Mangrove Carbon Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setMangroveCarbon({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Health Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Health Status
            </Label>
            <Select
              value={mangroveCarbon.healthFilter}
              onValueChange={(v) =>
                setMangroveCarbon({
                  healthFilter: v as MangroveCarbonState['healthFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={mangroveCarbon[key] as boolean}
                  onCheckedChange={(checked) => setMangroveCarbon({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Carbon Seq.</div>
              <div className="text-sm font-semibold text-green-600">{summary.totalCarbonSeq}</div>
              <div className="text-[9px] text-muted-foreground">tCO₂/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Area</div>
              <div className="text-sm font-semibold">{summary.avgArea}</div>
              <div className="text-[9px] text-muted-foreground">ha</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical/Poor</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalPoorCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Mangrove Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = mangroveCarbon.activeZoneId === zone.id
                  const healthCfg = HEALTH_CONFIG[zone.healthIndex]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-border/40 hover:border-green-500/20 hover:bg-green-500/5'
                      }`}
                      onClick={() =>
                        setMangroveCarbon({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {mangroveCarbon.showCarbonSequestration && (
                          <div>
                            Carbon Seq:{' '}
                            <span className="text-foreground font-medium">
                              {zone.carbonSequestration} tCO₂/yr
                            </span>
                          </div>
                        )}
                        {mangroveCarbon.showBiomass && (
                          <div>
                            AGB:{' '}
                            <span className="text-foreground font-medium">
                              {zone.aboveGroundBiomass} t/ha
                            </span>
                          </div>
                        )}
                        {mangroveCarbon.showHealthIndex && (
                          <div>
                            Species:{' '}
                            <span className="text-foreground font-medium">
                              {zone.speciesDiversity}
                            </span>
                          </div>
                        )}
                        {mangroveCarbon.showRestorationPotential && (
                          <div>
                            Restoration:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {zone.restorationPotential}
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
              <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeZone.healthIndex].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeZone.healthIndex].label}
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
                    <span className="text-muted-foreground">Carbon Seq.: </span>
                    <span className="font-medium">{activeZone.carbonSequestration} tCO₂/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AGB: </span>
                    <span className="font-medium">{activeZone.aboveGroundBiomass} t/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BGB: </span>
                    <span className="font-medium">{activeZone.belowGroundBiomass} t/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeZone.area} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species: </span>
                    <span className="font-medium">{activeZone.speciesDiversity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Restoration: </span>
                    <span className="font-medium capitalize">{activeZone.restorationPotential}</span>
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
