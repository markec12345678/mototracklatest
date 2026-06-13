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
import { useMapStore, type GeomagneticStormState, type GeomagneticStorm } from '@/lib/map-store'
import { Zap, X, Shield, Eye, Filter, MapPin } from 'lucide-react'

const SAMPLE_STORMS: GeomagneticStorm[] = [
  {
    id: 'gs1',
    name: 'Carrington Event Replay',
    latitude: 55.0,
    longitude: -10.0,
    kpIndex: 9,
    gScale: 'G5',
    powerGridImpact: 'extreme',
    auroraVisibility: 23,
    startTime: '1859-09-01T11:18:00Z',
    duration: 72,
  },
  {
    id: 'gs2',
    name: 'Halloween Storm 2003',
    latitude: 52.0,
    longitude: -5.0,
    kpIndex: 9,
    gScale: 'G5',
    powerGridImpact: 'severe',
    auroraVisibility: 30,
    startTime: '2003-10-29T06:13:00Z',
    duration: 48,
  },
  {
    id: 'gs3',
    name: "St Patrick's Day Storm",
    latitude: 48.0,
    longitude: 2.0,
    kpIndex: 8,
    gScale: 'G4',
    powerGridImpact: 'severe',
    auroraVisibility: 40,
    startTime: '2015-03-17T04:30:00Z',
    duration: 36,
  },
  {
    id: 'gs4',
    name: 'Bastille Day Event',
    latitude: 46.0,
    longitude: 10.0,
    kpIndex: 9,
    gScale: 'G5',
    powerGridImpact: 'extreme',
    auroraVisibility: 28,
    startTime: '2000-07-14T10:24:00Z',
    duration: 27,
  },
  {
    id: 'gs5',
    name: 'March 1989 Quebec Storm',
    latitude: 50.0,
    longitude: -75.0,
    kpIndex: 9,
    gScale: 'G5',
    powerGridImpact: 'extreme',
    auroraVisibility: 35,
    startTime: '1989-03-13T07:45:00Z',
    duration: 24,
  },
  {
    id: 'gs6',
    name: 'May 2024 G5 Storm',
    latitude: 40.0,
    longitude: -95.0,
    kpIndex: 9,
    gScale: 'G5',
    powerGridImpact: 'severe',
    auroraVisibility: 28,
    startTime: '2024-05-10T18:00:00Z',
    duration: 18,
  },
  {
    id: 'gs7',
    name: 'April 2023 G4 Storm',
    latitude: 55.0,
    longitude: 15.0,
    kpIndex: 7,
    gScale: 'G3',
    powerGridImpact: 'moderate',
    auroraVisibility: 50,
    startTime: '2023-04-23T14:00:00Z',
    duration: 12,
  },
]

const G_SCALE_COLORS: Record<GeomagneticStorm['gScale'], string> = {
  G1: '#22c55e',
  G2: '#eab308',
  G3: '#f97316',
  G4: '#ef4444',
  G5: '#7c2d12',
}

const G_SCALE_BG: Record<GeomagneticStorm['gScale'], string> = {
  G1: 'bg-green-500/15 text-green-700 border-green-500/40',
  G2: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/40',
  G3: 'bg-orange-500/15 text-orange-700 border-orange-500/40',
  G4: 'bg-red-500/15 text-red-700 border-red-500/40',
  G5: 'bg-purple-900/20 text-purple-900 border-purple-900/40',
}

const GRID_IMPACT_BG: Record<GeomagneticStorm['powerGridImpact'], string> = {
  none: 'bg-green-500/15 text-green-700 border-green-500/40',
  minor: 'bg-lime-500/15 text-lime-700 border-lime-500/40',
  moderate: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/40',
  severe: 'bg-red-500/15 text-red-700 border-red-500/40',
  extreme: 'bg-purple-900/20 text-purple-900 border-purple-900/40',
}

const GRID_IMPACT_LABELS: Record<GeomagneticStorm['powerGridImpact'], string> = {
  none: 'None',
  minor: 'Minor',
  moderate: 'Moderate',
  severe: 'Severe',
  extreme: 'Extreme',
}

const TOGGLE_CONFIG: { key: keyof GeomagneticStormState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'showKpIndex', label: 'Kp Index', icon: Zap },
  { key: 'showGScale', label: 'G-Scale', icon: Filter },
  { key: 'showGridImpact', label: 'Grid Impact', icon: Shield },
  { key: 'showAurora', label: 'Aurora', icon: Eye },
]

export function GeomagneticStormTracker() {
  const geomagneticStorm = useMapStore((s) => s.geomagneticStorm)
  const setGeomagneticStorm = useMapStore((s) => s.setGeomagneticStorm)

  const storms = geomagneticStorm.storms.length > 0 ? geomagneticStorm.storms : SAMPLE_STORMS

  const filteredStorms = useMemo(() => {
    return storms.filter((storm) => {
      if (geomagneticStorm.gScaleFilter !== 'all' && storm.gScale !== geomagneticStorm.gScaleFilter) {
        return false
      }
      return true
    })
  }, [storms, geomagneticStorm.gScaleFilter])

  const summary = useMemo(() => {
    const maxKp = filteredStorms.length > 0 ? Math.max(...filteredStorms.map((s) => s.kpIndex)) : 0
    const g4PlusCount = filteredStorms.filter((s) => s.gScale === 'G4' || s.gScale === 'G5').length
    const maxAuroraVisibility = filteredStorms.length > 0 ? Math.max(...filteredStorms.map((s) => s.auroraVisibility)) : 0
    return { maxKp, g4PlusCount, maxAuroraVisibility }
  }, [filteredStorms])

  const activeStorm = geomagneticStorm.activeStormId
    ? storms.find((s) => s.id === geomagneticStorm.activeStormId) ?? null
    : null

  if (typeof window === 'undefined') return null
  if (!geomagneticStorm.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Geomagnetic Storm Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setGeomagneticStorm({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]" style={{ scrollbarWidth: 'thin' }}>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-bold text-orange-500">{summary.maxKp}</div>
              <div className="text-[10px] text-muted-foreground">Max Kp</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-bold text-red-500">{summary.g4PlusCount}</div>
              <div className="text-[10px] text-muted-foreground">G4+ Count</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-lg font-bold text-purple-500">{summary.maxAuroraVisibility}°</div>
              <div className="text-[10px] text-muted-foreground">Max Aurora</div>
            </div>
          </div>

          {/* G-Scale Filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">G-Scale Filter</span>
            </div>
            <Select
              value={geomagneticStorm.gScaleFilter}
              onValueChange={(v) =>
                setGeomagneticStorm({
                  gScaleFilter: v as GeomagneticStormState['gScaleFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All G-Scales</SelectItem>
                <SelectItem value="G1">G1 - Minor</SelectItem>
                <SelectItem value="G2">G2 - Moderate</SelectItem>
                <SelectItem value="G3">G3 - Strong</SelectItem>
                <SelectItem value="G4">G4 - Severe</SelectItem>
                <SelectItem value="G5">G5 - Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle switches */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Display Options</div>
            {TOGGLE_CONFIG.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-orange-500" />
                  <span>{label}</span>
                </div>
                <Button
                  variant={geomagneticStorm[key] ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() =>
                    setGeomagneticStorm({
                      [key]: !geomagneticStorm[key],
                    })
                  }
                >
                  {geomagneticStorm[key] ? 'On' : 'Off'}
                </Button>
              </div>
            ))}
          </div>

          {/* G-Scale Color Legend */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['G1', 'G2', 'G3', 'G4', 'G5'] as const).map((g) => (
              <div
                key={g}
                className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
                style={{
                  borderColor: G_SCALE_COLORS[g],
                  color: G_SCALE_COLORS[g],
                }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: G_SCALE_COLORS[g] }}
                />
                {g}
              </div>
            ))}
          </div>

          {/* Storm List */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">
              Tracked Storms ({filteredStorms.length})
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {filteredStorms.map((storm) => {
                const isActive = geomagneticStorm.activeStormId === storm.id
                return (
                  <div
                    key={storm.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-orange-500/50 bg-orange-500/5'
                        : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
                    }`}
                    onClick={() =>
                      setGeomagneticStorm({
                        activeStormId: isActive ? null : storm.id,
                      })
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: G_SCALE_COLORS[storm.gScale] }}
                        />
                        <span className="text-xs font-medium">{storm.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${G_SCALE_BG[storm.gScale]}`}
                      >
                        {storm.gScale}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground mb-1">
                      {geomagneticStorm.showKpIndex && (
                        <div>
                          Kp:{' '}
                          <span
                            className="text-foreground font-medium"
                            style={{
                              color: storm.kpIndex >= 7 ? G_SCALE_COLORS[storm.gScale] : undefined,
                            }}
                          >
                            {storm.kpIndex}
                          </span>
                        </div>
                      )}
                      {geomagneticStorm.showGridImpact && (
                        <div>
                          Grid:{' '}
                          <Badge
                            variant="outline"
                            className={`text-[9px] h-4 px-1 ${GRID_IMPACT_BG[storm.powerGridImpact]}`}
                          >
                            {GRID_IMPACT_LABELS[storm.powerGridImpact]}
                          </Badge>
                        </div>
                      )}
                      {geomagneticStorm.showAurora && (
                        <div>
                          Aurora:{' '}
                          <span className="text-foreground font-medium">
                            {storm.auroraVisibility}° lat
                          </span>
                        </div>
                      )}
                      <div>
                        Start:{' '}
                        <span className="text-foreground">
                          {new Date(storm.startTime).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        Duration:{' '}
                        <span className="text-foreground">{storm.duration}h</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isActive && (
                      <div className="mt-2 pt-2 border-t border-border/30 space-y-2">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Full Kp Index:</span>{' '}
                            <span className="font-medium">{storm.kpIndex}/9</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">G-Scale:</span>{' '}
                            <span
                              className="font-medium"
                              style={{ color: G_SCALE_COLORS[storm.gScale] }}
                            >
                              {storm.gScale}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Grid Impact:</span>{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${GRID_IMPACT_BG[storm.powerGridImpact]}`}
                            >
                              {GRID_IMPACT_LABELS[storm.powerGridImpact]}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Aurora Reach:</span>{' '}
                            <span className="font-medium">{storm.auroraVisibility}° latitude</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Start Time:</span>{' '}
                            <span className="font-medium">
                              {new Date(storm.startTime).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>{' '}
                            <span className="font-medium">{storm.duration} hours</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {storm.latitude.toFixed(1)}°, {storm.longitude.toFixed(1)}°
                            </span>
                          </div>
                        </div>

                        {/* Impact bar */}
                        <div className="space-y-1">
                          <div className="text-[10px] text-muted-foreground">Storm Intensity</div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(storm.kpIndex / 9) * 100}%`,
                                backgroundColor: G_SCALE_COLORS[storm.gScale],
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Kp 0</span>
                            <span>Kp 9</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
