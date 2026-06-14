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
import { useMapStore, type SpaceDebrisOrbitState, type SpaceDebrisOrbitData } from '@/lib/map-store'
import { Orbit as OrbitIcon, X, Mountain, Gauge, AlertTriangle, TrendingDown, MapPin, Filter } from 'lucide-react'

interface DemoObject extends SpaceDebrisOrbitData {
  objectType: 'debris' | 'defunct_satellite' | 'rocket_body' | 'fragment'
}

const DEMO_OBJECTS: DemoObject[] = [
  {
    id: 'sdo-fengyun',
    name: 'Fengyun-1C Debris Field',
    lat: 35,
    lng: 110,
    altitude: 850,
    velocity: 7.4,
    collisionRisk: 85,
    decayRate: 0.1,
    size: 10,
    status: 'high_risk',
    description: 'Largest known debris cloud from ASAT test with thousands of trackable fragments',
    objectType: 'debris',
  },
  {
    id: 'sdo-cosmos',
    name: 'Cosmos 2251 Fragments',
    lat: 55,
    lng: 40,
    altitude: 790,
    velocity: 7.5,
    collisionRisk: 72,
    decayRate: 0.2,
    size: 15,
    status: 'drifting',
    description: 'Debris from Iridium-Cosmos collision spreading across orbital shell',
    objectType: 'fragment',
  },
  {
    id: 'sdo-iss',
    name: 'ISS Shield Debris',
    lat: 28,
    lng: -45,
    altitude: 420,
    velocity: 7.7,
    collisionRisk: 45,
    decayRate: 0.5,
    size: 5,
    status: 'stable',
    description: 'Tracked debris near ISS orbital altitude with stable trajectory',
    objectType: 'debris',
  },
  {
    id: 'sdo-delta2',
    name: 'Delta II Rocket Body',
    lat: -15,
    lng: -150,
    altitude: 650,
    velocity: 7.5,
    collisionRisk: 60,
    decayRate: 0.8,
    size: 25,
    status: 'decaying',
    description: 'Spent upper stage with increasing orbital decay rate',
    objectType: 'rocket_body',
  },
  {
    id: 'sdo-iridium',
    name: 'Iridium 33 Remnant',
    lat: 42,
    lng: 75,
    altitude: 785,
    velocity: 7.5,
    collisionRisk: 68,
    decayRate: 0.15,
    size: 8,
    status: 'drifting',
    description: 'Surviving remnant of Iridium 33 satellite in drifting orbit',
    objectType: 'defunct_satellite',
  },
  {
    id: 'sdo-tiangong',
    name: 'Tiangong Debris',
    lat: 20,
    lng: 95,
    altitude: 350,
    velocity: 7.7,
    collisionRisk: 95,
    decayRate: 3.0,
    size: 30,
    status: 'reentry_imminent',
    description: 'Large object in rapidly decaying orbit with imminent reentry predicted',
    objectType: 'rocket_body',
  },
]

const STATUS_CONFIG: Record<
  SpaceDebrisOrbitData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  drifting: { label: 'Drifting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  decaying: { label: 'Decaying', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  high_risk: { label: 'High Risk', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  reentry_imminent: { label: 'Reentry Imminent', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

const OBJECT_TYPE_LABELS: Record<DemoObject['objectType'], string> = {
  debris: 'Debris',
  defunct_satellite: 'Defunct Satellite',
  rocket_body: 'Rocket Body',
  fragment: 'Fragment',
}

export function SpaceDebrisOrbitTracker() {
  const state = useMapStore((s) => s.spaceDebrisOrbit)
  const setState = useMapStore((s) => s.setSpaceDebrisOrbit)

  const objects = useMemo(
    () => (state.objects.length > 0 ? (state.objects as DemoObject[]) : DEMO_OBJECTS),
    [state.objects]
  )

  const filteredObjects = useMemo(() => {
    return objects.filter((o) => {
      if (state.typeFilter !== 'all' && o.objectType !== state.typeFilter) return false
      return true
    })
  }, [objects, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredObjects.length === 0) {
      return { avgAltitude: 0, avgCollisionRisk: 0, highRiskCount: 0 }
    }
    const avgAltitude =
      filteredObjects.reduce((sum, o) => sum + o.altitude, 0) / filteredObjects.length
    const avgCollisionRisk =
      filteredObjects.reduce((sum, o) => sum + o.collisionRisk, 0) / filteredObjects.length
    const highRiskCount = filteredObjects.filter(
      (o) => o.status === 'high_risk' || o.status === 'reentry_imminent'
    ).length
    return {
      avgAltitude: Math.round(avgAltitude),
      avgCollisionRisk: Math.round(avgCollisionRisk),
      highRiskCount,
    }
  }, [filteredObjects])

  const activeObject = useMemo(
    () => objects.find((o) => o.id === state.activeObjectId) ?? null,
    [objects, state.activeObjectId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SpaceDebrisOrbitState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAltitude', label: 'Altitude', icon: Mountain },
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showCollisionRisk', label: 'Collision Risk', icon: AlertTriangle },
    { key: 'showDecayRate', label: 'Decay Rate', icon: TrendingDown },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/80 to-gray-950/80 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-lg shadow-slate-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <OrbitIcon className="h-4 w-4 text-slate-400" />
              Space Debris Orbit Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-700/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-slate-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Object Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SpaceDebrisOrbitState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-800/40 border-slate-600/40 text-slate-100 hover:bg-slate-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="debris">Debris</SelectItem>
                <SelectItem value="defunct_satellite">Defunct Satellite</SelectItem>
                <SelectItem value="rocket_body">Rocket Body</SelectItem>
                <SelectItem value="fragment">Fragment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-600/30 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">Avg Altitude</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgAltitude}</div>
              <div className="text-[9px] text-slate-400">km</div>
            </div>
            <div className="rounded-lg border border-slate-600/30 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">Avg Collision</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgCollisionRisk}</div>
              <div className="text-[9px] text-slate-400">risk idx</div>
            </div>
            <div className="rounded-lg border border-slate-600/30 bg-slate-800/30 p-2 text-center">
              <div className="text-[10px] text-slate-400">High Risk</div>
              <div className="text-sm font-semibold text-red-400">{summary.highRiskCount}</div>
              <div className="text-[9px] text-slate-400">objects</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Object List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">
              Tracked Objects ({filteredObjects.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredObjects.map((obj) => {
                  const isActive = state.activeObjectId === obj.id
                  const statusCfg = STATUS_CONFIG[obj.status]
                  return (
                    <div
                      key={obj.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/60 bg-slate-700/30'
                          : 'border-slate-700/30 hover:border-slate-500/40 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeObjectId: isActive ? null : obj.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-slate-100">{obj.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300">
                        {state.showAltitude && (
                          <div>
                            Alt:{' '}
                            <span className="text-slate-100 font-medium">
                              {obj.altitude} km
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Vel:{' '}
                            <span className="text-slate-100 font-medium">
                              {obj.velocity} km/s
                            </span>
                          </div>
                        )}
                        {state.showCollisionRisk && (
                          <div>
                            Risk:{' '}
                            <span className="text-slate-100 font-medium">
                              {obj.collisionRisk}%
                            </span>
                          </div>
                        )}
                        {state.showDecayRate && (
                          <div>
                            Decay:{' '}
                            <span className="text-slate-100 font-medium">
                              {obj.decayRate} km/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredObjects.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-4">
                    No objects match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Object Details */}
          {activeObject && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-500/30 bg-slate-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeObject.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeObject.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeObject.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeObject.lat.toFixed(1)}, {activeObject.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Altitude: </span>
                    <span className="font-medium text-blue-400">{activeObject.altitude} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Velocity: </span>
                    <span className="font-medium text-slate-200">{activeObject.velocity} km/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Collision Risk: </span>
                    <span className="font-medium text-amber-400">{activeObject.collisionRisk}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Decay Rate: </span>
                    <span className="font-medium text-orange-400">{activeObject.decayRate} km/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size: </span>
                    <span className="font-medium text-slate-200">{activeObject.size} cm</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Object Type: </span>
                    <span className="font-medium text-slate-200">
                      {(activeObject as DemoObject).objectType ? OBJECT_TYPE_LABELS[(activeObject as DemoObject).objectType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Description: </span>
                    <span className="font-medium text-slate-200">{activeObject.description}</span>
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
