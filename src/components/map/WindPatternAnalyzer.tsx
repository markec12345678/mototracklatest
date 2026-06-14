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
import { useMapStore, type WindPatternState, type WindPattern } from '@/lib/map-store'
import { Wind as WindIcon5, X, Gauge, Zap, BarChart3, BatteryCharging, MapPin, Filter } from 'lucide-react'

const DEMO_PATTERNS: WindPattern[] = [
  {
    id: 'wp-northeasttrade',
    name: 'NE Trade Winds Station',
    latitude: 15.00,
    longitude: -45.00,
    patternType: 'trade_winds',
    avgSpeed: 22,
    maxGust: 45,
    prevailingDirection: 'NE',
    consistency: 92,
    seasonVariation: 'low',
    energyPotential: 'excellent',
  },
  {
    id: 'wp-northatlantic',
    name: 'North Atlantic Westerlies',
    latitude: 52.00,
    longitude: -25.00,
    patternType: 'westerlies',
    avgSpeed: 28,
    maxGust: 65,
    prevailingDirection: 'W',
    consistency: 78,
    seasonVariation: 'moderate',
    energyPotential: 'good',
  },
  {
    id: 'wp-antarctic',
    name: 'Antarctic Easterlies Hub',
    latitude: -65.00,
    longitude: 0.00,
    patternType: 'polar_easterlies',
    avgSpeed: 35,
    maxGust: 80,
    prevailingDirection: 'SE',
    consistency: 88,
    seasonVariation: 'low',
    energyPotential: 'excellent',
  },
  {
    id: 'wp-indianmonsoon',
    name: 'Indian Monsoon Monitor',
    latitude: 18.00,
    longitude: 75.00,
    patternType: 'monsoon',
    avgSpeed: 18,
    maxGust: 55,
    prevailingDirection: 'SW',
    consistency: 45,
    seasonVariation: 'extreme',
    energyPotential: 'fair',
  },
  {
    id: 'wp-jetstream',
    name: 'Polar Jet Stream Track',
    latitude: 55.00,
    longitude: -120.00,
    patternType: 'jet_stream',
    avgSpeed: 120,
    maxGust: 180,
    prevailingDirection: 'W',
    consistency: 82,
    seasonVariation: 'high',
    energyPotential: 'poor',
  },
  {
    id: 'wp-chinook',
    name: 'Chinook Wind Station',
    latitude: 51.05,
    longitude: -114.07,
    patternType: 'local',
    avgSpeed: 40,
    maxGust: 95,
    prevailingDirection: 'W',
    consistency: 55,
    seasonVariation: 'high',
    energyPotential: 'good',
  },
]

const ENERGY_POTENTIAL_CONFIG: Record<
  WindPattern['energyPotential'],
  { label: string; color: string; bgClass: string }
> = {
  poor: { label: 'Poor', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  fair: { label: 'Fair', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const PATTERN_TYPE_LABELS: Record<WindPattern['patternType'], string> = {
  trade_winds: 'Trade Winds',
  westerlies: 'Westerlies',
  polar_easterlies: 'Polar Easterlies',
  monsoon: 'Monsoon',
  jet_stream: 'Jet Stream',
  local: 'Local',
}

export function WindPatternAnalyzer() {
  const windPattern = useMapStore((s) => s.windPattern)
  const setWindPattern = useMapStore((s) => s.setWindPattern)

  const patterns = useMemo(
    () => (windPattern.patterns.length > 0 ? windPattern.patterns : DEMO_PATTERNS),
    [windPattern.patterns]
  )

  const filteredPatterns = useMemo(() => {
    return patterns.filter((p) => {
      if (windPattern.patternFilter !== 'all' && p.patternType !== windPattern.patternFilter) return false
      return true
    })
  }, [patterns, windPattern.patternFilter])

  const summary = useMemo(() => {
    if (filteredPatterns.length === 0) {
      return { maxAvgSpeed: 0, excellentCount: 0, avgConsistency: 0 }
    }
    const maxAvgSpeed = Math.max(...filteredPatterns.map((p) => p.avgSpeed))
    const excellentCount = filteredPatterns.filter((p) => p.energyPotential === 'excellent').length
    const avgConsistency = filteredPatterns.reduce((sum, p) => sum + p.consistency, 0) / filteredPatterns.length
    return {
      maxAvgSpeed,
      excellentCount,
      avgConsistency: Math.round(avgConsistency * 10) / 10,
    }
  }, [filteredPatterns])

  const activePattern = useMemo(
    () => patterns.find((p) => p.id === windPattern.activePatternId) ?? null,
    [patterns, windPattern.activePatternId]
  )

  if (typeof window === 'undefined') return null
  if (!windPattern.open) return null

  const overlayToggles: { key: keyof WindPatternState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAvgSpeed', label: 'Avg Speed', icon: Gauge },
    { key: 'showMaxGust', label: 'Max Gust', icon: Zap },
    { key: 'showConsistency', label: 'Consistency', icon: BarChart3 },
    { key: 'showEnergyPotential', label: 'Energy Potential', icon: BatteryCharging },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon5 className="h-4 w-4 text-sky-500" />
              Wind Pattern Analyzer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWindPattern({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Pattern Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Pattern Type
            </Label>
            <Select
              value={windPattern.patternFilter}
              onValueChange={(v) =>
                setWindPattern({
                  patternFilter: v as WindPatternState['patternFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="trade_winds">Trade Winds</SelectItem>
                <SelectItem value="westerlies">Westerlies</SelectItem>
                <SelectItem value="polar_easterlies">Polar Easterlies</SelectItem>
                <SelectItem value="monsoon">Monsoon</SelectItem>
                <SelectItem value="jet_stream">Jet Stream</SelectItem>
                <SelectItem value="local">Local</SelectItem>
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
                  checked={windPattern[key] as boolean}
                  onCheckedChange={(checked) => setWindPattern({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Avg Speed</div>
              <div className="text-sm font-semibold text-sky-500">{summary.maxAvgSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/h</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Excellent Energy</div>
              <div className="text-sm font-semibold text-green-500">{summary.excellentCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Consistency</div>
              <div className="text-sm font-semibold">{summary.avgConsistency}%</div>
              <div className="text-[9px] text-muted-foreground">reliability</div>
            </div>
          </div>

          <Separator />

          {/* Pattern List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Wind Patterns ({filteredPatterns.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredPatterns.map((pattern) => {
                  const isActive = windPattern.activePatternId === pattern.id
                  const energyCfg = ENERGY_POTENTIAL_CONFIG[pattern.energyPotential]
                  return (
                    <div
                      key={pattern.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setWindPattern({
                          activePatternId: isActive ? null : pattern.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: energyCfg.color }}
                          />
                          <span className="text-xs font-medium">{pattern.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${energyCfg.bgClass}`}
                        >
                          {energyCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {windPattern.showAvgSpeed && (
                          <div>
                            Avg Speed:{' '}
                            <span className="text-foreground font-medium">
                              {pattern.avgSpeed} km/h
                            </span>
                          </div>
                        )}
                        {windPattern.showMaxGust && (
                          <div>
                            Max Gust:{' '}
                            <span className="text-foreground font-medium">
                              {pattern.maxGust} km/h
                            </span>
                          </div>
                        )}
                        {windPattern.showConsistency && (
                          <div>
                            Consistency:{' '}
                            <span className="text-foreground font-medium">
                              {pattern.consistency}%
                            </span>
                          </div>
                        )}
                        {windPattern.showEnergyPotential && (
                          <div>
                            Energy:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${energyCfg.bgClass}`}
                            >
                              {energyCfg.label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPatterns.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No patterns match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Pattern Details */}
          {activePattern && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-xs font-semibold">{activePattern.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ENERGY_POTENTIAL_CONFIG[activePattern.energyPotential].bgClass}`}
                  >
                    {ENERGY_POTENTIAL_CONFIG[activePattern.energyPotential].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activePattern.latitude.toFixed(2)}, {activePattern.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Speed: </span>
                    <span className="font-medium">{activePattern.avgSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Gust: </span>
                    <span className="font-medium">{activePattern.maxGust} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prevailing Dir: </span>
                    <span className="font-medium">{activePattern.prevailingDirection}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Consistency: </span>
                    <span className="font-medium">{activePattern.consistency}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season Variation: </span>
                    <span className="font-medium capitalize">{activePattern.seasonVariation.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pattern Type: </span>
                    <span className="font-medium">{PATTERN_TYPE_LABELS[activePattern.patternType]}</span>
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
