'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon6, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'dam-haiti',
    name: 'Haiti Quake 2021',
    lat: 18.350,
    lng: -74.300,
    buildingsDamaged: 137000,
    areaKm2: 2800,
    severity: 7.2,
    assessmentPct: 78,
    status: 'critical',
    description: 'M7.2 earthquake devastated southern peninsula with widespread structural collapse',
  },
  {
    id: 'dam-nepal',
    name: 'Nepal Quake 2015',
    lat: 27.700,
    lng: 85.300,
    buildingsDamaged: 802000,
    areaKm2: 16500,
    severity: 7.8,
    assessmentPct: 92,
    status: 'warning',
    description: 'Gorkha earthquake caused extensive damage across Kathmandu Valley and mountain villages',
  },
  {
    id: 'dam-japan',
    name: 'Japan Tsunami 2011',
    lat: 38.300,
    lng: 142.400,
    buildingsDamaged: 452000,
    areaKm2: 5600,
    severity: 9.0,
    assessmentPct: 95,
    status: 'moderate',
    description: 'Tohoku megaquake and tsunami damage assessment with comprehensive coverage achieved',
  },
  {
    id: 'dam-indonesia',
    name: 'Indonesia Tsunami',
    lat: 0.800,
    lng: 100.300,
    buildingsDamaged: 96000,
    areaKm2: 1900,
    severity: 7.7,
    assessmentPct: 85,
    status: 'stable',
    description: 'Mentawai tsunami damage zone with active field surveys and recovery planning underway',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DamageAssessmentMonitor() {
  const state = useMapStore((s) => s.damageAssessment)
  const setState = useMapStore((s) => s.setDamageAssessment)

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
      return { totalZones: 0, avgBuildings: 0, avgArea: 0, avgAssessment: 0 }
    }
    const avgBuildings = filteredItems.reduce((sum, e) => sum + (e.buildingsDamaged as number), 0) / filteredItems.length
    const avgArea = filteredItems.reduce((sum, e) => sum + (e.areaKm2 as number), 0) / filteredItems.length
    const avgAssessment = filteredItems.reduce((sum, e) => sum + (e.assessmentPct as number), 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgBuildings: Math.round(avgBuildings),
      avgArea: Math.round(avgArea),
      avgAssessment: Math.round(avgAssessment),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setDamageAssessment({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-600/95 to-red-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <AlertTriangleIcon6 className="h-4 w-4 text-rose-200" />
              Damage Assessment Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <select
              className="mt-1 w-full h-8 text-xs bg-slate-900/40 border border-slate-700/40 rounded-md px-2 text-slate-100"
              value={state.statusFilter || 'all'}
              onChange={(e) => setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="moderate">Moderate</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-rose-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">assessed</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Buildings</div>
              <div className="text-sm font-semibold text-red-200">{summary.avgBuildings.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400/60">avg damaged</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Area</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgArea} km2</div>
              <div className="text-[9px] text-slate-400/60">avg affected</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Assessment</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgAssessment}%</div>
              <div className="text-[9px] text-slate-400/60">avg complete</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Assessment Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status as string] ?? STATUS_COLORS.stable
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status as string} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        <div>
                          Buildings: <span className="text-slate-100 font-medium">{(e.buildingsDamaged as number).toLocaleString()}</span>
                        </div>
                        <div>
                          Area: <span className="text-slate-100 font-medium">{e.areaKm2 as number} km2</span>
                        </div>
                        <div>
                          Severity: <span className="text-slate-100 font-medium">{e.severity as number} Mw</span>
                        </div>
                        <div>
                          Assessed: <span className="text-slate-100 font-medium">{e.assessmentPct as number}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status as string]?.bgClass ?? STATUS_COLORS.stable.bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status as string]?.label ?? 'Stable'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description as string}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {(activeItem.lat as number).toFixed(2)}, {(activeItem.lng as number).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Severity: </span>
                    <span className="font-medium text-rose-200">{activeItem.severity as number} Mw</span>
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
