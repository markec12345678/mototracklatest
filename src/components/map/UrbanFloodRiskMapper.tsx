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
import { useMapStore, type UrbanFloodRiskState, type UrbanFloodZone } from '@/lib/map-store'
import { Droplets as DropletsIcon3, X, Gauge as GaugeIcon, Building as BuildingIcon, Users as UsersIcon, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: UrbanFloodZone[] = [
  {
    id: 'uf-mumbai',
    name: 'Mumbai Coastal Zone',
    latitude: 19.08,
    longitude: 72.88,
    floodRisk: 'extreme',
    drainageCapacity: 35,
    imperviousSurface: 82,
    populationDensity: 32400,
    historicalFloods: 14,
    infrastructureAge: 45,
    greenInfrastructure: 12,
  },
  {
    id: 'uf-houston',
    name: 'Houston Metro Area',
    latitude: 29.76,
    longitude: -95.37,
    floodRisk: 'high',
    drainageCapacity: 48,
    imperviousSurface: 71,
    populationDensity: 5200,
    historicalFloods: 9,
    infrastructureAge: 38,
    greenInfrastructure: 18,
  },
  {
    id: 'uf-tokyo',
    name: 'Tokyo Lowland District',
    latitude: 35.69,
    longitude: 139.69,
    floodRisk: 'moderate',
    drainageCapacity: 78,
    imperviousSurface: 65,
    populationDensity: 15800,
    historicalFloods: 5,
    infrastructureAge: 25,
    greenInfrastructure: 28,
  },
  {
    id: 'uf-rotterdam',
    name: 'Rotterdam Delta Zone',
    latitude: 51.92,
    longitude: 4.49,
    floodRisk: 'low',
    drainageCapacity: 92,
    imperviousSurface: 55,
    populationDensity: 3100,
    historicalFloods: 2,
    infrastructureAge: 15,
    greenInfrastructure: 42,
  },
  {
    id: 'uf-dhaka',
    name: 'Dhaka Urban Core',
    latitude: 23.81,
    longitude: 90.41,
    floodRisk: 'extreme',
    drainageCapacity: 22,
    imperviousSurface: 88,
    populationDensity: 47500,
    historicalFloods: 18,
    infrastructureAge: 55,
    greenInfrastructure: 6,
  },
  {
    id: 'uf-copenhagen',
    name: 'Copenhagen Cloudburst Zone',
    latitude: 55.68,
    longitude: 12.57,
    floodRisk: 'minimal',
    drainageCapacity: 88,
    imperviousSurface: 42,
    populationDensity: 2800,
    historicalFloods: 1,
    infrastructureAge: 12,
    greenInfrastructure: 55,
  },
]

const RISK_CONFIG: Record<
  UrbanFloodZone['floodRisk'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function UrbanFloodRiskMapper() {
  const urbanFloodRisk = useMapStore((s) => s.urbanFloodRisk)
  const setUrbanFloodRisk = useMapStore((s) => s.setUrbanFloodRisk)

  const zones = useMemo(
    () => (urbanFloodRisk.zones.length > 0 ? urbanFloodRisk.zones : DEMO_ZONES),
    [urbanFloodRisk.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (urbanFloodRisk.riskFilter !== 'all' && z.floodRisk !== urbanFloodRisk.riskFilter) return false
      return true
    })
  }, [zones, urbanFloodRisk.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { highExtremeCount: 0, avgDrainage: 0, avgGreenInfra: 0 }
    }
    const highExtremeCount = filteredZones.filter(
      (z) => z.floodRisk === 'high' || z.floodRisk === 'extreme'
    ).length
    const avgDrainage =
      filteredZones.reduce((sum, z) => sum + z.drainageCapacity, 0) / filteredZones.length
    const avgGreenInfra =
      filteredZones.reduce((sum, z) => sum + z.greenInfrastructure, 0) / filteredZones.length
    return {
      highExtremeCount,
      avgDrainage: Math.round(avgDrainage),
      avgGreenInfra: Math.round(avgGreenInfra),
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === urbanFloodRisk.activeZoneId) ?? null,
    [zones, urbanFloodRisk.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!urbanFloodRisk.open) return null

  const overlayToggles: { key: keyof UrbanFloodRiskState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFloodRisk', label: 'Flood Risk', icon: DropletsIcon3 },
    { key: 'showDrainageCapacity', label: 'Drainage Capacity', icon: GaugeIcon },
    { key: 'showImperviousSurface', label: 'Impervious Surface', icon: BuildingIcon },
    { key: 'showPopulationDensity', label: 'Population', icon: UsersIcon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon3 className="h-4 w-4 text-rose-500" />
              Urban Flood Risk Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUrbanFloodRisk({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={urbanFloodRisk.riskFilter}
              onValueChange={(v) =>
                setUrbanFloodRisk({
                  riskFilter: v as UrbanFloodRiskState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
                  checked={urbanFloodRisk[key] as boolean}
                  onCheckedChange={(checked) => setUrbanFloodRisk({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Drainage</div>
              <div className="text-sm font-semibold">{summary.avgDrainage}%</div>
              <div className="text-[9px] text-muted-foreground">capacity</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Green Infra</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.avgGreenInfra}%</div>
              <div className="text-[9px] text-muted-foreground">coverage</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Flood Risk Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = urbanFloodRisk.activeZoneId === zone.id
                  const riskCfg = RISK_CONFIG[zone.floodRisk]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-500/5'
                          : 'border-border/40 hover:border-rose-500/20 hover:bg-rose-500/5'
                      }`}
                      onClick={() =>
                        setUrbanFloodRisk({
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
                        {urbanFloodRisk.showFloodRisk && (
                          <div>
                            Floods:{' '}
                            <span className="text-foreground font-medium">
                              {zone.historicalFloods}
                            </span>
                          </div>
                        )}
                        {urbanFloodRisk.showDrainageCapacity && (
                          <div>
                            Drainage:{' '}
                            <span className="text-foreground font-medium">
                              {zone.drainageCapacity}%
                            </span>
                          </div>
                        )}
                        {urbanFloodRisk.showImperviousSurface && (
                          <div>
                            Impervious:{' '}
                            <span className="text-foreground font-medium">
                              {zone.imperviousSurface}%
                            </span>
                          </div>
                        )}
                        {urbanFloodRisk.showPopulationDensity && (
                          <div>
                            Pop:{" "}
                            <span className="text-foreground font-medium">
                              {zone.populationDensity.toLocaleString()}/km²
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
              <div className="space-y-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RISK_CONFIG[activeZone.floodRisk].bgClass}`}
                  >
                    {RISK_CONFIG[activeZone.floodRisk].label}
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
                    <span className="text-muted-foreground">Flood Risk: </span>
                    <span className="font-medium capitalize">{activeZone.floodRisk}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Drainage: </span>
                    <span className="font-medium">{activeZone.drainageCapacity}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impervious: </span>
                    <span className="font-medium">{activeZone.imperviousSurface}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{activeZone.populationDensity.toLocaleString()}/km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Historical Floods: </span>
                    <span className="font-medium">{activeZone.historicalFloods}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Infra Age: </span>
                    <span className="font-medium">{activeZone.infrastructureAge} years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Green Infra: </span>
                    <span className="font-medium">{activeZone.greenInfrastructure}%</span>
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
