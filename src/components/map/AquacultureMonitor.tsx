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
import { useMapStore, type AquacultureState, type AquacultureZone } from '@/lib/map-store'
import { Fish as FishIcon3, X, MapPin, Droplets, AlertTriangle, Filter, Scale } from 'lucide-react'

const DEMO_ZONES: AquacultureZone[] = [
  {
    id: 'aq-norway-salmon',
    name: 'Norway Salmon Cage Farm',
    latitude: 62.0,
    longitude: 5.5,
    species: 'Atlantic Salmon',
    farmType: 'cage',
    area: 120,
    production: 8500,
    waterQuality: 88,
    temperature: 8.5,
    diseaseRisk: 'low',
    sustainability: 'certified',
  },
  {
    id: 'aq-thailand-shrimp',
    name: 'Thailand Shrimp Pond',
    latitude: 13.0,
    longitude: 100.5,
    species: 'Pacific White Shrimp',
    farmType: 'pond',
    area: 80,
    production: 4200,
    waterQuality: 65,
    temperature: 28.0,
    diseaseRisk: 'high',
    sustainability: 'concerning',
  },
  {
    id: 'aq-japan-oyster',
    name: 'Japan Oyster Rack Farm',
    latitude: 33.5,
    longitude: 132.5,
    species: 'Pacific Oyster',
    farmType: 'rack',
    area: 45,
    production: 2800,
    waterQuality: 78,
    temperature: 18.0,
    diseaseRisk: 'moderate',
    sustainability: 'improving',
  },
  {
    id: 'aq-scotland-trout',
    name: 'Scotland Trout Tank',
    latitude: 56.0,
    longitude: -4.5,
    species: 'Rainbow Trout',
    farmType: 'tank',
    area: 25,
    production: 1500,
    waterQuality: 82,
    temperature: 12.0,
    diseaseRisk: 'low',
    sustainability: 'certified',
  },
  {
    id: 'aq-chile-salmon',
    name: 'Chile Salmon Raceway',
    latitude: -41.5,
    longitude: -72.5,
    species: 'Atlantic Salmon',
    farmType: 'raceway',
    area: 95,
    production: 6200,
    waterQuality: 55,
    temperature: 11.0,
    diseaseRisk: 'critical',
    sustainability: 'unsustainable',
  },
  {
    id: 'aq-vietnam-pangasius',
    name: 'Vietnam Pangasius Pond',
    latitude: 10.5,
    longitude: 106.0,
    species: 'Pangasius Catfish',
    farmType: 'pond',
    area: 150,
    production: 12000,
    waterQuality: 60,
    temperature: 30.0,
    diseaseRisk: 'moderate',
    sustainability: 'improving',
  },
]

const DISEASE_RISK_CONFIG: Record<
  AquacultureZone['diseaseRisk'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SUSTAINABILITY_CONFIG: Record<
  AquacultureZone['sustainability'],
  { label: string; color: string; bgClass: string }
> = {
  certified: { label: 'Certified', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  improving: { label: 'Improving', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  concerning: { label: 'Concerning', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unsustainable: { label: 'Unsustainable', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function AquacultureMonitor() {
  const aquaculture = useMapStore((s) => s.aquaculture)
  const setAquaculture = useMapStore((s) => s.setAquaculture)

  const zones = useMemo(
    () => (aquaculture.zones.length > 0 ? aquaculture.zones : DEMO_ZONES),
    [aquaculture.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (aquaculture.farmTypeFilter !== 'all' && z.farmType !== aquaculture.farmTypeFilter) return false
      return true
    })
  }, [zones, aquaculture.farmTypeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { totalProduction: 0, avgWaterQuality: 0, criticalCount: 0 }
    }
    const totalProduction = filteredZones.reduce((sum, z) => sum + z.production, 0)
    const avgWaterQuality =
      filteredZones.reduce((sum, z) => sum + z.waterQuality, 0) / filteredZones.length
    const criticalCount = filteredZones.filter((z) => z.diseaseRisk === 'critical').length
    return {
      totalProduction,
      avgWaterQuality: Math.round(avgWaterQuality),
      criticalCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === aquaculture.activeZoneId) ?? null,
    [zones, aquaculture.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!aquaculture.open) return null

  const overlayToggles: { key: keyof AquacultureState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showProduction', label: 'Production', icon: Scale },
    { key: 'showWaterQuality', label: 'Water Quality', icon: Droplets },
    { key: 'showDiseaseRisk', label: 'Disease Risk', icon: AlertTriangle },
    { key: 'showSustainability', label: 'Sustainability', icon: FishIcon3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FishIcon3 className="h-4 w-4 text-cyan-500" />
              Aquaculture Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAquaculture({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Farm Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Farm Type
            </Label>
            <Select
              value={aquaculture.farmTypeFilter}
              onValueChange={(v) =>
                setAquaculture({
                  farmTypeFilter: v as AquacultureState['farmTypeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cage">Cage</SelectItem>
                <SelectItem value="pond">Pond</SelectItem>
                <SelectItem value="rack">Rack</SelectItem>
                <SelectItem value="tank">Tank</SelectItem>
                <SelectItem value="raceway">Raceway</SelectItem>
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
                  checked={aquaculture[key] as boolean}
                  onCheckedChange={(checked) => setAquaculture({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Production</div>
              <div className="text-sm font-semibold text-cyan-500">{(summary.totalProduction / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-muted-foreground">tonnes/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Water Quality</div>
              <div className="text-sm font-semibold">{summary.avgWaterQuality}</div>
              <div className="text-[9px] text-muted-foreground">/ 100</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical Disease</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Aquaculture Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = aquaculture.activeZoneId === zone.id
                  const riskCfg = DISEASE_RISK_CONFIG[zone.diseaseRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setAquaculture({
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
                        {aquaculture.showProduction && (
                          <div>
                            Production:{' '}
                            <span className="text-foreground font-medium">
                              {zone.production.toLocaleString()} t/yr
                            </span>
                          </div>
                        )}
                        {aquaculture.showWaterQuality && (
                          <div>
                            Water Quality:{' '}
                            <span className="text-foreground font-medium">
                              {zone.waterQuality}/100
                            </span>
                          </div>
                        )}
                        {aquaculture.showDiseaseRisk && (
                          <div>
                            Disease Risk:{' '}
                            <span className="text-foreground font-medium">
                              {zone.diseaseRisk}
                            </span>
                          </div>
                        )}
                        {aquaculture.showSustainability && (
                          <div>
                            Sustainability:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${SUSTAINABILITY_CONFIG[zone.sustainability].bgClass}`}
                            >
                              {SUSTAINABILITY_CONFIG[zone.sustainability].label}
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
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DISEASE_RISK_CONFIG[activeZone.diseaseRisk].bgClass}`}
                  >
                    {DISEASE_RISK_CONFIG[activeZone.diseaseRisk].label}
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
                    <span className="text-muted-foreground">Species: </span>
                    <span className="font-medium">{activeZone.species}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Farm Type: </span>
                    <span className="font-medium capitalize">{activeZone.farmType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeZone.area} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Production: </span>
                    <span className="font-medium">{activeZone.production.toLocaleString()} t/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Quality: </span>
                    <span className="font-medium">{activeZone.waterQuality}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sustainability: </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${SUSTAINABILITY_CONFIG[activeZone.sustainability].bgClass}`}
                    >
                      {SUSTAINABILITY_CONFIG[activeZone.sustainability].label}
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
