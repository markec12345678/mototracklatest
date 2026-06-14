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
import { useMapStore, type EstuaryHealthState, type EstuaryHealthData } from '@/lib/map-store'
import { Waves as WavesIcon7, X, Droplets, Bug, Mountain, Wheat, MapPin, Filter } from 'lucide-react'

interface DemoEstuary extends EstuaryHealthData {
  estuaryType: 'drowned_valley' | 'bar_built' | 'tectonic' | 'fjord'
}

const DEMO_ESTUARIES: DemoEstuary[] = [
  {
    id: 'ehm-chesapeake',
    name: 'Chesapeake Bay',
    lat: 37.5,
    lng: -76.3,
    waterQuality: 62,
    biodiversity: 55,
    sediment: 45,
    nutrientLoad: 70,
    tidalRange: 1.2,
    status: 'degraded',
    description: 'Large drowned river valley estuary facing nutrient pollution and hypoxia',
    estuaryType: 'drowned_valley',
  },
  {
    id: 'ehm-thames',
    name: 'Thames Estuary',
    lat: 51.5,
    lng: 0.3,
    waterQuality: 72,
    biodiversity: 48,
    sediment: 35,
    nutrientLoad: 55,
    tidalRange: 6.0,
    status: 'moderate',
    description: 'Major bar-built estuary with recovering ecosystems after decades of cleanup',
    estuaryType: 'bar_built',
  },
  {
    id: 'ehm-ganges',
    name: 'Ganges Delta',
    lat: 22.0,
    lng: 89.0,
    waterQuality: 35,
    biodiversity: 40,
    sediment: 80,
    nutrientLoad: 85,
    tidalRange: 4.5,
    status: 'critical',
    description: 'Tectonic delta estuary under severe stress from pollution and overpopulation',
    estuaryType: 'tectonic',
  },
  {
    id: 'ehm-amazon',
    name: 'Amazon Estuary',
    lat: -0.5,
    lng: -49.0,
    waterQuality: 85,
    biodiversity: 92,
    sediment: 60,
    nutrientLoad: 25,
    tidalRange: 3.5,
    status: 'pristine',
    description: 'Vast drowned valley estuary with exceptional biodiversity and water quality',
    estuaryType: 'drowned_valley',
  },
  {
    id: 'ehm-sfbay',
    name: 'San Francisco Bay',
    lat: 37.8,
    lng: -122.4,
    waterQuality: 68,
    biodiversity: 58,
    sediment: 40,
    nutrientLoad: 50,
    tidalRange: 2.0,
    status: 'moderate',
    description: 'Tectonic estuary with mixed health indicators and ongoing restoration efforts',
    estuaryType: 'tectonic',
  },
  {
    id: 'ehm-yangtze',
    name: 'Yangtze Delta',
    lat: 31.2,
    lng: 121.5,
    waterQuality: 45,
    biodiversity: 38,
    sediment: 75,
    nutrientLoad: 78,
    tidalRange: 3.8,
    status: 'degraded',
    description: 'Bar-built delta estuary impacted by industrial discharge and urban runoff',
    estuaryType: 'bar_built',
  },
]

const STATUS_CONFIG: Record<
  EstuaryHealthData['status'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const ESTUARY_TYPE_LABELS: Record<DemoEstuary['estuaryType'], string> = {
  drowned_valley: 'Drowned Valley',
  bar_built: 'Bar-Built',
  tectonic: 'Tectonic',
  fjord: 'Fjord',
}

export function EstuaryHealthMonitor() {
  const state = useMapStore((s) => s.estuaryHealth)
  const setState = useMapStore((s) => s.setEstuaryHealth)

  const estuaries = useMemo(
    () => (state.estuaries.length > 0 ? (state.estuaries as DemoEstuary[]) : DEMO_ESTUARIES),
    [state.estuaries]
  )

  const filteredEstuaries = useMemo(() => {
    return estuaries.filter((e) => {
      if (state.typeFilter !== 'all' && e.estuaryType !== state.typeFilter) return false
      return true
    })
  }, [estuaries, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredEstuaries.length === 0) {
      return { avgWaterQuality: 0, avgBiodiversity: 0, criticalCount: 0 }
    }
    const avgWaterQuality =
      filteredEstuaries.reduce((sum, e) => sum + e.waterQuality, 0) / filteredEstuaries.length
    const avgBiodiversity =
      filteredEstuaries.reduce((sum, e) => sum + e.biodiversity, 0) / filteredEstuaries.length
    const criticalCount = filteredEstuaries.filter(
      (e) => e.status === 'critical' || e.status === 'degraded'
    ).length
    return {
      avgWaterQuality: Math.round(avgWaterQuality * 10) / 10,
      avgBiodiversity: Math.round(avgBiodiversity * 10) / 10,
      criticalCount,
    }
  }, [filteredEstuaries])

  const activeEstuary = useMemo(
    () => estuaries.find((e) => e.id === state.activeEstuaryId) ?? null,
    [estuaries, state.activeEstuaryId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EstuaryHealthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterQuality', label: 'Water Quality', icon: Droplets },
    { key: 'showBiodiversity', label: 'Biodiversity', icon: Bug },
    { key: 'showSediment', label: 'Sediment', icon: Mountain },
    { key: 'showNutrientLoad', label: 'Nutrient Load', icon: Wheat },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg shadow-teal-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon7 className="h-4 w-4 text-teal-400" />
              Estuary Health Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Estuary Type Filter */}
          <div>
            <Label className="text-xs text-teal-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Estuary Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as EstuaryHealthState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="drowned_valley">Drowned Valley</SelectItem>
                <SelectItem value="bar_built">Bar-Built</SelectItem>
                <SelectItem value="tectonic">Tectonic</SelectItem>
                <SelectItem value="fjord">Fjord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Water Quality</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgWaterQuality}</div>
              <div className="text-[9px] text-teal-400">index</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Avg Biodiversity</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-teal-400">index</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400">Critical/Degraded</div>
              <div className="text-sm font-semibold text-orange-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-teal-400">estuaries</div>
            </div>
          </div>

          <Separator className="bg-teal-800/30" />

          {/* Estuary List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300">
              Estuaries ({filteredEstuaries.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEstuaries.map((estuary) => {
                  const isActive = state.activeEstuaryId === estuary.id
                  const statusCfg = STATUS_CONFIG[estuary.status]
                  return (
                    <div
                      key={estuary.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/60 bg-teal-800/30'
                          : 'border-teal-800/30 hover:border-teal-600/40 hover:bg-teal-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeEstuaryId: isActive ? null : estuary.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-teal-100">{estuary.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300">
                        {state.showWaterQuality && (
                          <div>
                            Water Quality:{' '}
                            <span className="text-teal-100 font-medium">
                              {estuary.waterQuality}
                            </span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-teal-100 font-medium">
                              {estuary.biodiversity}
                            </span>
                          </div>
                        )}
                        {state.showSediment && (
                          <div>
                            Sediment:{' '}
                            <span className="text-teal-100 font-medium">
                              {estuary.sediment}
                            </span>
                          </div>
                        )}
                        {state.showNutrientLoad && (
                          <div>
                            Nutrient Load:{' '}
                            <span className="text-teal-100 font-medium">
                              {estuary.nutrientLoad}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEstuaries.length === 0 && (
                  <div className="text-center text-xs text-teal-400 py-4">
                    No estuaries match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Estuary Details */}
          {activeEstuary && (
            <>
              <Separator className="bg-teal-800/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeEstuary.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeEstuary.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeEstuary.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeEstuary.lat.toFixed(1)}, {activeEstuary.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400">Water Quality: </span>
                    <span className="font-medium text-cyan-400">{activeEstuary.waterQuality}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Biodiversity: </span>
                    <span className="font-medium text-teal-200">{activeEstuary.biodiversity}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Tidal Range: </span>
                    <span className="font-medium text-teal-200">{activeEstuary.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Sediment: </span>
                    <span className="font-medium text-teal-200">{activeEstuary.sediment}</span>
                  </div>
                  <div>
                    <span className="text-teal-400">Nutrient Load: </span>
                    <span className="font-medium text-orange-400">{activeEstuary.nutrientLoad}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Estuary Type: </span>
                    <span className="font-medium text-teal-200">
                      {(activeEstuary as DemoEstuary).estuaryType ? ESTUARY_TYPE_LABELS[(activeEstuary as DemoEstuary).estuaryType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-teal-400">Description: </span>
                    <span className="font-medium text-teal-200">{activeEstuary.description}</span>
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
