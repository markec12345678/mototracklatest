'use client'

import { useMemo, useEffect } from 'react'
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
import { useMapStore, type GreenlandIceState, type GreenlandIceZone } from '@/lib/map-store'
import { Mountain, X, Snowflake, TrendingDown, Filter, MapPin } from 'lucide-react'

const SAMPLE_ZONES: GreenlandIceZone[] = [
  {
    id: 'gi-1',
    name: 'Petermann Glacier',
    latitude: 80.75,
    longitude: -60.0,
    iceThickness: 2100,
    massBalance: -6.8,
    meltRate: 1.2,
    surfaceVelocity: 1100,
    elevationChange: -0.35,
    zone: 'outlet_glacier',
  },
  {
    id: 'gi-2',
    name: 'Jakobshavn Isbræ',
    latitude: 69.17,
    longitude: -49.5,
    iceThickness: 2600,
    massBalance: -17.0,
    meltRate: 3.1,
    surfaceVelocity: 12600,
    elevationChange: -1.8,
    zone: 'outlet_glacier',
  },
  {
    id: 'gi-3',
    name: 'Helheim Glacier',
    latitude: 66.35,
    longitude: -38.2,
    iceThickness: 1800,
    massBalance: -8.5,
    meltRate: 2.4,
    surfaceVelocity: 8000,
    elevationChange: -1.1,
    zone: 'outlet_glacier',
  },
  {
    id: 'gi-4',
    name: 'Kangerdlugssuaq',
    latitude: 68.65,
    longitude: -33.0,
    iceThickness: 1900,
    massBalance: -5.2,
    meltRate: 1.8,
    surfaceVelocity: 6500,
    elevationChange: -0.7,
    zone: 'outlet_glacier',
  },
  {
    id: 'gi-5',
    name: 'NEGIS',
    latitude: 75.5,
    longitude: -28.0,
    iceThickness: 3100,
    massBalance: -3.4,
    meltRate: 0.5,
    surfaceVelocity: 560,
    elevationChange: -0.15,
    zone: 'accumulation',
  },
  {
    id: 'gi-6',
    name: 'Zachariae Isstrøm',
    latitude: 78.9,
    longitude: -20.5,
    iceThickness: 2200,
    massBalance: -10.1,
    meltRate: 2.8,
    surfaceVelocity: 2100,
    elevationChange: -1.4,
    zone: 'outlet_glacier',
  },
  {
    id: 'gi-7',
    name: 'Saddle Region South',
    latitude: 67.0,
    longitude: -44.0,
    iceThickness: 1500,
    massBalance: -2.1,
    meltRate: 1.0,
    surfaceVelocity: 45,
    elevationChange: -0.25,
    zone: 'percolation',
  },
  {
    id: 'gi-8',
    name: 'Western Melt Zone',
    latitude: 69.0,
    longitude: -52.0,
    iceThickness: 1200,
    massBalance: -4.3,
    meltRate: 2.2,
    surfaceVelocity: 120,
    elevationChange: -0.65,
    zone: 'bare_ice',
  },
  {
    id: 'gi-9',
    name: 'Southern Wet Snow',
    latitude: 64.0,
    longitude: -46.0,
    iceThickness: 800,
    massBalance: -1.8,
    meltRate: 1.5,
    surfaceVelocity: 30,
    elevationChange: -0.4,
    zone: 'wet_snow',
  },
]

const ZONE_COLORS: Record<GreenlandIceZone['zone'], string> = {
  accumulation: '#3b82f6',
  percolation: '#06b6d4',
  wet_snow: '#22c55e',
  bare_ice: '#eab308',
  outlet_glacier: '#ef4444',
}

const ZONE_BG_COLORS: Record<GreenlandIceZone['zone'], string> = {
  accumulation: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  percolation: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30',
  wet_snow: 'bg-green-500/15 text-green-600 border-green-500/30',
  bare_ice: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
  outlet_glacier: 'bg-red-500/15 text-red-600 border-red-500/30',
}

const ZONE_LABELS: Record<GreenlandIceZone['zone'], string> = {
  accumulation: 'Accumulation',
  percolation: 'Percolation',
  wet_snow: 'Wet Snow',
  bare_ice: 'Bare Ice',
  outlet_glacier: 'Outlet Glacier',
}

const FILTER_OPTIONS: { value: GreenlandIceState['zoneFilter']; label: string }[] = [
  { value: 'all', label: 'All Zones' },
  { value: 'accumulation', label: 'Accumulation' },
  { value: 'percolation', label: 'Percolation' },
  { value: 'wet_snow', label: 'Wet Snow' },
  { value: 'bare_ice', label: 'Bare Ice' },
  { value: 'outlet_glacier', label: 'Outlet Glacier' },
]

export function GreenlandIceTracker() {
  const greenlandIce = useMapStore((s) => s.greenlandIce)
  const setGreenlandIce = useMapStore((s) => s.setGreenlandIce)

  // Initialize sample data if empty
  useEffect(() => {
    if (greenlandIce.iceZones.length === 0) {
      setGreenlandIce({ iceZones: SAMPLE_ZONES })
    }
  }, [greenlandIce.iceZones.length, setGreenlandIce])

  const zones = greenlandIce.iceZones.length > 0 ? greenlandIce.iceZones : SAMPLE_ZONES

  const filteredZones = useMemo(() => {
    if (greenlandIce.zoneFilter === 'all') return zones
    return zones.filter((z) => z.zone === greenlandIce.zoneFilter)
  }, [zones, greenlandIce.zoneFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgThickness: 0, totalMassBalanceLoss: 0, maxVelocity: 0 }
    }
    const avgThickness =
      filteredZones.reduce((sum, z) => sum + z.iceThickness, 0) / filteredZones.length
    const totalMassBalanceLoss = filteredZones.reduce(
      (sum, z) => sum + Math.abs(z.massBalance),
      0
    )
    const maxVelocity = Math.max(...filteredZones.map((z) => z.surfaceVelocity))
    return { avgThickness, totalMassBalanceLoss, maxVelocity }
  }, [filteredZones])

  const activeZone = useMemo(() => {
    if (!greenlandIce.activeZoneId) return null
    return zones.find((z) => z.id === greenlandIce.activeZoneId) ?? null
  }, [zones, greenlandIce.activeZoneId])

  if (typeof window === 'undefined') return null
  if (!greenlandIce.open) return null

  const toggleKeys = [
    { key: 'showThickness' as const, label: 'Thickness', icon: Mountain },
    { key: 'showMassBalance' as const, label: 'Mass Balance', icon: TrendingDown },
    { key: 'showMeltRate' as const, label: 'Melt Rate', icon: Snowflake },
    { key: 'showVelocity' as const, label: 'Velocity', icon: MapPin },
  ]

  return (
    <div className="absolute top-4 right-4 z-50 w-[380px] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <Card className="shadow-lg border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="size-5 text-cyan-500" />
              <CardTitle className="text-base">Greenland Ice Sheet Tracker</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setGreenlandIce({ open: false })}
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Zone Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground shrink-0" />
            <Select
              value={greenlandIce.zoneFilter}
              onValueChange={(value) =>
                setGreenlandIce({ zoneFilter: value as GreenlandIceState['zoneFilter'] })
              }
            >
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="Filter zones" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-1.5">
            {toggleKeys.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={greenlandIce[key] ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setGreenlandIce({ [key]: !greenlandIce[key] })}
              >
                <Icon className="size-3" />
                {label}
              </Button>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Thickness</div>
              <div className="text-sm font-semibold">
                {summary.avgThickness.toLocaleString('en', { maximumFractionDigits: 0 })} m
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Mass Loss</div>
              <div className="text-sm font-semibold text-red-500">
                -{summary.totalMassBalanceLoss.toFixed(1)} Gt/yr
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Velocity</div>
              <div className="text-sm font-semibold">
                {summary.maxVelocity.toLocaleString()} m/yr
              </div>
            </div>
          </div>

          {/* Active Zone Detail */}
          {activeZone && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{activeZone.name}</span>
                <Badge
                  variant="outline"
                  className={ZONE_BG_COLORS[activeZone.zone]}
                >
                  {ZONE_LABELS[activeZone.zone]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lat</span>
                  <span>{activeZone.latitude.toFixed(2)}°N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lon</span>
                  <span>{Math.abs(activeZone.longitude).toFixed(2)}°W</span>
                </div>
                {greenlandIce.showThickness && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thickness</span>
                    <span>{activeZone.iceThickness.toLocaleString()} m</span>
                  </div>
                )}
                {greenlandIce.showMassBalance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mass Balance</span>
                    <span className="text-red-500">{activeZone.massBalance} Gt/yr</span>
                  </div>
                )}
                {greenlandIce.showMeltRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Melt Rate</span>
                    <span>{activeZone.meltRate} m/yr</span>
                  </div>
                )}
                {greenlandIce.showVelocity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Velocity</span>
                    <span>{activeZone.surfaceVelocity.toLocaleString()} m/yr</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elev. Change</span>
                  <span className="text-red-500">{activeZone.elevationChange} m/yr</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs w-full mt-1"
                onClick={() => setGreenlandIce({ activeZoneId: null })}
              >
                Deselect
              </Button>
            </div>
          )}

          {/* Zone List */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {filteredZones.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">
                No zones match the current filter.
              </div>
            )}
            {filteredZones.map((zone) => {
              const isActive = greenlandIce.activeZoneId === zone.id
              const dotColor = ZONE_COLORS[zone.zone]
              return (
                <button
                  key={zone.id}
                  className={`w-full text-left rounded-lg border p-2.5 transition-colors hover:bg-muted/60 cursor-pointer ${
                    isActive ? 'border-cyan-500/60 bg-cyan-500/5' : 'border-transparent'
                  }`}
                  onClick={() =>
                    setGreenlandIce({
                      activeZoneId: isActive ? null : zone.id,
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-sm font-medium truncate">{zone.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 shrink-0 ${ZONE_BG_COLORS[zone.zone]}`}
                    >
                      {ZONE_LABELS[zone.zone]}
                    </Badge>
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    {greenlandIce.showThickness && (
                      <span>
                        <Mountain className="size-3 inline mr-0.5 -mt-0.5" />
                        {zone.iceThickness.toLocaleString()} m
                      </span>
                    )}
                    {greenlandIce.showMassBalance && (
                      <span>
                        <TrendingDown className="size-3 inline mr-0.5 -mt-0.5" />
                        {zone.massBalance} Gt/yr
                      </span>
                    )}
                    {greenlandIce.showMeltRate && (
                      <span>
                        <Snowflake className="size-3 inline mr-0.5 -mt-0.5" />
                        {zone.meltRate} m/yr
                      </span>
                    )}
                    {greenlandIce.showVelocity && (
                      <span>
                        <MapPin className="size-3 inline mr-0.5 -mt-0.5" />
                        {zone.surfaceVelocity.toLocaleString()} m/yr
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Elev. change: <span className="text-red-500">{zone.elevationChange} m/yr</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
