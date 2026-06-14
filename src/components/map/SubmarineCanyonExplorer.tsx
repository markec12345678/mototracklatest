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
import { useMapStore, type SubmarineCanyonState, type SubmarineCanyon } from '@/lib/map-store'
import { Mountain as MountainIcon3, X, Ruler, Wind, MapPin, Filter, Compass } from 'lucide-react'

const DEMO_CANYONS: SubmarineCanyon[] = [
  {
    id: 'sc-monterey',
    name: 'Monterey Canyon',
    lat: 36.8,
    lng: -122.0,
    depth: 4200,
    length: 470,
    width: 12,
    sedimentTransport: 1500000,
    turbidityFlow: 'frequent',
    biodiversityIndex: 0.68,
    canyonType: 'river_originated',
    researchStatus: 'well_studied',
  },
  {
    id: 'sc-zhemchug',
    name: 'Zhemchug Canyon',
    lat: 56.0,
    lng: -171.0,
    depth: 5800,
    length: 660,
    width: 18,
    sedimentTransport: 2800000,
    turbidityFlow: 'occasional',
    biodiversityIndex: 0.45,
    canyonType: 'shelf_incised',
    researchStatus: 'surveyed',
  },
  {
    id: 'sc-congo',
    name: 'Congo Canyon',
    lat: -5.0,
    lng: 10.0,
    depth: 5200,
    length: 780,
    width: 15,
    sedimentTransport: 3200000,
    turbidityFlow: 'active',
    biodiversityIndex: 0.52,
    canyonType: 'river_originated',
    researchStatus: 'well_studied',
  },
  {
    id: 'sc-nazare',
    name: 'Nazaré Canyon',
    lat: 39.5,
    lng: -10.0,
    depth: 5000,
    length: 450,
    width: 10,
    sedimentTransport: 980000,
    turbidityFlow: 'occasional',
    biodiversityIndex: 0.59,
    canyonType: 'shelf_incised',
    researchStatus: 'surveyed',
  },
  {
    id: 'sc-bute',
    name: 'Bute Inlet Canyon',
    lat: 50.1,
    lng: -124.8,
    depth: 2100,
    length: 180,
    width: 5,
    sedimentTransport: 420000,
    turbidityFlow: 'rare',
    biodiversityIndex: 0.73,
    canyonType: 'slope_confined',
    researchStatus: 'preliminary',
  },
  {
    id: 'sc-wilmington',
    name: 'Wilmington Canyon',
    lat: 39.0,
    lng: -73.5,
    depth: 2800,
    length: 220,
    width: 8,
    sedimentTransport: 310000,
    turbidityFlow: 'rare',
    biodiversityIndex: 0.41,
    canyonType: 'blind',
    researchStatus: 'preliminary',
  },
]

const RESEARCH_CONFIG: Record<
  SubmarineCanyon['researchStatus'],
  { label: string; color: string; bgClass: string }
> = {
  unexplored: { label: 'Unexplored', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  preliminary: { label: 'Preliminary', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  surveyed: { label: 'Surveyed', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  well_studied: { label: 'Well Studied', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  protected: { label: 'Protected', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const CANYON_TYPE_LABELS: Record<SubmarineCanyon['canyonType'], string> = {
  river_originated: 'River Originated',
  shelf_incised: 'Shelf Incised',
  slope_confined: 'Slope Confined',
  blind: 'Blind',
  delta_front: 'Delta Front',
}

function formatSediment(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

export function SubmarineCanyonExplorer() {
  const state = useMapStore((s) => s.submarineCanyon)
  const setState = useMapStore((s) => s.setSubmarineCanyon)

  const canyons = useMemo(
    () => (state.canyons && state.canyons.length > 0 ? state.canyons : DEMO_CANYONS),
    [state.canyons]
  )

  const filteredCanyons = useMemo(() => {
    return canyons.filter((c) => {
      if (state.typeFilter !== 'all' && c.canyonType !== state.typeFilter) return false
      return true
    })
  }, [canyons, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredCanyons.length === 0) {
      return { avgDepth: 0, avgSedimentTransport: 0, studiedCount: 0 }
    }
    const avgDepth = filteredCanyons.reduce((sum, c) => sum + c.depth, 0) / filteredCanyons.length
    const avgSedimentTransport = filteredCanyons.reduce((sum, c) => sum + c.sedimentTransport, 0) / filteredCanyons.length
    const studiedCount = filteredCanyons.filter(
      (c) => c.researchStatus === 'well_studied' || c.researchStatus === 'protected'
    ).length
    return {
      avgDepth: Math.round(avgDepth),
      avgSedimentTransport: Math.round(avgSedimentTransport),
      studiedCount,
    }
  }, [filteredCanyons])

  const activeCanyon = useMemo(
    () => canyons.find((c) => c.id === state.activeCanyonId) ?? null,
    [canyons, state.activeCanyonId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineCanyonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showSedimentTransport', label: 'Sediment Transport', icon: Wind },
    { key: 'showBiodiversityIndex', label: 'Biodiversity Index', icon: Compass },
    { key: 'showResearchStatus', label: 'Research Status', icon: MountainIcon3 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainIcon3 className="h-4 w-4 text-blue-800" />
              Submarine Canyon Explorer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Canyon Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Canyon Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SubmarineCanyonState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Canyon Types</SelectItem>
                <SelectItem value="river_originated">River Originated</SelectItem>
                <SelectItem value="shelf_incised">Shelf Incised</SelectItem>
                <SelectItem value="slope_confined">Slope Confined</SelectItem>
                <SelectItem value="blind">Blind</SelectItem>
                <SelectItem value="delta_front">Delta Front</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-blue-800" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Depth</div>
              <div className="text-sm font-semibold text-blue-800">{summary.avgDepth}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Sediment</div>
              <div className="text-sm font-semibold text-blue-600">{formatSediment(summary.avgSedimentTransport)}</div>
              <div className="text-[9px] text-muted-foreground">m³/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Well Studied+</div>
              <div className="text-sm font-semibold text-green-600">{summary.studiedCount}</div>
              <div className="text-[9px] text-muted-foreground">canyons</div>
            </div>
          </div>

          <Separator />

          {/* Canyon List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Submarine Canyons ({filteredCanyons.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCanyons.map((canyon) => {
                  const isActive = state.activeCanyonId === canyon.id
                  const researchCfg = RESEARCH_CONFIG[canyon.researchStatus]
                  return (
                    <div
                      key={canyon.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-800/50 bg-blue-800/5'
                          : 'border-border/40 hover:border-blue-800/20 hover:bg-blue-800/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeCanyonId: isActive ? null : canyon.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: researchCfg.color }}
                          />
                          <span className="text-xs font-medium">{canyon.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${researchCfg.bgClass}`}
                        >
                          {researchCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showDepth && (
                          <div>
                            Depth: <span className="text-foreground font-medium">{canyon.depth.toLocaleString()} m</span>
                          </div>
                        )}
                        {state.showSedimentTransport && (
                          <div>
                            Sediment: <span className="text-foreground font-medium">{formatSediment(canyon.sedimentTransport)} m³/yr</span>
                          </div>
                        )}
                        {state.showBiodiversityIndex && (
                          <div>
                            Biodiversity: <span className="text-foreground font-medium">{(canyon.biodiversityIndex * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {state.showResearchStatus && (
                          <div>
                            Length: <span className="text-foreground font-medium">{canyon.length} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCanyons.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No canyons match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Canyon Details */}
          {activeCanyon && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-blue-800/20 bg-blue-800/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-800" />
                  <span className="text-xs font-semibold">{activeCanyon.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${RESEARCH_CONFIG[activeCanyon.researchStatus].bgClass}`}
                  >
                    {RESEARCH_CONFIG[activeCanyon.researchStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeCanyon.lat.toFixed(2)}, {activeCanyon.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Canyon Type: </span>
                    <span className="font-medium">{CANYON_TYPE_LABELS[activeCanyon.canyonType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeCanyon.depth.toLocaleString()} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length: </span>
                    <span className="font-medium">{activeCanyon.length} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Width: </span>
                    <span className="font-medium">{activeCanyon.width} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sediment: </span>
                    <span className="font-medium">{formatSediment(activeCanyon.sedimentTransport)} m³/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Turbidity Flow: </span>
                    <span className="font-medium">{activeCanyon.turbidityFlow}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Biodiversity: </span>
                    <span className="font-medium">{(activeCanyon.biodiversityIndex * 100).toFixed(0)}%</span>
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
