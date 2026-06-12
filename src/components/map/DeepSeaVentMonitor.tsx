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
import { useMapStore, type DeepSeaVentState, type DeepSeaVent } from '@/lib/map-store'
import { Flame as FlameIcon2, X, Thermometer, ArrowDownFromLine, Fish, Filter } from 'lucide-react'

const DEMO_VENTS: DeepSeaVent[] = [
  {
    id: 'dsv-loihi',
    name: 'Lōʻihi Seamount',
    latitude: 18.92,
    longitude: -155.27,
    depth: 1300,
    temperature: 280,
    ventType: 'black_smoker',
    mineralType: 'FeS, CuFeS₂',
    biologicalActivity: 'high',
    discoveryYear: 1996,
  },
  {
    id: 'dsv-snakepit',
    name: 'Snake Pit Vent Field',
    latitude: 23.08,
    longitude: -44.95,
    depth: 3500,
    temperature: 350,
    ventType: 'black_smoker',
    mineralType: 'ZnS, PbS',
    biologicalActivity: 'extreme',
    discoveryYear: 1985,
  },
  {
    id: 'dsv-lostcity',
    name: 'Lost City',
    latitude: 30.13,
    longitude: -42.12,
    depth: 800,
    temperature: 90,
    ventType: 'diffuse_flow',
    mineralType: 'CaCO₃, Mg(OH)₂',
    biologicalActivity: 'moderate',
    discoveryYear: 2000,
  },
  {
    id: 'dsv-midatlantic',
    name: 'TAG Hydrothermal Field',
    latitude: 26.13,
    longitude: -44.83,
    depth: 3650,
    temperature: 365,
    ventType: 'black_smoker',
    mineralType: 'CuFeS₂, FeS₂',
    biologicalActivity: 'high',
    discoveryYear: 1985,
  },
  {
    id: 'dsv-brothers',
    name: 'Brothers Volcano Vent',
    latitude: -34.87,
    longitude: 179.07,
    depth: 1850,
    temperature: 310,
    ventType: 'white_smoker',
    mineralType: 'SiO₂, BaSO₄',
    biologicalActivity: 'extreme',
    discoveryYear: 1999,
  },
  {
    id: 'dsv-endeavour',
    name: 'Endeavour Segment',
    latitude: 47.95,
    longitude: -129.10,
    depth: 2200,
    temperature: 180,
    ventType: 'diffuse_flow',
    mineralType: 'SiO₂, FeS',
    biologicalActivity: 'low',
    discoveryYear: 1983,
  },
]

const BIOLOGY_CONFIG: Record<
  DeepSeaVent['biologicalActivity'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function DeepSeaVentMonitor() {
  const deepSeaVent = useMapStore((s) => s.deepSeaVent)
  const setDeepSeaVent = useMapStore((s) => s.setDeepSeaVent)

  const vents = useMemo(
    () => (deepSeaVent.vents.length > 0 ? deepSeaVent.vents : DEMO_VENTS),
    [deepSeaVent.vents]
  )

  const filteredVents = useMemo(() => {
    return vents.filter((v) => {
      if (deepSeaVent.biologyFilter !== 'all' && v.biologicalActivity !== deepSeaVent.biologyFilter) return false
      return true
    })
  }, [vents, deepSeaVent.biologyFilter])

  const summary = useMemo(() => {
    if (filteredVents.length === 0) {
      return { avgTemperature: 0, highExtremeCount: 0, maxDepth: 0 }
    }
    const avgTemperature =
      Math.round((filteredVents.reduce((sum, v) => sum + v.temperature, 0) / filteredVents.length) * 10) / 10
    const highExtremeCount = filteredVents.filter(
      (v) => v.biologicalActivity === 'high' || v.biologicalActivity === 'extreme'
    ).length
    const maxDepth = Math.max(...filteredVents.map((v) => v.depth))
    return { avgTemperature, highExtremeCount, maxDepth }
  }, [filteredVents])

  const activeVent = useMemo(
    () => vents.find((v) => v.id === deepSeaVent.activeVentId) ?? null,
    [vents, deepSeaVent.activeVentId]
  )

  if (typeof window === 'undefined') return null
  if (!deepSeaVent.open) return null

  const overlayToggles: { key: keyof DeepSeaVentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showDepth', label: 'Depth', icon: ArrowDownFromLine },
    { key: 'showVentType', label: 'Vent Type', icon: FlameIcon2 },
    { key: 'showBiology', label: 'Biology', icon: Fish },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon2 className="h-4 w-4 text-orange-500" />
              Deep Sea Vent Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeepSeaVent({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Biology Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Biological Activity
            </Label>
            <Select
              value={deepSeaVent.biologyFilter}
              onValueChange={(v) =>
                setDeepSeaVent({
                  biologyFilter: v as DeepSeaVentState['biologyFilter'],
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
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={deepSeaVent[key] as boolean}
                  onCheckedChange={(checked) => setDeepSeaVent({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Temp</div>
              <div className="text-sm font-semibold">{summary.avgTemperature}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High/Extreme</div>
              <div className="text-sm font-semibold text-red-500">{summary.highExtremeCount}</div>
              <div className="text-[9px] text-muted-foreground">vents</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Depth</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxDepth}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
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
                  const isActive = deepSeaVent.activeVentId === vent.id
                  const bioCfg = BIOLOGY_CONFIG[vent.biologicalActivity]
                  return (
                    <div
                      key={vent.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                      }`}
                      onClick={() =>
                        setDeepSeaVent({
                          activeVentId: isActive ? null : vent.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: bioCfg.color }}
                          />
                          <span className="text-xs font-medium">{vent.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${bioCfg.bgClass}`}
                        >
                          {bioCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {deepSeaVent.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {vent.temperature}°C
                            </span>
                          </div>
                        )}
                        {deepSeaVent.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {vent.depth.toLocaleString()} m
                            </span>
                          </div>
                        )}
                        {deepSeaVent.showVentType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {vent.ventType.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        {deepSeaVent.showBiology && (
                          <div>
                            Minerals:{' '}
                            <span className="text-foreground font-medium">
                              {vent.mineralType}
                            </span>
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
                  <FlameIcon2 className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-semibold">{activeVent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${BIOLOGY_CONFIG[activeVent.biologicalActivity].bgClass}`}
                  >
                    {BIOLOGY_CONFIG[activeVent.biologicalActivity].label}
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
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeVent.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeVent.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vent Type: </span>
                    <span className="font-medium">{activeVent.ventType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Minerals: </span>
                    <span className="font-medium">{activeVent.mineralType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discovered: </span>
                    <span className="font-medium">{activeVent.discoveryYear}</span>
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
