'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ar-bragg',
    name: 'Fort Liberty (Bragg)',
    lat: 35.13,
    lng: -79.0,
    status: 'stable',
    value: 57000,
    troopsStationed: 57000,
    combatBrigades: 8,
    equipmentReadiness: 92,
    readinessLevel: 'C1',
    trend: 'stable' as const,
    description: 'US Army XVIII Airborne Corps and 82nd Airborne Division home, rapid-deployment Global Response Force within 18 hours',
  },
  {
    id: 'ar-aldershot',
    name: 'Aldershot Garrison',
    lat: 51.25,
    lng: -0.76,
    status: 'moderate',
    value: 12000,
    troopsStationed: 12000,
    combatBrigades: 2,
    equipmentReadiness: 86,
    readinessLevel: 'C2',
    trend: 'up' as const,
    description: 'British Army Home of the Soldier hosting 16 Air Assault Brigade and 1st Division headquarters',
  },
  {
    id: 'ar-grafenwoehr',
    name: 'Grafenwoehr Training Area',
    lat: 49.71,
    lng: 11.91,
    status: 'stable',
    value: 18000,
    troopsStationed: 18000,
    combatBrigades: 3,
    equipmentReadiness: 90,
    readinessLevel: 'C1',
    trend: 'up' as const,
    description: 'US Army Europe combined arms training center supporting 7th Army Training Command and rotational NATO armored brigades',
  },
  {
    id: 'ar-townsville',
    name: 'Lavarack Barracks',
    lat: -19.27,
    lng: 146.74,
    status: 'warning',
    value: 8200,
    troopsStationed: 8200,
    combatBrigades: 2,
    equipmentReadiness: 78,
    readinessLevel: 'C3',
    trend: 'down' as const,
    description: 'Australian Army 3rd Brigade home in Townsville, equipment availability impacted by bushfire recovery and amphibious vehicle refit',
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

export function ArmyBaseReadinessMonitor() {
  const state = useMapStore((s) => s.armyBaseReadiness)
  const setState = useMapStore((s) => s.setArmyBaseReadiness)

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
    if (filteredData.length === 0) return { troopsStationed: 0, combatBrigades: 0, equipmentReadiness: 0 }
    const troopsStationed = filteredData.reduce((s: number, d: any) => s + (d.troopsStationed as number), 0)
    const combatBrigades = filteredData.reduce((s: number, d: any) => s + (d.combatBrigades as number), 0)
    const equipmentReadiness = filteredData.reduce((s: number, d: any) => s + (d.equipmentReadiness as number), 0) / filteredData.length
    return {
      troopsStationed: troopsStationed.toLocaleString(),
      combatBrigades: combatBrigades.toLocaleString(),
      equipmentReadiness: equipmentReadiness.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-700 to-emerald-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128737;</span>
          <h3 className="text-sm font-semibold text-white">Army Base Readiness</h3>
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
            <div className="text-slate-400">Troops Stationed</div>
            <div className="text-sm font-semibold text-white">{metrics.troopsStationed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Combat Brigades</div>
            <div className="text-sm font-semibold text-white">{metrics.combatBrigades}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Equip Readiness</div>
            <div className="text-sm font-semibold text-white">{metrics.equipmentReadiness}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Readiness</div>
            <div className="text-sm font-semibold text-white">C1</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(0)}k</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} troops at {activeItem.readinessLevel} readiness</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
