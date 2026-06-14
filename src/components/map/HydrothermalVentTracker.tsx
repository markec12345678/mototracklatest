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
import { useMapStore, type HydrothermalVentState, type HydrothermalVent } from '@/lib/map-store'
import { Flame as FlameIcon5, X, Thermometer, ArrowDown, Droplets, Bug, MapPin, Filter } from 'lucide-react'

const DEMO_VENTS: HydrothermalVent[] = [
  {
    id: 'hv-lostcity',
    name: 'Lost City',
    latitude: 30.13,
    longitude: -42.12,
    ventType: 'white_smoker',
    maxTemperature: 90,
    depth: 800,
    chimneyHeight: 60,
    fluidPH: 9.0,
    mineralContent: 'mixed',
    biodiversity: 'high',
  },
  {
    id: 'hv-endeavour',
    name: 'Endeavour Segment',
    latitude: 47.95,
    longitude: -129.10,
    ventType: 'black_smoker',
    maxTemperature: 380,
    depth: 2200,
    chimneyHeight: 25,
    fluidPH: 2.8,
    mineralContent: 'sulfide_rich',
    biodiversity: 'exceptional',
  },
  {
    id: 'hv-snakepit',
    name: 'Snake Pit',
    latitude: 23.22,
    longitude: -44.95,
    ventType: 'black_smoker',
    maxTemperature: 350,
    depth: 3450,
    chimneyHeight: 18,
    fluidPH: 3.2,
    mineralContent: 'iron_rich',
    biodiversity: 'exceptional',
  },
  {
    id: 'hv-logan',
    name: 'Logan Resurgence',
    latitude: -21.07,
    longitude: -175.38,
    ventType: 'diffuse_flow',
    maxTemperature: 35,
    depth: 1700,
    chimneyHeight: 2,
    fluidPH: 6.5,
    mineralContent: 'manganese_rich',
    biodiversity: 'moderate',
  },
  {
    id: 'hv-brothers',
    name: 'Brothers Volcano',
    latitude: -34.88,
    longitude: 179.07,
    ventType: 'shimmering',
    maxTemperature: 65,
    depth: 1350,
    chimneyHeight: 8,
    fluidPH: 5.0,
    mineralContent: 'mixed',
    biodiversity: 'high',
  },
  {
    id: 'hv-beebee',
    name: 'Beebee Vent',
    latitude: 9.83,
    longitude: -104.29,
    ventType: 'black_smoker',
    maxTemperature: 290,
    depth: 2550,
    chimneyHeight: 12,
    fluidPH: 3.8,
    mineralContent: 'sulfide_rich',
    biodiversity: 'high',
  },
]

const VENT_TYPE_CONFIG: Record<
  HydrothermalVent['ventType'],
  { label: string; color: string; bgClass: string }
> = {
  black_smoker: { label: 'Black Smoker', color: '#1e293b', bgClass: 'bg-slate-500/10 text-slate-700 border-slate-500/30' },
  white_smoker: { label: 'White Smoker', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  diffuse_flow: { label: 'Diffuse Flow', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  shimmering: { label: 'Shimmering', color: '#14b8a6', bgClass: 'bg-teal-500/10 text-teal-500 border-teal-500/30' },
}

const BIODIVERSITY_CONFIG: Record<
  HydrothermalVent['biodiversity'],
  { label: string; bgClass: string }
> = {
  low: { label: 'Low', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  moderate: { label: 'Moderate', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  high: { label: 'High', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  exceptional: { label: 'Exceptional', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

export function HydrothermalVentTracker() {
  const hydrothermalVent = useMapStore((s) => s.hydrothermalVent)
  const setHydrothermalVent = useMapStore((s) => s.setHydrothermalVent)

  const vents = useMemo(
    () => (hydrothermalVent.vents.length > 0 ? hydrothermalVent.vents : DEMO_VENTS),
    [hydrothermalVent.vents]
  )

  const filteredVents = useMemo(() => {
    return vents.filter((v) => {
      if (hydrothermalVent.typeFilter !== 'all' && v.ventType !== hydrothermalVent.typeFilter) return false
      return true
    })
  }, [vents, hydrothermalVent.typeFilter])

  const summary = useMemo(() => {
    if (filteredVents.length === 0) {
      return { maxTemperature: 0, avgDepth: 0, exceptionalCount: 0 }
    }
    const maxTemperature = Math.max(...filteredVents.map((v) => v.maxTemperature))
    const avgDepth = filteredVents.reduce((sum, v) => sum + v.depth, 0) / filteredVents.length
    const exceptionalCount = filteredVents.filter((v) => v.biodiversity === 'exceptional').length
    return {
      maxTemperature,
      avgDepth: Math.round(avgDepth),
      exceptionalCount,
    }
  }, [filteredVents])

  const activeVent = useMemo(
    () => vents.find((v) => v.id === hydrothermalVent.activeVentId) ?? null,
    [vents, hydrothermalVent.activeVentId]
  )

  if (typeof window === 'undefined') return null
  if (!hydrothermalVent.open) return null

  const overlayToggles: { key: keyof HydrothermalVentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showDepth', label: 'Depth', icon: ArrowDown },
    { key: 'showVentType', label: 'Vent Type', icon: Droplets },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Bug },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon5 className="h-4 w-4 text-orange-500" />
              Hydrothermal Vent Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setHydrothermalVent({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Vent Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Vent Type
            </Label>
            <Select
              value={hydrothermalVent.typeFilter}
              onValueChange={(v) =>
                setHydrothermalVent({
                  typeFilter: v as HydrothermalVentState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="black_smoker">Black Smoker</SelectItem>
                <SelectItem value="white_smoker">White Smoker</SelectItem>
                <SelectItem value="diffuse_flow">Diffuse Flow</SelectItem>
                <SelectItem value="shimmering">Shimmering</SelectItem>
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
                  checked={hydrothermalVent[key] as boolean}
                  onCheckedChange={(checked) => setHydrothermalVent({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Temp</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxTemperature}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold">{summary.avgDepth.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Exceptional Bio</div>
              <div className="text-sm font-semibold text-green-500">{summary.exceptionalCount}</div>
              <div className="text-[9px] text-muted-foreground">vents</div>
            </div>
          </div>

          <Separator />

          {/* Vent List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Hydrothermal Vents ({filteredVents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredVents.map((vent) => {
                  const isActive = hydrothermalVent.activeVentId === vent.id
                  const ventCfg = VENT_TYPE_CONFIG[vent.ventType]
                  return (
                    <div
                      key={vent.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setHydrothermalVent({
                          activeVentId: isActive ? null : vent.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: ventCfg.color }}
                          />
                          <span className="text-xs font-medium">{vent.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${ventCfg.bgClass}`}
                        >
                          {ventCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {hydrothermalVent.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {vent.maxTemperature}°C
                            </span>
                          </div>
                        )}
                        {hydrothermalVent.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {vent.depth} m
                            </span>
                          </div>
                        )}
                        {hydrothermalVent.showVentType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {VENT_TYPE_CONFIG[vent.ventType].label}
                            </span>
                          </div>
                        )}
                        {hydrothermalVent.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${BIODIVERSITY_CONFIG[vent.biodiversity].bgClass}`}
                            >
                              {BIODIVERSITY_CONFIG[vent.biodiversity].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No vents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Vent Details */}
          {activeVent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeVent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${VENT_TYPE_CONFIG[activeVent.ventType].bgClass}`}
                  >
                    {VENT_TYPE_CONFIG[activeVent.ventType].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeVent.latitude.toFixed(2)}, {activeVent.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Temperature: </span>
                    <span className="font-medium">{activeVent.maxTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeVent.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chimney Height: </span>
                    <span className="font-medium">{activeVent.chimneyHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fluid pH: </span>
                    <span className="font-medium">{activeVent.fluidPH}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mineral Content: </span>
                    <span className="font-medium">{activeVent.mineralContent.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biodiversity: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${BIODIVERSITY_CONFIG[activeVent.biodiversity].bgClass}`}
                    >
                      {BIODIVERSITY_CONFIG[activeVent.biodiversity].label}
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
