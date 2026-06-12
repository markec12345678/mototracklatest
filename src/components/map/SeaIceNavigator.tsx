'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type SeaIceZone } from '@/lib/map-store'
import {
  X,
  Snowflake,
  Compass,
  Ship,
  Filter,
  MapPin,
  Navigation,
} from 'lucide-react'

const ICE_TYPE_COLORS: Record<SeaIceZone['iceType'], string> = {
  new: 'bg-sky-200 text-sky-800 border-sky-300',
  first_year: 'bg-blue-200 text-blue-800 border-blue-300',
  multi_year: 'bg-blue-900 text-blue-100 border-blue-700',
  fast_ice: 'bg-purple-200 text-purple-800 border-purple-300',
}

const ICE_TYPE_LABELS: Record<SeaIceZone['iceType'], string> = {
  new: 'New Ice',
  first_year: 'First Year',
  multi_year: 'Multi-Year',
  fast_ice: 'Fast Ice',
}

export function SeaIceNavigator() {
  const seaIceNavigator = useMapStore((s) => s.seaIceNavigator)
  const setSeaIceNavigator = useMapStore((s) => s.setSeaIceNavigator)

  const sampleZones = useMemo<SeaIceZone[]>(() => [
    {
      id: 'si1',
      name: 'Arctic Ocean Central',
      latitude: 85.0,
      longitude: 0.0,
      iceConcentration: 92,
      iceThickness: 3.8,
      iceType: 'multi_year',
      driftSpeed: 0.12,
      driftDirection: 45,
      navigable: false,
    },
    {
      id: 'si2',
      name: 'Northwest Passage',
      latitude: 74.0,
      longitude: -95.0,
      iceConcentration: 45,
      iceThickness: 1.2,
      iceType: 'first_year',
      driftSpeed: 0.35,
      driftDirection: 120,
      navigable: true,
    },
    {
      id: 'si3',
      name: 'Antarctic Ross Sea',
      latitude: -75.0,
      longitude: 175.0,
      iceConcentration: 78,
      iceThickness: 2.1,
      iceType: 'first_year',
      driftSpeed: 0.22,
      driftDirection: 200,
      navigable: false,
    },
    {
      id: 'si4',
      name: 'Bering Sea',
      latitude: 60.0,
      longitude: -175.0,
      iceConcentration: 30,
      iceThickness: 0.5,
      iceType: 'new',
      driftSpeed: 0.48,
      driftDirection: 310,
      navigable: true,
    },
    {
      id: 'si5',
      name: 'Hudson Bay',
      latitude: 60.0,
      longitude: -85.0,
      iceConcentration: 65,
      iceThickness: 1.5,
      iceType: 'fast_ice',
      driftSpeed: 0.02,
      driftDirection: 0,
      navigable: false,
    },
    {
      id: 'si6',
      name: 'Northeast Passage',
      latitude: 72.0,
      longitude: 100.0,
      iceConcentration: 55,
      iceThickness: 1.8,
      iceType: 'multi_year',
      driftSpeed: 0.18,
      driftDirection: 80,
      navigable: true,
    },
    {
      id: 'si7',
      name: 'Weddell Sea',
      latitude: -72.0,
      longitude: -30.0,
      iceConcentration: 83,
      iceThickness: 2.5,
      iceType: 'fast_ice',
      driftSpeed: 0.05,
      driftDirection: 350,
      navigable: false,
    },
    {
      id: 'si8',
      name: 'Laptev Sea',
      latitude: 76.0,
      longitude: 130.0,
      iceConcentration: 40,
      iceThickness: 0.9,
      iceType: 'new',
      driftSpeed: 0.42,
      driftDirection: 160,
      navigable: true,
    },
  ], [])

  if (typeof window === 'undefined') return null
  if (!seaIceNavigator.open) return null

  const zones = seaIceNavigator.iceZones.length > 0 ? seaIceNavigator.iceZones : sampleZones

  const filteredZones = zones.filter((zone) => {
    if (seaIceNavigator.iceTypeFilter === 'all') return true
    return zone.iceType === seaIceNavigator.iceTypeFilter
  })

  const selectedZone = seaIceNavigator.activeIceZoneId
    ? zones.find((z) => z.id === seaIceNavigator.activeIceZoneId) ?? null
    : null

  const avgConcentration =
    filteredZones.length > 0
      ? filteredZones.reduce((sum, z) => sum + z.iceConcentration, 0) / filteredZones.length
      : 0

  const navigableCount = filteredZones.filter((z) => z.navigable).length

  const thickestIce = filteredZones.length > 0
    ? filteredZones.reduce((max, z) => (z.iceThickness > max.iceThickness ? z : max), filteredZones[0])
    : null

  const toggleButtons = [
    { key: 'showConcentration' as const, label: 'Concentration', icon: Snowflake },
    { key: 'showThickness' as const, label: 'Thickness', icon: MapPin },
    { key: 'showDrift' as const, label: 'Drift', icon: Compass },
    { key: 'showRoutes' as const, label: 'Routes', icon: Ship },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-cyan-500" />
              Sea Ice Navigator
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSeaIceNavigator({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {toggleButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={seaIceNavigator[key] ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-[11px] gap-1"
                onClick={() => setSeaIceNavigator({ [key]: !seaIceNavigator[key] })}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>

          {/* Ice type filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={seaIceNavigator.iceTypeFilter}
              onValueChange={(v) =>
                setSeaIceNavigator({
                  iceTypeFilter: v as SeaIceNavigatorState['iceTypeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter ice type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new">New Ice</SelectItem>
                <SelectItem value="first_year">First Year</SelectItem>
                <SelectItem value="multi_year">Multi-Year</SelectItem>
                <SelectItem value="fast_ice">Fast Ice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Concentration</div>
              <div className="text-sm font-semibold text-cyan-600">{avgConcentration.toFixed(1)}%</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Navigable Routes</div>
              <div className="text-sm font-semibold text-emerald-600">{navigableCount}</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Thickest Ice</div>
              <div className="text-sm font-semibold text-blue-700">
                {thickestIce ? `${thickestIce.iceThickness}m` : '—'}
              </div>
            </div>
          </div>

          {/* Zone list */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">
              Ice Zones ({filteredZones.length})
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {filteredZones.map((zone) => {
                const isActive = seaIceNavigator.activeIceZoneId === zone.id
                return (
                  <div
                    key={zone.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                    }`}
                    onClick={() =>
                      setSeaIceNavigator({
                        activeIceZoneId: isActive ? null : zone.id,
                      })
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate max-w-[180px]">
                        {zone.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${ICE_TYPE_COLORS[zone.iceType]}`}
                        >
                          {ICE_TYPE_LABELS[zone.iceType]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${
                            zone.navigable
                              ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                              : 'border-red-400 text-red-600 bg-red-50'
                          }`}
                        >
                          {zone.navigable ? 'Navigable' : 'Blocked'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                      {seaIceNavigator.showConcentration && (
                        <div>
                          Concentration:{' '}
                          <span className="text-foreground">{zone.iceConcentration}%</span>
                        </div>
                      )}
                      {seaIceNavigator.showThickness && (
                        <div>
                          Thickness:{' '}
                          <span className="text-foreground">{zone.iceThickness}m</span>
                        </div>
                      )}
                      {seaIceNavigator.showDrift && (
                        <>
                          <div>
                            Drift Speed:{' '}
                            <span className="text-foreground">{zone.driftSpeed} m/s</span>
                          </div>
                          <div>
                            Drift Dir:{' '}
                            <span className="text-foreground">{zone.driftDirection}°</span>
                          </div>
                        </>
                      )}
                      {seaIceNavigator.showRoutes && (
                        <div>
                          Route Status:{' '}
                          <span
                            className={
                              zone.navigable ? 'text-emerald-600' : 'text-red-600'
                            }
                          >
                            {zone.navigable ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredZones.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No ice zones match the current filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected zone details */}
          {selectedZone && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-cyan-500" />
                  {selectedZone.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] h-5 ${ICE_TYPE_COLORS[selectedZone.iceType]}`}
                >
                  {ICE_TYPE_LABELS[selectedZone.iceType]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Coordinates</span>
                  <div className="font-mono text-foreground">
                    {selectedZone.latitude.toFixed(2)}°, {selectedZone.longitude.toFixed(2)}°
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Ice Concentration</span>
                  <div className="font-mono text-foreground">{selectedZone.iceConcentration}%</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Ice Thickness</span>
                  <div className="font-mono text-foreground">{selectedZone.iceThickness}m</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Ice Type</span>
                  <div className="text-foreground">{ICE_TYPE_LABELS[selectedZone.iceType]}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Drift Speed</span>
                  <div className="font-mono text-foreground">{selectedZone.driftSpeed} m/s</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground">Drift Direction</span>
                  <div className="font-mono text-foreground">{selectedZone.driftDirection}°</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">Navigability:</span>
                <Badge
                  className={`text-[10px] ${
                    selectedZone.navigable
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-red-100 text-red-700 border-red-300'
                  }`}
                >
                  {selectedZone.navigable ? '✓ Navigable' : '✗ Not Navigable'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type SeaIceNavigatorState = ReturnType<typeof useMapStore.getState>['seaIceNavigator']
