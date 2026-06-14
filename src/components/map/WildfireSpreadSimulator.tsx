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
import { useMapStore, type WildfireSpreadState, type WildfireSpread } from '@/lib/map-store'
import { Flame as FlameIcon4, X, MapPin, Wind, Shield, AlertTriangle, Filter } from 'lucide-react'

const DEMO_FIRES: WildfireSpread[] = [
  {
    id: 'wf-california',
    name: 'California Dixie Fire',
    latitude: 39.9,
    longitude: -121.4,
    fireSize: 389837,
    spreadRate: 2800,
    containmentPercent: 45,
    windSpeed: 35,
    windDirection: 'SW',
    fuelType: 'forest',
    terrainDifficulty: 'extreme',
    threatLevel: 'extreme',
    evacuationRadius: 25,
  },
  {
    id: 'wf-australia',
    name: 'Australia Blue Mountains Fire',
    latitude: -33.7,
    longitude: 150.3,
    fireSize: 125000,
    spreadRate: 1500,
    containmentPercent: 62,
    windSpeed: 45,
    windDirection: 'NW',
    fuelType: 'forest',
    terrainDifficulty: 'difficult',
    threatLevel: 'high',
    evacuationRadius: 18,
  },
  {
    id: 'wf-portugal',
    name: 'Portugal Algarve Wildfire',
    latitude: 37.0,
    longitude: -7.9,
    fireSize: 45000,
    spreadRate: 900,
    containmentPercent: 78,
    windSpeed: 28,
    windDirection: 'E',
    fuelType: 'shrubland',
    terrainDifficulty: 'moderate',
    threatLevel: 'moderate',
    evacuationRadius: 8,
  },
  {
    id: 'wf-canada',
    name: 'Canada Alberta Grassland Fire',
    latitude: 53.9,
    longitude: -116.5,
    fireSize: 82000,
    spreadRate: 3200,
    containmentPercent: 35,
    windSpeed: 50,
    windDirection: 'W',
    fuelType: 'grassland',
    terrainDifficulty: 'easy',
    threatLevel: 'high',
    evacuationRadius: 15,
  },
  {
    id: 'wf-indonesia',
    name: 'Indonesia Kalimantan Fire',
    latitude: -1.5,
    longitude: 113.0,
    fireSize: 210000,
    spreadRate: 1100,
    containmentPercent: 55,
    windSpeed: 20,
    windDirection: 'SE',
    fuelType: 'mixed',
    terrainDifficulty: 'difficult',
    threatLevel: 'moderate',
    evacuationRadius: 12,
  },
  {
    id: 'wf-siberia',
    name: 'Siberia Taiga Fire',
    latitude: 62.0,
    longitude: 110.0,
    fireSize: 500000,
    spreadRate: 2200,
    containmentPercent: 20,
    windSpeed: 30,
    windDirection: 'N',
    fuelType: 'forest',
    terrainDifficulty: 'extreme',
    threatLevel: 'extreme',
    evacuationRadius: 30,
  },
]

const THREAT_LEVEL_CONFIG: Record<
  WildfireSpread['threatLevel'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function WildfireSpreadSimulator() {
  const wildfireSpread = useMapStore((s) => s.wildfireSpread)
  const setWildfireSpread = useMapStore((s) => s.setWildfireSpread)

  const fires = useMemo(
    () => (wildfireSpread.fires.length > 0 ? wildfireSpread.fires : DEMO_FIRES),
    [wildfireSpread.fires]
  )

  const filteredFires = useMemo(() => {
    return fires.filter((f) => {
      if (wildfireSpread.fuelFilter !== 'all' && f.fuelType !== wildfireSpread.fuelFilter) return false
      return true
    })
  }, [fires, wildfireSpread.fuelFilter])

  const summary = useMemo(() => {
    if (filteredFires.length === 0) {
      return { avgSpreadRate: 0, avgContainment: 0, extremeCount: 0 }
    }
    const avgSpreadRate =
      filteredFires.reduce((sum, f) => sum + f.spreadRate, 0) / filteredFires.length
    const avgContainment =
      filteredFires.reduce((sum, f) => sum + f.containmentPercent, 0) / filteredFires.length
    const extremeCount = filteredFires.filter((f) => f.threatLevel === 'extreme').length
    return {
      avgSpreadRate: Math.round(avgSpreadRate),
      avgContainment: Math.round(avgContainment),
      extremeCount,
    }
  }, [filteredFires])

  const activeFire = useMemo(
    () => fires.find((f) => f.id === wildfireSpread.activeFireId) ?? null,
    [fires, wildfireSpread.activeFireId]
  )

  if (typeof window === 'undefined') return null
  if (!wildfireSpread.open) return null

  const overlayToggles: { key: keyof WildfireSpreadState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpreadRate', label: 'Spread Rate', icon: Wind },
    { key: 'showContainment', label: 'Containment', icon: Shield },
    { key: 'showThreatLevel', label: 'Threat Level', icon: AlertTriangle },
    { key: 'showEvacuationRadius', label: 'Evacuation Radius', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon4 className="h-4 w-4 text-orange-500" />
              Wildfire Spread Simulator
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWildfireSpread({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Fuel Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Fuel Type
            </Label>
            <Select
              value={wildfireSpread.fuelFilter}
              onValueChange={(v) =>
                setWildfireSpread({
                  fuelFilter: v as WildfireSpreadState['fuelFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="grassland">Grassland</SelectItem>
                <SelectItem value="shrubland">Shrubland</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={wildfireSpread[key] as boolean}
                  onCheckedChange={(checked) => setWildfireSpread({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Spread Rate</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgSpreadRate}</div>
              <div className="text-[9px] text-muted-foreground">ha/hr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Containment</div>
              <div className="text-sm font-semibold">{summary.avgContainment}%</div>
              <div className="text-[9px] text-muted-foreground">contained</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Extreme Threat</div>
              <div className="text-sm font-semibold text-red-500">{summary.extremeCount}</div>
              <div className="text-[9px] text-muted-foreground">fires</div>
            </div>
          </div>

          <Separator />

          {/* Fire List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Wildfire Events ({filteredFires.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFires.map((fire) => {
                  const isActive = wildfireSpread.activeFireId === fire.id
                  const threatCfg = THREAT_LEVEL_CONFIG[fire.threatLevel]
                  return (
                    <div
                      key={fire.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setWildfireSpread({
                          activeFireId: isActive ? null : fire.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: threatCfg.color }}
                          />
                          <span className="text-xs font-medium">{fire.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${threatCfg.bgClass}`}
                        >
                          {threatCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {wildfireSpread.showSpreadRate && (
                          <div>
                            Spread:{' '}
                            <span className="text-foreground font-medium">
                              {fire.spreadRate.toLocaleString()} ha/hr
                            </span>
                          </div>
                        )}
                        {wildfireSpread.showContainment && (
                          <div>
                            Contained:{' '}
                            <span className="text-foreground font-medium">
                              {fire.containmentPercent}%
                            </span>
                          </div>
                        )}
                        {wildfireSpread.showThreatLevel && (
                          <div>
                            Threat:{' '}
                            <span className="text-foreground font-medium">
                              {fire.threatLevel}
                            </span>
                          </div>
                        )}
                        {wildfireSpread.showEvacuationRadius && (
                          <div>
                            Evacuation:{' '}
                            <span className="text-foreground font-medium">
                              {fire.evacuationRadius} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFires.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No fires match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Fire Details */}
          {activeFire && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeFire.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${THREAT_LEVEL_CONFIG[activeFire.threatLevel].bgClass}`}
                  >
                    {THREAT_LEVEL_CONFIG[activeFire.threatLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeFire.latitude.toFixed(2)}, {activeFire.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fire Size: </span>
                    <span className="font-medium">{activeFire.fireSize.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spread Rate: </span>
                    <span className="font-medium">{activeFire.spreadRate.toLocaleString()} ha/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Containment: </span>
                    <span className="font-medium">{activeFire.containmentPercent}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind: </span>
                    <span className="font-medium">{activeFire.windSpeed} km/h {activeFire.windDirection}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fuel Type: </span>
                    <span className="font-medium capitalize">{activeFire.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Terrain: </span>
                    <span className="font-medium capitalize">{activeFire.terrainDifficulty}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Evacuation: </span>
                    <span className="font-medium">{activeFire.evacuationRadius} km</span>
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
