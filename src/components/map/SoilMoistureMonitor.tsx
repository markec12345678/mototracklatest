'use client'

import { useMemo, useState } from 'react'
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
import { useMapStore, type SoilMoistureState, type SoilMoistureZone } from '@/lib/map-store'
import {
  Droplets,
  X,
  Filter,
  MapPin,
  Thermometer,
} from 'lucide-react'

const MOISTURE_FILTER_COLORS: Record<SoilMoistureState['moistureFilter'], string> = {
  all: '#9ca3af',
  dry: '#ef4444',
  moderate: '#eab308',
  wet: '#22c55e',
  saturated: '#3b82f6',
}

const MOISTURE_FILTER_LABELS: Record<SoilMoistureState['moistureFilter'], string> = {
  all: 'All',
  dry: 'Dry',
  moderate: 'Moderate',
  wet: 'Wet',
  saturated: 'Saturated',
}

const FILTER_OPTIONS: { value: SoilMoistureState['moistureFilter']; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'dry', label: 'Dry (< 25%)' },
  { value: 'moderate', label: 'Moderate (25-50%)' },
  { value: 'wet', label: 'Wet (50-75%)' },
  { value: 'saturated', label: 'Saturated (> 75%)' },
]

function getMoistureCategory(moisture: number): SoilMoistureState['moistureFilter'] {
  if (moisture < 25) return 'dry'
  if (moisture < 50) return 'moderate'
  if (moisture < 75) return 'wet'
  return 'saturated'
}

function getMoistureColor(moisture: number): string {
  const category = getMoistureCategory(moisture)
  return MOISTURE_FILTER_COLORS[category]
}

function generateSampleZones(): SoilMoistureZone[] {
  return [
    {
      id: 'sm1',
      name: 'Iowa Farmland',
      latitude: 42.03,
      longitude: -93.46,
      moistureLevel: 38,
      fieldCapacity: 45,
      wiltingPoint: 12,
      soilType: 'Loam',
      depth: 30,
      irrigationNeeded: true,
    },
    {
      id: 'sm2',
      name: 'Sahel Region',
      latitude: 14.5,
      longitude: 2.1,
      moistureLevel: 12,
      fieldCapacity: 28,
      wiltingPoint: 8,
      soilType: 'Sandy',
      depth: 20,
      irrigationNeeded: true,
    },
    {
      id: 'sm3',
      name: 'Punjab Agricultural Zone',
      latitude: 31.15,
      longitude: 75.34,
      moistureLevel: 55,
      fieldCapacity: 52,
      wiltingPoint: 15,
      soilType: 'Clay Loam',
      depth: 45,
      irrigationNeeded: false,
    },
    {
      id: 'sm4',
      name: 'Pampas - Buenos Aires',
      latitude: -34.6,
      longitude: -58.38,
      moistureLevel: 68,
      fieldCapacity: 58,
      wiltingPoint: 18,
      soilType: 'Silt Loam',
      depth: 50,
      irrigationNeeded: false,
    },
    {
      id: 'sm5',
      name: 'Murray-Darling Basin',
      latitude: -33.87,
      longitude: 145.37,
      moistureLevel: 22,
      fieldCapacity: 38,
      wiltingPoint: 10,
      soilType: 'Sandy Loam',
      depth: 25,
      irrigationNeeded: true,
    },
    {
      id: 'sm6',
      name: 'Nile Delta Farmland',
      latitude: 30.86,
      longitude: 31.0,
      moistureLevel: 82,
      fieldCapacity: 62,
      wiltingPoint: 20,
      soilType: 'Clay',
      depth: 60,
      irrigationNeeded: false,
    },
    {
      id: 'sm7',
      name: 'Central Valley - California',
      latitude: 36.74,
      longitude: -119.78,
      moistureLevel: 18,
      fieldCapacity: 40,
      wiltingPoint: 11,
      soilType: 'Sandy Loam',
      depth: 35,
      irrigationNeeded: true,
    },
    {
      id: 'sm8',
      name: 'Mekong Delta',
      latitude: 10.02,
      longitude: 105.78,
      moistureLevel: 91,
      fieldCapacity: 70,
      wiltingPoint: 25,
      soilType: 'Clay',
      depth: 55,
      irrigationNeeded: false,
    },
  ]
}

type StoreSoilMoisture = ReturnType<typeof useMapStore.getState>['soilMoisture']

export function SoilMoistureMonitor() {
  const soilMoisture = useMapStore((s) => s.soilMoisture)
  const setSoilMoisture = useMapStore((s) => s.setSoilMoisture)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleZones = useMemo(() => generateSampleZones(), [])

  const zones = soilMoisture.soilZones.length > 0 ? soilMoisture.soilZones : sampleZones

  const filteredZones = useMemo(() => {
    if (soilMoisture.moistureFilter === 'all') return zones
    return zones.filter((z) => getMoistureCategory(z.moistureLevel) === soilMoisture.moistureFilter)
  }, [zones, soilMoisture.moistureFilter])

  const activeSoilZoneId = soilMoisture.activeSoilZoneId ?? selectedId

  const selectedZone = useMemo(() => {
    if (!activeSoilZoneId) return null
    return zones.find((z) => z.id === activeSoilZoneId) ?? null
  }, [zones, activeSoilZoneId])

  const stats = useMemo(() => {
    const avgMoisture = zones.reduce((sum, z) => sum + z.moistureLevel, 0) / zones.length
    const irrigationNeeded = zones.filter((z) => z.irrigationNeeded).length
    const driestZone = zones.reduce((min, z) => (z.moistureLevel < min.moistureLevel ? z : min), zones[0])
    return {
      avgMoisture: avgMoisture.toFixed(1),
      irrigationNeeded,
      driestZone: driestZone?.name ?? 'N/A',
    }
  }, [zones])

  const toggles: { key: keyof Pick<StoreSoilMoisture, 'showMoisture' | 'showDepth' | 'showIrrigation' | 'showSoilType'>; label: string; icon: React.ElementType }[] = [
    { key: 'showMoisture', label: 'Moisture', icon: Droplets },
    { key: 'showDepth', label: 'Depth', icon: MapPin },
    { key: 'showIrrigation', label: 'Irrigation', icon: Thermometer },
    { key: 'showSoilType', label: 'Soil Type', icon: Filter },
  ]

  if (typeof window === 'undefined') return null
  if (!soilMoisture.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Soil Moisture Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoilMoisture({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-cyan-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-cyan-600">{stats.avgMoisture}%</div>
              <div className="text-[10px] text-muted-foreground">Avg Moisture</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-orange-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-orange-500">{stats.irrigationNeeded}</div>
              <div className="text-[10px] text-muted-foreground">Irrigation Needed</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-red-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-red-500 text-[11px] leading-6">{stats.driestZone}</div>
              <div className="text-[10px] text-muted-foreground">Driest Zone</div>
            </div>
          </div>

          {/* Moisture filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={soilMoisture.moistureFilter}
              onValueChange={(v) =>
                setSoilMoisture({
                  moistureFilter: v as SoilMoistureState['moistureFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter moisture" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {toggles.map(({ key, label, icon: Icon }) => {
              const active = soilMoisture[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setSoilMoisture({ [key]: !active })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              )
            })}
          </div>

          {/* Soil zones list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium">
              Soil Zones ({filteredZones.length})
            </div>
            <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredZones.map((zone) => {
                const isActive = activeSoilZoneId === zone.id
                const moistureColor = getMoistureColor(zone.moistureLevel)
                const moistureCategory = getMoistureCategory(zone.moistureLevel)
                return (
                  <div
                    key={zone.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : zone.id
                      setSelectedId(newId)
                      setSoilMoisture({ activeSoilZoneId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{zone.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {soilMoisture.showIrrigation && zone.irrigationNeeded && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-orange-500 text-orange-500 bg-orange-500/10"
                          >
                            <Droplets className="h-2.5 w-2.5 mr-0.5" />
                            IRRIGATE
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{
                            borderColor: moistureColor,
                            color: moistureColor,
                          }}
                        >
                          {MOISTURE_FILTER_LABELS[moistureCategory]}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {soilMoisture.showMoisture && (
                        <div>
                          Moisture:{' '}
                          <span className="text-foreground font-medium" style={{ color: moistureColor }}>
                            {zone.moistureLevel}%
                          </span>
                        </div>
                      )}
                      {soilMoisture.showSoilType && (
                        <div>
                          Soil:{' '}
                          <span className="text-foreground">{zone.soilType}</span>
                        </div>
                      )}
                      {soilMoisture.showDepth && (
                        <div>
                          Depth:{' '}
                          <span className="text-foreground">{zone.depth} cm</span>
                        </div>
                      )}
                      {!soilMoisture.showMoisture && !soilMoisture.showSoilType && !soilMoisture.showDepth && (
                        <>
                          <div>
                            Moisture:{' '}
                            <span className="text-foreground font-medium" style={{ color: moistureColor }}>
                              {zone.moistureLevel}%
                            </span>
                          </div>
                          <div>
                            Soil:{' '}
                            <span className="text-foreground">{zone.soilType}</span>
                          </div>
                          <div>
                            Depth:{' '}
                            <span className="text-foreground">{zone.depth} cm</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredZones.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No zones match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Selected zone details */}
          {selectedZone && (
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-cyan-500" />
                  {selectedZone.name}
                </div>
                <Badge
                  className="text-[10px] h-5 text-white border-0"
                  style={{ backgroundColor: getMoistureColor(selectedZone.moistureLevel) }}
                >
                  {MOISTURE_FILTER_LABELS[getMoistureCategory(selectedZone.moistureLevel)]}
                </Badge>
              </div>

              {/* Moisture bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Moisture Level</span>
                  <span className="font-bold" style={{ color: getMoistureColor(selectedZone.moistureLevel) }}>
                    {selectedZone.moistureLevel}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedZone.moistureLevel}%`,
                      backgroundColor: getMoistureColor(selectedZone.moistureLevel),
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-cyan-500" />
                  <span className="text-muted-foreground">Field Capacity:</span>
                  <span className="font-medium">{selectedZone.fieldCapacity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Wilting Point:</span>
                  <span className="font-medium">{selectedZone.wiltingPoint}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Soil Type:</span>
                  <span className="font-medium">{selectedZone.soilType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">Depth:</span>
                  <span className="font-medium">{selectedZone.depth} cm</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedZone.latitude.toFixed(2)}, {selectedZone.longitude.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  {selectedZone.irrigationNeeded ? (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-orange-500 text-orange-500 bg-orange-500/10">
                      <Droplets className="h-2.5 w-2.5 mr-0.5" />
                      Irrigation Needed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-green-500 text-green-500 bg-green-500/10">
                      No Irrigation Needed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
