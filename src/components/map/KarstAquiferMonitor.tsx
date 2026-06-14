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
import { useMapStore, type KarstAquiferData, type KarstAquiferState } from '@/lib/map-store'
import { Droplets as DropletsIcon3, X, Layers, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_AQUIFERS: KarstAquiferData[] = [
  {
    id: 'ka-floridan',
    name: 'Floridan Aquifer',
    lat: 29.5,
    lng: -82.5,
    waterTableDepth: 15,
    conduitFlowRate: 450,
    rechargeRate: 280,
    waterQualityIndex: 78,
    saturationIndex: 0.85,
    status: 'good',
    description: 'Florida, USA - Major carbonate aquifer system',
  },
  {
    id: 'ka-yucatan',
    name: 'Yucatan Aquifer',
    lat: 20.5,
    lng: -89.0,
    waterTableDepth: 5,
    conduitFlowRate: 320,
    rechargeRate: 150,
    waterQualityIndex: 72,
    saturationIndex: 0.90,
    status: 'moderate',
    description: 'Mexico - Cenote network and coastal discharge',
  },
  {
    id: 'ka-dinaric',
    name: 'Dinaric Karst',
    lat: 44.0,
    lng: 16.5,
    waterTableDepth: 120,
    conduitFlowRate: 680,
    rechargeRate: 450,
    waterQualityIndex: 88,
    saturationIndex: 0.92,
    status: 'pristine',
    description: 'Balkans - Classical karst region',
  },
  {
    id: 'ka-buda',
    name: 'Buda Thermal Karst',
    lat: 47.5,
    lng: 19.0,
    waterTableDepth: 80,
    conduitFlowRate: 180,
    rechargeRate: 120,
    waterQualityIndex: 65,
    saturationIndex: 0.70,
    status: 'degraded',
    description: 'Hungary - Thermal karst water system',
  },
  {
    id: 'ka-schina',
    name: 'South China Karst',
    lat: 25.0,
    lng: 108.0,
    waterTableDepth: 50,
    conduitFlowRate: 550,
    rechargeRate: 380,
    waterQualityIndex: 82,
    saturationIndex: 0.88,
    status: 'good',
    description: 'Guizhou, China - Tower karst landscape',
  },
  {
    id: 'ka-nullarbor',
    name: 'Nullarbor Karst',
    lat: -31.0,
    lng: 129.0,
    waterTableDepth: 200,
    conduitFlowRate: 90,
    rechargeRate: 60,
    waterQualityIndex: 55,
    saturationIndex: 0.60,
    status: 'critical',
    description: 'Australia - Arid zone karst with saltwater intrusion',
  },
]

const STATUS_CONFIG: Record<
  KarstAquiferData['status'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function KarstAquiferMonitor() {
  const state = useMapStore((s) => s.karstAquifer)

  const aquifers = useMemo(
    () => (state.aquifers.length > 0 ? state.aquifers : DEMO_AQUIFERS),
    [state.aquifers]
  )

  const filteredAquifers = useMemo(() => {
    return aquifers.filter((a) => {
      if (state.typeFilter !== 'all') {
        const typeMap: Record<string, string[]> = {
          carbonate: ['ka-floridan', 'ka-yucatan', 'ka-dinaric', 'ka-schina', 'ka-nullarbor'],
          evaporite: ['ka-buda'],
          volcanic: [],
          silicate: [],
        }
        if (state.typeFilter in typeMap && !typeMap[state.typeFilter].includes(a.id)) return false
      }
      return true
    })
  }, [aquifers, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredAquifers.length === 0) {
      return { avgWaterQualityIndex: 0, avgConduitFlowRate: 0, degradedCriticalCount: 0 }
    }
    const avgWaterQualityIndex =
      filteredAquifers.reduce((sum, a) => sum + a.waterQualityIndex, 0) / filteredAquifers.length
    const avgConduitFlowRate =
      filteredAquifers.reduce((sum, a) => sum + a.conduitFlowRate, 0) / filteredAquifers.length
    const degradedCriticalCount = filteredAquifers.filter(
      (a) => a.status === 'degraded' || a.status === 'critical'
    ).length
    return {
      avgWaterQualityIndex: Math.round(avgWaterQualityIndex * 10) / 10,
      avgConduitFlowRate: Math.round(avgConduitFlowRate),
      degradedCriticalCount,
    }
  }, [filteredAquifers])

  const activeAquifer = useMemo(
    () => aquifers.find((a) => a.id === state.activeAquiferId) ?? null,
    [aquifers, state.activeAquiferId]
  )

  useEffect(() => {
    if (state.aquifers.length === 0) {
      useMapStore.getState().setKarstAquifer({ aquifers: DEMO_AQUIFERS })
    }
  }, [state.aquifers.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KarstAquiferState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterTable', label: 'Water Table Depth', icon: Layers },
    { key: 'showConduitFlow', label: 'Conduit Flow Rate', icon: Activity },
    { key: 'showRechargeZone', label: 'Recharge Zone', icon: DropletsIcon3 },
    { key: 'showWaterQuality', label: 'Water Quality', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-teal-950/95 to-emerald-950/95 backdrop-blur-xl border border-teal-800/50 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletsIcon3 className="h-4 w-4 text-teal-400" />
              Karst Aquifer Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-white hover:bg-teal-800/50"
              onClick={() => useMapStore.getState().setKarstAquifer({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Aquifer Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                useMapStore.getState().setKarstAquifer({
                  typeFilter: v as KarstAquiferState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/50 border-teal-700/50 text-teal-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="carbonate">Carbonate</SelectItem>
                <SelectItem value="evaporite">Evaporite</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="silicate">Silicate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-100">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => useMapStore.getState().setKarstAquifer({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-teal-700/40 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-300/70">Avg Quality Index</div>
              <div className="text-sm font-semibold text-teal-100">{summary.avgWaterQualityIndex}</div>
              <div className="text-[9px] text-teal-400/60">WQI</div>
            </div>
            <div className="rounded-lg border border-teal-700/40 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-300/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-teal-100">{summary.avgConduitFlowRate}</div>
              <div className="text-[9px] text-teal-400/60">L/s</div>
            </div>
            <div className="rounded-lg border border-teal-700/40 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-300/70">Degraded/Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.degradedCriticalCount}</div>
              <div className="text-[9px] text-teal-400/60">aquifers</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Aquifer List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Karst Aquifers ({filteredAquifers.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredAquifers.map((aquifer) => {
                  const isActive = state.activeAquiferId === aquifer.id
                  const statusCfg = STATUS_CONFIG[aquifer.status]
                  return (
                    <div
                      key={aquifer.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        useMapStore.getState().setKarstAquifer({
                          activeAquiferId: isActive ? null : aquifer.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-teal-100">{aquifer.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showWaterTable && (
                          <div>
                            Depth:{' '}
                            <span className="text-teal-100 font-medium">
                              {aquifer.waterTableDepth}m
                            </span>
                          </div>
                        )}
                        {state.showConduitFlow && (
                          <div>
                            Flow:{' '}
                            <span className="text-teal-100 font-medium">
                              {aquifer.conduitFlowRate}L/s
                            </span>
                          </div>
                        )}
                        {state.showRechargeZone && (
                          <div>
                            Recharge:{' '}
                            <span className="text-teal-100 font-medium">
                              {aquifer.rechargeRate}mm/yr
                            </span>
                          </div>
                        )}
                        {state.showWaterQuality && (
                          <div>
                            WQI:{' '}
                            <span className="text-teal-100 font-medium">
                              {aquifer.waterQualityIndex}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredAquifers.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No aquifers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Aquifer Details */}
          {activeAquifer && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeAquifer.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeAquifer.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeAquifer.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeAquifer.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeAquifer.lat.toFixed(1)}, {activeAquifer.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">WQI: </span>
                    <span className="font-medium text-teal-100">{activeAquifer.waterQualityIndex}</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Water Table: </span>
                    <span className="font-medium text-teal-100">{activeAquifer.waterTableDepth}m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Conduit Flow: </span>
                    <span className="font-medium text-teal-100">{activeAquifer.conduitFlowRate}L/s</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Recharge Rate: </span>
                    <span className="font-medium text-teal-100">{activeAquifer.rechargeRate}mm/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Saturation: </span>
                    <span className="font-medium text-teal-100">{activeAquifer.saturationIndex}</span>
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
