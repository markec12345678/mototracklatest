'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type SpaceRadiationDoseState, type SpaceRadiationDoseData } from '@/lib/map-store'
import { Siren as SirenIcon3, X, Zap, Shield, ShieldCheck, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SpaceRadiationDoseData[] = [
  {
    id: 'srd-iss',
    name: 'ISS Orbit',
    lat: 0,
    lng: 0,
    doseRate: 0.5,
    particleEnergy: 100,
    shieldingEffectiveness: 90,
    status: 'moderate',
    description: 'Moderate radiation dose on ISS with good shielding',
  },
  {
    id: 'srd-geo',
    name: 'GEO Satellite',
    lat: 0,
    lng: 90,
    doseRate: 2.5,
    particleEnergy: 500,
    shieldingEffectiveness: 60,
    status: 'elevated',
    description: 'Elevated radiation at geostationary orbit',
  },
  {
    id: 'srd-lunar',
    name: 'Lunar Surface',
    lat: 0,
    lng: 180,
    doseRate: 8.0,
    particleEnergy: 1000,
    shieldingEffectiveness: 0,
    status: 'dangerous',
    description: 'Dangerous radiation on the lunar surface with no shielding',
  },
  {
    id: 'srd-mars',
    name: 'Mars Transit',
    lat: 0,
    lng: -90,
    doseRate: 1.2,
    particleEnergy: 300,
    shieldingEffectiveness: 40,
    status: 'safe',
    description: 'Acceptable radiation levels during Mars transit',
  },
]

const STATUS_COLORS: Record<SpaceRadiationDoseData['status'], { label: string; color: string; bgClass: string }> = {
  dangerous: { label: 'Dangerous', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  safe: { label: 'Safe', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SpaceRadiationDoseData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SpaceRadiationDoseMonitor() {
  const state = useMapStore((s) => s.spaceRadiationDose)
  const setState = useMapStore((s) => s.setSpaceRadiationDose)

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
      return { totalZones: 0, avgDose: 0, avgEnergy: 0, avgShield: 0 }
    }
    const avgDose = (filteredItems.reduce((sum, e) => sum + e.doseRate, 0) / filteredItems.length).toFixed(1)
    const avgEnergy = Math.round(filteredItems.reduce((sum, e) => sum + e.particleEnergy, 0) / filteredItems.length)
    const avgShield = Math.round(filteredItems.reduce((sum, e) => sum + e.shieldingEffectiveness, 0) / filteredItems.length)
    return { totalZones: filteredItems.length, avgDose, avgEnergy, avgShield }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, doseRate: e.doseRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSpaceRadiationDose({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SpaceRadiationDoseState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDoseRate', label: 'Dose Rate', icon: Zap },
    { key: 'showParticleEnergy', label: 'Particle Energy', icon: Shield },
    { key: 'showShieldingEffectiveness', label: 'Shielding Effectiveness', icon: ShieldCheck },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SirenIcon3 className="h-4 w-4 text-red-400" />
              Space Radiation Dose Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SpaceRadiationDoseState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dangerous">Dangerous</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Dose</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgDose}</div>
              <div className="text-[9px] text-slate-400/60">mSv/hr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Energy</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgEnergy}</div>
              <div className="text-[9px] text-slate-400/60">MeV</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Shield</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgShield}%</div>
              <div className="text-[9px] text-slate-400/60">effective</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Radiation Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
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
                          <TrendIcon status={e.status} />
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
                        {state.showDoseRate && (
                          <div>
                            Dose:{' '}
                            <span className="text-slate-100 font-medium">{e.doseRate} mSv/hr</span>
                          </div>
                        )}
                        {state.showParticleEnergy && (
                          <div>
                            Energy:{' '}
                            <span className="text-slate-100 font-medium">{e.particleEnergy} MeV</span>
                          </div>
                        )}
                        {state.showShieldingEffectiveness && (
                          <div>
                            Shield:{' '}
                            <span className="text-slate-100 font-medium">{e.shieldingEffectiveness}%</span>
                          </div>
                        )}
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

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Dose Rate: </span>
                    <span className="font-medium text-red-400">{activeItem.doseRate} mSv/hr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Energy: </span>
                    <span className="font-medium text-rose-400">{activeItem.particleEnergy} MeV</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Shield: </span>
                    <span className="font-medium text-slate-200">{activeItem.shieldingEffectiveness}%</span>
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
