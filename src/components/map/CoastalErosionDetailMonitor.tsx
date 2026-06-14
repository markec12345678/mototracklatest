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
import { useMapStore, type CoastalErosionDetailState, type CoastalErosionDetailData } from '@/lib/map-store'
import { Waves as WavesIcon10, X, BarChart3, MapPin, Filter, TrendingDown, Shield } from 'lucide-react'

const DEMO_SEGMENTS: CoastalErosionDetailData[] = [
  {
    id: 'ce-norfolk',
    name: 'Norfolk Coast UK',
    lat: 52.9,
    lng: 1.6,
    erosionRate: 2.0,
    seaLevel: 3.5,
    sediment: 25,
    protection: 40,
    population: 30000,
    status: 'rapid_erosion',
    description: 'Fast-eroding soft cliffs along the Norfolk coastline',
  },
  {
    id: 'ce-bangladesh',
    name: 'Bangladesh Coast',
    lat: 22,
    lng: 90,
    erosionRate: 5.0,
    seaLevel: 5.0,
    sediment: 15,
    protection: 10,
    population: 500000,
    status: 'critical',
    description: 'Densely populated delta coast under severe erosion threat',
  },
  {
    id: 'ce-senegal',
    name: 'Senegal Coast',
    lat: 14.7,
    lng: -17.4,
    erosionRate: 1.5,
    seaLevel: 3.0,
    sediment: 35,
    protection: 25,
    population: 100000,
    status: 'slow_erosion',
    description: 'West African coastline with moderate erosion and limited protection',
  },
  {
    id: 'ce-maldives',
    name: 'Maldives',
    lat: 4.2,
    lng: 73.5,
    erosionRate: 3.0,
    seaLevel: 4.5,
    sediment: 20,
    protection: 15,
    population: 200000,
    status: 'rapid_erosion',
    description: 'Low-lying island nation facing severe coastal erosion',
  },
  {
    id: 'ce-dutch',
    name: 'Dutch Coast',
    lat: 52.5,
    lng: 4,
    erosionRate: -0.5,
    seaLevel: 2.0,
    sediment: 60,
    protection: 85,
    population: 50000,
    status: 'accretion',
    description: 'Well-protected coastline with sand nourishment programs showing accretion',
  },
  {
    id: 'ce-japanese',
    name: 'Japanese Coast',
    lat: 35,
    lng: 140,
    erosionRate: 0.8,
    seaLevel: 2.5,
    sediment: 45,
    protection: 70,
    population: 80000,
    status: 'stable',
    description: 'Heavily engineered coastline with stable erosion conditions',
  },
]

const STATUS_CONFIG: Record<
  CoastalErosionDetailData['status'],
  { label: string; color: string; bgClass: string }
> = {
  accretion: { label: 'Accretion', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  slow_erosion: { label: 'Slow Erosion', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rapid_erosion: { label: 'Rapid Erosion', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function CoastalErosionDetailMonitor() {
  const state = useMapStore((s) => s.coastalErosionDetail)
  const setState = useMapStore((s) => s.setCoastalErosionDetail)

  const segments = useMemo(
    () => (state.segments.length > 0 ? state.segments : DEMO_SEGMENTS),
    [state.segments]
  )

  const filteredSegments = useMemo(() => {
    return segments.filter((s) => {
      if (state.severityFilter !== 'all') {
        const severityMap: Record<string, string[]> = {
          accretion: ['ce-dutch'],
          stable: ['ce-japanese'],
          slow_erosion: ['ce-senegal'],
          rapid_erosion: ['ce-norfolk', 'ce-maldives'],
          critical: ['ce-bangladesh'],
        }
        if (!severityMap[state.severityFilter]?.includes(s.id)) return false
      }
      return true
    })
  }, [segments, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredSegments.length === 0) {
      return { avgErosionRate: 0, avgSeaLevel: 0, avgProtection: 0 }
    }
    const avgErosionRate =
      filteredSegments.reduce((sum, s) => sum + s.erosionRate, 0) / filteredSegments.length
    const avgSeaLevel =
      filteredSegments.reduce((sum, s) => sum + s.seaLevel, 0) / filteredSegments.length
    const avgProtection =
      filteredSegments.reduce((sum, s) => sum + s.protection, 0) / filteredSegments.length
    return {
      avgErosionRate: Math.round(avgErosionRate * 10) / 10,
      avgSeaLevel: Math.round(avgSeaLevel * 10) / 10,
      avgProtection: Math.round(avgProtection),
    }
  }, [filteredSegments])

  const activeSegment = useMemo(
    () => segments.find((s) => s.id === state.activeSegmentId) ?? null,
    [segments, state.activeSegmentId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalErosionDetailState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showErosionRate', label: 'Erosion Rate', icon: TrendingDown },
    { key: 'showSeaLevel', label: 'Sea Level', icon: WavesIcon10 },
    { key: 'showSediment', label: 'Sediment', icon: BarChart3 },
    { key: 'showProtection', label: 'Protection', icon: Shield },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-blue-950/80 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon10 className="h-4 w-4 text-blue-400" />
              Coastal Erosion Detail Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Erosion Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as CoastalErosionDetailState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="accretion">Accretion</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="slow_erosion">Slow Erosion</SelectItem>
                <SelectItem value="rapid_erosion">Rapid Erosion</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Erosion</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgErosionRate}</div>
              <div className="text-[9px] text-blue-400">m/yr</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Sea Level</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgSeaLevel}</div>
              <div className="text-[9px] text-blue-400">mm/yr</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Protection</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgProtection}</div>
              <div className="text-[9px] text-blue-400">index</div>
            </div>
          </div>

          <Separator className="bg-blue-800/30" />

          {/* Segment List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Coastal Segments ({filteredSegments.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSegments.map((segment) => {
                  const isActive = state.activeSegmentId === segment.id
                  const statusCfg = STATUS_CONFIG[segment.status]
                  return (
                    <div
                      key={segment.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/60 bg-blue-800/30'
                          : 'border-blue-800/30 hover:border-blue-600/40 hover:bg-blue-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeSegmentId: isActive ? null : segment.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{segment.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showErosionRate && (
                          <div>
                            Erosion Rate:{' '}
                            <span className="text-amber-400 font-medium">
                              {segment.erosionRate} m/yr
                            </span>
                          </div>
                        )}
                        {state.showSeaLevel && (
                          <div>
                            Sea Level:{' '}
                            <span className="text-sky-400 font-medium">
                              {segment.seaLevel} mm/yr
                            </span>
                          </div>
                        )}
                        {state.showSediment && (
                          <div>
                            Sediment:{' '}
                            <span className="text-blue-200 font-medium">
                              {segment.sediment}
                            </span>
                          </div>
                        )}
                        {state.showProtection && (
                          <div>
                            Protection:{' '}
                            <span className="text-emerald-400 font-medium">
                              {segment.protection}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSegments.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No segments match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Segment Details */}
          {activeSegment && (
            <>
              <Separator className="bg-blue-800/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeSegment.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSegment.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSegment.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeSegment.lat.toFixed(1)}, {activeSegment.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Erosion Rate: </span>
                    <span className="font-medium text-amber-400">{activeSegment.erosionRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Sea Level: </span>
                    <span className="font-medium text-sky-400">{activeSegment.seaLevel} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Sediment: </span>
                    <span className="font-medium text-blue-200">{activeSegment.sediment}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Protection: </span>
                    <span className="font-medium text-emerald-400">{activeSegment.protection}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Population: </span>
                    <span className="font-medium text-blue-200">{activeSegment.population.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeSegment.description}</span>
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
