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
import { useMapStore, type CoastalUpwellingState, type UpwellingZone } from '@/lib/map-store'
import { Waves as WavesIcon, X, Thermometer, FlaskConical, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_ZONES: UpwellingZone[] = [
  {
    id: 'cu-peru',
    name: 'Peru Current',
    latitude: -12.50,
    longitude: -77.00,
    upwellingType: 'coastal',
    sstAnomaly: -4.8,
    nutrientConcentration: 18.5,
    chlorophyllLevel: 3.2,
    upwellingVelocity: 2.8,
    productivity: 'very_high',
  },
  {
    id: 'cu-california',
    name: 'California Current',
    latitude: 36.75,
    longitude: -122.50,
    upwellingType: 'coastal',
    sstAnomaly: -3.2,
    nutrientConcentration: 14.2,
    chlorophyllLevel: 2.4,
    upwellingVelocity: 1.9,
    productivity: 'high',
  },
  {
    id: 'cu-benguela',
    name: 'Benguela Current',
    latitude: -22.00,
    longitude: 12.00,
    upwellingType: 'ekman',
    sstAnomaly: -5.1,
    nutrientConcentration: 20.1,
    chlorophyllLevel: 3.8,
    upwellingVelocity: 3.2,
    productivity: 'very_high',
  },
  {
    id: 'cu-canary',
    name: 'Canary Current',
    latitude: 28.00,
    longitude: -15.00,
    upwellingType: 'coastal',
    sstAnomaly: -2.1,
    nutrientConcentration: 10.8,
    chlorophyllLevel: 1.6,
    upwellingVelocity: 1.2,
    productivity: 'moderate',
  },
  {
    id: 'cu-somalia',
    name: 'Somalia Current',
    latitude: 5.00,
    longitude: 50.00,
    upwellingType: 'ekman',
    sstAnomaly: -3.8,
    nutrientConcentration: 15.6,
    chlorophyllLevel: 2.8,
    upwellingVelocity: 2.3,
    productivity: 'high',
  },
  {
    id: 'cu-nwaus',
    name: 'NW Australia',
    latitude: -20.00,
    longitude: 114.00,
    upwellingType: 'topographic',
    sstAnomaly: -1.5,
    nutrientConcentration: 7.2,
    chlorophyllLevel: 0.9,
    upwellingVelocity: 0.8,
    productivity: 'low',
  },
]

const PRODUCTIVITY_CONFIG: Record<
  UpwellingZone['productivity'],
  { label: string; color: string; bgClass: string }
> = {
  very_low: { label: 'Very Low', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  very_high: { label: 'Very High', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const TYPE_CONFIG: Record<
  UpwellingZone['upwellingType'],
  { label: string }
> = {
  coastal: { label: 'Coastal' },
  equatorial: { label: 'Equatorial' },
  ekman: { label: 'Ekman' },
  divergence: { label: 'Divergence' },
  topographic: { label: 'Topographic' },
}

export function CoastalUpwellingMonitor() {
  const state = useMapStore((s) => s.coastalUpwelling)
  const setState = useMapStore((s) => s.setCoastalUpwelling)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.typeFilter !== 'all' && z.upwellingType !== state.typeFilter) return false
      return true
    })
  }, [zones, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgSSTAnomaly: 0, avgNutrients: 0, highVeryHighCount: 0 }
    }
    const avgSSTAnomaly = filteredZones.reduce((sum, z) => sum + z.sstAnomaly, 0) / filteredZones.length
    const avgNutrients = filteredZones.reduce((sum, z) => sum + z.nutrientConcentration, 0) / filteredZones.length
    const highVeryHighCount = filteredZones.filter(
      (z) => z.productivity === 'high' || z.productivity === 'very_high'
    ).length
    return {
      avgSSTAnomaly: Math.round(avgSSTAnomaly * 10) / 10,
      avgNutrients: Math.round(avgNutrients * 10) / 10,
      highVeryHighCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalUpwellingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSSTAnomaly', label: 'SST Anomaly', icon: Thermometer },
    { key: 'showNutrients', label: 'Nutrients', icon: FlaskConical },
    { key: 'showChlorophyll', label: 'Chlorophyll', icon: TrendingUp },
    { key: 'showProductivity', label: 'Productivity', icon: TrendingUp },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon className="h-4 w-4 text-teal-600" />
              Coastal Upwelling Monitor
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Upwelling Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as CoastalUpwellingState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="coastal">Coastal</SelectItem>
                <SelectItem value="equatorial">Equatorial</SelectItem>
                <SelectItem value="ekman">Ekman</SelectItem>
                <SelectItem value="divergence">Divergence</SelectItem>
                <SelectItem value="topographic">Topographic</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg SST Anomaly</div>
              <div className="text-sm font-semibold">{summary.avgSSTAnomaly.toFixed(1)}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Nutrients</div>
              <div className="text-sm font-semibold text-teal-600">{summary.avgNutrients.toFixed(1)}</div>
              <div className="text-[9px] text-muted-foreground">μmol/L</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High+Very High</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.highVeryHighCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Upwelling Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const prodCfg = PRODUCTIVITY_CONFIG[zone.productivity]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
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
                            style={{ backgroundColor: prodCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${prodCfg.bgClass}`}
                        >
                          {prodCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showSSTAnomaly && (
                          <div>
                            SST Δ:{' '}
                            <span className="text-foreground font-medium">
                              {zone.sstAnomaly.toFixed(1)} °C
                            </span>
                          </div>
                        )}
                        {state.showNutrients && (
                          <div>
                            Nutrients:{' '}
                            <span className="text-foreground font-medium">
                              {zone.nutrientConcentration.toFixed(1)} μmol/L
                            </span>
                          </div>
                        )}
                        {state.showChlorophyll && (
                          <div>
                            Chlorophyll:{' '}
                            <span className="text-foreground font-medium">
                              {zone.chlorophyllLevel.toFixed(1)} mg/m³
                            </span>
                          </div>
                        )}
                        {state.showProductivity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.upwellingVelocity.toFixed(1)} m/day
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
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${PRODUCTIVITY_CONFIG[activeZone.productivity].bgClass}`}
                  >
                    {PRODUCTIVITY_CONFIG[activeZone.productivity].label}
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
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium">{TYPE_CONFIG[activeZone.upwellingType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SST Anomaly: </span>
                    <span className="font-medium">{activeZone.sstAnomaly.toFixed(1)} °C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nutrients: </span>
                    <span className="font-medium">{activeZone.nutrientConcentration.toFixed(1)} μmol/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chlorophyll: </span>
                    <span className="font-medium">{activeZone.chlorophyllLevel.toFixed(1)} mg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeZone.upwellingVelocity.toFixed(1)} m/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Productivity: </span>
                    <span className="font-medium">{PRODUCTIVITY_CONFIG[activeZone.productivity].label}</span>
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
