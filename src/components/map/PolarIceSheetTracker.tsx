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
import { useMapStore, type PolarIceSheetState, type PolarIceSheet } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon3, X, Weight, Gauge, Mountain, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_SHEETS: PolarIceSheet[] = [
  {
    id: 'pi-greenland-sw',
    name: 'Greenland SW',
    latitude: 67.0,
    longitude: -50.0,
    sheetType: 'greenland',
    massLoss: 142.5,
    areaChange: -3280,
    velocity: 1250,
    basalMelt: 18.4,
    calvingRate: 42.8,
    seaLevelContribution: 0.39,
    stability: 'destabilizing',
  },
  {
    id: 'pi-greenland-ne',
    name: 'Greenland NE',
    latitude: 76.5,
    longitude: -22.0,
    sheetType: 'greenland',
    massLoss: 28.4,
    areaChange: -890,
    velocity: 420,
    basalMelt: 6.2,
    calvingRate: 12.5,
    seaLevelContribution: 0.08,
    stability: 'weakening',
  },
  {
    id: 'pi-east-antarctic-wilkes',
    name: 'East Antarctic - Wilkes',
    latitude: -70.5,
    longitude: 120.0,
    sheetType: 'east_antarctic',
    massLoss: 56.8,
    areaChange: -1840,
    velocity: 680,
    basalMelt: 14.2,
    calvingRate: 28.4,
    seaLevelContribution: 0.16,
    stability: 'weakening',
  },
  {
    id: 'pi-west-antarctic-thwaites',
    name: 'West Antarctic - Thwaites',
    latitude: -75.5,
    longitude: -106.0,
    sheetType: 'west_antarctic',
    massLoss: 185.2,
    areaChange: -4120,
    velocity: 2100,
    basalMelt: 32.6,
    calvingRate: 68.4,
    seaLevelContribution: 0.51,
    stability: 'collapsing',
  },
  {
    id: 'pi-antarctic-peninsula',
    name: 'Antarctic Peninsula',
    latitude: -67.0,
    longitude: -63.0,
    sheetType: 'peninsula',
    massLoss: 34.2,
    areaChange: -1580,
    velocity: 560,
    basalMelt: 8.6,
    calvingRate: 22.1,
    seaLevelContribution: 0.09,
    stability: 'destabilizing',
  },
  {
    id: 'pi-east-antarctic-dome',
    name: 'East Antarctic - Dome C',
    latitude: -75.1,
    longitude: 123.4,
    sheetType: 'east_antarctic',
    massLoss: 4.8,
    areaChange: 120,
    velocity: 15,
    basalMelt: 0.4,
    calvingRate: 0.8,
    seaLevelContribution: 0.01,
    stability: 'stable',
  },
]

const STABILITY_CONFIG: Record<
  PolarIceSheet['stability'],
  { label: string; color: string; bgClass: string }
> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  weakening: { label: 'Weakening', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  destabilizing: { label: 'Destabilizing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function PolarIceSheetTracker() {
  const polarIceSheet = useMapStore((s) => s.polarIceSheet)
  const setPolarIceSheet = useMapStore((s) => s.setPolarIceSheet)

  const sheets = useMemo(
    () => (polarIceSheet.sheets.length > 0 ? polarIceSheet.sheets : DEMO_SHEETS),
    [polarIceSheet.sheets]
  )

  const filteredSheets = useMemo(() => {
    return sheets.filter((s) => {
      if (polarIceSheet.stabilityFilter !== 'all' && s.stability !== polarIceSheet.stabilityFilter) return false
      return true
    })
  }, [sheets, polarIceSheet.stabilityFilter])

  const summary = useMemo(() => {
    if (filteredSheets.length === 0) {
      return { totalMassLoss: 0, totalSeaLevel: 0, collapsingCount: 0 }
    }
    const totalMassLoss = filteredSheets.reduce((sum, s) => sum + s.massLoss, 0)
    const totalSeaLevel = filteredSheets.reduce((sum, s) => sum + s.seaLevelContribution, 0)
    const collapsingCount = filteredSheets.filter((s) => s.stability === 'collapsing').length
    return {
      totalMassLoss: Math.round(totalMassLoss * 10) / 10,
      totalSeaLevel: Math.round(totalSeaLevel * 100) / 100,
      collapsingCount,
    }
  }, [filteredSheets])

  const activeSheet = useMemo(
    () => sheets.find((s) => s.id === polarIceSheet.activeSheetId) ?? null,
    [sheets, polarIceSheet.activeSheetId]
  )

  if (typeof window === 'undefined') return null
  if (!polarIceSheet.open) return null

  const overlayToggles: { key: keyof PolarIceSheetState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMassLoss', label: 'Mass Loss', icon: Weight },
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showCalvingRate', label: 'Calving Rate', icon: Mountain },
    { key: 'showStability', label: 'Stability', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SnowflakeIcon3 className="h-4 w-4 text-sky-500" />
              Polar Ice Sheet Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPolarIceSheet({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stability Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Stability
            </Label>
            <Select
              value={polarIceSheet.stabilityFilter}
              onValueChange={(v) =>
                setPolarIceSheet({
                  stabilityFilter: v as PolarIceSheetState['stabilityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stability Levels</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="weakening">Weakening</SelectItem>
                <SelectItem value="destabilizing">Destabilizing</SelectItem>
                <SelectItem value="collapsing">Collapsing</SelectItem>
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
                  <Icon className="h-3 w-3 text-sky-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={polarIceSheet[key] as boolean}
                  onCheckedChange={(checked) => setPolarIceSheet({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Mass Loss</div>
              <div className="text-sm font-semibold text-sky-500">{summary.totalMassLoss}</div>
              <div className="text-[9px] text-muted-foreground">Gt/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Sea Level</div>
              <div className="text-sm font-semibold">{summary.totalSeaLevel}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Collapsing</div>
              <div className="text-sm font-semibold text-red-500">{summary.collapsingCount}</div>
              <div className="text-[9px] text-muted-foreground">sectors</div>
            </div>
          </div>

          <Separator />

          {/* Sheet List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Ice Sheet Sectors ({filteredSheets.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSheets.map((sheet) => {
                  const isActive = polarIceSheet.activeSheetId === sheet.id
                  const stabilityCfg = STABILITY_CONFIG[sheet.stability]
                  return (
                    <div
                      key={sheet.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setPolarIceSheet({
                          activeSheetId: isActive ? null : sheet.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stabilityCfg.color }}
                          />
                          <span className="text-xs font-medium">{sheet.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${stabilityCfg.bgClass}`}
                        >
                          {stabilityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {polarIceSheet.showMassLoss && (
                          <div>
                            Mass Loss:{' '}
                            <span className="text-foreground font-medium">
                              {sheet.massLoss} Gt/yr
                            </span>
                          </div>
                        )}
                        {polarIceSheet.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-foreground font-medium">
                              {sheet.velocity} m/yr
                            </span>
                          </div>
                        )}
                        {polarIceSheet.showCalvingRate && (
                          <div>
                            Calving:{' '}
                            <span className="text-foreground font-medium">
                              {sheet.calvingRate} Gt/yr
                            </span>
                          </div>
                        )}
                        {polarIceSheet.showStability && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {sheet.sheetType.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSheets.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sectors match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Sheet Details */}
          {activeSheet && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-xs font-semibold">{activeSheet.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STABILITY_CONFIG[activeSheet.stability].bgClass}`}
                  >
                    {STABILITY_CONFIG[activeSheet.stability].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSheet.latitude.toFixed(2)}, {activeSheet.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{activeSheet.sheetType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mass Loss: </span>
                    <span className="font-medium">{activeSheet.massLoss} Gt/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area Δ: </span>
                    <span className="font-medium">{activeSheet.areaChange} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Velocity: </span>
                    <span className="font-medium">{activeSheet.velocity} m/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Basal Melt: </span>
                    <span className="font-medium">{activeSheet.basalMelt} Gt/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Calving: </span>
                    <span className="font-medium">{activeSheet.calvingRate} Gt/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sea Level: </span>
                    <span className="font-medium">{activeSheet.seaLevelContribution} mm/yr</span>
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
