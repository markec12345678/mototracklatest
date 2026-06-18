'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hw-cleanharbors',
    name: 'Clean Harbors Norwell MA HQ',
    lat: 42.152,
    lng: -70.847,
    status: 'stable',
    value: 91,
    tonsPerMonth: 2400,
    manifestsMonthly: 580,
    facilityType: 'TSDF Incinerator',
    complianceScore: 98,
    trend: 'up' as const,
    description: 'Clean Harbors Norwell MA corporate HQ + incineration, 2,400 t/month across 580 manifests with 98% compliance score on RCRA audits',
  },
  {
    id: 'hw-veolia',
    name: 'Veolia North America Boston MA',
    lat: 42.360,
    lng: -71.059,
    status: 'stable',
    value: 87,
    tonsPerMonth: 1800,
    manifestsMonthly: 410,
    facilityType: 'Fuel Blending',
    complianceScore: 96,
    trend: 'stable' as const,
    description: 'Veolia North America Boston MA fuel-blending facility, 1,800 t/month processing hazardous solvents into secondary fuel with 96% compliance',
  },
  {
    id: 'hw-usecology',
    name: 'US Ecology Wayne MI',
    lat: 42.288,
    lng: -83.383,
    status: 'moderate',
    value: 74,
    tonsPerMonth: 1500,
    manifestsMonthly: 340,
    facilityType: 'Stabilization & Landfill',
    complianceScore: 89,
    trend: 'stable' as const,
    description: 'US Ecology Wayne MI stabilization and hazardous landfill, 1,500 t/month with 89% compliance — recent minor violations corrected',
  },
  {
    id: 'hw-heritage',
    name: 'Heritage Environmental Indianapolis IN',
    lat: 39.768,
    lng: -86.158,
    status: 'warning',
    value: 62,
    tonsPerMonth: 1200,
    manifestsMonthly: 285,
    facilityType: 'Treatment & Storage',
    complianceScore: 81,
    trend: 'down' as const,
    description: 'Heritage Environmental Indianapolis IN treatment facility, 1,200 t/month with 81% compliance — under EPA review for manifest discrepancies',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function HazardousWasteDisposalMonitor() {
  const state = useMapStore((s) => s.hazardousWasteDisposal)
  const setState = useMapStore((s) => s.setHazardousWasteDisposal)

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
    if (filteredData.length === 0) return { totalTons: 0, totalManifests: 0, avgCompliance: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerMonth as number), 0)
    const totalManifests = filteredData.reduce((s: number, d: any) => s + (d.manifestsMonthly as number), 0)
    const avgCompliance = Math.round(filteredData.reduce((s: number, d: any) => s + (d.complianceScore as number), 0) / filteredData.length)
    return { totalTons, totalManifests, avgCompliance }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9763;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Hazardous Waste Disposal</h3>
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
            <div className="text-slate-400">Tons / Month</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Manifests</div>
            <div className="text-sm font-semibold text-white">{metrics.totalManifests}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Compliance</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCompliance}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Facilities</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.facilityType}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.complianceScore}%</span>
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
              {activeItem.tonsPerMonth.toLocaleString()} t/month &middot; {activeItem.manifestsMonthly} manifests/mo &middot; {activeItem.facilityType}
              &nbsp;&middot;&nbsp; {activeItem.complianceScore}% RCRA compliance
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
