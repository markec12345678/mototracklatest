'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ac-paintnite-brooklyn',
    name: 'Paint Nite - Brooklyn NY',
    lat: 40.6782,
    lng: -73.9442,
    status: 'stable',
    value: 84,
    weeklyArtists: 180,
    monthlyRevenue: 0.55,
    easelsAvailable: 14,
    classTypes: 'Sip & Paint, Acrylic, Private Parties',
    trend: 'up' as const,
    description: 'Paint Nite Brooklyn NY studio in Williamsburg, 180 weekly artists with 14 easels; social painting events hosted in partnering bars and cafes across the borough',
  },
  {
    id: 'ac-pwpatl-atlanta',
    name: 'Painting with a Twist - Atlanta GA',
    lat: 33.749,
    lng: -84.388,
    status: 'stable',
    value: 79,
    weeklyArtists: 140,
    monthlyRevenue: 0.45,
    easelsAvailable: 12,
    classTypes: 'Group Painting, BYOB, Kids Parties',
    trend: 'stable' as const,
    description: 'Painting with a Twist Atlanta GA studio in Buckhead, 140 weekly artists with 12 easels; franchise-led BYOB group painting sessions and private event bookings',
  },
  {
    id: 'ac-micheles-phoenix',
    name: 'Michele\'s Studio - Phoenix AZ',
    lat: 33.4484,
    lng: -112.074,
    status: 'warning',
    value: 57,
    weeklyArtists: 90,
    monthlyRevenue: 0.3,
    easelsAvailable: 8,
    classTypes: 'Watercolor, Oil, Figure Drawing',
    trend: 'down' as const,
    description: 'Michele\'s Studio Phoenix AZ independent atelier in Roosevelt Row, 90 weekly artists with 8 easels; instructor-led watercolor and oil painting classes facing enrollment pressure',
  },
  {
    id: 'ac-creative-seattle',
    name: 'Creative Arts Studio - Seattle WA',
    lat: 47.6101,
    lng: -122.3344,
    status: 'stable',
    value: 82,
    weeklyArtists: 130,
    monthlyRevenue: 0.3,
    easelsAvailable: 14,
    classTypes: 'Pottery, Painting, Mixed Media',
    trend: 'up' as const,
    description: 'Creative Arts Studio Seattle WA community studio in Capitol Hill, 130 weekly artists with 14 easels; multi-disciplinary art classes spanning pottery, painting, and mixed media',
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

export function ArtClassStudioMonitor() {
  const state = useMapStore((s) => s.artClassStudio)
  const setState = useMapStore((s) => s.setArtClassStudio)

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
    if (filteredData.length === 0) return { totalArtists: 0, totalRevenue: 0, totalEasels: 0 }
    const totalArtists = filteredData.reduce((s: number, d: any) => s + (d.weeklyArtists as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalEasels = filteredData.reduce((s: number, d: any) => s + (d.easelsAvailable as number), 0)
    return { totalArtists, totalRevenue, totalEasels }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-500 to-rose-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127912;</span>
          <h3 className="text-sm font-semibold text-white">Art Class Studio</h3>
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
            <div className="text-slate-400">Weekly Artists</div>
            <div className="text-sm font-semibold text-white">{metrics.totalArtists.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Easels Avail</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEasels}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Studios</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.classTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.easelsAvailable} easels</span>
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
              {activeItem.weeklyArtists.toLocaleString()} weekly artists &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.easelsAvailable} easels available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
