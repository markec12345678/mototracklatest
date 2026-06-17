'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cg-bellagio',
    name: 'Bellagio Casino Resort',
    lat: 36.113,
    lng: -115.176,
    status: 'stable',
    value: 18400000,
    gamingTables: 230,
    slotMachines: 2400,
    dailyRevenue: 4200000,
    trend: 'up' as const,
    description: 'MGM Resorts flagship Las Vegas Strip casino with 116,000 sq ft gaming floor, famous Fountains of Bellagio and Bobby Baldwin high-limit poker room',
  },
  {
    id: 'cg-venetian-macau',
    name: 'The Venetian Macao',
    lat: 22.149,
    lng: 113.559,
    status: 'warning',
    value: 27500000,
    gamingTables: 800,
    slotMachines: 3000,
    dailyRevenue: 6800000,
    trend: 'down' as const,
    description: 'World largest casino by floor area (546,000 sq ft) on Cotai Strip; Macau VIP baccarat revenue declining amid Chinese anti-corruption campaign',
  },
  {
    id: 'cg-marina-bay',
    name: 'Marina Bay Sands Casino',
    lat: 1.283,
    lng: 103.858,
    status: 'stable',
    value: 14200000,
    gamingTables: 600,
    slotMachines: 1500,
    dailyRevenue: 3100000,
    trend: 'up' as const,
    description: 'Las Vegas Sands integrated resort with 15,000 sq m gaming floor across four levels, SkyPark infinity pool, 2,561 hotel rooms',
  },
  {
    id: 'cg-monte-carlo',
    name: 'Casino de Monte-Carlo',
    lat: 43.740,
    lng: 7.427,
    status: 'moderate',
    value: 3200000,
    gamingTables: 96,
    slotMachines: 280,
    dailyRevenue: 720000,
    trend: 'stable' as const,
    description: 'Historic 1863 Belle Epoque casino operated by Societe des Bains de Mer, Monaco royal monopoly, setting for James Bond films',
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

export function CasinoGamingFloorMonitor() {
  const state = useMapStore((s) => s.casinoGamingFloor)
  const setState = useMapStore((s) => s.setCasinoGamingFloor)

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
    if (filteredData.length === 0) return { totalRevenue: '0', totalTables: 0, totalSlots: 0 }
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    const totalTables = filteredData.reduce((s: number, d: any) => s + (d.gamingTables as number), 0)
    const totalSlots = filteredData.reduce((s: number, d: any) => s + (d.slotMachines as number), 0)
    return {
      totalRevenue: '$' + (totalRevenue / 1000000).toFixed(1) + 'M/day',
      totalTables,
      totalSlots,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-700 to-red-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127922;</span>
          <h3 className="text-sm font-semibold text-white">Casino Gaming Floor</h3>
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
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Gaming Tables</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTables}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Slot Machines</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSlots}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1863</div>
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
                <span className="text-xs text-slate-300">${(loc.dailyRevenue / 1000000).toFixed(1)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.gamingTables} tables, {activeItem.slotMachines} slots, ${activeItem.dailyRevenue.toLocaleString()} daily revenue, ${activeItem.value.toLocaleString()} annual GGR</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
