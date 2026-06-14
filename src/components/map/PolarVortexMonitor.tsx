'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type PolarVortexData, type PolarVortexState } from '@/lib/map-store'
import { Wind as WindIcon4, X, Thermometer, Cloud, Gauge, MapPin, Filter } from 'lucide-react'

const DEMO_VORTICES: PolarVortexData[] = [
  {
    id: 'pv-arctic-main',
    name: 'Arctic Polar Vortex',
    lat: 80.0,
    lng: 0.0,
    windSpeed: 250,
    temperature: -80,
    ozoneLevel: 150,
    jetStreamSpeed: 180,
    vortexStrength: 95,
    displacement: 5,
    status: 'stable',
    description: 'Northern hemisphere stratospheric vortex',
  },
  {
    id: 'pv-antarctic-main',
    name: 'Antarctic Polar Vortex',
    lat: -80.0,
    lng: 0.0,
    windSpeed: 280,
    temperature: -85,
    ozoneLevel: 100,
    jetStreamSpeed: 200,
    vortexStrength: 98,
    displacement: 2,
    status: 'stable',
    description: 'Southern hemisphere stratospheric vortex - ozone hole',
  },
  {
    id: 'pv-arctic-ssw',
    name: 'Arctic Sudden Stratospheric Warming',
    lat: 75.0,
    lng: 30.0,
    windSpeed: 80,
    temperature: -45,
    ozoneLevel: 280,
    jetStreamSpeed: 120,
    vortexStrength: 35,
    displacement: 25,
    status: 'split',
    description: 'SSW event - vortex disruption',
  },
  {
    id: 'pv-antarctic-ozone',
    name: 'Antarctic Ozone Hole',
    lat: -70.0,
    lng: -30.0,
    windSpeed: 220,
    temperature: -75,
    ozoneLevel: 80,
    jetStreamSpeed: 160,
    vortexStrength: 88,
    displacement: 8,
    status: 'weakening',
    description: 'Annual ozone depletion region',
  },
  {
    id: 'pv-arctic-displaced',
    name: 'Arctic Displaced Vortex',
    lat: 72.0,
    lng: -60.0,
    windSpeed: 150,
    temperature: -60,
    ozoneLevel: 220,
    jetStreamSpeed: 140,
    vortexStrength: 55,
    displacement: 18,
    status: 'displaced',
    description: 'Cold air outbreak pattern over North America',
  },
  {
    id: 'pv-antarctic-recovery',
    name: 'Antarctic Recovery Zone',
    lat: -65.0,
    lng: 90.0,
    windSpeed: 190,
    temperature: -70,
    ozoneLevel: 200,
    jetStreamSpeed: 155,
    vortexStrength: 78,
    displacement: 10,
    status: 'weakening',
    description: 'Spring ozone recovery monitoring',
  },
]

const STATUS_CONFIG: Record<
  PolarVortexData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-400 border-green-500/30' },
  weakening: { label: 'Weakening', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  displaced: { label: 'Displaced', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  split: { label: 'Split', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-400 border-red-500/30' },
}

export function PolarVortexMonitor() {
  const state = useMapStore((s) => s.polarVortex)
  const setState = useMapStore((s) => s.setPolarVortex)

  // Initialize demo data on mount if vortices array is empty
  useEffect(() => {
    if (useMapStore.getState().polarVortex.vortices.length === 0) {
      useMapStore.getState().setPolarVortex({ vortices: DEMO_VORTICES })
    }
  }, [])

  const vortices = useMemo(
    () => (state.vortices.length > 0 ? state.vortices : DEMO_VORTICES),
    [state.vortices]
  )

  const filteredVortices = useMemo(() => {
    return vortices.filter((v) => {
      if (state.hemisphereFilter === 'arctic' && v.lat < 0) return false
      if (state.hemisphereFilter === 'antarctic' && v.lat >= 0) return false
      return true
    })
  }, [vortices, state.hemisphereFilter])

  const summary = useMemo(() => {
    if (filteredVortices.length === 0) {
      return { avgWindSpeed: 0, avgOzoneLevel: 0, criticalCount: 0 }
    }
    const avgWindSpeed = filteredVortices.reduce((sum, v) => sum + v.windSpeed, 0) / filteredVortices.length
    const avgOzoneLevel = filteredVortices.reduce((sum, v) => sum + v.ozoneLevel, 0) / filteredVortices.length
    const criticalCount = filteredVortices.filter(
      (v) => v.status === 'split' || v.status === 'collapsed'
    ).length
    return {
      avgWindSpeed: Math.round(avgWindSpeed),
      avgOzoneLevel: Math.round(avgOzoneLevel),
      criticalCount,
    }
  }, [filteredVortices])

  const activeVortex = useMemo(
    () => vortices.find((v) => v.id === state.activeVortexId) ?? null,
    [vortices, state.activeVortexId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PolarVortexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: WindIcon4 },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showOzoneLevel', label: 'Ozone Level', icon: Cloud },
    { key: 'showJetStream', label: 'Jet Stream', icon: Gauge },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-cyan-800/30 rounded-xl shadow-lg overflow-hidden text-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <WindIcon4 className="h-4 w-4 text-cyan-400" />
              Polar Vortex Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Hemisphere Filter */}
          <div>
            <Label className="text-xs text-cyan-400 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Hemisphere
            </Label>
            <Select
              value={state.hemisphereFilter}
              onValueChange={(v) =>
                setState({
                  hemisphereFilter: v as PolarVortexState['hemisphereFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-950/50 border-cyan-800/30 text-cyan-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hemispheres</SelectItem>
                <SelectItem value="arctic">Arctic</SelectItem>
                <SelectItem value="antarctic">Antarctic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-400">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-cyan-800/30 bg-cyan-950/50 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-cyan-100">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-cyan-500">km/h</div>
            </div>
            <div className="rounded-lg border border-cyan-800/30 bg-cyan-950/50 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Avg Ozone</div>
              <div className="text-sm font-semibold text-cyan-100">{summary.avgOzoneLevel}</div>
              <div className="text-[9px] text-cyan-500">DU</div>
            </div>
            <div className="rounded-lg border border-cyan-800/30 bg-cyan-950/50 p-2 text-center">
              <div className="text-[10px] text-cyan-400">Critical</div>
              <div className="text-sm font-semibold text-orange-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-cyan-500">split/collapsed</div>
            </div>
          </div>

          <Separator className="bg-cyan-800/30" />

          {/* Vortex List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-400">
              Polar Vortexes ({filteredVortices.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredVortices.map((vortex) => {
                  const isActive = state.activeVortexId === vortex.id
                  const statusCfg = STATUS_CONFIG[vortex.status]
                  return (
                    <div
                      key={vortex.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/20'
                          : 'border-cyan-800/30 hover:border-cyan-600/30 hover:bg-cyan-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeVortexId: isActive ? null : vortex.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-cyan-100">{vortex.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300">
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-cyan-100 font-medium">
                              {vortex.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-cyan-100 font-medium">
                              {vortex.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showOzoneLevel && (
                          <div>
                            Ozone:{' '}
                            <span className="text-cyan-100 font-medium">
                              {vortex.ozoneLevel} DU
                            </span>
                          </div>
                        )}
                        {state.showJetStream && (
                          <div>
                            Jet:{' '}
                            <span className="text-cyan-100 font-medium">
                              {vortex.jetStreamSpeed} km/h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVortices.length === 0 && (
                  <div className="text-center text-xs text-cyan-500 py-4">
                    No vortices match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Vortex Details */}
          {activeVortex && (
            <>
              <Separator className="bg-cyan-800/30" />
              <div className="space-y-2 rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeVortex.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeVortex.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeVortex.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-cyan-200">
                  <div>
                    <span className="text-cyan-500">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeVortex.lat.toFixed(1)}, {activeVortex.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Wind Speed: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Temperature: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Ozone Level: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.ozoneLevel} DU</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Jet Stream: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.jetStreamSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Vortex Strength: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.vortexStrength}%</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Displacement: </span>
                    <span className="font-medium text-cyan-100">{activeVortex.displacement}°</span>
                  </div>
                  <div>
                    <span className="text-cyan-500">Status: </span>
                    <span className="font-medium text-cyan-100 capitalize">{activeVortex.status}</span>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-400 pt-1 border-t border-cyan-800/30">
                  {activeVortex.description}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
