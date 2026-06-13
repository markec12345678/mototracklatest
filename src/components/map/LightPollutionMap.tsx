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
import { useMapStore, type LightPollutionState, type LightPollutionZone } from '@/lib/map-store'
import {
  Moon,
  X,
  Star,
  Eye,
  Filter,
  MapPin,
} from 'lucide-react'

const BORTLE_COLORS: Record<number, string> = {
  1: '#1e3a5f',
  2: '#1e3a5f',
  3: '#22c55e',
  4: '#22c55e',
  5: '#eab308',
  6: '#eab308',
  7: '#f97316',
  8: '#f97316',
  9: '#ef4444',
}

const BORTLE_LABELS: Record<number, string> = {
  1: 'Class 1',
  2: 'Class 2',
  3: 'Class 3',
  4: 'Class 4',
  5: 'Class 5',
  6: 'Class 6',
  7: 'Class 7',
  8: 'Class 8',
  9: 'Class 9',
}

const BORTLE_DESCRIPTIONS: Record<number, string> = {
  1: 'Excellent dark-sky site',
  2: 'Typical truly dark site',
  3: 'Rural sky',
  4: 'Rural/suburban transition',
  5: 'Suburban sky',
  6: 'Bright suburban sky',
  7: 'Suburban/urban transition',
  8: 'City sky',
  9: 'Inner-city sky',
}

const FILTER_OPTIONS: { value: LightPollutionState['bortleFilter']; label: string }[] = [
  { value: 'all', label: 'All Bortle Classes' },
  { value: 'excellent', label: 'Excellent (1-2)' },
  { value: 'good', label: 'Good (3-4)' },
  { value: 'moderate', label: 'Moderate (5-6)' },
  { value: 'poor', label: 'Poor (7-8)' },
  { value: 'very_poor', label: 'Very Poor (9)' },
]

function bortleToFilter(bortle: number): LightPollutionState['bortleFilter'] {
  if (bortle <= 2) return 'excellent'
  if (bortle <= 4) return 'good'
  if (bortle <= 6) return 'moderate'
  if (bortle <= 8) return 'poor'
  return 'very_poor'
}

function generateSampleZones(): LightPollutionZone[] {
  return [
    {
      id: 'lp1',
      name: 'Atacama Desert, Chile',
      latitude: -24.0,
      longitude: -69.5,
      brightness: 22.0,
      bortleClass: 1,
      limitingMagnitude: 7.6,
      lightSource: 'None (natural darkness)',
      visibleStars: 15000,
      milkyWayVisible: true,
    },
    {
      id: 'lp2',
      name: 'Aoraki Mackenzie, NZ',
      latitude: -43.88,
      longitude: 170.47,
      brightness: 21.8,
      bortleClass: 1,
      limitingMagnitude: 7.4,
      lightSource: 'Minimal village lights',
      visibleStars: 14000,
      milkyWayVisible: true,
    },
    {
      id: 'lp3',
      name: 'Death Valley, USA',
      latitude: 36.51,
      longitude: -117.08,
      brightness: 21.5,
      bortleClass: 2,
      limitingMagnitude: 7.1,
      lightSource: 'Distant Las Vegas glow',
      visibleStars: 12000,
      milkyWayVisible: true,
    },
    {
      id: 'lp4',
      name: 'Rural Mongolia',
      latitude: 46.5,
      longitude: 105.0,
      brightness: 21.6,
      bortleClass: 2,
      limitingMagnitude: 7.2,
      lightSource: 'Ger camp lanterns',
      visibleStars: 12500,
      milkyWayVisible: true,
    },
    {
      id: 'lp5',
      name: 'Joshua Tree, USA',
      latitude: 33.87,
      longitude: -115.9,
      brightness: 20.8,
      bortleClass: 3,
      limitingMagnitude: 6.6,
      lightSource: 'Southern California cities',
      visibleStars: 8000,
      milkyWayVisible: true,
    },
    {
      id: 'lp6',
      name: 'Brecon Beacons, Wales',
      latitude: 51.88,
      longitude: -3.44,
      brightness: 20.3,
      bortleClass: 4,
      limitingMagnitude: 6.1,
      lightSource: 'Nearby towns',
      visibleStars: 5500,
      milkyWayVisible: true,
    },
    {
      id: 'lp7',
      name: 'Tokyo, Japan',
      latitude: 35.68,
      longitude: 139.69,
      brightness: 17.2,
      bortleClass: 9,
      limitingMagnitude: 3.5,
      lightSource: 'Megacity light dome',
      visibleStars: 120,
      milkyWayVisible: false,
    },
    {
      id: 'lp8',
      name: 'New York City, USA',
      latitude: 40.71,
      longitude: -74.0,
      brightness: 16.8,
      bortleClass: 9,
      limitingMagnitude: 3.2,
      lightSource: 'Urban skyglow',
      visibleStars: 90,
      milkyWayVisible: false,
    },
  ]
}

type StoreLightPollution = ReturnType<typeof useMapStore.getState>['lightPollution']

export function LightPollutionMap() {
  const lightPollution = useMapStore((s) => s.lightPollution)
  const setLightPollution = useMapStore((s) => s.setLightPollution)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sampleZones = useMemo(() => generateSampleZones(), [])

  const zones = lightPollution.lightZones.length > 0 ? lightPollution.lightZones : sampleZones

  const filteredZones = useMemo(() => {
    if (lightPollution.bortleFilter === 'all') return zones
    return zones.filter((z) => bortleToFilter(z.bortleClass) === lightPollution.bortleFilter)
  }, [zones, lightPollution.bortleFilter])

  const activeZoneId = lightPollution.activeLightZoneId ?? selectedId

  const selectedZone = useMemo(() => {
    if (!activeZoneId) return null
    return zones.find((z) => z.id === activeZoneId) ?? null
  }, [zones, activeZoneId])

  const stats = useMemo(() => {
    const sortedByBortle = [...zones].sort((a, b) => a.bortleClass - b.bortleClass)
    const bestSite = sortedByBortle[0]
    const avgBortle = zones.reduce((sum, z) => sum + z.bortleClass, 0) / zones.length
    const milkyWayCount = zones.filter((z) => z.milkyWayVisible).length
    return {
      bestSite: bestSite?.name ?? 'N/A',
      avgBortle: avgBortle.toFixed(1),
      milkyWayCount,
    }
  }, [zones])

  const toggles: { key: keyof Pick<StoreLightPollution, 'showBrightness' | 'showBortle' | 'showStars' | 'showMilkyWay'>; label: string; icon: React.ElementType }[] = [
    { key: 'showBrightness', label: 'Brightness', icon: Moon },
    { key: 'showBortle', label: 'Bortle', icon: Eye },
    { key: 'showStars', label: 'Stars', icon: Star },
    { key: 'showMilkyWay', label: 'Milky Way', icon: MapPin },
  ]

  if (typeof window === 'undefined') return null
  if (!lightPollution.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[440px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              Light Pollution Map
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setLightPollution({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 bg-indigo-500/5 p-2.5 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Best Dark Sky</div>
              <div className="text-[10px] font-bold text-indigo-400 truncate" title={stats.bestSite}>
                {stats.bestSite}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 bg-emerald-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-emerald-600">{stats.avgBortle}</div>
              <div className="text-[10px] text-muted-foreground">Avg Bortle</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-amber-500/5 p-2.5 text-center">
              <div className="text-lg font-bold text-amber-600">{stats.milkyWayCount}</div>
              <div className="text-[10px] text-muted-foreground">Milky Way Visible</div>
            </div>
          </div>

          {/* Bortle filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select
              value={lightPollution.bortleFilter}
              onValueChange={(v) =>
                setLightPollution({
                  bortleFilter: v as LightPollutionState['bortleFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Filter Bortle class" />
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
              const active = lightPollution[key]
              return (
                <Button
                  key={key}
                  variant={active ? 'default' : 'outline'}
                  size="sm"
                  className={`h-7 text-[10px] gap-1 ${
                    active
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setLightPollution({ [key]: !active })}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              )
            })}
          </div>

          {/* Zone list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium">
              Light Pollution Zones ({filteredZones.length})
            </div>
            <div className="max-h-[240px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredZones.map((zone) => {
                const isActive = activeZoneId === zone.id
                const bortleColor = BORTLE_COLORS[zone.bortleClass]
                return (
                  <div
                    key={zone.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-500/50 bg-indigo-500/5'
                        : 'border-border/40 hover:border-indigo-500/20 hover:bg-indigo-500/5'
                    }`}
                    onClick={() => {
                      const newId = isActive ? null : zone.id
                      setSelectedId(newId)
                      setLightPollution({ activeLightZoneId: newId })
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium truncate mr-2">{zone.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {zone.milkyWayVisible && lightPollution.showMilkyWay && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-purple-400 text-purple-400 bg-purple-400/10"
                          >
                            Milky Way
                          </Badge>
                        )}
                        {lightPollution.showBortle && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5"
                            style={{
                              borderColor: bortleColor,
                              color: bortleColor,
                            }}
                          >
                            {BORTLE_LABELS[zone.bortleClass]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {lightPollution.showBrightness && (
                        <div>
                          Brightness:{' '}
                          <span className="text-foreground">{zone.brightness} mag/arcsec²</span>
                        </div>
                      )}
                      {!lightPollution.showBrightness && (
                        <div>
                          Bortle:{' '}
                          <span className="text-foreground" style={{ color: bortleColor }}>
                            {zone.bortleClass}
                          </span>
                        </div>
                      )}
                      {lightPollution.showStars && (
                        <div>
                          Stars:{' '}
                          <span className="text-foreground">
                            {zone.visibleStars.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {!lightPollution.showStars && (
                        <div>
                          Limit:{' '}
                          <span className="text-foreground">Mag {zone.limitingMagnitude}</span>
                        </div>
                      )}
                      <div>
                        Source:{' '}
                        <span className="text-foreground truncate">{zone.lightSource}</span>
                      </div>
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
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  <Moon className="h-3 w-3 text-indigo-400" />
                  {selectedZone.name}
                </div>
                <Badge
                  className="text-[10px] h-5 text-white border-0"
                  style={{ backgroundColor: BORTLE_COLORS[selectedZone.bortleClass] }}
                >
                  {BORTLE_LABELS[selectedZone.bortleClass]}
                </Badge>
              </div>

              <div className="text-[10px] text-muted-foreground italic">
                {BORTLE_DESCRIPTIONS[selectedZone.bortleClass]}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center gap-1">
                  <Moon className="h-3 w-3 text-indigo-400" />
                  <span className="text-muted-foreground">Brightness:</span>
                  <span className="font-medium">{selectedZone.brightness} mag/arcsec²</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-emerald-500" />
                  <span className="text-muted-foreground">Bortle Class:</span>
                  <span className="font-medium" style={{ color: BORTLE_COLORS[selectedZone.bortleClass] }}>
                    {selectedZone.bortleClass}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Limiting Mag:</span>
                  <span className="font-medium">{selectedZone.limitingMagnitude}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Visible Stars:</span>
                  <span className="font-medium">{selectedZone.visibleStars.toLocaleString()}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-medium">
                    {selectedZone.latitude.toFixed(2)}°, {selectedZone.longitude.toFixed(2)}°
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="text-muted-foreground">Light Source:</span>
                  <span className="font-medium">{selectedZone.lightSource}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="text-muted-foreground">Milky Way:</span>
                  {selectedZone.milkyWayVisible ? (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-purple-400 text-purple-400 bg-purple-400/10">
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-red-400 text-red-400 bg-red-400/10">
                      Not Visible
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
