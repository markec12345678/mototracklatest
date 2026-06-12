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
import { useMapStore, type GroundwaterRechargeState, type GroundwaterRechargeZone } from '@/lib/map-store'
import { Drill as DrillIcon, X, MapPin, Droplets, Shield, Thermometer, Filter } from 'lucide-react'

const DEMO_ZONES: GroundwaterRechargeZone[] = [
  {
    id: 'gr-ogallala',
    name: 'Ogallala Aquifer',
    latitude: 36.5,
    longitude: -101.5,
    rechargeRate: 15.2,
    waterTableDepth: 45,
    aquiferType: 'unconfined',
    extractionRate: 32.8,
    sustainability: 'overexploited',
    qualityIndex: 72,
  },
  {
    id: 'gr-nubian',
    name: 'Nubian Sandstone',
    latitude: 23.5,
    longitude: 25.0,
    rechargeRate: 2.1,
    waterTableDepth: 120,
    aquiferType: 'confined',
    extractionRate: 8.4,
    sustainability: 'critical',
    qualityIndex: 85,
  },
  {
    id: 'gr-guarani',
    name: 'Guaraní Aquifer',
    latitude: -23.0,
    longitude: -54.0,
    rechargeRate: 42.5,
    waterTableDepth: 80,
    aquiferType: 'confined',
    extractionRate: 18.3,
    sustainability: 'sustainable',
    qualityIndex: 91,
  },
  {
    id: 'gr-great-artesian',
    name: 'Great Artesian Basin',
    latitude: -25.5,
    longitude: 142.0,
    rechargeRate: 8.7,
    waterTableDepth: 200,
    aquiferType: 'confined',
    extractionRate: 12.1,
    sustainability: 'marginal',
    qualityIndex: 78,
  },
  {
    id: 'gr-sahara',
    name: 'Sahara Aquifer System',
    latitude: 28.0,
    longitude: 5.0,
    rechargeRate: 1.3,
    waterTableDepth: 350,
    aquiferType: 'semi_confined',
    extractionRate: 15.6,
    sustainability: 'critical',
    qualityIndex: 65,
  },
  {
    id: 'gr-california',
    name: 'California Central Valley',
    latitude: 37.0,
    longitude: -120.5,
    rechargeRate: 22.4,
    waterTableDepth: 60,
    aquiferType: 'unconfined',
    extractionRate: 45.2,
    sustainability: 'overexploited',
    qualityIndex: 58,
  },
]

const AQUIFER_CONFIG: Record<
  GroundwaterRechargeZone['aquiferType'],
  { label: string; color: string; bgClass: string }
> = {
  unconfined: { label: 'Unconfined', color: '#14b8a6', bgClass: 'bg-teal-500/10 text-teal-600 border-teal-500/30' },
  confined: { label: 'Confined', color: '#0d9488', bgClass: 'bg-teal-600/10 text-teal-700 border-teal-600/30' },
  semi_confined: { label: 'Semi-Confined', color: '#5eead4', bgClass: 'bg-teal-400/10 text-teal-500 border-teal-400/30' },
  karst: { label: 'Karst', color: '#2dd4bf', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

const SUSTAINABILITY_CONFIG: Record<
  GroundwaterRechargeZone['sustainability'],
  { label: string; color: string; bgClass: string }
> = {
  sustainable: { label: 'Sustainable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  marginal: { label: 'Marginal', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  overexploited: { label: 'Overexploited', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GroundwaterRechargeTracker() {
  const groundwaterRecharge = useMapStore((s) => s.groundwaterRecharge)
  const setGroundwaterRecharge = useMapStore((s) => s.setGroundwaterRecharge)

  const zones = useMemo(
    () => (groundwaterRecharge.zones.length > 0 ? groundwaterRecharge.zones : DEMO_ZONES),
    [groundwaterRecharge.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (groundwaterRecharge.aquiferFilter !== 'all' && z.aquiferType !== groundwaterRecharge.aquiferFilter) return false
      return true
    })
  }, [zones, groundwaterRecharge.aquiferFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgRecharge: 0, criticalCount: 0, avgQuality: 0 }
    }
    const avgRecharge = Math.round(
      (filteredZones.reduce((sum, z) => sum + z.rechargeRate, 0) / filteredZones.length) * 10
    ) / 10
    const criticalCount = filteredZones.filter(
      (z) => z.sustainability === 'critical' || z.sustainability === 'overexploited'
    ).length
    const avgQuality = Math.round(
      filteredZones.reduce((sum, z) => sum + z.qualityIndex, 0) / filteredZones.length
    )
    return { avgRecharge, criticalCount, avgQuality }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === groundwaterRecharge.activeZoneId) ?? null,
    [zones, groundwaterRecharge.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!groundwaterRecharge.open) return null

  const overlayToggles: { key: keyof GroundwaterRechargeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRechargeRate', label: 'Recharge Rate', icon: Droplets },
    { key: 'showWaterTable', label: 'Water Table', icon: DrillIcon },
    { key: 'showSustainability', label: 'Sustainability', icon: Shield },
    { key: 'showQuality', label: 'Quality Index', icon: Thermometer },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DrillIcon className="h-4 w-4 text-teal-500" />
              Groundwater Recharge Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGroundwaterRecharge({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Aquifer Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Aquifer Type
            </Label>
            <Select
              value={groundwaterRecharge.aquiferFilter}
              onValueChange={(v) =>
                setGroundwaterRecharge({
                  aquiferFilter: v as GroundwaterRechargeState['aquiferFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unconfined">Unconfined</SelectItem>
                <SelectItem value="confined">Confined</SelectItem>
                <SelectItem value="semi_confined">Semi-Confined</SelectItem>
                <SelectItem value="karst">Karst</SelectItem>
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
                  checked={groundwaterRecharge[key] as boolean}
                  onCheckedChange={(checked) => setGroundwaterRecharge({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Recharge</div>
              <div className="text-sm font-semibold text-teal-500">{summary.avgRecharge}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">At Risk</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Quality</div>
              <div className="text-sm font-semibold">{summary.avgQuality}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Recharge Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = groundwaterRecharge.activeZoneId === zone.id
                  const aquiferCfg = AQUIFER_CONFIG[zone.aquiferType]
                  const sustainCfg = SUSTAINABILITY_CONFIG[zone.sustainability]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setGroundwaterRecharge({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: sustainCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${sustainCfg.bgClass}`}
                        >
                          {sustainCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {groundwaterRecharge.showRechargeRate && (
                          <div>
                            Recharge:{' '}
                            <span className="text-foreground font-medium">
                              {zone.rechargeRate} mm/yr
                            </span>
                          </div>
                        )}
                        {groundwaterRecharge.showWaterTable && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {zone.waterTableDepth} m
                            </span>
                          </div>
                        )}
                        {groundwaterRecharge.showSustainability && (
                          <div>
                            Extraction:{' '}
                            <span className="text-foreground font-medium">
                              {zone.extractionRate} mm/yr
                            </span>
                          </div>
                        )}
                        {groundwaterRecharge.showQuality && (
                          <div>
                            Quality:{' '}
                            <span className="text-foreground font-medium">
                              {zone.qualityIndex}/100
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
                    className={`text-[10px] h-5 ml-auto ${SUSTAINABILITY_CONFIG[activeZone.sustainability].bgClass}`}
                  >
                    {SUSTAINABILITY_CONFIG[activeZone.sustainability].label}
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
                    <span className="text-muted-foreground">Aquifer: </span>
                    <span className="font-medium">{AQUIFER_CONFIG[activeZone.aquiferType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recharge Rate: </span>
                    <span className="font-medium">{activeZone.rechargeRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Table: </span>
                    <span className="font-medium">{activeZone.waterTableDepth} m depth</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Extraction: </span>
                    <span className="font-medium">{activeZone.extractionRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality Index: </span>
                    <span className="font-medium">{activeZone.qualityIndex}/100</span>
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
