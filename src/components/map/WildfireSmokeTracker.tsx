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
import { useMapStore, type WildfireSmokeState, type WildfireSmokeData } from '@/lib/map-store'
import { CloudFog as CloudFogIcon2, X, Eye, Wind, ArrowUpFromLine, Move, MapPin, Filter } from 'lucide-react'

interface DemoPlume extends WildfireSmokeData {
  severityLevel?: string
}

const DEMO_PLUMES: DemoPlume[] = [
  {
    id: 'wst-canada',
    name: 'Canadian Wildfires',
    lat: 55,
    lng: -110,
    aod: 3.5,
    pm25: 150,
    plumeHeight: 12,
    dispersion: 85,
    fireArea: 25000,
    status: 'heavy',
    description: 'Major wildfire smoke plumes from Canadian boreal forests',
  },
  {
    id: 'wst-siberia',
    name: 'Siberian Fires',
    lat: 62,
    lng: 100,
    aod: 2.8,
    pm25: 120,
    plumeHeight: 10,
    dispersion: 70,
    fireArea: 18000,
    status: 'moderate',
    description: 'Smoke plumes from Siberian taiga wildfire activity',
  },
  {
    id: 'wst-australia',
    name: 'Australian Bushfires',
    lat: -33,
    lng: 149,
    aod: 4.2,
    pm25: 200,
    plumeHeight: 15,
    dispersion: 90,
    fireArea: 35000,
    status: 'hazardous',
    description: 'Hazardous smoke from Australian bushfire complexes',
  },
  {
    id: 'wst-amazon',
    name: 'Amazon Fires',
    lat: -5,
    lng: -60,
    aod: 2.2,
    pm25: 90,
    plumeHeight: 8,
    dispersion: 60,
    fireArea: 12000,
    status: 'moderate',
    description: 'Smoke from deforestation and agricultural fires in Amazon',
  },
  {
    id: 'wst-california',
    name: 'California Fires',
    lat: 37,
    lng: -120,
    aod: 3.0,
    pm25: 130,
    plumeHeight: 11,
    dispersion: 75,
    fireArea: 20000,
    status: 'heavy',
    description: 'Heavy smoke plumes from California wildfire season',
  },
  {
    id: 'wst-indonesia',
    name: 'Indonesian Fires',
    lat: 0,
    lng: 110,
    aod: 2.5,
    pm25: 110,
    plumeHeight: 9,
    dispersion: 65,
    fireArea: 15000,
    status: 'light',
    description: 'Light smoke from peatland fires in Indonesia',
  },
]

const STATUS_CONFIG: Record<
  WildfireSmokeData['status'],
  { label: string; color: string; bgClass: string }
> = {
  clear: { label: 'Clear', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  light: { label: 'Light', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  heavy: { label: 'Heavy', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  hazardous: { label: 'Hazardous', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function WildfireSmokeTracker() {
  const state = useMapStore((s) => s.wildfireSmoke)
  const setState = useMapStore((s) => s.setWildfireSmoke)

  const plumes = useMemo(
    () => (state.plumes.length > 0 ? (state.plumes as DemoPlume[]) : DEMO_PLUMES),
    [state.plumes]
  )

  const filteredPlumes = useMemo(() => {
    return plumes.filter((p) => {
      if (state.severityFilter !== 'all' && p.status !== state.severityFilter) return false
      return true
    })
  }, [plumes, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredPlumes.length === 0) {
      return { avgAOD: 0, avgPM25: 0, heavyHazardousCount: 0 }
    }
    const avgAOD =
      filteredPlumes.reduce((sum, p) => sum + p.aod, 0) / filteredPlumes.length
    const avgPM25 =
      filteredPlumes.reduce((sum, p) => sum + p.pm25, 0) / filteredPlumes.length
    const heavyHazardousCount = filteredPlumes.filter(
      (p) => p.status === 'heavy' || p.status === 'hazardous'
    ).length
    return {
      avgAOD: Math.round(avgAOD * 100) / 100,
      avgPM25: Math.round(avgPM25),
      heavyHazardousCount,
    }
  }, [filteredPlumes])

  const activePlume = useMemo(
    () => plumes.find((p) => p.id === state.activePlumeId) ?? null,
    [plumes, state.activePlumeId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WildfireSmokeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAOD', label: 'AOD', icon: Eye },
    { key: 'showPM25', label: 'PM2.5', icon: Wind },
    { key: 'showPlumeHeight', label: 'Plume Height', icon: ArrowUpFromLine },
    { key: 'showDispersion', label: 'Dispersion', icon: Move },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-gray-950/95 to-slate-950/95 backdrop-blur-xl border border-gray-700/40 rounded-xl shadow-lg shadow-gray-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-100">
              <CloudFogIcon2 className="h-4 w-4 text-gray-400" />
              Wildfire Smoke Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-gray-100 hover:bg-gray-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-gray-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-gray-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as WildfireSmokeState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-gray-900/40 border-gray-700/40 text-gray-100 hover:bg-gray-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-200">
                  <Icon className="h-3 w-3 text-gray-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-gray-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Avg AOD</div>
              <div className="text-sm font-semibold text-gray-300">{summary.avgAOD}</div>
              <div className="text-[9px] text-gray-400">index</div>
            </div>
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Avg PM2.5</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgPM25}</div>
              <div className="text-[9px] text-gray-400">&mu;g/m&sup3;</div>
            </div>
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Heavy/Hazardous</div>
              <div className="text-sm font-semibold text-red-400">{summary.heavyHazardousCount}</div>
              <div className="text-[9px] text-gray-400">plumes</div>
            </div>
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Plume List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">
              Smoke Plumes ({filteredPlumes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPlumes.map((plume) => {
                  const isActive = state.activePlumeId === plume.id
                  const statusCfg = STATUS_CONFIG[plume.status]
                  return (
                    <div
                      key={plume.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-gray-500/60 bg-gray-800/30'
                          : 'border-gray-700/30 hover:border-gray-600/40 hover:bg-gray-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activePlumeId: isActive ? null : plume.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-gray-100">{plume.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-300">
                        {state.showAOD && (
                          <div>
                            AOD:{' '}
                            <span className="text-gray-100 font-medium">
                              {plume.aod}
                            </span>
                          </div>
                        )}
                        {state.showPM25 && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-gray-100 font-medium">
                              {plume.pm25} &mu;g/m&sup3;
                            </span>
                          </div>
                        )}
                        {state.showPlumeHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-gray-100 font-medium">
                              {plume.plumeHeight} km
                            </span>
                          </div>
                        )}
                        {state.showDispersion && (
                          <div>
                            Dispersion:{' '}
                            <span className="text-gray-100 font-medium">
                              {plume.dispersion}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPlumes.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">
                    No plumes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Plume Details */}
          {activePlume && (
            <>
              <Separator className="bg-gray-700/30" />
              <div className="space-y-2 rounded-lg border border-gray-600/30 bg-gray-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-100">{activePlume.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activePlume.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activePlume.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400">Coordinates: </span>
                    <span className="font-medium text-gray-100">
                      {activePlume.lat.toFixed(1)}, {activePlume.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">AOD: </span>
                    <span className="font-medium text-gray-200">{activePlume.aod}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">PM2.5: </span>
                    <span className="font-medium text-amber-400">{activePlume.pm25} &mu;g/m&sup3;</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Plume Height: </span>
                    <span className="font-medium text-gray-200">{activePlume.plumeHeight} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dispersion: </span>
                    <span className="font-medium text-gray-200">{activePlume.dispersion}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fire Area: </span>
                    <span className="font-medium text-orange-400">{activePlume.fireArea.toLocaleString()} ha</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Description: </span>
                    <span className="font-medium text-gray-200">{activePlume.description}</span>
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
