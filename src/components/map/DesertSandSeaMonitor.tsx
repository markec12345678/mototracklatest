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
import { useMapStore, type DesertSandSeaState, type DesertSandSeaData } from '@/lib/map-store'
import { Wind as WindIcon8, X, Layers, Activity, MoveRight, MapPin, Filter, Mountain } from 'lucide-react'

const SAMPLE_LOCATIONS: DesertSandSeaData[] = [
  {
    id: 'dss-rub-al-khali',
    name: 'Rub al Khali',
    lat: 22.0,
    lng: 52.0,
    duneHeight: 250,
    migrationRate: 15,
    area: 580000,
    duneType: 'star',
    windDirection: 'multi-directional',
    description: 'World largest sand sea with star dunes',
  },
  {
    id: 'dss-erg-chebbi',
    name: 'Erg Chebbi',
    lat: 31.1,
    lng: -4.0,
    duneHeight: 150,
    migrationRate: 5,
    area: 50,
    duneType: 'barchan',
    windDirection: 'NE',
    description: 'Crescent-shaped barchan dune field',
  },
  {
    id: 'dss-namib',
    name: 'Namib Sand Sea',
    lat: -24.5,
    lng: 15.5,
    duneHeight: 300,
    migrationRate: 2,
    area: 34000,
    duneType: 'transverse',
    windDirection: 'SW',
    description: 'Ancient transverse dune system',
  },
  {
    id: 'dss-simpson',
    name: 'Simpson Desert',
    lat: -25.0,
    lng: 137.0,
    duneHeight: 40,
    migrationRate: 1,
    area: 176500,
    duneType: 'seif',
    windDirection: 'SE',
    description: 'Longitudinal seif dune desert',
  },
]

const DUNE_TYPE_LABELS: Record<DesertSandSeaData['duneType'], { label: string; color: string; bgClass: string }> = {
  star: { label: 'Star', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  barchan: { label: 'Barchan', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  seif: { label: 'Seif', color: '#a78bfa', bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  transverse: { label: 'Transverse', color: '#60a5fa', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
}

function TrendIcon({ duneType }: { duneType: DesertSandSeaData['duneType'] }) {
  const cfg = DUNE_TYPE_LABELS[duneType]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DesertSandSeaMonitor() {
  const state = useMapStore((s) => s.desertSandSea)
  const setState = useMapStore((s) => s.setDesertSandSea)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : SAMPLE_LOCATIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.typeFilter !== 'all' && r.duneType !== state.typeFilter) return false
      return true
    })
  }, [regions, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { totalRegions: 0, avgDuneHeight: 0, avgMigrationRate: 0, totalArea: 0 }
    }
    const avgDuneHeight = filteredRegions.reduce((sum, r) => sum + r.duneHeight, 0) / filteredRegions.length
    const avgMigrationRate = filteredRegions.reduce((sum, r) => sum + r.migrationRate, 0) / filteredRegions.length
    const totalArea = filteredRegions.reduce((sum, r) => sum + r.area, 0)
    return {
      totalRegions: filteredRegions.length,
      avgDuneHeight: Math.round(avgDuneHeight),
      avgMigrationRate: Math.round(avgMigrationRate * 10) / 10,
      totalArea,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredRegions.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: { id: r.id, name: r.name, duneType: r.duneType, duneHeight: r.duneHeight },
    })),
  }), [filteredRegions])

  useEffect(() => {
    if (state.regions.length === 0) {
      useMapStore.getState().setDesertSandSea({ regions: SAMPLE_LOCATIONS })
    }
  }, [state.regions.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DesertSandSeaState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDuneHeight', label: 'Dune Height', icon: Mountain },
    { key: 'showMigration', label: 'Migration Rate', icon: MoveRight },
    { key: 'showArea', label: 'Area', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <WindIcon8 className="h-4 w-4 text-amber-400" />
              Desert Sand Sea Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Dune Type Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Dune Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as DesertSandSeaState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="barchan">Barchan</SelectItem>
                <SelectItem value="seif">Seif</SelectItem>
                <SelectItem value="star">Star</SelectItem>
                <SelectItem value="transverse">Transverse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Regions</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalRegions}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Dune Height</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgDuneHeight}</div>
              <div className="text-[9px] text-amber-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Migration Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgMigrationRate}</div>
              <div className="text-[9px] text-amber-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Area</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-amber-400/60">km²</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const typeCfg = DUNE_TYPE_LABELS[region.duneType]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeRegionId: isActive ? null : region.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon duneType={region.duneType} />
                          <span className="text-xs font-medium text-amber-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${typeCfg.bgClass}`}
                        >
                          {typeCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showDuneHeight && (
                          <div>
                            Dune Height:{' '}
                            <span className="text-amber-100 font-medium">{region.duneHeight}m</span>
                          </div>
                        )}
                        {state.showMigration && (
                          <div>
                            Migration:{' '}
                            <span className="text-amber-100 font-medium">{region.migrationRate}m/yr</span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-amber-100 font-medium">{region.area.toLocaleString()}km²</span>
                          </div>
                        )}
                        <div>
                          Wind:{' '}
                          <span className="text-amber-100 font-medium">{region.windDirection}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DUNE_TYPE_LABELS[activeRegion.duneType].bgClass}`}
                  >
                    {DUNE_TYPE_LABELS[activeRegion.duneType].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeRegion.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Dune Height: </span>
                    <span className="font-medium text-amber-100">{activeRegion.duneHeight}m</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Migration: </span>
                    <span className="font-medium text-orange-400">{activeRegion.migrationRate}m/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Area: </span>
                    <span className="font-medium text-amber-100">{activeRegion.area.toLocaleString()}km²</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Wind Direction: </span>
                    <span className="font-medium text-amber-100">{activeRegion.windDirection}</span>
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
