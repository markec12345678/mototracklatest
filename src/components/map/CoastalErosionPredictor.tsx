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
import { useMapStore, type CoastalErosionPredictorState, type CoastalErosionZone } from '@/lib/map-store'
import { Ship as ShipIcon2, X, Waves, MapPin, Filter, TrendingDown, ShieldAlert } from 'lucide-react'

const DEMO_ZONES: CoastalErosionZone[] = [
  {
    id: 'ce-holderness',
    name: 'Holderness Coast UK',
    latitude: 53.7500,
    longitude: -0.1833,
    coastlineType: 'sandy_beach',
    erosionRate: 1.8,
    shorelineChange: -2.1,
    waveHeight: 1.5,
    seaLevelImpact: 3.2,
    vulnerability: 'very_high',
  },
  {
    id: 'ce-norfolk',
    name: 'Norfolk Virginia USA',
    latitude: 36.8500,
    longitude: -76.2850,
    coastlineType: 'estuary',
    erosionRate: 1.2,
    shorelineChange: -1.5,
    waveHeight: 0.8,
    seaLevelImpact: 4.6,
    vulnerability: 'high',
  },
  {
    id: 'ce-sundarbans',
    name: 'Sundarbans Bangladesh',
    latitude: 21.9497,
    longitude: 89.1833,
    coastlineType: 'mangrove_coast',
    erosionRate: 2.5,
    shorelineChange: -3.4,
    waveHeight: 1.2,
    seaLevelImpact: 5.8,
    vulnerability: 'very_high',
  },
  {
    id: 'ce-victoria',
    name: 'Victoria Australia',
    latitude: -38.1500,
    longitude: 145.1333,
    coastlineType: 'rocky_cliff',
    erosionRate: 0.3,
    shorelineChange: -0.2,
    waveHeight: 2.1,
    seaLevelImpact: 2.1,
    vulnerability: 'low',
  },
  {
    id: 'ce-niledelta',
    name: 'Nile Delta Egypt',
    latitude: 31.2000,
    longitude: 31.9000,
    coastlineType: 'sandy_beach',
    erosionRate: 1.5,
    shorelineChange: -2.3,
    waveHeight: 0.9,
    seaLevelImpact: 3.9,
    vulnerability: 'high',
  },
  {
    id: 'ce-tuvalu',
    name: 'Tuvalu Pacific',
    latitude: -7.4783,
    longitude: 178.6769,
    coastlineType: 'coral_coast',
    erosionRate: 0.8,
    shorelineChange: -1.1,
    waveHeight: 1.8,
    seaLevelImpact: 5.2,
    vulnerability: 'very_high',
  },
]

const VULNERABILITY_CONFIG: Record<
  CoastalErosionZone['vulnerability'],
  { label: string; color: string; bgClass: string }
> = {
  very_low: { label: 'Very Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_high: { label: 'Very High', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const COAST_CONFIG: Record<
  CoastalErosionZone['coastlineType'],
  { label: string }
> = {
  sandy_beach: { label: 'Sandy Beach' },
  rocky_cliff: { label: 'Rocky Cliff' },
  estuary: { label: 'Estuary' },
  mangrove_coast: { label: 'Mangrove Coast' },
  coral_coast: { label: 'Coral Coast' },
  glacial_fjord: { label: 'Glacial Fjord' },
}

export function CoastalErosionPredictor() {
  const state = useMapStore((s) => s.coastalErosionPredictor)
  const setState = useMapStore((s) => s.setCoastalErosionPredictor)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.coastFilter !== 'all' && z.coastlineType !== state.coastFilter) return false
      return true
    })
  }, [zones, state.coastFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgErosionRate: 0, avgShorelineChange: 0, highCount: 0 }
    }
    const avgErosionRate = filteredZones.reduce((sum, z) => sum + z.erosionRate, 0) / filteredZones.length
    const avgShorelineChange = filteredZones.reduce((sum, z) => sum + z.shorelineChange, 0) / filteredZones.length
    const highCount = filteredZones.filter(
      (z) => z.vulnerability === 'high' || z.vulnerability === 'very_high'
    ).length
    return {
      avgErosionRate: Math.round(avgErosionRate * 100) / 100,
      avgShorelineChange: Math.round(avgShorelineChange * 100) / 100,
      highCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalErosionPredictorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showErosionRate', label: 'Erosion Rate', icon: TrendingDown },
    { key: 'showShorelineChange', label: 'Shoreline Change', icon: Waves },
    { key: 'showWaveHeight', label: 'Wave Height', icon: Waves },
    { key: 'showVulnerability', label: 'Vulnerability', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShipIcon2 className="h-4 w-4 text-amber-600" />
              Coastal Erosion Predictor
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
          {/* Coastline Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Coastline Type
            </Label>
            <Select
              value={state.coastFilter}
              onValueChange={(v) =>
                setState({
                  coastFilter: v as CoastalErosionPredictorState['coastFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coasts</SelectItem>
                <SelectItem value="sandy_beach">Sandy Beach</SelectItem>
                <SelectItem value="rocky_cliff">Rocky Cliff</SelectItem>
                <SelectItem value="estuary">Estuary</SelectItem>
                <SelectItem value="mangrove_coast">Mangrove Coast</SelectItem>
                <SelectItem value="coral_coast">Coral Coast</SelectItem>
                <SelectItem value="glacial_fjord">Glacial Fjord</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Erosion Rate</div>
              <div className="text-sm font-semibold">{summary.avgErosionRate} m/yr</div>
              <div className="text-[9px] text-muted-foreground">rate</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Shoreline Δ</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgShorelineChange} m/yr</div>
              <div className="text-[9px] text-muted-foreground">change</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High+Very High</div>
              <div className="text-sm font-semibold text-red-600">{summary.highCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Coastal Erosion Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const vulnCfg = VULNERABILITY_CONFIG[zone.vulnerability]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: vulnCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${vulnCfg.bgClass}`}
                        >
                          {vulnCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showErosionRate && (
                          <div>
                            Erosion:{' '}
                            <span className="text-foreground font-medium">
                              {zone.erosionRate.toFixed(2)} m/yr
                            </span>
                          </div>
                        )}
                        {state.showShorelineChange && (
                          <div>
                            Shoreline Δ:{' '}
                            <span className="text-foreground font-medium">
                              {zone.shorelineChange > 0 ? '+' : ''}{zone.shorelineChange.toFixed(2)} m/yr
                            </span>
                          </div>
                        )}
                        {state.showWaveHeight && (
                          <div>
                            Wave Ht:{' '}
                            <span className="text-foreground font-medium">
                              {zone.waveHeight.toFixed(1)} m
                            </span>
                          </div>
                        )}
                        {state.showVulnerability && (
                          <div>
                            SL Impact:{' '}
                            <span className="text-foreground font-medium">
                              {zone.seaLevelImpact.toFixed(1)} mm/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${VULNERABILITY_CONFIG[activeZone.vulnerability].bgClass}`}
                  >
                    {VULNERABILITY_CONFIG[activeZone.vulnerability].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coast Type: </span>
                    <span className="font-medium">{COAST_CONFIG[activeZone.coastlineType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erosion Rate: </span>
                    <span className="font-medium">{activeZone.erosionRate.toFixed(2)} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shoreline Change: </span>
                    <span className="font-medium">{activeZone.shorelineChange > 0 ? '+' : ''}{activeZone.shorelineChange.toFixed(2)} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wave Height: </span>
                    <span className="font-medium">{activeZone.waveHeight.toFixed(1)} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sea Level Impact: </span>
                    <span className="font-medium">{activeZone.seaLevelImpact.toFixed(1)} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vulnerability: </span>
                    <span className="font-medium">{VULNERABILITY_CONFIG[activeZone.vulnerability].label}</span>
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
