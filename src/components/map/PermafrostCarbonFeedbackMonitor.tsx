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
import { useMapStore, type PermafrostCarbonFeedbackState, type PermafrostCarbonFeedbackData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon5, X, ArrowDown, Database, Flame, Snowflake, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: PermafrostCarbonFeedbackData[] = [
  {
    id: 'pcf-yedoma',
    name: 'Yedoma Siberia',
    lat: 68,
    lng: 135,
    thawDepth: 2.5,
    carbonStock: 130,
    methaneRelease: 45,
    temperature: -5,
    iceContent: 80,
    status: 'thawing',
    description: 'Ice-rich permafrost with massive carbon stores beginning to destabilize',
  },
  {
    id: 'pcf-mackenzie',
    name: 'Mackenzie Delta',
    lat: 69,
    lng: -135,
    thawDepth: 1.8,
    carbonStock: 85,
    methaneRelease: 25,
    temperature: -8,
    iceContent: 70,
    status: 'thawing',
    description: 'Arctic delta permafrost showing early signs of thermokarst formation',
  },
  {
    id: 'pcf-svalbard',
    name: 'Svalbard',
    lat: 78,
    lng: 16,
    thawDepth: 3.2,
    carbonStock: 45,
    methaneRelease: 60,
    temperature: -2,
    iceContent: 65,
    status: 'active_thaw',
    description: 'High Arctic islands experiencing accelerated permafrost degradation',
  },
  {
    id: 'pcf-tibetan',
    name: 'Tibetan Plateau',
    lat: 34,
    lng: 92,
    thawDepth: 2.0,
    carbonStock: 95,
    methaneRelease: 35,
    temperature: -3,
    iceContent: 55,
    status: 'active_thaw',
    description: 'High-altitude permafrost with increasing methane emissions from thaw lakes',
  },
  {
    id: 'pcf-northslope',
    name: 'North Slope Alaska',
    lat: 70,
    lng: -155,
    thawDepth: 4.0,
    carbonStock: 110,
    methaneRelease: 80,
    temperature: -1,
    iceContent: 75,
    status: 'accelerating',
    description: 'Rapidly warming Arctic permafrost with accelerating carbon feedback loops',
  },
  {
    id: 'pcf-hudsonbay',
    name: 'Hudson Bay Lowlands',
    lat: 55,
    lng: -85,
    thawDepth: 5.5,
    carbonStock: 140,
    methaneRelease: 120,
    temperature: 2,
    iceContent: 60,
    status: 'runaway',
    description: 'Subarctic peatland permafrost in runaway thaw with massive methane release',
  },
]

const STATUS_CONFIG: Record<
  PermafrostCarbonFeedbackData['status'],
  { label: string; color: string; bgClass: string }
> = {
  frozen: { label: 'Frozen', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  thawing: { label: 'Thawing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  active_thaw: { label: 'Active Thaw', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  accelerating: { label: 'Accelerating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  runaway: { label: 'Runaway', color: '#991b1b', bgClass: 'bg-red-900/10 text-red-900 border-red-900/30' },
}

const SEVERITY_LABELS: Record<PermafrostCarbonFeedbackState['severityFilter'], string> = {
  all: 'All Severities',
  frozen: 'Frozen',
  thawing: 'Thawing',
  active_thaw: 'Active Thaw',
  accelerating: 'Accelerating',
  runaway: 'Runaway',
}

export function PermafrostCarbonFeedbackMonitor() {
  const state = useMapStore((s) => s.permafrostCarbonFeedback)
  const setState = useMapStore((s) => s.setPermafrostCarbonFeedback)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.severityFilter !== 'all' && s.status !== state.severityFilter) return false
      return true
    })
  }, [sites, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgThawDepth: 0, avgMethane: 0, criticalCount: 0 }
    }
    const avgThawDepth =
      filteredSites.reduce((sum, s) => sum + s.thawDepth, 0) / filteredSites.length
    const avgMethane =
      filteredSites.reduce((sum, s) => sum + s.methaneRelease, 0) / filteredSites.length
    const criticalCount = filteredSites.filter(
      (s) => s.status === 'accelerating' || s.status === 'runaway'
    ).length
    return {
      avgThawDepth: Math.round(avgThawDepth * 10) / 10,
      avgMethane: Math.round(avgMethane * 10) / 10,
      criticalCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PermafrostCarbonFeedbackState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showThawDepth', label: 'Thaw Depth', icon: ArrowDown },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Database },
    { key: 'showMethaneRelease', label: 'Methane Release', icon: Flame },
    { key: 'showTemperature', label: 'Temperature', icon: Snowflake },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg shadow-amber-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <ThermometerIcon5 className="h-4 w-4 text-amber-400" />
              Permafrost Carbon Feedback
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Thaw Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as PermafrostCarbonFeedbackState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Thaw Depth</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgThawDepth}</div>
              <div className="text-[9px] text-amber-400">m</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Methane</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgMethane}</div>
              <div className="text-[9px] text-amber-400">mg/m&sup2;/day</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Accel/Runaway</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalCount}</div>
              <div className="text-[9px] text-amber-400">sites</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Monitoring Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const statusCfg = STATUS_CONFIG[site.status]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/60 bg-amber-800/30'
                          : 'border-amber-800/30 hover:border-amber-600/40 hover:bg-amber-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300">
                        {state.showThawDepth && (
                          <div>
                            Thaw Depth:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.thawDepth} m
                            </span>
                          </div>
                        )}
                        {state.showCarbonStock && (
                          <div>
                            Carbon Stock:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.carbonStock} GtC
                            </span>
                          </div>
                        )}
                        {state.showMethaneRelease && (
                          <div>
                            CH&#8324; Release:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.methaneRelease} mg/m&sup2;/day
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.temperature}&deg;C
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSite.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSite.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">Thaw Depth: </span>
                    <span className="font-medium text-orange-400">{activeSite.thawDepth} m</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Carbon Stock: </span>
                    <span className="font-medium text-amber-200">{activeSite.carbonStock} GtC</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Temperature: </span>
                    <span className="font-medium text-amber-200">{activeSite.temperature}&deg;C</span>
                  </div>
                  <div>
                    <span className="text-amber-400">CH&#8324; Release: </span>
                    <span className="font-medium text-red-400">{activeSite.methaneRelease} mg/m&sup2;/day</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Ice Content: </span>
                    <span className="font-medium text-amber-200">{activeSite.iceContent}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Description: </span>
                    <span className="font-medium text-amber-200">{activeSite.description}</span>
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
