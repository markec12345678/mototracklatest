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
import { useMapStore, type LightPollutionSkyState, type LightPollutionSkyZone } from '@/lib/map-store'
import { Eye as EyeIcon2, X, MapPin, Star, Zap, SunDim, Filter } from 'lucide-react'

const DEMO_ZONES: LightPollutionSkyZone[] = [
  {
    id: 'lp-london',
    name: 'Central London',
    latitude: 51.5074,
    longitude: -0.1278,
    skyBrightness: 18.5,
    bortleScale: 8,
    lightSourceType: 'urban',
    visibleStars: 45,
    impactRadius: 35,
    energyWaste: 4200,
  },
  {
    id: 'lp-tokyo',
    name: 'Tokyo Metro',
    latitude: 35.6762,
    longitude: 139.6503,
    skyBrightness: 19.2,
    bortleScale: 9,
    lightSourceType: 'mixed',
    visibleStars: 20,
    impactRadius: 50,
    energyWaste: 6800,
  },
  {
    id: 'lp-vegas',
    name: 'Las Vegas Strip',
    latitude: 36.1699,
    longitude: -115.1398,
    skyBrightness: 18.8,
    bortleScale: 8,
    lightSourceType: 'commercial',
    visibleStars: 35,
    impactRadius: 45,
    energyWaste: 5100,
  },
  {
    id: 'lp-cairo',
    name: 'Cairo Downtown',
    latitude: 30.0444,
    longitude: 31.2357,
    skyBrightness: 17.9,
    bortleScale: 7,
    lightSourceType: 'residential',
    visibleStars: 120,
    impactRadius: 28,
    energyWaste: 2300,
  },
  {
    id: 'lp-moscow',
    name: 'Moscow Center',
    latitude: 55.7558,
    longitude: 37.6173,
    skyBrightness: 18.2,
    bortleScale: 8,
    lightSourceType: 'industrial',
    visibleStars: 55,
    impactRadius: 38,
    energyWaste: 3600,
  },
  {
    id: 'lp-atacama',
    name: 'Atacama Desert',
    latitude: -24.6342,
    longitude: -70.3976,
    skyBrightness: 21.8,
    bortleScale: 1,
    lightSourceType: 'residential',
    visibleStars: 8500,
    impactRadius: 2,
    energyWaste: 12,
  },
]

const SOURCE_CONFIG: Record<
  LightPollutionSkyZone['lightSourceType'],
  { label: string; color: string; bgClass: string }
> = {
  urban: { label: 'Urban', color: '#818cf8', bgClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30' },
  industrial: { label: 'Industrial', color: '#a78bfa', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  commercial: { label: 'Commercial', color: '#c084fc', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  residential: { label: 'Residential', color: '#f0abfc', bgClass: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/30' },
  mixed: { label: 'Mixed', color: '#e879f9', bgClass: 'bg-pink-500/10 text-pink-600 border-pink-500/30' },
}

const BORTLE_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Excellent', color: '#22c55e' },
  2: { label: 'Typical Dark', color: '#4ade80' },
  3: { label: 'Rural', color: '#86efac' },
  4: { label: 'Rural/Suburban', color: '#fde047' },
  5: { label: 'Suburban', color: '#facc15' },
  6: { label: 'Bright Suburban', color: '#fb923c' },
  7: { label: 'Suburban/Urban', color: '#f97316' },
  8: { label: 'City', color: '#ef4444' },
  9: { label: 'Inner City', color: '#dc2626' },
}

export function LightPollutionMapper() {
  const lightPollutionSky = useMapStore((s) => s.lightPollutionSky)
  const setLightPollutionSky = useMapStore((s) => s.setLightPollutionSky)

  const zones = useMemo(
    () => (lightPollutionSky.zones.length > 0 ? lightPollutionSky.zones : DEMO_ZONES),
    [lightPollutionSky.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (lightPollutionSky.sourceFilter !== 'all' && z.lightSourceType !== lightPollutionSky.sourceFilter) return false
      return true
    })
  }, [zones, lightPollutionSky.sourceFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgBortle: 0, avgStars: 0, totalEnergyWaste: 0 }
    }
    const avgBortle = Math.round(
      (filteredZones.reduce((sum, z) => sum + z.bortleScale, 0) / filteredZones.length) * 10
    ) / 10
    const avgStars = Math.round(
      filteredZones.reduce((sum, z) => sum + z.visibleStars, 0) / filteredZones.length
    )
    const totalEnergyWaste = filteredZones.reduce((sum, z) => sum + z.energyWaste, 0)
    return { avgBortle, avgStars, totalEnergyWaste }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === lightPollutionSky.activeZoneId) ?? null,
    [zones, lightPollutionSky.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!lightPollutionSky.open) return null

  const overlayToggles: { key: keyof LightPollutionSkyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBortleScale', label: 'Bortle Scale', icon: Star },
    { key: 'showSkyBrightness', label: 'Sky Brightness', icon: SunDim },
    { key: 'showVisibleStars', label: 'Visible Stars', icon: EyeIcon2 },
    { key: 'showEnergyWaste', label: 'Energy Waste', icon: Zap },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <EyeIcon2 className="h-4 w-4 text-indigo-500" />
              Light Pollution Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLightPollutionSky({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Source Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Source Type
            </Label>
            <Select
              value={lightPollutionSky.sourceFilter}
              onValueChange={(v) =>
                setLightPollutionSky({
                  sourceFilter: v as LightPollutionSkyState['sourceFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
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
                  <Icon className="h-3 w-3 text-indigo-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={lightPollutionSky[key] as boolean}
                  onCheckedChange={(checked) => setLightPollutionSky({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Bortle</div>
              <div className="text-sm font-semibold text-indigo-500">{summary.avgBortle}</div>
              <div className="text-[9px] text-muted-foreground">scale 1-9</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Stars</div>
              <div className="text-sm font-semibold text-violet-500">{summary.avgStars.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">visible</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Energy Waste</div>
              <div className="text-sm font-semibold">{summary.totalEnergyWaste.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">GWh/yr</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Pollution Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = lightPollutionSky.activeZoneId === zone.id
                  const sourceCfg = SOURCE_CONFIG[zone.lightSourceType]
                  const bortleCfg = BORTLE_CONFIG[zone.bortleScale]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-border/40 hover:border-indigo-500/20 hover:bg-indigo-500/5'
                      }`}
                      onClick={() =>
                        setLightPollutionSky({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: bortleCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sourceCfg.bgClass}`}
                        >
                          {sourceCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {lightPollutionSky.showBortleScale && (
                          <div>
                            Bortle:{' '}
                            <span className="text-foreground font-medium">
                              {zone.bortleScale} ({bortleCfg.label})
                            </span>
                          </div>
                        )}
                        {lightPollutionSky.showSkyBrightness && (
                          <div>
                            Brightness:{' '}
                            <span className="text-foreground font-medium">
                              {zone.skyBrightness} mag/arcsec²
                            </span>
                          </div>
                        )}
                        {lightPollutionSky.showVisibleStars && (
                          <div>
                            Stars:{' '}
                            <span className="text-foreground font-medium">
                              {zone.visibleStars.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {lightPollutionSky.showEnergyWaste && (
                          <div>
                            Energy Waste:{' '}
                            <span className="text-foreground font-medium">
                              {zone.energyWaste.toLocaleString()} GWh/yr
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
              <div className="space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SOURCE_CONFIG[activeZone.lightSourceType].bgClass}`}
                  >
                    {SOURCE_CONFIG[activeZone.lightSourceType].label}
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
                    <span className="text-muted-foreground">Bortle Scale: </span>
                    <span className="font-medium">
                      {activeZone.bortleScale} ({BORTLE_CONFIG[activeZone.bortleScale].label})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sky Brightness: </span>
                    <span className="font-medium">{activeZone.skyBrightness} mag/arcsec²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visible Stars: </span>
                    <span className="font-medium">{activeZone.visibleStars.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact Radius: </span>
                    <span className="font-medium">{activeZone.impactRadius} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Energy Waste: </span>
                    <span className="font-medium">{activeZone.energyWaste.toLocaleString()} GWh/yr</span>
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
