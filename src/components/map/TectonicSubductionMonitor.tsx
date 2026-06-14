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
import { useMapStore, type TectonicSubductionState, type SubductionZone } from '@/lib/map-store'
import { Layers, X, MapPin, Filter, ArrowRight, ArrowDown, AlertTriangle, Waves } from 'lucide-react'

const DEMO_ZONES: SubductionZone[] = [
  {
    id: 'ts-cascadia',
    name: 'Cascadia Subduction Zone',
    latitude: 46.20,
    longitude: -124.10,
    convergenceRate: 40,
    subductionAngle: 12,
    slabDepth: 650,
    megathrustPotential: 'very_high',
    volcanicArc: 'Cascade Range',
    maxRecordedEarthquake: 9.0,
    tsunamiHistory: 'catastrophic',
    lockingStatus: 'fully_locked',
  },
  {
    id: 'ts-chile',
    name: 'Chile-Peru Trench',
    latitude: -23.50,
    longitude: -70.50,
    convergenceRate: 80,
    subductionAngle: 15,
    slabDepth: 700,
    megathrustPotential: 'very_high',
    volcanicArc: 'Andes Volcanic Belt',
    maxRecordedEarthquake: 9.5,
    tsunamiHistory: 'catastrophic',
    lockingStatus: 'partially_locked',
  },
  {
    id: 'ts-japan',
    name: 'Japan Trench',
    latitude: 38.00,
    longitude: 143.50,
    convergenceRate: 90,
    subductionAngle: 10,
    slabDepth: 600,
    megathrustPotential: 'high',
    volcanicArc: 'Japanese Volcanic Arc',
    maxRecordedEarthquake: 9.1,
    tsunamiHistory: 'catastrophic',
    lockingStatus: 'partially_locked',
  },
  {
    id: 'ts-sumatra',
    name: 'Sunda Megathrust',
    latitude: 2.00,
    longitude: 98.00,
    convergenceRate: 60,
    subductionAngle: 14,
    slabDepth: 550,
    megathrustPotential: 'very_high',
    volcanicArc: 'Sunda Volcanic Arc',
    maxRecordedEarthquake: 9.2,
    tsunamiHistory: 'catastrophic',
    lockingStatus: 'partially_locked',
  },
  {
    id: 'ts-mariana',
    name: 'Mariana Subduction Zone',
    latitude: 15.00,
    longitude: 147.00,
    convergenceRate: 25,
    subductionAngle: 55,
    slabDepth: 680,
    megathrustPotential: 'low',
    volcanicArc: 'Mariana Islands',
    maxRecordedEarthquake: 7.5,
    tsunamiHistory: 'minor',
    lockingStatus: 'freely_slipping',
  },
  {
    id: 'ts-hellenic',
    name: 'Hellenic Subduction Zone',
    latitude: 35.50,
    longitude: 23.50,
    convergenceRate: 35,
    subductionAngle: 20,
    slabDepth: 450,
    megathrustPotential: 'moderate',
    volcanicArc: 'Hellenic Volcanic Arc',
    maxRecordedEarthquake: 8.3,
    tsunamiHistory: 'major',
    lockingStatus: 'partially_locked',
  },
]

const MEGATHRUST_CONFIG: Record<
  SubductionZone['megathrustPotential'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TSUNAMI_CONFIG: Record<
  SubductionZone['tsunamiHistory'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  major: { label: 'Major', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function TectonicSubductionMonitor() {
  const tectonicSubduction = useMapStore((s) => s.tectonicSubduction)
  const setTectonicSubduction = useMapStore((s) => s.setTectonicSubduction)

  const zones = useMemo(
    () => (tectonicSubduction.zones.length > 0 ? tectonicSubduction.zones : DEMO_ZONES),
    [tectonicSubduction.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (tectonicSubduction.megathrustFilter !== 'all' && z.megathrustPotential !== tectonicSubduction.megathrustFilter) return false
      return true
    })
  }, [zones, tectonicSubduction.megathrustFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { maxConvergenceRate: 0, veryHighCount: 0, catastrophicTsunamiCount: 0 }
    }
    const maxConvergenceRate = Math.max(...filteredZones.map((z) => z.convergenceRate))
    const veryHighCount = filteredZones.filter((z) => z.megathrustPotential === 'very_high').length
    const catastrophicTsunamiCount = filteredZones.filter((z) => z.tsunamiHistory === 'catastrophic').length
    return {
      maxConvergenceRate,
      veryHighCount,
      catastrophicTsunamiCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === tectonicSubduction.activeZoneId) ?? null,
    [zones, tectonicSubduction.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!tectonicSubduction.open) return null

  const overlayToggles: { key: keyof TectonicSubductionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showConvergenceRate', label: 'Convergence Rate', icon: ArrowRight },
    { key: 'showSlabDepth', label: 'Slab Depth', icon: ArrowDown },
    { key: 'showMegathrustPotential', label: 'Megathrust Potential', icon: AlertTriangle },
    { key: 'showTsunamiHistory', label: 'Tsunami History', icon: Waves },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Tectonic Subduction Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTectonicSubduction({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Megathrust Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Megathrust Potential
            </Label>
            <Select
              value={tectonicSubduction.megathrustFilter}
              onValueChange={(v) =>
                setTectonicSubduction({
                  megathrustFilter: v as TectonicSubductionState['megathrustFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
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
                  checked={tectonicSubduction[key] as boolean}
                  onCheckedChange={(checked) => setTectonicSubduction({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Convergence</div>
              <div className="text-sm font-semibold text-amber-500">{summary.maxConvergenceRate}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Very High</div>
              <div className="text-sm font-semibold text-red-500">{summary.veryHighCount}</div>
              <div className="text-[9px] text-muted-foreground">megathrusts</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Catastrophic</div>
              <div className="text-sm font-semibold text-red-600">{summary.catastrophicTsunamiCount}</div>
              <div className="text-[9px] text-muted-foreground">tsunamis</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Subduction Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = tectonicSubduction.activeZoneId === zone.id
                  const megaCfg = MEGATHRUST_CONFIG[zone.megathrustPotential]
                  const tsuCfg = TSUNAMI_CONFIG[zone.tsunamiHistory]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setTectonicSubduction({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: megaCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${megaCfg.bgClass}`}
                        >
                          {megaCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {tectonicSubduction.showConvergenceRate && (
                          <div>
                            Convergence:{' '}
                            <span className="text-foreground font-medium">
                              {zone.convergenceRate} mm/yr
                            </span>
                          </div>
                        )}
                        {tectonicSubduction.showSlabDepth && (
                          <div>
                            Slab Depth:{' '}
                            <span className="text-foreground font-medium">
                              {zone.slabDepth} km
                            </span>
                          </div>
                        )}
                        {tectonicSubduction.showMegathrustPotential && (
                          <div>
                            Megathrust:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${megaCfg.bgClass}`}
                            >
                              {megaCfg.label}
                            </Badge>
                          </div>
                        )}
                        {tectonicSubduction.showTsunamiHistory && (
                          <div>
                            Tsunami:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${tsuCfg.bgClass}`}
                            >
                              {tsuCfg.label}
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
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${MEGATHRUST_CONFIG[activeZone.megathrustPotential].bgClass}`}
                  >
                    {MEGATHRUST_CONFIG[activeZone.megathrustPotential].label}
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
                    <span className="text-muted-foreground">Convergence: </span>
                    <span className="font-medium">{activeZone.convergenceRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subduction Angle: </span>
                    <span className="font-medium">{activeZone.subductionAngle}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slab Depth: </span>
                    <span className="font-medium">{activeZone.slabDepth} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volcanic Arc: </span>
                    <span className="font-medium">{activeZone.volcanicArc}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max EQ: </span>
                    <span className="font-medium">M{activeZone.maxRecordedEarthquake}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tsunami: </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${TSUNAMI_CONFIG[activeZone.tsunamiHistory].bgClass}`}
                    >
                      {TSUNAMI_CONFIG[activeZone.tsunamiHistory].label}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Locking: </span>
                    <span className="font-medium capitalize">{activeZone.lockingStatus.replace('_', ' ')}</span>
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
