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
import { useMapStore, type SalinityGradientState, type SalinityGradientZone } from '@/lib/map-store'
import { Droplets as DropletsIcon2, X, ArrowDownFromLine, Waves, Wind, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: SalinityGradientZone[] = [
  {
    id: 'sg-chesapeake',
    name: 'Chesapeake Bay Estuary',
    latitude: 37.5,
    longitude: -76.3,
    salinity: 15.2,
    depth: 12,
    temperature: 18.5,
    gradientType: 'estuary',
    marineImpact: 'moderate',
    oxygenLevel: 6.8,
  },
  {
    id: 'sg-baltic',
    name: 'Baltic Sea Halocline',
    latitude: 58.0,
    longitude: 20.0,
    salinity: 7.5,
    depth: 85,
    temperature: 4.2,
    gradientType: 'halocline',
    marineImpact: 'significant',
    oxygenLevel: 3.1,
  },
  {
    id: 'sg-mississippi',
    name: 'Mississippi Salt Wedge',
    latitude: 29.2,
    longitude: -89.3,
    salinity: 22.8,
    depth: 18,
    temperature: 22.1,
    gradientType: 'salt_wedge',
    marineImpact: 'moderate',
    oxygenLevel: 5.4,
  },
  {
    id: 'sg-redsea',
    name: 'Red Sea Hypersaline',
    latitude: 22.0,
    longitude: 38.5,
    salinity: 41.0,
    depth: 120,
    temperature: 26.8,
    gradientType: 'hypersaline',
    marineImpact: 'minimal',
    oxygenLevel: 7.2,
  },
  {
    id: 'sg-gulf',
    name: 'Gulf of Mexico Dead Zone',
    latitude: 29.0,
    longitude: -90.5,
    salinity: 32.5,
    depth: 30,
    temperature: 24.0,
    gradientType: 'halocline',
    marineImpact: 'severe',
    oxygenLevel: 1.2,
  },
  {
    id: 'sg-thames',
    name: 'Thames Estuary',
    latitude: 51.5,
    longitude: 0.5,
    salinity: 12.8,
    depth: 8,
    temperature: 14.5,
    gradientType: 'estuary',
    marineImpact: 'minimal',
    oxygenLevel: 7.8,
  },
]

const IMPACT_CONFIG: Record<
  SalinityGradientZone['marineImpact'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  significant: { label: 'Significant', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SalinityGradientMapper() {
  const salinityGradient = useMapStore((s) => s.salinityGradient)
  const setSalinityGradient = useMapStore((s) => s.setSalinityGradient)

  const zones = useMemo(
    () => (salinityGradient.zones.length > 0 ? salinityGradient.zones : DEMO_ZONES),
    [salinityGradient.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (salinityGradient.impactFilter !== 'all' && z.marineImpact !== salinityGradient.impactFilter) return false
      return true
    })
  }, [zones, salinityGradient.impactFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgSalinity: 0, significantSevereCount: 0, avgOxygen: 0 }
    }
    const avgSalinity =
      filteredZones.reduce((sum, z) => sum + z.salinity, 0) / filteredZones.length
    const significantSevereCount = filteredZones.filter(
      (z) => z.marineImpact === 'significant' || z.marineImpact === 'severe'
    ).length
    const avgOxygen =
      filteredZones.reduce((sum, z) => sum + z.oxygenLevel, 0) / filteredZones.length
    return {
      avgSalinity: Math.round(avgSalinity * 10) / 10,
      significantSevereCount,
      avgOxygen: Math.round(avgOxygen * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === salinityGradient.activeZoneId) ?? null,
    [zones, salinityGradient.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!salinityGradient.open) return null

  const overlayToggles: { key: keyof SalinityGradientState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSalinity', label: 'Salinity', icon: DropletsIcon2 },
    { key: 'showDepth', label: 'Depth', icon: ArrowDownFromLine },
    { key: 'showGradientType', label: 'Gradient Type', icon: Waves },
    { key: 'showOxygen', label: 'Oxygen', icon: Wind },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon2 className="h-4 w-4 text-teal-500" />
              Salinity Gradient Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSalinityGradient({ open: false })}
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
              Marine Impact
            </Label>
            <Select
              value={salinityGradient.impactFilter}
              onValueChange={(v) =>
                setSalinityGradient({
                  impactFilter: v as SalinityGradientState['impactFilter'],
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
                  <Icon className="h-3 w-3 text-teal-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={salinityGradient[key] as boolean}
                  onCheckedChange={(checked) => setSalinityGradient({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Salinity</div>
              <div className="text-sm font-semibold">{summary.avgSalinity}</div>
              <div className="text-[9px] text-muted-foreground">PSU</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Significant/Severe</div>
              <div className="text-sm font-semibold text-red-500">{summary.significantSevereCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg O₂</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgOxygen}</div>
              <div className="text-[9px] text-muted-foreground">mg/L</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Salinity Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = salinityGradient.activeZoneId === zone.id
                  const impactCfg = IMPACT_CONFIG[zone.marineImpact]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setSalinityGradient({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: impactCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${impactCfg.bgClass}`}
                        >
                          {impactCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {salinityGradient.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.salinity} PSU
                            </span>
                          </div>
                        )}
                        {salinityGradient.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {zone.depth} m
                            </span>
                          </div>
                        )}
                        {salinityGradient.showGradientType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {zone.gradientType}
                            </span>
                          </div>
                        )}
                        {salinityGradient.showOxygen && (
                          <div>
                            O₂:{' '}
                            <span className="text-foreground font-medium">
                              {zone.oxygenLevel} mg/L
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
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${IMPACT_CONFIG[activeZone.marineImpact].bgClass}`}
                  >
                    {IMPACT_CONFIG[activeZone.marineImpact].label}
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
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeZone.salinity} PSU</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeZone.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeZone.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gradient Type: </span>
                    <span className="font-medium">{activeZone.gradientType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Oxygen Level: </span>
                    <span className="font-medium">{activeZone.oxygenLevel} mg/L</span>
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
