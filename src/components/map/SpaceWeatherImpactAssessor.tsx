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
import { useMapStore, type SpaceWeatherImpactState, type SpaceWeatherImpact } from '@/lib/map-store'
import { ShieldAlert, X, MapPin, Filter, Users, DollarSign, Shield } from 'lucide-react'

const DEMO_IMPACTS: SpaceWeatherImpact[] = [
  {
    id: 'swi-quebec',
    name: 'Quebec Power Grid',
    latitude: 46.81,
    longitude: -71.21,
    impactType: 'power_grid',
    severity: 'extreme',
    affectedPopulation: 6000000,
    economicLoss: 2.5,
    mitigationLevel: 'intermediate',
    lastEvent: '1989-03-13',
    vulnerabilityIndex: 0.87,
  },
  {
    id: 'swi-gps',
    name: 'GPS Satellite Constellation',
    latitude: 38.88,
    longitude: -77.02,
    impactType: 'satellite',
    severity: 'severe',
    affectedPopulation: 500000,
    economicLoss: 1.2,
    mitigationLevel: 'advanced',
    lastEvent: '2024-05-10',
    vulnerabilityIndex: 0.65,
  },
  {
    id: 'swi-aviation',
    name: 'North Atlantic Air Routes',
    latitude: 55.00,
    longitude: -30.00,
    impactType: 'aviation',
    severity: 'moderate',
    affectedPopulation: 300000,
    economicLoss: 0.8,
    mitigationLevel: 'intermediate',
    lastEvent: '2023-11-05',
    vulnerabilityIndex: 0.58,
  },
  {
    id: 'swi-communication',
    name: 'HF Radio Communication',
    latitude: -33.87,
    longitude: 151.21,
    impactType: 'communication',
    severity: 'severe',
    affectedPopulation: 200000,
    economicLoss: 0.4,
    mitigationLevel: 'basic',
    lastEvent: '2024-01-22',
    vulnerabilityIndex: 0.72,
  },
  {
    id: 'swi-navigation',
    name: 'Maritime Navigation Systems',
    latitude: 35.68,
    longitude: 139.77,
    impactType: 'navigation',
    severity: 'minor',
    affectedPopulation: 100000,
    economicLoss: 0.2,
    mitigationLevel: 'advanced',
    lastEvent: '2023-09-15',
    vulnerabilityIndex: 0.35,
  },
  {
    id: 'swi-pipeline',
    name: 'Trans-Alaska Pipeline',
    latitude: 64.84,
    longitude: -147.72,
    impactType: 'pipeline',
    severity: 'moderate',
    affectedPopulation: 50000,
    economicLoss: 0.6,
    mitigationLevel: 'intermediate',
    lastEvent: '2022-10-28',
    vulnerabilityIndex: 0.61,
  },
]

const SEVERITY_CONFIG: Record<
  SpaceWeatherImpact['severity'],
  { label: string; color: string; bgClass: string }
> = {
  negligible: { label: 'Negligible', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SpaceWeatherImpactAssessor() {
  const spaceWeatherImpact = useMapStore((s) => s.spaceWeatherImpact)
  const setSpaceWeatherImpact = useMapStore((s) => s.setSpaceWeatherImpact)

  const impacts = useMemo(
    () => (spaceWeatherImpact.impacts.length > 0 ? spaceWeatherImpact.impacts : DEMO_IMPACTS),
    [spaceWeatherImpact.impacts]
  )

  const filteredImpacts = useMemo(() => {
    return impacts.filter((imp) => {
      if (spaceWeatherImpact.impactFilter !== 'all' && imp.impactType !== spaceWeatherImpact.impactFilter) return false
      return true
    })
  }, [impacts, spaceWeatherImpact.impactFilter])

  const summary = useMemo(() => {
    if (filteredImpacts.length === 0) {
      return { severeCount: 0, totalAffected: 0, totalEconomicLoss: 0 }
    }
    const severeCount = filteredImpacts.filter(
      (imp) => imp.severity === 'severe' || imp.severity === 'extreme'
    ).length
    const totalAffected = filteredImpacts.reduce((sum, imp) => sum + imp.affectedPopulation, 0)
    const totalEconomicLoss = filteredImpacts.reduce((sum, imp) => sum + imp.economicLoss, 0)
    return {
      severeCount,
      totalAffected,
      totalEconomicLoss: Math.round(totalEconomicLoss * 100) / 100,
    }
  }, [filteredImpacts])

  const activeImpact = useMemo(
    () => impacts.find((imp) => imp.id === spaceWeatherImpact.activeImpactId) ?? null,
    [impacts, spaceWeatherImpact.activeImpactId]
  )

  if (typeof window === 'undefined') return null
  if (!spaceWeatherImpact.open) return null

  const overlayToggles: { key: keyof SpaceWeatherImpactState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSeverity', label: 'Severity', icon: ShieldAlert },
    { key: 'showAffectedPopulation', label: 'Affected Population', icon: Users },
    { key: 'showEconomicLoss', label: 'Economic Loss', icon: DollarSign },
    { key: 'showVulnerability', label: 'Vulnerability', icon: Shield },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Space Weather Impact Assessor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSpaceWeatherImpact({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Impact Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Impact Type
            </Label>
            <Select
              value={spaceWeatherImpact.impactFilter}
              onValueChange={(v) =>
                setSpaceWeatherImpact({
                  impactFilter: v as SpaceWeatherImpactState['impactFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="power_grid">Power Grid</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="aviation">Aviation</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="navigation">Navigation</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
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
                  <Icon className="h-3 w-3 text-rose-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={spaceWeatherImpact[key] as boolean}
                  onCheckedChange={(checked) => setSpaceWeatherImpact({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.severeCount}</div>
              <div className="text-[9px] text-muted-foreground">impacts</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Affected</div>
              <div className="text-sm font-semibold text-orange-500">{(summary.totalAffected / 1000000).toFixed(1)}M</div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Economic Loss</div>
              <div className="text-sm font-semibold text-rose-500">${summary.totalEconomicLoss}B</div>
              <div className="text-[9px] text-muted-foreground">USD</div>
            </div>
          </div>

          <Separator />

          {/* Impact List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Space Weather Impacts ({filteredImpacts.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredImpacts.map((impact) => {
                  const isActive = spaceWeatherImpact.activeImpactId === impact.id
                  const sevCfg = SEVERITY_CONFIG[impact.severity]
                  return (
                    <div
                      key={impact.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-500/5'
                          : 'border-border/40 hover:border-rose-500/20 hover:bg-rose-500/5'
                      }`}
                      onClick={() =>
                        setSpaceWeatherImpact({
                          activeImpactId: isActive ? null : impact.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sevCfg.color }}
                          />
                          <span className="text-xs font-medium">{impact.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sevCfg.bgClass}`}
                        >
                          {sevCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {spaceWeatherImpact.showSeverity && (
                          <div>
                            Severity:{' '}
                            <span className="text-foreground font-medium">
                              {sevCfg.label}
                            </span>
                          </div>
                        )}
                        {spaceWeatherImpact.showAffectedPopulation && (
                          <div>
                            Affected:{' '}
                            <span className="text-foreground font-medium">
                              {(impact.affectedPopulation / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        )}
                        {spaceWeatherImpact.showEconomicLoss && (
                          <div>
                            Loss:{' '}
                            <span className="text-foreground font-medium">
                              ${impact.economicLoss}B
                            </span>
                          </div>
                        )}
                        {spaceWeatherImpact.showVulnerability && (
                          <div>
                            Vulnerability:{' '}
                            <span className="text-foreground font-medium">
                              {(impact.vulnerabilityIndex * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredImpacts.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No impacts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Impact Details */}
          {activeImpact && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs font-semibold">{activeImpact.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SEVERITY_CONFIG[activeImpact.severity].bgClass}`}
                  >
                    {SEVERITY_CONFIG[activeImpact.severity].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeImpact.latitude.toFixed(2)}, {activeImpact.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact Type: </span>
                    <span className="font-medium capitalize">{activeImpact.impactType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Affected Pop: </span>
                    <span className="font-medium">{(activeImpact.affectedPopulation / 1000000).toFixed(1)}M</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Economic Loss: </span>
                    <span className="font-medium">${activeImpact.economicLoss}B</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mitigation: </span>
                    <span className="font-medium capitalize">{activeImpact.mitigationLevel.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Event: </span>
                    <span className="font-medium">{activeImpact.lastEvent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vulnerability: </span>
                    <span className="font-medium">{(activeImpact.vulnerabilityIndex * 100).toFixed(0)}%</span>
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
