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
import { useMapStore, type CoastalUpwellingState, type CoastalUpwellingData } from '@/lib/map-store'
import { Waves as WavesIcon8, X, Thermometer, Leaf, Zap, Wind, MapPin, Filter } from 'lucide-react'

interface DemoZone extends CoastalUpwellingData {
  upwellingType: 'eastern_boundary' | 'equatorial' | 'coastal_jet' | 'wind_driven'
}

const DEMO_ZONES: DemoZone[] = [
  {
    id: 'cu-peru',
    name: 'Peru Current',
    lat: -12,
    lng: -78,
    sst: -4.5,
    nutrientLevel: 92,
    productivity: 95,
    windStress: 0.35,
    chlorophyll: 25,
    status: 'strong',
    description: 'One of the world\'s most productive upwelling systems supporting huge fisheries',
    upwellingType: 'eastern_boundary',
  },
  {
    id: 'cu-california',
    name: 'California Current',
    lat: 38,
    lng: -124,
    sst: -3.0,
    nutrientLevel: 78,
    productivity: 82,
    windStress: 0.28,
    chlorophyll: 18,
    status: 'moderate',
    description: 'Eastern boundary current with seasonal upwelling driving coastal productivity',
    upwellingType: 'eastern_boundary',
  },
  {
    id: 'cu-benguela',
    name: 'Benguela Current',
    lat: -22,
    lng: 12,
    sst: -5.0,
    nutrientLevel: 88,
    productivity: 90,
    windStress: 0.32,
    chlorophyll: 22,
    status: 'strong',
    description: 'Intense upwelling system off southwestern Africa with high biological productivity',
    upwellingType: 'eastern_boundary',
  },
  {
    id: 'cu-canary',
    name: 'Canary Current',
    lat: 22,
    lng: -18,
    sst: -2.0,
    nutrientLevel: 65,
    productivity: 60,
    windStress: 0.18,
    chlorophyll: 10,
    status: 'weak',
    description: 'Seasonal upwelling off northwest Africa with variable intensity',
    upwellingType: 'eastern_boundary',
  },
  {
    id: 'cu-somalia',
    name: 'Somalia Current',
    lat: 8,
    lng: 52,
    sst: -3.5,
    nutrientLevel: 75,
    productivity: 78,
    windStress: 0.25,
    chlorophyll: 15,
    status: 'moderate',
    description: 'Monsoon-driven upwelling system with strong seasonal variability',
    upwellingType: 'wind_driven',
  },
  {
    id: 'cu-nwaustralia',
    name: 'NW Australia',
    lat: -18,
    lng: 118,
    sst: -1.5,
    nutrientLevel: 55,
    productivity: 45,
    windStress: 0.12,
    chlorophyll: 8,
    status: 'fading',
    description: 'Diminishing upwelling signal with declining nutrient transport',
    upwellingType: 'coastal_jet',
  },
]

const STATUS_CONFIG: Record<
  CoastalUpwellingData['status'],
  { label: string; color: string; bgClass: string }
> = {
  strong: { label: 'Strong', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  fading: { label: 'Fading', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  absent: { label: 'Absent', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

const UPWELLING_TYPE_LABELS: Record<DemoZone['upwellingType'], string> = {
  eastern_boundary: 'Eastern Boundary',
  equatorial: 'Equatorial',
  coastal_jet: 'Coastal Jet',
  wind_driven: 'Wind Driven',
}

export function CoastalUpwellingMonitor() {
  const state = useMapStore((s) => s.coastalUpwelling)
  const setState = useMapStore((s) => s.setCoastalUpwelling)

  const zones = useMemo(
    () => (state.zones.length > 0 ? (state.zones as DemoZone[]) : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.upwellingType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgSST: 0, avgProductivity: 0, strongCount: 0 }
    }
    const avgSST =
      filteredZones.reduce((sum, z) => sum + z.sst, 0) / filteredZones.length
    const avgProductivity =
      filteredZones.reduce((sum, z) => sum + z.productivity, 0) / filteredZones.length
    const strongCount = filteredZones.filter(
      (z) => z.status === 'strong'
    ).length
    return {
      avgSST: Math.round(avgSST * 10) / 10,
      avgProductivity: Math.round(avgProductivity),
      strongCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalUpwellingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSST', label: 'SST Anomaly', icon: Thermometer },
    { key: 'showNutrientLevel', label: 'Nutrient Level', icon: Leaf },
    { key: 'showProductivity', label: 'Productivity', icon: Zap },
    { key: 'showWindStress', label: 'Wind Stress', icon: Wind },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/80 to-teal-950/80 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg shadow-emerald-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <WavesIcon8 className="h-4 w-4 text-emerald-400" />
              Coastal Upwelling Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-emerald-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Upwelling Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as CoastalUpwellingState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="eastern_boundary">Eastern Boundary</SelectItem>
                <SelectItem value="equatorial">Equatorial</SelectItem>
                <SelectItem value="coastal_jet">Coastal Jet</SelectItem>
                <SelectItem value="wind_driven">Wind Driven</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg SST</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgSST}</div>
              <div className="text-[9px] text-emerald-400">&deg;C anom</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Avg Productivity</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgProductivity}</div>
              <div className="text-[9px] text-emerald-400">index</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400">Strong</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.strongCount}</div>
              <div className="text-[9px] text-emerald-400">zones</div>
            </div>
          </div>

          <Separator className="bg-emerald-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300">
              Upwelling Zones ({filteredZones.length})
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
                          ? 'border-emerald-500/60 bg-emerald-800/30'
                          : 'border-emerald-800/30 hover:border-emerald-600/40 hover:bg-emerald-900/20'
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
                          <span className="text-xs font-medium text-emerald-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300">
                        {state.showSST && (
                          <div>
                            SST:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.sst}&deg;C
                            </span>
                          </div>
                        )}
                        {state.showNutrientLevel && (
                          <div>
                            Nutrients:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.nutrientLevel}%
                            </span>
                          </div>
                        )}
                        {state.showProductivity && (
                          <div>
                            Productivity:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.productivity}%
                            </span>
                          </div>
                        )}
                        {state.showWindStress && (
                          <div>
                            Wind Stress:{' '}
                            <span className="text-emerald-100 font-medium">
                              {zone.windStress} N/m&sup2;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-emerald-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-emerald-800/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400">SST Anomaly: </span>
                    <span className="font-medium text-teal-400">{activeZone.sst}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Nutrient Level: </span>
                    <span className="font-medium text-emerald-200">{activeZone.nutrientLevel}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Productivity: </span>
                    <span className="font-medium text-emerald-200">{activeZone.productivity}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Wind Stress: </span>
                    <span className="font-medium text-emerald-200">{activeZone.windStress} N/m&sup2;</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Chlorophyll: </span>
                    <span className="font-medium text-emerald-200">{activeZone.chlorophyll} mg/m&sup3;</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400">Upwelling Type: </span>
                    <span className="font-medium text-emerald-200">
                      {(activeZone as DemoZone).upwellingType ? UPWELLING_TYPE_LABELS[(activeZone as DemoZone).upwellingType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400">Description: </span>
                    <span className="font-medium text-emerald-200">{activeZone.description}</span>
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
