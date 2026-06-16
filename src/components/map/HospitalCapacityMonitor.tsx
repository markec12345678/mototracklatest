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
import { useMapStore, type HospitalCapacityState, type HospitalCapacityData } from '@/lib/map-store'
import { Building2 as Building2Icon, X, Bed, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HospitalCapacityData[] = [
  {
    id: 'hc-nyc',
    name: 'NYC Health System',
    lat: 40.713,
    lng: -74.007,
    bedOccupancy: 87,
    icuUtilization: 92,
    ventilatorUsage: 78,
    staffAvailability: 65,
    status: 'overwhelmed',
    description: 'New York City hospitals under severe strain from patient surge',
  },
  {
    id: 'hc-london',
    name: 'London NHS',
    lat: 51.508,
    lng: -0.090,
    bedOccupancy: 72,
    icuUtilization: 68,
    ventilatorUsage: 45,
    staffAvailability: 78,
    status: 'critical',
    description: 'London NHS trusts facing capacity pressures in winter season',
  },
  {
    id: 'hc-tokyo',
    name: 'Tokyo Metro',
    lat: 35.682,
    lng: 139.692,
    bedOccupancy: 58,
    icuUtilization: 52,
    ventilatorUsage: 30,
    staffAvailability: 85,
    status: 'stable',
    description: 'Tokyo metropolitan hospitals maintaining adequate capacity levels',
  },
  {
    id: 'hc-mumbai',
    name: 'Mumbai Health',
    lat: 19.076,
    lng: 72.878,
    bedOccupancy: 42,
    icuUtilization: 38,
    ventilatorUsage: 22,
    staffAvailability: 90,
    status: 'optimal',
    description: 'Mumbai health system operating within comfortable capacity range',
  },
]

const STATUS_COLORS: Record<HospitalCapacityData['status'], { label: string; color: string; bgClass: string }> = {
  overwhelmed: { label: 'Overwhelmed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  critical: { label: 'Critical', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: HospitalCapacityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HospitalCapacityMonitor() {
  const state = useMapStore((s) => s.hospitalCapacity)
  const setState = useMapStore((s) => s.setHospitalCapacity)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSystems: 0, avgBedOcc: 0, avgIcu: 0, avgStaff: 0 }
    }
    const avgBedOcc = filteredItems.reduce((sum, e) => sum + e.bedOccupancy, 0) / filteredItems.length
    const avgIcu = filteredItems.reduce((sum, e) => sum + e.icuUtilization, 0) / filteredItems.length
    const avgStaff = filteredItems.reduce((sum, e) => sum + e.staffAvailability, 0) / filteredItems.length
    return {
      totalSystems: filteredItems.length,
      avgBedOcc: Math.round(avgBedOcc),
      avgIcu: Math.round(avgIcu),
      avgStaff: Math.round(avgStaff),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, bedOccupancy: e.bedOccupancy },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHospitalCapacity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HospitalCapacityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showBedOccupancy', label: 'Bed Occupancy', icon: Bed },
    { key: 'showIcuUtilization', label: 'ICU Available', icon: Activity },
    { key: 'showVentilatorUsage', label: 'ER Wait hrs', icon: Building2Icon },
    { key: 'showStaffAvailability', label: 'Staff Ratio', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-emerald-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <Building2Icon className="h-4 w-4 text-emerald-400" />
              Hospital Capacity Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as HospitalCapacityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
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

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Bed Occupancy</div>
              <div className="text-sm font-semibold text-emerald-300">{summary.avgBedOcc}%</div>
              <div className="text-[9px] text-emerald-400/60">average</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">ICU Available</div>
              <div className="text-sm font-semibold text-teal-300">{100 - summary.avgIcu}%</div>
              <div className="text-[9px] text-emerald-400/60">free capacity</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">ER Wait hrs</div>
              <div className="text-sm font-semibold text-amber-400">{(summary.avgBedOcc / 20).toFixed(1)}</div>
              <div className="text-[9px] text-emerald-400/60">estimated</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Systems</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSystems}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Health Systems ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-emerald-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showBedOccupancy && (
                          <div>
                            Beds:{' '}
                            <span className="text-emerald-100 font-medium">{e.bedOccupancy}%</span>
                          </div>
                        )}
                        {state.showIcuUtilization && (
                          <div>
                            ICU Free:{' '}
                            <span className="text-emerald-100 font-medium">{100 - e.icuUtilization}%</span>
                          </div>
                        )}
                        {state.showVentilatorUsage && (
                          <div>
                            Ventilators:{' '}
                            <span className="text-emerald-100 font-medium">{e.ventilatorUsage}%</span>
                          </div>
                        )}
                        {state.showStaffAvailability && (
                          <div>
                            Staff:{' '}
                            <span className="text-emerald-100 font-medium">{e.staffAvailability}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No systems match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Bed Occupancy: </span>
                    <span className="font-medium text-emerald-300">{activeItem.bedOccupancy}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">ICU Free: </span>
                    <span className="font-medium text-teal-300">{100 - activeItem.icuUtilization}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Staff: </span>
                    <span className="font-medium text-amber-400">{activeItem.staffAvailability}%</span>
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
