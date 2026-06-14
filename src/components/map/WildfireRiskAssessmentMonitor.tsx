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
import { useMapStore, type WildfireRiskAssessmentState, type WildfireRiskAssessmentData } from '@/lib/map-store'
import { Flame as FlameIcon10, X, BarChart3, MapPin, Filter, Thermometer, Mountain } from 'lucide-react'

const DEMO_ZONES: WildfireRiskAssessmentData[] = [
  {
    id: 'wra-california',
    name: 'California Wildfire Zone',
    lat: 37,
    lng: -120,
    fireWeather: 85,
    fuelLoad: 75,
    terrain: 65,
    exposure: 80,
    population: 5000000,
    status: 'extreme',
    description: 'High-risk wildfire zone with extreme weather and dense wildland-urban interface',
  },
  {
    id: 'wra-australia',
    name: 'Australian Bushfire Zone',
    lat: -34,
    lng: 150,
    fireWeather: 80,
    fuelLoad: 70,
    terrain: 55,
    exposure: 75,
    population: 3000000,
    status: 'very_high',
    description: 'Severe bushfire risk with extreme fire weather conditions',
  },
  {
    id: 'wra-mediterranean',
    name: 'Mediterranean Zone',
    lat: 40,
    lng: -4,
    fireWeather: 60,
    fuelLoad: 55,
    terrain: 50,
    exposure: 45,
    population: 1000000,
    status: 'high',
    description: 'Southern European fire-prone landscape with seasonal risk',
  },
  {
    id: 'wra-boreal',
    name: 'Boreal Canada',
    lat: 55,
    lng: -110,
    fireWeather: 50,
    fuelLoad: 80,
    terrain: 30,
    exposure: 40,
    population: 200000,
    status: 'moderate',
    description: 'Vast boreal forest with high fuel loads but lower population exposure',
  },
  {
    id: 'wra-siberian',
    name: 'Siberian Taiga',
    lat: 62,
    lng: 100,
    fireWeather: 40,
    fuelLoad: 75,
    terrain: 25,
    exposure: 30,
    population: 50000,
    status: 'moderate',
    description: 'Remote taiga with high fuel loads and increasing fire frequency',
  },
  {
    id: 'wra-amazon',
    name: 'Amazon Frontier',
    lat: -8,
    lng: -50,
    fireWeather: 55,
    fuelLoad: 85,
    terrain: 20,
    exposure: 55,
    population: 800000,
    status: 'high',
    description: 'Deforestation-driven fire risk at the agricultural frontier',
  },
]

const STATUS_CONFIG: Record<
  WildfireRiskAssessmentData['status'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  extreme: { label: 'Extreme', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

export function WildfireRiskAssessmentMonitor() {
  const state = useMapStore((s) => s.wildfireRiskAssessment)
  const setState = useMapStore((s) => s.setWildfireRiskAssessment)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.riskFilter !== 'all') {
        const riskMap: Record<string, string[]> = {
          low: [],
          moderate: ['wra-boreal', 'wra-siberian'],
          high: ['wra-mediterranean', 'wra-amazon'],
          very_high: ['wra-australia'],
          extreme: ['wra-california'],
        }
        if (!riskMap[state.riskFilter]?.includes(z.id)) return false
      }
      return true
    })
  }, [zones, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgFireWeather: 0, avgFuelLoad: 0, avgExposure: 0 }
    }
    const avgFireWeather =
      filteredZones.reduce((sum, z) => sum + z.fireWeather, 0) / filteredZones.length
    const avgFuelLoad =
      filteredZones.reduce((sum, z) => sum + z.fuelLoad, 0) / filteredZones.length
    const avgExposure =
      filteredZones.reduce((sum, z) => sum + z.exposure, 0) / filteredZones.length
    return {
      avgFireWeather: Math.round(avgFireWeather),
      avgFuelLoad: Math.round(avgFuelLoad),
      avgExposure: Math.round(avgExposure),
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WildfireRiskAssessmentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFireWeather', label: 'Fire Weather', icon: Thermometer },
    { key: 'showFuelLoad', label: 'Fuel Load', icon: FlameIcon10 },
    { key: 'showTerrain', label: 'Terrain', icon: Mountain },
    { key: 'showExposure', label: 'Exposure', icon: BarChart3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-red-950/80 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg shadow-red-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon10 className="h-4 w-4 text-red-400" />
              Wildfire Risk Assessment Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-red-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({
                  riskFilter: v as WildfireRiskAssessmentState['riskFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Fire Weather</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFireWeather}</div>
              <div className="text-[9px] text-red-400">index</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Fuel Load</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgFuelLoad}</div>
              <div className="text-[9px] text-red-400">index</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400">Avg Exposure</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgExposure}</div>
              <div className="text-[9px] text-red-400">index</div>
            </div>
          </div>

          <Separator className="bg-red-800/30" />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300">
              Wildfire Zones ({filteredZones.length})
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
                          ? 'border-red-500/60 bg-red-800/30'
                          : 'border-red-800/30 hover:border-red-600/40 hover:bg-red-900/20'
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
                          <span className="text-xs font-medium text-red-100">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300">
                        {state.showFireWeather && (
                          <div>
                            Fire Weather:{' '}
                            <span className="text-amber-400 font-medium">
                              {zone.fireWeather}
                            </span>
                          </div>
                        )}
                        {state.showFuelLoad && (
                          <div>
                            Fuel Load:{' '}
                            <span className="text-orange-400 font-medium">
                              {zone.fuelLoad}
                            </span>
                          </div>
                        )}
                        {state.showTerrain && (
                          <div>
                            Terrain:{' '}
                            <span className="text-red-200 font-medium">
                              {zone.terrain}
                            </span>
                          </div>
                        )}
                        {state.showExposure && (
                          <div>
                            Exposure:{' '}
                            <span className="text-red-400 font-medium">
                              {zone.exposure}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-red-400 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator className="bg-red-800/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeZone.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeZone.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeZone.lat.toFixed(1)}, {activeZone.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400">Fire Weather: </span>
                    <span className="font-medium text-amber-400">{activeZone.fireWeather}</span>
                  </div>
                  <div>
                    <span className="text-red-400">Fuel Load: </span>
                    <span className="font-medium text-orange-400">{activeZone.fuelLoad}</span>
                  </div>
                  <div>
                    <span className="text-red-400">Terrain: </span>
                    <span className="font-medium text-red-200">{activeZone.terrain}</span>
                  </div>
                  <div>
                    <span className="text-red-400">Exposure: </span>
                    <span className="font-medium text-red-400">{activeZone.exposure}</span>
                  </div>
                  <div>
                    <span className="text-red-400">Population: </span>
                    <span className="font-medium text-red-200">{activeZone.population.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-red-400">Description: </span>
                    <span className="font-medium text-red-200">{activeZone.description}</span>
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
