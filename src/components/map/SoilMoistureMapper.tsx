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
import { useMapStore, type SoilMoistureAgState, type SoilMoistureAgZone } from '@/lib/map-store'
import { Droplets as DropletsIcon2, X, MapPin, Thermometer, Droplet, Layers, Filter } from 'lucide-react'

const DEMO_ZONES: SoilMoistureAgZone[] = [
  {
    id: 'sm-iowa',
    name: 'Iowa Corn Belt',
    latitude: 42.03,
    longitude: -93.47,
    moisturePercent: 68,
    soilType: 'loam',
    temperature: 22,
    precipitation: 850,
    droughtIndex: 0.35,
    landUse: 'agriculture',
  },
  {
    id: 'sm-punjab',
    name: 'Punjab',
    latitude: 31.15,
    longitude: 75.34,
    moisturePercent: 42,
    soilType: 'clay',
    temperature: 34,
    precipitation: 520,
    droughtIndex: 0.72,
    landUse: 'agriculture',
  },
  {
    id: 'sm-sahel',
    name: 'Sahel Region',
    latitude: 13.50,
    longitude: 2.11,
    moisturePercent: 18,
    soilType: 'sand',
    temperature: 38,
    precipitation: 210,
    droughtIndex: 0.91,
    landUse: 'grassland',
  },
  {
    id: 'sm-mato-grosso',
    name: 'Mato Grosso',
    latitude: -12.64,
    longitude: -55.42,
    moisturePercent: 74,
    soilType: 'clay',
    temperature: 28,
    precipitation: 1420,
    droughtIndex: 0.15,
    landUse: 'forest',
  },
  {
    id: 'sm-ukraine',
    name: 'Ukrainian Steppe',
    latitude: 48.38,
    longitude: 31.17,
    moisturePercent: 55,
    soilType: 'loam',
    temperature: 18,
    precipitation: 480,
    droughtIndex: 0.48,
    landUse: 'agriculture',
  },
  {
    id: 'sm-murray-darling',
    name: 'Murray-Darling Basin',
    latitude: -34.25,
    longitude: 143.55,
    moisturePercent: 28,
    soilType: 'silt',
    temperature: 30,
    precipitation: 340,
    droughtIndex: 0.82,
    landUse: 'grassland',
  },
]

const LAND_USE_CONFIG: Record<
  SoilMoistureAgZone['landUse'],
  { label: string; color: string; bgClass: string }
> = {
  agriculture: { label: 'Agriculture', color: '#92400e', bgClass: 'bg-amber-700/10 text-amber-800 border-amber-700/30' },
  forest: { label: 'Forest', color: '#166534', bgClass: 'bg-green-700/10 text-green-800 border-green-700/30' },
  urban: { label: 'Urban', color: '#57534e', bgClass: 'bg-stone-600/10 text-stone-700 border-stone-600/30' },
  grassland: { label: 'Grassland', color: '#a16207', bgClass: 'bg-yellow-700/10 text-yellow-800 border-yellow-700/30' },
  wetland: { label: 'Wetland', color: '#0e7490', bgClass: 'bg-cyan-700/10 text-cyan-800 border-cyan-700/30' },
}

const SOIL_TYPE_CONFIG: Record<
  SoilMoistureAgZone['soilType'],
  { label: string; color: string }
> = {
  clay: { label: 'Clay', color: '#92400e' },
  silt: { label: 'Silt', color: '#b45309' },
  sand: { label: 'Sand', color: '#d97706' },
  loam: { label: 'Loam', color: '#78350f' },
  peat: { label: 'Peat', color: '#451a03' },
}

function getDroughtColor(droughtIndex: number): string {
  if (droughtIndex >= 0.8) return '#dc2626'
  if (droughtIndex >= 0.6) return '#ea580c'
  if (droughtIndex >= 0.4) return '#eab308'
  if (droughtIndex >= 0.2) return '#84cc16'
  return '#22c55e'
}

function getDroughtLabel(droughtIndex: number): string {
  if (droughtIndex >= 0.8) return 'Extreme'
  if (droughtIndex >= 0.6) return 'Severe'
  if (droughtIndex >= 0.4) return 'Moderate'
  if (droughtIndex >= 0.2) return 'Mild'
  return 'None'
}

export function SoilMoistureMapper() {
  const soilMoistureAg = useMapStore((s) => s.soilMoistureAg)
  const setSoilMoistureAg = useMapStore((s) => s.setSoilMoistureAg)

  const zones = useMemo(
    () => (soilMoistureAg.zones.length > 0 ? soilMoistureAg.zones : DEMO_ZONES),
    [soilMoistureAg.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (soilMoistureAg.landUseFilter !== 'all' && z.landUse !== soilMoistureAg.landUseFilter) return false
      return true
    })
  }, [zones, soilMoistureAg.landUseFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgMoisture: 0, avgDrought: 0, dryZones: 0 }
    }
    const avgMoisture = Math.round(filteredZones.reduce((sum, z) => sum + z.moisturePercent, 0) / filteredZones.length)
    const avgDrought = Math.round((filteredZones.reduce((sum, z) => sum + z.droughtIndex, 0) / filteredZones.length) * 100) / 100
    const dryZones = filteredZones.filter((z) => z.moisturePercent < 30).length
    return { avgMoisture, avgDrought, dryZones }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === soilMoistureAg.activeZoneId) ?? null,
    [zones, soilMoistureAg.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!soilMoistureAg.open) return null

  const overlayToggles: { key: keyof SoilMoistureAgState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMoisture', label: 'Moisture', icon: DropletsIcon2 },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showDroughtIndex', label: 'Drought Index', icon: Droplet },
    { key: 'showSoilType', label: 'Soil Type', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletsIcon2 className="h-4 w-4 text-amber-700" />
              Soil Moisture Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoilMoistureAg({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Land Use Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Land Use Type
            </Label>
            <Select
              value={soilMoistureAg.landUseFilter}
              onValueChange={(v) =>
                setSoilMoistureAg({
                  landUseFilter: v as SoilMoistureAgState['landUseFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Land Uses</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="urban">Urban</SelectItem>
                <SelectItem value="grassland">Grassland</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
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
                  <Icon className="h-3 w-3 text-amber-700" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={soilMoistureAg[key] as boolean}
                  onCheckedChange={(checked) => setSoilMoistureAg({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Moisture</div>
              <div className="text-sm font-semibold text-amber-700">{summary.avgMoisture}%</div>
              <div className="text-[9px] text-muted-foreground">volumetric</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Drought</div>
              <div className="text-sm font-semibold" style={{ color: getDroughtColor(summary.avgDrought) }}>
                {summary.avgDrought}
              </div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Dry Zones</div>
              <div className="text-sm font-semibold text-red-600">{summary.dryZones}</div>
              <div className="text-[9px] text-muted-foreground">&lt;30% moisture</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = soilMoistureAg.activeZoneId === zone.id
                  const landUseCfg = LAND_USE_CONFIG[zone.landUse]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-700/50 bg-amber-700/5'
                          : 'border-border/40 hover:border-amber-700/20 hover:bg-amber-700/5'
                      }`}
                      onClick={() =>
                        setSoilMoistureAg({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: SOIL_TYPE_CONFIG[zone.soilType].color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${landUseCfg.bgClass}`}
                        >
                          {landUseCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {soilMoistureAg.showMoisture && (
                          <div>
                            Moisture:{' '}
                            <span className="text-foreground font-medium">
                              {zone.moisturePercent}%
                            </span>
                          </div>
                        )}
                        {soilMoistureAg.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {zone.temperature}°C
                            </span>
                          </div>
                        )}
                        {soilMoistureAg.showDroughtIndex && (
                          <div>
                            Drought:{' '}
                            <span className="font-medium" style={{ color: getDroughtColor(zone.droughtIndex) }}>
                              {zone.droughtIndex} ({getDroughtLabel(zone.droughtIndex)})
                            </span>
                          </div>
                        )}
                        {soilMoistureAg.showSoilType && (
                          <div>
                            Soil:{' '}
                            <span className="text-foreground font-medium">
                              {SOIL_TYPE_CONFIG[zone.soilType].label}
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
              <div className="space-y-2 rounded-lg border border-amber-700/20 bg-amber-700/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-700" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${LAND_USE_CONFIG[activeZone.landUse].bgClass}`}
                  >
                    {LAND_USE_CONFIG[activeZone.landUse].label}
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
                    <span className="text-muted-foreground">Moisture: </span>
                    <span className="font-medium">{activeZone.moisturePercent}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature: </span>
                    <span className="font-medium">{activeZone.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Precipitation: </span>
                    <span className="font-medium">{activeZone.precipitation} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Soil Type: </span>
                    <span className="font-medium">{SOIL_TYPE_CONFIG[activeZone.soilType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Drought Index: </span>
                    <span className="font-medium" style={{ color: getDroughtColor(activeZone.droughtIndex) }}>
                      {activeZone.droughtIndex} ({getDroughtLabel(activeZone.droughtIndex)})
                    </span>
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
