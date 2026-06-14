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
import { useMapStore, type SaltMarshState, type SaltMarsh } from '@/lib/map-store'
import { Leaf as LeafIcon3, X, TreePine, Waves, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_MARSHES: SaltMarsh[] = [
  {
    id: 'sm-wadden',
    name: 'Wadden Sea',
    lat: 53.5,
    lng: 6.0,
    area: 480,
    carbonSequestration: 2.8,
    sealevelRiseVulnerability: 0.62,
    vegetationCover: 78,
    tidalRange: 2.4,
    sedimentAccretion: 4.2,
    marshType: 'salt_marsh',
    healthStatus: 'good',
  },
  {
    id: 'sm-sapelo',
    name: 'Sapelo Island',
    lat: 31.4,
    lng: -81.2,
    area: 95,
    carbonSequestration: 3.5,
    sealevelRiseVulnerability: 0.35,
    vegetationCover: 92,
    tidalRange: 2.8,
    sedimentAccretion: 5.1,
    marshType: 'salt_marsh',
    healthStatus: 'pristine',
  },
  {
    id: 'sm-samborombon',
    name: 'Samborombón Bay',
    lat: -36.0,
    lng: -57.0,
    area: 320,
    carbonSequestration: 1.9,
    sealevelRiseVulnerability: 0.48,
    vegetationCover: 65,
    tidalRange: 1.8,
    sedimentAccretion: 3.0,
    marshType: 'brackish_marsh',
    healthStatus: 'moderate',
  },
  {
    id: 'sm-moreton',
    name: 'Moreton Bay',
    lat: -27.5,
    lng: 153.2,
    area: 185,
    carbonSequestration: 2.4,
    sealevelRiseVulnerability: 0.42,
    vegetationCover: 81,
    tidalRange: 2.0,
    sedimentAccretion: 3.8,
    marshType: 'mangrove_transition',
    healthStatus: 'good',
  },
  {
    id: 'sm-venice',
    name: 'Venice Lagoon',
    lat: 45.4,
    lng: 12.3,
    area: 55,
    carbonSequestration: 1.2,
    sealevelRiseVulnerability: 0.78,
    vegetationCover: 42,
    tidalRange: 1.0,
    sedimentAccretion: 1.5,
    marshType: 'brackish_marsh',
    healthStatus: 'degraded',
  },
  {
    id: 'sm-wash',
    name: 'Wash Estuary',
    lat: 52.9,
    lng: 0.3,
    area: 120,
    carbonSequestration: 2.6,
    sealevelRiseVulnerability: 0.45,
    vegetationCover: 76,
    tidalRange: 6.5,
    sedimentAccretion: 4.5,
    marshType: 'high_marsh',
    healthStatus: 'good',
  },
]

const HEALTH_CONFIG: Record<
  SaltMarsh['healthStatus'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  lost: { label: 'Lost', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const MARSH_TYPE_LABELS: Record<SaltMarsh['marshType'], string> = {
  salt_marsh: 'Salt Marsh',
  brackish_marsh: 'Brackish Marsh',
  freshwater_tidal: 'Freshwater Tidal',
  mangrove_transition: 'Mangrove Transition',
  high_marsh: 'High Marsh',
}

export function SaltMarshMonitor() {
  const state = useMapStore((s) => s.saltMarsh)
  const setState = useMapStore((s) => s.setSaltMarsh)

  const marshes = useMemo(
    () => (state.marshes && state.marshes.length > 0 ? state.marshes : DEMO_MARSHES),
    [state.marshes]
  )

  const filteredMarshes = useMemo(() => {
    return marshes.filter((m) => {
      if (state.typeFilter !== 'all' && m.marshType !== state.typeFilter) return false
      return true
    })
  }, [marshes, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredMarshes.length === 0) {
      return { avgCarbonSequestration: 0, avgVegetationCover: 0, criticalCount: 0 }
    }
    const avgCarbonSequestration = filteredMarshes.reduce((sum, m) => sum + m.carbonSequestration, 0) / filteredMarshes.length
    const avgVegetationCover = filteredMarshes.reduce((sum, m) => sum + m.vegetationCover, 0) / filteredMarshes.length
    const criticalCount = filteredMarshes.filter(
      (m) => m.healthStatus === 'degraded' || m.healthStatus === 'lost'
    ).length
    return {
      avgCarbonSequestration: Math.round(avgCarbonSequestration * 10) / 10,
      avgVegetationCover: Math.round(avgVegetationCover),
      criticalCount,
    }
  }, [filteredMarshes])

  const activeMarsh = useMemo(
    () => marshes.find((m) => m.id === state.activeMarshId) ?? null,
    [marshes, state.activeMarshId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SaltMarshState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonSequestration', label: 'Carbon Sequestration', icon: TreePine },
    { key: 'showSealevelRiseVulnerability', label: 'Sea Level Vulnerability', icon: Waves },
    { key: 'showVegetationCover', label: 'Vegetation Cover', icon: LeafIcon3 },
    { key: 'showHealthStatus', label: 'Health Status', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <LeafIcon3 className="h-4 w-4 text-green-700" />
              Salt Marsh Monitor
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
          {/* Marsh Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Marsh Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SaltMarshState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marsh Types</SelectItem>
                <SelectItem value="salt_marsh">Salt Marsh</SelectItem>
                <SelectItem value="brackish_marsh">Brackish Marsh</SelectItem>
                <SelectItem value="freshwater_tidal">Freshwater Tidal</SelectItem>
                <SelectItem value="mangrove_transition">Mangrove Transition</SelectItem>
                <SelectItem value="high_marsh">High Marsh</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-700" />
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
              <div className="text-[10px] text-muted-foreground">Avg Carbon Seq.</div>
              <div className="text-sm font-semibold text-green-700">{summary.avgCarbonSequestration}</div>
              <div className="text-[9px] text-muted-foreground">t CO₂/ha/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Vegetation</div>
              <div className="text-sm font-semibold text-green-600">{summary.avgVegetationCover}%</div>
              <div className="text-[9px] text-muted-foreground">cover</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Degraded+Lost</div>
              <div className="text-sm font-semibold text-orange-600">{summary.criticalCount}</div>
              <div className="text-[9px] text-muted-foreground">marshes</div>
            </div>
          </div>

          <Separator />

          {/* Marsh List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Salt Marshes ({filteredMarshes.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredMarshes.map((marsh) => {
                  const isActive = state.activeMarshId === marsh.id
                  const healthCfg = HEALTH_CONFIG[marsh.healthStatus]
                  return (
                    <div
                      key={marsh.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-700/50 bg-green-700/5'
                          : 'border-border/40 hover:border-green-700/20 hover:bg-green-700/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeMarshId: isActive ? null : marsh.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: healthCfg.color }}
                          />
                          <span className="text-xs font-medium">{marsh.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${healthCfg.bgClass}`}
                        >
                          {healthCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showCarbonSequestration && (
                          <div>
                            Carbon Seq.: <span className="text-foreground font-medium">{marsh.carbonSequestration} t/ha/yr</span>
                          </div>
                        )}
                        {state.showSealevelRiseVulnerability && (
                          <div>
                            SLR Vulnerab.: <span className="text-foreground font-medium">{(marsh.sealevelRiseVulnerability * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {state.showVegetationCover && (
                          <div>
                            Vegetation: <span className="text-foreground font-medium">{marsh.vegetationCover}%</span>
                          </div>
                        )}
                        {state.showHealthStatus && (
                          <div>
                            Area: <span className="text-foreground font-medium">{marsh.area} km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredMarshes.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No marshes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Marsh Details */}
          {activeMarsh && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-green-700/20 bg-green-700/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-700" />
                  <span className="text-xs font-semibold">{activeMarsh.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${HEALTH_CONFIG[activeMarsh.healthStatus].bgClass}`}
                  >
                    {HEALTH_CONFIG[activeMarsh.healthStatus].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeMarsh.lat.toFixed(2)}, {activeMarsh.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Marsh Type: </span>
                    <span className="font-medium">{MARSH_TYPE_LABELS[activeMarsh.marshType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeMarsh.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Seq.: </span>
                    <span className="font-medium">{activeMarsh.carbonSequestration} t CO₂/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SLR Vulnerability: </span>
                    <span className="font-medium">{(activeMarsh.sealevelRiseVulnerability * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vegetation Cover: </span>
                    <span className="font-medium">{activeMarsh.vegetationCover}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tidal Range: </span>
                    <span className="font-medium">{activeMarsh.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sediment Accretion: </span>
                    <span className="font-medium">{activeMarsh.sedimentAccretion} mm/yr</span>
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
