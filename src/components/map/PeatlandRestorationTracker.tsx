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
import { useMapStore, type PeatlandRestorationState, type PeatlandRestorationData } from '@/lib/map-store'
import { Sprout as SproutIcon3, X, Droplets, TreePine, Atom, TrendingUp, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: PeatlandRestorationData[] = [
  {
    id: 'pr-1', name: 'Flow Country Scotland', lat: 58.4, lng: -3.8, waterTable: 5, vegetation: 85, carbonStock: 2500, restorationProgress: 100, area: 4000, status: 'pristine', description: 'Largest blanket bog in Europe, pristine peatland ecosystem',
  },
  {
    id: 'pr-2', name: 'Borneo Peatlands', lat: 2, lng: 114, waterTable: -30, vegetation: 25, carbonStock: 1500, restorationProgress: 15, area: 5000, status: 'degraded', description: 'Severely degraded tropical peatlands from palm oil conversion',
  },
  {
    id: 'pr-3', name: 'Pekan Pahang Malaysia', lat: 3.5, lng: 103, waterTable: -10, vegetation: 45, carbonStock: 1800, restorationProgress: 45, area: 800, status: 'restoring', description: 'Active peatland restoration project in Southeast Asia',
  },
  {
    id: 'pr-4', name: 'Ruster Vieh Germany', lat: 52, lng: 14, waterTable: 3, vegetation: 70, carbonStock: 800, restorationProgress: 90, area: 200, status: 'restored', description: 'Successfully restored temperate peatland in Brandenburg',
  },
  {
    id: 'pr-5', name: 'Congo Basin', lat: -1, lng: 23, waterTable: -20, vegetation: 30, carbonStock: 2000, restorationProgress: 5, area: 3000, status: 'degraded', description: 'Vast degraded peatlands in Central Africa',
  },
  {
    id: 'pr-6', name: 'Everglades Florida', lat: 26, lng: -81, waterTable: 2, vegetation: 60, carbonStock: 600, restorationProgress: 60, area: 1500, status: 'restoring', description: 'Major wetland restoration in the Florida Everglades',
  },
]

const STATUS_CONFIG: Record<PeatlandRestorationData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  restoring: { label: 'Restoring', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  restored: { label: 'Restored', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  failed: { label: 'Failed', color: '#991b1b', bgClass: 'bg-red-900/10 text-red-800 border-red-800/30' },
}

export function PeatlandRestorationTracker() {
  const state = useMapStore((s) => s.peatlandRestoration)
  const setState = useMapStore((s) => s.setPeatlandRestoration)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [sites, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgCarbonStock: 0, avgProgress: 0, restoringCount: 0 }
    }
    const avgCarbonStock = filteredSites.reduce((sum, s) => sum + s.carbonStock, 0) / filteredSites.length
    const avgProgress = filteredSites.reduce((sum, s) => sum + s.restorationProgress, 0) / filteredSites.length
    const restoringCount = filteredSites.filter((s) => s.status === 'restoring').length
    return {
      avgCarbonStock: Math.round(avgCarbonStock),
      avgProgress: Math.round(avgProgress),
      restoringCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PeatlandRestorationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterTable', label: 'Water Table', icon: Droplets },
    { key: 'showVegetation', label: 'Vegetation', icon: TreePine },
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Atom },
    { key: 'showRestorationProgress', label: 'Restoration Progress', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg shadow-green-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <SproutIcon3 className="h-4 w-4 text-green-400" />
              Peatland Restoration Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PeatlandRestorationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="restoring">Restoring</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Carbon Stock</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-green-400">tC/ha</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg Progress</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgProgress}</div>
              <div className="text-[9px] text-green-400">%</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Restoring</div>
              <div className="text-sm font-semibold text-amber-400">{summary.restoringCount}</div>
              <div className="text-[9px] text-green-400">sites</div>
            </div>
          </div>

          <Separator className="bg-green-800/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">
              Peatland Sites ({filteredSites.length})
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
                          ? 'border-green-500/60 bg-green-800/30'
                          : 'border-green-800/30 hover:border-green-600/40 hover:bg-green-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : site.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-green-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300">
                        {state.showWaterTable && (
                          <div>
                            Water: <span className="text-green-100 font-medium">{site.waterTable} cm</span>
                          </div>
                        )}
                        {state.showVegetation && (
                          <div>
                            Vegetation: <span className="text-green-100 font-medium">{site.vegetation}%</span>
                          </div>
                        )}
                        {state.showCarbonStock && (
                          <div>
                            Carbon: <span className="text-green-100 font-medium">{site.carbonStock} tC/ha</span>
                          </div>
                        )}
                        {state.showRestorationProgress && (
                          <div>
                            Progress: <span className="text-green-100 font-medium">{site.restorationProgress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-green-400 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-green-800/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSite.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSite.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400">Water Table: </span>
                    <span className="font-medium text-emerald-300">{activeSite.waterTable} cm</span>
                  </div>
                  <div>
                    <span className="text-green-400">Vegetation: </span>
                    <span className="font-medium text-green-200">{activeSite.vegetation}%</span>
                  </div>
                  <div>
                    <span className="text-green-400">Carbon Stock: </span>
                    <span className="font-medium text-green-200">{activeSite.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-green-400">Progress: </span>
                    <span className="font-medium text-green-200">{activeSite.restorationProgress}%</span>
                  </div>
                  <div>
                    <span className="text-green-400">Area: </span>
                    <span className="font-medium text-green-200">{activeSite.area} ha</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-400">Description: </span>
                    <span className="font-medium text-green-200">{activeSite.description}</span>
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
