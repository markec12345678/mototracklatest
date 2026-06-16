'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bsi-goldengate',
    name: 'Golden Gate Bridge',
    lat: 37.82,
    lng: -122.48,
    status: 'warning',
    value: 87,
    structuralHealthIndex: 87,
    vibrationAmplitude: 4.2,
    corrosionRate: 0.08,
    sensorNodes: 312,
    trend: 'stable' as const,
    description: 'San Francisco art-deco suspension span monitored by 312 accelerometer and strain gauge nodes with retrofit work on main cable bands underway',
  },
  {
    id: 'bsi-akashi',
    name: 'Akashi Kaikyo Bridge',
    lat: 34.62,
    lng: 135.01,
    status: 'stable',
    value: 94,
    structuralHealthIndex: 94,
    vibrationAmplitude: 2.1,
    corrosionRate: 0.03,
    sensorNodes: 410,
    trend: 'down' as const,
    description: 'Worlds longest suspension bridge connecting Kobe to Awaji Island with continuous GPS displacement and wind-tunnel telemetry monitoring',
  },
  {
    id: 'bsi-jiaozhou',
    name: 'Jiaozhou Bay Bridge',
    lat: 36.13,
    lng: 120.3,
    status: 'moderate',
    value: 79,
    structuralHealthIndex: 79,
    vibrationAmplitude: 5.8,
    corrosionRate: 0.12,
    sensorNodes: 268,
    trend: 'up' as const,
    description: 'Qingdao 26.7km sea crossing structure with elevated chloride-induced corrosion detected on eastern trestle piers requiring cathodic protection',
  },
  {
    id: 'bsi-millau',
    name: 'Millau Viaduct',
    lat: 44.08,
    lng: 3.02,
    status: 'stable',
    value: 96,
    structuralHealthIndex: 96,
    vibrationAmplitude: 1.8,
    corrosionRate: 0.02,
    sensorNodes: 184,
    trend: 'stable' as const,
    description: 'French Tarn Valley cable-stayed viaduct - tallest bridge in the world - with fiber-optic strain monitoring on P2 pylons performing within design limits',
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

export function BridgeStructuralIntegrityMonitor() {
  const state = useMapStore((s) => s.bridgeStructuralIntegrity)
  const setState = useMapStore((s) => s.setBridgeStructuralIntegrity)

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
    if (filteredData.length === 0) return { structuralHealthIndex: 0, vibrationAmplitude: 0, corrosionRate: 0, sensorNodes: 0 }
    const structuralHealthIndex = filteredData.reduce((s: number, d: any) => s + (d.structuralHealthIndex as number), 0) / filteredData.length
    const vibrationAmplitude = filteredData.reduce((s: number, d: any) => s + (d.vibrationAmplitude as number), 0) / filteredData.length
    const corrosionRate = filteredData.reduce((s: number, d: any) => s + (d.corrosionRate as number), 0) / filteredData.length
    const sensorNodes = filteredData.reduce((s: number, d: any) => s + (d.sensorNodes as number), 0)
    return {
      structuralHealthIndex: structuralHealthIndex.toFixed(0) + '/100',
      vibrationAmplitude: vibrationAmplitude.toFixed(1) + ' mm',
      corrosionRate: corrosionRate.toFixed(3) + ' mm/y',
      sensorNodes: sensorNodes.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127309;</span>
          <h3 className="text-sm font-semibold text-white">Bridge Structural Integrity</h3>
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
            <div className="text-slate-400">Avg Health Index</div>
            <div className="text-sm font-semibold text-white">{metrics.structuralHealthIndex}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Vibration</div>
            <div className="text-sm font-semibold text-white">{metrics.vibrationAmplitude}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Corrosion Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.corrosionRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Sensors</div>
            <div className="text-sm font-semibold text-white">{metrics.sensorNodes}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()}/100 structural health index</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
