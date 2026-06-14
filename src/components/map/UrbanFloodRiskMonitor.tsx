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
import { useMapStore, type UrbanFloodRiskState, type UrbanFloodRiskData } from '@/lib/map-store'
import { Droplets as DropletsIcon7, X, BarChart3, MapPin, Filter, TrendingUp, Users } from 'lucide-react'

const DEMO_ZONES: UrbanFloodRiskData[] = [
  {
    id: 'ufr-mumbai',
    name: 'Mumbai',
    lat: 19,
    lng: 72.8,
    impervious: 85,
    drainage: 25,
    elevation: 15,
    historical: 80,
    population: 20000000,
    status: 'extreme',
    description: 'Coastal megacity with extreme flood risk from monsoon and sea level rise',
  },
  {
    id: 'ufr-houston',
    name: 'Houston',
    lat: 29.8,
    lng: -95.4,
    impervious: 75,
    drainage: 35,
    elevation: 20,
    historical: 65,
    population: 7000000,
    status: 'high',
    description: 'Flat terrain with extensive impervious surface and hurricane exposure',
  },
  {
    id: 'ufr-jakarta',
    name: 'Jakarta',
    lat: -6.2,
    lng: 106.8,
    impervious: 80,
    drainage: 20,
    elevation: 8,
    historical: 75,
    population: 10000000,
    status: 'extreme',
    description: 'Sinking coastal city with severe drainage deficits and land subsidence',
  },
  {
    id: 'ufr-tokyo',
    name: 'Tokyo',
    lat: 35.7,
    lng: 139.7,
    impervious: 70,
    drainage: 60,
    elevation: 40,
    historical: 45,
    population: 14000000,
    status: 'moderate',
    description: 'Well-managed urban drainage but exposed to typhoon and river flooding',
  },
  {
    id: 'ufr-rotterdam',
    name: 'Rotterdam',
    lat: 51.9,
    lng: 4.5,
    impervious: 65,
    drainage: 75,
    elevation: 5,
    historical: 55,
    population: 1000000,
    status: 'moderate',
    description: 'Below sea level city with advanced water management infrastructure',
  },
  {
    id: 'ufr-miami',
    name: 'Miami',
    lat: 25.8,
    lng: -80.2,
    impervious: 70,
    drainage: 40,
    elevation: 3,
    historical: 70,
    population: 5000000,
    status: 'high',
    description: 'Low-lying coastal city facing sea level rise and storm surge threats',
  },
]

const STATUS_CONFIG: Record<
  UrbanFloodRiskData['status'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function UrbanFloodRiskMonitor() {
  const state = useMapStore((s) => s.urbanFloodRisk)
  const setState = useMapStore((s) => s.setUrbanFloodRisk)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all' && z.status !== state.riskFilter) return false
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgImpervious: 0, avgElevation: 0, totalPopulation: 0 }
    }
    const avgImpervious =
      filteredZones.reduce((sum, z) => sum + z.impervious, 0) / filteredZones.length
    const avgElevation =
      filteredZones.reduce((sum, z) => sum + z.elevation, 0) / filteredZones.length
    const totalPopulation = filteredZones.reduce((sum, z) => sum + z.population, 0)
    return {
      avgImpervious: Math.round(avgImpervious),
      avgElevation: Math.round(avgElevation * 10) / 10,
      totalPopulation: (totalPopulation / 1000000).toFixed(1),
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanFloodRiskState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showImpervious', label: 'Impervious Surface', icon: BarChart3 },
    { key: 'showDrainage', label: 'Drainage', icon: TrendingUp },
    { key: 'showElevation', label: 'Elevation', icon: MapPin },
    { key: 'showHistorical', label: 'Historical Flooding', icon: DropletsIcon7 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-slate-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <DropletsIcon7 className="h-4 w-4 text-blue-400" />
              Urban Flood Risk Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({
                  riskFilter: v as UrbanFloodRiskState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Impervious</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgImpervious}%</div>
              <div className="text-[9px] text-blue-400">surface</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Elevation</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgElevation}m</div>
              <div className="text-[9px] text-blue-400">above sea</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Population</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalPopulation}M</div>
              <div className="text-[9px] text-blue-400">at risk</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Urban Zones ({filteredZones.length})
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
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
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
                          <span className="text-xs font-medium text-blue-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showImpervious && (
                          <div>
                            Impervious:{' '}
                            <span className="text-blue-100 font-medium">
                              {zone.impervious}%
                            </span>
                          </div>
                        )}
                        {state.showDrainage && (
                          <div>
                            Drainage:{' '}
                            <span className="text-blue-100 font-medium">
                              {zone.drainage}%
                            </span>
                          </div>
                        )}
                        {state.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-blue-100 font-medium">
                              {zone.elevation}m
                            </span>
                          </div>
                        )}
                        {state.showHistorical && (
                          <div>
                            Historical:{' '}
                            <span className="text-amber-400 font-medium">
                              {zone.historical}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Impervious: </span>
                    <span className="font-medium text-blue-200">{activeZone.impervious}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Drainage: </span>
                    <span className="font-medium text-blue-200">{activeZone.drainage}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Elevation: </span>
                    <span className="font-medium text-blue-200">{activeZone.elevation}m</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Historical: </span>
                    <span className="font-medium text-amber-400">{activeZone.historical}%</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Population: </span>
                    <span className="font-medium text-blue-200">{(activeZone.population / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeZone.description}</span>
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
