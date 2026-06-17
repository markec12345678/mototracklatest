'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ag-louvre',
    name: 'Louvre Museum',
    lat: 48.861,
    lng: 2.337,
    status: 'stable',
    value: 8900000,
    gallerySpaceSqm: 73000,
    artworksDisplayed: 35000,
    dailyVisitors: 24000,
    trend: 'up' as const,
    description: 'World most visited museum in former Louvre Palace since 1793, 73,000 sqm of galleries including Mona Lisa, Venus de Milo and 35,000 displayed works',
  },
  {
    id: 'ag-moma',
    name: 'Museum of Modern Art',
    lat: 40.761,
    lng: -73.978,
    status: 'stable',
    value: 2700000,
    gallerySpaceSqm: 13000,
    artworksDisplayed: 5000,
    dailyVisitors: 7400,
    trend: 'stable' as const,
    description: 'MoMA Midtown Manhattan founded 1929, 200,000 works including Van Gogh Starry Night, Picassos Les Demoiselles dAvignon, 2019 Taniguchi expansion',
  },
  {
    id: 'ag-tate',
    name: 'Tate Modern',
    lat: 51.508,
    lng: -0.100,
    status: 'stable',
    value: 5700000,
    gallerySpaceSqm: 34500,
    artworksDisplayed: 8000,
    dailyVisitors: 15600,
    trend: 'up' as const,
    description: 'Former Bankside Power Station converted 2000 by Herzog &amp; de Meuron, 60m Turbine Hall installations, UKs most popular modern art gallery',
  },
  {
    id: 'ag-prado',
    name: 'Museo del Prado',
    lat: 40.414,
    lng: -3.692,
    status: 'moderate',
    value: 3300000,
    gallerySpaceSqm: 18000,
    artworksDisplayed: 7600,
    dailyVisitors: 9000,
    trend: 'stable' as const,
    description: 'Madrid 1819 royal collection museum, Velazquez Las Meninas, Goya Black Paintings, expansion by Rafael Moneo 2007 doubled gallery space',
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

export function ArtGalleryExhibitMonitor() {
  const state = useMapStore((s) => s.artGalleryExhibit)
  const setState = useMapStore((s) => s.setArtGalleryExhibit)

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
    if (filteredData.length === 0) return { totalArtworks: 0, totalVisitors: '0', totalSpace: 0 }
    const totalArtworks = filteredData.reduce((s: number, d: any) => s + (d.artworksDisplayed as number), 0)
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalSpace = filteredData.reduce((s: number, d: any) => s + (d.gallerySpaceSqm as number), 0)
    return {
      totalArtworks,
      totalVisitors: (totalVisitors / 1000).toFixed(1) + 'k/day',
      totalSpace,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-700 to-rose-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127913;</span>
          <h3 className="text-sm font-semibold text-white">Art Gallery Exhibit</h3>
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
            <div className="text-slate-400">Artworks</div>
            <div className="text-sm font-semibold text-white">{metrics.totalArtworks.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Gallery Space</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpace.toLocaleString()} sqm</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1793</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(1)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.gallerySpaceSqm.toLocaleString()} sqm, {activeItem.artworksDisplayed.toLocaleString()} artworks, {activeItem.dailyVisitors.toLocaleString()} daily visitors, {activeItem.value.toLocaleString()} annual attendance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
