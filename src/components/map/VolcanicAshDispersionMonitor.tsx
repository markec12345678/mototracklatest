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
import { useMapStore, type VolcanicAshDispersionState, type VolcanicAshDispersionData } from '@/lib/map-store'
import { Cloud as CloudIcon3, X, ArrowUp, Wind, Plane, CloudRain, MapPin, Filter } from 'lucide-react'

const DEMO_CLOUDS: VolcanicAshDispersionData[] = [
  {
    id: 'vad-1', name: 'Eyjafjallajökull 2010', lat: 63.6, lng: -19.6, ashColumn: 10, dispersion: 90, aviationRisk: 95, fallout: 70, so2Mass: 250, status: 'catastrophic', description: 'Massive ash cloud that disrupted European airspace for weeks',
  },
  {
    id: 'vad-2', name: 'Hunga Tonga 2022', lat: -20.5, lng: -175.4, ashColumn: 35, dispersion: 98, aviationRisk: 85, fallout: 40, so2Mass: 400, status: 'catastrophic', description: 'Unprecedented volcanic plume reaching mesosphere',
  },
  {
    id: 'vad-3', name: 'Sakurajima', lat: 31.6, lng: 130.7, ashColumn: 5, dispersion: 60, aviationRisk: 55, fallout: 50, so2Mass: 50, status: 'warning', description: 'Frequent explosive eruptions near Kagoshima city',
  },
  {
    id: 'vad-4', name: 'Etna', lat: 37.8, lng: 15, ashColumn: 8, dispersion: 65, aviationRisk: 50, fallout: 45, so2Mass: 80, status: 'warning', description: 'Persistent ash emissions from Europe\'s most active volcano',
  },
  {
    id: 'vad-5', name: 'Popocatépetl', lat: 19, lng: -98.6, ashColumn: 4, dispersion: 45, aviationRisk: 40, fallout: 35, so2Mass: 30, status: 'advisory', description: 'Ongoing moderate ash emissions near Mexico City',
  },
  {
    id: 'vad-6', name: 'Ruang Indonesia', lat: 2.3, lng: 125.4, ashColumn: 18, dispersion: 80, aviationRisk: 75, fallout: 55, so2Mass: 150, status: 'critical', description: 'Major explosive eruption forcing mass evacuations',
  },
]

const STATUS_CONFIG: Record<VolcanicAshDispersionData['status'], { label: string; color: string; bgClass: string }> = {
  advisory: { label: 'Advisory', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function VolcanicAshDispersionMonitor() {
  const state = useMapStore((s) => s.volcanicAshDispersion)
  const setState = useMapStore((s) => s.setVolcanicAshDispersion)

  const clouds = useMemo(
    () => (state.clouds.length > 0 ? state.clouds : DEMO_CLOUDS),
    [state.clouds]
  )

  const filteredClouds = useMemo(() => {
    return clouds.filter((c) => {
      if (state.severityFilter !== 'all' && c.status !== state.severityFilter) return false
      return true
    })
  }, [clouds, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredClouds.length === 0) {
      return { avgAshColumn: 0, avgAviationRisk: 0, criticalCount: 0 }
    }
    const avgAshColumn = filteredClouds.reduce((sum, c) => sum + c.ashColumn, 0) / filteredClouds.length
    const avgAviationRisk = filteredClouds.reduce((sum, c) => sum + c.aviationRisk, 0) / filteredClouds.length
    const criticalCount = filteredClouds.filter((c) => c.status === 'critical' || c.status === 'catastrophic').length
    return {
      avgAshColumn: Math.round(avgAshColumn * 10) / 10,
      avgAviationRisk: Math.round(avgAviationRisk),
      criticalCount,
    }
  }, [filteredClouds])

  const activeCloud = useMemo(
    () => clouds.find((c) => c.id === state.activeCloudId) ?? null,
    [clouds, state.activeCloudId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicAshDispersionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAshColumn', label: 'Ash Column', icon: ArrowUp },
    { key: 'showDispersion', label: 'Dispersion', icon: Wind },
    { key: 'showAviationRisk', label: 'Aviation Risk', icon: Plane },
    { key: 'showFallout', label: 'Fallout', icon: CloudRain },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-gray-950/95 to-stone-950/95 backdrop-blur-xl border border-gray-700/40 rounded-xl shadow-lg shadow-gray-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-100">
              <CloudIcon3 className="h-4 w-4 text-gray-400" />
              Volcanic Ash Dispersion Monitor
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
              Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as VolcanicAshDispersionState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-gray-800/40 border-gray-600/40 text-gray-100 hover:bg-gray-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="catastrophic">Catastrophic</SelectItem>
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
            <div className="rounded-lg border border-gray-600/30 bg-gray-800/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Avg Ash Column</div>
              <div className="text-sm font-semibold text-stone-300">{summary.avgAshColumn}</div>
              <div className="text-[9px] text-gray-400">km</div>
            </div>
            <div className="rounded-lg border border-gray-600/30 bg-gray-800/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Avg Aviation Risk</div>
              <div className="text-sm font-semibold text-gray-300">{summary.avgAviationRisk}</div>
              <div className="text-[9px] text-gray-400">%</div>
            </div>
            <div className="rounded-lg border border-gray-600/30 bg-gray-800/30 p-2 text-center">
              <div className="text-[10px] text-gray-400">Critical+</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-gray-400">clouds</div>
            </div>
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Cloud List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">
              Ash Clouds ({filteredClouds.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredClouds.map((cloud) => {
                  const isActive = state.activeCloudId === cloud.id
                  const statusCfg = STATUS_CONFIG[cloud.status]
                  return (
                    <div
                      key={cloud.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-gray-500/60 bg-gray-800/30'
                          : 'border-gray-700/30 hover:border-gray-500/40 hover:bg-gray-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCloudId: isActive ? null : cloud.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-gray-100">{cloud.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-300">
                        {state.showAshColumn && (
                          <div>
                            Column: <span className="text-gray-100 font-medium">{cloud.ashColumn} km</span>
                          </div>
                        )}
                        {state.showDispersion && (
                          <div>
                            Dispersion: <span className="text-gray-100 font-medium">{cloud.dispersion}%</span>
                          </div>
                        )}
                        {state.showAviationRisk && (
                          <div>
                            Aviation: <span className="text-gray-100 font-medium">{cloud.aviationRisk}%</span>
                          </div>
                        )}
                        {state.showFallout && (
                          <div>
                            Fallout: <span className="text-gray-100 font-medium">{cloud.fallout}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredClouds.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">
                    No clouds match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cloud Details */}
          {activeCloud && (
            <>
              <Separator className="bg-gray-700/30" />
              <div className="space-y-2 rounded-lg border border-gray-500/30 bg-gray-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-100">{activeCloud.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCloud.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCloud.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400">Coordinates: </span>
                    <span className="font-medium text-gray-100">
                      {activeCloud.lat.toFixed(1)}, {activeCloud.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ash Column: </span>
                    <span className="font-medium text-stone-300">{activeCloud.ashColumn} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dispersion: </span>
                    <span className="font-medium text-gray-200">{activeCloud.dispersion}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Aviation Risk: </span>
                    <span className="font-medium text-red-400">{activeCloud.aviationRisk}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fallout: </span>
                    <span className="font-medium text-gray-200">{activeCloud.fallout}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">SO2 Mass: </span>
                    <span className="font-medium text-gray-200">{activeCloud.so2Mass} kt</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Description: </span>
                    <span className="font-medium text-gray-200">{activeCloud.description}</span>
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
