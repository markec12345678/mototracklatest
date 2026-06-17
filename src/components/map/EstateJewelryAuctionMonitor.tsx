'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ej-christies',
    name: "Christie's New York Rockefeller Plaza",
    lat: 40.759,
    lng: -73.978,
    status: 'stable',
    value: 92,
    annualSales: 580000000,
    majorAuctions: 6,
    avgLotPrice: 180000,
    specialty: 'Magnificent Jewels, Important Watches',
    trend: 'up' as const,
    description: "Christie's NY Rockefeller Plaza flagship auction house, $580M annual jewelry sales with Magnificent Jewels sales in April and December",
  },
  {
    id: 'ej-sothebys',
    name: "Sotheby's York Avenue NYC",
    lat: 40.765,
    lng: -73.963,
    status: 'stable',
    value: 90,
    annualSales: 620000000,
    majorAuctions: 8,
    avgLotPrice: 195000,
    specialty: 'Magnificent Jewels, Fine Watches',
    trend: 'up' as const,
    description: "Sotheby's York Avenue headquarters with $620M annual jewelry sales, record-breaking diamond and important watch auctions",
  },
  {
    id: 'ej-bonhams',
    name: "Bonhams New York Madison Avenue",
    lat: 40.762,
    lng: -73.974,
    status: 'moderate',
    value: 74,
    annualSales: 85000000,
    majorAuctions: 4,
    avgLotPrice: 65000,
    specialty: 'Fine Jewelry, Watches & Wristwatches',
    trend: 'stable' as const,
    description: "Bonhams New York Madison Avenue with $85M annual jewelry sales and curated Fine Jewelry and Watches & Wristwatches auctions",
  },
  {
    id: 'ej-heritage',
    name: 'Heritage Auctions Beverly Hills',
    lat: 34.067,
    lng: -118.401,
    status: 'warning',
    value: 60,
    annualSales: 62000000,
    majorAuctions: 4,
    avgLotPrice: 42000,
    specialty: 'Fine Jewelry, Timepieces',
    trend: 'down' as const,
    description: 'Heritage Auctions Beverly Hills facing softer demand, $62M annual jewelry sales with weekly internet-only watches and jewelry auctions',
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

export function EstateJewelryAuctionMonitor() {
  const state = useMapStore((s) => s.estateJewelryAuction)
  const setState = useMapStore((s) => s.setEstateJewelryAuction)

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
    if (filteredData.length === 0) return { totalSales: 0, totalAuctions: 0, avgLot: 0 }
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.annualSales as number), 0)
    const totalAuctions = filteredData.reduce((s: number, d: any) => s + (d.majorAuctions as number), 0)
    const avgLot = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgLotPrice as number), 0) / filteredData.length)
    return { totalSales, totalAuctions, avgLot }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-600 to-amber-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128081;</span>
          <h3 className="text-sm font-semibold text-white">Estate Jewelry Auction</h3>
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
            <div className="text-slate-400">Annual Sales</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalSales / 1000000).toFixed(0)}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Major Auctions</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAuctions}/yr</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Lot Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgLot / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Houses</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.specialty}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.annualSales / 1000000).toFixed(0)}M</span>
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
              ${(activeItem.annualSales / 1000000).toFixed(0)}M annual &middot; {activeItem.majorAuctions} major auctions
              &nbsp;&middot;&nbsp; ${activeItem.avgLotPrice.toLocaleString()} avg lot
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
