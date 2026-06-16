'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sby-alang',
    name: 'Alang India',
    lat: 21.40,
    lng: 72.16,
    status: 'warning',
    value: 120,
    vesselsBeaching: 120,
    workersActive: 8500,
    steelRecoveryT: 95000,
    hazmatCompliancePct: 68,
    trend: 'up' as const,
    description: 'World largest shipbreaking yard handling growing volume with ongoing environmental compliance upgrades and worker safety training programs',
  },
  {
    id: 'sby-chittagong',
    name: 'Chittagong BD',
    lat: 22.32,
    lng: 91.82,
    status: 'critical',
    value: 85,
    vesselsBeaching: 85,
    workersActive: 6200,
    steelRecoveryT: 72000,
    hazmatCompliancePct: 42,
    trend: 'up' as const,
    description: 'Bangladesh shipbreaking industry under scrutiny for hazardous material handling with EU Ship Recycling Regulation driving compliance improvements',
  },
  {
    id: 'sby-gadani',
    name: 'Gadani Pakistan',
    lat: 25.13,
    lng: 66.71,
    status: 'moderate',
    value: 45,
    vesselsBeaching: 45,
    workersActive: 3100,
    steelRecoveryT: 38000,
    hazmatCompliancePct: 55,
    trend: 'stable' as const,
    description: 'Pakistani yard modernizing operations with cutting torch safety improvements and environmental management plan implementation',
  },
  {
    id: 'sby-turkey',
    name: 'Aliaga Turkey',
    lat: 38.46,
    lng: 26.97,
    status: 'stable',
    value: 34,
    vesselsBeaching: 34,
    workersActive: 2200,
    steelRecoveryT: 28000,
    hazmatCompliancePct: 91,
    trend: 'up' as const,
    description: 'EU-approved ship recycling facility operating under strict environmental standards with dry-dock method and full hazmat inventory processing',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-amber-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function ShipbreakingYardMonitor() {
  const state = useMapStore((s) => s.shipbreakingYard)
  const setState = useMapStore((s) => s.setShipbreakingYard)

  useEffect(() => {
    if (state.data.length === 0) {
      setState({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length, setState])

  const filteredData = useMemo(() => {
    if (state.statusFilter === 'all') return state.data
    return state.data.filter((item: any) => item.status === state.statusFilter)
  }, [state.data, state.statusFilter])

  const metrics = useMemo(() => {
    if (filteredData.length === 0) return { vesselsBeaching: 0, workersActive: 0, steelRecoveryT: 0, hazmatCompliancePct: 0 }
    const vesselsBeaching = filteredData.reduce((s: number, d: any) => s + (d.vesselsBeaching as number), 0)
    const workersActive = filteredData.reduce((s: number, d: any) => s + (d.workersActive as number), 0)
    const steelRecoveryT = filteredData.reduce((s: number, d: any) => s + (d.steelRecoveryT as number), 0)
    const hazmatCompliancePct = filteredData.reduce((s: number, d: any) => s + (d.hazmatCompliancePct as number), 0) / filteredData.length
    return {
      vesselsBeaching: vesselsBeaching.toLocaleString(),
      workersActive: workersActive.toLocaleString(),
      steelRecoveryT: steelRecoveryT.toLocaleString() + ' t',
      hazmatCompliancePct: hazmatCompliancePct.toFixed(0) + '%',
    }
  }, [filteredData])

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filteredData.map((loc: any) => ({
        type: 'Feature' as const,
        properties: { name: loc.name, status: loc.status, value: loc.value },
        geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      })),
    }),
    [filteredData]
  )

  void geojson

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9881;</span>
          <h3 className="text-sm font-semibold text-white">Shipbreaking Yard</h3>
        </div>
        <button onClick={() => setState({ open: false })} className="text-white/80 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <Select value={state.statusFilter} onValueChange={(v) => setState({ statusFilter: v })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 text-xs h-8">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Vessels Beaching</div>
            <div className="text-sm font-semibold text-white">{metrics.vesselsBeaching}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Workers Active</div>
            <div className="text-sm font-semibold text-white">{metrics.workersActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Steel Recovery</div>
            <div className="text-sm font-semibold text-white">{metrics.steelRecoveryT}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Hazmat Compliance</div>
            <div className="text-sm font-semibold text-white">{metrics.hazmatCompliancePct}</div>
          </div>
        </div>

        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {filteredData.map((loc: any) => (
            <div
              key={loc.id}
              onClick={() => setState({ activeItemId: loc.id })}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                state.activeItemId === loc.id ? 'bg-slate-700' : 'bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${STATUS_COLORS[loc.status]}`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{loc.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.value} vessels</span>
                <TrendIcon trend={loc.trend} />
              </div>
            </div>
          ))}
        </div>

        {activeItem && (
          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-semibold text-white">{activeItem.name}</div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${STATUS_COLORS[activeItem.status]} text-white`}
              >
                {activeItem.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{activeItem.description}</div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Primary metric:{' '}
              <span className="text-slate-300 font-medium">{activeItem.value} vessels currently being recycled</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
