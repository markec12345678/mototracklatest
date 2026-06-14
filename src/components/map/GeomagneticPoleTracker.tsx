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
import { useMapStore, type GeomagneticPoleData, type GeomagneticPoleState } from '@/lib/map-store'
import { Compass as CompassIcon3, X, Gauge, ArrowRightLeft, Magnet, MapPin, Filter } from 'lucide-react'

const DEMO_POLES: GeomagneticPoleData[] = [
  {
    id: 'gp-north-2025',
    name: 'North Magnetic Pole 2025',
    lat: 86.0,
    lng: -155.0,
    driftRate: 55,
    fieldStrength: 58,
    inclination: 89.5,
    declination: 0,
    historicalShift: 2200,
    status: 'accelerating',
    description: 'Arctic Canada - Rapid drift toward Siberia',
  },
  {
    id: 'gp-south',
    name: 'South Magnetic Pole',
    lat: -64.5,
    lng: 137.0,
    driftRate: 12,
    fieldStrength: 64,
    inclination: -89.2,
    declination: 0,
    historicalShift: 800,
    status: 'shifting',
    description: 'Antarctica - Slower than north pole',
  },
  {
    id: 'gp-saa',
    name: 'South Atlantic Anomaly',
    lat: -28.0,
    lng: -42.0,
    driftRate: 30,
    fieldStrength: 22,
    inclination: 35,
    declination: -22,
    historicalShift: 1500,
    status: 'accelerating',
    description: 'Brazil - Weakest field on Earth',
  },
  {
    id: 'gp-europe',
    name: 'European Magnetic Observatory',
    lat: 48.0,
    lng: 2.0,
    driftRate: 8,
    fieldStrength: 48,
    inclination: 65,
    declination: 1.5,
    historicalShift: 200,
    status: 'stable',
    description: 'France - Chambon-la-Forêt observatory',
  },
  {
    id: 'gp-hawaii',
    name: 'Hawaiian Observatory',
    lat: 21.0,
    lng: -158.0,
    driftRate: 15,
    fieldStrength: 38,
    inclination: 42,
    declination: 10,
    historicalShift: 450,
    status: 'shifting',
    description: 'USA - Mid-Pacific field monitoring',
  },
  {
    id: 'gp-laschamp',
    name: 'Laschamp Excursion Site',
    lat: 45.5,
    lng: 2.5,
    driftRate: 85,
    fieldStrength: 15,
    inclination: 25,
    declination: -45,
    historicalShift: 3500,
    status: 'excursion',
    description: 'France - 41,000 BP geomagnetic reversal site',
  },
]

const STATUS_CONFIG: Record<
  GeomagneticPoleData['status'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  shifting: { label: 'Shifting', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  accelerating: { label: 'Accelerating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  excursion: { label: 'Excursion', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  reversal: { label: 'Reversal', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function GeomagneticPoleTracker() {
  const state = useMapStore((s) => s.geomagneticPole)
  const setState = useMapStore((s) => s.setGeomagneticPole)

  useEffect(() => {
    if (useMapStore.getState().geomagneticPole.poles.length === 0) {
      useMapStore.getState().setGeomagneticPole({ poles: DEMO_POLES })
    }
  }, [])

  const poles = useMemo(
    () => (state.poles.length > 0 ? state.poles : DEMO_POLES),
    [state.poles]
  )

  const filteredPoles = useMemo(() => {
    return poles.filter((p) => {
      if (state.poleFilter === 'north' && p.lat < 0) return false
      if (state.poleFilter === 'south' && p.lat >= 0) return false
      return true
    })
  }, [poles, state.poleFilter])

  const summary = useMemo(() => {
    if (filteredPoles.length === 0) {
      return { avgDriftRate: 0, avgFieldStrength: 0, criticalCount: 0 }
    }
    const avgDriftRate = filteredPoles.reduce((sum, p) => sum + p.driftRate, 0) / filteredPoles.length
    const avgFieldStrength = filteredPoles.reduce((sum, p) => sum + p.fieldStrength, 0) / filteredPoles.length
    const criticalCount = filteredPoles.filter(
      (p) => p.status === 'accelerating' || p.status === 'excursion' || p.status === 'reversal'
    ).length
    return {
      avgDriftRate: Math.round(avgDriftRate * 10) / 10,
      avgFieldStrength: Math.round(avgFieldStrength * 10) / 10,
      criticalCount,
    }
  }, [filteredPoles])

  const activePole = useMemo(
    () => poles.find((p) => p.id === state.activePoleId) ?? null,
    [poles, state.activePoleId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeomagneticPoleState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDriftRate', label: 'Drift Rate', icon: ArrowRightLeft },
    { key: 'showFieldStrength', label: 'Field Strength', icon: Magnet },
    { key: 'showInclination', label: 'Inclination', icon: Gauge },
    { key: 'showDeclination', label: 'Declination', icon: CompassIcon3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-purple-950/95 to-fuchsia-950/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-lg shadow-purple-500/10 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <CompassIcon3 className="h-4 w-4 text-fuchsia-400" />
              Geomagnetic Pole Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Pole Filter */}
          <div>
            <Label className="text-xs text-purple-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Hemisphere
            </Label>
            <Select
              value={state.poleFilter}
              onValueChange={(v) =>
                setState({
                  poleFilter: v as GeomagneticPoleState['poleFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/50 border-purple-500/30 text-purple-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Poles</SelectItem>
                <SelectItem value="north">Northern Hemisphere</SelectItem>
                <SelectItem value="south">Southern Hemisphere</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-purple-500/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-200">
                  <Icon className="h-3 w-3 text-fuchsia-400" />
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

          <Separator className="bg-purple-500/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-purple-500/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-300">Avg Drift Rate</div>
              <div className="text-sm font-semibold text-fuchsia-300">{summary.avgDriftRate}</div>
              <div className="text-[9px] text-purple-400">km/yr</div>
            </div>
            <div className="rounded-lg border border-purple-500/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-300">Avg Field</div>
              <div className="text-sm font-semibold text-fuchsia-300">{summary.avgFieldStrength}</div>
              <div className="text-[9px] text-purple-400">μT</div>
            </div>
            <div className="rounded-lg border border-purple-500/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-300">Critical</div>
              <div className="text-sm font-semibold text-orange-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-purple-400">stations</div>
            </div>
          </div>

          <Separator className="bg-purple-500/20" />

          {/* Pole List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300">
              Geomagnetic Stations ({filteredPoles.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPoles.map((pole) => {
                  const isActive = state.activePoleId === pole.id
                  const statusCfg = STATUS_CONFIG[pole.status]
                  return (
                    <div
                      key={pole.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-fuchsia-500/50 bg-fuchsia-500/10'
                          : 'border-purple-500/30 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activePoleId: isActive ? null : pole.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-purple-100">{pole.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-purple-300">
                        {state.showDriftRate && (
                          <div>
                            Drift:{' '}
                            <span className="text-purple-100 font-medium">
                              {pole.driftRate} km/yr
                            </span>
                          </div>
                        )}
                        {state.showFieldStrength && (
                          <div>
                            Field:{' '}
                            <span className="text-purple-100 font-medium">
                              {pole.fieldStrength} μT
                            </span>
                          </div>
                        )}
                        {state.showInclination && (
                          <div>
                            Incl.:{' '}
                            <span className="text-purple-100 font-medium">
                              {pole.inclination}°
                            </span>
                          </div>
                        )}
                        {state.showDeclination && (
                          <div>
                            Decl.:{' '}
                            <span className="text-purple-100 font-medium">
                              {pole.declination}°
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPoles.length === 0 && (
                  <div className="text-center text-xs text-purple-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Pole Details */}
          {activePole && (
            <>
              <Separator className="bg-purple-500/20" />
              <div className="space-y-2 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span className="text-xs font-semibold text-purple-100">{activePole.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activePole.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activePole.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-purple-400">Coordinates: </span>
                    <span className="font-medium text-purple-100">
                      {activePole.lat.toFixed(1)}, {activePole.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400">Drift Rate: </span>
                    <span className="font-medium text-purple-100">{activePole.driftRate} km/yr</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Field Strength: </span>
                    <span className="font-medium text-purple-100">{activePole.fieldStrength} μT</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Inclination: </span>
                    <span className="font-medium text-purple-100">{activePole.inclination}°</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Declination: </span>
                    <span className="font-medium text-purple-100">{activePole.declination}°</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Hist. Shift: </span>
                    <span className="font-medium text-purple-100">{activePole.historicalShift} km</span>
                  </div>
                </div>
                <div className="text-[10px] text-purple-300 italic">
                  {activePole.description}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
