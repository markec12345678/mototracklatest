'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'em-everyoung',
    name: 'Everyoung Med Spa Atlanta',
    lat: 33.84,
    lng: -84.353,
    status: 'stable',
    value: 91,
    treatmentsPerDay: 38,
    botoxUnitsDay: 420,
    avgTreatmentPrice: 485,
    trend: 'up' as const,
    description: 'Everyoung Med Spa Atlanta flagship offering Botox, fillers, laser treatments and IV therapy with 38 treatments daily',
  },
  {
    id: 'em-skinlaundry',
    name: 'Skin Laundry NYC Flatiron',
    lat: 40.742,
    lng: -73.987,
    status: 'stable',
    value: 87,
    treatmentsPerDay: 52,
    botoxUnitsDay: 180,
    avgTreatmentPrice: 245,
    trend: 'stable' as const,
    description: 'Skin Laundry Flatiron specializing in 15-min laser facials with 52 daily treatments and signature low-downtime protocol',
  },
  {
    id: 'em-alchemy',
    name: 'Alchemy 43 Los Angeles',
    lat: 34.084,
    lng: -118.351,
    status: 'moderate',
    value: 78,
    treatmentsPerDay: 32,
    botoxUnitsDay: 285,
    avgTreatmentPrice: 420,
    trend: 'up' as const,
    description: 'LA Alchemy 43 injectables bar focusing on Botox and dermal fillers with 32 daily treatments and wine-on-tap ambiance',
  },
  {
    id: 'em-european',
    name: 'European Wax Center Miami',
    lat: 25.781,
    lng: -80.134,
    status: 'warning',
    value: 64,
    treatmentsPerDay: 28,
    botoxUnitsDay: 0,
    avgTreatmentPrice: 165,
    trend: 'down' as const,
    description: 'Miami Beach European Wax Center with reduced seasonal traffic and 28 daily waxing services, no injectables on menu',
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

export function EstheticianMedSpaMonitor() {
  const state = useMapStore((s) => s.estheticianMedSpa)
  const setState = useMapStore((s) => s.setEstheticianMedSpa)

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
    if (filteredData.length === 0) return { totalTreatments: 0, totalBotox: 0, avgPrice: '$0', totalRevenue: '$0' }
    const totalTreatments = filteredData.reduce((s: number, d: any) => s + (d.treatmentsPerDay as number), 0)
    const totalBotox = filteredData.reduce((s: number, d: any) => s + (d.botoxUnitsDay as number), 0)
    const avgPrice = filteredData.reduce((s: number, d: any) => s + (d.avgTreatmentPrice as number), 0) / filteredData.length
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.treatmentsPerDay as number) * (d.avgTreatmentPrice as number), 0)
    return {
      totalTreatments,
      totalBotox,
      avgPrice: '$' + avgPrice.toFixed(0),
      totalRevenue: '$' + (totalRevenue / 1000).toFixed(1) + 'K',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-700 to-pink-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128150;</span>
          <h3 className="text-sm font-semibold text-white">Esthetician Med Spa</h3>
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
            <div className="text-slate-400">Treatments / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTreatments}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Botox Units</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBotox}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Treatment</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPrice}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
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
                <span className="text-xs text-slate-300">${loc.avgTreatmentPrice}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.treatmentsPerDay} treatments/day, {activeItem.botoxUnitsDay} Botox units, ${activeItem.avgTreatmentPrice} avg</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
