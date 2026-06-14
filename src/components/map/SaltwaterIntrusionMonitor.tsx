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
import { useMapStore, type SaltwaterIntrusionState, type SaltwaterIntrusionData } from '@/lib/map-store'
import { Droplet as DropletIcon4, X, BarChart3, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const DEMO_ZONES: SaltwaterIntrusionData[] = [
  {
    id: 'si-gaza',
    name: 'Gaza Strip',
    lat: 31.4,
    lng: 34.3,
    chloride: 2500,
    conductivity: 8500,
    waterTable: -15,
    intrusionRate: 85,
    pumpingRate: 180,
    status: 'extreme',
    description: 'Extreme saltwater intrusion due to over-extraction and coastal aquifer depletion',
  },
  {
    id: 'si-bangkok',
    name: 'Bangkok',
    lat: 13.8,
    lng: 100.5,
    chloride: 800,
    conductivity: 3200,
    waterTable: -8,
    intrusionRate: 55,
    pumpingRate: 120,
    status: 'severe',
    description: 'Severe intrusion from land subsidence and aquifer over-pumping',
  },
  {
    id: 'si-manila',
    name: 'Manila',
    lat: 14.6,
    lng: 121,
    chloride: 450,
    conductivity: 1800,
    waterTable: -5,
    intrusionRate: 35,
    pumpingRate: 85,
    status: 'moderate',
    description: 'Moderate intrusion affecting coastal municipal water supplies',
  },
  {
    id: 'si-jakarta',
    name: 'Jakarta',
    lat: -6.2,
    lng: 106.8,
    chloride: 600,
    conductivity: 2400,
    waterTable: -10,
    intrusionRate: 45,
    pumpingRate: 140,
    status: 'severe',
    description: 'Severe intrusion exacerbated by rapid land subsidence',
  },
  {
    id: 'si-charleston',
    name: 'Charleston SC',
    lat: 32.8,
    lng: -79.9,
    chloride: 150,
    conductivity: 600,
    waterTable: -2,
    intrusionRate: 15,
    pumpingRate: 40,
    status: 'slight',
    description: 'Slight intrusion along the South Carolina coast',
  },
  {
    id: 'si-netherlands',
    name: 'Netherlands',
    lat: 52,
    lng: 4.5,
    chloride: 80,
    conductivity: 350,
    waterTable: 1,
    intrusionRate: 5,
    pumpingRate: 15,
    status: 'fresh',
    description: 'Well-managed coastal aquifer with minimal saltwater intrusion',
  },
]

const STATUS_CONFIG: Record<
  SaltwaterIntrusionData['status'],
  { label: string; color: string; bgClass: string }
> = {
  fresh: { label: 'Fresh', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  slight: { label: 'Slight', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SaltwaterIntrusionMonitor() {
  const state = useMapStore((s) => s.saltwaterIntrusion)
  const setState = useMapStore((s) => s.setSaltwaterIntrusion)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.severityFilter !== 'all') {
        const severityMap: Record<string, string[]> = {
          fresh: ['si-netherlands'],
          slight: ['si-charleston'],
          moderate: ['si-manila'],
          severe: ['si-bangkok', 'si-jakarta'],
          extreme: ['si-gaza'],
        }
        if (!severityMap[state.severityFilter]?.includes(z.id)) return false
      }
      return true
    })
  }, [zones, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgChloride: 0, avgIntrusionRate: 0, avgWaterTable: 0 }
    }
    const avgChloride =
      filteredZones.reduce((sum, z) => sum + z.chloride, 0) / filteredZones.length
    const avgIntrusionRate =
      filteredZones.reduce((sum, z) => sum + z.intrusionRate, 0) / filteredZones.length
    const avgWaterTable =
      filteredZones.reduce((sum, z) => sum + z.waterTable, 0) / filteredZones.length
    return {
      avgChloride: Math.round(avgChloride),
      avgIntrusionRate: Math.round(avgIntrusionRate),
      avgWaterTable: Math.round(avgWaterTable * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SaltwaterIntrusionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showChloride', label: 'Chloride', icon: BarChart3 },
    { key: 'showConductivity', label: 'Conductivity', icon: Activity },
    { key: 'showWaterTable', label: 'Water Table', icon: TrendingUp },
    { key: 'showIntrusionRate', label: 'Intrusion Rate', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg shadow-teal-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletIcon4 className="h-4 w-4 text-teal-400" />
              Saltwater Intrusion Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-teal-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as SaltwaterIntrusionState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="slight">Slight</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Chloride</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgChloride}</div>
              <div className="text-[9px] text-teal-400">mg/L</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Intrusion Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgIntrusionRate}%</div>
              <div className="text-[9px] text-teal-400">progress</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Water Table</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgWaterTable} m</div>
              <div className="text-[9px] text-teal-400">depth</div>
            </div>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">
              Monitoring Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const statusCfg = STATUS_CONFIG[zone.status]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/60 bg-teal-800/30'
                          : 'border-teal-800/30 hover:border-teal-600/40 hover:bg-teal-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-teal-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300">
                        {state.showChloride && (
                          <div>
                            Chloride:{' '}
                            <span className="text-teal-100 font-medium">
                              {zone.chloride} mg/L
                            </span>
                          </div>
                        )}
                        {state.showConductivity && (
                          <div>
                            Conductivity:{' '}
                            <span className="text-teal-100 font-medium">
                              {zone.conductivity} µS/cm
                            </span>
                          </div>
                        )}
                        {state.showWaterTable && (
                          <div>
                            Water Table:{' '}
                            <span className="text-amber-400 font-medium">
                              {zone.waterTable} m
                            </span>
                          </div>
                        )}
                        {state.showIntrusionRate && (
                          <div>
                            Intrusion:{' '}
                            <span className="text-orange-400 font-medium">
                              {zone.intrusionRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-teal-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-teal-800/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400">Chloride: </span>
                    <span className="font-medium text-teal-200">{activeZone.chloride} mg/L</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Conductivity: </span>
                    <span className="font-medium text-teal-200">{activeZone.conductivity} µS/cm</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Water Table: </span>
                    <span className="font-medium text-amber-400">{activeZone.waterTable} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Intrusion Rate: </span>
                    <span className="font-medium text-orange-400">{activeZone.intrusionRate}%</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Pumping Rate: </span>
                    <span className="font-medium text-teal-200">{activeZone.pumpingRate} ML/day</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Description: </span>
                    <span className="font-medium text-teal-200">{activeZone.description}</span>
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
