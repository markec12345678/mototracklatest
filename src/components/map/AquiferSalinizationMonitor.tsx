'use client'

import { useMemo } from 'react'
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
import { useMapStore, type AquiferSalinizationState, type AquiferSalinizationData } from '@/lib/map-store'
import { Droplet as DropletIcon3, X, Waves, FlaskConical, ArrowDown, ShieldAlert, MapPin, Filter } from 'lucide-react'

interface DemoAquifer extends AquiferSalinizationData {
  severityLevel: 'fresh' | 'slight' | 'moderate' | 'severe' | 'hypersaline'
}

const DEMO_AQUIFERS: DemoAquifer[] = [
  {
    id: 'as-gaza',
    name: 'Gaza Coastal Aquifer',
    lat: 31.4,
    lng: 34.3,
    salinity: 2500,
    chloride: 1200,
    waterLevel: -12,
    intrusion: 85,
    depth: 50,
    status: 'hypersaline',
    description: 'Severely overexploited aquifer with seawater intrusion',
    severityLevel: 'hypersaline',
  },
  {
    id: 'as-bengal',
    name: 'Bengal Delta',
    lat: 22,
    lng: 89,
    salinity: 800,
    chloride: 350,
    waterLevel: -3,
    intrusion: 55,
    depth: 80,
    status: 'severe',
    description: 'Coastal salinization from cyclone-driven seawater intrusion',
    severityLevel: 'severe',
  },
  {
    id: 'as-floridan',
    name: 'Floridan Aquifer',
    lat: 28,
    lng: -82,
    salinity: 150,
    chloride: 50,
    waterLevel: 5,
    intrusion: 15,
    depth: 200,
    status: 'slight',
    description: 'Minor saltwater intrusion in coastal pumping areas',
    severityLevel: 'slight',
  },
  {
    id: 'as-nile',
    name: 'Nile Delta Aquifer',
    lat: 31,
    lng: 31,
    salinity: 600,
    chloride: 250,
    waterLevel: -5,
    intrusion: 45,
    depth: 100,
    status: 'moderate',
    description: 'Progressive salinization from reduced Nile flow and seawater',
    severityLevel: 'moderate',
  },
  {
    id: 'as-perth',
    name: 'Perth Basin',
    lat: -32,
    lng: 116,
    salinity: 350,
    chloride: 120,
    waterLevel: -2,
    intrusion: 25,
    depth: 150,
    status: 'moderate',
    description: 'Declining water levels leading to seawater encroachment',
    severityLevel: 'moderate',
  },
  {
    id: 'as-dutch',
    name: 'Dutch Coastal',
    lat: 52,
    lng: 4.5,
    salinity: 80,
    chloride: 25,
    waterLevel: 2,
    intrusion: 8,
    depth: 120,
    status: 'fresh',
    description: 'Well-managed aquifer with active salinization control',
    severityLevel: 'fresh',
  },
]

const STATUS_CONFIG: Record<
  AquiferSalinizationData['status'],
  { label: string; color: string; bgClass: string }
> = {
  fresh: { label: 'Fresh', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  slight: { label: 'Slight', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  hypersaline: { label: 'Hypersaline', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SEVERITY_LABELS: Record<DemoAquifer['severityLevel'], string> = {
  fresh: 'Fresh',
  slight: 'Slight',
  moderate: 'Moderate',
  severe: 'Severe',
  hypersaline: 'Hypersaline',
}

export function AquiferSalinizationMonitor() {
  const state = useMapStore((s) => s.aquiferSalinization)
  const setState = useMapStore((s) => s.setAquiferSalinization)

  const aquifers = useMemo(
    () => (state.aquifers.length > 0 ? (state.aquifers as DemoAquifer[]) : DEMO_AQUIFERS),
    [state.aquifers]
  )

  const filteredAquifers = useMemo(() => {
    return aquifers.filter((a) => {
      if (state.severityFilter !== 'all' && a.status !== state.severityFilter) return false
      return true
    })
  }, [aquifers, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredAquifers.length === 0) {
      return { avgSalinity: 0, avgIntrusion: 0, criticalCount: 0 }
    }
    const avgSalinity =
      filteredAquifers.reduce((sum, a) => sum + a.salinity, 0) / filteredAquifers.length
    const avgIntrusion =
      filteredAquifers.reduce((sum, a) => sum + a.intrusion, 0) / filteredAquifers.length
    const criticalCount = filteredAquifers.filter(
      (a) => a.status === 'severe' || a.status === 'hypersaline'
    ).length
    return {
      avgSalinity: Math.round(avgSalinity),
      avgIntrusion: Math.round(avgIntrusion),
      criticalCount,
    }
  }, [filteredAquifers])

  const activeAquifer = useMemo(
    () => aquifers.find((a) => a.id === state.activeAquiferId) ?? null,
    [aquifers, state.activeAquiferId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AquiferSalinizationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSalinity', label: 'Salinity', icon: Waves },
    { key: 'showChloride', label: 'Chloride', icon: FlaskConical },
    { key: 'showWaterLevel', label: 'Water Level', icon: ArrowDown },
    { key: 'showIntrusion', label: 'Intrusion', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-stone-950/80 backdrop-blur-xl border border-stone-700/40 rounded-xl shadow-lg shadow-stone-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <DropletIcon3 className="h-4 w-4 text-stone-400" />
              Aquifer Salinization Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-stone-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as AquiferSalinizationState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="slight">Slight</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="hypersaline">Hypersaline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Salinity</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSalinity}</div>
              <div className="text-[9px] text-stone-400">mg/L</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Intrusion</div>
              <div className="text-sm font-semibold text-stone-300">{summary.avgIntrusion}</div>
              <div className="text-[9px] text-stone-400">%</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Severe+</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-stone-400">aquifers</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Aquifer List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300">
              Aquifers ({filteredAquifers.length})
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
                          ? 'border-stone-500/60 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-600/40 hover:bg-stone-900/20'
                      }`}
                      onClick={() =>
                        setState({
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
                          <span className="text-xs font-medium text-stone-100">{aquifer.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300">
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-stone-100 font-medium">
                              {aquifer.salinity} mg/L
                            </span>
                          </div>
                        )}
                        {state.showChloride && (
                          <div>
                            Chloride:{' '}
                            <span className="text-stone-100 font-medium">
                              {aquifer.chloride} mg/L
                            </span>
                          </div>
                        )}
                        {state.showWaterLevel && (
                          <div>
                            Water Level:{' '}
                            <span className="text-stone-100 font-medium">
                              {aquifer.waterLevel} m
                            </span>
                          </div>
                        )}
                        {state.showIntrusion && (
                          <div>
                            Intrusion:{' '}
                            <span className="text-stone-100 font-medium">
                              {aquifer.intrusion}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredAquifers.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-4">
                    No aquifers match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Aquifer Details */}
          {activeAquifer && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeAquifer.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeAquifer.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeAquifer.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeAquifer.lat.toFixed(1)}, {activeAquifer.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400">Salinity: </span>
                    <span className="font-medium text-amber-400">{activeAquifer.salinity} mg/L</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Chloride: </span>
                    <span className="font-medium text-stone-200">{activeAquifer.chloride} mg/L</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Water Level: </span>
                    <span className="font-medium text-stone-200">{activeAquifer.waterLevel} m</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Intrusion: </span>
                    <span className="font-medium text-stone-200">{activeAquifer.intrusion}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400">Depth: </span>
                    <span className="font-medium text-stone-200">{activeAquifer.depth} m</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Severity: </span>
                    <span className="font-medium text-stone-200">
                      {(activeAquifer as DemoAquifer).severityLevel ? SEVERITY_LABELS[(activeAquifer as DemoAquifer).severityLevel] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400">Description: </span>
                    <span className="font-medium text-stone-200">{activeAquifer.description}</span>
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
