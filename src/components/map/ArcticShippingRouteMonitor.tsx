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
import { useMapStore, type ArcticShippingRouteState, type ArcticShippingRouteData } from '@/lib/map-store'
import { Ship as ShipIcon3, X, BarChart3, MapPin, Filter, TrendingUp, Activity } from 'lucide-react'

const DEMO_ROUTES: ArcticShippingRouteData[] = [
  {
    id: 'as-nsr',
    name: 'Northern Sea Route',
    lat: 72,
    lng: 80,
    iceThickness: 0.5,
    navigability: 80,
    transitTime: 15,
    traffic: 65,
    iceFreeDays: 90,
    status: 'open',
    description: 'Russian Arctic route with increasing navigability due to ice melt',
  },
  {
    id: 'as-nwp',
    name: 'Northwest Passage',
    lat: 72,
    lng: -95,
    iceThickness: 1.5,
    navigability: 35,
    transitTime: 25,
    traffic: 15,
    iceFreeDays: 30,
    status: 'restricted',
    description: 'Canadian Arctic route still largely restricted by multi-year ice',
  },
  {
    id: 'as-transpolar',
    name: 'Transpolar Route',
    lat: 85,
    lng: 0,
    iceThickness: 2.0,
    navigability: 20,
    transitTime: 30,
    traffic: 5,
    iceFreeDays: 15,
    status: 'closed',
    description: 'Direct over-the-pole route still blocked by thick multi-year ice',
  },
  {
    id: 'as-norway',
    name: 'Coastal Norway',
    lat: 70,
    lng: 20,
    iceThickness: 0,
    navigability: 95,
    transitTime: 10,
    traffic: 85,
    iceFreeDays: 180,
    status: 'increasing',
    description: 'Ice-free route along Norwegian coast with growing traffic',
  },
  {
    id: 'as-bering',
    name: 'Bering Strait',
    lat: 66,
    lng: -170,
    iceThickness: 0.8,
    navigability: 60,
    transitTime: 20,
    traffic: 40,
    iceFreeDays: 60,
    status: 'partial',
    description: 'Strategic gateway between Pacific and Arctic with seasonal access',
  },
  {
    id: 'as-hudson',
    name: 'Hudson Bay',
    lat: 60,
    lng: -85,
    iceThickness: 1.2,
    navigability: 30,
    transitTime: 28,
    traffic: 10,
    iceFreeDays: 45,
    status: 'restricted',
    description: 'Seasonal route through Hudson Bay with limited ice-free window',
  },
]

const STATUS_CONFIG: Record<
  ArcticShippingRouteData['status'],
  { label: string; color: string; bgClass: string }
> = {
  closed: { label: 'Closed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  restricted: { label: 'Restricted', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  partial: { label: 'Partial', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  open: { label: 'Open', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  increasing: { label: 'Increasing', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

export function ArcticShippingRouteMonitor() {
  const state = useMapStore((s) => s.arcticShippingRoute)
  const setState = useMapStore((s) => s.setArcticShippingRoute)

  const routes = useMemo(
    () => (state.routes.length > 0 ? state.routes : DEMO_ROUTES),
    [state.routes]
  )

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (state.routeFilter !== 'all') {
        const routeMap: Record<string, string[]> = {
          northern_sea: ['as-nsr'],
          northwest_passage: ['as-nwp', 'as-hudson'],
          transpolar: ['as-transpolar'],
          coastal: ['as-norway', 'as-bering'],
        }
        if (!routeMap[state.routeFilter]?.includes(r.id)) return false
      }
      return true
    })
  }, [routes, state.routeFilter])

  const summary = useMemo(() => {
    if (filteredRoutes.length === 0) {
      return { avgNavigability: 0, avgIceFreeDays: 0, totalTraffic: 0 }
    }
    const avgNavigability =
      filteredRoutes.reduce((sum, r) => sum + r.navigability, 0) / filteredRoutes.length
    const avgIceFreeDays =
      filteredRoutes.reduce((sum, r) => sum + r.iceFreeDays, 0) / filteredRoutes.length
    const totalTraffic = filteredRoutes.reduce((sum, r) => sum + r.traffic, 0)
    return {
      avgNavigability: Math.round(avgNavigability),
      avgIceFreeDays: Math.round(avgIceFreeDays),
      totalTraffic,
    }
  }, [filteredRoutes])

  const activeRoute = useMemo(
    () => routes.find((r) => r.id === state.activeRouteId) ?? null,
    [routes, state.activeRouteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ArcticShippingRouteState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIceThickness', label: 'Ice Thickness', icon: BarChart3 },
    { key: 'showNavigability', label: 'Navigability', icon: Activity },
    { key: 'showTransitTime', label: 'Transit Time', icon: TrendingUp },
    { key: 'showTraffic', label: 'Traffic', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg shadow-sky-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <ShipIcon3 className="h-4 w-4 text-sky-400" />
              Arctic Shipping Route Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Route Filter */}
          <div>
            <Label className="text-xs text-sky-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Route Type
            </Label>
            <Select
              value={state.routeFilter}
              onValueChange={(v) =>
                setState({
                  routeFilter: v as ArcticShippingRouteState['routeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="northern_sea">Northern Sea Route</SelectItem>
                <SelectItem value="northwest_passage">Northwest Passage</SelectItem>
                <SelectItem value="transpolar">Transpolar Route</SelectItem>
                <SelectItem value="coastal">Coastal Routes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Avg Nav.</div>
              <div className="text-sm font-semibold text-sky-300">{summary.avgNavigability}%</div>
              <div className="text-[9px] text-sky-400">score</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Ice-Free Days</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgIceFreeDays}</div>
              <div className="text-[9px] text-sky-400">avg/yr</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400">Total Traffic</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalTraffic}</div>
              <div className="text-[9px] text-sky-400">vessels</div>
            </div>
          </div>

          <Separator className="bg-sky-800/30" />

          {/* Route List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300">
              Shipping Routes ({filteredRoutes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRoutes.map((route) => {
                  const isActive = state.activeRouteId === route.id
                  const statusCfg = STATUS_CONFIG[route.status]
                  return (
                    <div
                      key={route.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/60 bg-sky-800/30'
                          : 'border-sky-800/30 hover:border-sky-600/40 hover:bg-sky-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeRouteId: isActive ? null : route.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-sky-100">{route.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300">
                        {state.showIceThickness && (
                          <div>
                            Ice:{' '}
                            <span className="text-sky-100 font-medium">
                              {route.iceThickness} m
                            </span>
                          </div>
                        )}
                        {state.showNavigability && (
                          <div>
                            Nav.:{' '}
                            <span className="text-emerald-400 font-medium">
                              {route.navigability}%
                            </span>
                          </div>
                        )}
                        {state.showTransitTime && (
                          <div>
                            Transit:{' '}
                            <span className="text-sky-100 font-medium">
                              {route.transitTime} days
                            </span>
                          </div>
                        )}
                        {state.showTraffic && (
                          <div>
                            Traffic:{' '}
                            <span className="text-sky-200 font-medium">
                              {route.traffic} vessels
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRoutes.length === 0 && (
                  <div className="text-center text-xs text-sky-400 py-4">
                    No routes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Route Details */}
          {activeRoute && (
            <>
              <Separator className="bg-sky-800/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeRoute.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeRoute.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeRoute.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeRoute.lat.toFixed(1)}, {activeRoute.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400">Ice Thickness: </span>
                    <span className="font-medium text-sky-200">{activeRoute.iceThickness} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Navigability: </span>
                    <span className="font-medium text-emerald-400">{activeRoute.navigability}%</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Transit Time: </span>
                    <span className="font-medium text-sky-200">{activeRoute.transitTime} days</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Traffic: </span>
                    <span className="font-medium text-sky-200">{activeRoute.traffic} vessels</span>
                  </div>
                  <div>
                    <span className="text-sky-400">Ice-Free Days: </span>
                    <span className="font-medium text-emerald-400">{activeRoute.iceFreeDays} days</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sky-400">Description: </span>
                    <span className="font-medium text-sky-200">{activeRoute.description}</span>
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
